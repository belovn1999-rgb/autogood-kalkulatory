const saleStorageKey = "autogoodSaleContract.v2";

const form = document.querySelector("#saleContractForm");
const saveButton = document.querySelector("#saveSaleContract");
const exportButton = document.querySelector("#exportSaleContract");
const generateButton = document.querySelector("#generateSaleDocx");
const parseButton = document.querySelector("#parseSaleData");
const damageCanvas = document.querySelector("#damageMapCanvas");
const damageMarksInput = document.querySelector("#damageMarks");
const clearDamageButton = document.querySelector("#clearDamageMarks");

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
parseButton.addEventListener("click", parseSaleData);
damageCanvas.addEventListener("click", addDamageMark);
clearDamageButton.addEventListener("click", () => {
  damageMarks = [];
  writeDamageMarks();
  renderDamageMarks();
});
generateButton.addEventListener("click", () => {
  window.alert("DOCX będzie dostępny po dodaniu pustego szablonu Word dla umowy sprzedaży.");
});

applyDefaultChecklistValues();
loadSavedSaleContract();
restoreDamageMarks(damageMarksInput.value);
updateSummary();
