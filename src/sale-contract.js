const saleStorageKey = "autogoodSaleContract.v1";

const form = document.querySelector("#saleContractForm");
const saveButton = document.querySelector("#saveSaleContract");
const exportButton = document.querySelector("#exportSaleContract");
const generateButton = document.querySelector("#generateSaleDocx");

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
  const price = [data.salePrice, data.saleCurrency].filter(Boolean).join(" ");
  document.querySelector("#saleSummaryPrice").textContent = valueOrFallback(price);
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
generateButton.addEventListener("click", () => {
  window.alert("DOCX będzie dostępny po dodaniu pustego szablonu Word dla umowy sprzedaży.");
});

loadSavedSaleContract();
updateSummary();
