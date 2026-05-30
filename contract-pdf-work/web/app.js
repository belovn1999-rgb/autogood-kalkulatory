const $ = (id) => document.getElementById(id);

const statusEl = $("status");
let currentLang = "ru";

const translations = {
  ru: {
    date: "Дата",
    generate: "Создать DOCX",
    inputData: "Входные данные",
    reset: "Очистить",
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
    generateFail: "Не удалось создать документ.",
    ready: "Документ готов.",
  },
  pl: {
    date: "Data",
    generate: "Generuj DOCX",
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
    generateFail: "Nie udało się wygenerować dokumentu.",
    ready: "Dokument gotowy.",
  },
};

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

function setStatus(text) {
  statusEl.textContent = text;
}

function syncClientTypeRules() {
  const isCompany = checkedRadio("clientType") === "company";
  $("clientEntrepreneur").checked = isCompany;
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
  const response = await fetch("/api/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: $("rawClient").value }),
  });
  if (!response.ok) {
    setStatus(t("parseFail"));
    return;
  }
  const data = await response.json();
  applyParsed(data);
  setStatus(t("parseOk"));
}

async function generateContract() {
  setStatus(t("generating"));
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collectData()),
  });

  if (!response.ok) {
    const error = await response.text();
    setStatus(error || t("generateFail"));
    return;
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] || "umowa-autogood.docx";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus(t("ready"));
}

function resetForm() {
  $("contractDate").value = todayISO();
  $("sequence").value = "1";
  document.querySelectorAll("input, textarea").forEach((node) => {
    if (node.id === "contractDate" || node.id === "sequence") return;
    if (node.type === "radio" || node.type === "checkbox") {
      node.checked = false;
    } else {
      node.value = "";
    }
  });
  document.querySelector('input[name="clientType"][value="person"]').checked = true;
  setRadio("subject", "purchase_by_autogood");
  $("clientDocument").disabled = false;
  $("clientEntrepreneur").checked = false;
  syncClientTypeRules();
  setStatus("");
}

$("contractDate").value = todayISO();
$("parseBtn").addEventListener("click", parseRawText);
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
