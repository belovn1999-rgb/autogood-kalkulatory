import http from "node:http";
import { existsSync } from "node:fs";

const PORT = Number(process.env.PORT || 8788);
const SYSTEM_CHROME_PATHS = [
  process.env.MOBILEDE_CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
].filter(Boolean);

const MOBILEDE_CANONICAL_ORIGIN = "https://suchen.mobile.de";

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value) {
  let text = String(value ?? "")
    .replace(/\\u00a0/g, " ")
    .replace(/[^\d., -]/g, "")
    .replace(/\s+/g, "")
    .trim();

  if (!text) return 0;

  const hasComma = text.includes(",");
  const hasDot = text.includes(".");

  if (hasComma && hasDot) {
    text = text.lastIndexOf(",") > text.lastIndexOf(".")
      ? text.replace(/\./g, "").replace(",", ".")
      : text.replace(/,/g, "");
  } else if (hasComma) {
    text = text.replace(",", ".");
  } else if (hasDot) {
    const [head, tail] = text.split(".");
    if (tail?.length === 3 && head.length <= 3) {
      text = `${head}${tail}`;
    }
  }

  const number = Number(text);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function firstFinite(...values) {
  for (const value of values) {
    const number = parseNumber(value);
    if (number > 0) return number;
  }
  return 0;
}

function walk(value, visitor) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, visitor));
    return;
  }
  Object.entries(value).forEach(([key, child]) => {
    visitor(key, child, value);
    walk(child, visitor);
  });
}

function readJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return blocks
    .map((match) => {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function readJsonBlocks(html) {
  const blocks = [];
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];

  scripts.forEach((match) => {
    const raw = match[1]
      .replace(/&quot;/g, "\"")
      .replace(/&amp;/g, "&")
      .trim();
    if (!raw) return;

    if (/^\s*[{[]/.test(raw)) {
      try {
        blocks.push(JSON.parse(raw));
      } catch {
        // Some Mobile.de script tags contain JS chunks rather than plain JSON.
      }
    }
  });

  return blocks;
}

function collectRegexMatches(text, patterns) {
  const values = [];
  patterns.forEach((pattern) => {
    for (const match of text.matchAll(pattern)) {
      if (match?.[1]) values.push(match[1]);
    }
  });
  return values;
}

function isAccessDenied(html, text = "") {
  return /Zugriff verweigert|Access denied|For security reasons/i.test(`${html}\n${text}`);
}

function normalizeMobileDeUrl(sourceUrl) {
  let parsed;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    return null;
  }

  if (!/(^|\.)mobile\.de$/i.test(parsed.hostname)) return null;

  const idFromQuery = parsed.searchParams.get("id");
  const idFromPath = parsed.pathname.match(/(?:-|\/)(\d{6,})(?:\.html)?$/)?.[1];
  const id = idFromQuery || idFromPath;

  if (!id || !/^\d{6,}$/.test(id)) {
    return {
      originalUrl: sourceUrl,
      requestUrl: parsed.toString(),
      adId: "",
    };
  }

  const canonical = new URL("/fahrzeuge/details.html", MOBILEDE_CANONICAL_ORIGIN);
  canonical.searchParams.set("id", id);

  return {
    originalUrl: sourceUrl,
    requestUrl: canonical.toString(),
    adId: id,
  };
}

function extractPrice(html, jsonData) {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value, parent) => {
      const lower = key.toLowerCase();
      if ([
        "consumerpricegross",
        "dealerpricegross",
        "grossprice",
        "grosslistprice",
        "price",
      ].includes(lower)) candidates.push(value);
      if (lower === "amount" && /eur/i.test(String(parent?.currency || parent?.priceCurrency || ""))) candidates.push(value);
    });
  });

  candidates.push(...collectRegexMatches(html, [
    /\\?"consumerPriceGross\\?"\s*:\s*\\?"?([\d., ]+)/gi,
    /\\?"dealerPriceGross\\?"\s*:\s*\\?"?([\d., ]+)/gi,
    /\\?"grossPrice\\?"\s*:\s*\\?"?([\d., ]+)/gi,
    /\\?"grossListPrice\\?"\s*:\s*\\?"?([\d., ]+)/gi,
    /\\?"price\\?"\s*:\s*\\?"?([\d., ]+)/gi,
    /€\s*([\d. ]+)/gi,
    /([\d. ]+)\s*€/gi,
  ]));

  return firstFinite(...candidates);
}

function extractDisplacement(html, jsonData, text) {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/displacement|hubraum|ccm|enginecapacity|cubiccapacity/i.test(key)) candidates.push(value);
    });
  });

  candidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /\\?"displacementCcm\\?"\s*:\s*\\?"?([\d. ]+)/gi,
    /\\?"cubicCapacity\\?"\s*:\s*\\?"?([\d. ]+)/gi,
    /\\?"engineCapacity\\?"\s*:\s*\\?"?([\d. ]+)/gi,
    /Hubraum[^0-9]{0,80}([\d. ]+)\s*cm/i,
    /Pojemno(?:ść|sc)[^0-9]{0,80}([\d. ]+)\s*cm/i,
    /([\d. ]+)\s*cm³/i,
    /([\d. ]+)\s*ccm/i,
  ]));

  return Math.round(firstFinite(...candidates));
}

function extractFuel(html, jsonData, text) {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/fuel|kraftstoff|engine/i.test(key) && typeof value !== "object") candidates.push(value);
    });
  });

  candidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /\\?"fuel\\?"\s*:\s*\\?"([^"\\]+)/gi,
    /\\?"fuelType\\?"\s*:\s*\\?"([^"\\]+)/gi,
    /\\?"fuelCategory\\?"\s*:\s*\\?"([^"\\]+)/gi,
    /Kraftstoff(?:art)?[^A-Za-zА-Яа-я0-9]{0,80}([A-Za-zÄÖÜäöüß -]+)/i,
    /(?:Rodzaj paliwa|Paliwo)[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9]{0,80}([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+)/i,
  ]));

  const joined = candidates.map(String).join(" ").trim();
  if (joined) return joined;

  const lowerText = text.toLowerCase();
  if (lowerText.includes("plug-in")) return "Plug-in-Hybrid";
  if (lowerText.includes("elektro") || lowerText.includes("elektry")) return "Elektro";
  if (lowerText.includes("hybrid") || lowerText.includes("hybryd")) return "Hybrid";
  if (lowerText.includes("diesel")) return "Diesel";
  if (lowerText.includes("benzin") || lowerText.includes("benzyn")) return "Benzin";
  return "";
}

function classifyEngine(fuel, displacementCcm) {
  const normalized = String(fuel || "").toLowerCase();
  const ccm = Number(displacementCcm) || 0;
  const isOver2000 = ccm > 2000;
  const isPlugIn = /plug|phev/.test(normalized);
  const isElectric = /elect|elektro|elektry|bev/.test(normalized);
  const isHybrid = /hybrid|hybryd|hev/.test(normalized);

  if (isElectric && !isHybrid) return 0;
  if (isPlugIn) return isOver2000 ? 1 : 0;
  if (isHybrid) return isOver2000 ? 1 : 2;
  return isOver2000 ? 4 : 3;
}

async function fetchListing(url, originalUrl = url) {
  const response = await fetch(url, {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "de-DE,de;q=0.9,pl-PL;q=0.8,pl;q=0.7,en;q=0.6",
      "referer": originalUrl,
      "user-agent": "Mozilla/5.0 AUTOGOOD-Calculator/1.0",
    },
    redirect: "follow",
  });

  const html = await response.text();
  if (!response.ok && !isAccessDenied(html)) throw new Error(`Mobile.de returned ${response.status}`);
  return html;
}

async function importPlaywright() {
  try {
    return await import("playwright");
  } catch {
    throw new Error("Mobile.de blocked plain HTTP fetch. Install Playwright for browser fallback: npm install && npx playwright install chromium");
  }
}

async function fetchListingWithBrowser(url, originalUrl = url) {
  const { chromium } = await importPlaywright();
  const executablePath = SYSTEM_CHROME_PATHS.find((path) => path && existsSync(path));
  const browser = await chromium.launch({
    headless: !process.env.MOBILEDE_SHOW_BROWSER,
    ...(executablePath ? { executablePath } : {}),
  });

  try {
    const page = await browser.newPage({
      locale: "de-DE",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    });
    await page.setExtraHTTPHeaders({ referer: originalUrl });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3500);

    const html = await page.content();
    const text = await page.locator("body").innerText({ timeout: 10000 }).catch(() => "");
    return { html, text, mode: "browser" };
  } finally {
    await browser.close();
  }
}

async function loadListing(urlInfo) {
  const html = await fetchListing(urlInfo.requestUrl, urlInfo.originalUrl);
  const text = stripTags(html);

  if (!isAccessDenied(html, text)) {
    return { html, text, mode: "http" };
  }

  return fetchListingWithBrowser(urlInfo.requestUrl, urlInfo.originalUrl);
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") return sendJson(response, 204, {});

  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  if (requestUrl.pathname !== "/mobilede/import") {
    return sendJson(response, 404, { error: "Not found" });
  }

  const sourceUrl = requestUrl.searchParams.get("url") || "";
  const urlInfo = normalizeMobileDeUrl(sourceUrl);
  if (!urlInfo) {
    return sendJson(response, 400, { error: "Expected a mobile.de listing URL" });
  }

  try {
    const { html, text: loadedText, mode } = await loadListing(urlInfo);
    const text = loadedText || stripTags(html);
    if (isAccessDenied(html, text)) throw new Error("Mobile.de returned Access denied");

    const jsonData = [...readJsonLd(html), ...readJsonBlocks(html)];
    const carBruttoEur = extractPrice(html, jsonData);
    const displacementCcm = extractDisplacement(html, jsonData, text);
    const fuel = extractFuel(html, jsonData, text);
    const engineTypeIndex = classifyEngine(fuel, displacementCcm);

    if (!carBruttoEur) throw new Error("Price not found");

    sendJson(response, 200, {
      sourceUrl: urlInfo.originalUrl,
      normalizedUrl: urlInfo.requestUrl,
      adId: urlInfo.adId,
      importMode: mode,
      carBruttoEur,
      fuel,
      displacementCcm,
      engineTypeIndex,
      engineTypeLabel: [
        "EL / PHEV <=2000cm³",
        "PHEV / HEV >2000cm³",
        "HEV <=2000cm³",
        "Spalinowy <=2000cm³",
        "Spalinowy >2000cm³",
      ][engineTypeIndex],
    });
  } catch (error) {
    sendJson(response, 502, {
      error: "Could not import Mobile.de listing",
      detail: error.message,
      sourceUrl: urlInfo.originalUrl,
      normalizedUrl: urlInfo.requestUrl,
      adId: urlInfo.adId,
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mobile.de import backend: http://127.0.0.1:${PORT}/mobilede/import?url=...`);
});
