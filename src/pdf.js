const $ = (id) => document.getElementById(id);

const statusEl = $("status");
const pdfStorageKey = "autogoodPdfContract.v1";
const dealStorageKey = "autogoodDealDesk.v1";

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function normalizeSpace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
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

function setStatus(text) {
  statusEl.textContent = text;
}

function parseRawTextValue(text) {
  const lines = text
    .split(/\r?\n/)
    .map(normalizeSpace)
    .filter(Boolean);
  const joined = lines.join("\n");
  const lower = joined.toLowerCase();

  const email = joined.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/)?.[0] || "";
  const phoneMatches = joined.match(/(?:\+48[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{3}/g) || [];
  let phone = "";
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

  const pesel = joined.match(/\b\d{11}\b/)?.[0] || "";
  const nipRaw = joined.match(/\b(?:NIP[:\s]*)?(\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2})\b/i)?.[1] || "";
  const nip = nipRaw.replace(/\D/g, "");
  const companyMarkers = ["sp. z o.o", "sp z oo", "spolka", "spolka", "s.a.", "nip", "krs"];
  const isCompany = Boolean(nip && companyMarkers.some((marker) => lower.includes(marker)));

  let documentValue = "";
  const documentMatch = joined.match(/(dow[oó]d osobisty[:\s]+[A-Z0-9 ]+|karta pobytu[:\s]+[A-Z0-9 ]+|paszport[:\s]+[A-Z0-9 ]+)/i);
  if (documentMatch) {
    documentValue = normalizeSpace(documentMatch[1]);
    documentValue = documentValue.slice(0, 1).toUpperCase() + documentValue.slice(1);
  }

  let name = "";
  for (const line of lines) {
    const containsKnownValue = [email, phone, pesel, nipRaw].some((value) => value && line.includes(value));
    const isSystemLine = /bud[żz]et|zaliczka|adres|pesel|nip|dow[oó]d|paszport|karta/i.test(line);
    if (!containsKnownValue && !isSystemLine) {
      name = line;
      break;
    }
  }

  let address = "";
  for (const line of lines) {
    if (line === name) continue;
    if (/\d{2}-\d{3}/.test(line) || /\bul\.|\baleja\b|\bplac\b/i.test(line)) {
      address = line;
      break;
    }
  }

  const budgetTotal = normalizeSpace(joined.match(/bud[żz]et[:\s-]*([^\n]+)/i)?.[1] || "");
  const budgetAdvance = normalizeSpace(joined.match(/zaliczka[:\s-]*([^\n]+)/i)?.[1] || "");

  return {
    client: {
      type: isCompany ? "company" : "person",
      name,
      address,
      identifier: isCompany ? nip : pesel,
      document: isCompany ? "" : documentValue,
      phone: normalizeSpace(phone),
      email,
    },
    budget: {
      total: budgetTotal,
      advance: budgetAdvance,
    },
    vehicle: {},
  };
}

function applyParsed(data) {
  if (data.client?.type) {
    const typeNode = document.querySelector(`input[name="clientType"][value="${data.client.type}"]`);
    if (typeNode) typeNode.checked = true;
    $("clientEntrepreneur").checked = data.client.type === "company";
  }

  $("clientName").value = data.client?.name || $("clientName").value;
  $("clientAddress").value = data.client?.address || $("clientAddress").value;
  $("clientIdentifier").value = data.client?.identifier || $("clientIdentifier").value;
  $("clientDocument").value = data.client?.document || $("clientDocument").value;
  $("clientPhone").value = data.client?.phone || $("clientPhone").value;
  $("clientEmail").value = data.client?.email || $("clientEmail").value;

  $("budgetTotal").value = data.budget?.total || $("budgetTotal").value;
  $("budgetAdvance").value = data.budget?.advance || $("budgetAdvance").value;

  $("vehicleMakeModel").value = data.vehicle?.make_model || $("vehicleMakeModel").value;
  $("firstRegistration").value = data.vehicle?.first_registration || $("firstRegistration").value;
  $("mileageTo").value = data.vehicle?.mileage_to || $("mileageTo").value;
  $("requiredEquipment").value = data.vehicle?.required_equipment || $("requiredEquipment").value;
  $("expectedEquipment").value = data.vehicle?.expected_equipment || $("expectedEquipment").value;
}

function collectData() {
  const clientType = checkedRadio("clientType") || "person";
  return {
    contract: {
      date: $("contractDate").value || todayISO(),
      sequence: Number($("sequence").value || 1),
    },
    client: {
      type: clientType,
      name: $("clientName").value.trim(),
      address: $("clientAddress").value.trim(),
      pesel: clientType === "person" ? $("clientIdentifier").value.trim() : "",
      nip: clientType === "company" ? $("clientIdentifier").value.trim() : "",
      document: clientType === "person" ? $("clientDocument").value.trim() : "",
      phone: $("clientPhone").value.trim(),
      email: $("clientEmail").value.trim(),
    },
    agreement: {
      subject: checkedRadio("subject") || "purchase_by_autogood",
    },
    budget: {
      total: $("budgetTotal").value.trim(),
      advance: $("budgetAdvance").value.trim(),
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
    updatedAt: new Date().toISOString(),
  };
}

function exportData() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const seed = data.client.name || data.vehicle.make_model || "autogood-umowa";
  const filename = `${seed.toLowerCase().replace(/[^a-z0-9а-яёąćęłńóśźż]+/gi, "-")}.json`;
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Eksport gotowy.");
}

function saveData() {
  localStorage.setItem(pdfStorageKey, JSON.stringify(collectData(), null, 2));
  setStatus("Zapisano.");
}

function parseRawText() {
  const text = $("rawClient").value;
  if (!text.trim()) {
    setStatus("Brak danych.");
    return;
  }

  applyParsed(parseRawTextValue(text));
  saveData();
  setStatus("Dane rozpoznane.");
}

function loadNiroExample() {
  $("contractDate").value = "2026-05-27";
  $("sequence").value = "1";
  $("rawClient").value = [
    "Bartosz Araszkiewicz",
    "Tartaczna 27A, 05-300 Minsk Mazowiecki",
    "PESEL 96012003456",
    "Dowod osobisty: DHW 589648",
    "+48 605447011",
    "coldcans@gmail.com",
    "Budzet: 63 000 PLN brutto",
    "Zaliczka: 4 000 PLN brutto",
  ].join("\n");
  $("clientName").value = "Bartosz Araszkiewicz";
  $("clientAddress").value = "Tartaczna 27A, 05-300 Minsk Mazowiecki";
  $("clientIdentifier").value = "96012003456";
  $("clientDocument").value = "Dowod osobisty: DHW 589648";
  $("clientPhone").value = "+48 605447011";
  $("clientEmail").value = "coldcans@gmail.com";
  $("budgetTotal").value = "63 000 PLN brutto";
  $("budgetAdvance").value = "4 000 PLN brutto";
  $("vehicleMakeModel").value = "Kia Niro EV I";
  setFuel(["elektryk"]);
  setRadio("gearbox", "automatyczna");
  $("firstRegistration").value = "2020+";
  $("mileageTo").value = "200 000 km.";
  setRadio("bodyType", "inne");
  $("bodyOther").value = "SUV";
  $("requiredEquipment").value = "Wersja XL/Spirit, wentylowane siedzenia przednie, podgrzewane siedzenia z przodu i z tylu, naglosnienie JBL";
  $("expectedEquipment").value = "Masaz przednich foteli, kamera 360, wersja GT line";
  saveData();
}

function applyDealDeskData() {
  const saved = localStorage.getItem(dealStorageKey);
  if (!saved) {
    setStatus("Brak zapisanej karty Deal Desk.");
    return;
  }

  try {
    const deal = JSON.parse(saved);
    $("clientName").value = deal.clientName || $("clientName").value;
    $("clientPhone").value = deal.clientPhone || $("clientPhone").value;
    $("clientEmail").value = deal.clientEmail || $("clientEmail").value;
    $("vehicleMakeModel").value = deal.carModel || $("vehicleMakeModel").value;
    $("mileageTo").value = deal.mileage ? `${deal.mileage} km` : $("mileageTo").value;
    $("firstRegistration").value = deal.year || $("firstRegistration").value;
    $("budgetTotal").value = deal.clientBudget ? `${deal.clientBudget} PLN` : $("budgetTotal").value;
    const notes = [deal.notes, deal.nextStep].filter(Boolean).join("\n");
    $("expectedEquipment").value = notes || $("expectedEquipment").value;
    saveData();
    setStatus("Dane z Deal Desk dodane.");
  } catch {
    localStorage.removeItem(dealStorageKey);
    setStatus("Nie udalo sie odczytac Deal Desk.");
  }
}

function applySavedData(data) {
  if (data.contract) {
    $("contractDate").value = data.contract.date || todayISO();
    $("sequence").value = data.contract.sequence || 1;
  }

  const clientType = data.client?.type || (data.client?.nip ? "company" : "person");
  setRadio("clientType", clientType);
  $("clientEntrepreneur").checked = clientType === "company";
  $("clientName").value = data.client?.name || "";
  $("clientAddress").value = data.client?.address || "";
  $("clientIdentifier").value = data.client?.pesel || data.client?.nip || "";
  $("clientDocument").value = data.client?.document || "";
  $("clientPhone").value = data.client?.phone || "";
  $("clientEmail").value = data.client?.email || "";
  setRadio("subject", data.agreement?.subject || "purchase_by_autogood");
  $("budgetTotal").value = data.budget?.total || "";
  $("budgetAdvance").value = data.budget?.advance || "";
  $("vehicleMakeModel").value = data.vehicle?.make_model || "";
  setFuel(data.vehicle?.fuel || []);
  setRadio("gearbox", data.vehicle?.gearbox || "");
  setRadio("euroStandard", data.vehicle?.euro_standard || "");
  $("firstRegistration").value = data.vehicle?.first_registration || "";
  $("mileageTo").value = data.vehicle?.mileage_to || "";
  setRadio("bodyType", data.vehicle?.body?.type || "");
  $("bodyOther").value = data.vehicle?.body?.other || "";
  $("allowCollision").checked = Boolean(data.vehicle?.allow_collision_without_longitudinals);
  $("requiredEquipment").value = data.vehicle?.required_equipment || "";
  $("expectedEquipment").value = data.vehicle?.expected_equipment || "";
}

function loadSavedData() {
  $("contractDate").value = todayISO();

  const saved = localStorage.getItem(pdfStorageKey);
  if (!saved) return;

  try {
    applySavedData(JSON.parse(saved));
    setStatus("Wczytano zapisane dane.");
  } catch {
    localStorage.removeItem(pdfStorageKey);
  }
}

$("parseBtn").addEventListener("click", parseRawText);
$("exampleBtn").addEventListener("click", loadNiroExample);
$("saveBtn").addEventListener("click", saveData);
$("exportBtn").addEventListener("click", exportData);
$("printBtn").addEventListener("click", () => window.print());
$("dealBtn").addEventListener("click", applyDealDeskData);

document.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("change", () => localStorage.setItem(pdfStorageKey, JSON.stringify(collectData(), null, 2)));
});

loadSavedData();
