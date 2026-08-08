import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { handleMobiledeImport } from "./mobilede-import.mjs";
import { handlePartslink24Request } from "./partslink24-api.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 8790);
const host = process.env.HOST || "127.0.0.1";
const release = process.env.AUTOGOOD_RELEASE || "dev";
const buildTime = process.env.AUTOGOOD_BUILD_TIME || "";

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
  ".ttf": "font/ttf"
};

export function createAutogoodServer() {
  return http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);

    if (request.method === "OPTIONS") return sendNoContent(request, response);
    if (request.method === "GET" && requestUrl.pathname === "/health") {
      return sendJson(request, response, 200, {
        ok: true,
        service: "autogood-api",
        release,
        mobilede: true,
        partslink24: true
      });
    }
    if (request.method === "GET" && requestUrl.pathname === "/version") {
      return sendJson(request, response, 200, {
        service: "autogood-api",
        release,
        buildTime
      });
    }
    if (requestUrl.pathname === "/mobilede/import") {
      return handleMobiledeImport(request, response);
    }
    if (
      requestUrl.pathname === "/api/partslink24/check-vin" ||
      requestUrl.pathname === "/api/partslink24/production-date" ||
      requestUrl.pathname.startsWith("/api/partslink24/pdf/")
    ) {
      return handlePartslink24Request(request, response);
    }
    if (request.method === "GET" || request.method === "HEAD") {
      return sendStatic(request, response);
    }

    return sendJson(request, response, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return sendJson(request, response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error."
    });
  }
  });
}

if (isDirectRun()) {
  const server = createAutogoodServer();
  server.listen(port, host, () => {
    process.stdout.write(`AUTOGOOD API: http://${host}:${port}\n`);
  });
}

function sendStatic(request, response) {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  const rawPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = resolve(repoRoot, `.${normalize(rawPath)}`);

  if (!filePath.startsWith(`${repoRoot}/`) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    return sendJson(request, response, 404, { ok: false, error: "Not found." });
  }

  const type = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, {
    "content-type": type,
    "content-length": statSync(filePath).size,
    ...corsHeaders(request)
  });
  if (request.method === "HEAD") return response.end();
  return createReadStream(filePath).pipe(response);
}

function sendNoContent(request, response) {
  response.writeHead(204, corsHeaders(request));
  response.end();
}

function sendJson(request, response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    ...corsHeaders(request)
  });
  response.end(JSON.stringify(payload, null, 2));
}

function corsHeaders(request) {
  const configuredOrigins = String(process.env.AUTOGOOD_ALLOWED_ORIGINS || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origin = String(request.headers.origin || "");
  const allowAnyOrigin = configuredOrigins.includes("*");
  const allowedOrigin = allowAnyOrigin ? "*" : configuredOrigins.includes(origin) ? origin : "";

  return {
    ...(allowedOrigin ? { "access-control-allow-origin": allowedOrigin, vary: "Origin" } : {}),
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-allow-private-network": "true"
  };
}

function isDirectRun() {
  return import.meta.url === pathToFileURL(process.argv[1] || "").href;
}
