const DEFAULT_MOBILEDE_API_URL = "https://listprice-program-recognition-conventional.trycloudflare.com/mobilede/import";

const copy = {
  pl: {
    eyebrow: "LINK MOBILE.DE",
    title: "Rozpoznaj ogłoszenie",
    lead: "Wklej link, sprawdź dane auta i wybierz scenariusz zakupu. Kalkulator dostanie cenę, transport, oględziny i akcyzę.",
    inputLabel: "Link ogłoszenia",
    loadButton: "Rozpoznaj",
    loadingButton: "Pobieram",
    helper: "Backend mobile.de musi być dostępny pod adresem skonfigurowanym dla strony.",
    loading: "Pobieram dane z mobile.de. To może chwilę potrwać.",
    ready: "Dane gotowe. Wybierz scenariusz zakupu na dole strony.",
    error: "Nie udało się rozpoznać ogłoszenia. Sprawdź link albo backend.",
    listingEyebrow: "DANE Z OGŁOSZENIA",
    calcEyebrow: "KWOTY DO KALKULATORA",
    actionsTitle: "Wybierz ścieżkę zakupu",
    actionsLead: "Każda ścieżka otwiera właściwy kalkulator z danymi z ogłoszenia.",
    footer: "Mobile.de → kalkulatory operacyjne",
    emptyTitle: "—",
    emptyValue: "—",
    price: "Cena z ogłoszenia",
    fuel: "Paliwo",
    engine: "Akcyza",
    body: "Nadwozie",
    mileage: "Przebieg",
    registration: "Pierwsza rejestracja",
    location: "Lokalizacja",
    seller: "Sprzedawca",
    importMode: "Tryb importu",
    delivery: "Transport netto",
    inspection: "Oględziny netto",
    tariff: "Reguła taryfy",
    warning: "Dla VAT 23% sprawdź w ogłoszeniu, czy cena jest netto czy brutto.",
    scenarios: [
      { key: "direct", number: "01", tab: 0, title: "Osoba prywatna", note: "Zakup bezpośredni" },
      { key: "ag", number: "02", tab: 4, title: "Przez AUTOGOOD", note: "Dealerzy VAT Marża" },
      { key: "company", number: "03", tab: 3, title: "Na firmę", note: "Dealerzy VAT 23%" },
    ],
  },
  ru: {
    eyebrow: "ССЫЛКА MOBILE.DE",
    title: "Распознать объявление",
    lead: "Вставь ссылку, проверь данные авто и выбери сценарий покупки. Калькулятор получит цену, доставку, осмотр и акциз.",
    inputLabel: "Ссылка объявления",
    loadButton: "Распознать",
    loadingButton: "Загружаю",
    helper: "Backend mobile.de должен быть доступен по адресу, заданному для страницы.",
    loading: "Загружаю данные с mobile.de. Это может занять время.",
    ready: "Данные готовы. Выбери сценарий покупки внизу страницы.",
    error: "Не удалось распознать объявление. Проверь ссылку или backend.",
    listingEyebrow: "ДАННЫЕ ИЗ ОБЪЯВЛЕНИЯ",
    calcEyebrow: "СУММЫ ДЛЯ КАЛЬКУЛЯТОРА",
    actionsTitle: "Выбери путь покупки",
    actionsLead: "Каждый путь откроет нужный калькулятор с данными из объявления.",
    footer: "Mobile.de → рабочие калькуляторы",
    emptyTitle: "—",
    emptyValue: "—",
    price: "Цена из объявления",
    fuel: "Топливо",
    engine: "Акциз",
    body: "Кузов",
    mileage: "Пробег",
    registration: "Первая регистрация",
    location: "Локация",
    seller: "Продавец",
    importMode: "Режим импорта",
    delivery: "Доставка netto",
    inspection: "Осмотр netto",
    tariff: "Правило тарифа",
    warning: "Для VAT 23% проверь в объявлении, цена netto или brutto.",
    scenarios: [
      { key: "direct", number: "01", tab: 0, title: "Физ лицо напрямую", note: "Прямая покупка" },
      { key: "ag", number: "02", tab: 4, title: "Через AUTOGOOD", note: "Дилеры VAT Маржа" },
      { key: "company", number: "03", tab: 3, title: "На фирму", note: "Дилеры VAT 23%" },
    ],
  },
};

const state = {
  lang: new URLSearchParams(window.location.search).get("lang") === "ru" ? "ru" : "pl",
  data: null,
  status: "idle",
  error: "",
};

const els = {
  form: document.querySelector("[data-mobile-form]"),
  url: document.querySelector("[data-mobile-url]"),
  submit: document.querySelector("[data-mobile-submit]"),
  status: document.querySelector("[data-mobile-status]"),
  details: document.querySelector("[data-mobile-details]"),
  money: document.querySelector("[data-mobile-money]"),
  title: document.querySelector("[data-mobile-title]"),
  price: document.querySelector("[data-mobile-price]"),
  scenarios: document.querySelector("[data-mobile-scenarios]"),
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
}

function detailRow(label, value) {
  return `<div class="mobileDataRow"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function moneyRow(label, value, primary = false) {
  return `<div class="mobileMoneyRow ${primary ? "isPrimary" : ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
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
          <em>${escapeHtml(scenario.note)}</em>
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
  els.details.innerHTML = [
    detailRow(c.price, formatAmount(data.carBruttoEur, "EUR")),
    detailRow(c.fuel, text(data.fuel)),
    detailRow(c.engine, text(data.engineTypeLabel)),
    detailRow(c.body, text(data.bodyType)),
    detailRow(c.mileage, data.mileageKm ? `${Number(data.mileageKm).toLocaleString("pl-PL")} km` : c.emptyValue),
    detailRow(c.registration, text(data.firstRegistration)),
    detailRow(c.location, text(location.address || location.city)),
    detailRow(c.seller, text(location.sellerName)),
    detailRow(c.importMode, text(data.importMode)),
  ].join("");

  els.money.innerHTML = [
    moneyRow(c.price, formatAmount(data.carBruttoEur, "EUR"), true),
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

renderI18n();
renderData();

if (initialUrl) {
  loadMobileDeData(initialUrl);
}
