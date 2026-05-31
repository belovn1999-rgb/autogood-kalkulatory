const $ = (id) => document.getElementById(id);

const statusEl = $("status");
let currentLang = "ru";
let currentDownloadUrl = null;

const translations = {
  ru: {
    date: "Дата",
    generate: "DOCX",
    printPdf: "Drukuj PDF",
    inputData: "Входные данные",
    reset: "Wyzeruj",
    parse: "Распознать данные",
    person: "физлицо",
    company: "фирма",
    subject1: "1) поиск предложений и посредничество в покупке",
    subject2: "2) поиск в бюджете и покупка через AUTOGOOD",
    subject3: "3) покупка с финансированием",
    subject4: "авто указано клиентом",
    parsing: "Распознаю...",
    parseFail: "Не удалось распознать данные.",
    parseOk: "Данные распознаны. Проверь поля и чекбоксы.",
    generating: "Генерирую документ...",
    generatingPdf: "Готовлю PDF...",
    generateFail: "Не удалось создать документ.",
    localOnly: "Готовый PDF/DOCX из шаблона создается в локальной версии: http://127.0.0.1:8765/",
    ready: "Документ готов.",
    pdfReady: "PDF готов к скачиванию.",
  },
  pl: {
    date: "Data",
    generate: "DOCX",
    printPdf: "Drukuj PDF",
    inputData: "Dane wejściowe",
    reset: "Wyzeruj",
    parse: "Rozpoznaj dane",
    person: "osoba",
    company: "firma",
    subject1: "1) wyszukanie ofert oraz pośrednictwo w zakupie",
    subject2: "2) wyszukanie ofert oraz zakup przez Zleceniobiorcę",
    subject3: "3) zakup z finansowania",
    subject4: "pojazd wskazany przez Zleceniodawcę",
    parsing: "Rozpoznaję...",
    parseFail: "Nie udało się rozpoznać danych.",
    parseOk: "Dane rozpoznane. Sprawdź pola i checkboxy.",
    generating: "Generuję dokument...",
    generatingPdf: "Przygotowuję PDF...",
    generateFail: "Nie udało się wygenerować dokumentu.",
    localOnly: "Gotowy PDF/DOCX z szablonu działa w lokalnej wersji: http://127.0.0.1:8765/",
    ready: "Dokument gotowy.",
    pdfReady: "PDF gotowy do pobrania.",
  },
};

const labels = {
  client: ["Клиент", "Client", "Klient"],
  clientType: ["Тип клиента", "Rodzaj klienta"],
  address: ["Адрес", "Adres"],
  pesel: ["PESEL"],
  nip: ["NIP"],
  document: ["Документ", "Dokument"],
  phone: ["Телефон", "Telefon", "Nr. tel", "Nr tel"],
  email: ["Email", "E-mail", "Mail"],
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

function t(key) {
  return translations[currentLang][key] || translations.pl[key] || key;
}

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll(".lang-btn").forEach((node) => {
    node.classList.toggle("active", node.dataset.lang === lang);
  });
}

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function checkedRadio(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || null;
}

function setRadio(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((node) => {
    node.checked = node.value === value;
  });
}

function setFuel(values) {
  const set = new Set(values || []);
  document.querySelectorAll("[data-fuel]").forEach((node) => {
    node.checked = set.has(node.dataset.fuel);
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

function setStatus(text) {
  if (currentDownloadUrl) {
    URL.revokeObjectURL(currentDownloadUrl);
    currentDownloadUrl = null;
  }
  statusEl.innerHTML = "";
  statusEl.textContent = text;
}

function showDownload(blob, filename, readyText) {
  if (currentDownloadUrl) {
    URL.revokeObjectURL(currentDownloadUrl);
  }
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
    // The in-app browser can block downloads; the visible link stays available.
  }
}

function syncClientTypeRules() {
  const isCompany = checkedRadio("clientType") === "company";
  const entrepreneur = $("clientEntrepreneur");
  entrepreneur.checked = isCompany;
  entrepreneur.disabled = isCompany;
  $("clientDocument").disabled = isCompany;
  if (isCompany) {
    $("clientDocument").value = "";
  }
}

function applyParsed(data) {
  if (data.client?.type) {
    document.querySelector(`input[name="clientType"][value="${data.client.type}"]`).checked = true;
    $("clientEntrepreneur").checked = data.client.type === "company";
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

function parseRawTextValue(text) {
  const compact = normalizeSpace(text);
  const joined =
    text
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
      make_model: normalizeSpace(`${make} ${model}`),
      fuel: parseFuel(extractLabeled(compact, labels.fuel)),
      gearbox: parseGearbox(extractLabeled(compact, labels.gearbox)),
      first_registration: extractLabeled(compact, labels.year),
      body: parseBody(extractLabeled(compact, labels.body)),
      required_equipment: extractLabeled(compact, labels.extra),
    },
  };
}

function collectData() {
  const clientType = checkedRadio("clientType") || "person";
  const bodyType = checkedRadio("bodyType");
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
      pesel: clientType === "person" ? $("clientIdentifier").value.trim() : "",
      nip: clientType === "company" ? $("clientIdentifier").value.trim() : "",
      document: isCompany ? "" : $("clientDocument").value.trim(),
      phone: $("clientPhone").value.trim(),
      email: $("clientEmail").value.trim(),
    },
    agreement: {
      subject: checkedRadio("subject"),
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
        type: bodyType,
        other: $("bodyOther").value.trim(),
      },
      allow_collision_without_longitudinals: $("allowCollision").checked,
      required_equipment: $("requiredEquipment").value.trim(),
      expected_equipment: $("expectedEquipment").value.trim(),
    },
  };
}

async function parseRawText() {
  setStatus(t("parsing"));
  try {
    const response = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: $("rawClient").value }),
    });
    if (!response.ok) throw new Error("API parse failed");
    applyParsed(await response.json());
  } catch {
    applyParsed(parseRawTextValue($("rawClient").value));
  }
  setStatus(t("parseOk"));
}

async function generateContract() {
  setStatus(t("generating"));
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectData()),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || t("generateFail"));
    }
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] || "umowa-autogood.docx";
    showDownload(blob, filename, t("ready"));
  } catch (error) {
    setStatus(error.message === t("generateFail") ? error.message : t("localOnly"));
  }
}

async function generatePdf() {
  setStatus(t("generatingPdf"));
  try {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectData()),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || t("generateFail"));
    }
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] || "umowa-autogood.pdf";
    showDownload(blob, filename, t("pdfReady"));
  } catch (error) {
    if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
      setStatus(error.message || t("generateFail"));
      return;
    }
    setStatus(t("localOnly"));
  }
}

function resetForm() {
  $("contractDate").value = todayISO();
  $("sequence").value = "1";
  document.querySelectorAll("input, textarea").forEach((node) => {
    node.disabled = false;
    if (node.id === "contractDate" || node.id === "sequence") return;
    if (node.type === "radio" || node.type === "checkbox") {
      node.checked = false;
    } else {
      node.value = "";
    }
  });
  document.querySelector('input[name="clientType"][value="person"]').checked = true;
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
document.querySelectorAll('input[name="clientType"]').forEach((node) => {
  node.addEventListener("change", syncClientTypeRules);
});
document.querySelectorAll(".lang-btn").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

setLanguage("ru");
syncClientTypeRules();
