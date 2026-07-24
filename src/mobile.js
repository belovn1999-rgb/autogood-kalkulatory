const DEFAULT_MOBILEDE_API_URL = "https://dual-combines-syndrome-existed.trycloudflare.com/mobilede/import";

const copy = {
  pl: {
    eyebrow: "LINK MOBILE.DE",
    lead: "Wklej link, sprawdź dane auta i wybierz scenariusz zakupu. Kalkulator dostanie cenę, transport, oględziny i akcyzę.",
    inputLabel: "Link ogłoszenia",
    loadButton: "Rozpoznaj",
    loadingButton: "Pobieram",
    helper: "",
    loading: "Pobieram dane z mobile.de. To może chwilę potrwać.",
    ready: "Dane gotowe. Wybierz scenariusz zakupu na dole strony.",
    error: "Nie udało się rozpoznać ogłoszenia. Sprawdź link albo backend.",
    listingEyebrow: "DANE Z OGŁOSZENIA",
    manualEyebrow: "WPISZ DANE RĘCZNIE",
    calculatorDataEyebrow: "DANE DO KALKULATORA",
    brandLabel: "Marka",
    modelLabel: "Model",
    fuelLabel: "Paliwo",
    pluginLabel: "Plug-in",
    bodyLabel: "Nadwozie",
    mileageRangeLabel: "Przebieg",
    yearRangeLabel: "Rok",
    displacementRangeLabel: "Pojemność silnika",
    powerRangeLabel: "Moc silnika (KM)",
    driveLabel: "Napęd",
    driveAny: "Dowolny",
    driveAwd: "AWD",
    driveFwd: "FWD",
    driveRwd: "RWD",
    gearboxLabel: "Skrzynia biegów",
    gearboxAny: "Dowolny",
    gearboxAutomatic: "Automatyczna",
    gearboxManual: "Manualna",
    fromPlaceholder: "od",
    toPlaceholder: "do",
    sourceEyebrow: "SPRZEDAWCA",
    actionsTitle: "Wybierz ścieżkę zakupu",
    footer: "Mobile.de → kalkulatory operacyjne",
    emptyTitle: "—",
    emptyValue: "—",
    price: "Cena z ogłoszenia",
    purchaseType: "Typ zakupu",
    fuel: "Paliwo",
    engine: "Typ silnika / akcyza",
    displacement: "Pojemność silnika",
    power: "Moc silnika",
    gearbox: "Skrzynia biegów",
    body: "Nadwozie",
    mileage: "Przebieg",
    registration: "Rok / pierwsza rejestracja",
    location: "Lokalizacja",
    seller: "Sprzedawca",
    delivery: "Transport netto",
    inspection: "Oględziny netto",
    tariff: "Typ zakupu",
    selectEmpty: "Wybierz",
    scenarios: [
      { key: "direct", number: "01", tab: 0, title: "Zakup bezpośredni" },
      { key: "company", number: "02", tab: 3, title: "Dealerzy VAT 23%" },
      { key: "ag", number: "03", tab: 4, title: "Dealerzy VAT Marża" },
    ],
  },
  ru: {
    eyebrow: "ССЫЛКА MOBILE.DE",
    lead: "Вставь ссылку, проверь данные авто и выбери сценарий покупки. Калькулятор получит цену, доставку, осмотр и акциз.",
    inputLabel: "Ссылка объявления",
    loadButton: "Распознать",
    loadingButton: "Загружаю",
    helper: "",
    loading: "Загружаю данные с mobile.de. Это может занять время.",
    ready: "Данные готовы. Выбери сценарий покупки внизу страницы.",
    error: "Не удалось распознать объявление. Проверь ссылку или backend.",
    listingEyebrow: "ДАННЫЕ ИЗ ОБЪЯВЛЕНИЯ",
    manualEyebrow: "ВВЕСТИ ДАННЫЕ ВРУЧНУЮ",
    calculatorDataEyebrow: "ДАННЫЕ ДЛЯ КАЛЬКУЛЯТОРА",
    brandLabel: "Марка",
    modelLabel: "Модель",
    fuelLabel: "Топливо",
    pluginLabel: "Plug-in",
    bodyLabel: "Кузов",
    mileageRangeLabel: "Пробег",
    yearRangeLabel: "Год",
    displacementRangeLabel: "Объём двигателя",
    powerRangeLabel: "Мощность двигателя (л.с.)",
    driveLabel: "Привод",
    driveAny: "Любой",
    driveAwd: "Полный",
    driveFwd: "Передний",
    driveRwd: "Задний",
    gearboxLabel: "Коробка передач",
    gearboxAny: "Любая",
    gearboxAutomatic: "Автоматическая",
    gearboxManual: "Механическая",
    fromPlaceholder: "от",
    toPlaceholder: "до",
    sourceEyebrow: "ПРОДАВЕЦ",
    actionsTitle: "Выбери путь покупки",
    footer: "Mobile.de → рабочие калькуляторы",
    emptyTitle: "—",
    emptyValue: "—",
    price: "Цена из объявления",
    purchaseType: "Тип закупа",
    fuel: "Топливо",
    engine: "Тип двигателя / акциз",
    displacement: "Объём двигателя",
    power: "Мощность двигателя",
    gearbox: "Коробка передач",
    body: "Кузов",
    mileage: "Пробег",
    registration: "Год / первая регистрация",
    location: "Локация",
    seller: "Продавец",
    delivery: "Доставка netto",
    inspection: "Осмотр netto",
    tariff: "Тип закупа",
    selectEmpty: "Выбери",
    scenarios: [
      { key: "direct", number: "01", tab: 0, title: "Прямая покупка" },
      { key: "company", number: "02", tab: 3, title: "Дилеры VAT 23%" },
      { key: "ag", number: "03", tab: 4, title: "Дилеры VAT Маржа" },
    ],
  },
};

const fallbackBrands = {
  "Alfa Romeo": {},
  Audi: {},
  BMW: {},
  Citroen: {},
  Cupra: {},
  Dacia: {},
  DS: {},
  Fiat: {},
  Ford: {},
  Hyundai: {},
  Iveco: {},
  Jaguar: {},
  Jeep: {},
  Kia: {},
  "Land Rover": {},
  Lexus: {},
  "Mercedes-Benz": {},
  "Mercedes Trucks": {},
  "Mercedes Vans": {},
  Mini: {},
  Mitsubishi: {},
  Nissan: {},
  Opel: {},
  Peugeot: {},
  Porsche: {},
  Renault: {},
  Seat: {},
  Skoda: {},
  Smart: {},
  Suzuki: {},
  Toyota: {},
  Volvo: {},
  "Vw Nutzfahrzeuge": {},
};

const favoriteBrands = [
  { value: "Audi", label: "Audi" },
  { value: "BMW", label: "BMW" },
  { value: "Ford", label: "Ford" },
  { value: "Mercedes-Benz", label: "Mercedes-Benz" },
  { value: "Peugeot", label: "Peugeot" },
  { value: "Renault", label: "Renault" },
  { value: "Toyota", label: "Toyota" },
  { value: "Volvo", label: "Volvo" },
  { value: "Vw Nutzfahrzeuge", label: "Volkswagen" },
];

const brandAliases = {
  Citroen: ["Citroën"],
  "Mercedes-Benz": ["Mercedes Benz", "Mercedes"],
  "Vw Nutzfahrzeuge": ["Volkswagen", "VW", "Vw"],
};

const fuelOptions = [
  { value: "petrol", pl: "Benzyna", ru: "Бензин" },
  { value: "diesel", pl: "Diesel", ru: "Дизель" },
  { value: "hybrid_diesel", pl: "Hybryda diesel", ru: "Гибрид дизель" },
  { value: "hybrid_petrol", pl: "Hybryda benzyna", ru: "Гибрид бензин" },
  { value: "electric", pl: "Elektryk", ru: "Электрик" },
];

const bodyOptions = [
  { value: "limousine", pl: "Limousine / Sedan", ru: "Седан / Limousine" },
  { value: "estate", pl: "Kombi", ru: "Универсал" },
  { value: "suv", pl: "SUV / Terenowy", ru: "SUV / Внедорожник" },
  { value: "hatchback", pl: "Hatchback", ru: "Хэтчбек" },
  { value: "coupe", pl: "Coupe", ru: "Купе" },
  { value: "cabrio", pl: "Cabrio", ru: "Кабрио" },
  { value: "van_minibus", pl: "Van / Minibus", ru: "Van / Minibus" },
  { value: "pickup", pl: "Pickup", ru: "Пикап" },
  { value: "other", pl: "Inne", ru: "Другое" },
];

const displacementOptions = ["1000", "1200", "1400", "1600", "1800", "2000", "2600", "3000", "> 5000", "< 5000"];
const powerOptions = ["75", "90", "101", "118", "131", "150", "200", "252", "303", "358", "402", "452"];

const state = {
  lang: new URLSearchParams(window.location.search).get("lang") === "ru" ? "ru" : "pl",
  data: null,
  status: "idle",
  error: "",
  brandRoutes: fallbackBrands,
};

const els = {
  form: document.querySelector("[data-mobile-form]"),
  url: document.querySelector("[data-mobile-url]"),
  submit: document.querySelector("[data-mobile-submit]"),
  status: document.querySelector("[data-mobile-status]"),
  listingDetails: document.querySelector("[data-mobile-listing-details]"),
  title: document.querySelector("[data-mobile-title]"),
  scenarios: document.querySelector("[data-mobile-scenarios]"),
  brand: document.querySelector("[data-mobile-brand]"),
  model: document.querySelector("[data-mobile-model]"),
  modelOptions: document.querySelector("[data-mobile-model-options]"),
  fuel: document.querySelector("[data-mobile-fuel]"),
  plugin: document.querySelector("[data-mobile-plugin]"),
  body: document.querySelector("[data-mobile-body]"),
  mileageFrom: document.querySelector("[data-mobile-mileage-from]"),
  mileageTo: document.querySelector("[data-mobile-mileage-to]"),
  mileageOptions: document.querySelector("[data-mobile-mileage-options]"),
  yearFrom: document.querySelector("[data-mobile-year-from]"),
  yearTo: document.querySelector("[data-mobile-year-to]"),
  yearOptions: document.querySelector("[data-mobile-year-options]"),
  displacementFrom: document.querySelector("[data-mobile-displacement-from]"),
  displacementTo: document.querySelector("[data-mobile-displacement-to]"),
  displacementOptions: document.querySelector("[data-mobile-displacement-options]"),
  powerFrom: document.querySelector("[data-mobile-power-from]"),
  powerTo: document.querySelector("[data-mobile-power-to]"),
  powerOptions: document.querySelector("[data-mobile-power-options]"),
  drive: Array.from(document.querySelectorAll("[data-mobile-drive]")),
  gearbox: Array.from(document.querySelectorAll("[data-mobile-gearbox]")),
};

function readMobileDeApiUrl() {
  const configuredUrl = window.AUTOGOOD_MOBILEDE_API_URL;
  const params = new URLSearchParams(window.location.search);
  const queryUrl = params.get("mobiledeApi");
  return configuredUrl || queryUrl || DEFAULT_MOBILEDE_API_URL;
}

function formatAmount(value, currency) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return copy[state.lang].emptyValue;
  return `${Math.round(amount).toLocaleString("pl-PL")} ${currency}`;
}

function formatNumberWithUnit(value, unit) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return copy[state.lang].emptyValue;
  return `${Math.round(amount).toLocaleString("pl-PL")} ${unit}`;
}

function text(value) {
  return value === null || value === undefined || value === "" ? copy[state.lang].emptyValue : String(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function optionHtml(value, label, selected = false) {
  return `<option value="${escapeHtml(value)}"${selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
}

function datalistOptionHtml(value) {
  return `<option value="${escapeHtml(value)}"></option>`;
}

function normalizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function renderI18n() {
  const c = copy[state.lang];
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (c[key]) node.textContent = c[key];
  });
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.classList.toggle("isActive", button.dataset.langButton === state.lang);
  });
  const label = els.submit?.querySelector("span");
  if (label) label.textContent = state.status === "loading" ? c.loadingButton : c.loadButton;
  setRangePlaceholders();
  renderManualOptions(false);
}

function detailRow(label, value) {
  return `<div class="mobileDataRow"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function moneyRow(label, value, primary = false) {
  return `<div class="mobileMoneyRow ${primary ? "isPrimary" : ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function purchaseTypeLabel(data) {
  const rawValue = [
    data?.purchaseType,
    data?.taxType,
    data?.vatType,
    data?.priceType,
    data?.priceTaxType,
    data?.price?.type,
    data?.price?.taxType,
    data?.price?.vatType,
  ].find((value) => value !== null && value !== undefined && String(value).trim() !== "");
  const normalized = String(rawValue || "").toLowerCase();
  if (/marża|marza|margin|marge|differenz/.test(normalized)) return "Marża";
  if (/vat|mwst|ust|tax|netto|deduct/.test(normalized)) return "VAT";
  return rawValue ? String(rawValue) : copy[state.lang].emptyValue;
}

function brandDisplayOptions() {
  const favoriteValues = new Set(favoriteBrands.map((brand) => brand.value));
  const favorites = favoriteBrands.filter((brand) => state.brandRoutes[brand.value]);
  const regularBrands = Object.keys(state.brandRoutes)
    .filter((brand) => !favoriteValues.has(brand))
    .sort((left, right) => left.localeCompare(right, "pl"));
  return [
    ...favorites.map((brand) => ({ value: brand.value, label: `★ ${brand.label}` })),
    ...regularBrands.map((brand) => ({ value: brand, label: brand })),
  ];
}

function mileageOptions() {
  const values = [];
  for (let value = 0; value <= 500000; value += 10000) values.push(value);
  return values;
}

function yearOptions() {
  const currentYear = new Date().getFullYear();
  const values = [];
  for (let year = currentYear + 1; year >= 1990; year -= 1) values.push(String(year));
  return values;
}

function renderDatalist(el, values) {
  if (!el) return;
  el.innerHTML = values.map((value) => datalistOptionHtml(String(value))).join("");
}

function comboOptionSets() {
  return {
    mileage: mileageOptions().map((value) => ({
      value: String(value),
      label: `${value.toLocaleString("pl-PL")} km`,
    })),
    year: yearOptions().map((value) => ({ value, label: value })),
    displacement: displacementOptions.map((value) => ({
      value,
      label: `${value} ccm`,
    })),
    power: powerOptions.map((value) => ({
      value,
      label: `${value} KM`,
    })),
  };
}

function closeComboMenus(exceptControl = null) {
  document.querySelectorAll(".mobileComboControl.isOpen").forEach((control) => {
    if (control === exceptControl) return;
    control.classList.remove("isOpen");
    control.querySelector("[data-mobile-options]")?.setAttribute("aria-expanded", "false");
  });
}

function renderComboMenus() {
  const sets = comboOptionSets();
  document.querySelectorAll("[data-mobile-options]").forEach((button) => {
    const control = button.closest(".mobileComboControl");
    if (!control) return;
    const options = sets[button.dataset.mobileOptions] || [];
    let menu = control.querySelector(".mobileComboMenu");
    if (!menu) {
      menu = document.createElement("div");
      menu.className = "mobileComboMenu";
      control.append(menu);
    }
    button.setAttribute("aria-expanded", control.classList.contains("isOpen") ? "true" : "false");
    menu.innerHTML = options.map((option) => `
      <button type="button" data-mobile-option-value="${escapeHtml(option.value)}">
        ${escapeHtml(option.label)}
      </button>
    `).join("");
  });
}

function checkedValue(radios) {
  return radios.find((radio) => radio.checked)?.value || "";
}

function setCheckedValue(radios, value) {
  radios.forEach((radio) => {
    radio.checked = radio.value === value;
  });
}

function setRangePlaceholders() {
  const c = copy[state.lang];
  [
    [els.mileageFrom, c.fromPlaceholder],
    [els.yearFrom, c.fromPlaceholder],
    [els.displacementFrom, c.fromPlaceholder],
    [els.powerFrom, c.fromPlaceholder],
    [els.mileageTo, c.toPlaceholder],
    [els.yearTo, c.toPlaceholder],
    [els.displacementTo, c.toPlaceholder],
    [els.powerTo, c.toPlaceholder],
  ].forEach(([input, placeholder]) => {
    if (input) input.placeholder = placeholder;
  });
}

function mileageBucket(value, mode) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "";
  const bucket = mode === "to"
    ? Math.ceil(amount / 10000) * 10000
    : Math.floor(amount / 10000) * 10000;
  return String(Math.min(Math.max(bucket, 0), 500000));
}

function extractYear(value) {
  const match = String(value || "").match(/\b(19\d{2}|20\d{2})\b/);
  return match ? match[1] : "";
}

function compactNumber(value) {
  const match = String(value || "").replace(/\s+/g, "").match(/\d+/);
  return match ? match[0] : "";
}

function optionLabel(options, value) {
  const option = options.find((item) => item.value === value);
  return option ? option[state.lang] : "";
}

function listingBodyLabel(value) {
  const normalized = normalizeBody(value);
  return optionLabel(bodyOptions, normalized) || text(value);
}

function listingGearboxLabel(value) {
  const normalized = String(value || "").toLowerCase();
  if (/auto|automat|automatic|automatyczna/.test(normalized)) return copy[state.lang].gearboxAutomatic;
  if (/manual|schalt|manualna|ręczna|reczna/.test(normalized)) return copy[state.lang].gearboxManual;
  return text(value);
}

function normalizeGearboxChoice(value) {
  const normalized = String(value || "").toLowerCase();
  if (/auto|automat|automatic|automatyczna/.test(normalized)) return "automatic";
  if (/manual|schalt|manualna|ręczna|reczna/.test(normalized)) return "manual";
  return "any";
}

function listingRegistration(value) {
  const year = extractYear(value);
  if (year && String(value).trim() !== year) return `${year} (${String(value).trim()})`;
  return text(value || year);
}

function renderManualOptions(keepValues = true) {
  const c = copy[state.lang];
  const current = keepValues ? readManualFields() : {
    brand: els.brand.value,
    model: els.model.value,
    fuel: els.fuel.value,
    plugin: els.plugin.checked ? "yes" : "",
    body: els.body.value,
    mileageFrom: els.mileageFrom.value,
    mileageTo: els.mileageTo.value,
    yearFrom: els.yearFrom.value,
    yearTo: els.yearTo.value,
    displacementFrom: els.displacementFrom.value,
    displacementTo: els.displacementTo.value,
    powerFrom: els.powerFrom.value,
    powerTo: els.powerTo.value,
    drive: checkedValue(els.drive) || "any",
    gearbox: checkedValue(els.gearbox) || "any",
  };

  els.brand.innerHTML = [
    optionHtml("", c.selectEmpty),
    ...brandDisplayOptions().map((brand) => optionHtml(brand.value, brand.label, brand.value === current.brand)),
  ].join("");

  els.fuel.innerHTML = [
    optionHtml("", c.selectEmpty),
    ...fuelOptions.map((fuel) => optionHtml(fuel.value, fuel[state.lang], fuel.value === current.fuel)),
  ].join("");

  els.plugin.checked = current.plugin === "yes";

  els.body.innerHTML = [
    optionHtml("", c.selectEmpty),
    ...bodyOptions.map((body) => optionHtml(body.value, body[state.lang], body.value === current.body)),
  ].join("");

  els.model.value = current.model || "";
  renderDatalist(els.mileageOptions, mileageOptions());
  renderDatalist(els.yearOptions, yearOptions());
  renderDatalist(els.displacementOptions, displacementOptions);
  renderDatalist(els.powerOptions, powerOptions);
  renderComboMenus();
  els.mileageFrom.value = current.mileageFrom || "";
  els.mileageTo.value = current.mileageTo || "";
  els.yearFrom.value = current.yearFrom || "";
  els.yearTo.value = current.yearTo || "";
  els.displacementFrom.value = current.displacementFrom || "";
  els.displacementTo.value = current.displacementTo || "";
  els.powerFrom.value = current.powerFrom || "";
  els.powerTo.value = current.powerTo || "";
  setCheckedValue(els.drive, current.drive || "any");
  setCheckedValue(els.gearbox, current.gearbox || "any");
}

function readManualFields() {
  return {
    brand: els.brand?.value || "",
    model: els.model?.value || "",
    fuel: els.fuel?.value || "",
    plugin: els.plugin?.checked ? "yes" : "",
    body: els.body?.value || "",
    mileageFrom: els.mileageFrom?.value || "",
    mileageTo: els.mileageTo?.value || "",
    yearFrom: els.yearFrom?.value || "",
    yearTo: els.yearTo?.value || "",
    displacementFrom: els.displacementFrom?.value || "",
    displacementTo: els.displacementTo?.value || "",
    powerFrom: els.powerFrom?.value || "",
    powerTo: els.powerTo?.value || "",
    drive: checkedValue(els.drive),
    gearbox: checkedValue(els.gearbox),
  };
}

function matchBrand(title) {
  const normalizedTitle = normalizeToken(title);
  const options = brandDisplayOptions().map((brand) => {
    const aliases = [brand.value, brand.label.replace(/^★\s*/, ""), ...(brandAliases[brand.value] || [])];
    const score = aliases.some((alias) => normalizedTitle.startsWith(normalizeToken(alias)))
      ? Math.max(...aliases.map((alias) => normalizeToken(alias).length))
      : 0;
    return { value: brand.value, score, aliases };
  }).filter((brand) => brand.score > 0);

  options.sort((left, right) => right.score - left.score);
  return options[0] || null;
}

function extractModel(title, brandMatch) {
  let model = String(title || "").trim();
  if (!model || !brandMatch) return model;
  const aliases = [brandMatch.value, ...(brandAliases[brandMatch.value] || [])]
    .sort((left, right) => right.length - left.length);
  for (const alias of aliases) {
    const pattern = new RegExp(`^${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
    if (pattern.test(model)) {
      model = model.replace(pattern, "").trim();
      break;
    }
  }
  return model.replace(/\s{2,}/g, " ");
}

function normalizeFuel(value, title = "") {
  const normalized = normalizeToken(`${value} ${title}`);
  const hasPlugin = /plug in|plugin|phev/.test(normalized);
  const hasHybrid = /hybrid|hybryd|hev|phev/.test(normalized);
  if (/electric|elektro|elektryk|bev/.test(normalized)) return "electric";
  if (/diesel|olej napedowy/.test(normalized) && hasHybrid) return "hybrid_diesel";
  if (/(petrol|benzin|benzyna|gasoline)/.test(normalized) && hasHybrid) return "hybrid_petrol";
  if (/diesel|olej napedowy/.test(normalized)) return "diesel";
  if (/petrol|benzin|benzyna|gasoline/.test(normalized)) return "petrol";
  return "";
}

function normalizePlugin(value, title = "") {
  const normalized = normalizeToken(`${value} ${title}`);
  return /plug in|plugin|phev/.test(normalized) ? "yes" : "";
}

function normalizeBody(value) {
  const normalized = normalizeToken(value);
  if (/kombi|estate|touring|avant|variant|wagon/.test(normalized)) return "estate";
  if (/suv|teren|off road|offroad|gelande/.test(normalized)) return "suv";
  if (/hatch|compact|small car|kleinwagen/.test(normalized)) return "hatchback";
  if (/coupe|coup/.test(normalized)) return "coupe";
  if (/cabrio|convertible|roadster/.test(normalized)) return "cabrio";
  if (/van|minibus|bus|mpv/.test(normalized)) return "van_minibus";
  if (/pickup|pick up/.test(normalized)) return "pickup";
  if (/limousine|sedan|saloon/.test(normalized)) return "limousine";
  return value ? "other" : "";
}

function applyRecognizedManualFields(data) {
  const title = data?.title || "";
  const brandMatch = matchBrand(title);
  const model = extractModel(title, brandMatch);
  const registrationYear = extractYear(data?.firstRegistration);
  const displacementCcm = compactNumber(data?.displacementCcm);
  const powerHp = compactNumber(data?.powerHp ?? data?.horsepower ?? data?.powerPs);
  const next = {
    brand: brandMatch?.value || "",
    model,
    fuel: normalizeFuel(data?.fuel, title),
    plugin: normalizePlugin(data?.fuel, title),
    body: normalizeBody(data?.bodyType),
    mileageFrom: mileageBucket(data?.mileageKm, "from"),
    mileageTo: mileageBucket(data?.mileageKm, "to"),
    yearFrom: registrationYear,
    yearTo: registrationYear,
    displacementFrom: displacementCcm,
    displacementTo: displacementCcm,
    powerFrom: powerHp,
    powerTo: powerHp,
    gearbox: normalizeGearboxChoice(data?.gearbox),
  };

  els.brand.value = next.brand;
  els.model.value = next.model;
  els.fuel.value = next.fuel;
  els.plugin.checked = next.plugin === "yes";
  els.body.value = next.body;
  els.mileageFrom.value = next.mileageFrom;
  els.mileageTo.value = next.mileageTo;
  els.yearFrom.value = next.yearFrom;
  els.yearTo.value = next.yearTo;
  els.displacementFrom.value = next.displacementFrom;
  els.displacementTo.value = next.displacementTo;
  els.powerFrom.value = next.powerFrom;
  els.powerTo.value = next.powerTo;
  setCheckedValue(els.drive, "any");
  setCheckedValue(els.gearbox, next.gearbox);

  els.modelOptions.innerHTML = next.model ? optionHtml(next.model, next.model) : "";
}

function calculatorUrl(scenario) {
  if (!state.data) return "#";
  const params = new URLSearchParams();
  params.set("tab", String(scenario.tab));
  params.set("source", "mobile");
  params.set("scenario", scenario.key);
  if (state.lang === "ru") params.set("lang", "ru");
  if (state.data.sourceUrl) params.set("mobileUrl", state.data.sourceUrl);
  if (state.data.carBruttoEur) params.set("car", String(Math.round(Number(state.data.carBruttoEur))));
  if (state.data.transportNettoPln) params.set("transport", String(Math.round(Number(state.data.transportNettoPln))));
  if (state.data.inspectionNettoPln) params.set("inspection", String(Math.round(Number(state.data.inspectionNettoPln))));
  if (Number.isInteger(Number(state.data.engineTypeIndex))) params.set("engine", String(Number(state.data.engineTypeIndex)));
  return `./calculators.html?${params.toString()}`;
}

function renderScenarios() {
  const c = copy[state.lang];
  els.scenarios.innerHTML = c.scenarios.map((scenario) => {
    const disabled = !state.data;
    const href = disabled ? "#" : calculatorUrl(scenario);
    return `
      <a class="mobileScenarioCard" href="${escapeHtml(href)}" aria-disabled="${disabled ? "true" : "false"}">
        <b>${escapeHtml(scenario.number)}</b>
        <span>
          <strong>${escapeHtml(scenario.title)}</strong>
        </span>
        <i aria-hidden="true">→</i>
      </a>
    `;
  }).join("");
}

function renderData() {
  const c = copy[state.lang];
  const data = state.data || {};
  const location = data.location || {};
  const estimate = data.deliveryInspectionEstimate || data.transportEstimate || {};
  const title = text(data.title);
  const powerValue = data.powerHp ?? data.horsepower ?? data.powerPs;

  els.title.textContent = title;
  const listingRows = [
    detailRow(c.price, formatAmount(data.carBruttoEur, "EUR")),
    detailRow(c.purchaseType, purchaseTypeLabel(data)),
    detailRow(c.fuel, text(data.fuel)),
    detailRow(c.body, listingBodyLabel(data.bodyType)),
    detailRow(c.mileage, formatNumberWithUnit(data.mileageKm, "km")),
    detailRow(c.registration, listingRegistration(data.firstRegistration)),
    detailRow(c.displacement, formatNumberWithUnit(data.displacementCcm, "ccm")),
    detailRow(c.power, formatNumberWithUnit(powerValue, "KM")),
    detailRow(c.gearbox, listingGearboxLabel(data.gearbox)),
  ].join("");
  const calculatorRows = [
    detailRow(c.engine, text(data.engineTypeLabel)),
    detailRow(c.delivery, formatAmount(data.transportNettoPln ?? estimate.transport, "PLN")),
    detailRow(c.inspection, formatAmount(data.inspectionNettoPln ?? estimate.inspection, "PLN")),
    detailRow(c.tariff, text(estimate.rule)),
    detailRow(c.location, text(location.address || location.city)),
    detailRow(c.seller, text(location.sellerName)),
  ].join("");
  els.listingDetails.innerHTML = `
    <dl class="mobileDataGrid">${listingRows}</dl>
    <section class="mobileCalculatorDataBlock">
      <p>${escapeHtml(c.calculatorDataEyebrow)}</p>
      <dl class="mobileDataGrid">${calculatorRows}</dl>
    </section>
  `;

  renderScenarios();
}

function setStatus(status, message = "") {
  const c = copy[state.lang];
  state.status = status;
  state.error = message;
  els.status.classList.toggle("isError", status === "error");
  els.status.classList.toggle("isSuccess", status === "ready");
  els.status.textContent = status === "loading"
    ? c.loading
    : status === "ready"
      ? c.ready
      : status === "error"
        ? `${c.error}${message ? ` ${message}` : ""}`
        : c.helper;
  els.submit.disabled = status === "loading";
  renderI18n();
}

async function loadMobileDeData(sourceUrl) {
  setStatus("loading");
  state.data = null;
  renderData();

  try {
    const response = await fetch(`${readMobileDeApiUrl()}?url=${encodeURIComponent(sourceUrl)}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || "Mobile.de import failed");
    }
    state.data = await response.json();
    setStatus("ready");
    applyRecognizedManualFields(state.data);
    renderData();
  } catch (error) {
    setStatus("error", error.message || "");
    renderData();
  }
}

document.querySelectorAll("[data-lang-button]").forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.langButton === "ru" ? "ru" : "pl";
    renderI18n();
    setStatus(state.status, state.error);
    renderData();
  });
});

document.addEventListener("click", (event) => {
  const optionsButton = event.target.closest("[data-mobile-options]");
  if (optionsButton) {
    const control = optionsButton.closest(".mobileComboControl");
    const isOpen = control?.classList.contains("isOpen");
    closeComboMenus(control);
    control?.classList.toggle("isOpen", !isOpen);
    optionsButton.setAttribute("aria-expanded", isOpen ? "false" : "true");
    return;
  }

  const optionButton = event.target.closest("[data-mobile-option-value]");
  if (optionButton) {
    const control = optionButton.closest(".mobileComboControl");
    const targetName = control?.querySelector("[data-mobile-options]")?.dataset.mobileOptionsTarget;
    const input = targetName ? control.querySelector(`[${targetName}]`) : null;
    if (input) {
      input.value = optionButton.dataset.mobileOptionValue || "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
    closeComboMenus();
    return;
  }

  if (!event.target.closest(".mobileComboControl")) closeComboMenus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeComboMenus();
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const sourceUrl = els.url.value.trim();
  if (!sourceUrl) return;
  loadMobileDeData(sourceUrl);
});

const initialParams = new URLSearchParams(window.location.search);
const initialUrl = initialParams.get("url");
if (initialUrl) {
  els.url.value = initialUrl;
}

renderManualOptions(false);
renderI18n();
renderData();

fetch("./tools/partslink24/brand-routes.json?v=20260720-5")
  .then((response) => response.ok ? response.json() : Promise.reject())
  .then((data) => {
    state.brandRoutes = data.brands || fallbackBrands;
    renderManualOptions(true);
  })
  .catch(() => renderManualOptions(true));

if (initialUrl) {
  loadMobileDeData(initialUrl);
}
