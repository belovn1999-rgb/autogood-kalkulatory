import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { handleMobiledeImport } from "./mobilede-import.mjs";
import { handlePartslink24Request, hasPartslinkCredentials } from "./partslink24-api.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 8790);
const host = process.env.HOST || "127.0.0.1";
const buildRevision = process.env.GIT_SHA || process.env.RENDER_GIT_COMMIT || "local";

// A VIN check needs a browser. Playwright ships its own, but a server may point
// at a system Chrome instead, so accept either.
function hasBrowser() {
  const configured = process.env.PARTSLINK24_CHROME_PATH;
  if (configured && existsSync(configured)) return true;
  const systemPaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium"
  ];
  if (systemPaths.some((path) => existsSync(path))) return true;
  return existsSync(resolve(repoRoot, "node_modules/playwright"));
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  // Declaration templates in assets/ are fetched by no-plates-declaration.js.
  ".pdf": "application/pdf",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

// The static handler used to serve anything inside the repo root, which meant a
// plain GET could read tools/partslink24/.env — the live PartsLink24 password.
// It never leaked in the current setup only because the credentials happen to
// live outside the served directory; the deployment guide's "upload the full
// repo, create server/.env" layout would have published them on day one.
// Two gates now: the extension must be one we intend to serve, and no path
// segment may start with a dot (.env, .git, .gitignore).
function isServablePath(filePath, repoRoot) {
  if (!filePath.startsWith(`${repoRoot}/`)) return false;
  const relative = filePath.slice(repoRoot.length + 1);
  if (relative.split("/").some((segment) => segment.startsWith("."))) return false;
  return Object.hasOwn(mimeTypes, extname(filePath).toLowerCase());
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);

    if (request.method === "OPTIONS") return sendNoContent(response);
    if (request.method === "GET" && requestUrl.pathname === "/health") {
      const partslink24 = hasPartslinkCredentials() && hasBrowser();
      return sendJson(response, 200, {
        ok: true,
        service: "autogood-api",
        revision: buildRevision,
        mobilede: true,
        partslink24,
        // Spelled out so a failing deploy says which half is missing.
        partslink24Detail: {
          credentials: hasPartslinkCredentials(),
          browser: hasBrowser()
        }
      });
    }
    if (request.method === "GET" && requestUrl.pathname === "/version") {
      return sendJson(response, 200, { ok: true, service: "autogood-api", revision: buildRevision });
    }
    if (requestUrl.pathname === "/mobilede/import") {
      return handleMobiledeImport(request, response);
    }
    if (requestUrl.pathname === "/api/partslink24/check-vin" || requestUrl.pathname.startsWith("/api/partslink24/pdf/")) {
      return handlePartslink24Request(request, response);
    }
    if (request.method === "GET" || request.method === "HEAD") {
      return sendStatic(request, response);
    }

    return sendJson(response, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error."
    });
  }
});

server.listen(port, host, () => {
  process.stdout.write(`AUTOGOOD API: http://${host}:${port}\n`);
});

function sendStatic(request, response) {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  const rawPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = resolve(repoRoot, `.${normalize(rawPath)}`);

  if (!isServablePath(filePath, repoRoot) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    return sendJson(response, 404, { ok: false, error: "Not found." });
  }

  const type = mimeTypes[extname(filePath).toLowerCase()];
  response.writeHead(200, {
    "content-type": type,
    "content-length": statSync(filePath).size,
    ...corsHeaders()
  });
  if (request.method === "HEAD") return response.end();
  return createReadStream(filePath).pipe(response);
}

function sendNoContent(response) {
  response.writeHead(204, corsHeaders());
  response.end();
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    ...corsHeaders()
  });
  response.end(JSON.stringify(payload, null, 2));
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-allow-private-network": "true"
  };
}
