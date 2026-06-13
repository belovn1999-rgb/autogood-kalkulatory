const saleStorageKey = "autogoodSaleContract.v2";

const form = document.querySelector("#saleContractForm");
const saveButton = document.querySelector("#saveSaleContract");
const exportButton = document.querySelector("#exportSaleContract");
const resetButton = document.querySelector("#resetSaleContract");
const generateButton = document.querySelector("#generateSaleDocx");
const parseButton = document.querySelector("#parseSaleData");
const statusEl = document.querySelector("#saleStatus");
const damageCanvas = document.querySelector("#damageMapCanvas");
const damageMarksInput = document.querySelector("#damageMarks");
const clearDamageButton = document.querySelector("#clearDamageMarks");
const saleTemplateUrl = "./contract-pdf-work/templates/Umowa_Sprzedazy_AG_template.docx?v=20260613-2";
const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const W14 = "http://schemas.microsoft.com/office/word/2010/wordml";

let currentDownloadUrl = null;

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
  row.innerHTML = `
    <span>${label}</span>
    <label><input type="radio" name="${name}" value="tak" /> TAK</label>
    <label><input type="radio" name="${name}" value="nie" /> NIE</label>
    <label><input type="radio" name="${name}" value="" /> —</label>
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
    field.value = data[field.name];
  });
  restoreDamageMarks(data.damageMarks);
  updateSummary();
}

function valueOrFallback(value) {
  return String(value || "").trim() || "Nie wskazano";
}

function updateSummary() {
  const data = collectSaleContract();
  document.querySelector("#saleSummaryBuyer").textContent = valueOrFallback(data.buyerName);
  document.querySelector("#saleSummaryVehicle").textContent = valueOrFallback(data.vehicleMakeModel);
  document.querySelector("#saleSummaryVin").textContent = valueOrFallback(data.vehicleVin);
  document.querySelector("#saleSummaryPrice").textContent = valueOrFallback(data.salePrice);
}

function normalizeSpace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function setField(name, value) {
  const field = form.querySelector(`[name="${name}"]`);
  if (!field || !value) return;
  field.value = value;
}

function labeledValue(text, labels) {
  const alternatives = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`(?:^|\\n)\\s*(?:${alternatives})\\s*(?::|-)?\\s*([^\\n]+)`, "i");
  const match = text.match(pattern);
  return match ? normalizeSpace(match[1]) : "";
}

function parseSaleData() {
  const text = document.querySelector("#rawSaleData").value;
  if (!text.trim()) return;

  const phone = text.match(/\+48[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const vin = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i);
  const nip = text.match(/\b(?:NIP|nip)\s*:?\s*([0-9\-\s]{10,})/);

  setField("buyerName", labeledValue(text, ["Kupujący", "Nabywca", "Klient", "Firma", "Nazwa", "Imię i nazwisko"]));
  setField("buyerAddress", labeledValue(text, ["Adres", "Ulica", "Siedziba"]));
  setField("buyerIdentifier", nip ? normalizeSpace(nip[1]) : labeledValue(text, ["PESEL", "NIP"]));
  setField("buyerPhone", labeledValue(text, ["Telefon", "Tel", "Nr tel"]) || (phone ? normalizeSpace(phone[0]) : ""));
  setField("buyerEmail", email ? email[0] : labeledValue(text, ["Email", "E-mail", "Mail"]));
  setField("vehicleMakeModel", labeledValue(text, ["Marka i model", "Auto", "Pojazd", "Samochód"]));
  setField("vehicleVin", vin ? vin[0].toUpperCase() : labeledValue(text, ["VIN"]));
  setField("vehicleMileage", labeledValue(text, ["Przebieg", "Stan licznika"]));
  setField("salePrice", labeledValue(text, ["Cena", "Cena sprzedaży", "Kwota"]));
  setField("firstRegistration", labeledValue(text, ["Pierwsza rejestracja", "Rok pierwszej rejestracji"]));
  setField("lastTechnicalInspection", labeledValue(text, ["Badanie techniczne", "Data ostatniego badania technicznego"]));
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
  localStorage.setItem(saleStorageKey, JSON.stringify(collectSaleContract(), null, 2));
  saveButton.textContent = "Сохранено";
  window.setTimeout(() => {
    saveButton.textContent = "Сохранить";
  }, 1200);
}

function exportSaleContract() {
  const data = collectSaleContract();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filenameSeed = data.vehicleVin || data.vehicleMakeModel || data.buyerName || "umowa-sprzedazy";
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenameSeed.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

function setRunText(run, value, { bold = false, size = "18" } = {}) {
  const doc = run.ownerDocument;
  run.textContent = "";
  const rPr = wEl(doc, "rPr");
  if (bold) rPr.append(wEl(doc, "b"), wEl(doc, "bCs"));
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
  all(sdt, W, "sym").forEach((node) => node.setAttributeNS(W, "w:char", checked ? "F0FE" : "F0A8"));
  all(sdt, W, "t").forEach((node) => {
    if (["¨", "þ", "☐", "☒"].includes(node.textContent || "")) node.textContent = checked ? "þ" : "¨";
  });
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

function replaceText(root, search, replacement) {
  all(root, W, "t").forEach((node) => {
    if ((node.textContent || "").includes(search)) {
      node.textContent = node.textContent.replace(search, replacement || " ");
    }
  });
}

function fillBuyerBlock(root, data) {
  replaceText(root, "P.H.U. Kazimierz Florczyk", data.buyerName);
  replaceText(root, "NIP: 7211070432", data.buyerIdentifier ? `NIP/PESEL: ${data.buyerIdentifier}` : "NIP/PESEL:");
  replaceText(root, "ul. Targowa 2 18-500 Kolno", data.buyerAddress);
  replaceText(root, "+48 692 428\u00a0958", data.buyerPhone);
  replaceText(root, "kazimierz@florczyk.com.pl", data.buyerEmail);
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
  setCellText(dateRowCells[1], data.firstRegistration);
  setCellText(dateRowCells[3], data.lastTechnicalInspection);
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
  const vinMileage = [data.vehicleVin ? `VIN: ${data.vehicleVin}` : "", data.vehicleMileage ? `stan licznika: ${data.vehicleMileage}` : ""]
    .filter(Boolean)
    .join(", ");

  setTextControl(controls[0], dateValue);
  setCheckboxControl(controls[1], data.contractPlace !== "buyer");
  setCheckboxControl(controls[2], data.contractPlace === "buyer");
  setCheckboxControl(controls[3], data.buyerProfessional === "tak");
  setCheckboxControl(controls[4], data.buyerProfessional === "nie");
  setTextControl(controls[5], data.vehicleMakeModel);
  setTextControl(controls[6], vinMileage || data.vehicleVin || data.vehicleMileage);
  setTextControl(controls[7], data.salePrice);
  setControlAlignment(controls[7], "center", "center");
  setTextControl(controls[8], data.discountBenefit || "-");
  setTextControl(controls[23], data.notes);

  fillBuyerBlock(root, data);
  fillVehicleHistoryTable(root, data);
  fillGeneralWear(root, data);
  markYesNoTables(root, data);
}

async function generateDocxBlob() {
  if (!window.JSZip) throw new Error("JSZip nie został załadowany.");

  const data = collectSaleContract();
  const response = await fetch(saleTemplateUrl);
  if (!response.ok) throw new Error("Nie można pobrać szablonu DOCX.");

  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  const xmlText = await zip.file("word/document.xml").async("text");
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  fillDocx(xml.documentElement, data);
  await overlayDamageMarks(zip, data);
  zip.file("word/document.xml", new XMLSerializer().serializeToString(xml));

  return new Blob([await zip.generateAsync({ type: "arraybuffer" })], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

async function generateSaleDocx() {
  try {
    setStatus("Przygotowuję DOCX...");
    const data = collectSaleContract();
    const blob = await generateDocxBlob();
    showDownload(blob, saleFilename(data, "docx"), "DOCX gotowy.");
  } catch (error) {
    setStatus(`Nie udało się przygotować DOCX: ${error.message}`);
  }
}

function resetSaleContract() {
  localStorage.removeItem(saleStorageKey);
  fields.forEach((field) => {
    if (field.type === "radio" || field.type === "checkbox") field.checked = false;
    else field.value = "";
  });
  damageMarks = [];
  writeDamageMarks();
  renderDamageMarks();
  applyDefaultChecklistValues();
  applyDefaultFieldValues();
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
exportButton.addEventListener("click", exportSaleContract);
resetButton.addEventListener("click", resetSaleContract);
parseButton.addEventListener("click", parseSaleData);
damageCanvas.addEventListener("click", addDamageMark);
clearDamageButton.addEventListener("click", () => {
  damageMarks = [];
  writeDamageMarks();
  renderDamageMarks();
});
generateButton.addEventListener("click", generateSaleDocx);

applyDefaultChecklistValues();
applyDefaultFieldValues();
loadSavedSaleContract();
restoreDamageMarks(damageMarksInput.value);
updateSummary();
