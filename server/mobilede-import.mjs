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
const OTHER_EUROPE_TARIFF = {
  transport: 5000,
  inspection: 2500,
  rule: "other_europe",
  note: "Fallback tariff for other European countries.",
};

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

function extractEquipment(html) {
  // Read only the listing's equipment list, not matching words elsewhere on the page.
  const list = String(html || "").match(/<ul\b[^>]*data-testid=["']vip-features-list["'][^>]*>([\s\S]*?)<\/ul>/i);
  if (!list) return [];
  return [...list[1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => stripTags(match[1]))
    .filter(Boolean)
    .slice(0, 120);
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
    .replace(/\s+f(?:ü|u)r\s+€?\s*[\d.,\s\u00a0\u202f]+€?.*$/i, "")
    .replace(/\s+for\s+€?\s*[\d.,\s\u00a0\u202f]+€?.*$/i, "")
    .replace(/\s+dla\s+[\d.,\s\u00a0\u202f]+€.*$/i, "")
    .replace(/\s+\|\s*mobile\.de.*$/i, "")
    .trim();
}

function isMarketingTitle(value) {
  const text = cleanTitleCandidate(value);
  return /charge faster|enjoy more|brand portal|jetzt entdecken|discover|advertising|sponsored/i.test(text);
}

function isPlausibleVehicleTitle(value) {
  const text = cleanTitleCandidate(value);
  if (!text || text.length < 3 || text.length > 160) return false;
  if (isMarketingTitle(text)) return false;
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

// VAT-deductible listings print the net price next to the gross one
// ("16.722 € (Netto)" / "Nettopreis"). Margin listings have no net price at all.
function extractNetPrice(html, jsonData, text = "", grossPrice = 0) {
  const primaryCandidates = [];
  const secondaryCandidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if ([
        "consumerpricenet",
        "dealerpricenet",
        "netprice",
        "pricenet",
        "nettoprice",
        "netlistprice",
      ].includes(key.toLowerCase())) secondaryCandidates.push(value);
    });
  });

  primaryCandidates.push(...collectTextValuesAfterLabels(text, [
    /^nettopreis$/i,
    /^netto$/i,
    /^net\s+price$/i,
    /^price\s+net$/i,
    /^cena\s+netto$/i,
  ]));

  primaryCandidates.push(...collectRegexMatches(html, [
    /\\?"consumerPriceNet\\?"\s*:\s*\\?"?([\d.,\s\u00a0\u202f]+)/gi,
    /\\?"dealerPriceNet\\?"\s*:\s*\\?"?([\d.,\s\u00a0\u202f]+)/gi,
    /\\?"netPrice\\?"\s*:\s*\\?"?([\d.,\s\u00a0\u202f]+)/gi,
    /\\?"priceNet\\?"\s*:\s*\\?"?([\d.,\s\u00a0\u202f]+)/gi,
  ]));

  primaryCandidates.push(...collectRegexMatches(text, [
    /([\d.,\s\u00a0\u202f]+)\s*€\s*\(?\s*netto/gi,
    /netto(?:preis)?[^\d€]{0,20}([\d.,\s\u00a0\u202f]+)\s*€/gi,
    /([\d.,\s\u00a0\u202f]+)\s*€\s*(?:zzgl|exkl|excl)\b/gi,
  ]));

  const gross = Number(grossPrice) || 0;
  // A net price must sit below the gross one; anything outside that band is a mis-parse.
  const max = gross > 0 ? gross * 0.995 : 500000;
  const min = gross > 0 ? gross * 0.7 : 500;

  return firstFiniteInRange([...primaryCandidates, ...secondaryCandidates], { min, max });
}

function extractPurchaseType(html, jsonData, text = "") {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/vat|tax|mwst|margin|marge|priceType|taxType|vatType|description|feature/i.test(key)) {
        candidates.push(value);
      }
    });
  });

  const source = normalizeTariffText([...candidates, text].join(" "));

  if (/differenzbesteuerung|mehrwertsteuer nicht ausweisbar|mwst\.?\s+nicht ausweisbar|nicht ausweisbare mwst|vat margin|margin scheme|marge|marza/.test(source)) {
    return "Marża";
  }

  if (/mehrwertsteuer ausweisbar|mwst\.?\s+ausweisbar|vat deductible|vat reclaimable|vat recoverable/.test(source)) {
    return "VAT";
  }

  return "Marża";
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

function extractPowerHp(html, jsonData, text) {
  const primaryCandidates = [];
  const secondaryCandidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/power|horsepower|leistung|hp|ps|kw/i.test(key) && typeof value !== "object") secondaryCandidates.push(value);
    });
  });

  primaryCandidates.push(...collectTextValuesAfterLabels(text, [
    /^power$/i,
    /^horsepower$/i,
    /^leistung$/i,
    /^moc$/i,
    /^moc silnika$/i,
  ]));

  primaryCandidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /\\"(?:powerHp|horsepower|powerPs)\\"\s*:\s*\\"?([\d. ]+)/gi,
    /(?:Moc silnika|Moc|Power|Horsepower|Leistung)[^0-9]{0,100}([\d. ]+)\s*(?:KM|HP|PS)/i,
    /(?:Moc silnika|Moc|Power|Leistung)[^0-9]{0,100}[\d. ]+\s*kW[^0-9]{0,40}([\d. ]+)\s*(?:KM|HP|PS)/i,
    /([\d. ]+)\s*(?:KM|HP|PS)\b/i,
  ]));

  return Math.round(firstFiniteInRange([...primaryCandidates, ...secondaryCandidates], { min: 20, max: 2000 }));
}

function normalizeGearbox(value) {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return "";
  if (/automatic|automatik|automatyczna|auto\.|dct|tiptronic|steptronic|s tronic|pdk/.test(normalized)) return "Automatyczna";
  if (/manual|schaltgetriebe|schaltung|manualna|ręczna|reczna/.test(normalized)) return "Manualna";
  return "";
}

function extractGearbox(html, jsonData, text) {
  const candidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (/gearbox|transmission|getriebe|skrzy/i.test(key) && typeof value !== "object") candidates.push(value);
    });
  });

  candidates.push(...collectTextValuesAfterLabels(text, [
    /^gearbox$/i,
    /^transmission$/i,
    /^getriebe$/i,
    /^skrzynia biegów$/i,
    /^skrzynia biegow$/i,
  ]));

  candidates.push(...collectRegexMatches(`${html}\n${text}`, [
    /\\"(?:gearbox|transmission|gearboxType)\\"\s*:\s*\\"([^"\\]+)/gi,
    /(?:Getriebe|Skrzynia biegów|Skrzynia biegow|Transmission|Gearbox)[^A-Za-zÀ-ž0-9]{0,80}([A-Za-zÀ-ž .-]+)/i,
  ]));

  for (const candidate of candidates) {
    const normalized = normalizeGearbox(candidate);
    if (normalized) return normalized;
  }

  return normalizeGearbox(text);
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

function extractVisiblePostalCity(text) {
  const lines = String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^(?:DE[-\s])?(\d{5})[\s\u00a0]+([A-ZÄÖÜ][A-Za-zÄÖÜäöüßąćęłńóśźżĄĆĘŁŃÓŚŹŻ .'-]{2,60})$/);
    if (match) {
      return {
        postalCode: match[1],
        city: match[2].trim(),
        address: `${match[1]}, ${match[2].trim()}`,
      };
    }
  }

  return null;
}

// The ad's JSON-LD car names the seller and the address exactly.
function ldCarSeller(jsonData) {
  let seller = null;
  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (seller || !value || typeof value !== "object") return;
      if (value["@type"] === "Car" && value.offers?.offeredBy) seller = value.offers.offeredBy;
    });
    if (!seller && item?.["@type"] === "Car" && item.offers?.offeredBy) seller = item.offers.offeredBy;
  });
  return seller;
}

function extractLocation(html, jsonData, text) {
  const ldSeller = ldCarSeller(jsonData);
  const ldAddress = ldSeller?.address || {};
  if (ldAddress.addressLocality || ldAddress.postalCode) {
    const street = String(ldAddress.streetAddress || "").trim();
    const postalCode = String(ldAddress.postalCode || "").trim();
    const city = String(ldAddress.addressLocality || "").trim();
    return {
      sellerName: String(ldSeller.name || "").trim(),
      street,
      postalCode,
      city,
      address: [street, [postalCode, city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
      country: String(ldAddress.addressCountry || "").trim() || countryFromText(`${city} ${text}`),
    };
  }
  const localityCandidates = [];
  const postalCandidates = [];
  const streetCandidates = [];
  const addressCandidates = [];
  const sellerCandidates = [];
  const countryCandidates = [];

  jsonData.forEach((item) => {
    walk(item, (key, value) => {
      if (typeof value === "object") return;
      if (/addresslocality|city|ort|locality/i.test(key)) localityCandidates.push(value);
      if (/postalcode|zipcode|zip|plz/i.test(key)) postalCandidates.push(value);
      if (/streetaddress|street|strasse|straße/i.test(key)) streetCandidates.push(value);
      if (/address/i.test(key)) addressCandidates.push(value);
      if (/seller|dealer|vendor|anbieter|company|name/i.test(key)) sellerCandidates.push(value);
      if (/addresscountry|country|land/i.test(key)) countryCandidates.push(value);
    });
  });

  const combined = `${html}\n${text}`;
  const postalCityMatches = collectRegexMatches(combined, [
    /\b(\d{5}\s+[A-ZÄÖÜ][A-Za-zÄÖÜäöüßąćęłńóśźżĄĆĘŁŃÓŚŹŻ .'-]{2,60})\b/g,
  ]);
  const postalCity = firstText(postalCityMatches);
  const postalCityMatch = postalCity.match(/^(\d{5})\s+(.+)$/);
  const visiblePostalCity = extractVisiblePostalCity(text);

  const city = firstText(visiblePostalCity?.city, localityCandidates, postalCityMatch?.[2] || "");
  const postalCode = firstText(visiblePostalCity?.postalCode, postalCandidates, postalCityMatch?.[1] || "");
  const street = firstText(streetCandidates);
  const address = firstText(visiblePostalCity?.address, addressCandidates, [street, postalCode, city].filter(Boolean).join(", "));
  const sellerName = firstText(sellerCandidates);
  const country = firstText(countryCandidates, countryFromText(`${address} ${city} ${text}`));

  return {
    sellerName,
    street,
    postalCode,
    city,
    address,
    country,
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

function normalizeTariffText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function countryFromText(value) {
  const text = normalizeTariffText(value);
  if (/\b(germany|deutschland|niemcy|allemagne|alemania)\b/.test(text)) return "DE";
  if (/\b(belgium|belgie|belgia|belgique)\b/.test(text)) return "BE";
  if (/\b(france|frankreich|francja|francia)\b/.test(text)) return "FR";
  if (/\b(italy|italien|wlochy|włochy|italia)\b/.test(text)) return "IT";
  if (/\b(spain|spanien|hiszpania|espana|españa)\b/.test(text)) return "ES";
  if (/\b(netherlands|niederlande|holandia|holland|nederland)\b/.test(text)) return "NL";
  if (/\b(lithuania|litauen|litwa|lietuva|latvia|lettland|lotwa|łotwa|latvija|estonia|estland|estonska|eesti)\b/.test(text)) return "BALTICS";
  if (/\b(sweden|schweden|szwecja|sverige)\b/.test(text)) return "SE";
  return "";
}

function countryCode(location) {
  const rawCountry = normalizeTariffText(location?.country);
  if (/^(de|deu)$/.test(rawCountry)) return "DE";
  if (/^(be|bel)$/.test(rawCountry)) return "BE";
  if (/^(fr|fra)$/.test(rawCountry)) return "FR";
  if (/^(it|ita)$/.test(rawCountry)) return "IT";
  if (/^(es|esp)$/.test(rawCountry)) return "ES";
  if (/^(nl|nld)$/.test(rawCountry)) return "NL";
  if (/^(se|swe)$/.test(rawCountry)) return "SE";
  const detected = countryFromText(rawCountry);
  if (detected) return detected;

  const postalCode = String(location?.postalCode || "");
  if (/^\d{5}$/.test(postalCode)) return "DE";

  return countryFromText(`${location?.address || ""} ${location?.city || ""}`);
}

function isSouthGermany(location) {
  const postalCode = String(location?.postalCode || "");
  const city = normalizeTariffText(location?.city);
  if (/^[6789]/.test(postalCode)) return true;
  return /\b(bayern|bavaria|baden|wurttemberg|munich|munchen|muenchen|stuttgart|nurnberg|nuernberg|augsburg|ulm|freiburg|konstanz)\b/.test(city);
}

function isParisOrEastFrance(location) {
  const postalCode = String(location?.postalCode || "");
  const city = normalizeTariffText(location?.city);
  if (/^(75|77|78|91|92|93|94|95|02|08|10|21|25|39|51|52|54|55|57|58|67|68|70|71|88|89|90)/.test(postalCode)) return true;
  return /\b(paris|ile de france|alsace|lorraine|strasbourg|metz|nancy|reims|dijon|besancon|mulhouse|colmar)\b/.test(city);
}

function isNorthItaly(location) {
  const city = normalizeTariffText(location?.city);
  return /\b(milano|milan|torino|turin|genova|genua|venezia|venice|verona|bologna|brescia|bergamo|padova|parma|modena|trento|bolzano|trieste|lombardia|piemonte|veneto|liguria|emilia|friuli|trentino)\b/.test(city);
}

function isSwedenSouthOrStockholm(location) {
  const city = normalizeTariffText(location?.city);
  return /\b(stockholm|malmo|malmö|goteborg|gothenburg|helsingborg|lund|jonkoping|jönköping|linkoping|linköping|norrkoping|norrköping|uppsala|orebro|örebro|vasteras|västerås)\b/.test(city);
}

function bodySurcharge(bodyType) {
  const normalizedBody = String(bodyType || "").toLowerCase();
  if (/camper|camping|motorhome|wohnmobil|bus|buss|autobus/.test(normalizedBody)) return 400;
  if (/suv|off-road|offroad|gel[aä]nde|terenowy|minibus|van|mpv|minivan/.test(normalizedBody)) return 200;
  return 0;
}

function baseTariff(location) {
  const country = countryCode(location);

  if (country === "BE") return { transport: 2500, inspection: 1500, rule: "belgium" };
  if (country === "NL") return { transport: 2500, inspection: 1500, rule: "netherlands" };
  if (country === "ES") return { transport: 4500, inspection: 2000, rule: "spain" };
  if (country === "BALTICS") return { transport: 2000, inspection: 1500, rule: "baltics" };

  if (country === "DE") {
    return isSouthGermany(location)
      ? { transport: 2700, inspection: 1500, rule: "germany_south" }
      : { transport: 2500, inspection: 1300, rule: "germany_north_middle_east_west" };
  }

  if (country === "FR") {
    return isParisOrEastFrance(location)
      ? { transport: 2750, inspection: 1800, rule: "france_paris_border_east" }
      : { transport: 3000, inspection: 2200, rule: "france_other" };
  }

  if (country === "IT" && isNorthItaly(location)) return { transport: 3500, inspection: 2000, rule: "italy_north" };

  if (country === "SE" && isSwedenSouthOrStockholm(location)) {
    return { transport: 2500, inspection: 1500, rule: "sweden_south_stockholm" };
  }

  return OTHER_EUROPE_TARIFF;
}

function estimateDeliveryAndInspectionNettoPln(bodyType, location) {
  const tariff = baseTariff(location);
  const surcharge = bodySurcharge(bodyType);

  return {
    transport: tariff.transport + surcharge,
    inspection: tariff.inspection,
    currency: "PLN",
    netto: true,
    rule: tariff.rule,
    surcharge,
    note: tariff.note || (surcharge ? "Transport includes body-size surcharge." : ""),
  };
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

  // -g: start in the background, never in front of the user's windows.
  await execFileAsync("open", [
    "-gna",
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

// ---- Reading mobile.de in the importer's own Chrome -------------------------
// mobile.de refuses servers and headless browsers, but not a real Chrome.
// Every page is opened as a BACKGROUND tab of the importer Chrome (nothing
// comes to the front, the user's own browser is never touched) and closed as
// soon as it has been read. One page at a time.
let chromeQueue = Promise.resolve();

function inChromeQueue(work) {
  const run = chromeQueue.then(work, work);
  chromeQueue = run.catch(() => {});
  return run;
}

async function connectChromeBrowser() {
  const versionUrl = `${MOBILEDE_CDP_URL.replace(/\/$/, "")}/json/version`;
  let version;
  try {
    version = await (await fetch(versionUrl)).json();
  } catch {
    await startChromeDevTools("about:blank");
    version = await (await fetch(versionUrl)).json();
  }
  const socket = new WebSocket(version.webSocketDebuggerUrl);
  const pending = new Map();
  let commandId = 0;
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const handler = message.id && pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    if (message.error) handler.reject(new Error(message.error.message || "Chrome DevTools command failed"));
    else handler.resolve(message.result || {});
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("Chrome DevTools websocket failed.")), { once: true });
  });
  // A frozen tab never answers: every command gives up after a while.
  const send = (method, params = {}, sessionId = undefined, timeoutMs = 20000) => new Promise((resolve, reject) => {
    commandId += 1;
    const id = commandId;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Chrome did not answer ${method}`));
    }, timeoutMs);
    pending.set(id, {
      resolve: (value) => { clearTimeout(timer); resolve(value); },
      reject: (error) => { clearTimeout(timer); reject(error); },
    });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  return { send, close: () => socket.close() };
}

async function withBackgroundPage(url, work) {
  return inChromeQueue(async () => {
    const browser = await connectChromeBrowser();
    let targetId = "";
    try {
      ({ targetId } = await browser.send("Target.createTarget", { url: "about:blank", background: true }));
      const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
      await browser.send("Runtime.enable", {}, sessionId);
      await browser.send("Page.navigate", { url }, sessionId);
      const evaluate = async (expression, timeoutMs = 20000) => {
        const result = await browser.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId, timeoutMs);
        if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || "Page script failed");
        return result.result?.value;
      };
      return await work(evaluate);
    } finally {
      if (targetId) await browser.send("Target.closeTarget", { targetId }).catch(() => {});
      browser.close();
    }
  });
}

// mobile.de's own pages freeze in a background tab (their scripts never run),
// so nothing of mobile.de is rendered: a tab on the plain robots.txt of the
// same origin downloads the page with the browser's cookies, and the HTML is
// read here. Nothing comes to the front.
function onMobileDeOrigin(work) {
  return withBackgroundPage(`${MOBILEDE_CANONICAL_ORIGIN}/robots.txt`, async (evaluate) => {
    for (let attempt = 1; attempt <= 20; attempt += 1) {
      await delay(500);
      let ready = false;
      try {
        ready = await evaluate("document.readyState === 'complete' && location.hostname.endsWith('mobile.de')", 5000);
      } catch {
        continue;
      }
      if (ready) return work(evaluate);
    }
    throw new Error("Mobile.de did not answer.");
  });
}

async function fetchListingWithChromeDevTools(url) {
  const html = await onMobileDeOrigin((evaluate) => evaluate(
    `fetch(${JSON.stringify(url)}, { credentials: "include" }).then((response) => response.text())`,
    30000,
  ));
  const text = stripTags(html);
  if (isAccessDenied(html, text)) throw new Error("Mobile.de returned Access denied");
  if (!isPlausibleListingPage(html, text)) throw new Error("Mobile.de returned an incomplete listing page.");
  return { html: String(html || ""), text, mode: "user_chrome_fetch" };
}

// Runs inside a mobile.de page (same origin, the browser's own cookies) and
// reads the price-sorted list the way the AUTOGOOD bookmark does. The result
// page itself is never rendered: its scripts freeze a background tab, so the
// pages are fetched from mobile.de's plain robots.txt instead.
const SEARCH_PAGE_SCRIPT = String.raw`(async (SEARCH_URL, PAGES, COUNT_ONLY) => {
  const digits = (value) => { const m = String(value ?? "").replace(/[.,\s  ](?=\d{3}\b)/g, "").match(/\d+/); return m ? Number(m[0]) : null; };
  const yearOf = (value) => { const m = String(value || "").match(/(?:19|20)\d{2}/); return m ? Number(m[0]) : null; };
  const searchResults = (html) => {
    let payload = "";
    for (const match of html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) { try { payload += JSON.parse(match[1]); } catch {} }
    if (payload.includes('\\"numResultsTotal\\"')) { try { payload = JSON.parse('"' + payload.replace(/\n/g, "\\n") + '"'); } catch { return null; } }
    const at = payload.indexOf('"searchResults":{"numResultsTotal"');
    if (at < 0) return null;
    const start = payload.indexOf("{", at);
    let depth = 0, quoted = false, escaped = false;
    for (let i = start; i < payload.length; i += 1) {
      const c = payload[i];
      if (quoted) { if (escaped) escaped = false; else if (c === "\\") escaped = true; else if (c === '"') quoted = false; continue; }
      if (c === '"') quoted = true; else if (c === "{") depth += 1; else if (c === "}" && --depth === 0) return JSON.parse(payload.slice(start, i + 1));
    }
    return null;
  };
  const titles = new Map();
  const readTitles = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll('a[data-testid^="base-result-listing-"][href*="id="]').forEach((link) => {
      const heading = link.querySelector("h2");
      const id = new URL(link.getAttribute("href"), SEARCH_URL).searchParams.get("id");
      if (!heading || !id) return;
      const text = [...heading.childNodes].map((n) => n.textContent.trim()).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      if (text) titles.set(id, text.slice(0, 160));
    });
  };
  const base = new URL(SEARCH_URL);
  base.searchParams.set("sb", "p");
  base.searchParams.delete("pageNumber");
  const pageUrl = (page, order) => { const u = new URL(base); u.searchParams.set("od", order); if (page > 1) u.searchParams.set("pageNumber", String(page)); return u.toString(); };
  const ordered = (r) => (r?.listings || []).filter((i) => i.type === "regular" || i.type === "eyecatcher");
  const load = async (page, order) => { const html = await (await fetch(pageUrl(page, order), { credentials: "include" })).text(); readTitles(html); return searchResults(html); };
  const first = await load(1, "up");
  if (!first) return { error: "Mobile.de returned no result list (Access denied?)" };
  const total = Number(first.numResultsTotal) || 0;
  if (COUNT_ONLY) return { total, listings: [] };
  const pageSize = ordered(first).length || 20;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const MAX_PAGE = 100;
  const wanted = pageCount <= PAGES
    ? Array.from({ length: pageCount - 1 }, (_, i) => i + 2)
    : [...new Set(Array.from({ length: PAGES }, (_, i) => Math.round(1 + (i * (pageCount - 1)) / (PAGES - 1))))].filter((p) => p > 1);
  const requests = wanted.map((page) => page <= MAX_PAGE ? { page, order: "up" } : (pageCount - page + 1 <= MAX_PAGE ? { page: pageCount - page + 1, order: "down" } : null)).filter(Boolean);
  const offers = [];
  const seen = new Set();
  const collect = (results, request) => ordered(results).forEach((item, index) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    const price = Number(item.price?.grs?.amount);
    if (!price) return;
    const position = (request.page - 1) * pageSize + index;
    offers.push({
      id: String(item.id),
      url: "https://suchen.mobile.de/fahrzeuge/details.html?id=" + item.id,
      title: titles.get(String(item.id)) || [item.make?.localized, item.model?.localized].filter(Boolean).join(" "),
      price, currency: "EUR",
      year: yearOf(item.attr?.fr), mileage: digits(item.attr?.ml),
      power: item.attr?.pw || "", fuel: item.attr?.ft || "",
      rank: request.order === "up" ? position + 1 : total - position,
      marketTotal: total, source: "mobile",
    });
  });
  collect(first, { page: 1, order: "up" });
  for (let i = 0; i < requests.length; i += 3) {
    const batch = requests.slice(i, i + 3);
    const results = await Promise.allSettled(batch.map((r) => load(r.page, r.order)));
    results.forEach((r, j) => { if (r.status === "fulfilled" && r.value) collect(r.value, batch[j]); });
  }
  return { total, listings: offers };
})`;

const searchCache = new Map();
const SEARCH_CACHE_MS = 10 * 60 * 1000;

async function searchMobileDe(searchUrl, { countOnly = false, pages = 8 } = {}) {
  const key = `${countOnly ? "count" : pages}|${searchUrl}`;
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.at < SEARCH_CACHE_MS) return cached.value;
  const value = await onMobileDeOrigin((evaluate) => evaluate(
    `${SEARCH_PAGE_SCRIPT}(${JSON.stringify(searchUrl)}, ${Number(pages) || 8}, ${countOnly ? "true" : "false"})`,
    90000,
  ));
  if (value?.error) throw new Error(value.error);
  searchCache.set(key, { at: Date.now(), value });
  return value;
}

function isMobileDeSearchUrl(value) {
  try {
    const url = new URL(value);
    return /(^|\.)mobile\.de$/.test(url.hostname) && /\/fahrzeuge\/search\.html$/.test(url.pathname);
  } catch {
    return false;
  }
}

async function loadListing(urlInfo) {
  try {
    return await fetchListingWithChromeDevTools(urlInfo.requestUrl);
  } catch (devToolsError) {
    // The user's own Chrome is never driven any more: it brought tabs to the
    // front. Only quiet fallbacks remain.
    try {
      const browserListing = await fetchListingWithBrowser(urlInfo.requestUrl, urlInfo.originalUrl);
      if (!isAccessDenied(browserListing.html, browserListing.text)) return browserListing;
    } catch {
      // Playwright missing or blocked.
    }
    throw devToolsError;
  }
}

export async function handleMobiledeImport(request, response) {
  if (request.method === "OPTIONS") return sendJson(response, 204, {});

  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  if (requestUrl.pathname === "/mobilede/search") {
    const searchUrl = requestUrl.searchParams.get("url") || "";
    if (!isMobileDeSearchUrl(searchUrl)) return sendJson(response, 400, { error: "Expected a mobile.de search URL" });
    try {
      const result = await searchMobileDe(searchUrl, {
        countOnly: requestUrl.searchParams.get("count") === "1",
        pages: Math.min(12, Math.max(1, Number(requestUrl.searchParams.get("pages")) || 8)),
      });
      return sendJson(response, 200, { searchUrl, ...result });
    } catch (error) {
      return sendJson(response, 502, { error: "Could not read Mobile.de search", detail: error.message, searchUrl });
    }
  }
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
    const carNettoEur = extractNetPrice(html, jsonData, text, carBruttoEur);
    const purchaseType = extractPurchaseType(html, jsonData, text);
    const displacementCcm = extractDisplacement(html, jsonData, text);
    const powerHp = extractPowerHp(html, jsonData, text);
    const gearbox = extractGearbox(html, jsonData, text);
    const fuel = extractFuel(html, jsonData, text);
    const engineTypeIndex = classifyEngine(fuel, displacementCcm);
    const title = extractTitle(html, jsonData, text);
    const bodyType = extractBodyType(html, jsonData, text);
    const mileageKm = extractMileage(html, jsonData, text);
    const firstRegistration = extractFirstRegistration(html, jsonData, text);
    const equipment = extractEquipment(html);
    const location = extractLocation(html, jsonData, text);
    const deliveryInspectionEstimate = estimateDeliveryAndInspectionNettoPln(bodyType, location);

    if (!carBruttoEur) throw new Error("Price not found");

    sendJson(response, 200, {
      sourceUrl: urlInfo.originalUrl,
      normalizedUrl: urlInfo.requestUrl,
      adId: urlInfo.adId,
      importMode: mode,
      carBruttoEur,
      carNettoEur: carNettoEur || null,
      purchaseType,
      title,
      bodyType,
      fuel,
      displacementCcm,
      powerHp,
      gearbox,
      mileageKm,
      firstRegistration,
      equipment,
      location,
      transportNettoPln: deliveryInspectionEstimate?.transport || null,
      inspectionNettoPln: deliveryInspectionEstimate?.inspection || null,
      transportEstimate: deliveryInspectionEstimate,
      deliveryInspectionEstimate,
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
        hasNetPrice: Boolean(carNettoEur),
        hasFuel: Boolean(fuel),
        hasDisplacement: Boolean(displacementCcm),
        hasPower: Boolean(powerHp),
        hasGearbox: Boolean(gearbox),
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
