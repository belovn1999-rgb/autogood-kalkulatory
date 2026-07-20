import http from "node:http";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const PORT = Number(process.env.PORT || 8788);
const execFileAsync = promisify(execFile);
const USER_HOME = process.env.HOME || "";
const SYSTEM_CHROME_PATHS = [
  process.env.MOBILEDE_CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
].filter(Boolean);
const MOBILEDE_CDP_URL = process.env.MOBILEDE_CDP_URL || "http://127.0.0.1:9333";
const MOBILEDE_CDP_PORT = new URL(MOBILEDE_CDP_URL).port || "9333";
const MOBILEDE_CDP_PROFILE = process.env.MOBILEDE_CDP_PROFILE
  || `${USER_HOME}/Library/Application Support/AUTOGOOD/mobilede-chrome-profile`;

const MOBILEDE_CANONICAL_ORIGIN = "https://suchen.mobile.de";
const DEMO_BUS_TRANSPORT_NETTO_PLN = 3400;

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-allow-private-network": "true",
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
    .replace(/[\u00a0\u202f]/g, " ")
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
    const parts = text.split(",");
    text = parts.at(-1)?.length === 3
      ? parts.join("")
      : text.replace(",", ".");
  } else if (hasDot) {
    const parts = text.split(".");
    text = parts.at(-1)?.length === 3
      ? parts.join("")
      : text;
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

function firstFiniteInRange(values, { min = 1, max = Number.POSITIVE_INFINITY } = {}) {
  for (const value of values) {
    const number = parseNumber(value);
    if (number >= min && number <= max) return number;
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
    const regex = pattern.global
      ? pattern
      : new RegExp(pattern.source, `${pattern.flags}g`);
    for (const match of text.matchAll(regex)) {
      if (match?.[1]) values.push(match[1]);
    }
  });
  return values;
}

function collectTextValuesAfterLabels(text, labels) {
  const lines = String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const values = [];

  lines.forEach((line, index) => {
    if (!labels.some((label) => label.test(line))) return;

    for (let offset = 1; offset <= 3; offset += 1) {
      const candidate = lines[index + offset];
      if (candidate) {
        values.push(candidate);
        break;
      }
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

function firstPlausibleText(values, rejectPattern) {
  for (const value of values.flat()) {
    const text = stripTags(value);
    if (text && !rejectPattern.test(text)) return text;
  }
  return "";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanTitleCandidate(value) {
  return stripTags(value)
    .replace(/\s+f(?:ü|u)r\s+€[\d., ]+.*$/i, "")
    .replace(/\s+for\s+€[\d., ]+.*$/i, "")
    .replace(/\s+dla\s+[\d.,\s\u00a0\u202f]+€.*$/i, "")
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

function isPlausibleListingPage(html, text = "") {
  const combined = `${html}\n${text}`;
  const hasPrice = /€|EUR/i.test(combined);
  const hasMileage = /Mileage|Przebieg|Kilometerstand/i.test(combined);
  const hasFuel = /Fuel|Paliwo|Kraftstoff/i.test(combined);
  const hasRegistration = /First registration|Pierwsza rejestracja|Erstzulassung/i.test(combined);
  const hasBodyOrEngine = /Category|Kategoria|Kategorie|Cubic Capacity|Pojemność|Hubraum/i.test(combined);

  return hasPrice && hasMileage && hasFuel && hasRegistration && hasBodyOrEngine;
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

  const canonicalUrl = new URL("https://suchen.mobile.de/fahrzeuge/details.html");
  canonicalUrl.searchParams.set("id", id);

  return {
    originalUrl: sourceUrl,
    requestUrl: canonicalUrl.toString(),
    adId: id,
  };
}

function extractPrice(html, jsonData, text = "") {
  const primaryCandidates = [];
  const secondaryCandidates = [];

  primaryCandidates.push(...collectRegexMatches(html, [
    /<title[^>]*>[\s\S]*?(?:dla|for|f(?:ü|u)r)\s+€?\s*([\d.,\s\u00a0\u202f]+)\s*€/i,
    /[?;&]u15=([\d.,\s\u00a0\u202f]+)[;&]/i,
  ]));

  jsonData.forEach((item) => {
    walk(item, (key, value, parent) => {
      const lower = key.toLowerCase();
      if ([
        "consumerpricegross",
        "dealerpricegross",
        "grossprice",
        "grosslistprice",
        "price",
      ].includes(lower)) secondaryCandidates.push(value);
      if (lower === "amount" && /eur/i.test(String(parent?.currency || parent?.priceCurrency || ""))) secondaryCandidates.push(value);
    });
  });

  primaryCandidates.push(...collectTextValuesAfterLabels(text, [
    /^price$/i,
    /^preis$/i,
    /^cena$/i,
    /^price\s+gross$/i,
    /^bruttopreis$/i,
    /^gross price$/i,
  ]));

  primaryCandidates.push(...collectRegexMatches(html, [
    /\\?"consumerPriceGross\\?"\s*:\s*\\?"?([\d.,\s\u00a0\u202f]+)/gi,
    /\\?"dealerPriceGross\\?"\s*:\s*\\?"?([\d.,\s\u00a0\u202f]+)/gi,
    /\\?"grossPrice\\?"\s*:\s*\\?"?([\d.,\s\u00a0\u202f]+)/gi,
    /\\?"grossListPrice\\?"\s*:\s*\\?"?([\d.,\s\u00a0\u202f]+)/gi,
    /\\?"price\\?"\s*:\s*\\?"?([\d.,\s\u00a0\u202f]+)/gi,
    /€\s*([\d.,\s\u00a0\u202f]+)/gi,
    /([\d.,\s\u00a0\u202f]+)\s*€/gi,
  ]));

  return firstFiniteInRange([...primaryCandidates, ...secondaryCandidates], { min: 500, max: 500000 });
}

function extractDisplacement(html, jsonData, text) {
  const primaryCandidates = [];
  const secondaryCandidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/displacement|hubraum|ccm|enginecapacity|cubiccapacity/i.test(key)) secondaryCandidates.push(value);
    });
  });

  primaryCandidates.push(...collectTextValuesAfterLabels(text, [
    /^cubic capacity$/i,
    /^displacement$/i,
    /^hubraum$/i,
    /^pojemno(?:ść|sc)$/i,
  ]));

  primaryCandidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /\\?"displacementCcm\\?"\s*:\s*\\?"?([\d. ]+)/gi,
    /\\?"cubicCapacity\\?"\s*:\s*\\?"?([\d. ]+)/gi,
    /\\?"engineCapacity\\?"\s*:\s*\\?"?([\d. ]+)/gi,
    /Hubraum[^0-9]{0,80}([\d. ]+)\s*cm/i,
    /Pojemno(?:ść|sc)[^0-9]{0,80}([\d. ]+)\s*cm/i,
    /([\d. ]+)\s*cm³/i,
    /([\d. ]+)\s*ccm/i,
  ]));

  return Math.round(firstFiniteInRange([...primaryCandidates, ...secondaryCandidates], { min: 600, max: 9000 }));
}

function normalizeFuel(value) {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return "";
  if (normalized.includes("plug-in")) return "Plug-in-Hybrid";
  if (normalized.includes("diesel")) return "Diesel";
  if (normalized.includes("benzin") || normalized.includes("benzyn")) return "Benzin";
  if (normalized.includes("hybrid") || normalized.includes("hybryd")) return "Hybrid";
  if (normalized.includes("elect") || normalized.includes("elektro") || normalized.includes("elektry")) return "Elektro";
  return "";
}

function extractFuel(html, jsonData, text) {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/fuel|kraftstoff|engine/i.test(key) && typeof value !== "object") candidates.push(value);
    });
  });

  candidates.push(...collectTextValuesAfterLabels(text, [
    /^fuel$/i,
    /^kraftstoff(?:art)?$/i,
    /^paliwo$/i,
    /^rodzaj paliwa$/i,
  ]));

  candidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /\\?"fuel\\?"\s*:\s*\\?"([^"\\]+)/gi,
    /\\?"fuelType\\?"\s*:\s*\\?"([^"\\]+)/gi,
    /\\?"fuelCategory\\?"\s*:\s*\\?"([^"\\]+)/gi,
    /Kraftstoff(?:art)?[^A-Za-zА-Яа-я0-9]{0,80}([A-Za-zÄÖÜäöüß -]+)/i,
    /(?:Rodzaj paliwa|Paliwo)[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9]{0,80}([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+)/i,
  ]));

  const joined = candidates.map(String).join(" ").trim();
  const normalizedCandidate = normalizeFuel(joined);
  if (normalizedCandidate) return normalizedCandidate;
  const normalizedText = normalizeFuel(text);
  if (normalizedText) return normalizedText;
  if (joined) return joined;
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

  candidates.push(...collectTextValuesAfterLabels(text, [
    /^category$/i,
    /^body type$/i,
    /^kategorie$/i,
    /^kategoria$/i,
  ]));

  candidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /(?:Kategorie|Kategoria|Category)[^A-Za-zÀ-ž0-9]{0,80}([A-Za-zÀ-ž/ -]+)/i,
  ]));

  return firstPlausibleText(candidates, /^(item|car|vehicle)$/i);
}

function extractMileage(html, jsonData, text) {
  const primaryCandidates = [];
  const secondaryCandidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/mileage|kilometer|kilometre|odometer|laufleistung/i.test(key)) secondaryCandidates.push(value);
    });
  });

  primaryCandidates.push(...collectTextValuesAfterLabels(text, [
    /^mileage$/i,
    /^kilometerstand$/i,
    /^przebieg$/i,
  ]));

  primaryCandidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /\\"(?:mileage|mileageInKm|odometer)\\"\s*:\s*\\"?([\d. ]+)/gi,
    /(?:Kilometerstand|Przebieg|Mileage)[^0-9]{0,80}([\d. ]+)\s*km/i,
    /([\d. ]+)\s*km\b/i,
  ]));

  return Math.round(firstFiniteInRange([...primaryCandidates, ...secondaryCandidates], { min: 1000, max: 1000000 }));
}

function extractFirstRegistration(html, jsonData, text) {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/firstregistration|firstregistrationdate|ez|zulassung|registration/i.test(key) && typeof value !== "object") candidates.push(value);
    });
  });

  candidates.push(...collectTextValuesAfterLabels(text, [
    /^first registration$/i,
    /^erstzulassung$/i,
    /^pierwsza rejestracja$/i,
  ]));

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

async function fetchListingWithUserChrome(url, adId = "") {
  if (process.platform !== "darwin") {
    throw new Error("User Chrome fallback is available only on macOS.");
  }

  const script = `
on run argv
  set targetUrl to item 1 of argv
  set targetAdId to item 2 of argv
  tell application "Google Chrome"
    activate
    if (count of windows) = 0 then make new window

    set pageJson to ""
    if targetAdId is not "" then
      repeat with candidateWindow in windows
        set tabCounter to 1
        repeat with candidateTab in tabs of candidateWindow
          if (URL of candidateTab contains targetAdId) then
            set index of candidateWindow to 1
            set active tab index of candidateWindow to tabCounter
            delay 1
            try
              set candidateJson to execute active tab of front window javascript "JSON.stringify({title:document.title,url:location.href,text:(document.body&&document.body.innerText)||'',html:(document.documentElement&&document.documentElement.outerHTML)||''})"
              if candidateJson does not contain "Access denied" and candidateJson does not contain "Zugriff verweigert" and length of candidateJson > 1000 then
                set pageJson to candidateJson
                exit repeat
              end if
            end try
          end if
          set tabCounter to tabCounter + 1
        end repeat
        if pageJson is not "" then exit repeat
      end repeat
    end if

    if pageJson is "" then
      tell front window
        set newTab to make new tab at end of tabs with properties {URL:targetUrl}
        set active tab index to (count of tabs)
      end tell

      repeat with attempt from 1 to 15
        delay 1
        try
          set pageJson to execute active tab of front window javascript "JSON.stringify({title:document.title,url:location.href,text:(document.body&&document.body.innerText)||'',html:(document.documentElement&&document.documentElement.outerHTML)||''})"
          if pageJson does not contain "Access denied" and pageJson does not contain "Zugriff verweigert" and length of pageJson > 1000 then exit repeat
        end try
      end repeat
    end if

    return pageJson
  end tell
end run
`;

  const { stdout } = await execFileAsync("osascript", ["-e", script, url, adId], {
    maxBuffer: 25 * 1024 * 1024,
    timeout: 45000,
  });
  const payload = JSON.parse(stdout.trim() || "{}");
  const html = String(payload.html || "");
  const text = String(payload.text || "");

  if (!html && !text) {
    throw new Error("Could not read listing from user Chrome.");
  }

  return { html, text, mode: "user_chrome" };
}

async function fetchListingWithUserChromeClipboard(url, adId = "") {
  if (process.platform !== "darwin") {
    throw new Error("User Chrome clipboard fallback is available only on macOS.");
  }

  const script = `
on run argv
  set targetUrl to item 1 of argv
  set targetAdId to item 2 of argv
  set outputSeparator to ASCII character 30
  set savedClipboard to missing value
  set pageText to ""
  set currentUrl to ""
  set currentTitle to ""

  try
    set savedClipboard to the clipboard
  end try

  tell application "Google Chrome"
    activate
    if (count of windows) = 0 then make new window

    set tabFound to false
    if targetAdId is not "" then
      repeat with candidateWindow in windows
        set tabCounter to 1
        repeat with candidateTab in tabs of candidateWindow
          if (URL of candidateTab contains targetAdId) then
            set index of candidateWindow to 1
            set active tab index of candidateWindow to tabCounter
            set tabFound to true
            exit repeat
          end if
          set tabCounter to tabCounter + 1
        end repeat
        if tabFound then exit repeat
      end repeat
    end if

    if tabFound is false then
      tell front window
        make new tab at end of tabs with properties {URL:targetUrl}
        set active tab index to (count of tabs)
      end tell
    end if
  end tell

  repeat with attempt from 1 to 15
    delay 1
    tell application "Google Chrome"
      set currentUrl to URL of active tab of front window
      set currentTitle to title of active tab of front window
    end tell
    tell application "System Events"
      keystroke "a" using command down
      delay 0.15
      keystroke "c" using command down
    end tell
    delay 0.35
    try
      set pageText to the clipboard as text
      if pageText does not contain "Access denied" and pageText does not contain "Zugriff verweigert" and length of pageText > 1000 then exit repeat
    end try
  end repeat

  try
    if savedClipboard is not missing value then set the clipboard to savedClipboard
  end try

  return currentUrl & outputSeparator & currentTitle & outputSeparator & pageText
end run
`;

  const { stdout } = await execFileAsync("osascript", ["-e", script, url, adId], {
    maxBuffer: 25 * 1024 * 1024,
    timeout: 45000,
  });
  const [pageUrl = "", title = "", ...textParts] = stdout.split("\u001e");
  const text = textParts.join("\u001e").trim();
  const cleanTitle = title.trim();
  const html = `<title>${escapeHtml(cleanTitle)}</title>\n${escapeHtml(text)}`;

  if (!text || text.length < 1000) {
    throw new Error("Could not copy listing text from user Chrome.");
  }

  return {
    html,
    text,
    mode: "user_chrome_clipboard",
    finalUrl: pageUrl.trim(),
  };
}

async function openChromeDevToolsTarget(url) {
  const baseUrl = MOBILEDE_CDP_URL;
  const endpoint = `${baseUrl.replace(/\/$/, "")}/json/new?${encodeURIComponent(url)}`;
  let response = await fetch(endpoint, { method: "PUT" });

  if (!response.ok) {
    response = await fetch(endpoint);
  }

  if (!response.ok) {
    throw new Error(`Chrome DevTools could not open listing tab: ${response.status}`);
  }

  return response.json();
}

function readChromeDevToolsTarget(target) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    const pending = new Map();
    let commandId = 0;

    const cleanup = () => {
      pending.clear();
      socket.close();
    };

    const send = (method, params = {}) => new Promise((commandResolve, commandReject) => {
      commandId += 1;
      pending.set(commandId, { resolve: commandResolve, reject: commandReject });
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });

    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data);
        if (!message.id || !pending.has(message.id)) return;
        const handler = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) {
          handler.reject(new Error(message.error.message || "Chrome DevTools command failed"));
        } else {
          handler.resolve(message.result || {});
        }
      } catch (error) {
        cleanup();
        reject(error);
      }
    });

    socket.addEventListener("error", () => {
      cleanup();
      reject(new Error("Chrome DevTools websocket failed."));
    });

    socket.addEventListener("open", async () => {
      try {
        await send("Runtime.enable");
        await send("Page.bringToFront");

        for (let attempt = 1; attempt <= 15; attempt += 1) {
          const result = await send("Runtime.evaluate", {
            expression: "JSON.stringify({title:document.title,url:location.href,text:(document.body&&document.body.innerText)||'',html:(document.documentElement&&document.documentElement.outerHTML)||''})",
            returnByValue: true,
            awaitPromise: true,
          });
          const value = result?.result?.value || "{}";
          const payload = JSON.parse(value);
          const html = String(payload.html || "");
          const text = String(payload.text || "");

          if (!isAccessDenied(html, text) && isPlausibleListingPage(html, text)) {
            cleanup();
            resolve({ html, text, mode: "user_chrome_cdp" });
            return;
          }

          await delay(1000);
        }

        cleanup();
        reject(new Error("Chrome DevTools returned Access denied or an incomplete listing page."));
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  });
}

async function waitForChromeDevTools() {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      const response = await fetch(`${MOBILEDE_CDP_URL.replace(/\/$/, "")}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome is still starting.
    }
    await delay(500);
  }

  throw new Error(`Chrome DevTools is not available at ${MOBILEDE_CDP_URL}.`);
}

async function startChromeDevTools(url) {
  if (process.platform !== "darwin") return;

  await execFileAsync("open", [
    "-na",
    "Google Chrome",
    "--args",
    `--user-data-dir=${MOBILEDE_CDP_PROFILE}`,
    `--remote-debugging-port=${MOBILEDE_CDP_PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    url,
  ], {
    timeout: 10000,
  });
  await waitForChromeDevTools();
}

async function fetchListingWithChromeDevTools(url, adId = "") {
  const baseUrl = MOBILEDE_CDP_URL;
  let targetsResponse;

  try {
    targetsResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/json`);
  } catch {
    await startChromeDevTools(url);
    targetsResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/json`);
  }

  if (!targetsResponse.ok) {
    throw new Error(`Chrome DevTools is not available: ${targetsResponse.status}`);
  }

  const targets = await targetsResponse.json();
  const existingTarget = targets.find((target) => (
    target.type === "page"
    && target.webSocketDebuggerUrl
    && adId
    && String(target.url || "").includes(adId)
  ));

  if (existingTarget) {
    try {
      return await readChromeDevToolsTarget(existingTarget);
    } catch {
      // Existing tabs can be stale or partially restored; open a fresh one below.
    }
  }

  const target = await openChromeDevToolsTarget(url);
  return readChromeDevToolsTarget(target);
}

async function loadListing(urlInfo) {
  try {
    return await fetchListingWithChromeDevTools(urlInfo.requestUrl, urlInfo.adId);
  } catch (devToolsError) {
    try {
      return await fetchListingWithUserChromeClipboard(urlInfo.requestUrl, urlInfo.adId);
    } catch {
      try {
        return await fetchListingWithUserChrome(urlInfo.requestUrl, urlInfo.adId);
      } catch {
        try {
          const browserListing = await fetchListingWithBrowser(urlInfo.requestUrl, urlInfo.originalUrl);
          if (!isAccessDenied(browserListing.html, browserListing.text)) return browserListing;

          const html = await fetchListing(urlInfo.requestUrl, urlInfo.originalUrl);
          const text = stripTags(html);
          if (!isAccessDenied(html, text)) return { html, text, mode: "http" };

          throw new Error("Mobile.de returned Access denied");
        } catch {
          throw devToolsError;
        }
      }
    }
  }
}

export async function handleMobiledeImport(request, response) {
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
    const carBruttoEur = extractPrice(html, jsonData, text);
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
}

if (isDirectRun()) {
  const server = http.createServer(handleMobiledeImport);
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`Mobile.de import backend: http://127.0.0.1:${PORT}/mobilede/import?url=...`);
  });
}

function isDirectRun() {
  return import.meta.url === pathToFileURL(process.argv[1] || "").href;
}
