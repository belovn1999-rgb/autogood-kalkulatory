const DEFAULT_MOBILEDE_API_URL = "https://albuquerque-junior-favourites-assist.trycloudflare.com/mobilede/import";

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
    calcEyebrow: "KWOTY DO KALKULATORA",
    brandLabel: "Marka",
    modelLabel: "Model",
    fuelLabel: "Paliwo",
    pluginLabel: "Plug-in",
    bodyLabel: "Nadwozie",
    mileageFromLabel: "Przebieg od",
    mileageToLabel: "Przebieg do",
    registrationFromLabel: "Pierwsza rejestracja od",
    registrationToLabel: "Pierwsza rejestracja do",
    sourceEyebrow: "SPRZEDAWCA",
    actionsTitle: "Wybierz ścieżkę zakupu",
    footer: "Mobile.de → kalkulatory operacyjne",
    emptyTitle: "—",
    emptyValue: "—",
    price: "Cena z ogłoszenia",
    purchaseType: "Typ zakupu",
    fuel: "Paliwo",
    engine: "Akcyza",
    body: "Nadwozie",
    mileage: "Przebieg",
    registration: "Pierwsza rejestracja",
    location: "Lokalizacja",
    seller: "Sprzedawca",
    delivery: "Transport netto",
    inspection: "Oględziny netto",
    tariff: "Reguła taryfy",
    warning: "Dla VAT 23% sprawdź w ogłoszeniu, czy cena jest netto czy brutto.",
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
    calcEyebrow: "СУММЫ ДЛЯ КАЛЬКУЛЯТОРА",
    brandLabel: "Марка",
    modelLabel: "Модель",
    fuelLabel: "Топливо",
    pluginLabel: "Plug-in",
    bodyLabel: "Кузов",
    mileageFromLabel: "Пробег от",
    mileageToLabel: "Пробег до",
    registrationFromLabel: "Pierwsza rejestracja от",
    registrationToLabel: "Pierwsza rejestracja до",
    sourceEyebrow: "ПРОДАВЕЦ",
    actionsTitle: "Выбери путь покупки",
    footer: "Mobile.de → рабочие калькуляторы",
    emptyTitle: "—",
    emptyValue: "—",
    price: "Цена из объявления",
    purchaseType: "Тип закупа",
    fuel: "Топливо",
    engine: "Акциз",
    body: "Кузов",
    mileage: "Пробег",
    registration: "Первая регистрация",
    location: "Локация",
    seller: "Продавец",
    delivery: "Доставка netto",
    inspection: "Осмотр netto",
    tariff: "Правило тарифа",
    warning: "Для VAT 23% проверь в объявлении, цена netto или brutto.",
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
  source: document.querySelector("[data-mobile-source]"),
  money: document.querySelector("[data-mobile-money]"),
  title: document.querySelector("[data-mobile-title]"),
  price: document.querySelector("[data-mobile-price]"),
  scenarios: document.querySelector("[data-mobile-scenarios]"),
  brand: document.querySelector("[data-mobile-brand]"),
  model: document.querySelector("[data-mobile-model]"),
  modelOptions: document.querySelector("[data-mobile-model-options]"),
  fuel: document.querySelector("[data-mobile-fuel]"),
  plugin: document.querySelector("[data-mobile-plugin]"),
  body: document.querySelector("[data-mobile-body]"),
  mileageFrom: document.querySelector("[data-mobile-mileage-from]"),
  mileageTo: document.querySelector("[data-mobile-mileage-to]"),
  yearFrom: document.querySelector("[data-mobile-year-from]"),
  yearTo: document.querySelector("[data-mobile-year-to]"),
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

function yearOptions() {
  const currentYear = new Date().getFullYear() + 1;
  const years = [];
  for (let year = currentYear; year >= 1990; year -= 1) years.push(year);
  return years;
}

function mileageOptions() {
  const values = [];
  for (let value = 0; value <= 500000; value += 10000) values.push(value);
  return values;
}

function mileageBucket(value, mode) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "";
  const bucket = mode === "to"
    ? Math.ceil(amount / 10000) * 10000
    : Math.floor(amount / 10000) * 10000;
  return String(Math.min(Math.max(bucket, 0), 500000));
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

  const years = yearOptions();
  const mileages = mileageOptions();
  els.mileageFrom.innerHTML = [
    optionHtml("", c.selectEmpty),
    ...mileages.map((value) => optionHtml(String(value), `${value.toLocaleString("pl-PL")} km`, String(value) === current.mileageFrom)),
  ].join("");
  els.mileageTo.innerHTML = [
    optionHtml("", c.selectEmpty),
    ...mileages.map((value) => optionHtml(String(value), `${value.toLocaleString("pl-PL")} km`, String(value) === current.mileageTo)),
  ].join("");
  els.yearFrom.innerHTML = [
    optionHtml("", c.selectEmpty),
    ...years.map((year) => optionHtml(String(year), String(year), String(year) === current.yearFrom)),
  ].join("");
  els.yearTo.innerHTML = [
    optionHtml("", c.selectEmpty),
    ...years.map((year) => optionHtml(String(year), String(year), String(year) === current.yearTo)),
  ].join("");

  els.model.value = current.model || "";
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

function registrationYear(value) {
  const match = String(value || "").match(/\b(19\d{2}|20\d{2})\b/);
  return match ? match[1] : "";
}

function applyRecognizedManualFields(data) {
  const title = data?.title || "";
  const brandMatch = matchBrand(title);
  const model = extractModel(title, brandMatch);
  const year = registrationYear(data?.firstRegistration);
  const next = {
    brand: brandMatch?.value || "",
    model,
    fuel: normalizeFuel(data?.fuel, title),
    plugin: normalizePlugin(data?.fuel, title),
    body: normalizeBody(data?.bodyType),
    mileageFrom: mileageBucket(data?.mileageKm, "from"),
    mileageTo: mileageBucket(data?.mileageKm, "to"),
    yearFrom: year,
    yearTo: year,
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

  els.title.textContent = title;
  els.price.textContent = formatAmount(data.carBruttoEur, "EUR");
  els.source.innerHTML = [
    detailRow(c.location, text(location.address || location.city)),
    detailRow(c.seller, text(location.sellerName)),
  ].join("");

  els.money.innerHTML = [
    moneyRow(c.price, formatAmount(data.carBruttoEur, "EUR"), true),
    moneyRow(c.purchaseType, purchaseTypeLabel(data)),
    moneyRow(c.engine, text(data.engineTypeLabel)),
    moneyRow(c.delivery, formatAmount(data.transportNettoPln ?? estimate.transport, "PLN")),
    moneyRow(c.inspection, formatAmount(data.inspectionNettoPln ?? estimate.inspection, "PLN")),
    moneyRow(c.tariff, text(estimate.rule)),
    moneyRow(c.warning, state.data ? "VAT 23%" : c.emptyValue),
  ].join("");

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
