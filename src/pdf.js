const $ = (id) => document.getElementById(id);

const statusEl = $("status");
const templateUrl = "./contract-pdf-work/templates/Umowa_Zamowienia_Pojazdu_AG_template_signed.docx";
const stampUrl = "./assets/autogood-stamp.jpg";
const fontUrl = "./assets/arial.ttf";
const defaultPdfConverterUrl = "/api/convert-docx-to-pdf";

let currentDownloadUrl = null;

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

function setRadio(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((node) => {
    node.checked = node.value === value;
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
  const raw = cleanupChoice(value);
  const lower = raw.toLowerCase();
  for (const body of ["sedan", "kombi", "coupe"]) {
    if (new RegExp(`\\b${body}\\b`).test(lower)) return { type: body, other: "" };
  }
  const other = raw.match(/inne\s*:\s*(.+)/i)?.[1];
  if (other) return { type: "inne", other: normalizeSpace(other) };
  if (raw) return { type: "inne", other: raw };
  return { type: "", other: "" };
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
  const lower = cleanupChoice(value).toLowerCase();
  if (lower.includes("automat")) return "automatyczna";
  if (lower.includes("auto")) return "automatyczna";
  if (lower.includes("manual")) return "manualna";
  return "";
}

function parseDocumentValue(text) {
  const compact = normalizeSpace(text);
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
  const compact = normalizeSpace(text);
  const postalAddress = compact.match(
    /(?:ul\.?\s+)?[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,4}\s+\d+[A-Z]?(?:[,\s]+[A-Z]{1,4}\/\d+)?[,\s]+\d{2}-\d{3}\s+[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,3}/u
  );
  if (postalAddress) return stripKnownNoise(postalAddress[0]);
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
  const compact = normalizeSpace(text);
  const labeled = extractLabeled(compact, labels.client);
  if (labeled) return stripKnownNoise(labeled);
  if (isCompany) {
    const company = compact.match(/\b[A-Z0-9ĄĆĘŁŃÓŚŹŻ][A-Z0-9ĄĆĘŁŃÓŚŹŻ .&-]{2,}?(?:JDG|sp\.?\s*z\.?\s*o\.?o\.?|spółka|spolka|s\.a\.)\b/i)?.[0];
    if (company) return stripKnownNoise(company);
  }
  const beforeAddress = compact.split(/\b(?:Adres|Адрес|PESEL|NIP|Dokument|Telefon|Email|Auto|Pojazd)\b/i)[0];
  const upperPerson = beforeAddress.match(/[\p{Lu}]{2,}(?:\s+[\p{Lu}]{2,}){1,3}/u)?.[0];
  if (upperPerson) return stripKnownNoise(upperPerson);
  const person = beforeAddress.replace(/\b(?:Klient|Client|Клиент)\b\s*(?::|=|–|-)?/i, "").match(/\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+){1,3}\b/u)?.[0];
  return stripKnownNoise(person || "");
}

function setStatus(text) {
  if (currentDownloadUrl) {
    URL.revokeObjectURL(currentDownloadUrl);
    currentDownloadUrl = null;
  }
  statusEl.innerHTML = "";
  statusEl.textContent = text;
}

function showDownload(blob, filename, readyText) {
  if (currentDownloadUrl) URL.revokeObjectURL(currentDownloadUrl);
  currentDownloadUrl = URL.createObjectURL(blob);
  statusEl.innerHTML = "";

  const label = document.createElement("span");
  label.textContent = `${readyText} `;
  const link = document.createElement("a");
  link.href = currentDownloadUrl;
  link.download = filename;
  link.textContent = filename;
  statusEl.append(label, link);
  link.click();
}

function filenameFor(data, extension) {
  const make = normalizeSpace(data.vehicle.make_model || "AUTO").split(/\s+/)[0] || "AUTO";
  const slug = make
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `Umowa_Zamówienia_Pojazdu_${slug || "AUTO"}.${extension}`;
}

function syncClientTypeRules() {
  const isCompany = checkedRadio("clientType") === "company";
  $("clientEntrepreneur").checked = isCompany;
  $("clientEntrepreneur").disabled = isCompany;
  $("clientDocument").disabled = isCompany;
  if (isCompany) $("clientDocument").value = "";
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
  const rawAddressValue = extractLabeled(compact, labels.address) || addressFallback(compact);
  const addressValue = cleanAddressValue(rawAddressValue, { phone, email, pesel, nip, document: documentValue });
  const yearValue = hasVehicle ? extractLabeled(compact, labels.year) || firstRegistrationFallback(vehicleText) : "";
  const mileageValue = hasVehicle ? extractLabeled(compact, labels.mileage) || mileageFallback(vehicleText) : "";
  const fuelValue = hasVehicle ? extractLabeled(compact, labels.fuel) || vehicleText : "";
  const gearboxValue = hasVehicle ? extractLabeled(compact, labels.gearbox) || vehicleText : "";
  const bodyValue = hasVehicle ? extractLabeled(compact, labels.body) || vehicleText : "";
  const requiredEquipment = hasVehicle ? extractLabeled(compact, labels.extra) : "";
  const expectedEquipment = hasVehicle ? extractLabeled(compact, labels.expectedExtra) : "";

  return {
    client: {
      type: clientType,
      name: parseName(compact, isCompany),
      address: addressValue,
      identifier: isCompany ? nip : pesel,
      document: isCompany ? "" : documentValue,
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
    setRadio("clientType", data.client.type);
    syncClientTypeRules();
  }
  $("clientName").value = data.client?.name || $("clientName").value;
  $("clientAddress").value = data.client?.address || $("clientAddress").value;
  $("clientIdentifier").value = data.client?.identifier || $("clientIdentifier").value;
  $("clientDocument").value = data.client?.document || $("clientDocument").value;
  $("clientPhone").value = data.client?.phone || $("clientPhone").value;
  $("clientEmail").value = data.client?.email || $("clientEmail").value;
  $("budgetTotal").value = data.budget?.total || $("budgetTotal").value;
  $("budgetCurrency").value = data.budget?.total_currency || $("budgetCurrency").value;
  $("budgetAdvance").value = data.budget?.advance || $("budgetAdvance").value;
  $("advanceCurrency").value = data.budget?.advance_currency || $("advanceCurrency").value;
  $("vehicleMakeModel").value = data.vehicle?.make_model || $("vehicleMakeModel").value;
  if (data.vehicle?.fuel) setFuel(data.vehicle.fuel);
  if (data.vehicle?.gearbox) setRadio("gearbox", data.vehicle.gearbox);
  if (data.vehicle?.body?.type) setRadio("bodyType", data.vehicle.body.type);
  $("bodyOther").value = data.vehicle?.body?.other || $("bodyOther").value;
  $("firstRegistration").value = data.vehicle?.first_registration || $("firstRegistration").value;
  $("mileageTo").value = data.vehicle?.mileage_to || $("mileageTo").value;
  $("requiredEquipment").value = data.vehicle?.required_equipment || $("requiredEquipment").value;
  $("expectedEquipment").value = data.vehicle?.expected_equipment || $("expectedEquipment").value;
  syncClientTypeRules();
}

function collectData() {
  const clientType = checkedRadio("clientType") || "person";
  const isCompany = clientType === "company";
  return {
    contract: {
      date: $("contractDate").value || todayISO(),
      sequence: Number($("sequence").value || 1),
    },
    client: {
      type: clientType,
      is_entrepreneur: isCompany || $("clientEntrepreneur").checked,
      name: $("clientName").value.trim(),
      address: $("clientAddress").value.trim(),
      pesel: isCompany ? "" : $("clientIdentifier").value.trim(),
      nip: isCompany ? $("clientIdentifier").value.trim() : "",
      document: isCompany ? "" : $("clientDocument").value.trim(),
      phone: $("clientPhone").value.trim(),
      email: $("clientEmail").value.trim(),
    },
    agreement: {
      subject: checkedRadio("subject") || "purchase_by_autogood",
      client_indicated_vehicle: $("clientIndicatedVehicle").checked,
    },
    budget: {
      total: formatMoneyValue($("budgetTotal").value, $("budgetCurrency").value),
      advance: formatMoneyValue($("budgetAdvance").value, $("advanceCurrency").value),
    },
    vehicle: {
      make_model: $("vehicleMakeModel").value.trim(),
      fuel: fuelValues(),
      gearbox: checkedRadio("gearbox"),
      euro_standard: checkedRadio("euroStandard"),
      first_registration: $("firstRegistration").value.trim(),
      mileage_to: $("mileageTo").value.trim(),
      body: {
        type: checkedRadio("bodyType"),
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
  if (data.client.is_entrepreneur || data.client.type === "company") checks.add("client_is_entrepreneur");
  if (data.agreement.subject === "mediation") checks.add("subject_mediation");
  if (data.agreement.subject === "purchase_by_autogood") checks.add("subject_purchase_by_autogood");
  if (data.agreement.subject === "financing") checks.add("subject_financing");
  if (data.agreement.client_indicated_vehicle) checks.add("subject_client_indicated_vehicle");
  for (const fuel of data.vehicle.fuel || []) checks.add(`fuel_${fuel}`);
  if (data.vehicle.gearbox) checks.add(`gearbox_${data.vehicle.gearbox}`);
  if (data.vehicle.euro_standard) checks.add(`euro_${data.vehicle.euro_standard}`);
  if (data.vehicle.body.type) checks.add(`body_${data.vehicle.body.type}`);
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

function makeRun(doc, text, { size = 16, bold = false, breakBefore = false } = {}) {
  const r = wEl(doc, "r");
  const rPr = wEl(doc, "rPr");
  rPr.append(wEl(doc, "rFonts", { ascii: "Calibri", hAnsi: "Calibri", cs: "Calibri" }));
  if (bold) rPr.append(wEl(doc, "b"));
  else rPr.append(wEl(doc, "b", { val: "0" }), wEl(doc, "bCs", { val: "0" }));
  rPr.append(wEl(doc, "sz", { val: String(size) }));
  r.append(rPr);
  if (breakBefore) r.append(wEl(doc, "br"));
  const t = wEl(doc, "t");
  t.setAttribute("xml:space", "preserve");
  t.textContent = text || "";
  r.append(t);
  return r;
}

function setParagraphText(p, text, { size = 16, bold = false } = {}) {
  for (const run of directChildren(p, W, "r")) run.remove();
  const doc = p.ownerDocument;
  p.append(makeRun(doc, text, { size, bold }));
}

function setParagraphLabelValue(p, label, value, { size = 16 } = {}) {
  for (const run of directChildren(p, W, "r")) run.remove();
  const doc = p.ownerDocument;
  p.append(makeRun(doc, label, { size, bold: false }));
  if (value) p.append(makeRun(doc, value, { size, bold: false, breakBefore: true }));
}

function tableRows(root) {
  const tbl = all(root, W, "tbl")[0];
  return directChildren(tbl, W, "tr").map((row) => directChildren(row, W, "tc"));
}

function paragraph(cell, index) {
  return directChildren(cell, W, "p")[index];
}

function setDocxCheckboxes(root, data) {
  const selected = checkedKeys(data);
  const checkedNumbers = new Set([...selected].map((key) => checkboxIndex[key]).filter(Boolean));
  const controls = all(root, W, "sdt").filter((sdt) => all(sdt, W14, "checkbox").length);
  controls.forEach((sdt, index) => {
    const checked = checkedNumbers.has(index + 1);
    for (const checkedEl of all(sdt, W14, "checked")) checkedEl.setAttributeNS(W14, "w14:val", checked ? "1" : "0");
    const textEl = all(sdt, W, "t")[0];
    if (textEl) textEl.textContent = checked ? "þ" : "¨";
  });
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
  const bodyOther = data.vehicle.body.type === "inne" && data.vehicle.body.other ? ` ${data.vehicle.body.other}` : "";

  setParagraphText(all(root, W, "p")[0], polishDateLine(data.contract.date), { size: 28 });
  setParagraphText(all(root, W, "p")[1], `UMOWA ZAMÓWIENIA POJAZDU ${contractNumber(data.contract.date, data.contract.sequence)}`, { size: 34, bold: true });
  setParagraphLabelValue(paragraph(rows[2][0], 1), "Imię i Nazwisko/Nazwa:", data.client.name, { size: 16 });
  setParagraphText(paragraph(rows[3][0], 2), data.client.address, { size: 16 });
  setParagraphText(paragraph(rows[4][0], 2), idValue, { size: 16 });
  setParagraphText(paragraph(rows[5][0], 2), docValue, { size: 16 });
  setParagraphText(paragraph(rows[6][0], 1), `Nr. tel.: ${data.client.phone}`, { size: 16 });
  setParagraphText(paragraph(rows[6][0], 2), `E-mail: ${data.client.email}`, { size: 16 });
  setParagraphText(paragraph(rows[7][2], 2), data.vehicle.make_model, { size: 16 });
  setParagraphText(paragraph(rows[10][2], 2), `Wiek (pierwsza rejestracja w roku/latach): ${data.vehicle.first_registration}`, { size: 16 });
  setParagraphText(paragraph(rows[11][2], 2), `Przebieg do (km): ${data.vehicle.mileage_to}`, { size: 16 });
  setParagraphText(paragraph(rows[11][0], 1), `Budżet: ${data.budget.total}`, { size: 16 });
  setParagraphText(paragraph(rows[12][0], 1), `Zaliczka: ${data.budget.advance}`, { size: 16 });
  if (bodyOther) setParagraphText(paragraph(rows[12][2], 0), `Nadwozie: ${bodyOther}`, { size: 16 });
  setParagraphText(paragraph(rows[13][2], 2), data.vehicle.required_equipment, { size: 16 });
  setParagraphText(paragraph(rows[15][2], 2), data.vehicle.expected_equipment, { size: 16 });
  setDocxCheckboxes(root, data);

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

  text(polishDateLine(data.contract.date), pageWidth - margin, y, 12, { align: "right" });
  y += 10;
  text(`UMOWA ZAMÓWIENIA POJAZDU ${contractNumber(data.contract.date, data.contract.sequence)}`, pageWidth / 2, y, 15, { align: "center" });
  y += 9;

  section("ZLECENIODAWCA");
  line("Imię i Nazwisko/Nazwa", data.client.name);
  box("Zleceniodawca jest przedsiębiorcą, zawiera umowę o charakterze zawodowym", data.client.is_entrepreneur);
  line("Adres", data.client.address);
  line("PESEL/NIP", data.client.type === "company" ? data.client.nip : data.client.pesel);
  line("Rodzaj, numer i seria dokumentu tożsamości", data.client.document);
  line("Nr. tel.", data.client.phone);
  line("E-mail", data.client.email);

  section("PRZEDMIOT UMOWY");
  box("wyszukanie ofert oraz pośrednictwo w zakupie", data.agreement.subject === "mediation");
  box("wyszukanie ofert oraz zakup przez Zleceniobiorcę", data.agreement.subject === "purchase_by_autogood");
  box("zakup z finansowania", data.agreement.subject === "financing");
  box("pojazd wskazany przez Zleceniodawcę", data.agreement.client_indicated_vehicle);

  section("BUDŻET NA ZAKUP");
  line("Budżet", data.budget.total);
  line("Zaliczka", data.budget.advance);

  section("KRYTERIA POSZUKIWAŃ I ZAKUPU");
  line("Marka i model", data.vehicle.make_model);
  line("Paliwo", data.vehicle.fuel.join(", "));
  line("Skrzynia biegów", data.vehicle.gearbox);
  line("Norma euro", data.vehicle.euro_standard);
  line("Wiek", data.vehicle.first_registration);
  line("Przebieg do", data.vehicle.mileage_to);
  line("Nadwozie", data.vehicle.body.type === "inne" ? data.vehicle.body.other : data.vehicle.body.type);
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
  doc.addImage(stamp, "JPEG", pageWidth - margin - 50, y + 5, 38, 24);

  return doc.output("blob");
}

async function convertDocxBlobToPdf(docxBlob, filename) {
  const endpoint = window.AUTOGOOD_PDF_CONVERTER_URL || defaultPdfConverterUrl;
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
    showDownload(blob, filenameFor(collectData(), "docx"), "DOCX gotowy.");
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
    const blob = await convertDocxBlobToPdf(docxBlob, filenameFor(data, "pdf"));
    showDownload(blob, filenameFor(data, "pdf"), "PDF gotowy.");
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
  setRadio("clientType", "person");
  setRadio("subject", "purchase_by_autogood");
  $("clientEntrepreneur").checked = false;
  syncClientTypeRules();
  setStatus("");
}

$("contractDate").value = todayISO();
$("parseBtn").addEventListener("click", parseRawText);
$("printBtn").addEventListener("click", generatePdf);
$("generateBtn").addEventListener("click", generateContract);
$("resetBtn").addEventListener("click", resetForm);
document.querySelectorAll('input[name="clientType"]').forEach((node) => node.addEventListener("change", syncClientTypeRules));

syncClientTypeRules();
