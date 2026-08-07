import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

const genericProfile = {
  modelLabels: [/(?:model|модель|model\s+pojazdu|vehicle\s+model|oznaczenie\s+handlowe|торговое\s+наименование|vehicle\s+line|linia\s+pojazdu)/i],
  productionDateLabels: [/(?:data\s+produkcji|дата\s+(?:производства|изготовления)|production\s+date|date\s+of\s+production|manufactur(?:e|ing)\s+date|build\s+date)/i],
  engineSpecificationLabels: [/(?:engine\s+specification|спецификац(?:ия|ии)\s+двигател(?:я|ей)|specyfikacj[ae]\s+silnika|motorspezifikation)/i],
  engineTypeLabels: [/(?:rodzaj\s+silnika|typ\s+silnika|тип\s+двигателя|engine\s+type|motor\s+type)/i],
  fuelTypeLabels: [/(?:rodzaj\s+paliwa|paliwo\s*\(typ\)|тип\s+топлива|вид\s+топлива|fuel\s+type|fuel\s+category|fuel\s+systems|układy\s+paliwowe)/i],
  engineVolumeLabels: [/(?:pojemność\s+silnika|pojemnosc\s+silnika|pojemność\s+skokowa|рабочий\s+объ[её]м|объ[её]м\s+двигателя|engine\s+(?:capacity|displacement)|cubic\s+capacity|displacement)/i],
  engineCodeLabels: [/(?:kod\s+silnika|код\s+двигателя|engine\s+code|nr\s+silnika|номер\s+двигателя|numer\s+silnika)/i]
};

const psaProfile = {
  dateFromDam: true,
  engineSpecificationLabels: [/(?:silnik|двигатель|engine)/i],
  engineVolumeLabels: [
    /(?:pojemność\s+skokowa|рабочий\s+объ[её]м|engine\s+(?:capacity|displacement))/i,
    /^(?:мощность|moc|power)$/i
  ],
  engineEvidenceLabels: [/(?:silnik|двигатель|engine|paliwo\s*\(typ\)|тип\s+топлива|fuel\s+type|pojemność\s+skokowa|рабочий\s+объ[её]м|engine\s+displacement)/i]
};

const fcaProfile = {
  modelLabels: [/(?:ввод\s+данных\s+по\s+модели|wprowadz(?:enie|anie)\s+danych\s+(?:do|dla)\s+modelu|model\s+data\s+entry)/i],
  engineTypeLabels: [/(?:CMB|ELT)/i],
  engineVolumeLabels: [/(?:CC)/i],
  engineEvidenceLabels: [/(?:CMB|ELT|ENG)/i]
};

const jaguarLandRoverProfile = {
  engineSpecificationLabels: [/(?:тип\s+двигателя|typ\s+silnika|engine\s+type|power\s+unit\s+variant|wariant\s+jednostki\s+napędowej|вариант\s+силового\s+агрегата)/i],
  engineTypeLabels: [/(?:тип\s+двигателя|typ\s+silnika|engine\s+type|power\s+unit\s+variant|wariant\s+jednostki\s+napędowej|вариант\s+силового\s+агрегата)/i],
  engineVolumeLabels: [/(?:тип\s+двигателя|typ\s+silnika|engine\s+type|power\s+unit\s+variant|wariant\s+jednostki\s+napędowej|вариант\s+силового\s+агрегата)/i],
  engineEvidenceLabels: [/(?:тип\s+двигателя|typ\s+silnika|engine\s+type|power\s+unit\s+variant|wariant\s+jednostki\s+napędowej|вариант\s+силового\s+агрегата|MHEV|mild\s+hybrid|мягк(?:ий|ая)\s+гибрид)/i]
};

const toyotaLexusProfile = {
  engineSpecificationLabels: [/(?:ENGINE\s*1)/i],
  engineTypeLabels: [/(?:ENGINE\s*1)/i],
  engineVolumeLabels: [/(?:ENGINE\s*1)/i],
  engineEvidenceLabels: [/(?:ENGINE\s*1)/i]
};

const stellantisBrands = new Set([
  "Abarth", "Alfa Romeo", "Citroen", "DS", "Fiat", "Fiat Professional", "Jeep", "Lancia",
  "Opel", "Opel Legacy", "Peugeot", "Vauxhall", "Vauxhall Legacy"
]);

const stellantisTransmissionLabels = [
  /^(?:коробка\s+передач|przeniesienie\s+napędu|skrzynia\s+biegów|transmission|drivetrain)$/i
];

const vagBrands = new Set(["Audi", "Cupra", "Seat", "Skoda", "Volkswagen", "Vw Nutzfahrzeuge"]);

const vagPowertrainLabels = [
  /(?:альтернативная\s+система\s+привода|alternatywny\s+układ\s+napędowy|alternative\s+(?:drive|powertrain)(?:\s+system)?|гибридный\s+привод|napęd\s+hybrydowy|hybrid\s+drive)/i
];

// Locations below come from the operator's verified report matrix. Generic
// labels remain as fallbacks because the same layout is translated by the portal.
const brandReportProfiles = {
  "Alfa Romeo": fcaProfile,
  Audi: {
    engineSpecificationLabels: [/(?:engine\s+specification|спецификац(?:ия|ии)\s+двигател(?:я|ей)|specyfikacj[ae]\s+silnika|motorspezifikation)/i],
    engineTypeLabels: [/(?:engine\s+type|rodzaj\s+silnika|тип\s+двигателя)/i],
    fuelTypeLabels: [/(?:fuel\s+systems|układy\s+paliwowe|топливн(?:ая|ые)\s+систем)/i]
  },
  BMW: {
    modelLabels: [/(?:специфическое\s+для\s+рынка\s+торговое|nazwa\s+handlowa\s+specyficzna\s+dla|market-specific\s+trade\s+name)/i, /(?:model|модель)/i],
    engineTypeLabels: [/(?:kod\s+silnika|код\s+двигателя|engine\s+code)/i]
  },
  Citroen: psaProfile,
  DS: psaProfile,
  Fiat: fcaProfile,
  Ford: {
    dateOrder: "YY-MM-DD",
    modelLabels: [/(?:linia\s+pojazdu|vehicle\s+line|линия\s+автомобиля|model\s+range|gama\s+modelowa|модельный\s+ряд)/i],
    engineSpecificationLabels: [/(?:rodzaj\s+silnika|engine\s+type|тип\s+двигателя)/i],
    engineTypeLabels: [/(?:rodzaj\s+silnika|engine\s+type|тип\s+двигателя)/i],
    engineVolumeLabels: [/(?:rodzaj\s+silnika|engine\s+type|тип\s+двигателя)/i]
  },
  "Ford Pro": {
    dateOrder: "YY-MM-DD",
    modelLabels: [/(?:linia\s+pojazdu|vehicle\s+line|линия\s+автомобиля|model\s+range|gama\s+modelowa|модельный\s+ряд)/i],
    engineSpecificationLabels: [/(?:rodzaj\s+silnika|engine\s+type|тип\s+двигателя)/i],
    engineTypeLabels: [/(?:rodzaj\s+silnika|engine\s+type|тип\s+двигателя)/i],
    engineVolumeLabels: [/(?:rodzaj\s+silnika|engine\s+type|тип\s+двигателя)/i]
  },
  Hyundai: {
    engineEvidenceLabels: [/(?:SPECIAL\s+CAR|HEV|HYBRID|PHEV|MHEV|ELECTRIC\s+VEHICLE)/i]
  },
  Jaguar: jaguarLandRoverProfile,
  Jeep: fcaProfile,
  "Land Rover": jaguarLandRoverProfile,
  Lexus: toyotaLexusProfile,
  "Mercedes-Benz": {
    modelLabels: [/(?:торговое\s+наименование|oznaczenie\s+handlowe|trade\s+designation|commercial\s+designation)/i],
    productionDateLabels: [/(?:дата\s+поставки|data\s+dostawy|delivery\s+date)/i],
    engineEvidenceLabels: [/(?:рабочий\s+объ[её]м|pojemność\s+skokowa|engine\s+(?:capacity|displacement)|двигатель\s+с\s+искровым\s+зажиганием|silnik\s+benzynowy|gasoline\s+engine|pojazd\s+hybrydowy|гибридный\s+автомобиль|hybrid\s+vehicle|plug[\s-]*in|PHEV)/i]
  },
  Mini: {
    modelLabels: [/(?:model|модель)/i],
    engineTypeLabels: [/(?:kod\s+silnika|код\s+двигателя|engine\s+code)/i]
  },
  Mitsubishi: {
    modelLabels: [/(?:средство\s+передвижения|pojazd|vehicle)/i]
  },
  Nissan: {
    productionDateLabels: [/(?:от|od|from)/i],
    engineSpecificationLabels: [/(?:silnik|двигатель|engine)/i],
    engineTypeLabels: [/(?:silnik|двигатель|engine)/i]
  },
  Opel: psaProfile,
  Peugeot: psaProfile,
  Suzuki: {
    engineTypeLabels: [/(?:nr\s+silnika|номер\s+двигателя|engine\s+number)/i]
  },
  Toyota: toyotaLexusProfile,
  Volvo: {
    productionWeekLabels: [/(?:производственная\s+неделя|tydzień\s+produkcji|production\s+week)/i],
    modelLabels: [/(?:model|модель)/i],
    engineSpecificationLabels: [/(?:silnik|двигатель|engine)/i],
    engineTypeLabels: [/(?:silnik|двигатель|engine)/i],
    fuelTypeLabels: [/(?:fuel|paliwo|топливо)/i],
    engineEvidenceLabels: [/(?:ENGINE\s+DENOMINATION|ENGINE\s+VED|PROPULSION\s+TYPE|FUEL|ОБОЗНАЧЕНИЕ\s+ДВИГАТЕЛЯ|ТИП\s+ПРИВОДА|ТОПЛИВО)/i]
  }
};

export function extractPdfVehicleInfo(pdfPath, options = {}) {
  const text = readPdfText(pdfPath);
  return extractVehicleInfoFromText(text, options);
}

export function extractVehicleInfoFromText(text, { brand = "", language = "" } = {}) {
  if (!text) return { model: "", productionDate: "", engineType: "", engineVolume: "" };

  const profile = mergeProfile(brandReportProfiles[brand]);
  const modelRaw = findFirstPdfValue(text, profile.modelLabels);
  const model = normalizeModel(modelRaw, brand);
  const engineSpecificationRaw = findFirstPdfValue(text, profile.engineSpecificationLabels);
  const engineTypeRaw = findFirstPdfValue(text, profile.engineTypeLabels);
  const fuelTypeRaw = findFirstPdfValue(text, profile.fuelTypeLabels);
  const engineCodeRaw = findFirstPdfValue(text, profile.engineCodeLabels);
  const transmissionRaw = stellantisBrands.has(brand) ? findFirstPdfValue(text, stellantisTransmissionLabels) : "";
  const vagPowertrainRaw = vagBrands.has(brand) ? findFirstPdfValue(text, vagPowertrainLabels) : "";
  const engineEvidenceRaw = collectPdfEvidence(text, profile.engineEvidenceLabels);
  const mildHybridRaw = text.match(/\bmhev\b|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd(?:a)?|мягк(?:ий|ая)[\s-]*гибрид/i)?.[0] || "";
  const inferredEngineRaw = inferEngineEvidence(brand, {
    modelRaw,
    engineSpecificationRaw,
    engineTypeRaw,
    fuelTypeRaw,
    engineCodeRaw,
    transmissionRaw,
    vagPowertrainRaw,
    engineEvidenceRaw
  });
  const engineVolumeRaw = findEngineVolumeRaw(text, brand, profile, {
    engineSpecificationRaw,
    engineTypeRaw,
    engineCodeRaw,
    engineEvidenceRaw
  });
  const engineInfo = normalizeEngineInfo({
    engineTypeRaw: [engineTypeRaw, engineSpecificationRaw, transmissionRaw, vagPowertrainRaw, engineEvidenceRaw, inferredEngineRaw].filter(Boolean).join(" "),
    fuelTypeRaw,
    mildHybridRaw,
    engineVolumeRaw
  });

  let productionDate = "";
  if (profile.productionWeekLabels?.length) {
    productionDate = formatProductionWeek(findFirstPdfValue(text, profile.productionWeekLabels));
  } else if (profile.dateFromDam) {
    productionDate = formatDamProductionDate(extractPdfDamCode(text));
  } else {
    productionDate = formatProductionDate(findFirstPdfValue(text, profile.productionDateLabels), language, profile.dateOrder);
  }
  if (brand === "Mercedes-Benz" && productionDate) {
    productionDate = `${productionDate} (дата поставки)`;
  }

  const vagPowertrainEvidence = [modelRaw, engineSpecificationRaw, engineTypeRaw, fuelTypeRaw, vagPowertrainRaw, inferredEngineRaw]
    .filter(Boolean)
    .join(" ");
  const engineType = vagBrands.has(brand) && /\bphev\b|plug[\s-]*in/i.test(vagPowertrainEvidence)
    ? "PHEV"
    : engineInfo.engineType;

  return {
    model,
    productionDate,
    engineType,
    engineVolume: normalizePdfEngineVolume(engineVolumeRaw)
  };
}

export function normalizeEngineInfo(info) {
  const source = [info.fuelTypeRaw, info.engineTypeRaw, info.mildHybridRaw]
    .filter(Boolean)
    .join(" ")
    .replace(/(?:without|bez|без)\s+(?:an?\s+)?(?:electric\s+(?:engine|motor)|silnik(?:a)?\s+elektryczn\w*|электрическ\w*\s+двигател\w*|электродвигател\w*)\s*\(?\s*(?:hybrid|hybryd|гибрид)\s*\)?/giu, " ")
    .toLowerCase();
  const isMildHybrid = /\bmhev\b|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd|мягк(?:ий|ая)[\s-]*гибрид/i.test(source);
  const isPlugInHybrid = /\bphev\b|plug[\s-]*in|hybryd[\s-]*plug[\s-]*in|подключаем\w*\s+гибрид|плагин[\s-]*гибрид/i.test(source);
  const isHybrid = /\bhybrid\b|hybryd|гибрид|\bhev\b/i.test(source);
  const isElectric = /battery\s+electric|\bbev\b|electric\s+(?:engine|motor|vehicle)|silnik\s+elektrycz|pojazd\s+elektrycz|электрическ\w*\s+(?:двигател|автомобил)|электродвигател|электромобил/i.test(source);
  const isDiesel = /diesel|дизел|olej[\s-]*napędowy|wysokopr[eę][żz]?n|\btdci\b|\btdi\b/i.test(source);
  const isGasoline = /gasoline|petrol|benzyn|бензин|искровым\s+зажиганием|\botto\b|\bsi\s+engine\b/i.test(source);
  const baseFuel = isGasoline ? "Бензин" : isDiesel ? "Дизель" : "";

  let engineType = "";
  if (isPlugInHybrid) {
    engineType = baseFuel ? `${baseFuel} + Plug-in Гибрид` : "Plug-in Гибрид";
  } else if (isMildHybrid) {
    engineType = baseFuel ? `${baseFuel} + Мягкий гибрид` : "Мягкий гибрид";
  } else if (isHybrid) {
    engineType = "Обычный гибрид";
  } else if (isElectric) {
    engineType = "Электрический";
  } else {
    engineType = baseFuel;
  }

  return {
    engineType,
    engineVolume: normalizePdfEngineVolume(info.engineVolumeRaw)
  };
}

export function formatProductionDate(value, language = "", dateOrder = "") {
  const raw = String(value || "").replace(/\u00a0/g, " ").replace(/\?\s*г\.?/giu, " ").trim();
  const monthNames = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
    sty: 1, stycznia: 1, lut: 2, lutego: 2, marzec: 3, marca: 3, kwi: 4, kwietnia: 4, maj: 5, maja: 5, cze: 6, czerwca: 6, lip: 7, lipca: 7, sie: 8, sierpnia: 8, wrz: 9, września: 9, wrzesnia: 9, paź: 10, paz: 10, października: 10, pazdziernika: 10, lis: 11, listopada: 11, gru: 12, grudnia: 12,
    янв: 1, января: 1, фев: 2, февраля: 2, мар: 3, марта: 3, апр: 4, апреля: 4, мая: 5, июн: 6, июня: 6, июл: 7, июля: 7, авг: 8, августа: 8, сен: 9, сент: 9, сентября: 9, окт: 10, октября: 10, ноя: 11, нояб: 11, ноября: 11, дек: 12, декабря: 12
  };
  const namedMatch = raw.toLowerCase().match(/(\d{1,2})\s+([\p{L}.]+)\s+(\d{4})/u);
  const monthToken = namedMatch?.[2]?.replace(/\./g, "");
  if (namedMatch && monthNames[monthToken]) {
    return formatDateParts(namedMatch[1], monthNames[monthToken], namedMatch[3]);
  }
  const namedMonthFirstMatch = raw.toLowerCase().match(/([\p{L}.]+)\s+(\d{1,2}),?\s+(\d{4})/u);
  const monthFirstToken = namedMonthFirstMatch?.[1]?.replace(/\./g, "");
  if (namedMonthFirstMatch && monthNames[monthFirstToken]) {
    return formatDateParts(namedMonthFirstMatch[2], monthNames[monthFirstToken], namedMonthFirstMatch[3]);
  }

  const numericMatch = raw.match(/\b(\d{1,4})([.\/-])(\d{1,2})\2(\d{1,4})\b/);
  if (numericMatch) {
    const [, first, delimiter, second, third] = numericMatch;
    if (first.length === 4) return formatDateParts(third, second, first);
    if (third.length === 2) {
      const year = expandShortYear(dateOrder === "YY-MM-DD" && delimiter === "-" ? first : third);
      if (dateOrder === "YY-MM-DD" && delimiter === "-") return formatDateParts(third, second, year);
      if (language === "ENG" && delimiter === "/") return formatDateParts(second, first, year);
      return formatDateParts(first, second, year);
    }
    if (third.length === 4) {
      if (language === "ENG" && delimiter === "/" && Number(first) <= 12) return formatDateParts(second, first, third);
      if (Number(first) <= 12 && Number(second) > 12) return formatDateParts(second, first, third);
      return formatDateParts(first, second, third);
    }
  }

  const monthOnlyMatch = raw.match(/\b(\d{4})[-./](\d{1,2})\b/);
  if (monthOnlyMatch && Number(monthOnlyMatch[2]) >= 1 && Number(monthOnlyMatch[2]) <= 12) {
    return `${String(Number(monthOnlyMatch[2])).padStart(2, "0")}.${monthOnlyMatch[1]}`;
  }
  return "";
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

function findFirstPdfValue(text, patterns = []) {
  for (const labelPattern of patterns) {
    const value = extractPdfValue(text, labelPattern);
    if (value) return value;
  }
  return "";
}

function collectPdfEvidence(text, patterns = []) {
  if (!patterns.length) return "";
  const matches = [];
  for (const line of String(text || "").split(/\r?\n/)) {
    const normalized = line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    if (normalized && patterns.some((pattern) => pattern.test(normalized))) matches.push(normalized);
    if (matches.length === 12) break;
  }
  return matches.join(" ");
}

function normalizeModel(value, brand) {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
  const escapedBrand = String(brand || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withoutBrand = escapedBrand
    ? raw.replace(new RegExp(`^${escapedBrand}(?:\\s+benz)?[\\s-]*`, "i"), "").trim()
    : raw;
  return vagBrands.has(brand) ? normalizeVagModel(withoutBrand) : withoutBrand;
}

function normalizeVagModel(value) {
  const powertrainStart = /\s+(?:(?:гибр(?:ид)?\.?|qu\.)(?=\s|$)|(?:hybrid|hybryd\w*|phev|mhev|bev|electric|электрическ\w*|электромобил\w*|tsi|tdi|tfsi|fsi|diesel|olej\s+napędowy|дизел\w*|бензин\w*)\b|\d+[.,]\d+(?:\s*[lл])?\b)/i;
  const marker = value.search(powertrainStart);
  let model = marker >= 0 ? value.slice(0, marker) : value;
  model = model.replace(/\s+(?!(?:GTI|GTE|RS|FR)$)[A-Z][A-Z0-9]{1,5}$/u, "");
  return model.replace(/[\s,;/-]+$/g, "").trim();
}

function extractPdfValue(text, labelPattern) {
  const source = labelPattern.source.replace(/^\^/, "").replace(/\$$/, "");
  const rowPattern = new RegExp(`^[\\t ]*(?:[A-Z0-9][A-Z0-9./-]{0,8}[\\t ]{2,})?(?:${source})[\\t ]*[:\\-]?[\\t ]+([^\\r\\n]{1,180})$`, "imu");
  const lines = String(text || "").split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].replace(/\u00a0/g, " ");
    const match = line.match(rowPattern);
    if (!match) continue;

    let value = match[1].replace(/\s+/g, " ").trim();
    const valueColumn = line.indexOf(match[1]);
    for (let continuationIndex = index + 1; continuationIndex <= index + 2; continuationIndex += 1) {
      const continuation = lines[continuationIndex] || "";
      const indent = continuation.match(/^\s*/)?.[0]?.length || 0;
      if (!continuation.trim() || indent < Math.max(6, valueColumn - 4)) break;
      value += ` ${continuation.trim().replace(/\s+/g, " ")}`;
    }
    return value;
  }
  return "";
}

function inferEngineEvidence(brand, values) {
  const source = Object.values(values).filter(Boolean).join(" ");
  const upper = source.toUpperCase();

  if (vagBrands.has(brand)) {
    if (/\bPHEV\b|PLUG[\s-]*IN/i.test(upper)) return " gasoline PHEV";
    if (/\bMHEV\b|MILD[\s-]*HYBRID/i.test(upper)) return " MHEV";
    if (/\bE-?TRON\b|ELECTRIC\s+(?:ENGINE|MOTOR|VEHICLE)|ЭЛЕКТРОДВИГАТЕЛ|ЭЛЕКТРОМОБИЛ|SILNIK\s+ELEKTRYCZ/i.test(upper)) return " electric vehicle";
  }

  if (["Alfa Romeo", "Fiat", "Jeep"].includes(brand)) {
    const fuel = /\bCMB\s+DS\b|^DS\b|DIESEL|ДИЗЕЛ/i.test(source) ? " diesel" : /\bCMB\s+BE\b|^BE\b|BENZIN|БЕНЗИН/i.test(source) ? " gasoline" : "";
    const hybrid = /\bPHEV\b/i.test(source) ? " PHEV" : /\bMHEV\b/i.test(source) ? " MHEV" : "";
    return `${fuel}${hybrid}`;
  }

  if (["BMW", "Mini"].includes(brand)) {
    if (/\b(?:I3|I4|I5|I7|IX\d*|COOPER\s+SE|ELECTRIC)\b/i.test(source)) return " electric vehicle";
    if (/\bI8\b|\b\d{2}E\b/i.test(source)) return " gasoline PHEV";
    if (/\b(?:B37|B47|B57|N47|N57|M47|M57|\d{2}D)\w*/i.test(source)) return " diesel";
    if (/\b(?:B38|B48|B58|N1[236]|N2[046]|N5[245]|N6[234]|N74|\d{2}I)\w*/i.test(source)) return " gasoline";
  }

  if (["Ford", "Ford Pro"].includes(brand)) {
    if (/\bEcoBlue\b|\bTDCi\b/i.test(source)) return " diesel";
    if (/\bEcoBoost\b/i.test(source)) return " gasoline";
  }

  if (["Toyota", "Lexus"].includes(brand)) {
    if (/\b[A-Z0-9-]*(?:FXE|FXS)\b/i.test(upper)) return " hybrid";
    if (/\b(?:1ND|[12]GD|1KD|2KD|1VD)[A-Z0-9-]*\b/i.test(upper)) return " diesel";
    if (/\bEFI\b|\b(?:FE|FSE|FAE)\b/i.test(upper)) return " gasoline";
  }

  if (brand === "Nissan") {
    if (/\b(?:K9K|R9M|M9R|YD25|YD22)\b/i.test(upper)) return " diesel";
    if (/\b(?:EM47|EM57|EM61)\b|ELECTRIC/i.test(upper)) return " electric vehicle";
    if (/\b(?:HR|MR|H5F|HRA|KR15)\w*/i.test(upper)) return " gasoline";
  }

  if (brand === "Suzuki") {
    if (/\b(?:D13A|D16A|Z13DT)\b/i.test(upper)) return " diesel";
    if (/\b(?:K\d{2}[A-Z]|M\d{2}[A-Z]|J\d{2}[A-Z])\b/i.test(upper)) return " gasoline";
  }

  if (brand === "Volvo") {
    if (/\bD\d{3,4}T\d+\b|\bENGINE\s+D\d\b|\bFUEL\s+DIESEL\b/i.test(upper)) return " diesel";
    if (/\bB\d{3,4}T\d+\b|\bENGINE\s+B\d\b|\bFUEL\s+(?:PETROL|GASOLINE)\b/i.test(upper)) return " gasoline";
  }

  return "";
}

function findEngineVolumeRaw(text, brand, profile, values) {
  const labeledValue = findFirstPdfValue(text, profile.engineVolumeLabels);
  if (normalizePdfEngineVolume(labeledValue)) return labeledValue;
  if (normalizePdfEngineVolume(values.engineSpecificationRaw)) return values.engineSpecificationRaw;
  if (normalizePdfEngineVolume(values.engineTypeRaw)) return values.engineTypeRaw;
  if (normalizePdfEngineVolume(values.engineEvidenceRaw)) return values.engineEvidenceRaw;

  if (brand === "Nissan") {
    const code = `${values.engineTypeRaw} ${values.engineCodeRaw}`.toUpperCase();
    const capacities = { K9K: 1461, R9M: 1598, M9R: 1995, YD25: 2488, YD22: 2184 };
    const match = Object.keys(capacities).find((engineCode) => code.includes(engineCode));
    if (match) return `${capacities[match]} cm3`;
  }

  if (["Ford", "Ford Pro"].includes(brand)) {
    const capacity = String(values.engineTypeRaw || values.engineSpecificationRaw).match(/^(\d+(?:[.,]\d+)?)/);
    if (capacity) return `${capacity[1]} L`;
  }

  if (brand === "Volvo") {
    const volvoEngine = String(text).match(/^\s*[A-Z0-9]{4}\s+ENGINE[^\r\n]*?\b(\d+(?:[.,]\d+)?)\s*L\b/im);
    if (volvoEngine) return `${volvoEngine[1]} L`;
  }

  return "";
}

function normalizePdfEngineVolume(value) {
  const raw = String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  const cubicMatch = raw.match(/(\d[\d\s]*)\s*(?:cm3|cm³|см3|см³|ccm|cc)\b/i);
  if (cubicMatch) return `${cubicMatch[1].replace(/\s/g, "")} cm3`;
  const literMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:l|л|litr(?:e|es|a|ów)?|литр(?:а|ов)?)(?=$|[^\p{L}\d])/iu);
  if (literMatch) return `${literMatch[1]} л`;
  const codedLiterMatch = raw.match(/^(\d+(?:[.,]\d+)?)\b.*(?:ENGINE\s+DISPLACEMENT|ЛОШАДИНАЯ\s+СИЛА\s*\(КОММЕРЧЕСКАЯ\)|POJEMNOŚĆ\s+SKOKOWA|РАБОЧИЙ\s+ОБЪ[ЕЁ]М)/i);
  if (codedLiterMatch) return `${codedLiterMatch[1]} л`;
  return /^\d+(?:[.,]\d+)?$/.test(raw) ? `${raw} л` : "";
}

function extractPdfDamCode(text) {
  const damMatch = String(text || "").match(/(?:^|\n)\s*(?:DAM|OPR|ORGA)\s+(\d{5})[A-Z0-9]*\b/i);
  const code = damMatch?.[1] || "";
  return code === "00000" ? "" : code;
}

function formatDamProductionDate(damCode) {
  const dayOffset = Number(String(damCode || "").trim());
  if (!Number.isInteger(dayOffset) || dayOffset <= 0 || dayOffset > 99999) return "";
  const date = new Date(Date.UTC(1976, 10, 7) + dayOffset * 24 * 60 * 60 * 1000);
  return `${String(date.getUTCDate()).padStart(2, "0")}.${String(date.getUTCMonth() + 1).padStart(2, "0")}.${date.getUTCFullYear()}`;
}

function formatProductionWeek(value) {
  const match = String(value || "").match(/\b(19\d{2}|20\d{2})(\d{2})\b/);
  if (!match) return "";
  const week = Number(match[2]);
  if (week < 1 || week > 53) return "";
  return `${String(week).padStart(2, "0")} неделя ${match[1]} года`;
}

function expandShortYear(value) {
  const year = Number(value);
  return year >= 70 ? 1900 + year : 2000 + year;
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
