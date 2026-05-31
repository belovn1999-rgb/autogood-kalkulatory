const $ = (id) => document.getElementById(id);

const statusEl = $("status");
const pdfStorageKey = "autogoodPdfContract.v2";
let currentDownloadUrl = null;

const labels = {
  client: ["Клиент", "Client", "Klient"],
  clientType: ["Тип клиента", "Rodzaj klienta"],
  address: ["Адрес", "Adres"],
  pesel: ["PESEL"],
  nip: ["NIP"],
  document: ["Документ", "Dokument"],
  phone: ["Телефон", "Telefon", "Nr. tel", "Nr tel"],
  email: ["Email", "E-mail", "Mail"],
  vehicleMarker: ["Авто", "Auto", "Samochód", "Pojazd"],
  make: ["Марка", "Marka"],
  model: ["Модель", "Model"],
  year: ["Год", "Rok", "Wiek"],
  body: ["Тип кузова", "Nadwozie"],
  fuel: ["Топливо", "Paliwo"],
  gearbox: ["Коробка", "Skrzynia"],
  budget: ["Бюджет", "Budżet", "Budzet"],
  deposit: ["Депозит", "Заливка", "Заличка", "Zaliczka"],
  extra: ["Дополнительно", "Dodatkowo", "Wyposażenie"],
};

const allLabels = Object.values(labels).flat();

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
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = filename;
  statusEl.append(label, link);
  try {
    link.click();
  } catch {
    // Some embedded browsers block downloads; the visible link remains available.
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractLabeled(text, variants) {
  const labelPattern = variants.map(escapeRegExp).join("|");
  const nextPattern = allLabels.map(escapeRegExp).join("|");
  const pattern = new RegExp(`(?:^|[\\s,;])(?:${labelPattern})\\s*:\\s*(.*?)(?=(?:\\s+(?:${nextPattern})\\s*:)|$)`, "is");
  return normalizeSpace(text.match(pattern)?.[1] || "");
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
  const lower = cleanupChoice(value).toLowerCase();
  return ["benzyna", "diesel", "hybryda", "elektryk"].filter((fuel) => lower.includes(fuel));
}

function parseGearbox(value) {
  const lower = cleanupChoice(value).toLowerCase();
  if (lower.includes("automat")) return "automatyczna";
  if (lower.includes("manual")) return "manualna";
  return "";
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
  const joined = text
    .split(/\r?\n/)
    .map(normalizeSpace)
    .filter(Boolean)
    .join("\n") || compact;
  const lower = joined.toLowerCase();

  let email = extractLabeled(compact, labels.email);
  if (!email) email = joined.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/)?.[0] || "";

  let phone = "";
  const labeledPhone = extractLabeled(compact, labels.phone);
  const phoneMatches = labeledPhone ? [labeledPhone] : joined.match(/(?:\+48[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{3}/g) || [];
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

  const pesel = extractLabeled(compact, labels.pesel).replace(/\D/g, "") || joined.match(/\b\d{11}\b/)?.[0] || "";
  const nipRaw = extractLabeled(compact, labels.nip) || joined.match(/\b(?:NIP[:\s]*)?(\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2})\b/i)?.[1] || "";
  const nip = nipRaw.replace(/\D/g, "");
  const clientType = extractLabeled(compact, labels.clientType).toLowerCase();
  const companyMarkers = ["sp. z o.o", "sp z oo", "spółka", "spolka", "s.a.", "nip", "krs"];
  const isCompany = clientType.includes("firma") || clientType.includes("фирм") || Boolean(nip && companyMarkers.some((marker) => lower.includes(marker)));

  const make = extractLabeled(compact, labels.make);
  const model = extractLabeled(compact, labels.model);
  const makeModel = normalizeSpace(`${make} ${model}`);

  return {
    client: {
      type: isCompany ? "company" : "person",
      name: extractLabeled(compact, labels.client),
      address: extractLabeled(compact, labels.address),
      identifier: isCompany ? nip : pesel,
      document: isCompany ? "" : extractLabeled(compact, labels.document),
      phone: normalizeSpace(phone),
      email,
    },
    budget: {
      total: extractLabeled(compact, labels.budget),
      advance: extractLabeled(compact, labels.deposit),
    },
    vehicle: {
      make_model: makeModel,
      fuel: parseFuel(extractLabeled(compact, labels.fuel)),
      gearbox: parseGearbox(extractLabeled(compact, labels.gearbox)),
      first_registration: extractLabeled(compact, labels.year),
      body: parseBody(extractLabeled(compact, labels.body)),
      required_equipment: extractLabeled(compact, labels.extra),
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
  $("budgetAdvance").value = data.budget?.advance || $("budgetAdvance").value;
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

async function generatePdf() {
  setStatus("Przygotowuje PDF...");
  try {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectData()),
    });
    if (!response.ok) throw new Error(await response.text());

    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/);
    showDownload(blob, match?.[1] || "umowa-autogood.pdf", "PDF gotowy.");
  } catch {
    setStatus("Gotowy PDF z szablonu dziala w lokalnej wersji programu: http://127.0.0.1:8765/");
  }
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

function resetForm() {
  $("contractDate").value = todayISO();
  $("sequence").value = "1";
  document.querySelectorAll(".pdfShell input, .pdfShell textarea").forEach((node) => {
    node.disabled = false;
    if (node.id === "contractDate" || node.id === "sequence") return;
    if (node.type === "radio" || node.type === "checkbox") node.checked = false;
    else node.value = "";
  });
  setRadio("clientType", "person");
  setRadio("subject", "purchase_by_autogood");
  $("clientEntrepreneur").checked = false;
  localStorage.removeItem(pdfStorageKey);
  syncClientTypeRules();
  setStatus("");
}

function applySavedData(data) {
  $("contractDate").value = data.contract?.date || todayISO();
  $("sequence").value = data.contract?.sequence || 1;
  const clientType = data.client?.type || (data.client?.nip ? "company" : "person");
  setRadio("clientType", clientType);
  $("clientName").value = data.client?.name || "";
  $("clientAddress").value = data.client?.address || "";
  $("clientIdentifier").value = data.client?.pesel || data.client?.nip || "";
  $("clientDocument").value = data.client?.document || "";
  $("clientPhone").value = data.client?.phone || "";
  $("clientEmail").value = data.client?.email || "";
  setRadio("subject", data.agreement?.subject || "purchase_by_autogood");
  $("clientIndicatedVehicle").checked = Boolean(data.agreement?.client_indicated_vehicle);
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
  syncClientTypeRules();
}

function loadSavedData() {
  $("contractDate").value = todayISO();
  const saved = localStorage.getItem(pdfStorageKey);
  if (!saved) {
    syncClientTypeRules();
    return;
  }

  try {
    applySavedData(JSON.parse(saved));
    setStatus("Wczytano zapisane dane.");
  } catch {
    localStorage.removeItem(pdfStorageKey);
    syncClientTypeRules();
  }
}

$("parseBtn").addEventListener("click", parseRawText);
$("resetBtn").addEventListener("click", resetForm);
$("saveBtn").addEventListener("click", saveData);
$("exportBtn").addEventListener("click", exportData);
$("printBtn").addEventListener("click", generatePdf);

document.querySelectorAll('input[name="clientType"]').forEach((node) => {
  node.addEventListener("change", syncClientTypeRules);
});

document.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("change", () => localStorage.setItem(pdfStorageKey, JSON.stringify(collectData(), null, 2)));
});

loadSavedData();
