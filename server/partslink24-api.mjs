import http from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const routesPath = join(repoRoot, "tools/partslink24/brand-routes.json");
loadLocalEnv(join(repoRoot, "server/.env"));
loadLocalEnv(join(repoRoot, "tools/partslink24/.env"));
const routes = JSON.parse(readFileSync(routesPath, "utf8"));
const outputDir = resolve(repoRoot, "output/partslink24");
const port = Number(process.env.PORT || 4174);
const minRunGapMs = Number(process.env.PARTSLINK24_MIN_RUN_GAP_MS || 7000);
let partslinkQueue = Promise.resolve();
let lastRunFinishedAt = 0;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

export async function handlePartslink24Request(request, response) {
  try {
    if (request.method === "OPTIONS") return sendNoContent(response);
    if (request.method === "POST" && request.url === "/api/partslink24/check-vin") {
      return handleVinCheck(request, response);
    }
    if (request.method === "GET" && request.url?.startsWith("/api/partslink24/pdf/")) {
      return sendPdf(request, response);
    }
    if (request.method === "GET" || request.method === "HEAD") {
      return sendStatic(request, response);
    }
    return sendJson(response, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return sendJson(response, 500, { ok: false, error: errorMessage(error) });
  }
}

if (isDirectRun()) {
  const server = http.createServer(handlePartslink24Request);
  server.listen(port, () => {
    process.stdout.write(`PartsLink24 VIN server: http://127.0.0.1:${port}/partslink24.html\n`);
  });
}

async function handleVinCheck(request, response) {
  const payload = await readJsonBody(request);
  const brand = String(payload.brand || "").trim();
  const language = String(payload.language || "").trim().toUpperCase();
  const vin = String(payload.vin || "").trim().toUpperCase();

  if (!routes.brands[brand]) return sendJson(response, 400, { ok: false, error: "Выберите поддерживаемую марку." });
  if (!routes.languages.includes(language)) return sendJson(response, 400, { ok: false, error: "Выберите поддерживаемый язык." });
  if (!/^[A-Z0-9]{17}$/.test(vin)) return sendJson(response, 400, { ok: false, error: "VIN должен содержать 17 символов." });
  if (!process.env.PARTSLINK24_COMPANY_ID || !process.env.PARTSLINK24_USERNAME || !process.env.PARTSLINK24_PASSWORD) {
    return sendJson(response, 500, {
      ok: false,
      error: "На сервере не настроены данные входа PartsLink24."
    });
  }

  const result = await enqueuePartslinkRun(() => runPartslinkScript({ brand, language, vin }));
  if (!result.ok) return sendJson(response, 500, result);

  const pdfPaths = Array.isArray(result.pdfPaths) && result.pdfPaths.length
    ? result.pdfPaths
    : [result.pdfPath].filter(Boolean);
  const files = pdfPaths.map((pdfPath) => {
    const fileName = basename(pdfPath || "");
    return {
      fileName,
      downloadUrl: `/api/partslink24/pdf/${encodeURIComponent(fileName)}`
    };
  });
  const firstFile = files[0] || {};
  return sendJson(response, 200, {
    ok: true,
    brand,
    language,
    vin,
    fileName: firstFile.fileName,
    downloadUrl: firstFile.downloadUrl,
    files
  });
}

function enqueuePartslinkRun(run) {
  const queued = partslinkQueue.then(async () => {
    const elapsed = Date.now() - lastRunFinishedAt;
    if (lastRunFinishedAt && elapsed < minRunGapMs) {
      await delay(minRunGapMs - elapsed);
    }
    try {
      return await run();
    } finally {
      lastRunFinishedAt = Date.now();
    }
  });
  partslinkQueue = queued.catch(() => {});
  return queued;
}

function runPartslinkScript({ brand, language, vin }) {
  const scriptPath = join(repoRoot, "tools/partslink24/download-vin-pdf.mjs");
  const args = [
    scriptPath,
    "--brand", brand,
    "--vin", vin,
    "--language", language,
    "--out-dir", outputDir
  ];

  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, args, {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => {
      const parsed = parseLastJson(stdout) || parseLastJson(stderr);
      if (code === 0 && parsed?.ok) return resolveRun(parsed);
      return resolveRun({
        ok: false,
        error: parsed?.error || "PartsLink24 не вернул PDF.",
        details: parsed || undefined
      });
    });
    child.on("error", (error) => {
      resolveRun({ ok: false, error: errorMessage(error) });
    });
  });
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function sendPdf(request, response) {
  const encodedName = request.url?.replace("/api/partslink24/pdf/", "") || "";
  const fileName = basename(decodeURIComponent(encodedName));
  const filePath = resolve(outputDir, fileName);

  if (!filePath.startsWith(`${outputDir}/`) || extname(filePath).toLowerCase() !== ".pdf" || !existsSync(filePath)) {
    return sendJson(response, 404, { ok: false, error: "PDF не найден." });
  }

  response.writeHead(200, {
    "content-type": "application/pdf",
    "content-disposition": `attachment; filename="${fileName}"`,
    "content-length": statSync(filePath).size,
    ...corsHeaders()
  });
  return createReadStream(filePath).pipe(response);
}

function sendStatic(request, response) {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  const rawPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = resolve(repoRoot, `.${normalize(rawPath)}`);

  if (!filePath.startsWith(`${repoRoot}/`) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    return sendJson(response, 404, { ok: false, error: "Not found." });
  }

  const type = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, {
    "content-type": type,
    "content-length": statSync(filePath).size,
    ...corsHeaders()
  });
  if (request.method === "HEAD") return response.end();
  return createReadStream(filePath).pipe(response);
}

function readJsonBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 32_768) request.destroy();
    });
    request.on("end", () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch (error) {
        rejectBody(error);
      }
    });
    request.on("error", rejectBody);
  });
}

function parseLastJson(value) {
  const text = String(value || "").trim();
  if (!text) return null;

  for (const candidate of text.match(/\{[\s\S]*\}/g)?.reverse() || []) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Keep looking; Playwright can print non-JSON warnings around the payload.
    }
  }
  return null;
}

function loadLocalEnv(path) {
  if (!existsSync(path)) return;

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
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

function errorMessage(error) {
  return error instanceof Error ? error.message : "Unknown error.";
}

function isDirectRun() {
  return import.meta.url === pathToFileURL(process.argv[1] || "").href;
}
