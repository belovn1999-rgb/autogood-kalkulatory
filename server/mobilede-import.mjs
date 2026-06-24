import http from "node:http";
import { existsSync } from "node:fs";

const PORT = Number(process.env.PORT || 8788);
const SYSTEM_CHROME_PATHS = [
  process.env.MOBILEDE_CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
].filter(Boolean);

const MOBILEDE_CANONICAL_ORIGIN = "https://suchen.mobile.de";
const DEMO_BUS_TRANSPORT_NETTO_PLN = 3400;

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

function firstText(...values) {
  for (const value of values.flat()) {
    const text = stripTags(value);
    if (text) return text;
  }
  return "";
}

function cleanTitleCandidate(value) {
  return stripTags(value)
    .replace(/\s+f(?:ü|u)r\s+€[\d., ]+.*$/i, "")
    .replace(/\s+for\s+€[\d., ]+.*$/i, "")
    .replace(/\s+\|\s*mobile\.de.*$/i, "")
    .trim();
}

function isPlausibleVehicleTitle(value) {
  const text = cleanTitleCandidate(value);
  if (!text || text.length < 3 || text.length > 160) return false;
  if (/^(price|imprint|privacy|cookie|technical data|vehicle condition|dealer|seller)$/i.test(text)) return false;
  if (/imprint|additional information|privacy policy|cookie/i.test(text)) return false;
  return /[A-Za-zÀ-ž]/.test(text);
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

  return {
    originalUrl: sourceUrl,
    requestUrl: parsed.toString(),
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

function extractTitle(html, jsonData, text) {
  const headingCandidates = collectRegexMatches(html, [
    /<h1[^>]*>([\s\S]*?)<\/h1>/gi,
    /<h2[^>]*>([\s\S]*?)<\/h2>/gi,
  ]);
  const documentTitleCandidates = collectRegexMatches(html, [
    /<title[^>]*>([\s\S]*?)<\/title>/gi,
  ]);
  const textLineCandidates = String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 40);
  const jsonCandidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/^(name|title|headline|modeldescription|make|model)$/i.test(key) && typeof value !== "object") jsonCandidates.push(value);
    });
  });

  const escapedJsonCandidates = collectRegexMatches(html, [
    /\\"(?:headline|title|name)\\"\s*:\s*\\"([^"\\]{3,140})/gi,
  ]);

  const candidates = [
    ...headingCandidates,
    ...documentTitleCandidates,
    ...textLineCandidates,
    ...jsonCandidates,
    ...escapedJsonCandidates,
  ];

  return cleanTitleCandidate(candidates.find(isPlausibleVehicleTitle) || firstText(candidates));
}

function extractBodyType(html, jsonData, text) {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/category|bodytype|vehiclebody/i.test(key) && typeof value !== "object") candidates.push(value);
    });
  });

  candidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /(?:Kategorie|Kategoria|Category)[^A-Za-zÀ-ž0-9]{0,80}([A-Za-zÀ-ž/ -]+)/i,
  ]));

  return firstText(candidates);
}

function extractMileage(html, jsonData, text) {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/mileage|kilometer|kilometre|odometer|laufleistung/i.test(key)) candidates.push(value);
    });
  });

  candidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /\\"(?:mileage|mileageInKm|odometer)\\"\s*:\s*\\"?([\d. ]+)/gi,
    /(?:Kilometerstand|Przebieg|Mileage)[^0-9]{0,80}([\d. ]+)\s*km/i,
    /([\d. ]+)\s*km\b/i,
  ]));

  return Math.round(firstFinite(...candidates));
}

function extractFirstRegistration(html, jsonData, text) {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/firstregistration|firstregistrationdate|ez|zulassung|registration/i.test(key) && typeof value !== "object") candidates.push(value);
    });
  });

  candidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /\\"(?:firstRegistration|firstRegistrationDate)\\"\s*:\s*\\"([^"\\]+)/gi,
    /(?:Erstzulassung|Pierwsza rejestracja|First registration)[^0-9]{0,80}(\d{1,2}\/\d{4}|\d{4})/i,
  ]));

  return firstText(candidates);
}

function extractLocation(html, jsonData, text) {
  const localityCandidates = [];
  const postalCandidates = [];
  const streetCandidates = [];
  const addressCandidates = [];
  const sellerCandidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (typeof value === "object") return;
      if (/addresslocality|city|ort|locality/i.test(key)) localityCandidates.push(value);
      if (/postalcode|zipcode|zip|plz/i.test(key)) postalCandidates.push(value);
      if (/streetaddress|street|strasse|straße/i.test(key)) streetCandidates.push(value);
      if (/address/i.test(key)) addressCandidates.push(value);
      if (/seller|dealer|vendor|anbieter|company|name/i.test(key)) sellerCandidates.push(value);
    });
  });

  const combined = `${html}\n${text}`;
  const postalCityMatches = collectRegexMatches(combined, [
    /\b(\d{5}\s+[A-ZÄÖÜ][A-Za-zÄÖÜäöüßąćęłńóśźżĄĆĘŁŃÓŚŹŻ .'-]{2,60})\b/g,
  ]);
  const postalCity = firstText(postalCityMatches);
  const postalCityMatch = postalCity.match(/^(\d{5})\s+(.+)$/);

  const city = firstText(localityCandidates, postalCityMatch?.[2] || "");
  const postalCode = firstText(postalCandidates, postalCityMatch?.[1] || "");
  const street = firstText(streetCandidates);
  const address = firstText(addressCandidates, [street, postalCode, city].filter(Boolean).join(", "));
  const sellerName = firstText(sellerCandidates);

  return {
    sellerName,
    street,
    postalCode,
    city,
    address,
  };
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

function estimateTransportNettoPln(bodyType, location) {
  const normalizedBody = String(bodyType || "").toLowerCase();
  const postalCode = String(location?.postalCode || "");
  const isBus = /van|minibus|bus/.test(normalizedBody);
  const isDemoRegion = /^17/.test(postalCode);

  if (isBus && isDemoRegion) {
    return {
      amount: DEMO_BUS_TRANSPORT_NETTO_PLN,
      currency: "PLN",
      netto: true,
      rule: "demo_bus_de_17xxx",
      note: "Temporary demo tariff: Van/Minibus from DE-17xxx region."
    };
  }

  return null;
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
    args: [
      "--disable-blink-features=AutomationControlled",
    ],
    ...(executablePath ? { executablePath } : {}),
  });

  try {
    const page = await browser.newPage({
      locale: "de-DE",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
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
    const title = extractTitle(html, jsonData, text);
    const bodyType = extractBodyType(html, jsonData, text);
    const mileageKm = extractMileage(html, jsonData, text);
    const firstRegistration = extractFirstRegistration(html, jsonData, text);
    const location = extractLocation(html, jsonData, text);
    const transportEstimate = estimateTransportNettoPln(bodyType, location);

    if (!carBruttoEur) throw new Error("Price not found");

    sendJson(response, 200, {
      sourceUrl: urlInfo.originalUrl,
      normalizedUrl: urlInfo.requestUrl,
      adId: urlInfo.adId,
      importMode: mode,
      carBruttoEur,
      title,
      bodyType,
      fuel,
      displacementCcm,
      mileageKm,
      firstRegistration,
      location,
      transportNettoPln: transportEstimate?.amount || null,
      transportEstimate,
      engineTypeIndex,
      engineTypeLabel: [
        "EL / PHEV <=2000cm³",
        "PHEV / HEV >2000cm³",
        "HEV <=2000cm³",
        "Spalinowy <=2000cm³",
        "Spalinowy >2000cm³",
      ][engineTypeIndex],
      diagnostics: {
        hasPrice: Boolean(carBruttoEur),
        hasFuel: Boolean(fuel),
        hasDisplacement: Boolean(displacementCcm),
        hasLocation: Boolean(location.city || location.address),
        htmlChars: html.length,
        textChars: text.length,
      },
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
