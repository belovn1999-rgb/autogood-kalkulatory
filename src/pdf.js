const $ = (id) => document.getElementById(id);

const statusEl = $("status");
const templateUrl = "./contract-pdf-work/templates/Umowa_Zamowienia_Pojazdu_AG_template_signed.docx?v=20260622-1";
const stampUrl = "./assets/autogood-stamp.jpg";
const fontUrl = "./assets/arial.ttf";
const defaultPdfConverterUrl = "/api/convert-docx-to-pdf";
const contractHistoryLimit = 3;

let currentDownloadUrls = [];
const pageParams = new URLSearchParams(window.location.search);
const contractVariant = pageParams.get("variant") || "standard";
const isExportContract = contractVariant === "export";
const contractDocumentId = isExportContract ? "03-export" : "01-poland";
const legacyContractHistoryKey = "autogood-order-contract-history-v1";
const previousVariantHistoryKey = `${legacyContractHistoryKey}:${contractVariant}`;
const contractHistoryKey = `autogood-contract-history:${contractDocumentId}:v1`;
const exportDefaultCommission = "350 EUR + 1% od ceny pojazdu.";

const exportSubjectLabels = {
  purchase_by_autogood:
    "wyszukanie ofert pojazdów zgodnie z kryteriami określonymi przez Zleceniodawcę oraz zakup przez Zleceniobiorcę na rachunek Zleceniodawcy w ramach ustalonego budżetu w celu eksportu do Białorusi",
  client_indicated_vehicle: "zakupienie pojazdu wskazanego przez Zleceniodawcę (z aukcji lub oferty), w imieniu Zleceniodawcy",
};

const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const W14 = "http://schemas.microsoft.com/office/word/2010/wordml";

const polishMonths = {
  1: "stycznia",
  2: "lutego",
  3: "marca",
  4: "kwietnia",
  5: "maja",
  6: "czerwca",
  7: "lipca",
  8: "sierpnia",
  9: "września",
  10: "października",
  11: "listopada",
  12: "grudnia",
};

const checkboxIndex = {
  client_is_entrepreneur: 1,
  subject_mediation: 2,
  subject_purchase_by_autogood: 3,
  subject_financing: 4,
  subject_client_indicated_vehicle: 5,
  fuel_diesel: 6,
  fuel_benzyna: 7,
  fuel_hybryda: 8,
  fuel_elektryk: 9,
  gearbox_manualna: 10,
  gearbox_automatyczna: 11,
  euro_6: 12,
  euro_7: 13,
  euro_dowolna: 14,
  euro_inna: 15,
  body_sedan: 16,
  body_kombi: 17,
  body_coupe: 18,
  body_inne: 19,
  allow_collision: 20,
};

const labels = {
  client: ["Klient", "Client", "Клиент", "Zleceniodawca", "Imię i nazwisko", "Imie i nazwisko", "Imię i Nazwisko/Nazwa", "Nazwa"],
  clientType: ["Rodzaj klienta", "Typ klienta", "Тип клиента"],
  address: ["Adres", "Адрес", "Address", "Siedziba", "Miejsce zamieszkania"],
  pesel: ["PESEL"],
  nip: ["NIP"],
  document: ["Dokument", "Документ", "Dowód", "Dowod", "Rodzaj, numer i seria dokumentu tożsamości", "Rodzaj numer i seria dokumentu tozsamosci"],
  documentType: ["Typ dokumentu", "Rodzaj dokumentu", "Тип документа"],
  documentNumber: ["Numer dokumentu", "Seria dokumentu", "Номер документа", "Nr dokumentu", "Numer i seria"],
  phone: ["Telefon", "Nr. tel", "Nr tel", "Телефон", "Tel", "Phone"],
  email: ["Email", "E-mail", "Mail", "Adres email", "Adres e-mail", "Имейл"],
  vehicleMarker: ["Auto", "Pojazd", "Samochód", "Samochod", "Авто", "Автомобиль"],
  make: ["Marka", "Марка"],
  model: ["Model", "Модель"],
  year: ["Rok", "Wiek", "Год", "Rocznik", "Pierwsza rejestracja"],
  mileage: ["Przebieg", "Przebieg do", "Пробег"],
  body: ["Nadwozie", "Typ nadwozia", "Тип кузова", "Кузов"],
  fuel: ["Paliwo", "Топливо", "Napęd", "Naped"],
  gearbox: ["Skrzynia", "Skrzynia biegów", "Skrzynia biegow", "Коробка"],
  budget: ["Budżet", "Budzet", "Бюджет", "Cena", "Kwota"],
  deposit: ["Zaliczka", "Депозит", "Заливка", "Заличка", "Advance"],
  extra: ["Dodatkowo", "Wyposażenie", "Дополнительно", "Dodatkowe", "Wymagania", "Opcje"],
  expectedExtra: ["Oczekiwane", "Dodatkowe oczekiwane", "Желаемые"],
};

const allLabels = Object.values(labels).flat();
const looseStopLabels = allLabels.filter((label) => !labels.vehicleMarker.includes(label));
const plus48PhonePattern = /\+48[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/g;

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function parseDate(value) {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function contractNumber(dateValue, sequence) {
  const date = parseDate(dateValue);
  const base = `${date.getDate()}/${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`;
  return Number(sequence) > 1 ? `${base}/${Number(sequence)}` : base;
}

function polishDateLine(dateValue) {
  const date = parseDate(dateValue);
  return `Łomianki, ${date.getDate()} ${polishMonths[date.getMonth() + 1]} ${date.getFullYear()} roku`;
}

function checkedRadio(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function checkedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((node) => node.value);
}

function setRadio(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((node) => {
    node.checked = node.value === value;
  });
}

function setCheckedValues(name, values) {
  const selected = new Set(asArray(values));
  document.querySelectorAll(`input[name="${name}"]`).forEach((node) => {
    node.checked = selected.has(node.value);
  });
}

function setFuel(values) {
  const selected = new Set(values || []);
  document.querySelectorAll("[data-fuel]").forEach((node) => {
    node.checked = selected.has(node.dataset.fuel);
  });
}

function fuelValues() {
  return [...document.querySelectorAll("[data-fuel]:checked")].map((node) => node.dataset.fuel);
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function uniqueValues(values) {
  return [...new Set(asArray(values))];
}

function bodyTypes(body) {
  return uniqueValues(body?.types || body?.type);
}

function bodyLabel(body) {
  const types = bodyTypes(body);
  const labels = types.map((type) => (type === "inne" && body?.other ? body.other : type)).filter(Boolean);
  return labels.join(", ");
}

function normalizeSpace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractLabeled(text, variants) {
  const labelPattern = variants.map(escapeRegExp).join("|");
  const separatedNextPattern = allLabels.map(escapeRegExp).join("|");
  const looseNextPattern = looseStopLabels.map(escapeRegExp).join("|");
  const pattern = new RegExp(
    `(?:^|[\\s,;|\\n])(?:${labelPattern})\\s*(?::|=|–|-)?\\s*(.*?)(?=(?:[\\s,;|\\n]+(?:${separatedNextPattern})\\s*(?::|=|–|-)\\s*)|(?:[\\s,;|\\n]+(?:${looseNextPattern})\\s+)|$)`,
    "is"
  );
  return normalizeSpace(text.match(pattern)?.[1] || "");
}

function stripKnownNoise(value) {
  return normalizeSpace(String(value || "").replace(/^[-–—•*]+/, "").replace(/^[/:;,.\s-]+|[/:;,.\s-]+$/g, ""));
}

function withoutPlus48Phones(value) {
  return String(value || "").replace(plus48PhonePattern, " ");
}

function cleanupChoice(value) {
  const cleaned = normalizeSpace(value);
  return normalizeSpace(cleaned.includes("/") ? cleaned.split("/")[0] : cleaned);
}

function parseBody(value) {
  const raw = normalizeSpace(value);
  const lower = raw.toLowerCase();
  const types = [];
  for (const body of ["sedan", "kombi", "coupe"]) {
    if (new RegExp(`\\b${body}\\b`).test(lower)) types.push(body);
  }
  const otherFallback = raw.match(/\b(suv|camper|hatchback|liftback|van|minivan|cabrio|kabriolet|crossover)\b/i)?.[0] || "";
  const other = raw.match(/inne\s*:\s*(.+)/i)?.[1];
  if (other || otherFallback) types.push("inne");
  if (!types.length && raw) types.push("inne");
  return {
    type: types[0] || "",
    types: uniqueValues(types),
    other: other ? normalizeSpace(other) : otherFallback || (types.includes("inne") && !["sedan", "kombi", "coupe", "inne"].includes(lower) ? raw : ""),
  };
}

function bodyFallback(value) {
  const match = normalizeSpace(value).match(/\b(sedan|kombi|coupe|suv|camper|hatchback|liftback|van|minivan|cabrio|kabriolet)\b/i);
  return match?.[0] || "";
}

function parseFuel(value) {
  const lower = normalizeSpace(value).toLowerCase();
  const selected = [];
  if (/\bbenzyn|gasolin|petrol\b/.test(lower)) selected.push("benzyna");
  if (/\bdiesel|olej nap[eę]dowy\b/.test(lower)) selected.push("diesel");
  if (/\bhybryd|hybrid\b/.test(lower)) selected.push("hybryda");
  if (/\belektryk|electric|ev\b/.test(lower)) selected.push("elektryk");
  return selected;
}

function parseGearbox(value) {
  const lower = normalizeSpace(value).toLowerCase();
  const selected = [];
  if (/\bautomat|automatycz/.test(lower)) selected.push("automatyczna");
  if (/\bmanual|manualn/.test(lower)) selected.push("manualna");
  return uniqueValues(selected);
}

function linesFromText(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map(normalizeSpace)
    .filter(Boolean);
}

function isAddressStreetLine(line) {
  const clean = stripKnownNoise(line);
  return /^(?:ul\.?|al\.?|pl\.?|os\.?|aleja)?\s*[\p{Lu}\p{Ll}][\p{L}.'-]+(?:\s+[\p{Lu}\p{Ll}][\p{L}.'-]+){0,4}\s+\d+[A-Z]?(?:[/-]\d+[A-Z]?)?$/u.test(clean);
}

function isPostalCityLine(line) {
  return /^\d{2}-\d{3}\s+[\p{Lu}\p{Ll}][\p{L}.'-]+(?:\s+[\p{Lu}\p{Ll}][\p{L}.'-]+){0,4}$/u.test(stripKnownNoise(line));
}

const polishCityPattern =
  /\b(?:Warszawa|Krak[oó]w|Ł[oó]d[zź]|Lodz|Wrocław|Wroclaw|Pozna[nń]|Gda[nń]sk|Szczecin|Bydgoszcz|Lublin|Białystok|Bialystok|Katowice|Gdynia|Częstochowa|Czestochowa|Radom|Toru[nń]|Torun|Sosnowiec|Kielce|Rzesz[oó]w|Gliwice|Zabrze|Olsztyn|Bielsko(?:-| )Biała|Bielsko(?:-| )Biala|Bytom|Zielona G[oó]ra|Rybnik|Ruda Śląska|Ruda Slaska|Opole|Tychy|Gorz[oó]w Wielkopolski|Elbląg|Elblag|Płock|Plock|Wałbrzych|Walbrzych|Włocławek|Wloclawek|Tarn[oó]w|Chorz[oó]w|Koszalin|Kalisz|Legnica|Grudziądz|Grudziadz|Słupsk|Slupsk|Jaworzno|Jastrzębie(?:-| )Zdr[oó]j|Jastrzebie(?:-| )Zdroj|Nowy Sącz|Nowy Sacz|Jelenia G[oó]ra|Siedlce|Mysłowice|Myslowice|Piła|Pila|Konin|Piotrk[oó]w Trybunalski|Inowrocław|Inowroclaw|Lubin|Ostr[oó]w Wielkopolski)\b/i;

function isPolishAddressLine(line) {
  const clean = stripKnownNoise(line);
  if (!clean || isClientDataMarkerLine(clean)) return false;
  if (!polishCityPattern.test(clean)) return false;
  if (/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(clean)) return false;
  if (/\b(?:PESEL|NIP|Dow[oó]d|Dokument|Paszport|Karta pobytu|Telefon|Tel\.?|Email|E-mail|Auto|Pojazd|Marka|Model|Budżet|Budzet|Zaliczka)\b/i.test(clean)) return false;
  return /\d{2}-\d{3}|\b(?:ul\.?|al\.?|pl\.?|os\.?|aleja)\b|\b\d+[A-Z]?(?:[/-]\d+[A-Z]?)?\b|,/.test(clean);
}

function isClientDataMarkerLine(line) {
  return /^(?:PESEL|NIP|DO|Dow[oó]d|Dokument|Paszport|Karta pobytu|Telefon|Tel\.?|Email|E-mail|Mail|Auto|Pojazd|Marka|Model|Budżet|Budzet|Zaliczka)\b/i.test(line);
}

function normalizeDocumentType(value) {
  const lower = normalizeSpace(value).toLowerCase();
  if (!lower) return "";
  if (/^(?:do|d\.o\.|dow[oó]d|dow[oó]d osobisty)\b/.test(lower)) return "dowód osobisty";
  if (/^paszport\b/.test(lower)) return "paszport";
  if (/^karta\s+pobytu\b/.test(lower)) return "karta pobytu";
  return "";
}

function splitDocumentValue(value) {
  const clean = stripKnownNoise(value);
  if (!clean) return { type: "", number: "" };
  const type = normalizeDocumentType(clean);
  const number = stripKnownNoise(clean.replace(/\b(?:DO|D\.O\.|dow[oó]d osobisty|dow[oó]d|paszport|karta pobytu)\b\s*(?::|nr|numer|seria|-)?/i, ""));
  return { type, number };
}

function composeDocumentValue(type, number) {
  const cleanType = normalizeDocumentType(type);
  const cleanNumber = stripKnownNoise(number);
  if (!cleanType || !cleanNumber) return "";
  const numberWithoutType = splitDocumentValue(cleanNumber).number || cleanNumber;
  return normalizeSpace(`${cleanType} ${numberWithoutType}`);
}

function parseDocumentValue(text) {
  const compact = normalizeSpace(text);
  const shorthand = compact.match(/\b(?:DO|D\.O\.)\s*(?::|-)?\s*([A-Z]{1,4}\s*\d[A-Z0-9]{2,}|\d{5,}[A-Z0-9]*)/i);
  if (shorthand) return normalizeSpace(`dowód osobisty ${shorthand[1]}`);
  const exact = compact.match(/\b(dow[oó]d osobisty|paszport|karta pobytu)\b\s*(?::|nr|numer|seria|-)?\s*([A-Z]{1,4}\s*\d[A-Z0-9]{2,}|\d{5,}[A-Z0-9]*)/i);
  if (exact) return normalizeSpace(`${exact[1]} ${exact[2]}`);
  let documentValue = extractLabeled(compact, labels.document);
  const documentType = extractLabeled(compact, labels.documentType);
  const documentNumber = extractLabeled(compact, labels.documentNumber);
  if (!documentValue && (documentType || documentNumber)) {
    documentValue = normalizeSpace(`${documentType} ${documentNumber}`);
  }
  if (!documentValue) {
    const match = compact.match(/\b(dow[oó]d osobisty|paszport|karta pobytu)\b\s*[:-]?\s*([A-Z0-9]{3,}(?:\s+[A-Z0-9]{2,})?)/i);
    if (match) documentValue = normalizeSpace(`${match[1]} ${match[2]}`);
  }
  return documentValue;
}

function moneyMatch(value) {
  return normalizeSpace(value.match(/\b\d[\d\s.,]{2,}\s*(?:PLN|EUR|zł|zl|€)(?:\s*brutto|\s*netto)?\b/i)?.[0] || "");
}

function parseMoneyValue(value) {
  const raw = normalizeSpace(value);
  const currencyMatch = raw.match(/\b(EUR|PLN)\b|€|zł|zl/i);
  let currency = "PLN";
  if (currencyMatch) {
    const token = currencyMatch[0].toUpperCase();
    currency = token === "EUR" || token === "€" ? "EUR" : "PLN";
  }
  const amount = stripKnownNoise(raw.replace(/\b(EUR|PLN)\b|€|zł|zl|\bbrutto\b|\bnetto\b/gi, ""));
  return { amount, currency };
}

function formatMoneyValue(amount, currency) {
  const cleanAmount = parseMoneyValue(amount).amount;
  if (!cleanAmount) return "";
  const cleanCurrency = currency === "EUR" ? "EUR" : "PLN";
  return `${cleanAmount} ${cleanCurrency} brutto`;
}

function addressFallback(text) {
  const lines = linesFromText(text);
  for (const line of lines) {
    if (isPolishAddressLine(line)) return line;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!isAddressStreetLine(line)) continue;
    const nextLine = lines[index + 1] || "";
    if (isPostalCityLine(nextLine)) return `${line}, ${nextLine}`;
    return line;
  }

  const compact = normalizeSpace(text);
  const postalAddress = compact.match(
    /(?:ul\.?\s+)?[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,4}\s+\d+[A-Z]?(?:[,\s]+[A-Z]{1,4}\/\d+)?[,\s]+\d{2}-\d{3}\s+[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,3}/u
  );
  if (postalAddress) return stripKnownNoise(postalAddress[0]);
  const cityAddressLine = lines.find((line) => isPolishAddressLine(line));
  if (cityAddressLine) return stripKnownNoise(cityAddressLine);
  const pattern =
    /\b(?:ul\.?|al\.?|pl\.?|os\.?|aleja|улица|adres)\s+.*?(?=\s+(?:PESEL|NIP|Dokument|Dow[oó]d|Paszport|Karta pobytu|Telefon|Tel|Email|E-mail|Auto|Pojazd|Marka|Model|Budżet|Budzet|Zaliczka)\b|$)/i;
  return stripKnownNoise(text.match(pattern)?.[0] || "");
}

function cleanAddressValue(value, { phone = "", email = "", pesel = "", nip = "", document = "" } = {}) {
  let cleaned = ` ${normalizeSpace(value)} `;
  for (const token of [phone, email, pesel, nip, document].filter(Boolean)) {
    cleaned = cleaned.replace(new RegExp(escapeRegExp(token), "gi"), " ");
  }
  cleaned = cleaned
    .replace(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/g, " ")
    .replace(/(?:\+48[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{3}/g, " ")
    .replace(/\b\d{11}\b/g, " ")
    .replace(/\b(?:PESEL|NIP|Telefon|Tel\.?|Phone|Email|E-mail|Mail|Dokument|Dow[oó]d osobisty|Paszport|Karta pobytu)\b.*$/i, " ");
  const postalAddress = normalizeSpace(cleaned).match(
    /(?:ul\.?\s+)?[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,4}\s+\d+[A-Z]?(?:[,\s]+[A-Z]{1,4}\/\d+)?[,\s]+\d{2}-\d{3}\s+[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,3}/u
  );
  return stripKnownNoise(postalAddress?.[0] || cleaned);
}

function documentFallback(text) {
  const compact = normalizeSpace(text);
  const shorthand = compact.match(/\b(?:DO|D\.O\.)\s*(?::|-)?\s*([A-Z]{1,4}\s?\d[A-Z0-9]{2,}|\d{5,}[A-Z0-9]*)/i);
  if (shorthand) return normalizeSpace(`dowód osobisty ${shorthand[1]}`);
  const full = compact.match(/\b(dow[oó]d osobisty|paszport|karta pobytu)\b\s*(?:nr|numer|seria|:|-)?\s*([A-Z]{1,4}\s*\d[A-Z0-9]{2,}|\d{5,}[A-Z0-9]*)/i);
  if (full) return normalizeSpace(`${full[1]} ${full[2]}`);
  const number = compact.match(/\b[A-Z]{2,4}\s?\d{5,8}\b/)?.[0] || "";
  return normalizeSpace(number);
}

function valueAfterMarker(text, markerVariants) {
  const labelPattern = markerVariants.map(escapeRegExp).join("|");
  const stopPattern = allLabels.map(escapeRegExp).join("|");
  const match = normalizeSpace(text).match(new RegExp(`(?:^|[\\s,;|])(?:${labelPattern})\\s*(?::|=|–|-)?\\s*(.*?)(?=(?:\\s+(?:${stopPattern})\\s*(?::|=|–|-)?\\s*)|$)`, "is"));
  return stripKnownNoise(match?.[1] || "");
}

function vehicleContext(text) {
  const compact = normalizeSpace(text);
  const marker = labels.vehicleMarker.map(escapeRegExp).join("|");
  const strictMatches = [...compact.matchAll(new RegExp(`(?:^|[\\s,;|])(?:${marker})\\s*(?::|=|–|-)\\s*(.*)$`, "gis"))];
  if (strictMatches.length) return normalizeSpace(strictMatches.at(-1)[1]);
  const looseMatches = [...compact.matchAll(new RegExp(`(?:^|[\\s,;|])(?:${marker})\\s+(.*)$`, "gis"))];
  return looseMatches.length ? normalizeSpace(looseMatches.at(-1)[1]) : compact;
}

function hasVehicleSignal(text) {
  const compact = normalizeSpace(text);
  const lower = compact.toLowerCase();
  const marker = labels.vehicleMarker.map(escapeRegExp).join("|");
  if (new RegExp(`(?:^|[\\s,;|])(?:${marker})\\s*(?::|=|–|-)`, "i").test(compact)) return true;
  if (extractLabeled(compact, labels.make) || extractLabeled(compact, labels.model) || extractLabeled(compact, labels.fuel) || extractLabeled(compact, labels.gearbox) || extractLabeled(compact, labels.body)) return true;
  if (/\b(firma|jdg|sp\.?\s*z\.?\s*o\.?o\.?|spółka|spolka|s\.a\.|krs|regon)\b/i.test(lower)) return false;
  return new RegExp(`(?:^|[\\s,;|])(?:${marker})\\s+`, "i").test(compact);
}

function firstRegistrationFallback(text) {
  return (
    normalizeSpace(text.match(/\b(?:19|20)\d{2}\s*-\s*(?:19|20)\d{2}\b/)?.[0] || "") ||
    normalizeSpace(text.match(/\b(?:19|20)\d{2}\+\b/)?.[0] || "") ||
    normalizeSpace(text.match(/\b(?:19|20)\d{2}\b/)?.[0] || "")
  );
}

function mileageFallback(text) {
  return normalizeSpace(text.match(/\b\d[\d\s.,]{2,}\s*(?:km|км)\b/i)?.[0] || "");
}

function makeModelFallback(text) {
  const context = vehicleContext(text)
    .replace(/\b(?:Rok|Wiek|Rocznik|Год|Paliwo|Топливо|Skrzynia|Коробка|Budżet|Budzet|Бюджет|Zaliczka|Депозит)\b.*$/i, "");
  const cleaned = stripKnownNoise(
    context
      .replace(/\b(?:Marka|Model|Марка|Модель)\s*(?::|=|–|-)?\s*/gi, " ")
      .replace(/\b(?:19|20)\d{2}(?:\s*-\s*(?:19|20)\d{2}|\+)?\b/g, " ")
  );
  const words = cleaned.match(/[A-ZŁŚŻŹĆŃÓĘĄ0-9][\w.+-]*/gi) || [];
  const filtered = words.filter((word) => !/^(auto|pojazd|samoch[oó]d|авто|rok|paliwo|skrzynia|benzyna|diesel|hybryda|elektryk|automat|automatyczna|manual|manualna|sedan|kombi|coupe)$/i.test(word));
  return normalizeSpace(filtered.slice(0, 4).join(" "));
}

function parseClientType(text, { pesel = "", nip = "" } = {}) {
  const compact = normalizeSpace(text);
  const lower = compact.toLowerCase();
  const labeled = extractLabeled(compact, labels.clientType).toLowerCase();
  const companyMarkers = ["firma", "фирм", "jdg", "sp. z o.o", "sp z oo", "spółka", "spolka", "s.a.", "krs", "regon"];
  if (labeled.includes("firma") || labeled.includes("фирм") || labeled.includes("jdg")) return "company";
  if (labeled.includes("osoba") || labeled.includes("fizycz") || labeled.includes("физ")) return "person";
  if (companyMarkers.some((marker) => lower.includes(marker))) return "company";
  if (pesel) return "person";
  if (nip) return "company";
  return "person";
}

function parseName(text, isCompany) {
  const lines = linesFromText(text);
  const compact = normalizeSpace(text);
  const clientLine = lines.find((line) => /^(?:Klient|Client|Клиент)\b/i.test(line));
  if (clientLine) {
    const candidate = stripKnownNoise(clientLine.replace(/\b(?:Klient|Client|Клиент)\b\s*(?::|=|–|-)?/i, ""));
    if (candidate && !isPolishAddressLine(candidate) && !isAddressStreetLine(candidate) && !isPostalCityLine(candidate) && !isClientDataMarkerLine(candidate)) {
      return candidate;
    }
  }

  const labeled = extractLabeled(compact, labels.client);
  if (labeled) {
    const cleanLabeled = stripKnownNoise(labeled);
    if (!isCompany) {
      const personName = cleanLabeled.match(/^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+){1,3}\b/u)?.[0];
      if (personName) return stripKnownNoise(personName);
    }
    return cleanLabeled;
  }
  if (isCompany) {
    const company = compact.match(/\b[A-Z0-9ĄĆĘŁŃÓŚŹŻ][A-Z0-9ĄĆĘŁŃÓŚŹŻ .&-]{2,}?(?:JDG|sp\.?\s*z\.?\s*o\.?o\.?|spółka|spolka|s\.a\.)\b/i)?.[0];
    if (company) return stripKnownNoise(company);
  }

  const firstNameLine = lines.find((line) => {
    const candidate = stripKnownNoise(line.replace(/\b(?:Klient|Client|Клиент)\b\s*(?::|=|–|-)?/i, ""));
    if (!candidate || isPolishAddressLine(candidate) || isAddressStreetLine(candidate) || isPostalCityLine(candidate) || isClientDataMarkerLine(candidate)) return false;
    if (/@|\+48|\d{2}-\d{3}|\b\d{10,11}\b/.test(candidate)) return false;
    const words = candidate.match(/[\p{L}'-]+/gu) || [];
    return words.length >= 2 && words.length <= 4;
  });
  if (firstNameLine) return stripKnownNoise(firstNameLine.replace(/\b(?:Klient|Client|Клиент)\b\s*(?::|=|–|-)?/i, ""));

  const beforeAddress = compact.split(/\b(?:Adres|Адрес|PESEL|NIP|Dokument|Telefon|Email|Auto|Pojazd)\b/i)[0];
  const upperPerson = beforeAddress.match(/[\p{Lu}]{2,}(?:\s+[\p{Lu}]{2,}){1,3}/u)?.[0];
  if (upperPerson) return stripKnownNoise(upperPerson);
  const person = beforeAddress.replace(/\b(?:Klient|Client|Клиент)\b\s*(?::|=|–|-)?/i, "").match(/\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+){1,3}\b/u)?.[0];
  return stripKnownNoise(person || "");
}

function setStatus(text) {
  currentDownloadUrls.forEach((url) => URL.revokeObjectURL(url));
  currentDownloadUrls = [];
  statusEl.innerHTML = "";
  statusEl.textContent = text;
}

function showDownloads(items) {
  currentDownloadUrls.forEach((url) => URL.revokeObjectURL(url));
  currentDownloadUrls = [];
  statusEl.innerHTML = "";

  const list = document.createElement("div");
  list.className = "download-list";
  items.forEach(({ blob, filename, readyText, autoDownload = false }) => {
    const url = URL.createObjectURL(blob);
    currentDownloadUrls.push(url);

    const row = document.createElement("div");
    row.className = "download-row";
    const label = document.createElement("span");
    label.textContent = `${readyText} `;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.textContent = filename;
    row.append(label, link);
    list.append(row);

    if (autoDownload) link.click();
  });
  statusEl.append(list);
}

function showDownload(blob, filename, readyText, options = {}) {
  showDownloads([{ blob, filename, readyText, autoDownload: Boolean(options.autoDownload) }]);
}

function filenameFor(data, extension) {
  const makeModel = normalizeSpace(data.vehicle.make_model || "AUTO");
  const slug = makeModel
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `Umowa_Zamówienia_Pojazdu_${slug || "AUTO"}.${extension}`;
}

function updateDocumentFileName() {
  $("documentFileName").textContent = filenameFor(collectData(), "pdf");
}

function setDefaultSelectValues() {
  $("clientDocumentType").value = "paszport";
  $("budgetCurrency").value = "EUR";
  $("advanceCurrency").value = "EUR";
}

function configureContractVariant() {
  if (!isExportContract) return;
  document.body.classList.add("export-contract");
  document.title = "AUTOGOOD Umowa Export";
  const brandLabel = document.querySelector(".brand span");
  if (brandLabel) brandLabel.textContent = "Umowa Export";

  document.querySelectorAll("[data-subject-option]").forEach((label) => {
    const option = label.dataset.subjectOption;
    label.hidden = option === "mediation" || option === "financing";
  });

  const purchaseLabel = document.querySelector('[data-subject-option="purchase_by_autogood"] span');
  if (purchaseLabel) purchaseLabel.textContent = exportSubjectLabels.purchase_by_autogood;
  const indicatedLabel = document.querySelector('[data-subject-option="client_indicated_vehicle"] span');
  if (indicatedLabel) indicatedLabel.textContent = exportSubjectLabels.client_indicated_vehicle;
  setRadio("commissionOption", exportDefaultCommission);
}

function readHistoryFromStorage(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, contractHistoryLimit) : [];
  } catch {
    return [];
  }
}

function prepareContractHistoryStorage() {
  const current = readHistoryFromStorage(contractHistoryKey);
  const previous = readHistoryFromStorage(previousVariantHistoryKey);
  if (!current.length && previous.length) {
    localStorage.setItem(contractHistoryKey, JSON.stringify(previous.slice(0, contractHistoryLimit)));
  }
  localStorage.removeItem(legacyContractHistoryKey);
  if (previousVariantHistoryKey !== contractHistoryKey) localStorage.removeItem(previousVariantHistoryKey);
}

function readContractHistory() {
  return readHistoryFromStorage(contractHistoryKey);
}

function writeContractHistory(items) {
  localStorage.setItem(contractHistoryKey, JSON.stringify(items.slice(0, contractHistoryLimit)));
}

function collectFormSnapshot() {
  const ids = {};
  document.querySelectorAll("input[id], textarea[id], select[id]").forEach((node) => {
    ids[node.id] = node.type === "checkbox" || node.type === "radio" ? node.checked : node.value;
  });

  const radios = {};
  document.querySelectorAll('input[type="radio"][name]').forEach((node) => {
    if (node.checked) radios[node.name] = node.value;
  });

  const checkboxGroups = {};
  document.querySelectorAll('input[type="checkbox"][name]').forEach((node) => {
    if (!checkboxGroups[node.name]) checkboxGroups[node.name] = [];
    if (node.checked) checkboxGroups[node.name].push(node.value);
  });

  return {
    ids,
    radios,
    checkboxGroups,
    fuel: fuelValues(),
  };
}

function applyFormSnapshot(snapshot) {
  resetForm();
  for (const [id, value] of Object.entries(snapshot.ids || {})) {
    const node = $(id);
    if (!node) continue;
    if (node.type === "checkbox" || node.type === "radio") node.checked = Boolean(value);
    else node.value = value || "";
  }
  for (const [name, value] of Object.entries(snapshot.radios || {})) setRadio(name, value);
  for (const [name, values] of Object.entries(snapshot.checkboxGroups || {})) setCheckedValues(name, values);
  setFuel(snapshot.fuel || []);
  syncClientTypeRules();
  updateDocumentFileName();
}

function historyTitle(entry) {
  const ids = entry.snapshot?.ids || {};
  const client = normalizeSpace(ids.clientName || "Bez klienta");
  const vehicle = normalizeSpace(ids.vehicleMakeModel || "AUTO");
  return `${client} · ${vehicle}`;
}

function historyMeta(entry) {
  const ids = entry.snapshot?.ids || {};
  const date = ids.contractDate || todayISO();
  const sequence = ids.sequence || 1;
  const created = entry.savedAt ? new Date(entry.savedAt) : null;
  const savedLabel = created && !Number.isNaN(created.getTime()) ? created.toLocaleDateString("pl-PL") : "";
  return `Umowa ${contractNumber(date, sequence)}${savedLabel ? ` · zapisano ${savedLabel}` : ""}`;
}

function renderContractHistory() {
  const list = $("contractHistoryList");
  list.innerHTML = "";
  const history = readContractHistory();
  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "Brak zapisanych danych.";
    list.append(empty);
    return;
  }

  history.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.dataset.index = String(index);

    const title = document.createElement("strong");
    title.textContent = historyTitle(entry);
    const meta = document.createElement("span");
    meta.textContent = historyMeta(entry);
    button.append(title, meta);
    button.addEventListener("click", () => {
      applyFormSnapshot(entry.snapshot || {});
      setStatus("Dane z historii wczytane.");
    });
    list.append(button);
  });
}

function saveCurrentContractData() {
  const snapshot = collectFormSnapshot();
  const title = historyTitle({ snapshot });
  const history = readContractHistory().filter((entry) => JSON.stringify(entry.snapshot) !== JSON.stringify(snapshot));
  history.unshift({
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
    title,
    snapshot,
  });
  writeContractHistory(history);
  renderContractHistory();
  setStatus("Dane zapisane w historii.");
}

function syncClientTypeRules() {
  const isCompany = !isExportContract && checkedRadio("clientType") === "company";
  const entrepreneur = $("clientEntrepreneur");
  if (entrepreneur) {
    entrepreneur.checked = isCompany;
    entrepreneur.disabled = isCompany;
  }
  $("clientDocumentType").disabled = isCompany;
  $("clientDocument").disabled = isCompany;
  if (isCompany) {
    $("clientDocumentType").value = "";
    $("clientDocument").value = "";
  }
}

function parseRawTextValue(text) {
  const compact = normalizeSpace(text);
  const joined =
    text
      .split(/\r?\n/)
      .map(normalizeSpace)
      .filter(Boolean)
      .join("\n") || compact;
  const hasVehicle = hasVehicleSignal(compact);
  const vehicleText = hasVehicle ? vehicleContext(compact) : "";

  let email = joined.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/)?.[0] || "";
  if (!email) email = extractLabeled(compact, labels.email);
  email = stripKnownNoise(email);

  let phone = "";
  const labeledPhone = extractLabeled(compact, labels.phone);
  const labeledPlus48Phone = labeledPhone.match(plus48PhonePattern) || [];
  const plus48Phones = joined.match(plus48PhonePattern) || [];
  const phoneMatches = labeledPhone ? labeledPlus48Phone.length ? labeledPlus48Phone : [labeledPhone] : plus48Phones.length ? plus48Phones : joined.match(/(?:\+48[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{3}/g) || [];
  for (const candidate of phoneMatches) {
    const digits = candidate.replace(/\D/g, "");
    const start = joined.indexOf(candidate);
    const before = start > 0 ? joined.slice(start - 1, start) : "";
    const after = joined.slice(start + candidate.length, start + candidate.length + 1);
    if ((digits.startsWith("48") || digits.length === 9) && !/\d/.test(before + after)) {
      phone = candidate;
      break;
    }
  }

  const compactWithoutPhones = normalizeSpace(withoutPlus48Phones(compact));
  const joinedWithoutPhones = normalizeSpace(withoutPlus48Phones(joined));
  const peselValue = extractLabeled(compactWithoutPhones, labels.pesel);
  const pesel = peselValue.match(/\b\d{11}\b/)?.[0] || joinedWithoutPhones.match(/\b\d{11}\b/)?.[0] || "";
  const nipRaw =
    extractLabeled(compactWithoutPhones, labels.nip) ||
    joinedWithoutPhones.match(/\b(?:NIP[:\s]*)?(\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2})\b/i)?.[1] ||
    "";
  const nip = nipRaw.replace(/\D/g, "");
  const clientType = parseClientType(compact, { pesel, nip });
  const isCompany = clientType === "company";
  const make = hasVehicle ? stripKnownNoise(extractLabeled(compact, labels.make)) : "";
  const model = hasVehicle ? stripKnownNoise(extractLabeled(compact, labels.model)) : "";
  const makeModel = hasVehicle ? normalizeSpace(`${make} ${model}`) || makeModelFallback(vehicleText) : "";
  const budgetMoney = parseMoneyValue(extractLabeled(compact, labels.budget) || moneyMatch(valueAfterMarker(compact, labels.budget)));
  const depositMoney = parseMoneyValue(extractLabeled(compact, labels.deposit) || moneyMatch(valueAfterMarker(compact, labels.deposit)));
  const documentValue = parseDocumentValue(compact) || documentFallback(compact);
  const documentParts = splitDocumentValue(documentValue);
  const rawAddressValue = extractLabeled(compact, labels.address) || addressFallback(joined);
  const addressValue = cleanAddressValue(rawAddressValue, { phone, email, pesel, nip, document: documentValue });
  const yearValue = hasVehicle ? extractLabeled(compact, labels.year) || firstRegistrationFallback(vehicleText) : "";
  const mileageValue = hasVehicle ? extractLabeled(compact, labels.mileage) || mileageFallback(vehicleText) : "";
  const fuelValue = hasVehicle ? extractLabeled(compact, labels.fuel) || vehicleText : "";
  const gearboxValue = hasVehicle ? extractLabeled(compact, labels.gearbox) || vehicleText : "";
  const bodyValue = hasVehicle ? extractLabeled(compact, labels.body) || bodyFallback(vehicleText) : "";
  const requiredEquipment = hasVehicle ? extractLabeled(compact, labels.extra) : "";
  const expectedEquipment = hasVehicle ? extractLabeled(compact, labels.expectedExtra) : "";

  return {
    client: {
      type: clientType,
      name: parseName(joined, isCompany),
      address: addressValue,
      identifier: isCompany ? nip : pesel,
      document: isCompany ? "" : documentValue,
      document_type: isCompany ? "" : documentParts.type || "dowód osobisty",
      document_number: isCompany ? "" : documentParts.number || documentValue,
      phone: normalizeSpace(phone),
      email,
    },
    budget: {
      total: budgetMoney.amount,
      total_currency: budgetMoney.currency,
      advance: depositMoney.amount,
      advance_currency: depositMoney.currency,
    },
    vehicle: {
      make_model: makeModel,
      fuel: parseFuel(fuelValue),
      gearbox: parseGearbox(gearboxValue),
      first_registration: yearValue,
      mileage_to: mileageValue,
      body: parseBody(bodyValue),
      required_equipment: requiredEquipment,
      expected_equipment: expectedEquipment,
    },
  };
}

function applyParsed(data) {
  if (data.client?.type) {
    setRadio("clientType", isExportContract ? "person" : data.client.type);
    syncClientTypeRules();
  }
  $("clientName").value = data.client?.name || $("clientName").value;
  $("clientAddress").value = data.client?.address || $("clientAddress").value;
  $("clientIdentifier").value = data.client?.identifier || $("clientIdentifier").value;
  $("clientDocumentType").value = data.client?.document_type || $("clientDocumentType").value;
  $("clientDocument").value = data.client?.document_number || data.client?.document || $("clientDocument").value;
  $("clientPhone").value = data.client?.phone || $("clientPhone").value;
  $("clientEmail").value = data.client?.email || $("clientEmail").value;
  $("budgetTotal").value = data.budget?.total || $("budgetTotal").value;
  $("budgetCurrency").value = data.budget?.total_currency || $("budgetCurrency").value;
  $("budgetAdvance").value = data.budget?.advance || $("budgetAdvance").value;
  $("advanceCurrency").value = data.budget?.advance_currency || $("advanceCurrency").value;
  $("vehicleMakeModel").value = data.vehicle?.make_model || $("vehicleMakeModel").value;
  if (data.vehicle?.fuel) setFuel(data.vehicle.fuel);
  if (data.vehicle?.gearbox) setCheckedValues("gearbox", data.vehicle.gearbox);
  if (data.vehicle?.body) setCheckedValues("bodyType", bodyTypes(data.vehicle.body));
  $("bodyOther").value = data.vehicle?.body?.other || $("bodyOther").value;
  $("firstRegistration").value = data.vehicle?.first_registration || $("firstRegistration").value;
  $("mileageTo").value = data.vehicle?.mileage_to || $("mileageTo").value;
  $("requiredEquipment").value = data.vehicle?.required_equipment || $("requiredEquipment").value;
  $("expectedEquipment").value = data.vehicle?.expected_equipment || $("expectedEquipment").value;
  syncClientTypeRules();
  updateDocumentFileName();
}

function collectData() {
  const clientType = isExportContract ? "person" : checkedRadio("clientType") || "person";
  const isCompany = clientType === "company";
  const entrepreneur = $("clientEntrepreneur");
  return {
    contract: {
      date: $("contractDate").value || todayISO(),
      sequence: Number($("sequence").value || 1),
    },
    client: {
      type: clientType,
      is_entrepreneur: !isExportContract && (isCompany || Boolean(entrepreneur?.checked)),
      name: $("clientName").value.trim(),
      address: $("clientAddress").value.trim(),
      pesel: isCompany ? "" : $("clientIdentifier").value.trim(),
      nip: isCompany ? $("clientIdentifier").value.trim() : "",
      document: isCompany ? "" : composeDocumentValue($("clientDocumentType").value, $("clientDocument").value),
      phone: $("clientPhone").value.trim(),
      email: $("clientEmail").value.trim(),
    },
    agreement: {
      subjects: checkedValues("subject"),
      client_indicated_vehicle: $("clientIndicatedVehicle").checked,
    },
    budget: {
      total: formatMoneyValue($("budgetTotal").value, $("budgetCurrency").value),
      advance: formatMoneyValue($("budgetAdvance").value, $("advanceCurrency").value),
    },
    compensation: {
      commission: checkedRadio("commissionOption") || exportDefaultCommission,
    },
    vehicle: {
      make_model: $("vehicleMakeModel").value.trim(),
      fuel: fuelValues(),
      gearbox: checkedValues("gearbox"),
      euro_standard: checkedRadio("euroStandard"),
      first_registration: $("firstRegistration").value.trim(),
      mileage_to: $("mileageTo").value.trim(),
      body: {
        type: checkedValues("bodyType")[0] || "",
        types: checkedValues("bodyType"),
        other: $("bodyOther").value.trim(),
      },
      allow_collision_without_longitudinals: $("allowCollision").checked,
      required_equipment: $("requiredEquipment").value.trim(),
      expected_equipment: $("expectedEquipment").value.trim(),
    },
  };
}

function checkedKeys(data) {
  const checks = new Set();
  const subjects = new Set(data.agreement.subjects || (data.agreement.subject ? [data.agreement.subject] : []));
  if (!isExportContract && (data.client.is_entrepreneur || data.client.type === "company")) checks.add("client_is_entrepreneur");
  if (!isExportContract && subjects.has("mediation")) checks.add("subject_mediation");
  if (subjects.has("purchase_by_autogood")) checks.add("subject_purchase_by_autogood");
  if (!isExportContract && subjects.has("financing")) checks.add("subject_financing");
  if (data.agreement.client_indicated_vehicle) checks.add("subject_client_indicated_vehicle");
  for (const fuel of data.vehicle.fuel || []) checks.add(`fuel_${fuel}`);
  for (const gearbox of asArray(data.vehicle.gearbox)) checks.add(`gearbox_${gearbox}`);
  if (data.vehicle.euro_standard) checks.add(`euro_${data.vehicle.euro_standard}`);
  for (const type of bodyTypes(data.vehicle.body)) checks.add(`body_${type}`);
  if (data.vehicle.allow_collision_without_longitudinals) checks.add("allow_collision");
  return checks;
}

function directChildren(parent, namespace, localName) {
  return [...parent.childNodes].filter((node) => node.nodeType === 1 && node.namespaceURI === namespace && node.localName === localName);
}

function all(parent, namespace, localName) {
  return [...parent.getElementsByTagNameNS(namespace, localName)];
}

function wEl(doc, name, attrs = {}) {
  const el = doc.createElementNS(W, `w:${name}`);
  for (const [key, value] of Object.entries(attrs)) el.setAttributeNS(W, `w:${key}`, value);
  return el;
}

function makeRun(doc, text, { size = 18, bold = false, underline = false, breakBefore = false, font = "Calibri", color = "" } = {}) {
  const r = wEl(doc, "r");
  const rPr = wEl(doc, "rPr");
  rPr.append(wEl(doc, "rFonts", { ascii: font, hAnsi: font, cs: font, eastAsia: font }));
  if (bold) rPr.append(wEl(doc, "b"));
  else rPr.append(wEl(doc, "b", { val: "0" }), wEl(doc, "bCs", { val: "0" }));
  if (underline) rPr.append(wEl(doc, "u", { val: "single" }));
  if (color) rPr.append(wEl(doc, "color", { val: color }));
  rPr.append(wEl(doc, "sz", { val: String(size) }));
  r.append(rPr);
  if (breakBefore) r.append(wEl(doc, "br"));
  const t = wEl(doc, "t");
  t.setAttribute("xml:space", "preserve");
  t.textContent = text || "";
  r.append(t);
  return r;
}

function setParagraphText(p, text, { size = 18, bold = false } = {}) {
  for (const run of directChildren(p, W, "r")) run.remove();
  const doc = p.ownerDocument;
  p.append(makeRun(doc, text, { size, bold }));
}

function setParagraphLabelValue(p, label, value, { size = 18, valueSize = 18, valueBreak = true } = {}) {
  for (const run of directChildren(p, W, "r")) run.remove();
  const doc = p.ownerDocument;
  p.append(makeRun(doc, label, { size, bold: true, underline: true }));
  if (value) {
    const text = valueBreak ? value : ` ${value}`;
    p.append(makeRun(doc, text, { size: valueSize, bold: false, breakBefore: valueBreak }));
  }
}

function setParagraphLabel(p, label, { size = 18 } = {}) {
  for (const run of directChildren(p, W, "r")) run.remove();
  p.append(makeRun(p.ownerDocument, label, { size, bold: true, underline: true }));
}

function appendParagraphValue(p, value, { size = 18, prefix = " " } = {}) {
  if (!value) return;
  p.append(makeRun(p.ownerDocument, `${prefix}${value}`, { size, bold: false }));
}

function setParagraphValueAfterPrefix(p, prefix, value, { size = 18 } = {}) {
  let remaining = prefix.length;
  let reachedPrefixEnd = false;

  for (const child of [...p.childNodes]) {
    if (child.namespaceURI !== W || child.localName !== "r") continue;
    const textNodes = all(child, W, "t");
    const runText = textNodes.map((t) => t.textContent || "").join("");

    if (!reachedPrefixEnd) {
      if (remaining > runText.length) {
        remaining -= runText.length;
        continue;
      }

      if (remaining === runText.length) {
        reachedPrefixEnd = true;
        continue;
      }

      const firstText = textNodes[0];
      if (firstText) firstText.textContent = runText.slice(0, remaining);
      for (const textNode of textNodes.slice(1)) textNode.textContent = "";
      reachedPrefixEnd = true;
      continue;
    }

    child.remove();
  }

  p.append(makeRun(p.ownerDocument, value ? ` ${value}` : "", { size, bold: false }));
}

function applyRunStyle(run, { size = 18, bold = true, underline = true } = {}) {
  let rPr = directChildren(run, W, "rPr")[0];
  if (!rPr) {
    rPr = wEl(run.ownerDocument, "rPr");
    run.insertBefore(rPr, run.firstChild);
  }
  for (const tag of ["b", "bCs", "u", "sz", "szCs"]) {
    for (const el of directChildren(rPr, W, tag)) el.remove();
  }
  if (bold) rPr.append(wEl(run.ownerDocument, "b"), wEl(run.ownerDocument, "bCs"));
  if (underline) rPr.append(wEl(run.ownerDocument, "u", { val: "single" }));
  rPr.append(wEl(run.ownerDocument, "sz", { val: String(size) }), wEl(run.ownerDocument, "szCs", { val: String(size) }));
}

function styleParagraphPrefix(p, prefix, options = {}) {
  let remaining = prefix.length;
  for (const run of directChildren(p, W, "r")) {
    const runText = all(run, W, "t").map((t) => t.textContent || "").join("");
    if (!runText) continue;
    applyRunStyle(run, options);
    remaining -= runText.length;
    if (remaining <= 0) return;
  }
}

function setParagraphLastRunText(p, value) {
  const runs = directChildren(p, W, "r");
  const lastRun = runs[runs.length - 1];
  if (!lastRun) return;
  const textNode = all(lastRun, W, "t")[0];
  if (!textNode) return;
  applyRunStyle(lastRun, { size: 18, bold: false, underline: false });
  textNode.textContent = value || " ";
}

function tableRows(root) {
  const tbl = all(root, W, "tbl")[0];
  return directChildren(tbl, W, "tr").map((row) => directChildren(row, W, "tc"));
}

function paragraph(cell, index) {
  return directChildren(cell, W, "p")[index];
}

function clearCellContent(cell) {
  for (const child of [...cell.childNodes]) {
    if (child.namespaceURI === W && child.localName === "tcPr") continue;
    child.remove();
  }
}

function cellProperties(cell) {
  let tcPr = directChildren(cell, W, "tcPr")[0];
  if (!tcPr) {
    tcPr = wEl(cell.ownerDocument, "tcPr");
    cell.insertBefore(tcPr, cell.firstChild);
  }
  return tcPr;
}

function setCellVerticalAlign(cell, value) {
  const tcPr = cellProperties(cell);
  for (const align of directChildren(tcPr, W, "vAlign")) align.remove();
  tcPr.append(wEl(cell.ownerDocument, "vAlign", { val: value }));
}

function makeParagraph(doc, runs, { align = "", left = "", hanging = "" } = {}) {
  const p = wEl(doc, "p");
  if (align || left || hanging) {
    const pPr = wEl(doc, "pPr");
    if (align) pPr.append(wEl(doc, "jc", { val: align }));
    if (left || hanging) {
      const indAttrs = {};
      if (left) indAttrs.left = left;
      if (hanging) indAttrs.hanging = hanging;
      pPr.append(wEl(doc, "ind", indAttrs));
    }
    p.append(pPr);
  }
  for (const run of runs) p.append(makeRun(doc, run.text, run));
  return p;
}

function setCellParagraphs(cell, paragraphs) {
  clearCellContent(cell);
  const doc = cell.ownerDocument;
  for (const paragraphData of paragraphs) cell.append(makeParagraph(doc, paragraphData.runs, paragraphData.options || {}));
}

function setCheckboxGlyph(textEl, checked) {
  textEl.textContent = checked ? "☑" : "☐";
  const run = textEl.parentNode;
  if (!run || run.namespaceURI !== W || run.localName !== "r") return;
  let rPr = directChildren(run, W, "rPr")[0];
  if (!rPr) {
    rPr = wEl(run.ownerDocument, "rPr");
    run.insertBefore(rPr, run.firstChild);
  }
  for (const fontEl of directChildren(rPr, W, "rFonts")) fontEl.remove();
  rPr.insertBefore(
    wEl(run.ownerDocument, "rFonts", {
      ascii: "DejaVu Sans",
      hAnsi: "DejaVu Sans",
      cs: "DejaVu Sans",
      eastAsia: "DejaVu Sans",
    }),
    rPr.firstChild
  );
}

function setDocxCheckboxes(root, data) {
  const selected = checkedKeys(data);
  const checkedNumbers = new Set([...selected].map((key) => checkboxIndex[key]).filter(Boolean));
  const controls = all(root, W, "sdt").filter((sdt) => all(sdt, W14, "checkbox").length);
  controls.forEach((sdt, index) => {
    const checked = checkedNumbers.has(index + 1);
    for (const checkedEl of all(sdt, W14, "checked")) checkedEl.setAttributeNS(W14, "w14:val", checked ? "1" : "0");
    const textEl = all(sdt, W, "t").find((node) => ["¨", "þ", "☐", "☒", "☑"].includes(node.textContent || ""));
    if (textEl) setCheckboxGlyph(textEl, checked);
  });
}

function paragraphText(p) {
  return all(p, W, "t")
    .map((node) => node.textContent || "")
    .join("")
    .trim();
}

function ensureParagraphProperties(p) {
  let pPr = directChildren(p, W, "pPr")[0];
  if (!pPr) {
    pPr = wEl(p.ownerDocument, "pPr");
    p.insertBefore(pPr, p.firstChild);
  }
  return pPr;
}

function compactAppendixLayout(root) {
  const body = directChildren(root, W, "body")[0];
  if (!body) return;
  const children = directChildren(body, W, "p");
  const startIndex = children.findIndex((p) => paragraphText(p) === "ZAŁĄCZNIK DO UMOWY ZAMÓWIENIA POJAZDU");
  if (startIndex < 0) return;

  for (const p of children.slice(startIndex)) {
    const pPr = ensureParagraphProperties(p);
    let spacing = directChildren(pPr, W, "spacing")[0];
    if (!spacing) {
      spacing = wEl(p.ownerDocument, "spacing");
      pPr.append(spacing);
    }
    for (const attr of ["before", "after", "beforeAutospacing", "afterAutospacing"]) spacing.removeAttributeNS(W, attr);
    spacing.setAttributeNS(W, "w:before", "0");
    spacing.setAttributeNS(W, "w:after", "0");
    spacing.setAttributeNS(W, "w:line", "155");
    spacing.setAttributeNS(W, "w:lineRule", "exact");

    let snapToGrid = directChildren(pPr, W, "snapToGrid")[0];
    if (!snapToGrid) {
      snapToGrid = wEl(p.ownerDocument, "snapToGrid");
      pPr.append(snapToGrid);
    }
    snapToGrid.setAttributeNS(W, "w:val", "0");
  }
}

function checkboxText(checked) {
  return checked ? "☑" : "☐";
}

function removeParagraphsContainingText(cell, text) {
  for (const p of directChildren(cell, W, "p")) {
    if (paragraphText(p).includes(text)) p.remove();
  }
}

function setExportClientBlock(rows, data) {
  const docValue = data.client.type === "company" ? "" : data.client.document;
  removeParagraphsContainingText(rows[2][0], "Zleceniodawca jest przedsiębiorcą");
  setCellParagraphs(rows[4][0], [
    { runs: [{ text: "Rodzaj, numer i seria dokumentu tożsamości:", bold: true, underline: true }] },
    { runs: [{ text: docValue || " " }] },
  ]);
  setCellParagraphs(rows[5][0], [
    {
      runs: [
        { text: "Nr. tel.:", bold: true, underline: true },
        { text: data.client.phone ? ` ${data.client.phone}` : " " },
      ],
    },
    {
      runs: [
        { text: "E-mail:", bold: true, underline: true },
        { text: data.client.email ? ` ${data.client.email}` : " " },
      ],
    },
  ]);
  setCellParagraphs(rows[6][0], [{ runs: [{ text: " " }] }]);
}

function setExportSubjectBlock(rows, data) {
  const indicatedChecked = data.agreement.client_indicated_vehicle;
  setCellParagraphs(rows[9][0], [
    {
      options: { align: "left" },
      runs: [{ text: exportSubjectLabels.purchase_by_autogood }],
    },
    {
      options: { align: "left" },
      runs: [
        { text: checkboxText(indicatedChecked), font: "DejaVu Sans", size: 28, color: "0070C0" },
        { text: ` ${exportSubjectLabels.client_indicated_vehicle}` },
      ],
    },
  ]);
}

function setExportCompensationBlock(rows, data) {
  const cell = rows[14][0];
  setCellVerticalAlign(cell, "center");
  setCellParagraphs(cell, [
    {
      options: { align: "left" },
      runs: [{ text: "1. Za usługę wyszukania i zakupu pojazdu:", bold: true, underline: true }],
    },
    {
      options: { align: "left" },
      runs: [{ text: data.compensation?.commission || exportDefaultCommission }],
    },
  ]);
}

function applyExportContractLayout(rows, data) {
  setExportClientBlock(rows, data);
  setExportSubjectBlock(rows, data);
  setExportCompensationBlock(rows, data);
}

async function generateDocx() {
  if (!window.JSZip) throw new Error("JSZip nie został załadowany.");
  const data = collectData();
  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error("Nie można pobrać szablonu DOCX.");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  const xmlText = await zip.file("word/document.xml").async("text");
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const root = xml.documentElement;
  const rows = tableRows(root);

  const idValue = data.client.type === "company" ? data.client.nip : data.client.pesel;
  const docValue = data.client.type === "company" ? "" : data.client.document;
  const bodyOther = bodyTypes(data.vehicle.body).includes("inne") && data.vehicle.body.other ? ` ${data.vehicle.body.other}` : "";

  setParagraphText(all(root, W, "p")[0], polishDateLine(data.contract.date), { size: 28 });
  setParagraphText(all(root, W, "p")[1], `UMOWA ZAMÓWIENIA POJAZDU ${contractNumber(data.contract.date, data.contract.sequence)}`, { size: 34, bold: true });
  setParagraphLabelValue(paragraph(rows[2][0], 1), "Imię i Nazwisko/Nazwa:", data.client.name);
  setParagraphText(paragraph(rows[3][0], 2), data.client.address);
  setParagraphText(paragraph(rows[4][0], 2), idValue);
  setParagraphText(paragraph(rows[5][0], 2), docValue);
  setParagraphValueAfterPrefix(paragraph(rows[6][0], 1), "Nr. tel.:", data.client.phone);
  setParagraphValueAfterPrefix(paragraph(rows[6][0], 2), "E-mail:", data.client.email);
  setParagraphLabel(paragraph(rows[7][2], 1), "Marka i model:");
  setParagraphText(paragraph(rows[7][2], 2), data.vehicle.make_model);
  setParagraphValueAfterPrefix(paragraph(rows[10][2], 2), "Wiek (pierwsza rejestracja w roku/latach):", data.vehicle.first_registration);
  setParagraphValueAfterPrefix(paragraph(rows[11][2], 2), "Przebieg do (km):", data.vehicle.mileage_to);
  setParagraphLabelValue(paragraph(rows[11][0], 1), "Budżet:", data.budget.total, { valueBreak: false });
  setParagraphLabelValue(paragraph(rows[12][0], 1), "Zaliczka:", data.budget.advance, { valueBreak: false });
  styleParagraphPrefix(paragraph(rows[12][2], 0), "Nadwozie:");
  setParagraphLastRunText(paragraph(rows[12][2], 0), bodyOther ? bodyOther : " ");
  setParagraphText(paragraph(rows[13][2], 2), data.vehicle.required_equipment);
  setParagraphText(paragraph(rows[15][2], 2), data.vehicle.expected_equipment);
  setDocxCheckboxes(root, data);
  if (isExportContract) applyExportContractLayout(rows, data);
  compactAppendixLayout(root);

  const serialized = new XMLSerializer().serializeToString(xml);
  zip.file("word/document.xml", serialized);
  return new Blob([await zip.generateAsync({ type: "arraybuffer" })], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function imageDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Nie można pobrać obrazu podpisu.");
  const blob = await response.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function setupPdfFont(doc) {
  const response = await fetch(fontUrl);
  if (!response.ok) return;
  const fontBase64 = arrayBufferToBase64(await response.arrayBuffer());
  doc.addFileToVFS("arial.ttf", fontBase64);
  doc.addFont("arial.ttf", "ArialLocal", "normal");
  doc.setFont("ArialLocal", "normal");
}

async function generatePdfBlob() {
  if (!window.jspdf?.jsPDF) throw new Error("jsPDF nie został załadowany.");
  const data = collectData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await setupPdfFont(doc);
  const stamp = await imageDataUrl(stampUrl);

  const pageWidth = 210;
  const margin = 14;
  let y = 14;

  function text(value, x, lineY, size = 9, options = {}) {
    doc.setFontSize(size);
    doc.text(String(value || ""), x, lineY, options);
  }

  function line(label, value) {
    doc.setFontSize(8.5);
    const wrapped = doc.splitTextToSize(`${label}: ${value || ""}`, pageWidth - margin * 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 4.4 + 1.5;
  }

  function section(title) {
    y += 3;
    doc.setFillColor(0, 91, 130);
    doc.rect(margin, y, pageWidth - margin * 2, 7, "F");
    doc.setTextColor(255, 255, 255);
    text(title, pageWidth / 2, y + 5, 9, { align: "center" });
    doc.setTextColor(17, 32, 51);
    y += 11;
  }

  function box(label, checked) {
    doc.rect(margin, y - 3, 3, 3);
    if (checked) {
      doc.line(margin + 0.5, y - 1.5, margin + 1.3, y - 0.5);
      doc.line(margin + 1.3, y - 0.5, margin + 2.7, y - 2.7);
    }
    text(label, margin + 5, y, 8.5);
    y += 5;
  }

  function plainBlock(value) {
    doc.setFontSize(8.5);
    const wrapped = doc.splitTextToSize(String(value || ""), pageWidth - margin * 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 4.4 + 1.5;
  }

  text(polishDateLine(data.contract.date), pageWidth - margin, y, 12, { align: "right" });
  y += 10;
  text(`UMOWA ZAMÓWIENIA POJAZDU ${contractNumber(data.contract.date, data.contract.sequence)}`, pageWidth / 2, y, 15, { align: "center" });
  y += 9;

  section("ZLECENIODAWCA");
  line("Imię i Nazwisko/Nazwa", data.client.name);
  if (!isExportContract) box("Zleceniodawca jest przedsiębiorcą, zawiera umowę o charakterze zawodowym", data.client.is_entrepreneur);
  line("Adres", data.client.address);
  line("PESEL/NIP", data.client.type === "company" ? data.client.nip : data.client.pesel);
  line("Rodzaj, numer i seria dokumentu tożsamości", data.client.document);
  line("Nr. tel.", data.client.phone);
  line("E-mail", data.client.email);

  section("PRZEDMIOT UMOWY");
  const subjects = new Set(data.agreement.subjects || (data.agreement.subject ? [data.agreement.subject] : []));
  if (isExportContract) {
    plainBlock(exportSubjectLabels.purchase_by_autogood);
    box(exportSubjectLabels.client_indicated_vehicle, data.agreement.client_indicated_vehicle);
  } else {
    box("wyszukanie ofert oraz pośrednictwo w zakupie", subjects.has("mediation"));
    box("wyszukanie ofert oraz zakup przez Zleceniobiorcę", subjects.has("purchase_by_autogood"));
    box("zakup z finansowania", subjects.has("financing"));
    box("pojazd wskazany przez Zleceniodawcę", data.agreement.client_indicated_vehicle);
  }

  section("BUDŻET NA ZAKUP");
  line("Budżet", data.budget.total);
  line("Zaliczka", data.budget.advance);

  section("KRYTERIA POSZUKIWAŃ I ZAKUPU");
  line("Marka i model", data.vehicle.make_model);
  line("Paliwo", data.vehicle.fuel.join(", "));
  line("Skrzynia biegów", asArray(data.vehicle.gearbox).join(", "));
  line("Norma euro", data.vehicle.euro_standard);
  line("Wiek", data.vehicle.first_registration);
  line("Przebieg do", data.vehicle.mileage_to);
  line("Nadwozie", bodyLabel(data.vehicle.body));
  box("dopuszczalne auto po kolizjach, ale bez uszkodzenia podłużnic", data.vehicle.allow_collision_without_longitudinals);
  line("Dodatkowe wymagane cechy/wyposażenie", data.vehicle.required_equipment);
  line("Dodatkowe oczekiwane cechy/wyposażenie", data.vehicle.expected_equipment);

  if (y > 245) {
    doc.addPage();
    y = 20;
  }
  y = Math.max(y + 12, 245);
  text("ZLECENIODAWCA:", margin + 20, y, 9, { align: "center" });
  text("ZLECENIOBIORCA:", pageWidth - margin - 25, y, 9, { align: "center" });
  doc.addImage(stamp, "JPEG", pageWidth - margin - 50, y + 2, 38, 24);

  return doc.output("blob");
}

async function convertDocxBlobToPdf(docxBlob, filename) {
  const configuredEndpoint = String(window.AUTOGOOD_PDF_CONVERTER_URL || "").trim();
  const endpoint = configuredEndpoint || defaultPdfConverterUrl;
  if (!configuredEndpoint && /\.github\.io$/i.test(window.location.hostname)) {
    throw new Error("Konwerter DOCX→PDF nie jest jeszcze wdrożony. Podłącz adres backendu w src/pdf-config.js.");
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "X-Filename": encodeURIComponent(filename),
    },
    body: docxBlob,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    if (response.status === 404 && /onrender\.com/i.test(endpoint)) {
      throw new Error("Backend Render dla konwertera PDF nie jest jeszcze wdrożony pod wskazanym adresem.");
    }
    throw new Error(message || "Konwerter PDF nie jest dostępny.");
  }

  return await response.blob();
}

function parseRawText() {
  const text = $("rawClient").value;
  if (!text.trim()) {
    setStatus("Brak danych.");
    return;
  }
  applyParsed(parseRawTextValue(text));
  setStatus("Dane rozpoznane. Sprawdź pola i checkboxy.");
}

async function generateContract() {
  try {
    setStatus("Przygotowuję DOCX...");
    const blob = await generateDocx();
    showDownload(blob, filenameFor(collectData(), "docx"), "DOCX gotowy.", { autoDownload: false });
  } catch (error) {
    setStatus(`Nie udało się przygotować DOCX: ${error.message}`);
  }
}

async function generatePdf() {
  try {
    setStatus("Przygotowuję DOCX do konwersji PDF...");
    const data = collectData();
    const docxBlob = await generateDocx();
    setStatus("Konwertuję DOCX do PDF...");
    const pdfBlob = await convertDocxBlobToPdf(docxBlob, filenameFor(data, "pdf"));
    showDownloads([
      { blob: docxBlob, filename: filenameFor(data, "docx"), readyText: "DOCX gotowy.", autoDownload: false },
      { blob: pdfBlob, filename: filenameFor(data, "pdf"), readyText: "PDF gotowy.", autoDownload: true },
    ]);
  } catch (error) {
    const message = String(error.message || error);
    const converterMessage = message.includes("Failed to fetch") || message.includes("Konwerter PDF")
      ? "Konwerter DOCX→PDF nie jest podłączony. Uruchom lub wdróż backend converter/server.py."
      : message;
    setStatus(`Nie udało się przygotować PDF: ${converterMessage}`);
  }
}

function resetForm() {
  $("contractDate").value = todayISO();
  $("sequence").value = "1";
  document.querySelectorAll("input, textarea, select").forEach((node) => {
    node.disabled = false;
    if (node.id === "contractDate" || node.id === "sequence") return;
    if (node.tagName === "SELECT") {
      node.selectedIndex = 0;
      return;
    }
    if (node.type === "radio" || node.type === "checkbox") node.checked = false;
    else node.value = "";
  });
  setDefaultSelectValues();
  setRadio("clientType", "person");
  setCheckedValues("subject", ["purchase_by_autogood"]);
  setRadio("commissionOption", exportDefaultCommission);
  const entrepreneur = $("clientEntrepreneur");
  if (entrepreneur) entrepreneur.checked = false;
  syncClientTypeRules();
  updateDocumentFileName();
  setStatus("");
}

configureContractVariant();
prepareContractHistoryStorage();
$("contractDate").value = todayISO();
setDefaultSelectValues();
updateDocumentFileName();
renderContractHistory();
$("parseBtn").addEventListener("click", parseRawText);
$("printBtn").addEventListener("click", generatePdf);
$("generateBtn").addEventListener("click", generateContract);
$("resetBtn").addEventListener("click", resetForm);
$("saveDataBtn").addEventListener("click", saveCurrentContractData);
document.querySelectorAll('input[name="clientType"]').forEach((node) => node.addEventListener("change", syncClientTypeRules));
$("vehicleMakeModel").addEventListener("input", updateDocumentFileName);

syncClientTypeRules();
