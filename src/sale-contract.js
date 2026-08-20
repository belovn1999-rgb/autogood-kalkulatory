const saleStorageKey = "autogoodSaleContract.v2";

const form = document.querySelector("#saleContractForm");
const saveButton = document.querySelector("#saveSaleContract");
const resetButton = document.querySelector("#resetSaleContract");
const generateButton = document.querySelector("#generateSaleDocx");
const generatePdfButton = document.querySelector("#generateSalePdf");
const encryptPdfButton = document.querySelector("#encryptSalePdf");
const pullCrmDataButton = document.querySelector("#pullSaleCrmDataBtn");
const printButton = document.querySelector("#printSaleContract");
const parseButton = document.querySelector("#parseSaleData");
const statusEl = document.querySelector("#saleStatus");
const rawSaleDataInput = document.querySelector("#rawSaleData");
const saleHistoryList = document.querySelector("#saleHistoryList");
const damageCanvas = document.querySelector("#damageMapCanvas");
const damageMarksInput = document.querySelector("#damageMarks");
const clearDamageButton = document.querySelector("#clearDamageMarks");
const saleTemplateUrl = "./contract-pdf-work/templates/Umowa_Sprzedazy_AG_template.docx?v=20260613-3";
const defaultPdfConverterUrl = "/api/convert-docx-to-pdf";
const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const W14 = "http://schemas.microsoft.com/office/word/2010/wordml";
const saleHistoryKey = "autogoodSaleContractHistory.v1";
const saleHistoryLimit = 5;

let currentDownloadUrls = [];
let currentPrintUrl = null;
let saleTemplateBytesPromise = null;
const activeGenerationOperations = new Set();

const checklistGroups = {
  documentsChecklist: [
    ["emissionEuro6", "Model spełnia normę emisji EURO6 (benzyna) lub EURO6 (diesel)"],
    ["spareKey", "Zapasowy kluczyk"],
    ["serviceBook", "Książka serwisowa lub inna dokumentacja serwisowania"],
    ["manualBook", "Instrukcja obsługi producenta"],
    ["registrationCertificate", "Wydano dowód rejestracyjny"],
    ["intermediateContracts", "Wydano ciąg umów pośrednich"],
    ["foreignRegistrationCertificate", "Wydano dowód rejestracyjny zagraniczny"],
    ["exciseProof", "Wydano dowód zapłaty akcyzy"],
    ["technicalInspectionProof", "Wydano dowód badania technicznego"],
    ["noPlatesStatement", "Wydano oświadczenie o braku tablic"],
  ],
  purchaseChecklist: [
    ["testDrive", "Kupujący odbył jazdę próbną kierując autem"],
    ["checkedAtStation", "Kupujący sprawdzał pojazd w SKP lub w warsztacie"],
    ["checkedOnLift", "Kupujący lub osoba upoważniona skorzystał z podnośnika, najazdu lub kanału"],
    ["checkedListingEquipment", "Kupujący sprawdził zgodność ogłoszenia ze stanem rzeczywistym, wyposażenie i działanie"],
    ["checkedControls", "Kupujący sprawdzał działanie podzespołów i przełączników pojazdu"],
    ["paintMeterCheck", "Kupujący zbadał pojazd miernikiem lakieru i otrzymał informacje o prawidłowych wartościach"],
  ],
};

const technicalGroups = [
  {
    title: "Układ napędowy, silnik, turbosprężarka",
    items: [
      ["engineWorks", "Silnik i turbosprężarka działają"],
      ["noOilFilterData", "Brak danych o wymianie oleju i filtrów"],
      ["noTimingData", "Brak danych o wymianie rozrządu"],
      ["reducedEnginePower", "Obniżona moc silnika"],
      ["engineLeaks", "Wycieki lub ubytki cieczy eksploatacyjnych"],
    ],
  },
  {
    title: "Skrzynia biegów i układ sprzęgła",
    items: [
      ["gearboxNoOilData", "Brak danych o wymianie oleju"],
      ["gearboxLeaks", "Wycieki"],
      ["gearboxWear", "Oznaki zużycia skrzyni biegów"],
      ["clutchWear", "Oznaki zużycia układu sprzęgła"],
      ["clutchNoise", "Głośna praca układu sprzęgła"],
    ],
  },
  {
    title: "Układ kierowniczy, osie, półosie, wały",
    items: [
      ["steeringPlay", "Luzy"],
      ["steeringLeaks", "Wycieki"],
      ["steeringWear", "Oznaki zużycia"],
    ],
  },
  {
    title: "Hamulce",
    items: [
      ["brakeFluidRecommended", "Zalecana wymiana płynu hamulcowego"],
      ["brakeWear", "Oznaki zużycia"],
      ["brakeReducedEfficiency", "Obniżona skuteczność"],
    ],
  },
  {
    title: "Układ wydechowy, DPF, katalizator",
    items: [
      ["exhaustCorrosion", "Korozja"],
      ["catalystPresent", "Katalizator obecny"],
      ["dpfPresent", "Filtr DPF/FAP obecny"],
      ["catalystReducedEfficiency", "Zmniejszona wydajność katalizatora/filtra"],
      ["exhaustCleaningWear", "Oznaki zużycia układu oczyszczania spalin"],
    ],
  },
  {
    title: "Klimatyzacja i chłodzenie silnika",
    items: [
      ["acWorks", "Klimatyzacja działa"],
      ["acCoolantLoss", "Ubywanie czynnika chłodzącego"],
      ["coolingWorks", "Układ chłodzenia silnika działa"],
      ["coolingLeaks", "Wycieki z układu chłodzenia silnika"],
    ],
  },
  {
    title: "Nadwozie",
    items: [
      ["bodyCorrosion", "Korozja"],
      ["bodyRepainted", "Ponowne lakierowanie"],
      ["bodySheetMetalRepair", "Naprawy blacharsko-lakiernicze"],
      ["bodyStructuralDamage", "Uszkodzenia części konstrukcyjnych"],
      ["bodyNonTechRepair", "Naprawy nietechnologiczne"],
    ],
  },
  {
    title: "Wnętrze, zużycie oraz przebieg",
    items: [
      ["interiorHeavyWear", "Duże zużycie"],
      ["interiorScratches", "Zarysowania/zadrapania"],
      ["higherMileageSigns", "Oznaki przebiegu wyższego od drogomierza"],
    ],
  },
  {
    title: "Dodatki",
    items: [
      ["extraTires", "Dodatkowe opony"],
      ["extraRims", "Dodatkowe felgi"],
      ["spareWheel", "Koło zapasowe lub zestaw naprawczy"],
      ["temporaryPlates", "Tablice ekspozycyjne"],
      ["navigationCard", "Płyta/karta do nawigacji"],
    ],
  },
  {
    title: "Rabat",
    items: [
      ["discountGiven", "Udzielono rabatu z pierwotnej ceny"],
      ["discountWearReason", "Powód - duże zużycie"],
      ["discountPostPurchaseRepairs", "Powód - naprawy konieczne po zakupie dla zaliczenia przeglądu"],
      ["discountEngineFaults", "Powód - usterki silnika"],
    ],
  },
];

const defaultChecklistValues = {
  emissionEuro6: "tak",
  spareKey: "tak",
  serviceBook: "tak",
  manualBook: "tak",
  registrationCertificate: "nie",
  intermediateContracts: "nie",
  foreignRegistrationCertificate: "tak",
  exciseProof: "tak",
  technicalInspectionProof: "tak",
  noPlatesStatement: "tak",
  testDrive: "tak",
  checkedAtStation: "nie",
  checkedOnLift: "nie",
  checkedListingEquipment: "tak",
  checkedControls: "tak",
  paintMeterCheck: "tak",
  engineWorks: "tak",
  noOilFilterData: "tak",
  noTimingData: "tak",
  reducedEnginePower: "nie",
  engineLeaks: "nie",
  gearboxNoOilData: "tak",
  gearboxLeaks: "nie",
  gearboxWear: "",
  clutchWear: "",
  clutchNoise: "nie",
  steeringPlay: "nie",
  steeringLeaks: "nie",
  steeringWear: "tak",
  acWorks: "tak",
  acCoolantLoss: "nie",
  coolingWorks: "tak",
  coolingLeaks: "nie",
  interiorHeavyWear: "nie",
  interiorScratches: "tak",
  higherMileageSigns: "nie",
  extraTires: "",
  extraRims: "",
  spareWheel: "tak",
  temporaryPlates: "nie",
  navigationCard: "nie",
  discountGiven: "nie",
  discountWearReason: "nie",
  discountPostPurchaseRepairs: "nie",
  discountEngineFaults: "nie",
};

function createYesNoRow(name, label) {
  const row = document.createElement("div");
  row.className = "yesNoRow";
  // The <span> after each input is the visible segment: styling it via
  // input:checked + span is what makes the selected state repaint reliably.
  row.innerHTML = `
    <span>${label}</span>
    <label><input type="radio" name="${name}" value="tak" /><span>TAK</span></label>
    <label><input type="radio" name="${name}" value="nie" /><span>NIE</span></label>
    <label><input type="radio" name="${name}" value="" /><span>—</span></label>
  `;
  return row;
}

function renderChecklists() {
  Object.entries(checklistGroups).forEach(([containerId, items]) => {
    const container = document.querySelector(`#${containerId}`);
    items.forEach(([name, label]) => container.appendChild(createYesNoRow(name, label)));
  });

  const technicalContainer = document.querySelector("#technicalChecklists");
  technicalGroups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "saleChecklistGroup";
    const heading = document.createElement("h3");
    heading.textContent = group.title;
    section.appendChild(heading);
    group.items.forEach(([name, label]) => section.appendChild(createYesNoRow(name, label)));
    technicalContainer.appendChild(section);
  });
}

renderChecklists();

const fields = [...form.querySelectorAll("input[name], select[name], textarea[name]")];
let damageMarks = [];

function applyDefaultChecklistValues() {
  Object.entries(defaultChecklistValues).forEach(([name, value]) => {
    const option = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (option) option.checked = true;
  });
}

function applyDefaultFieldValues() {
  setField("contractDate", todayISO());
  setField("contractPlace", "seller");
  setField("saleCurrency", "PLN");
  setField("generalWear", "przecietne");
}

function collectSaleContract() {
  const data = {};
  fields.forEach((field) => {
    if (field.type === "radio") {
      if (!(field.name in data)) data[field.name] = "";
      if (field.checked) data[field.name] = field.value;
      return;
    }
    if (field.type === "checkbox") {
      data[field.name] = field.checked;
      return;
    }
    data[field.name] = field.value;
  });
  data.updatedAt = new Date().toISOString();
  return data;
}

function applySaleContract(data) {
  fields.forEach((field) => {
    if (data[field.name] === undefined) return;
    if (field.type === "radio") {
      field.checked = field.value === data[field.name];
      return;
    }
    if (field.type === "checkbox") {
      field.checked = Boolean(data[field.name]);
      return;
    }
    field.value = field.type === "date" ? normalizeDateForInput(data[field.name]) : data[field.name];
  });
  restoreDamageMarks(data.damageMarks);
  updateSummary();
}

function readSaleHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(saleHistoryKey) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, saleHistoryLimit) : [];
  } catch {
    return [];
  }
}

function writeSaleHistory(items) {
  localStorage.setItem(saleHistoryKey, JSON.stringify(items.slice(0, saleHistoryLimit)));
}

function saleHistoryTitle(entry) {
  const data = entry.data || {};
  const buyer = normalizeSpace(data.buyerName || "Bez kupującego");
  const vehicle = normalizeSpace(data.vehicleMakeModel || "AUTO");
  return `${buyer} · ${vehicle}`;
}

function saleHistoryMeta(entry) {
  const data = entry.data || {};
  const date = polishDate(data.contractDate) || "bez daty";
  const price = formatGrossAmount(data.salePrice, data.saleCurrency) || "bez ceny";
  const savedAt = entry.savedAt ? new Date(entry.savedAt) : null;
  const savedLabel = savedAt && !Number.isNaN(savedAt.getTime()) ? savedAt.toLocaleDateString("pl-PL") : "";
  return `${date} · ${price}${savedLabel ? ` · zapisano ${savedLabel}` : ""}`;
}

function renderSaleHistory() {
  if (!saleHistoryList) return;
  saleHistoryList.innerHTML = "";
  const history = readSaleHistory();
  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "Brak zapisanych zmian.";
    saleHistoryList.append(empty);
    return;
  }

  history.forEach((entry, index) => {
    const item = document.createElement("div");
    item.className = "history-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-restore";
    button.dataset.index = String(index);

    const title = document.createElement("strong");
    title.textContent = saleHistoryTitle(entry);
    const meta = document.createElement("span");
    meta.textContent = saleHistoryMeta(entry);
    button.append(title, meta);
    button.addEventListener("click", () => {
      applySaleContract(entry.data || {});
      setStatus("Dane z historii wczytane.");
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "history-delete";
    remove.setAttribute("aria-label", "Usuń zapis z historii");
    remove.title = "Usuń z historii";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      writeSaleHistory(history.filter((candidate, candidateIndex) => (entry.id ? candidate.id !== entry.id : candidateIndex !== index)));
      renderSaleHistory();
      setStatus("Zapis usunięty z historii.");
    });

    item.append(button, remove);
    saleHistoryList.append(item);
  });
}

function saveSaleHistoryEntry(data) {
  const history = readSaleHistory().filter((entry) => JSON.stringify(entry.data) !== JSON.stringify(data));
  history.unshift({
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
    data,
  });
  writeSaleHistory(history);
  renderSaleHistory();
}

function valueOrFallback(value) {
  return String(value || "").trim() || "Nie wskazano";
}

function formatGrossAmount(value, currency = "PLN") {
  const raw = normalizeSpace(value);
  if (!raw || raw === "-") return raw;
  const normalizedCurrency = currency === "EUR" ? "EUR" : "PLN";
  const withoutGross = raw.replace(/\b(?:PLN|EUR)\b/gi, "").replace(/\bbrutto\b/gi, "").trim();
  if (!/\d/.test(withoutGross)) return raw;
  return `${withoutGross} ${normalizedCurrency} brutto`;
}

function formatDiscountBenefit(value, currency) {
  const raw = normalizeSpace(value);
  if (!raw || raw === "-") return raw || "-";
  if (!/\d/.test(raw)) return raw;
  return formatGrossAmount(raw, currency);
}

function formatMileage(value) {
  const raw = normalizeSpace(value);
  if (!raw) return "";
  if (/\b(?:km|км)\b/i.test(raw)) return raw;
  return /\d/.test(raw) ? `${raw} km` : raw;
}

function updateSummary() {
  const data = collectSaleContract();
  document.querySelector("#saleSummaryBuyer").textContent = valueOrFallback(data.buyerName);
  document.querySelector("#saleSummaryVehicle").textContent = valueOrFallback(data.vehicleMakeModel);
  document.querySelector("#saleSummaryVin").textContent = valueOrFallback(data.vehicleVin);
  document.querySelector("#saleSummaryPrice").textContent = valueOrFallback(formatGrossAmount(data.salePrice, data.saleCurrency));
}

function normalizeSpace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeDateForInput(value) {
  const raw = normalizeSpace(value);
  if (!raw) return "";

  let year;
  let month;
  let day;
  let match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    [, year, month, day] = match;
  } else {
    match = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (!match) return "";
    [, day, month, year] = match;
  }

  const normalized = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const parsed = new Date(`${normalized}T12:00:00`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() + 1 !== Number(month) ||
    parsed.getDate() !== Number(day)
  ) {
    return "";
  }
  return normalized;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setField(name, value) {
  const field = form.querySelector(`[name="${name}"]`);
  if (!field || !value) return;
  field.value = field.type === "date" ? normalizeDateForInput(value) : value;
}

function setBuyerIdentifierType(value) {
  const normalizedValue = value === "nip" ? "nip" : "pesel";
  const option = form.querySelector(`input[name="buyerIdentifierType"][value="${normalizedValue}"]`);
  if (option) {
    option.checked = true;
    return;
  }

  const field = form.querySelector('[name="buyerIdentifierType"]');
  if (field) field.value = normalizedValue;
}

function stripKnownNoise(value) {
  return normalizeSpace(String(value || "").replace(/^[-–—•*]+/, "").replace(/^[/:;,.\s-]+|[/:;,.\s-]+$/g, ""));
}

const saleRecognitionLabels = {
  buyer: ["Kupujący", "Nabywca", "Zleceniodawca", "Klient", "Client", "Клиент", "Firma", "Nazwa", "Imię i nazwisko", "Imie i nazwisko", "Imię i nazwisko / Nazwa"],
  buyerType: ["Rodzaj klienta", "Typ klienta", "Тип клиента"],
  address: ["Adres", "Адрес", "Address", "Siedziba", "Miejsce zamieszkania"],
  pesel: ["PESEL"],
  nip: ["NIP"],
  document: ["Dokument", "Документ", "Dowód", "Dowod", "DO", "Paszport", "Karta pobytu"],
  phone: ["Telefon", "Nr. tel", "Nr tel", "Телефон", "Tel", "Phone"],
  email: ["Email", "E-mail", "Mail", "Adres email", "Adres e-mail", "Имейл"],
  vehicleMarker: ["Auto", "Pojazd", "Samochód", "Samochod", "Авто", "Автомобиль"],
  makeModel: ["Marka i model", "Marka model", "Auto", "Pojazd", "Samochód", "Samochod"],
  make: ["Marka", "Марка"],
  model: ["Model", "Модель"],
  vin: ["VIN", "Nr VIN", "Numer VIN"],
  mileage: ["Przebieg", "Stan licznika", "Licznik", "Пробег"],
  price: ["Cena", "Cena sprzedaży", "Cena pojazdu", "Kwota", "Budżet", "Budzet", "Бюджет"],
  discount: ["Rabat", "Zniżka", "Znizka", "Korzyść", "Korzyść po negocjacjach"],
  firstRegistration: ["Pierwsza rejestracja", "Data pierwszej rejestracji", "Rok pierwszej rejestracji", "Rocznik", "Rok"],
  fuel: ["Paliwo", "Топливо", "Napęd", "Naped"],
  technicalInspection: ["Badanie techniczne", "Data badania technicznego", "Data ostatniego badania technicznego", "Przegląd", "Przeglad"],
};

const saleAllLabels = Object.values(saleRecognitionLabels).flat();
const saleLooseStopLabels = saleAllLabels.filter((label) => !saleRecognitionLabels.vehicleMarker.includes(label));
const plus48PhonePattern = /\+48[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/g;

function extractLabeled(text, variants) {
  const labelPattern = variants.map(escapeRegExp).join("|");
  const separatedNextPattern = saleAllLabels.map(escapeRegExp).join("|");
  const looseNextPattern = saleLooseStopLabels.map(escapeRegExp).join("|");
  const pattern = new RegExp(
    `(?:^|[\\s,;|\\n])(?:${labelPattern})\\s*(?::|=|–|-)?\\s*(.*?)(?=(?:[\\s,;|\\n]+(?:${separatedNextPattern})\\s*(?::|=|–|-)\\s*)|(?:[\\s,;|\\n]+(?:${looseNextPattern})\\s+)|$)`,
    "is"
  );
  return normalizeSpace(text.match(pattern)?.[1] || "");
}

function withoutPlus48Phones(value) {
  return String(value || "").replace(plus48PhonePattern, " ");
}

function linesFromText(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map(normalizeSpace)
    .filter(Boolean);
}

function isAddressStreetLine(line) {
  const clean = stripKnownNoise(line);
  return /^(?:ul\.?|al\.?|pl\.?|os\.?|aleja)?\s*[\p{Lu}\p{Ll}][\p{L}.'-]+(?:\s+[\p{Lu}\p{Ll}][\p{L}.'-]+){0,4}\s+\d+[A-Za-z]?(?:[/-]\d+[A-Za-z]?)?$/u.test(clean);
}

function isPostalCityLine(line) {
  return /^\d{2}-\d{3}\s+[\p{Lu}\p{Ll}][\p{L}.'-]+(?:\s+[\p{Lu}\p{Ll}][\p{L}.'-]+){0,4}$/u.test(stripKnownNoise(line));
}

function isClientDataMarkerLine(line) {
  return /^(?:PESEL|NIP|DO|Dow[oó]d|Dokument|Paszport|Karta pobytu|Telefon|Tel\.?|Email|E-mail|Mail|Auto|Pojazd|Marka|Model|Cena|Rabat|VIN|Przebieg)\b/i.test(line);
}

const polishCityPattern =
  /\b(?:Warszawa|Krak[oó]w|Ł[oó]d[zź]|Lodz|Wrocław|Wroclaw|Pozna[nń]|Gda[nń]sk|Szczecin|Bydgoszcz|Lublin|Białystok|Bialystok|Katowice|Gdynia|Częstochowa|Czestochowa|Radom|Toru[nń]|Torun|Sosnowiec|Kielce|Rzesz[oó]w|Gliwice|Zabrze|Olsztyn|Bielsko(?:-| )Biała|Bielsko(?:-| )Biala|Bytom|Zielona G[oó]ra|Rybnik|Ruda Śląska|Ruda Slaska|Opole|Tychy|Gorz[oó]w Wielkopolski|Elbląg|Elblag|Płock|Plock|Wałbrzych|Walbrzych|Włocławek|Wloclawek|Tarn[oó]w|Chorz[oó]w|Koszalin|Kalisz|Legnica|Grudziądz|Grudziadz|Słupsk|Slupsk|Jaworzno|Jastrzębie(?:-| )Zdr[oó]j|Jastrzebie(?:-| )Zdroj|Nowy Sącz|Nowy Sacz|Jelenia G[oó]ra|Siedlce|Mysłowice|Myslowice|Piła|Pila|Konin|Piotrk[oó]w Trybunalski|Inowrocław|Inowroclaw|Lubin|Ostr[oó]w Wielkopolski|Łomianki|Lomianki)\b/i;

function isPolishAddressLine(line) {
  const clean = stripKnownNoise(line);
  if (!clean || isClientDataMarkerLine(clean)) return false;
  if (!polishCityPattern.test(clean)) return false;
  if (/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(clean)) return false;
  if (/\b(?:PESEL|NIP|Dow[oó]d|Dokument|Paszport|Karta pobytu|Telefon|Tel\.?|Email|E-mail|Auto|Pojazd|Marka|Model|Cena|Rabat|VIN)\b/i.test(clean)) return false;
  return /\d{2}-\d{3}|\b(?:ul\.?|al\.?|pl\.?|os\.?|aleja)\b|\b\d+[A-Za-z]?(?:[/-]\d+[A-Za-z]?)?\b|,/.test(clean);
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
    /(?:ul\.?\s+)?[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,4}\s+\d+[A-Za-z]?(?:\s*\/\s*\d+[A-Za-z]?|[,\s]+[A-Z]{1,4}\/\d+)?[,\s]+\d{2}-\d{3}\s+[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,3}/u
  );
  if (postalAddress) return stripKnownNoise(postalAddress[0]);
  const cityAddressLine = lines.find((line) => isPolishAddressLine(line));
  if (cityAddressLine) return stripKnownNoise(cityAddressLine);
  const pattern =
    /\b(?:ul\.?|al\.?|pl\.?|os\.?|aleja|улица|adres)\s+.*?(?=\s+(?:PESEL|NIP|Dokument|Dow[oó]d|Paszport|Karta pobytu|Telefon|Tel|Email|E-mail|Auto|Pojazd|Marka|Model|Cena|Rabat|VIN)\b|$)/i;
  return stripKnownNoise(text.match(pattern)?.[0] || "");
}

function parseDocumentValue(text) {
  const compact = normalizeSpace(text);
  const shorthand = compact.match(/\b(?:DO|D\.O\.)\s*(?::|-)?\s*([A-Z]{1,4}\s*\d[A-Z0-9]{2,}|\d{5,}[A-Z0-9]*)/i);
  if (shorthand) return normalizeSpace(`dowód osobisty ${extractDocumentNumber(shorthand[1])}`);
  const exact = compact.match(/\b(dow[oó]d osobisty|paszport|karta pobytu)\b\s*(?::|nr|numer|seria|-)?\s*([A-Z]{1,4}\s*\d[A-Z0-9]{2,}|\d{5,}[A-Z0-9]*)/i);
  if (exact) return normalizeSpace(`${exact[1]} ${extractDocumentNumber(exact[2])}`);
  const labeled = extractLabeled(compact, saleRecognitionLabels.document);
  const number = extractDocumentNumber(labeled);
  return number ? normalizeSpace(`${normalizeDocumentType(labeled)} ${number}`) : "";
}

function extractDocumentNumber(value) {
  return normalizeSpace(
    String(value || "").match(/\b(?:[A-Z]{1,4}\s*\d[A-Z0-9]{2,}|\d{5,}[A-Z0-9]*)\b/i)?.[0] || ""
  );
}

function normalizeDocumentType(value) {
  const lower = normalizeSpace(value).toLowerCase();
  if (/\bdow[oó]d(?: osobisty)?\b|\bdo\b|\bd\.o\.\b/.test(lower)) return "dowód osobisty";
  if (/\bpaszport\b/.test(lower)) return "paszport";
  if (/\bkarta pobytu\b/.test(lower)) return "karta pobytu";
  return "";
}

function personNameOnly(value) {
  return normalizeSpace(
    String(value || "").match(/\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+\b/u)?.[0] || ""
  );
}

function normalizePhoneNumber(value) {
  return normalizeSpace(
    String(value || "").match(/(?:\+48[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{3}/)?.[0] || ""
  );
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
    /(?:ul\.?\s+)?[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,4}\s+\d+[A-Za-z]?(?:\s*\/\s*\d+[A-Za-z]?|[,\s]+[A-Z]{1,4}\/\d+)?[,\s]+\d{2}-\d{3}\s+[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){0,3}/u
  );
  if (!postalAddress) return "";
  let address = stripKnownNoise(postalAddress[0])
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s*,\s*/g, ", ");
  if (!/^(?:ul\.?|al\.?|pl\.?|os\.?|aleja)\s+/i.test(address)) address = `ul. ${address}`;
  return address.replace(/^ul\.?\s*/i, "ul. ");
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

function moneyMatch(value) {
  return normalizeSpace(value.match(/\b\d[\d\s.,]{2,}\s*(?:PLN|EUR|zł|zl|€)(?:\s*brutto|\s*netto)?\b/i)?.[0] || "");
}

function vehicleContext(text) {
  const compact = normalizeSpace(text);
  const marker = saleRecognitionLabels.vehicleMarker.map(escapeRegExp).join("|");
  const strictMatches = [...compact.matchAll(new RegExp(`(?:^|[\\s,;|])(?:${marker})\\s*(?::|=|–|-)\\s*(.*)$`, "gis"))];
  if (strictMatches.length) return normalizeSpace(strictMatches.at(-1)[1]);
  const looseMatches = [...compact.matchAll(new RegExp(`(?:^|[\\s,;|])(?:${marker})\\s+(.*)$`, "gis"))];
  return looseMatches.length ? normalizeSpace(looseMatches.at(-1)[1]) : compact;
}

function makeModelFallback(text) {
  const context = vehicleContext(text)
    .replace(/\b(?:VIN|Rok|Rocznik|Pierwsza rejestracja|Paliwo|Przebieg|Licznik|Cena|Rabat)\b.*$/i, "");
  const cleaned = stripKnownNoise(
    context
      .replace(/\b(?:Marka i model|Marka|Model|Auto|Pojazd|Samoch[oó]d)\s*(?::|=|–|-)?\s*/gi, " ")
      .replace(/\b(?:19|20)\d{2}(?:\s*-\s*(?:19|20)\d{2}|\+)?\b/g, " ")
  );
  const words = cleaned.match(/[A-ZŁŚŻŹĆŃÓĘĄ0-9][\w.+-]*/gi) || [];
  const filtered = words.filter((word) => !/^(auto|pojazd|samoch[oó]d|vin|rok|paliwo|benzyna|diesel|hybryda|elektryk|przebieg|cena|pln|eur)$/i.test(word));
  return normalizeSpace(filtered.slice(0, 4).join(" "));
}

function parseBuyerType(text, { pesel = "", nip = "" } = {}) {
  const compact = normalizeSpace(text);
  const lower = compact.toLowerCase();
  const labeled = extractLabeled(compact, saleRecognitionLabels.buyerType).toLowerCase();
  const companyMarkers = ["firma", "фирм", "jdg", "sp. z o.o", "sp z oo", "spółka", "spolka", "s.a.", "krs", "regon"];
  if (labeled.includes("firma") || labeled.includes("фирм") || labeled.includes("jdg")) return "company";
  if (labeled.includes("osoba") || labeled.includes("fizycz") || labeled.includes("физ")) return "person";
  if (companyMarkers.some((marker) => lower.includes(marker))) return "company";
  if (pesel) return "person";
  if (nip) return "company";
  return "person";
}

function parseBuyerName(text, isCompany) {
  const lines = linesFromText(text);
  const compact = normalizeSpace(text);
  const clientLine = lines.find((line) => /^(?:Kupujący|Nabywca|Zleceniodawca|Klient|Client|Клиент)\b/i.test(line));
  if (clientLine) {
    const candidate = stripKnownNoise(clientLine.replace(/\b(?:Kupujący|Nabywca|Zleceniodawca|Klient|Client|Клиент)\b\s*(?::|=|–|-)?/i, ""));
    if (candidate && !isPolishAddressLine(candidate) && !isAddressStreetLine(candidate) && !isPostalCityLine(candidate) && !isClientDataMarkerLine(candidate)) {
      return isCompany ? candidate : personNameOnly(candidate);
    }
  }

  const labeled = extractLabeled(compact, saleRecognitionLabels.buyer);
  if (labeled) {
    const cleanLabeled = stripKnownNoise(labeled);
    if (!isCompany) {
      const personName = cleanLabeled.match(/^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+){1,3}\b/u)?.[0];
      if (personName) return personNameOnly(personName);
    }
    return cleanLabeled;
  }
  if (isCompany) {
    const company = compact.match(/\b[A-Z0-9ĄĆĘŁŃÓŚŹŻ][A-Z0-9ĄĆĘŁŃÓŚŹŻ .&-]{2,}?(?:JDG|sp\.?\s*z\.?\s*o\.?o\.?|spółka|spolka|s\.a\.)\b/i)?.[0];
    if (company) return stripKnownNoise(company);
  }
  const firstNameLine = lines.find((line) => {
    const candidate = stripKnownNoise(line.replace(/\b(?:Kupujący|Nabywca|Zleceniodawca|Klient|Client|Клиент)\b\s*(?::|=|–|-)?/i, ""));
    if (!candidate || isPolishAddressLine(candidate) || isAddressStreetLine(candidate) || isPostalCityLine(candidate) || isClientDataMarkerLine(candidate)) return false;
    if (/@|\+48|\d{2}-\d{3}|\b\d{10,11}\b/.test(candidate)) return false;
    const words = candidate.match(/[\p{L}'-]+/gu) || [];
    return words.length >= 2 && words.length <= 4;
  });
  if (firstNameLine) return personNameOnly(firstNameLine.replace(/\b(?:Kupujący|Nabywca|Zleceniodawca|Klient|Client|Клиент)\b\s*(?::|=|–|-)?/i, ""));

  const beforeAddress = compact.split(/\b(?:Adres|Адрес|PESEL|NIP|Dokument|Telefon|Email|Auto|Pojazd)\b/i)[0];
  const upperPerson = beforeAddress.match(/[\p{Lu}]{2,}(?:\s+[\p{Lu}]{2,}){1,3}/u)?.[0];
  if (upperPerson) return normalizeSpace(upperPerson.match(/[\p{Lu}]{2,}\s+[\p{Lu}]{2,}/u)?.[0] || "");
  const person = beforeAddress
    .replace(/\b(?:Kupujący|Nabywca|Klient|Client|Клиент)\b\s*(?::|=|–|-)?/i, "")
    .match(/\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż-]+){1,3}\b/u)?.[0];
  return personNameOnly(person || "");
}

function parseBuyerContactData(text) {
  const compact = normalizeSpace(text);
  const joined =
    text
      .split(/\r?\n/)
      .map(normalizeSpace)
      .filter(Boolean)
      .join("\n") || compact;

  let email = joined.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/)?.[0] || "";
  if (!email) email = extractLabeled(compact, saleRecognitionLabels.email);
  email = stripKnownNoise(email);

  let phone = "";
  const labeledPhone = extractLabeled(compact, saleRecognitionLabels.phone);
  const labeledPlus48Phone = labeledPhone.match(plus48PhonePattern) || [];
  const plus48Phones = joined.match(plus48PhonePattern) || [];
  const phoneMatches = labeledPhone
    ? labeledPlus48Phone.length
      ? labeledPlus48Phone
      : [labeledPhone]
    : plus48Phones.length
      ? plus48Phones
      : joined.match(/(?:\+48[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{3}/g) || [];
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
  const peselValue = extractLabeled(compactWithoutPhones, saleRecognitionLabels.pesel);
  const pesel = peselValue.match(/\b\d{11}\b/)?.[0] || joinedWithoutPhones.match(/\b\d{11}\b/)?.[0] || "";
  const nipRaw =
    extractLabeled(compactWithoutPhones, saleRecognitionLabels.nip) ||
    joinedWithoutPhones.match(/\b(?:NIP[:\s]*)?(\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2})\b/i)?.[1] ||
    "";
  const nip = nipRaw.match(/\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}/)?.[0]?.replace(/\D/g, "") || "";
  const buyerType = parseBuyerType(compact, { pesel, nip });
  const isCompany = buyerType === "company";
  const documentValue = parseDocumentValue(compact);
  const rawAddressValue = extractLabeled(compact, saleRecognitionLabels.address) || addressFallback(joined);

  return {
    type: buyerType,
    name: parseBuyerName(joined, isCompany),
    address: cleanAddressValue(rawAddressValue, { phone, email, pesel, nip, document: documentValue }),
    identifier: isCompany ? nip : pesel,
    identifierType: isCompany ? "nip" : "pesel",
    phone: normalizePhoneNumber(phone),
    email,
  };
}

function parseFuelType(value) {
  const lower = normalizeSpace(value).toLowerCase();
  if (/\blpg\b|gaz/.test(lower)) return "LPG";
  if (/\bhybryd|hybrid\b/.test(lower)) return "H";
  if (/\belektryk|electric|ev\b/.test(lower)) return "EL";
  if (/\bdiesel|olej nap[eę]dowy|\bon\b/.test(lower)) return "ON";
  if (/\bbenzyn|gasolin|petrol\b|\bb\b/.test(lower)) return "B";
  return "";
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

function parseSaleData() {
  const text = rawSaleDataInput.value;
  if (!text.trim()) {
    setStatus("Brak danych.");
    return;
  }

  const compact = normalizeSpace(text);
  const vehicleText = vehicleContext(compact);
  const buyer = parseBuyerContactData(text);
  const make = stripKnownNoise(extractLabeled(compact, saleRecognitionLabels.make));
  const model = stripKnownNoise(extractLabeled(compact, saleRecognitionLabels.model));
  const makeModel = normalizeSpace(`${make} ${model}`) || stripKnownNoise(extractLabeled(compact, saleRecognitionLabels.makeModel)) || makeModelFallback(vehicleText);
  const vin = (extractLabeled(compact, saleRecognitionLabels.vin) || compact).match(/\b[A-HJ-NPR-Z0-9]{17}\b/i)?.[0] || "";
  const priceMoney = parseMoneyValue(extractLabeled(compact, saleRecognitionLabels.price) || moneyMatch(compact));
  const discountValue = extractLabeled(compact, saleRecognitionLabels.discount);
  const discountMoney = parseMoneyValue(discountValue);
  const fuelType = parseFuelType(extractLabeled(compact, saleRecognitionLabels.fuel) || vehicleText);

  setField("buyerName", buyer.name);
  setField("buyerAddress", buyer.address);
  setField("buyerIdentifier", buyer.identifier);
  setBuyerIdentifierType(buyer.identifierType);
  setField("buyerPhone", buyer.phone);
  setField("buyerEmail", buyer.email);
  if (buyer.type === "company") setField("buyerProfessional", "tak");
  if (buyer.type === "person") setField("buyerProfessional", "nie");
  setField("vehicleMakeModel", makeModel);
  setField("vehicleVin", vin.toUpperCase());
  setField("vehicleMileage", extractLabeled(compact, saleRecognitionLabels.mileage) || mileageFallback(vehicleText));
  setField("salePrice", priceMoney.amount);
  setField("saleCurrency", priceMoney.currency);
  setField("discountBenefit", discountMoney.amount ? formatGrossAmount(discountMoney.amount, discountMoney.currency) : discountValue);
  setField("firstRegistration", extractLabeled(compact, saleRecognitionLabels.firstRegistration) || firstRegistrationFallback(vehicleText));
  setField("fuelType", fuelType);
  setField("lastTechnicalInspection", extractLabeled(compact, saleRecognitionLabels.technicalInspection));
  setStatus("Dane rozpoznane. Sprawdź pola.");
  updateSummary();
}

function writeDamageMarks() {
  damageMarksInput.value = JSON.stringify(damageMarks);
}

function renderDamageMarks() {
  damageCanvas.querySelectorAll(".damageMark").forEach((mark) => mark.remove());
  damageMarks.forEach((mark, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "damageMark";
    button.textContent = "X";
    button.style.left = `${mark.x}%`;
    button.style.top = `${mark.y}%`;
    button.title = "Usuń zaznaczenie";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      damageMarks.splice(index, 1);
      writeDamageMarks();
      renderDamageMarks();
    });
    damageCanvas.appendChild(button);
  });
}

function restoreDamageMarks(value) {
  try {
    const parsed = typeof value === "string" && value ? JSON.parse(value) : [];
    damageMarks = Array.isArray(parsed) ? parsed.filter((mark) => Number.isFinite(mark.x) && Number.isFinite(mark.y)) : [];
  } catch {
    damageMarks = [];
  }
  writeDamageMarks();
  renderDamageMarks();
}

function addDamageMark(event) {
  if (event.target.classList.contains("damageMark")) return;
  const rect = damageCanvas.getBoundingClientRect();
  damageMarks.push({
    x: Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 10,
    y: Math.round(((event.clientY - rect.top) / rect.height) * 1000) / 10,
  });
  writeDamageMarks();
  renderDamageMarks();
}

function saveSaleContract() {
  const data = collectSaleContract();
  localStorage.setItem(saleStorageKey, JSON.stringify(data, null, 2));
  saveSaleHistoryEntry(data);
  saveButton.textContent = "Zapisano";
  window.setTimeout(() => {
    saveButton.textContent = "Zapisz";
  }, 1200);
}

function todayISO() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function polishDate(value) {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

function saleFilename(data, extension) {
  const seed = data.vehicleMakeModel || data.vehicleVin || data.buyerName || "AUTO";
  const slug = normalizeSpace(seed)
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `Umowa_Sprzedazy_${slug || "AUTO"}.${extension}`;
}

function setStatus(text) {
  currentDownloadUrls.forEach((url) => URL.revokeObjectURL(url));
  currentDownloadUrls = [];
  statusEl.innerHTML = "";
  statusEl.textContent = text;
}

function showDownloads(items, options = {}) {
  const append = Boolean(options.append);
  let list = append ? statusEl.querySelector(".download-list") : null;
  if (!list) {
    if (!append) {
      currentDownloadUrls.forEach((url) => URL.revokeObjectURL(url));
      currentDownloadUrls = [];
      statusEl.innerHTML = "";
    }
    list = document.createElement("div");
    list.className = "download-list";
    statusEl.append(list);
  }

  items.forEach(({ blob, filename, readyText, autoDownload = false, openInViewer = false, viewerWindow = null }) => {
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

    if (openInViewer && viewerWindow && !viewerWindow.closed) {
      viewerWindow.location.href = url;
    }
    if (autoDownload) link.click();
  });
}

function showDownload(blob, filename, readyText, options = {}) {
  showDownloads(
    [{ blob, filename, readyText, autoDownload: Boolean(options.autoDownload) }],
    { append: Boolean(options.append) },
  );
}

function appendDownloadMessage(text) {
  const list = statusEl.querySelector(".download-list");
  if (!list) return null;
  const row = document.createElement("div");
  row.className = "download-row";
  row.textContent = text;
  list.append(row);
  return row;
}

async function runGenerationOperation(key, button, operation) {
  if (activeGenerationOperations.size > 0) return;
  activeGenerationOperations.add(key);
  const buttons = [pullCrmDataButton, generateButton, generatePdfButton, encryptPdfButton, printButton].filter(Boolean);
  buttons.forEach((actionButton) => {
    actionButton.disabled = true;
    if (actionButton === button) actionButton.setAttribute("aria-busy", "true");
  });

  try {
    await operation();
  } finally {
    activeGenerationOperations.delete(key);
    buttons.forEach((actionButton) => {
      actionButton.disabled = false;
      actionButton.removeAttribute("aria-busy");
    });
  }
}

function createPdfViewerWindow() {
  const viewerWindow = window.open("", "_blank");
  if (!viewerWindow) return null;
  viewerWindow.document.write("<!doctype html><title>PDF</title><p>Przygotowuję PDF...</p>");
  viewerWindow.document.close();
  return viewerWindow;
}

function clearPrintUrl() {
  if (currentPrintUrl) {
    URL.revokeObjectURL(currentPrintUrl);
    currentPrintUrl = null;
  }
}

function createPrintWindow() {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return null;
  printWindow.document.write("<!doctype html><title>Drukowanie umowy</title><p>Przygotowuję dokument do druku...</p>");
  printWindow.document.close();
  return printWindow;
}

function printPdfBlob(pdfBlob, printWindow) {
  clearPrintUrl();
  currentPrintUrl = URL.createObjectURL(pdfBlob);

  if (printWindow && !printWindow.closed) {
    printWindow.location.href = currentPrintUrl;
    window.setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch {
        setStatus("PDF gotowy do druku. Użyj polecenia drukowania w otwartym oknie.");
      }
    }, 1200);
    return;
  }

  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.src = currentPrintUrl;
  frame.addEventListener("load", () => {
    window.setTimeout(() => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch {
        setStatus("PDF gotowy do druku, ale przeglądarka zablokowała automatyczne drukowanie.");
      }
    }, 400);
  });
  document.body.appendChild(frame);
  window.setTimeout(() => frame.remove(), 120000);
}

function all(root, namespace, tagName) {
  return [...root.getElementsByTagNameNS(namespace, tagName)];
}

function directChildren(root, namespace, tagName) {
  return [...root.childNodes].filter((node) => node.nodeType === 1 && node.namespaceURI === namespace && node.localName === tagName);
}

function wEl(doc, tagName, attrs = {}) {
  const el = doc.createElementNS(W, `w:${tagName}`);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttributeNS(W, `w:${key}`, value);
  });
  return el;
}

function setRunText(run, value, { bold = false, size = "18", font = "", color = "" } = {}) {
  const doc = run.ownerDocument;
  run.textContent = "";
  const rPr = wEl(doc, "rPr");
  if (bold) rPr.append(wEl(doc, "b"), wEl(doc, "bCs"));
  if (font) rPr.append(wEl(doc, "rFonts", { ascii: font, hAnsi: font, cs: font, eastAsia: font }));
  if (color) rPr.append(wEl(doc, "color", { val: color }));
  rPr.append(wEl(doc, "sz", { val: size }), wEl(doc, "szCs", { val: size }));
  const text = wEl(doc, "t");
  text.setAttribute("xml:space", "preserve");
  text.textContent = value || "";
  run.append(rPr, text);
}

function setCellText(cell, value, options = {}) {
  if (!cell) return;
  const doc = cell.ownerDocument;
  [...cell.childNodes].forEach((node) => {
    if (!(node.nodeType === 1 && node.namespaceURI === W && node.localName === "tcPr")) node.remove();
  });
  const paragraph = wEl(doc, "p");
  const run = wEl(doc, "r");
  setRunText(run, value, options);
  paragraph.appendChild(run);
  cell.appendChild(paragraph);
}

function markYesNoTables(root, data) {
  const tables = all(root, W, "tbl");

  function mark(row, yesIndex, noIndex, name) {
    if (!row || !name) return;
    const cells = directChildren(row, W, "tc");
    setCellText(cells[yesIndex], data[name] === "tak" ? "X" : "", { bold: true, size: "20" });
    setCellText(cells[noIndex], data[name] === "nie" ? "X" : "", { bold: true, size: "20" });
  }

  const documentsRows = directChildren(tables[4], W, "tr");
  [
    "emissionEuro6",
    "spareKey",
    "serviceBook",
    "manualBook",
    "registrationCertificate",
    "intermediateContracts",
    "foreignRegistrationCertificate",
    "exciseProof",
    "technicalInspectionProof",
    "noPlatesStatement",
  ].forEach((name, index) => mark(documentsRows[index + 1], 1, 2, name));

  [
    "testDrive",
    "checkedAtStation",
    "checkedOnLift",
    "checkedListingEquipment",
    "checkedControls",
    "paintMeterCheck",
  ].forEach((name, index) => mark(documentsRows[index + 1], 5, 6, name));

  const technicalRows = directChildren(tables[5], W, "tr");
  [
    ["engineWorks", "gearboxNoOilData"],
    ["noOilFilterData", "gearboxLeaks"],
    ["noTimingData", "gearboxWear"],
    ["reducedEnginePower", "clutchWear"],
    ["engineLeaks", "clutchNoise"],
  ].forEach(([left, right], index) => {
    const row = technicalRows[index + 1];
    mark(row, 1, 2, left);
    mark(row, 5, 6, right);
  });

  [
    ["steeringPlay", "brakeFluidRecommended"],
    ["steeringLeaks", "brakeWear"],
  ].forEach(([left, right], index) => {
    const row = technicalRows[index + 8];
    mark(row, 1, 2, left);
    mark(row, 5, 6, right);
  });
  mark(technicalRows[10], 4, 5, "brakeReducedEfficiency");

  [
    ["exhaustCorrosion", "acWorks"],
    ["catalystPresent", "acCoolantLoss"],
  ].forEach(([left, right], index) => {
    const row = technicalRows[index + 12];
    mark(row, 1, 2, left);
    mark(row, 5, 6, right);
  });
  mark(technicalRows[14], 1, 2, "dpfPresent");
  mark(technicalRows[15], 1, 2, "catalystReducedEfficiency");
  mark(technicalRows[15], 5, 6, "coolingWorks");
  mark(technicalRows[16], 1, 2, "exhaustCleaningWear");
  mark(technicalRows[16], 5, 6, "coolingLeaks");

  [
    ["bodyCorrosion", "interiorHeavyWear"],
    ["bodyRepainted", "interiorScratches"],
    ["bodySheetMetalRepair", "higherMileageSigns"],
  ].forEach(([left, right], index) => {
    const row = technicalRows[index + 19];
    mark(row, 1, 2, left);
    mark(row, 5, 6, right);
  });
  mark(technicalRows[22], 1, 2, "bodyStructuralDamage");
  mark(technicalRows[23], 1, 2, "bodyNonTechRepair");

  [
    [null, "extraTires"],
    ["discountGiven", "extraRims"],
    ["discountWearReason", "spareWheel"],
    ["discountPostPurchaseRepairs", "temporaryPlates"],
    ["discountEngineFaults", "navigationCard"],
  ].forEach(([left, right], index) => {
    const row = technicalRows[index + 25];
    mark(row, 1, 2, left);
    mark(row, 5, 6, right);
  });
}

function belongsToControl(control, node) {
  let parent = node.parentNode;
  while (parent && parent !== control) {
    if (parent.nodeType === 1 && parent.namespaceURI === W && parent.localName === "sdt") return false;
    parent = parent.parentNode;
  }
  return parent === control;
}

function setTextControl(sdt, value) {
  if (!sdt) return;
  all(sdt, W, "showingPlcHdr").filter((node) => belongsToControl(sdt, node)).forEach((node) => node.remove());
  all(sdt, W, "rStyle").filter((node) => belongsToControl(sdt, node)).forEach((node) => node.remove());
  all(sdt, W, "color").filter((node) => belongsToControl(sdt, node)).forEach((node) => node.remove());

  const textNodes = all(sdt, W, "t").filter((node) => belongsToControl(sdt, node));
  if (!textNodes.length) return;
  textNodes.forEach((node, index) => {
    node.setAttribute("xml:space", "preserve");
    node.textContent = index === 0 ? value || " " : "";
  });
}

function setCheckboxControl(sdt, checked) {
  if (!sdt) return;
  all(sdt, W14, "checked").forEach((node) => node.setAttributeNS(W14, "w14:val", checked ? "1" : "0"));
  all(sdt, W, "sym").filter((node) => belongsToControl(sdt, node)).forEach((node) => node.remove());
  const runs = all(sdt, W, "r").filter((node) => belongsToControl(sdt, node));
  if (!runs.length) return;
  setRunText(runs[0], checked ? "☒" : "☐", { size: "24", font: "Arial" });
  runs.slice(1).forEach((run) => setRunText(run, "", { size: "24", font: "Arial" }));
}

function setControlAlignment(sdt, horizontal, vertical) {
  if (!sdt) return;
  all(sdt, W, "p")
    .filter((node) => belongsToControl(sdt, node))
    .forEach((paragraph) => {
      let pPr = directChildren(paragraph, W, "pPr")[0];
      if (!pPr) {
        pPr = wEl(paragraph.ownerDocument, "pPr");
        paragraph.insertBefore(pPr, paragraph.firstChild);
      }
      directChildren(pPr, W, "jc").forEach((node) => node.remove());
      pPr.appendChild(wEl(paragraph.ownerDocument, "jc", { val: horizontal }));
    });

  let cell = sdt.parentNode;
  while (cell && !(cell.namespaceURI === W && cell.localName === "tc")) cell = cell.parentNode;
  if (!cell) return;
  let tcPr = directChildren(cell, W, "tcPr")[0];
  if (!tcPr) {
    tcPr = wEl(cell.ownerDocument, "tcPr");
    cell.insertBefore(tcPr, cell.firstChild);
  }
  directChildren(tcPr, W, "vAlign").forEach((node) => node.remove());
  tcPr.appendChild(wEl(cell.ownerDocument, "vAlign", { val: vertical }));
}

function ensureCellProperties(cell) {
  let tcPr = directChildren(cell, W, "tcPr")[0];
  if (!tcPr) {
    tcPr = wEl(cell.ownerDocument, "tcPr");
    cell.insertBefore(tcPr, cell.firstChild);
  }
  return tcPr;
}

function setCellBorder(cell, side, { val = "single", size = "4", color = "000000" } = {}) {
  if (!cell) return;
  const tcPr = ensureCellProperties(cell);
  let borders = directChildren(tcPr, W, "tcBorders")[0];
  if (!borders) {
    borders = wEl(cell.ownerDocument, "tcBorders");
    tcPr.appendChild(borders);
  }
  directChildren(borders, W, side).forEach((node) => node.remove());
  borders.appendChild(wEl(cell.ownerDocument, side, { val, sz: size, space: "0", color }));
}

function setCellVerticalAlignment(cell, value) {
  if (!cell) return;
  const tcPr = ensureCellProperties(cell);
  directChildren(tcPr, W, "vAlign").forEach((node) => node.remove());
  tcPr.appendChild(wEl(cell.ownerDocument, "vAlign", { val: value }));
}

function compactVerticalAgreementLabel(root) {
  const doc = root.ownerDocument || root;
  const cell = all(root, W, "tc").find((candidate) =>
    all(candidate, W, "t")
      .map((node) => node.textContent || "")
      .join("")
      .includes("SZCZEGÓŁOWE POSTANOWIENIA UMOWY"),
  );
  if (!cell) return;

  const paragraphs = directChildren(cell, W, "p");
  paragraphs.slice(1).forEach((paragraph) => paragraph.remove());
  const paragraph = paragraphs[0] || wEl(doc, "p");
  if (!paragraph.parentNode) cell.appendChild(paragraph);
  const runs = all(paragraph, W, "r");
  const run = runs[0] || wEl(doc, "r");
  if (!run.parentNode) paragraph.appendChild(run);
  setRunText(run, "SZCZEGÓŁOWE POSTANOWIENIA UMOWY", { bold: true, size: "16", color: "FFFFFF" });
  runs.slice(1).forEach((extraRun) => extraRun.remove());
  setCellVerticalAlignment(cell, "center");
}

function replaceText(root, search, replacement) {
  all(root, W, "t").forEach((node) => {
    if ((node.textContent || "").includes(search)) {
      node.textContent = node.textContent.replace(search, replacement || " ");
    }
  });
}

function setBuyerIdentifierLine(root, data) {
  const paragraph = all(root, W, "p").find((node) =>
    all(node, W, "t")
      .map((text) => text.textContent || "")
      .join("")
      .includes("NIP: 7211070432"),
  );
  if (!paragraph) return;

  directChildren(paragraph, W, "r").forEach((run) => run.remove());
  const inactiveLabel = data.buyerIdentifierType === "nip" ? "PESEL" : "NIP";
  const append = (text, strike = false) => {
    const run = wEl(paragraph.ownerDocument, "r");
    setRunText(run, text, { size: "18" });
    if (strike) directChildren(run, W, "rPr")[0].append(wEl(paragraph.ownerDocument, "strike"));
    paragraph.append(run);
  };

  append("PESEL", inactiveLabel === "PESEL");
  append(" / ");
  append("NIP", inactiveLabel === "NIP");
  append(data.buyerIdentifier ? `: ${data.buyerIdentifier}` : ":");
}

function fillBuyerBlock(root, data) {
  replaceText(root, "P.H.U. Kazimierz Florczyk", data.buyerName);
  setBuyerIdentifierLine(root, data);
  replaceText(root, "ul. Targowa 2 18-500 Kolno", data.buyerAddress);
  replaceText(root, "+48 692 428\u00a0958", data.buyerPhone);
  replaceText(root, "kazimierz@florczyk.com.pl", data.buyerEmail);
}

function applyBuyerContactBorders(root) {
  const tables = all(root, W, "tbl");
  const buyerRows = directChildren(tables[2], W, "tr");
  [0, 1, 2, 3].forEach((rowIndex) => {
    const cells = directChildren(buyerRows[rowIndex], W, "tc");
    setCellBorder(cells[3], "left");
  });
}

function fillGeneralWear(root, data) {
  const marks = {
    brak: data.generalWear === "brak" ? "X" : " ",
    przecietne: data.generalWear === "przecietne" ? "X" : " ",
    skrajne: data.generalWear === "skrajne" ? "X" : " ",
  };
  const tables = all(root, W, "tbl");
  const documentsRows = directChildren(tables[4], W, "tr");
  const stateCells = directChildren(documentsRows[10], W, "tc");
  setCellText(
    stateCells[4],
    `ogólne zużycie: [ ${marks.brak} ] brak, [ ${marks.przecietne} ] przeciętne, [ ${marks.skrajne} ] skrajne; oznaczenia miejsc korekt lakieru, napraw, uszkodzeń (znak "X"):`,
    { size: "17" },
  );
}

function fillVehicleHistoryTable(root, data) {
  const tables = all(root, W, "tbl");
  const rows = directChildren(tables[3], W, "tr");
  const makeRowCells = directChildren(rows[1], W, "tc");
  const vinRowCells = directChildren(rows[2], W, "tc");
  const dateRowCells = directChildren(rows[3], W, "tc");

  setCellText(makeRowCells[1], data.vehicleMakeModel);
  setCellText(vinRowCells[1], data.vehicleVin);
  setCellText(vinRowCells[3], data.fuelType);
  setCellText(dateRowCells[1], polishDate(data.firstRegistration));
  setCellText(dateRowCells[3], polishDate(data.lastTechnicalInspection));
}

function closeVehicleFaultsBox(root) {
  const tables = all(root, W, "tbl");
  const technicalRows = directChildren(tables[5], W, "tr");
  const headingCell = directChildren(technicalRows[31], W, "tc")[0];
  const notesCell = directChildren(technicalRows[32], W, "tc")[0];
  ["left", "right"].forEach((side) => setCellBorder(headingCell, side));
  ["left", "right", "bottom"].forEach((side) => setCellBorder(notesCell, side));
}

function parseDamageMarks(value) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((mark) => Number.isFinite(mark.x) && Number.isFinite(mark.y)) : [];
  } catch {
    return [];
  }
}

function imageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Nie można przygotować mapy uszkodzeń."));
    };
    image.src = url;
  });
}

async function overlayDamageMarks(zip, data) {
  const marks = parseDamageMarks(data.damageMarks);
  const imageFile = zip.file("word/media/image1.png");
  if (!marks.length || !imageFile) return;

  const image = await imageFromBlob(await imageFile.async("blob"));
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  context.font = `700 ${Math.max(28, Math.round(canvas.width * 0.026))}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  marks.forEach((mark) => {
    const x = (mark.x / 100) * canvas.width;
    const y = (mark.y / 100) * canvas.height;
    context.lineWidth = Math.max(3, Math.round(canvas.width * 0.003));
    context.strokeStyle = "#ffffff";
    context.strokeText("X", x, y);
    context.fillStyle = "#111827";
    context.fillText("X", x, y);
  });

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  zip.file("word/media/image1.png", await blob.arrayBuffer());
}

function fillDocx(root, data) {
  const controls = all(root, W, "sdt");
  const dateValue = polishDate(data.contractDate) || polishDate(todayISO());
  const mileageValue = formatMileage(data.vehicleMileage);
  const vinMileage = [data.vehicleVin ? `VIN: ${data.vehicleVin}` : "", mileageValue ? `stan licznika: ${mileageValue}` : ""]
    .filter(Boolean)
    .join(", ");

  setTextControl(controls[0], dateValue);
  setCheckboxControl(controls[1], data.contractPlace !== "buyer");
  setCheckboxControl(controls[2], data.contractPlace === "buyer");
  setCheckboxControl(controls[3], data.buyerProfessional === "tak");
  setCheckboxControl(controls[4], data.buyerProfessional === "nie");
  setTextControl(controls[5], data.vehicleMakeModel);
  setTextControl(controls[6], vinMileage || data.vehicleVin || mileageValue);
  setTextControl(controls[7], formatGrossAmount(data.salePrice, data.saleCurrency));
  setControlAlignment(controls[7], "center", "center");
  setTextControl(controls[8], formatDiscountBenefit(data.discountBenefit, data.saleCurrency));
  setTextControl(controls[23], data.notes);

  fillBuyerBlock(root, data);
  applyBuyerContactBorders(root);
  fillVehicleHistoryTable(root, data);
  fillGeneralWear(root, data);
  markYesNoTables(root, data);
  closeVehicleFaultsBox(root);
  compactVerticalAgreementLabel(root);
}

async function generateDocxBlob() {
  if (!window.JSZip) throw new Error("JSZip nie został załadowany.");

  const data = collectSaleContract();
  if (!saleTemplateBytesPromise) {
    saleTemplateBytesPromise = fetch(saleTemplateUrl).then(async (response) => {
      if (!response.ok) throw new Error("Nie można pobrać szablonu DOCX.");
      return await response.arrayBuffer();
    }).catch((error) => {
      saleTemplateBytesPromise = null;
      throw error;
    });
  }

  const zip = await JSZip.loadAsync(await saleTemplateBytesPromise);
  const xmlText = await zip.file("word/document.xml").async("text");
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  fillDocx(xml.documentElement, data);
  await overlayDamageMarks(zip, data);
  zip.file("word/document.xml", new XMLSerializer().serializeToString(xml));

  return new Blob([await zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 3 },
  })], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

async function generateSaleDocx() {
  await runGenerationOperation("docx", generateButton, async () => {
    try {
      setStatus("Przygotowuję DOCX...");
      const data = collectSaleContract();
      const blob = await generateDocxBlob();
      showDownload(blob, saleFilename(data, "docx"), "DOCX gotowy.", { autoDownload: false });
    } catch (error) {
      setStatus(`Nie udało się przygotować DOCX: ${error.message}`);
    }
  });
}

async function convertDocxBlobToPdf(docxBlob, filename, password = "") {
  const configuredEndpoint = String(window.AUTOGOOD_PDF_CONVERTER_URL || "").trim();
  const endpoint = configuredEndpoint || defaultPdfConverterUrl;
  if (!configuredEndpoint && /\.github\.io$/i.test(window.location.hostname)) {
    throw new Error("Konwerter DOCX→PDF nie jest jeszcze wdrożony. Podłącz adres backendu w src/pdf-config.js.");
  }
  const headers = {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "X-Filename": encodeURIComponent(filename),
  };
  if (password) headers["X-PDF-Password"] = window.AUTOGOOD_PDF_ENCRYPTION.encodePassword(password);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: docxBlob,
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      if (response.status === 404 && /onrender\.com/i.test(endpoint)) {
        throw new Error("Backend Render dla konwertera PDF nie jest jeszcze wdrożony pod wskazanym adresem.");
      }
      throw new Error(message || "Konwerter PDF nie jest dostępny.");
    }

    return await response.blob();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Konwersja PDF przekroczyła limit 120 sekund.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function generateSalePdf() {
  await runGenerationOperation("pdf", generatePdfButton, async () => {
    const viewerWindow = createPdfViewerWindow();
    let docxBlob = null;
    let progressRow = null;
    try {
      setStatus("Przygotowuję DOCX do konwersji PDF...");
      const data = collectSaleContract();
      docxBlob = await generateDocxBlob();
      showDownload(docxBlob, saleFilename(data, "docx"), "DOCX gotowy.", { autoDownload: false });
      progressRow = appendDownloadMessage("Konwertuję DOCX do PDF...");
      const pdfBlob = await convertDocxBlobToPdf(docxBlob, saleFilename(data, "pdf"));
      if (progressRow) progressRow.remove();
      showDownloads([
        { blob: pdfBlob, filename: saleFilename(data, "pdf"), readyText: "PDF gotowy.", autoDownload: false, openInViewer: true, viewerWindow },
      ], { append: true });
    } catch (error) {
      if (progressRow) progressRow.remove();
      if (viewerWindow && !viewerWindow.closed) viewerWindow.close();
      const message = String(error.message || error);
      const converterMessage = message.includes("Failed to fetch") || message.includes("Konwerter PDF")
        ? "Konwerter DOCX→PDF nie jest podłączony. Uruchom lub wdróż backend converter/server.py."
        : message;
      const errorText = `Nie udało się przygotować PDF: ${converterMessage}`;
      if (docxBlob) appendDownloadMessage(errorText);
      else setStatus(errorText);
    }
  });
}

async function generateEncryptedSalePdf() {
  await runGenerationOperation("encrypted-pdf", encryptPdfButton, async () => {
    const password = await window.AUTOGOOD_PDF_ENCRYPTION.requestPassword();
    if (!password) return;

    const viewerWindow = createPdfViewerWindow();
    try {
      setStatus("Przygotowuję zaszyfrowany PDF...");
      const data = collectSaleContract();
      const docxBlob = await generateDocxBlob();
      const filename = saleFilename(data, "pdf").replace(/\.pdf$/i, "_zaszyfrowany.pdf");
      const pdfBlob = await convertDocxBlobToPdf(docxBlob, filename, password);
      showDownloads([
        { blob: pdfBlob, filename, readyText: "Zaszyfrowany PDF gotowy.", autoDownload: false, openInViewer: true, viewerWindow },
      ]);
    } catch (error) {
      if (viewerWindow && !viewerWindow.closed) viewerWindow.close();
      const message = String(error.message || error);
      setStatus(`Nie udało się zaszyfrować PDF: ${message}`);
    }
  });
}

async function generateSalePrint() {
  await runGenerationOperation("print", printButton, async () => {
    const printWindow = createPrintWindow();
    try {
      setStatus("Przygotowuję dokument do druku...");
      const data = collectSaleContract();
      const docxBlob = await generateDocxBlob();
      setStatus("Konwertuję dokument do PDF przed drukiem...");
      const pdfBlob = await convertDocxBlobToPdf(docxBlob, saleFilename(data, "pdf"));
      showDownload(pdfBlob, saleFilename(data, "pdf"), "PDF gotowy do druku.", { autoDownload: false });
      printPdfBlob(pdfBlob, printWindow);
    } catch (error) {
      if (printWindow && !printWindow.closed) printWindow.close();
      const message = String(error.message || error);
      const converterMessage = message.includes("Failed to fetch") || message.includes("Konwerter PDF")
        ? "Konwerter DOCX→PDF nie jest podłączony. Uruchom lub wdróż backend converter/server.py."
        : message;
      setStatus(`Nie udało się przygotować druku: ${converterMessage}`);
    }
  });
}

function resetSaleContract() {
  rawSaleDataInput.value = "";
  [
    "buyerName",
    "buyerAddress",
    "buyerIdentifier",
    "buyerPhone",
    "buyerEmail",
    "vehicleMakeModel",
    "vehicleVin",
    "vehicleMileage",
    "firstRegistration",
    "fuelType",
    "lastTechnicalInspection",
  ].forEach((name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) field.value = "";
  });
  setBuyerIdentifierType("pesel");
  setField("generalWear", "przecietne");
  damageMarks = [];
  writeDamageMarks();
  renderDamageMarks();
  localStorage.setItem(saleStorageKey, JSON.stringify(collectSaleContract(), null, 2));
  setStatus("");
  updateSummary();
}

function loadSavedSaleContract() {
  const saved = localStorage.getItem(saleStorageKey);
  if (!saved) return;
  try {
    applySaleContract(JSON.parse(saved));
  } catch {
    localStorage.removeItem(saleStorageKey);
  }
}

fields.forEach((field) => {
  field.addEventListener("input", updateSummary);
  field.addEventListener("change", updateSummary);
});

saveButton.addEventListener("click", saveSaleContract);
pullCrmDataButton.addEventListener("click", () => {
  window.alert("Integracja z CRM zostanie podłączona w kolejnym etapie.");
});
resetButton.addEventListener("click", resetSaleContract);
parseButton.addEventListener("click", parseSaleData);
damageCanvas.addEventListener("click", addDamageMark);
clearDamageButton.addEventListener("click", () => {
  damageMarks = [];
  writeDamageMarks();
  renderDamageMarks();
});
generateButton.addEventListener("click", generateSaleDocx);
generatePdfButton.addEventListener("click", generateSalePdf);
encryptPdfButton.addEventListener("click", generateEncryptedSalePdf);
if (printButton) printButton.addEventListener("click", generateSalePrint);

applyDefaultChecklistValues();
applyDefaultFieldValues();
loadSavedSaleContract();
restoreDamageMarks(damageMarksInput.value);
updateSummary();
renderSaleHistory();
