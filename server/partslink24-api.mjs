import http from "node:http";
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const routesPath = join(repoRoot, "tools/partslink24/brand-routes.json");
const envLoadWarnings = [];
loadLocalEnv(join(homedir(), "Library/Application Support/AUTOGOOD/partslink24.env"));
if (!hasPartslinkCredentials()) loadLocalEnv(join(repoRoot, "server/.env"));
if (!hasPartslinkCredentials()) loadLocalEnv(join(repoRoot, "tools/partslink24/.env"));
const routes = JSON.parse(readTextFile(routesPath));
const outputDir = resolve(process.env.PARTSLINK24_OUTPUT_DIR || join(homedir(), "Library/Application Support/AUTOGOOD/partslink24-output"));
const configuredProfileDir = process.env.PARTSLINK24_PROFILE_DIR
  ? resolve(process.env.PARTSLINK24_PROFILE_DIR)
  : "";
const transientProfileRoot = configuredProfileDir
  ? join(configuredProfileDir, "run-profiles")
  : join(homedir(), "Library/Application Support/AUTOGOOD/partslink24-run-profiles");
const port = Number(process.env.PORT || 4174);
const minRunGapMs = Number(process.env.PARTSLINK24_MIN_RUN_GAP_MS || 7000);
const maxQueueSize = Number(process.env.PARTSLINK24_MAX_QUEUE_SIZE || 4);
const runTimeoutMs = Number(process.env.PARTSLINK24_RUN_TIMEOUT_MS || 240000);
const partslinkQueue = createPartslinkQueue({ minRunGapMs, maxQueueSize });

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
    if (request.method === "OPTIONS") return sendNoContent(request, response);
    if (request.method === "POST" && request.url === "/api/partslink24/check-vin") {
      return handleVinCheck(request, response);
    }
    if (request.method === "POST" && request.url === "/api/partslink24/production-date") {
      return handleProductionDateCheck(request, response);
    }
    if (request.method === "GET" && request.url?.startsWith("/api/partslink24/pdf/")) {
      return sendPdf(request, response);
    }
    if (request.method === "GET" || request.method === "HEAD") {
      return sendStatic(request, response);
    }
    return sendJson(request, response, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return sendJson(request, response, 500, { ok: false, error: errorMessage(error) });
  }
}

if (isDirectRun()) {
  const server = http.createServer(handlePartslink24Request);
  server.listen(port, () => {
    process.stdout.write(`PartsLink24 VIN server: http://127.0.0.1:${port}/partslink24.html\n`);
  });
}

async function handleVinCheck(request, response) {
  const payload = await readPartslinkPayload(request, response);
  if (!payload) return;
  const { brand, language, vin } = payload;

  const result = await enqueuePartslinkRun(() => runPartslinkScript({ brand, language, vin, mode: "full" }));
  if (!result.ok) return sendJson(request, response, result.statusCode || 500, result);

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
  return sendJson(request, response, 200, {
    ok: true,
    brand,
    language,
    vin,
    vehicleDescription: result.vehicleDescription || "",
    productionDate: result.productionDate || "",
    engineType: result.engineType || "",
    engineVolume: result.engineVolume || "",
    fileName: firstFile.fileName,
    downloadUrl: firstFile.downloadUrl,
    files
  });
}

async function handleProductionDateCheck(request, response) {
  const payload = await readPartslinkPayload(request, response);
  if (!payload) return;
  const { brand, language, vin } = payload;

  const result = await enqueuePartslinkRun(() => runPartslinkScript({ brand, language, vin, mode: "production-date" }));
  if (!result.ok) return sendJson(request, response, result.statusCode || 500, result);
  if (!result.productionDate) {
    return sendJson(request, response, 500, {
      ok: false,
      error: "PartsLink24 не вернул дату производства для этого VIN."
    });
  }

  return sendJson(request, response, 200, {
    ok: true,
    brand,
    language,
    vin,
    vehicleDescription: result.vehicleDescription || "",
    productionDate: result.productionDate,
    productionDateLabel: result.productionDateLabel || "",
    engineType: result.engineType || "",
    engineVolume: result.engineVolume || ""
  });
}

async function readPartslinkPayload(request, response) {
  const payload = await readJsonBody(request);
  const brand = String(payload.brand || "").trim();
  const language = String(payload.language || "").trim().toUpperCase();
  const vin = String(payload.vin || "").trim().toUpperCase();

  if (!routes.brands[brand]) {
    sendJson(request, response, 400, { ok: false, error: "Выберите поддерживаемую марку." });
    return null;
  }
  if (!routes.languages.includes(language)) {
    sendJson(request, response, 400, { ok: false, error: "Выберите поддерживаемый язык." });
    return null;
  }
  if (!/^[A-Z0-9]{17}$/.test(vin)) {
    sendJson(request, response, 400, { ok: false, error: "VIN должен содержать 17 символов." });
    return null;
  }
  if (!process.env.PARTSLINK24_COMPANY_ID || !process.env.PARTSLINK24_USERNAME || !process.env.PARTSLINK24_PASSWORD) {
    sendJson(request, response, 500, {
      ok: false,
      error: envLoadWarnings.length
        ? "Сервер не смог прочитать локальный файл с данными входа PartsLink24."
        : "На сервере не настроены данные входа PartsLink24."
    });
    return null;
  }

  return { brand, language, vin };
}

function enqueuePartslinkRun(run) {
  return partslinkQueue.enqueue(run);
}

export function createPartslinkQueue({ minRunGapMs = 0, maxQueueSize = 1, now = Date.now, sleep = delay } = {}) {
  let queue = Promise.resolve();
  let lastRunFinishedAt = null;
  let queuedRuns = 0;

  return { enqueue };

  function enqueue(run) {
  if (!Number.isFinite(maxQueueSize) || maxQueueSize < 1) {
    return Promise.resolve({ ok: false, statusCode: 500, error: "PARTSLINK24_MAX_QUEUE_SIZE должен быть не меньше 1." });
  }
  if (queuedRuns >= maxQueueSize) {
    return Promise.resolve({
      ok: false,
      statusCode: 429,
      error: "Сервис VIN занят. Подождите завершения текущих проверок и повторите запрос."
    });
  }

  queuedRuns += 1;
  const queued = queue.then(async () => {
    const elapsed = now() - lastRunFinishedAt;
    if (lastRunFinishedAt !== null && elapsed < minRunGapMs) {
      await sleep(minRunGapMs - elapsed);
    }
    try {
      return await run();
    } finally {
      lastRunFinishedAt = now();
    }
  });
  const tracked = queued.finally(() => { queuedRuns -= 1; });
  queue = tracked.catch(() => {});
  return tracked;
  }
}

async function runPartslinkScript({ brand, language, vin, mode }) {
  const firstResult = await runPartslinkScriptAttempt({ brand, language, vin, mode });
  if (firstResult.ok || !shouldRetryPartslinkRun(firstResult)) return firstResult;

  const profileDir = makeTransientProfileDir();
  const retryResult = await runPartslinkScriptAttempt({
    brand,
    language,
    vin,
    mode,
    env: {
      PARTSLINK24_DEBUG_ERRORS: "1",
      PARTSLINK24_PROFILE_DIR: profileDir
    },
    cleanupDir: profileDir
  });

  if (!retryResult.ok) {
    retryResult.details = {
      ...(retryResult.details || {}),
      retriedWithFreshProfile: true,
      firstAttempt: firstResult.details || { error: firstResult.error }
    };
  }
  return retryResult;
}

function runPartslinkScriptAttempt({ brand, language, vin, mode, env = {}, cleanupDir = "" }) {
  const scriptPath = join(repoRoot, "tools/partslink24/download-vin-pdf.mjs");
  const args = [
    scriptPath,
    "--brand", brand,
    "--vin", vin,
    "--language", language,
    "--mode", mode,
    "--out-dir", outputDir
  ];

  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, args, {
      cwd: repoRoot,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timeout;
    let timedOut = false;

    const finish = (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (cleanupDir) cleanupTransientProfileDir(cleanupDir);
      const parsed = parseLastJson(stdout) || parseLastJson(stderr);
      if (code === 0 && parsed?.ok) return resolveRun(parsed);
      return resolveRun({
        ok: false,
        error: parsed?.error || (timedOut ? "Истекло время ожидания ответа PartsLink24." : mode === "production-date" ? "PartsLink24 не вернул дату производства." : mode === "full" ? "PartsLink24 не вернул результаты проверки." : "PartsLink24 не вернул PDF."),
        details: parsed || {
          code,
          stderr: tailText(stderr),
          stdout: tailText(stdout)
        }
      });
    };

    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    timeout = setTimeout(() => {
      if (settled) return;
      timedOut = true;
      stderr += `\nPartsLink24 run timed out after ${runTimeoutMs}ms.`;
      child.kill("SIGTERM");
      finish(null);
    }, runTimeoutMs);
    child.on("close", finish);
    child.on("exit", (code) => setTimeout(() => finish(code), 100));
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      if (cleanupDir) cleanupTransientProfileDir(cleanupDir);
      resolveRun({ ok: false, error: errorMessage(error) });
    });
  });
}

function shouldRetryPartslinkRun(result) {
  if (result.ok) return false;
  const text = `${result.error || ""}\n${JSON.stringify(result.details || {})}`;
  return /PartsLink24 не вернул PDF|PartsLink24 не вернул результаты проверки|Unknown system error -11|ProcessSingleton|profile|lock|browser/i.test(text);
}

function makeTransientProfileDir() {
  mkdirSync(transientProfileRoot, { recursive: true });
  return mkdtempSync(join(transientProfileRoot, "run-"));
}

function cleanupTransientProfileDir(path) {
  const resolvedPath = resolve(path || "");
  if (!resolvedPath.startsWith(`${transientProfileRoot}/`)) return;
  rmSync(resolvedPath, { recursive: true, force: true });
}

function tailText(value, maxLength = 2000) {
  const text = String(value || "").trim();
  return text.length > maxLength ? text.slice(-maxLength) : text;
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function sendPdf(request, response) {
  const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
  const encodedName = requestUrl.pathname.replace("/api/partslink24/pdf/", "");
  const fileName = basename(decodeURIComponent(encodedName));
  const filePath = resolve(outputDir, fileName);
  const requestedDownloadName = normalizeDownloadFileName(requestUrl.searchParams.get("downloadName"));

  if (!filePath.startsWith(`${outputDir}/`) || extname(filePath).toLowerCase() !== ".pdf" || !existsSync(filePath)) {
    return sendJson(request, response, 404, { ok: false, error: "PDF не найден." });
  }

  response.writeHead(200, {
    "content-type": "application/pdf",
    "content-disposition": `attachment; filename="${requestedDownloadName || fileName}"`,
    "content-length": statSync(filePath).size,
    ...corsHeaders(request)
  });
  return createReadStream(filePath).pipe(response);
}

function normalizeDownloadFileName(value) {
  const fileName = basename(String(value || ""))
    .replace(/[^A-Za-z0-9_.-]/g, "_");
  return fileName.toLowerCase().endsWith(".pdf") ? fileName : "";
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

  let lines;
  try {
    lines = readTextFile(path).split(/\r?\n/);
  } catch (error) {
    const message = `Cannot read ${path}: ${errorMessage(error)}`;
    envLoadWarnings.push(message);
    process.stderr.write(`[partslink24-api] ${message}\n`);
    return;
  }

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

function hasPartslinkCredentials() {
  return Boolean(process.env.PARTSLINK24_COMPANY_ID && process.env.PARTSLINK24_USERNAME && process.env.PARTSLINK24_PASSWORD);
}

function readTextFile(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    const fallback = spawnSync("/bin/cat", [path], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024
    });
    if (fallback.status === 0) return fallback.stdout;
    throw error;
  }
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

function errorMessage(error) {
  return error instanceof Error ? error.message : "Unknown error.";
}

function isDirectRun() {
  return import.meta.url === pathToFileURL(process.argv[1] || "").href;
}
