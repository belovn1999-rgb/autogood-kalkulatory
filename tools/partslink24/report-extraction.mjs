import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

const genericProfile = {
  productionDateLabels: [/(?:data\s+produkcji|дата\s+(?:производства|изготовления)|production\s+date|date\s+of\s+production|manufactur(?:e|ing)\s+date|build\s+date)/i],
  engineSpecificationLabels: [/(?:engine\s+specification|спецификац(?:ия|ии)\s+двигател(?:я|ей)|specyfikacj[ae]\s+silnika|motorspezifikation)/i],
  engineTypeLabels: [/(?:rodzaj\s+silnika|typ\s+silnika|тип\s+двигателя|engine\s+type|motor\s+type)/i],
  fuelTypeLabels: [/(?:rodzaj\s+paliwa|тип\s+топлива|вид\s+топлива|fuel\s+type|fuel\s+category|fuel\s+systems|układy\s+paliwowe)/i],
  engineVolumeLabels: [/(?:pojemność\s+silnika|pojemnosc\s+silnika|pojemność\s+skokowa|рабочий\s+объем|рабочий\s+объём|объем\s+двигателя|объём\s+двигателя|engine\s+(?:capacity|displacement)|cubic\s+capacity|displacement)/i]
};

// These profile rules are durable locations verified from actual PDFs. New brands
// keep using the document-wide fallback until a report proves a better location.
const brandReportProfiles = {
  Audi: {
    engineSpecificationLabels: [/(?:engine\s+specification|спецификац(?:ия|ии)\s+двигател(?:я|ей)|specyfikacj[ae]\s+silnika|motorspezifikation)/i],
    engineTypeLabels: [/(?:engine\s+type|rodzaj\s+silnika|тип\s+двигателя)/i],
    fuelTypeLabels: [/(?:fuel\s+systems|układy\s+paliwowe|топливн(?:ая|ые)\s+систем)/i]
  },
  Ford: {
    dateOrder: "YY-MM-DD",
    engineSpecificationLabels: [/(?:rodzaj\s+silnika|engine\s+type)/i],
    engineTypeLabels: [/(?:rodzaj\s+silnika|engine\s+type)/i]
  }
};

export function extractPdfVehicleInfo(pdfPath, { brand = "", language = "" } = {}) {
  const text = readPdfText(pdfPath);
  if (!text) return { productionDate: "", engineType: "", engineVolume: "" };

  const profile = mergeProfile(brandReportProfiles[brand]);
  const productionDateRaw = findFirstPdfValue(text, profile.productionDateLabels);
  const engineSpecificationRaw = findFirstPdfValue(text, profile.engineSpecificationLabels);
  const engineTypeRaw = findFirstPdfValue(text, profile.engineTypeLabels);
  const fuelTypeRaw = findFirstPdfValue(text, profile.fuelTypeLabels);
  const engineVolumeRaw = findFirstPdfValue(text, profile.engineVolumeLabels) || engineSpecificationRaw;
  const mildHybridRaw = text.match(/\bmhev\b|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd(?:a)?|мягк(?:ий|ая)[\s-]*гибрид/i)?.[0] || "";
  const engineInfo = normalizeEngineInfo({
    engineTypeRaw: [engineTypeRaw, engineSpecificationRaw].filter(Boolean).join(" "),
    fuelTypeRaw,
    mildHybridRaw,
    engineVolumeRaw
  });

  return {
    productionDate: formatProductionDate(productionDateRaw, language, profile.dateOrder),
    engineType: engineInfo.engineType,
    engineVolume: normalizePdfEngineVolume(engineVolumeRaw)
  };
}

export function normalizeEngineInfo(info) {
  const source = [info.fuelTypeRaw, info.engineTypeRaw, info.mildHybridRaw]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const isMildHybrid = /\bmhev\b|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd|мягк(?:ий|ая)[\s-]*гибрид/i.test(source);
  const isPlugInHybrid = /\bphev\b|plug[\s-]*in|hybryd[\s-]*plug[\s-]*in|плагин[\s-]*гибрид/i.test(source);
  const isElectric = /(?:battery\s+electric|\bbev\b|electric\s+(?:engine|motor)|silnik\s+elektrycz|электрическ(?:ий|ая)\s+двигател)/i.test(source)
    && !/(?:without|bez|без)\s+(?:electric\s+(?:engine|motor)|silnik\s+elektrycz|электрическ(?:ий|ая)\s+двигател)/i.test(source);
  const isDiesel = /diesel|дизел|olej[\s-]*napędowy|wysokopr[eę][żz]?n|\btdci\b/i.test(source);
  const isGasoline = /gasoline|petrol|benzyn|бензин|\botto\b|\bsi\s+engine\b|silnik\s+benzyn|бензинов/i.test(source);
  const isHybrid = /hybrid|hybryd|гибрид/i.test(source);

  let engineType = "";
  if (isPlugInHybrid) {
    engineType = "Plug-in Гибрид";
  } else if (isElectric) {
    engineType = "Электрический";
  } else if (isGasoline) {
    engineType = "Бензин";
  } else if (isDiesel) {
    engineType = "Дизель";
  } else if (isHybrid && !isMildHybrid) {
    engineType = "Обычный гибрид";
  }

  if (isMildHybrid && (engineType === "Бензин" || engineType === "Дизель")) {
    engineType = `${engineType} + Мягкий гибрид`;
  }

  return {
    engineType,
    engineVolume: normalizePdfEngineVolume(info.engineVolumeRaw)
  };
}

export function formatProductionDate(value, language = "", dateOrder = "") {
  const raw = String(value || "").replace(/\u00a0/g, " ").trim();
  const monthNames = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    stycznia: 1, lutego: 2, marca: 3, kwietnia: 4, maja: 5, czerwca: 6, lipca: 7, sierpnia: 8, września: 9, wrzesnia: 9, października: 10, pazdziernika: 10, listopada: 11, grudnia: 12,
    января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6, июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12
  };
  const namedMatch = raw.toLowerCase().match(/(\d{1,2})\s+([a-zа-яёęóśżźć]+)\s+(\d{4})/iu);
  if (namedMatch && monthNames[namedMatch[2]]) {
    return formatDateParts(namedMatch[1], monthNames[namedMatch[2]], namedMatch[3]);
  }

  const numericMatch = raw.match(/\b(\d{1,4})[.\/-](\d{1,2})[.\/-](\d{1,4})\b/);
  if (!numericMatch) return "";
  const [, first, second, third] = numericMatch;
  if (dateOrder === "YY-MM-DD" && first.length === 2 && third.length === 2) {
    return formatDateParts(third, second, 2000 + Number(first));
  }
  if (first.length === 4) return formatDateParts(third, second, first);
  if (third.length !== 4) return "";
  if (language === "ENG" && Number(first) <= 12 && Number(second) <= 12) {
    return formatDateParts(second, first, third);
  }
  if (Number(first) <= 12 && Number(second) > 12) return formatDateParts(second, first, third);
  return formatDateParts(first, second, third);
}

function mergeProfile(profile = {}) {
  return {
    ...profile,
    ...Object.fromEntries(Object.entries(genericProfile).map(([key, genericPatterns]) => [
    key,
    [...(profile[key] || []), ...genericPatterns]
    ]))
  };
}

function findFirstPdfValue(text, patterns) {
  for (const labelPattern of patterns) {
    const value = extractPdfValue(text, labelPattern);
    if (value) return value;
  }
  return "";
}

function extractPdfValue(text, labelPattern) {
  const source = labelPattern.source.replace(/^\^/, "").replace(/\$$/, "");
  // Table rows in PartsLink reports sometimes wrap the engine size to the next
  // indented line, so preserve one continuation line before normalizing it.
  const inlinePattern = new RegExp(`(?:${source})\\s*[:\\-]?\\s*([^\\r\\n]{1,120}(?:\\r?\\n[\\t ]{6,}[^\\r\\n]{1,120})?)`, "i");
  const inlineMatch = String(text || "").match(inlinePattern);
  return inlineMatch?.[1]?.replace(/\s+/g, " ").trim() || "";
}

function normalizePdfEngineVolume(value) {
  const raw = String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  const cubicMatch = raw.match(/(\d[\d\s]*)\s*(?:cm3|cm³|ccm|cc)\b/i);
  if (cubicMatch) return `${cubicMatch[1].replace(/\s/g, "")} cm3`;
  const literMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:l|л)(?![a-zа-яё])/iu);
  if (literMatch) return `${literMatch[1]} л`;
  return /^\d+(?:[.,]\d+)?$/.test(raw) ? `${raw} л` : "";
}

function formatDateParts(day, month, year) {
  const normalizedDay = Number(day);
  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);
  if (!Number.isInteger(normalizedDay) || !Number.isInteger(normalizedMonth) || !Number.isInteger(normalizedYear)) return "";
  const date = new Date(Date.UTC(normalizedYear, normalizedMonth - 1, normalizedDay));
  if (date.getUTCFullYear() !== normalizedYear || date.getUTCMonth() !== normalizedMonth - 1 || date.getUTCDate() !== normalizedDay) return "";
  return `${String(normalizedDay).padStart(2, "0")}.${String(normalizedMonth).padStart(2, "0")}.${normalizedYear}`;
}

function readPdfText(pdfPath) {
  const bundledPdfToText = join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext");
  const candidates = [process.env.PARTSLINK24_PDFTOTEXT_PATH, "pdftotext", bundledPdfToText].filter(Boolean);

  for (const command of candidates) {
    const result = spawnSync(command, ["-layout", pdfPath, "-"], {
      encoding: "utf8",
      maxBuffer: 5_000_000
    });
    if (result.status === 0 && result.stdout) return result.stdout;
  }

  return "";
}
