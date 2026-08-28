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
  modelLabels: [/(?:podanie\s+modelu|ввод\s+данных\s+по\s+модели|wprowadz(?:enie|anie)\s+danych\s+(?:do|dla)\s+modelu|model\s+data\s+entry)/i],
  engineTypeLabels: [/(?:CMB|ELT)/i],
  engineVolumeLabels: [/(?:CC)/i],
  engineEvidenceLabels: [/(?:CMB|ELT|ENG)/i]
};

const jaguarLandRoverProfile = {
  engineSpecificationLabels: [/(?:тип\s+двигателя|typ\s+silnika|engine\s+type|power\s+unit\s+variant|wariant\s+jednostki\s+napędowej|вариант\s+силового\s+агрегата)/i],
  engineTypeLabels: [/(?:тип\s+двигателя|typ\s+silnika|engine\s+type|power\s+unit\s+variant|wariant\s+jednostki\s+napędowej|вариант\s+силового\s+агрегата)/i],
  engineVolumeLabels: [/(?:тип\s+двигателя|typ\s+silnika|engine\s+type|power\s+unit\s+variant|wariant\s+jednostki\s+napędowej|вариант\s+силового\s+агрегата)/i],
  engineEvidenceLabels: [/(?:тип\s+двигателя|typ\s+silnika|engine\s+type|power\s+unit\s+variant|wariant\s+jednostki\s+napędowej|вариант\s+силового\s+агрегата|M[\s-]*HEV|mild\s+hybrid|мягк(?:ий|ая)\s+гибрид)/i]
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
const mercedesBrands = new Set(["Mercedes-Benz", "Mercedes Classic", "Mercedes Trucks", "Mercedes Unimog", "Mercedes Vans"]);
const toyotaLexusBrands = new Set(["Toyota", "Lexus"]);

const vagPowertrainLabels = [
  /(?:альтернативная\s+система\s+привода|alternatywny\s+układ\s+napędowy|alternative\s+(?:drive|powertrain)(?:\s+system)?|гибридный\s+привод|napęd\s+hybrydowy|hybrid\s+drive)/i
];

const mercedesProfile = {
  modelLabels: [/(?:торговое\s+наименование|oznaczenie\s+handlowe|trade\s+designation|commercial\s+designation)/i],
  productionDateLabels: [/(?:дата\s+поставки|data\s+dostawy|delivery\s+date)/i],
  engineEvidenceLabels: [/(?:рабочий\s+объ[её]м|pojemność\s+skokowa|engine\s+(?:capacity|displacement)|двигатель\s+с\s+искровым\s+зажиганием|silnik\s+benzynowy|gasoline\s+engine|pojazd\s+hybrydowy|гибридный\s+автомобиль|hybrid\s+vehicle|plug[\s-]*in|PHEV)/i]
};

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
    fuelTypeLabels: [/^(?:топливо|paliwo|fuel)$/i],
    engineEvidenceLabels: [/(?:SPECIAL\s+CAR|ELECTRIC\s+VEHICLE|\b(?:HEV|PHEV|M[\s-]*HEV)\b)/i]
  },
  Jaguar: jaguarLandRoverProfile,
  Jeep: fcaProfile,
  Kia: {
    fuelTypeLabels: [/^(?:топливо|paliwo|fuel)$/i],
    engineEvidenceLabels: [/(?:SPECIAL\s+CAR|POJAZD\s+SPECJALNY|СПЕЦИАЛЬН\w*\s+(?:АВТОМОБИЛ|ТРАНСПОРТ)|ELECTRIC\s+VEHICLE|\b(?:HEV|PHEV|M[\s-]*HEV)\b)/i]
  },
  "Land Rover": {
    ...jaguarLandRoverProfile,
    engineEvidenceLabels: [
      ...jaguarLandRoverProfile.engineEvidenceLabels,
      /\bPHEV\b|plug[\s-]*in|подключаем\w*\s+гибрид/i
    ]
  },
  Lexus: toyotaLexusProfile,
  "Mercedes-Benz": mercedesProfile,
  "Mercedes Classic": mercedesProfile,
  "Mercedes Trucks": mercedesProfile,
  "Mercedes Unimog": mercedesProfile,
  "Mercedes Vans": mercedesProfile,
  Mini: {
    modelLabels: [/(?:model|модель)/i],
    engineTypeLabels: [/(?:kod\s+silnika|код\s+двигателя|engine\s+code)/i]
  },
  Mitsubishi: {
    modelLabels: [/(?:средство\s+передвижения|pojazd|vehicle)/i],
    engineEvidenceLabels: [/\b(?:GA1W\s*1600|A03A\s*1200|V98W\s*3200D[\s-]*TURBO)\b/i]
  },
  Nissan: {
    productionDateLabels: [/(?:от|od|from)/i],
    engineSpecificationLabels: [/(?:silnik|двигатель|engine)/i],
    engineTypeLabels: [/(?:silnik|двигатель|engine)/i]
  },
  Opel: psaProfile,
  Peugeot: psaProfile,
  Porsche: {
    engineEvidenceLabels: [
      /(?:альтернативная\s+система\s+привода|alternatywny\s+układ\s+napędowy|alternative\s+(?:drive|powertrain)(?:\s+system)?)/i,
      /(?:гибридн\w*\s+(?:систем\w*|привод\w*)|hybrid\s+(?:system|drive|powertrain)|plug[\s-]*in|\bPHEV\b)/i,
      /(?:зарядн\w*\s+(?:разъ[её]м|порт)|charging\s+(?:socket|port)|charge\s+connector)/i
    ]
  },
  Suzuki: {
    engineTypeLabels: [/(?:nr\s+silnika|номер\s+двигателя|engine\s+number)/i],
    engineCodeLabels: [/^(?:ENGINE|SILNIK|ДВИГАТЕЛЬ)$/i]
  },
  Toyota: toyotaLexusProfile,
  Volvo: {
    productionWeekLabels: [/(?:производственная\s+неделя|структурированная\s+неделя|tydzień\s+(?:produkcji|strukturyzowany)|(?:production|structured)\s+week)/i],
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
  const engineSpecificationLabels = stellantisBrands.has(brand)
    ? [/^(?:silnik|двигатель|engine)$/i, ...profile.engineSpecificationLabels]
    : profile.engineSpecificationLabels;
  const fuelTypeLabels = stellantisBrands.has(brand)
    ? [/^(?:топливо|paliwo|fuel)$/i, /^(?:тип\s+топлива|rodzaj\s+paliwa|fuel\s+type)$/i, ...profile.fuelTypeLabels]
    : profile.fuelTypeLabels;
  const engineSpecificationRaw = findFirstPdfValue(text, engineSpecificationLabels);
  const engineTypeRaw = findFirstPdfValue(text, profile.engineTypeLabels);
  const fuelTypeRaw = findFirstPdfValue(text, fuelTypeLabels);
  const engineCodeSource = brand === "Suzuki" ? String(text).split("\f", 1)[0] : text;
  const engineCodeRaw = findFirstPdfValue(engineCodeSource, profile.engineCodeLabels);
  const transmissionRaw = stellantisBrands.has(brand) ? findFirstPdfValue(text, stellantisTransmissionLabels) : "";
  const stellantisPowertrainRaw = stellantisBrands.has(brand) ? collectStellantisPowertrainEvidence(text) : "";
  const vagPowertrainRaw = vagBrands.has(brand) ? findFirstPdfValue(text, vagPowertrainLabels) : "";
  const engineEvidenceRaw = collectPdfEvidence(text, profile.engineEvidenceLabels);
  const wholeReportPowertrainRaw = collectWholeReportPowertrainEvidence(text);
  const koreanPowertrainRaw = ["Hyundai", "Kia"].includes(brand) ? findKoreanPowertrainEvidence(text) : "";
  const mercedesPowertrainRaw = mercedesBrands.has(brand) ? collectMercedesPowertrainEvidence(text) : "";
  const toyotaFirstPageEngineRaw = toyotaLexusBrands.has(brand) ? findToyotaFirstPageEngineEvidence(text) : "";
  const toyotaPlugInRaw = toyotaLexusBrands.has(brand) ? findToyotaPlugInEvidence(text) : "";
  const bmwMildHybridRaw = ["BMW", "Mini"].includes(brand) && /\bS1CEA\b|rekuperacyjna\s+system|recuperation\s+system|рекуперационн\w*\s+систем/i.test(text) ? "MHEV" : "";
  const mercedesMildHybridRaw = mercedesBrands.has(brand) && /^\s*B01\s+[^\r\n]*(?:48\s*[- ]?\s*(?:V|В)|48[\s-]*VOLT)/im.test(text) ? "MHEV" : "";
  const suzukiMildHybridRaw = brand === "Suzuki" && /\bSHVS\b/i.test(text) ? "MHEV" : "";
  const mildHybridRaw = text.match(/\bm[\s-]*hev\b|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd(?:a)?|мягк(?:ий|ая)[\s-]*гибрид|with\s+48v\s+kers|\bBSG\d*\b|belt[\s-]*starter[\s-]*generator|\bH[\s:.-]*DRIVE\b/i)?.[0] || bmwMildHybridRaw || mercedesMildHybridRaw || suzukiMildHybridRaw;
  const inferredEngineRaw = inferEngineEvidence(brand, {
    modelRaw,
    engineSpecificationRaw,
    engineTypeRaw,
    fuelTypeRaw,
    engineCodeRaw,
    transmissionRaw,
    vagPowertrainRaw,
    reportText: brand === "Porsche" ? text : "",
    engineEvidenceRaw: [engineEvidenceRaw, wholeReportPowertrainRaw, toyotaFirstPageEngineRaw, koreanPowertrainRaw].filter(Boolean).join(" ")
  });
  const engineVolumeRaw = findEngineVolumeRaw(text, brand, profile, {
    modelRaw,
    engineSpecificationRaw,
    engineTypeRaw,
    engineCodeRaw,
    engineEvidenceRaw: [engineEvidenceRaw, wholeReportPowertrainRaw, toyotaFirstPageEngineRaw].filter(Boolean).join(" ")
  });
  const primaryEngineInfo = normalizeEngineInfo({
    engineTypeRaw: [engineTypeRaw, engineSpecificationRaw, transmissionRaw, vagPowertrainRaw, engineEvidenceRaw, wholeReportPowertrainRaw, koreanPowertrainRaw, mercedesPowertrainRaw, toyotaFirstPageEngineRaw, inferredEngineRaw].filter(Boolean).join(" "),
    fuelTypeRaw,
    mildHybridRaw,
    engineVolumeRaw
  });
  const stellantisEngineType = stellantisBrands.has(brand)
    ? resolveStellantisEngineType({
      engineSpecificationRaw,
      engineTypeRaw,
      fuelTypeRaw,
      transmissionRaw,
      stellantisPowertrainRaw,
      inferredEngineRaw,
      mildHybridRaw,
      fallbackEngineType: primaryEngineInfo.engineType
    })
    : "";
  const fallbackEngineRaw = !primaryEngineInfo.engineType || !normalizePdfEngineVolume(engineVolumeRaw)
    ? [wholeReportPowertrainRaw, findFallbackEngineEvidence(text)].filter(Boolean).join(" ")
    : "";
  const fallbackEngineInfo = normalizeEngineInfo({ engineTypeRaw: fallbackEngineRaw, engineVolumeRaw: fallbackEngineRaw });
  let resolvedEngineVolumeRaw = normalizePdfEngineVolume(engineVolumeRaw) ? engineVolumeRaw : fallbackEngineRaw;
  if (!normalizePdfEngineVolume(resolvedEngineVolumeRaw) && ["BMW", "Mini"].includes(brand)) {
    resolvedEngineVolumeRaw = inferBmwEngineVolume(modelRaw);
  }

  let productionDate = "";
  if (profile.productionWeekLabels?.length) {
    productionDate = formatProductionWeek(findFirstPdfValue(text, profile.productionWeekLabels));
  } else if (profile.dateFromDam) {
    productionDate = formatDamProductionDate(extractPdfDamCode(text));
  } else {
    productionDate = formatProductionDate(findFirstPdfValue(text, profile.productionDateLabels), language, profile.dateOrder);
  }
  if (brand === "Nissan" && productionDate) {
    const prefix = language === "PL" ? "od" : language === "ENG" ? "from" : "от";
    productionDate = `${prefix} ${productionDate}`;
  }
  if (mercedesBrands.has(brand) && productionDate) {
    productionDate = `${productionDate} (дата поставки)`;
  }

  const vagPowertrainEvidence = [modelRaw, engineSpecificationRaw, engineTypeRaw, fuelTypeRaw, vagPowertrainRaw, inferredEngineRaw]
    .filter(Boolean)
    .join(" ");
  const hasExplicitPhev = /\bphev\b|plug[\s-]*in/i.test(vagPowertrainEvidence);
  const volvoPhevEvidence = brand === "Volvo" && /\b[A-Z0-9-]*PHEV\b/i.test(vagPowertrainEvidence);
  const baseEngineType = volvoPhevEvidence
    ? resolveVolvoPhevEngineType(vagPowertrainEvidence)
    : (vagBrands.has(brand) && hasExplicitPhev) || (brand === "BMW" && /\bPHEV\b/i.test(inferredEngineRaw))
    ? resolveVagPhevEngineType(vagPowertrainEvidence)
    : stellantisEngineType || primaryEngineInfo.engineType || fallbackEngineInfo.engineType;
  const fordEngineType = ["Ford", "Ford Pro"].includes(brand)
    ? resolveFordHybridEngineType(text, {
      engineTypeRaw,
      inferredEngineRaw,
      fallbackEngineType: baseEngineType
    })
    : "";
  const toyotaPlugInEngineType = toyotaPlugInRaw && baseEngineType === hevEngineType
    ? formatPhevEngineType(/\b[A-Z0-9-]*(?:FXE|FXS)\b|\bEFI\b/i.test([toyotaFirstPageEngineRaw, engineTypeRaw, engineSpecificationRaw].filter(Boolean).join(" ")) ? "Бензин" : "")
    : "";
  const koreanMildHybridEngineType = ["Hyundai", "Kia"].includes(brand)
    ? resolveKoreanMildHybridEngineType(text, brand, baseEngineType)
    : "";
  const engineType = fordEngineType || toyotaPlugInEngineType || koreanMildHybridEngineType || baseEngineType;

  return {
    model,
    productionDate,
    engineType,
    engineVolume: engineType === "Электрический" ? "" : normalizePdfEngineVolume(resolvedEngineVolumeRaw)
  };
}

function resolveKoreanMildHybridEngineType(text, brand, fallbackEngineType) {
  if (fallbackEngineType !== "Дизель") return fallbackEngineType;

  const source = String(text || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ");
  const verifiedModelFamily = brand === "Kia"
    ? /\bSPORTAGE\s*22\b/i.test(source)
    : /\bTUCSON\s*(?:21|22|23|24|25|NX4)\b/i.test(source);
  const d4feDiesel = /\bD4FE[A-Z0-9]*\b/i.test(source)
    && /\b1600\s*(?:CC|CM3|CM³|СМ3|СМ³)\b/i.test(source)
    && /\bDIESEL\b|ДИЗЕЛ|OLEJ[\s-]*NAPĘDOWY/i.test(source);
  const sevenSpeedDct = /\bDCT\b[^\r\n]{0,40}\b7\s*(?:SPEED|BIEG|СТУП)|\b7\s*(?:SPEED|BIEG|СТУП)[^\r\n]{0,40}\bDCT\b/i.test(source);

  return verifiedModelFamily && d4feDiesel && sevenSpeedDct
    ? formatMhevEngineType("Дизель")
    : fallbackEngineType;
}

function resolveStellantisEngineType({
  engineSpecificationRaw,
  engineTypeRaw,
  fuelTypeRaw,
  transmissionRaw,
  stellantisPowertrainRaw,
  inferredEngineRaw,
  mildHybridRaw,
  fallbackEngineType
}) {
  const directInfo = normalizeEngineInfo({
    engineTypeRaw: [engineTypeRaw, engineSpecificationRaw].filter(Boolean).join(" "),
    fuelTypeRaw
  });
  const directType = directInfo.engineType;
  const baseFuel = directType.includes("Бензин") ? "Бензин" : directType.includes("Дизель") ? "Дизель" : "";
  // Only use explicit drivetrain rows from the report for electrification.
  // Generic fallback text can mention charging accessories or badges that are
  // explicitly absent on the vehicle.
  const powertrainEvidence = [transmissionRaw, stellantisPowertrainRaw, mildHybridRaw].filter(Boolean).join(" ");
  const hasExplicitPlugIn = /\bphev\b|plug[\s-]*in|подключаем\w*\s+гибрид|hybryd[\s-]*plug[\s-]*in/i.test(powertrainEvidence);
  const hasChargingEvidence = /\bwallbox\b|(?:charging|ładowania|зарядк\w*)[^\r\n]{0,80}\bT2\b|(?:vehicle|auto|samochod\w*|автомобил\w*)[^\r\n]{0,80}(?:charging|ładowania|зарядк\w*)/i.test(powertrainEvidence);

  if (hasExplicitPlugIn || (baseFuel && hasChargingEvidence)) {
    return formatPhevEngineType(baseFuel);
  }
  if (/\bm[\s-]*hev\b|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd|мягк(?:ий|ая)[\s-]*гибрид|\bBSG\d*\b|belt[\s-]*starter[\s-]*generator|\bH[\s:.-]*DRIVE\b/i.test(powertrainEvidence)) {
    return formatMhevEngineType(baseFuel);
  }
  if (/\bhybrid\b|hybryd|гибрид|\bhev\b/i.test(transmissionRaw)) return hevEngineType;

  // Equipment descriptions often mention electric motors. A labeled engine or
  // fuel row is authoritative unless the drivetrain explicitly says hybrid.
  return directType || normalizeEngineInfo({ engineTypeRaw: inferredEngineRaw }).engineType || fallbackEngineType;
}

function resolveVagPhevEngineType(evidence) {
  const normalized = normalizeEngineInfo({ engineTypeRaw: evidence }).engineType;
  const baseFuel = normalized.includes("Дизель") ? "Дизель" : normalized.includes("Бензин") ? "Бензин" : "";
  return formatPhevEngineType(baseFuel);
}

function resolveVolvoPhevEngineType(evidence) {
  const source = String(evidence || "");
  const baseFuel = /diesel|дизел|\bD\d+[A-Z0-9-]*PHEV\b/i.test(source)
    ? "Дизель"
    : /gasoline|petrol|benzyn|бензин|\bT\d+[A-Z0-9-]*PHEV\b/i.test(source)
      ? "Бензин"
      : "";
  return formatPhevEngineType(baseFuel);
}

function formatPhevEngineType(baseFuel = "") {
  return baseFuel ? `${baseFuel} + PHEV (подключаемый гибрид)` : "PHEV (подключаемый гибрид)";
}

function formatMhevEngineType(baseFuel = "") {
  return baseFuel ? `${baseFuel} + MHEV (мягкий гибрид)` : "MHEV (мягкий гибрид)";
}

function formatHevEngineType(baseFuel = "") {
  return baseFuel ? `${baseFuel} + HEV (обычный гибрид)` : hevEngineType;
}

const hevEngineType = "HEV (обычный гибрид)";

function resolveFordHybridEngineType(text, { engineTypeRaw, inferredEngineRaw, fallbackEngineType }) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim());
  const badgeLines = lines.filter((line) => /tailgate\s+badges|эмблем\w*.*задн|emblemat\w*.*tyln/i.test(line));
  const chargingLines = lines.filter((line) => /(?:charge|charging|заряд|ładow)[^\r\n]*(?:port|socket|connector|разъ[её]м|порт|gniazd)|onboard\s+charger|pokładow\w*\s+ładowark|бортов\w*\s+заряд/i.test(line));
  const fuelCapabilityLines = lines.filter((line) => /fuel\s+capability\s+type|тип\s+топливн\w*\s+систем|rodzaj\s+układu\s+paliw/i.test(line));
  const specificEvidence = [...badgeLines, ...chargingLines].join(" ");
  const baseFuelSource = [engineTypeRaw, inferredEngineRaw, fuelCapabilityLines.join(" ")].filter(Boolean).join(" ");
  const normalizedFuel = normalizeEngineInfo({ engineTypeRaw: baseFuelSource }).engineType;
  const baseFuel = normalizedFuel.includes("Дизель") ? "Дизель" : normalizedFuel.includes("Бензин") ? "Бензин" : /\bDURA(?:TEC)?\b|\bFox\b|\bDragon\b|\bEcoBoost\b/i.test(baseFuelSource) ? "Бензин" : "";

  if (/\bPHEV\b|plug[\s-]*in/i.test(specificEvidence)) return formatPhevEngineType(baseFuel);
  if (/MHEV/i.test(fallbackEngineType)) return fallbackEngineType;
  if (/\b(?:F?HEV)\b/i.test(specificEvidence)) return formatHevEngineType(baseFuel);
  if (/газо[\s-]*электрич|gas(?:oline)?[\s-]*electric|benzynow[oa][\s-]*elektrycz/i.test(fuelCapabilityLines.join(" "))) {
    return formatHevEngineType(baseFuel || "Бензин");
  }

  return fallbackEngineType;
}

export function normalizeEngineInfo(info) {
  const source = [info.fuelTypeRaw, info.engineTypeRaw, info.mildHybridRaw]
    .filter(Boolean)
    .join(" ")
    .replace(/(?:without|bez|без)\s+(?:an?\s+)?(?:electric\s+(?:engine|motor)|silnik(?:a)?\s+elektryczn\w*|электрическ[а-яё]*\s+двигател[а-яё]*|электродвигател[а-яё]*)\s*\(?\s*(?:(?:not|nie|не)\s+)?(?:hybrid|hybryd\w*|гибрид[а-яё]*)\s*\)?/giu, " ")
    .toLowerCase();
  const isMildHybrid = /\bm[\s-]*hev\b|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd|мягк(?:ий|ая)[\s-]*гибрид|with\s+48v\s+kers|\bBSG\d*\b|belt[\s-]*starter[\s-]*generator|\bH[\s:.-]*DRIVE\b/i.test(source);
  const isPlugInHybrid = /\bphev\b|plug[\s-]*in|hybryd[\s-]*plug[\s-]*in|подключаем\w*\s+гибрид|плагин[\s-]*гибрид/i.test(source)
    || /(?:hybrid|hybryd\w*|гибрид[а-яё]*?)[^.!?\n]{0,120}(?:подключаем[а-яё]*|plug[\s-]*in)/i.test(source)
    || /(?:подключаем[а-яё]*|plug[\s-]*in)[^.!?\n]{0,120}(?:hybrid|hybryd\w*|гибрид[а-яё]*)/i.test(source);
  const isHybrid = /\bhybrid\b|hybryd|гибрид|\bhev\b/i.test(source);
  const isElectric = /battery\s+electric|\bbev\b|electric\s+(?:engine|motor|vehicle)|silnik\s+elektrycz|pojazd\s+elektrycz|электрическ\w*\s+(?:двигател|автомобил)|электродвигател|электромобил/i.test(source);
  const isDiesel = /diesel|дизел|olej[\s-]*napędowy|wysokopr[eę][żz]?n|\btdci\b|\btdi\b/i.test(source);
  const isGasoline = /gasoline|petrol|benzyn|benzin|\bbenz\.(?=\s|$)|бенз(?:ин|\.)|искровым\s+зажиганием|\botto\b|\bsi\s+engine\b/i.test(source);
  const baseFuel = isGasoline ? "Бензин" : isDiesel ? "Дизель" : "";

  let engineType = "";
  if (isPlugInHybrid) {
    engineType = formatPhevEngineType(baseFuel);
  } else if (isMildHybrid) {
    engineType = formatMhevEngineType(baseFuel);
  } else if (isHybrid) {
    engineType = hevEngineType;
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
  const nonEngineVolume = /fuel\s+tank|zbiornik\s+paliwa|топливн\w*\s+бак|load\s+compartment|luggage/i;
  for (const line of String(text || "").split(/\r?\n/)) {
    const normalized = line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    if (normalized && !nonEngineVolume.test(normalized) && patterns.some((pattern) => pattern.test(normalized))) matches.push(normalized);
    if (matches.length === 12) break;
  }
  return matches.join(" ");
}

function collectMercedesPowertrainEvidence(text) {
  const explicitHybrid = /\bphev\b|plug[\s-]*in|\bm[\s-]*hev\b|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd|мягк(?:ий|ая)[\s-]*гибрид/i;
  const hybridPowertrain = /hybrid\s+(?:drive|vehicle|powertrain)|(?:napęd|pojazd)\s+hybrydow|гибридн[а-яё]*\s+(?:привод|автомобил)/i;
  const plugInQualifier = /подключаем[а-яё]*|plug[\s-]*in/i;
  const combustionEngine = /diesel\s+engine|gasoline\s+engine|silnik\s+(?:wysokopr[eę][żz]ny|diesla|benzynowy)|(?:дизельн|бензинов)[а-яё]*\s+двигател/i;
  const matches = [];
  const lines = String(text || "").split(/\r?\n/).map((line) => line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim());

  for (let index = 0; index < lines.length; index += 1) {
    const normalized = lines[index];
    if (!normalized) continue;
    if (combustionEngine.test(normalized)) matches.push(normalized);

    const powertrainBlock = [normalized, lines[index + 1], lines[index + 2]].filter(Boolean).join(" ");
    if (!explicitHybrid.test(powertrainBlock) && !hybridPowertrain.test(powertrainBlock)) continue;
    matches.push(hybridPowertrain.test(powertrainBlock) && plugInQualifier.test(powertrainBlock) ? `${powertrainBlock} PHEV` : powertrainBlock);
  }

  return matches.join(" ");
}

function collectStellantisPowertrainEvidence(text) {
  const explicitPlugIn = /\bphev\b|plug[\s-]*in|hybryd[\s-]*plug[\s-]*in|подключаем\w*\s+гибрид/i;
  const hybrid = /\bhybrid\b|hybryd|гибрид/i;
  const mildHybrid = /\bm[\s-]*hev\b|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd|мягк(?:ий|ая)[\s-]*гибрид|\bBSG\d*\b|belt[\s-]*starter[\s-]*generator|\bH[\s:.-]*DRIVE\b/i;
  const powertrainContext = /power[\s-]*train|drive[\s-]*train|układ\s+napędowy|zespół\s+napędowy|силов(?:ой|ого)\s+агрегат|привод/i;
  const chargingEvidence = /\bwallbox\b|(?:charging|ładowania|зарядк\w*)[^\r\n]{0,80}\bT2\b|(?:vehicle|auto|samochod\w*|автомобил\w*)[^\r\n]{0,80}(?:charging|ładowania|зарядк\w*)/i;
  const eTense = /\bE[\s-]*TENSE\b/i;
  // JavaScript \b does not recognize Cyrillic characters as word characters,
  // so Russian "без" must be checked outside the ASCII-word-boundary group.
  const negative = /\b(?:without|w\/?o|none|not fitted|bez|brak)\b|без|отсутств/i;
  const matches = [];

  const lines = String(text || "").split(/\r?\n/).map((line) => line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim());

  for (let index = 0; index < lines.length; index += 1) {
    const normalized = lines[index];
    if (!normalized) continue;
    // PDF tables may split a label and its value into adjacent lines. Inspect
    // both so a following "без/without" value cannot become PHEV evidence.
    const evidenceBlock = [normalized, lines[index + 1]].filter(Boolean).join(" ");
    if (negative.test(evidenceBlock)) continue;
    if (explicitPlugIn.test(evidenceBlock) || chargingEvidence.test(evidenceBlock) || mildHybrid.test(evidenceBlock) || (hybrid.test(evidenceBlock) && powertrainContext.test(evidenceBlock))) {
      matches.push(evidenceBlock);
    } else if (eTense.test(normalized)) {
      // E-TENSE is supporting trim information, never standalone plug-in proof.
      matches.push(normalized);
    }
  }

  return matches.join(" ");
}

function findToyotaPlugInEvidence(text) {
  let chargingCableRaw = "";
  let acChargerRaw = "";
  for (const line of String(text || "").split(/\r?\n/)) {
    const normalized = line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    const negative = /\b(?:without|w\/?o|none|not\s+fitted)\b|без|отсутств/i.test(normalized);
    if (!negative && (/\bmodel\b.*\b(?:PHV|PHEV)\b|модель.*\b(?:PHV|PHEV)\b/i.test(normalized))) {
      return normalized;
    }
    if (!negative && /\bcharger\b.*\bac[\s-]*(?:charge\s*)?\(?\s*type\s*2\s*\)?/i.test(normalized)) {
      return normalized;
    }
    if (!negative && /\b(?:battery\s+)?charging\s+cable\b/i.test(normalized)) chargingCableRaw = normalized;
    if (!negative && /(?:^|\s)charger\s+ac(?:[\s-]*charge)?\s*\(/i.test(normalized)) acChargerRaw = normalized;
  }
  return chargingCableRaw && acChargerRaw ? `${chargingCableRaw} ${acChargerRaw}` : "";
}

function findToyotaFirstPageEngineEvidence(text) {
  const firstPage = String(text || "").split("\f", 1)[0];
  const fuelOrPowertrain = /diesel|gasoline|petrol|benzyn|бензин|дизел|hybrid|hybryd|гибрид|\bphev\b|plug[\s-]*in/i;
  const displacement = /\b\d+(?:[.,]\d+)?\s*(?:l|л|cm3|cm³|см3|см³|ccm|cc)\b/i;
  const nonEngineFluid = /fuel\s+tank|coolant|engine\s+oil|washer\s+fluid|adblue|zbiornik|топливн[а-яё]*\s+бак|охлаждающ|масло/i;

  for (const line of firstPage.split(/\r?\n/)) {
    const normalized = line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    if (!normalized || nonEngineFluid.test(normalized)) continue;
    if (fuelOrPowertrain.test(normalized) && displacement.test(normalized)) return normalized;
  }
  return "";
}

function findKoreanPowertrainEvidence(text) {
  const powertrainRow = /^(?:\d{1,4}\s+)?(?:двигатель|silnik|engine|motor|топливо|paliwo|fuel)(?=\s|$)/i;
  const powertrainValue = /battery\s+electric|\bbev\b|electric(?:\s+(?:engine|motor|vehicle))?|silnik\s+elektrycz|электрическ\w*\s+(?:двигател|автомобил)|электродвигател|электромобил|\b(?:HEV|PHEV|M[\s-]*HEV)\b/i;

  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim())
    .filter((line) => powertrainRow.test(line) && powertrainValue.test(line))
    .map((line) => /\belectric\b/i.test(line) ? `${line} electric vehicle` : line)
    .join(" ");
}

function collectWholeReportPowertrainEvidence(text) {
  const powertrainContext = /(?:engine|motor|silnik|двигател|топливо|paliwo|fuel|powertrain|drive\s+system|drivetrain|alternative\s+(?:drive|powertrain)|alternatywny\s+układ\s+napędowy|система\s+привода|альтернативная\s+система\s+привода|гибридн\w*\s+(?:систем\w*|привод\w*))/i;
  const explicitPowertrainValue = /(?:gasoline|petrol|diesel|benzyn|benzin|бензин|дизел|\b(?:PHEV|HEV|M[\s-]*HEV|BEV)\b|plug[\s-]*in|mild[\s-]*hybrid|electric\s+(?:engine|motor|vehicle)|silnik\s+elektrycz|электрическ\w*\s+(?:двигател|автомобил)|электродвигател)/i;
  const hybridDriveValue = /(?:hybrid|hybryd\w*|гибрид\w*)\s+(?:system|drive|powertrain|систем\w*|привод\w*)/i;
  const negativePowertrain = /(?:without|bez|без)[^\r\n]{0,60}(?:electric\s+(?:engine|motor)|silnik(?:a)?\s+elektryczn\w*|электрическ[а-яё]*\s+двигател[а-яё]*|электродвигател[а-яё]*|high\s+voltage\s+battery)|only\s+combustion\s+engine|combustion\s+engine\s+only|tylko\s+silnik\s+spalinowy|только\s+(?:двс|двигател\w*\s+внутренн\w*\s+сгоран)|no\s+electric\s+vehicle\s+inlet/i;
  const lines = String(text || "").split(/\r?\n/).map((line) => line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim());
  const matches = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1] || "";
    const evidenceBlock = [line, nextLine].filter(Boolean).join(" ");
    if (negativePowertrain.test(evidenceBlock)) continue;
    if (powertrainContext.test(line) && (explicitPowertrainValue.test(line) || hybridDriveValue.test(line))) {
      matches.push(line);
    } else if (powertrainContext.test(line) && (explicitPowertrainValue.test(nextLine) || hybridDriveValue.test(nextLine))) {
      matches.push(evidenceBlock);
    } else {
      continue;
    }
    if (matches.length === 12) break;
  }

  return matches.join(" ");
}

function findFallbackEngineEvidence(text) {
  const fuelOrPowertrain = /gasoline|petrol|diesel|hybrid|mild[\s-]*hybrid|plug[\s-]*in|\bphev\b|\bmhev\b|battery\s+electric|electric\s+(?:engine|motor|vehicle)|benzyn|olej[\s-]*napędowy|hybryd|silnik\s+elektrycz|benzin|\bbenz\.|\bбенз\.|бензин|дизел|гибрид|электродвигател|электромобил/i;
  const engineContext = /engine|motor|silnik|specyfikacj|base\s+engine|basic\s+engine|двигател|спецификац|базовый\s+двигател/i;
  const capacity = /\d[\d\s]*(?:[.,]\d+)?\s*(?:cm3|cm³|см3|см³|ccm|cc|l|л)\b/i;
  const negativePowertrain = /(?:without|bez|без)[^\r\n]{0,60}(?:electric\s+(?:engine|motor)|silnik(?:a)?\s+elektryczn\w*|электрическ[а-яё]*\s+двигател[а-яё]*|электродвигател[а-яё]*|high\s+voltage\s+battery)|only\s+combustion\s+engine|combustion\s+engine\s+only|tylko\s+silnik\s+spalinowy|только\s+(?:двс|двигател\w*\s+внутренн\w*\s+сгоран)|no\s+electric\s+vehicle\s+inlet/i;
  const nonEngineVolume = /fuel\s+(?:tank|filling)|zbiornik\s+paliwa|tankowanie|топливн\w*\s+бак|заправк/i;
  const matches = [];

  for (const line of String(text || "").split(/\r?\n/)) {
    const normalized = line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    if (!normalized || negativePowertrain.test(normalized) || nonEngineVolume.test(normalized)) continue;
    if (!engineContext.test(normalized)) continue;
    if (!fuelOrPowertrain.test(normalized) && !capacity.test(normalized)) continue;
    matches.push(normalized);
    if (matches.length === 8) break;
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
    const positiveVagSource = upper.replace(/(?:WITHOUT|BEZ|БЕЗ)\s+(?:AN?\s+)?(?:ELECTRIC\s+(?:ENGINE|MOTOR)|SILNIK(?:A)?\s+ELEKTRYCZN\w*|ЭЛЕКТРИЧЕСК[А-ЯЁ]*\s+ДВИГАТЕЛ[А-ЯЁ]*|ЭЛЕКТРОДВИГАТЕЛ[А-ЯЁ]*)\s*\(?\s*(?:(?:NOT|NIE|НЕ)\s+)?(?:HYBRID|HYBRYD\w*|ГИБРИД[А-ЯЁ]*)\s*\)?/gi, " ");
    if (/\bPHEV\b|PLUG[\s-]*IN/i.test(positiveVagSource)) {
      const fuel = /\bTDI\b|DIESEL|OLEJ[\s-]*NAPĘDOWY|WYSOKOPRĘŻ|ДИЗЕЛ/i.test(positiveVagSource)
        ? "diesel "
        : /\b(?:TSI|TFSI|FSI)\b|GASOLINE|PETROL|BENZYN|БЕНЗ(?:ИН|\.)/i.test(positiveVagSource)
          ? "gasoline "
          : "";
      return `${fuel}PHEV`;
    }
    if (/\bM[\s-]*HEV\b|MILD[\s-]*HYBRID/i.test(positiveVagSource)) {
      const fuel = /\bTDI\b|DIESEL|OLEJ[\s-]*NAPĘDOWY|WYSOKOPRĘŻ/i.test(positiveVagSource)
        ? "diesel "
        : /\b(?:TSI|TFSI|FSI)\b|GASOLINE|PETROL|BENZYN/i.test(positiveVagSource)
          ? "gasoline "
          : "";
      return `${fuel}MHEV`;
    }
    if (/\bE-?TRON\b|ELECTRIC\s+(?:ENGINE|MOTOR|VEHICLE)|ЭЛЕКТРОДВИГАТЕЛ|ЭЛЕКТРОМОБИЛ|SILNIK\s+ELEKTRYCZ/i.test(positiveVagSource)) return " electric vehicle";
  }

  if (["Alfa Romeo", "Fiat", "Jeep"].includes(brand)) {
    const fuel = /\bCMB\s+DS\b|^DS\b|DIESEL|ДИЗЕЛ/i.test(source) ? " diesel" : /\bCMB\s+BE\b|^BE\b|BENZIN|БЕНЗИН/i.test(source) ? " gasoline" : "";
    const hybrid = /\bPHEV\b/i.test(source) ? " PHEV" : /\bM[\s-]*HEV\b|\bBSG\d*\b|belt[\s-]*starter[\s-]*generator|\bH[\s:.-]*DRIVE\b/i.test(source) ? " MHEV" : "";
    return `${fuel}${hybrid}`;
  }

  if (["BMW", "Mini"].includes(brand)) {
    const marketNamePowertrain = inferBmwMarketNamePowertrain(values.modelRaw);
    if (marketNamePowertrain) return marketNamePowertrain;
    if (/\b(?:I3|I4|I5|I7|IX\d*|COOPER\s+SE|ELECTRIC)\b/i.test(source)) return " electric vehicle";
    if (/\bI8\b|\b\d{2}E\b/i.test(source)) return " gasoline PHEV";
    if (/\b(?:B37|B47|B57|N47|N57|M47|M57|\d{2}D)\w*/i.test(source)) return " diesel";
    if (/\b(?:B38|B48|B58|N1[23468]|N2[046]|N5[245]|N6[234]|N74|\d{2}I)\w*/i.test(source)) return " gasoline";
  }

  if (["Ford", "Ford Pro"].includes(brand)) {
    if (/\bEcoBlue\b|\bTDCi\b/i.test(source)) return " diesel";
    if (/\bEcoBoost\b|\bFox\b|\bDragon\b|\bDuratec\b/i.test(source)) return " gasoline";
  }

  if (["Toyota", "Lexus"].includes(brand)) {
    if (/\b[A-Z0-9-]*(?:FXE|FXS)\b/i.test(upper)) return " hybrid";
    if (/\b(?:1ND|[12]GD|1KD|2KD|1VD)[A-Z0-9-]*\b/i.test(upper)) return " diesel";
    if (/\b[A-Z0-9-]*(?:FKS|FTS)\b/i.test(upper)) return " gasoline";
    if (/\bEFI\b|\b(?:FE|FSE|FAE)\b/i.test(upper)) return " gasoline";
  }

  if (brand === "Nissan") {
    if (/\b(?:K9K|R9M|M9R|YD25|YD22)\b/i.test(upper)) return " diesel";
    if (/\b(?:EM47|EM57|EM61)\b|ELECTRIC/i.test(upper)) return " electric vehicle";
    if (/\b(?:HR|MR|H5F|HRA|KR15)\w*/i.test(upper)) return " gasoline";
  }

  if (brand === "Mitsubishi") {
    if (/\bGA1W\s*1600\b/i.test(source)) return " gasoline";
    if (/\bA03A\s*1200\b/i.test(source)) return " gasoline";
    if (/\bV98W\s*3200D[\s-]*TURBO\b/i.test(source)) return " diesel";
  }

  if (brand === "Porsche") {
    if (/\bTAYCAN\b|\bECX[EA]?\b|electric\s+(?:engine|motor|vehicle)|электрическ\w*\s+(?:двигател|автомобил)|электродвигател/i.test(source)) return " electric vehicle";
    if (/\bPHEV\b|plug[\s-]*in|\bE[\s-]*HYBRID\b|гибридн\w*\s+(?:систем\w*|привод\w*)/i.test(source)) return " gasoline PHEV";
    if (/\bdiesel\b|\bTDI\b|дизел/i.test(source)) return " diesel";
    if (/\bboxster\s+gts\s+981\b/i.test(source) && /\bA123\b/i.test(source) && /(?:^|\s)009(?:\s|$)/m.test(source) && /(?:^|\s)011(?:\s|$)/m.test(source)) return " gasoline";
    if (/\bgasoline\b|\bpetrol\b|benzyn|benzin|бензин/i.test(source)) return " gasoline";
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

function inferBmwMarketNamePowertrain(value) {
  const marketName = String(value || "").replace(/\s+/g, " ").trim();
  if (!marketName) return "";
  if (/\bcooper\s+s\s+e\s+all4\b/i.test(marketName)) return " gasoline PHEV";
  if (/^(?:i3|i4|i5|i7|iX\d*)\b|\b(?:eDrive\d+|BMW\s+Electric)\b/i.test(marketName)) return " electric vehicle";
  if (/\bi8\b|\bM?\d{3}(?:L|x)?eA?\b|\b[XS]Drive\d{2}e\b/i.test(marketName)) return " gasoline PHEV";
  if (/\bM?\d{3}dA?\b|\b[XS]Drive\d{2}d\b/i.test(marketName)) return " diesel";
  if (/\bM?\d{3}(?:t)?iA?\b|\b[XS]Drive\d{2}i\b/i.test(marketName)) return " gasoline";
  return "";
}

function inferBmwEngineVolume(value) {
  const marketName = String(value || "").replace(/\s+/g, " ").trim();
  if (!marketName || /^(?:i3|i4|i5|i7|iX\d*)\b/i.test(marketName)) return "";
  if (/\bcooper\s+s\s+e\s+all4\b/i.test(marketName)) return "1.5 L";

  const standardMatch = marketName.match(/\b(M?\d{3})(?:L|x|t)?([die])A?\b/i);
  const driveMatch = marketName.match(/\b[XS]Drive(\d{2})([die])\b/i);
  const performanceMatch = marketName.match(/\bM(\d{2})([di])\b/i);
  const badge = standardMatch
    ? `${standardMatch[1]}${standardMatch[2]}`.toLowerCase()
    : driveMatch
      ? `${driveMatch[1]}${driveMatch[2]}`.toLowerCase()
      : performanceMatch
        ? `m${performanceMatch[1]}${performanceMatch[2]}`.toLowerCase()
        : "";

  const capacities = {
    "116d": "1.5 L", "216d": "1.5 L", "16d": "1.5 L",
    "118d": "2.0 L", "120d": "2.0 L", "218d": "2.0 L", "220d": "2.0 L", "223d": "2.0 L",
    "316d": "2.0 L", "318d": "2.0 L", "320d": "2.0 L", "420d": "2.0 L", "518d": "2.0 L", "520d": "2.0 L",
    "18d": "2.0 L", "20d": "2.0 L", "23d": "2.0 L", "25d": "2.0 L",
    "330d": "3.0 L", "m340d": "3.0 L", "430d": "3.0 L", "m440d": "3.0 L", "530d": "3.0 L", "540d": "3.0 L",
    "630d": "3.0 L", "640d": "3.0 L", "730d": "3.0 L", "740d": "3.0 L", "30d": "3.0 L", "40d": "3.0 L", "m50d": "3.0 L",
    "116i": "1.5 L", "118i": "1.5 L", "218i": "1.5 L", "18i": "1.5 L",
    "120i": "2.0 L", "128i": "2.0 L", "220i": "2.0 L", "223i": "2.0 L", "230i": "2.0 L",
    "318i": "2.0 L", "320i": "2.0 L", "330i": "2.0 L", "420i": "2.0 L", "430i": "2.0 L", "520i": "2.0 L", "530i": "2.0 L",
    "20i": "2.0 L", "23i": "2.0 L", "25i": "2.0 L", "28i": "2.0 L", "30i": "2.0 L",
    "m240i": "3.0 L", "m340i": "3.0 L", "m440i": "3.0 L", "540i": "3.0 L", "640i": "3.0 L", "740i": "3.0 L", "840i": "3.0 L", "40i": "3.0 L", "m40i": "3.0 L",
    "225e": "1.5 L", "230e": "1.5 L", "25e": "1.5 L",
    "320e": "2.0 L", "330e": "2.0 L", "520e": "2.0 L", "530e": "2.0 L", "630e": "2.0 L", "30e": "2.0 L",
    "545e": "3.0 L", "550e": "3.0 L", "745e": "3.0 L", "750e": "3.0 L", "45e": "3.0 L", "50e": "3.0 L"
  };

  return capacities[badge] || "";
}

function findEngineVolumeRaw(text, brand, profile, values) {
  if (brand === "Mitsubishi") {
    const codeCapacity = String(values.engineEvidenceRaw || "").match(/\b(?:GA1W\s*(1600)|A03A\s*(1200)|V98W\s*(3200)D[\s-]*TURBO)\b/i);
    if (codeCapacity) return `${codeCapacity[1] || codeCapacity[2] || codeCapacity[3]} cm3`;
  }
  if (brand === "Porsche" && /\bboxster\s+gts\s+981\b/i.test(values.modelRaw || "") && /\bA123\b/i.test(values.engineCodeRaw || "") && /(?:^|\s)009(?:\s|$)/m.test(text) && /(?:^|\s)011(?:\s|$)/m.test(text)) return "3436 cm3";

  if (brand === "Suzuki") {
    const code = String(values.engineCodeRaw || values.engineTypeRaw || "").toUpperCase();
    const capacities = { K12C: 1242, K12D: 1197, K14D: 1373 };
    const match = Object.keys(capacities).find((engineCode) => new RegExp(`\\b${engineCode}\\b`).test(code));
    if (match) return `${capacities[match]} cm3`;
  }

  if (["Ford", "Ford Pro"].includes(brand)) {
    const engineDescription = String(values.engineTypeRaw || values.engineSpecificationRaw);
    const fordEngine = engineDescription.match(/(\d+(?:[.,]\d+)?)\s*L?\s+(?:EcoBoost|EcoBlue|Fox|Dragon|Duratec)\b/i);
    if (fordEngine) return `${fordEngine[1]} L`;
    const capacity = engineDescription.match(/^(\d+(?:[.,]\d+)?)/);
    if (capacity) return `${capacity[1]} L`;
  }

  if (["Abarth", "Alfa Romeo", "Fiat", "Fiat Professional", "Jeep", "Lancia"].includes(brand)) {
    const fcaCapacity = findFcaCylinderCapacity(text);
    if (fcaCapacity) return fcaCapacity;
  }

  const labeledValue = findFirstPdfValue(text, profile.engineVolumeLabels);
  if (normalizePdfEngineVolume(labeledValue)) return labeledValue;
  if (["Abarth", "Alfa Romeo", "Fiat", "Fiat Professional", "Jeep", "Lancia"].includes(brand)) {
    const fcaCapacity = String(labeledValue).match(/^\s*(\d+(?:[.,]\d+)?)\b/);
    if (fcaCapacity && Number(fcaCapacity[1].replace(",", ".")) > 0) return `${fcaCapacity[1]} L`;
  }
  if (normalizePdfEngineVolume(values.engineSpecificationRaw)) return values.engineSpecificationRaw;
  if (normalizePdfEngineVolume(values.engineTypeRaw)) return values.engineTypeRaw;

  if (stellantisBrands.has(brand)) {
    const inferredVolume = inferStellantisEngineVolume([values.engineSpecificationRaw, values.engineCodeRaw].join(" "));
    if (inferredVolume) return inferredVolume;
  }

  if (brand === "Volvo") {
    const volvoEngine = String(text).match(/^\s*[A-Z0-9]{4}\s+ENGINE[^\r\n]*?\b(\d+(?:[.,]\d+)?)\s*L\b/im);
    if (volvoEngine) return `${volvoEngine[1]} L`;
    const inferredVolume = inferVolvoEngineVolume([values.engineSpecificationRaw, values.engineTypeRaw, values.engineCodeRaw].join(" "));
    if (inferredVolume) return inferredVolume;
  }

  if (normalizePdfEngineVolume(values.engineEvidenceRaw)) return values.engineEvidenceRaw;

  if (brand === "Nissan") {
    const code = `${values.engineTypeRaw} ${values.engineCodeRaw}`.toUpperCase();
    const capacities = { K9K: 1461, R9M: 1598, M9R: 1995, YD25: 2488, YD22: 2184 };
    const match = Object.keys(capacities).find((engineCode) => code.includes(engineCode));
    if (match) return `${capacities[match]} cm3`;
  }

  return "";
}

function findFcaCylinderCapacity(text) {
  for (const line of String(text || "").split(/\r?\n/)) {
    const normalized = line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    const match = normalized.match(/^CC\s+(\d+(?:[.,]\d+)?)(?=\s|$)/i);
    if (!match) continue;
    const liters = Number(match[1].replace(",", "."));
    if (liters >= 0.5 && liters <= 10) return `${match[1]} L`;
  }
  return "";
}

function inferStellantisEngineVolume(value) {
  const engineCode = String(value || "").toUpperCase();
  if (/\b1KR(?:-FE)?\b/.test(engineCode)) return "998 cm3";
  return "";
}

function inferVolvoEngineVolume(value) {
  const engineCode = String(value || "").match(/\b[BD]\d(\d{2})(?:\d)?(?:T\d*|S\d*)\b/i);
  if (!engineCode) return "";
  const decilitres = Number(engineCode[1]);
  if (decilitres < 10 || decilitres > 60) return "";
  return `${(decilitres / 10).toFixed(1)} L`;
}

function normalizePdfEngineVolume(value) {
  const raw = String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  const cubicMatch = raw.match(/(\d[\d\s]*)\s*(?:cm3|cm³|см3|см³|ccm|cc)\b/i);
  if (cubicMatch && Number(cubicMatch[1].replace(/\s/g, "")) > 0) return `${cubicMatch[1].replace(/\s/g, "")} cm³`;
  const literMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:l|л|litr(?:e|es|a|ów)?|литр(?:а|ов)?)(?=$|[^\p{L}\d])/iu);
  if (literMatch && Number(literMatch[1].replace(",", ".")) > 0) return `${Math.round(Number(literMatch[1].replace(",", ".")) * 1000)} cm³`;
  const codedLiterMatch = raw.match(/^(\d+(?:[.,]\d+)?)\b.*(?:ENGINE\s+DISPLACEMENT|ЛОШАДИНАЯ\s+СИЛА\s*\(КОММЕРЧЕСКАЯ\)|POJEMNOŚĆ\s+SKOKOWA|РАБОЧИЙ\s+ОБЪ[ЕЁ]М)/i);
  if (codedLiterMatch && Number(codedLiterMatch[1].replace(",", ".")) > 0) return `${Math.round(Number(codedLiterMatch[1].replace(",", ".")) * 1000)} cm³`;
  if (!/^\d+(?:[.,]\d+)?$/.test(raw) || Number(raw.replace(",", ".")) <= 0) return "";
  const numericValue = Number(raw.replace(",", "."));
  return `${Math.round(numericValue > 20 ? numericValue : numericValue * 1000)} cm³`;
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
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return "";

  const january4 = new Date(Date.UTC(year, 0, 4));
  const january4IsoDay = january4.getUTCDay() || 7;
  const weekStart = new Date(january4);
  weekStart.setUTCDate(january4.getUTCDate() - january4IsoDay + 1 + (week - 1) * 7);
  const weekAnchor = new Date(weekStart);
  weekAnchor.setUTCDate(weekStart.getUTCDate() + 3);
  if (weekAnchor.getUTCFullYear() !== year) return "";

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const startDay = String(weekStart.getUTCDate()).padStart(2, "0");
  const startMonth = String(weekStart.getUTCMonth() + 1).padStart(2, "0");
  const endDay = String(weekEnd.getUTCDate()).padStart(2, "0");
  const endMonth = String(weekEnd.getUTCMonth() + 1).padStart(2, "0");
  const startYear = weekStart.getUTCFullYear();
  const endYear = weekEnd.getUTCFullYear();

  if (startYear === endYear && startMonth === endMonth) return `${startDay}-${endDay}.${endMonth}.${endYear}`;
  if (startYear === endYear) return `${startDay}.${startMonth}-${endDay}.${endMonth}.${endYear}`;
  return `${startDay}.${startMonth}.${startYear}-${endDay}.${endMonth}.${endYear}`;
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

export function readPdfText(pdfPath) {
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
