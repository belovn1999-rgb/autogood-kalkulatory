const { Component, useEffect, useMemo, useRef, useState } = React;

const VAT = 0.23;
const DEFAULT_RATE = 4.26;
const TO_FEE = 150;
const DOC_TRANSLATION = 250;
const STD_FIX = 1829.27;
const FIN_FIX = 2642.28;
const RATES_URL = "./data/exchange-rates.json";
const WALUTOMAT_API_URL = "https://api.walutomat.pl/api/v2.0.0/market_fx/best_offers";
const MOBILEDE_API_URL = window.AUTOGOOD_MOBILEDE_API_URL || "http://127.0.0.1:8788/mobilede/import";
const EUR_PLN_MARGIN = 0.02;
const RATES_FALLBACK = {
  source: "Walutomat",
  sourceUrl: "https://www.walutomat.pl/kursy-walut/",
  effectiveDate: "",
  rates: {
    EUR_PLN: { label: "EUR - PLN", value: DEFAULT_RATE, unit: "PLN" },
    SEK_EUR: { label: "SEK - EUR", value: 0, unit: "EUR" },
    DKK_EUR: { label: "DKK - EUR", value: 0, unit: "EUR" },
  },
};

const copy = {
  pl: {
    pickLang: "Wybierz język",
    appTitle: "AUTOGOOD Kalkulatory",
    print: "Druk / PDF",
    screenshot: "Kopiuj obraz",
    screenshotReady: "Obraz skopiowany.",
    screenshotOpened: "Obraz otwarty w nowej karcie.",
    screenshotError: "Nie udało się skopiować obrazu.",
    exchange: "Kurs EUR/PLN",
    engine: "Typ silnika",
    commissionType: "Rodzaj prowizji",
    standard: "Standard",
    financing: "Finansowanie",
    inputs: "Dane",
    results: "Kalkulacja",
    total: "Razem",
    totalJoin: "lub",
    rateLine: "Przeliczono po kursie",
    ratesTitle: "Kursy sprzedaży",
    ratesSource: "źródło",
    ratesUpdated: "aktualizacja",
    ratesLoading: "Ładowanie kursów",
    mobileImportTitle: "Link Mobile.de",
    mobileImportPlaceholder: "Wklej link ogłoszenia",
    mobileImportButton: "Załaduj dane",
    mobileImportLoading: "Pobieram dane...",
    mobileImportReady: "Dane podstawione: cena brutto, silnik i akcyza.",
    mobileImportError: "Nie udało się pobrać danych. Sprawdź link albo backend.",
    mobileImportFound: "Znaleziono",
    errorTitle: "Coś poszło nie tak.",
    errorBody: "Odśwież stronę i spróbuj ponownie.",
    selectPlaceholder: "Wybierz typ silnika",
    lines: {
      car: "Cena pojazdu",
      carNetto: "Cena pojazdu netto",
      carBrutto: "Cena pojazdu brutto",
      inspection: "Oględziny specjalisty",
      transport: "Transport na lawecie",
      auctionFee: "Opłata aukcyjna",
      excise: "Akcyza",
      commission: "Prowizja AUTOGOOD",
      vat: "VAT 23%",
      to: "Przegląd techniczny",
      doc: "Tłumaczenie dokumentów",
      directCarBrutto: "Cena pojazdu brutto",
    },
  },
  ru: {
    pickLang: "Выберите язык",
    appTitle: "AUTOGOOD Калькуляторы",
    print: "Печать / PDF",
    screenshot: "Скопировать скрин",
    screenshotReady: "Скрин скопирован.",
    screenshotOpened: "Скрин открыт в новой вкладке.",
    screenshotError: "Не удалось скопировать скрин.",
    exchange: "Курс EUR/PLN",
    engine: "Тип двигателя",
    commissionType: "Тип комиссии",
    standard: "Стандарт",
    financing: "Финансирование",
    inputs: "Данные",
    results: "Расчёт",
    total: "Итого",
    totalJoin: "или",
    rateLine: "Расчёт по курсу",
    ratesTitle: "Курсы продажи",
    ratesSource: "источник",
    ratesUpdated: "обновлено",
    ratesLoading: "Загрузка курсов",
    mobileImportTitle: "Ссылка Mobile.de",
    mobileImportPlaceholder: "Вставь ссылку объявления",
    mobileImportButton: "Загрузить данные",
    mobileImportLoading: "Загружаю данные...",
    mobileImportReady: "Данные подставлены: цена brutto, двигатель и акциз.",
    mobileImportError: "Не удалось загрузить данные. Проверь ссылку или backend.",
    mobileImportFound: "Найдено",
    errorTitle: "Что-то пошло не так.",
    errorBody: "Обновите страницу и попробуйте снова.",
    selectPlaceholder: "Выберите тип двигателя",
    lines: {
      car: "Цена автомобиля",
      carNetto: "Цена автомобиля netto",
      carBrutto: "Цена автомобиля brutto",
      inspection: "Инспекция специалиста",
      transport: "Транспорт на автовозе",
      auctionFee: "Аукционный сбор",
      excise: "Акциз",
      commission: "Комиссия AUTOGOOD",
      vat: "VAT 23%",
      to: "Техосмотр",
      doc: "Перевод документов",
      directCarBrutto: "Цена автомобиля brutto",
    },
  },
};

const engineTypes = [
  { label: "EL / PHEV <=2000cm³", rate: 0 },
  { label: "PHEV / HEV >2000cm³", rate: 0.093 },
  { label: "HEV <=2000cm³", rate: 0.0155 },
  { label: "Spalinowy <=2000cm³", rate: 0.031 },
  { label: "Spalinowy >2000cm³", rate: 0.186 },
];

const tabs = [
  {
    id: 0,
    name: { pl: "Zakup bezpośredni", ru: "Прямая покупка" },
    subtitle: {
      pl: "Klient płaci dealerowi bezpośrednio. VAT Marża.",
      ru: "Клиент платит дилеру напрямую. VAT Marża.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu", ru: "Цена автомобиля" }, currency: "EUR" },
      { key: "inspection", label: { pl: "Oględziny specjalisty netto", ru: "Инспекция специалиста netto" }, currency: "PLN" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto" }, currency: "PLN" },
      { key: "discount", label: { pl: "Rabat", ru: "Скидка" }, currency: "PLN" },
    ],
  },
  {
    id: 1,
    name: { pl: "Aukcje VAT 23%", ru: "Аукционы VAT 23%" },
    subtitle: {
      pl: "Aukcja zagraniczna. Wszystkie wartości netto, VAT na końcu.",
      ru: "Зарубежный аукцион. Все значения netto, VAT в конце.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu netto", ru: "Цена авто netto" }, currency: "EUR" },
      { key: "fee", label: { pl: "Opłata aukcyjna netto", ru: "Аукционный сбор netto" }, currency: "EUR" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto" }, currency: "PLN" },
    ],
  },
  {
    id: 2,
    name: { pl: "Aukcje VAT Marża", ru: "Аукционы VAT Маржа" },
    subtitle: {
      pl: "Aukcja zagraniczna. Pojazd brutto, transport netto + VAT.",
      ru: "Зарубежный аукцион. Авто brutto, транспорт netto + VAT.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu", ru: "Цена автомобиля" }, currency: "EUR" },
      { key: "fee", label: { pl: "Opłata aukcyjna", ru: "Аукционный сбор" }, currency: "EUR" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto" }, currency: "PLN" },
    ],
  },
  {
    id: 3,
    name: { pl: "Dealerzy VAT 23%", ru: "Дилеры VAT 23%" },
    subtitle: {
      pl: "Dealer zagraniczny przez AUTOGOOD. Auto netto, VAT na końcu.",
      ru: "Иностранный дилер через AUTOGOOD. Авто netto, VAT в конце.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu netto", ru: "Цена авто netto" }, currency: "EUR" },
      { key: "inspection", label: { pl: "Oględziny specjalisty netto", ru: "Инспекция специалиста netto" }, currency: "PLN" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto" }, currency: "PLN" },
      { key: "discount", label: { pl: "Rabat", ru: "Скидка" }, currency: "PLN" },
    ],
  },
  {
    id: 4,
    name: { pl: "Dealerzy VAT Marża", ru: "Дилеры VAT Маржа" },
    subtitle: {
      pl: "Dealer zagraniczny przez AUTOGOOD. Auto brutto, bez osobnej linii VAT.",
      ru: "Иностранный дилер через AUTOGOOD. Авто brutto, без отдельной строки VAT.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu", ru: "Цена автомобиля" }, currency: "EUR" },
      { key: "inspection", label: { pl: "Oględziny specjalisty netto", ru: "Инспекция специалиста netto" }, currency: "PLN" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto" }, currency: "PLN" },
      { key: "discount", label: { pl: "Rabat", ru: "Скидка" }, currency: "PLN" },
    ],
  },
];

const financingNotes = {
  pl: {
    ownFundsDeposit: "Kupujemy pojazd z własnych środków oraz wpłacamy kaucję w wys. zagranicznego VAT-u",
  },
  ru: {
    ownFundsDeposit: "Покупаем автомобиль за собственные средства и вносим депозит в размере иностранного VAT",
  },
};

function getProcessSteps(tab, lang, financed) {
  const steps = {
    0: {
      pl: ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Bezpośrednia płatność za pojazd do sprzedawcy"],
      ru: ["Возвращаем 70% полученной скидки от продавца", "Прямая оплата за автомобиль продавцу"],
    },
    1: {
      pl: ["Opłata w walucie PLN lub EUR", "Sprzedaż na Fakturę VAT 23%"],
      ru: ["Оплата в PLN или EUR", "Продажа по Faktura VAT 23%"],
    },
    2: {
      pl: ["Opłata w walucie PLN lub EUR", "Sprzedaż na Fakturę VAT Marża"],
      ru: ["Оплата в PLN или EUR", "Продажа по Faktura VAT Marża"],
    },
    3: {
      pl: [
        "Oddajemy 70% uzyskanego rabatu od sprzedawcy",
        "Opłata w walucie PLN lub EUR",
        financed ? financingNotes.pl.ownFundsDeposit : "Wpłacamy kaucję w wys. zagranicznego VAT-u",
        "Sprzedaż na Fakturę VAT 23%",
      ],
      ru: [
        "Возвращаем 70% полученной скидки от продавца",
        "Оплата в PLN или EUR",
        financed ? financingNotes.ru.ownFundsDeposit : "Вносим депозит в размере иностранного VAT",
        "Продажа по Faktura VAT 23%",
      ],
    },
    4: {
      pl: ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Opłata w walucie PLN lub EUR", "Sprzedaż na Fakturę VAT Marża"],
      ru: ["Возвращаем 70% полученной скидки от продавца", "Оплата в PLN или EUR", "Продажа по Faktura VAT Marża"],
    },
  };
  return steps[tab.id]?.[lang] || [];
}

function n(value) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundedCurrencyValue(value, currency = "PLN") {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (currency === "PLN") return Math.round(safeValue / 50) * 50;
  if (currency === "EUR") return Math.round(safeValue / 10) * 10;
  return Math.round(safeValue);
}

function money(value, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedCurrencyValue(value, currency));
}

function moneyExact(value, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function percentLabel(value) {
  if (value === 0) return "0%";
  return `${(value * 100).toFixed(value === 0.0155 ? 2 : 1)}%`;
}

function rateLabel(value) {
  return (Number.isFinite(value) ? value : DEFAULT_RATE).toFixed(3);
}

function inputCurrencyLabel(value, currency = "EUR") {
  return `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)} ${currency}`;
}

function conversionPrefix(value, currency = "EUR") {
  return `${inputCurrencyLabel(value, currency)} =`;
}

function formatPlainAmount(value, currency = "EUR") {
  return `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)} ${currency}`;
}

function NumInput({ label, value, onChange, suffix, className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <div className="inputWrap">
        <input
          inputMode="decimal"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0.00"
        />
        <b>{suffix}</b>
      </div>
    </label>
  );
}

function RateInput({ label, value, onChange }) {
  const currentRate = n(value) || DEFAULT_RATE;
  const stepRate = (delta) => {
    const nextRate = Math.max(0, currentRate + delta);
    onChange(rateLabel(nextRate));
  };

  return (
    <label className="field rateField">
      <span>{label}</span>
      <div className="rateControl">
        <input
          inputMode="decimal"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="4.265"
        />
        <div className="rateButtons">
          <button type="button" aria-label="Zwiększ kurs" onClick={() => stepRate(0.001)}>+</button>
          <button type="button" aria-label="Zmniejsz kurs" onClick={() => stepRate(-0.001)}>−</button>
        </div>
        <b>PLN</b>
      </div>
    </label>
  );
}

function formatRate(value, digits = 4) {
  if (!Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: digits,
  }).format(Number(value));
}

function bestOfferRate(offers, pair) {
  const offer = offers?.asks?.[0] || offers?.bids?.[0];
  const value = Number(offer?.price);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid Walutomat rate for ${pair}`);
  return value;
}

async function loadWalutomatOffer(pair) {
  const url = new URL(WALUTOMAT_API_URL);
  url.searchParams.set("currencyPair", pair);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Walutomat API returned ${response.status}`);
  const data = await response.json();
  if (!data?.success || data?.result?.currencyPair !== pair) throw new Error(`Invalid Walutomat response for ${pair}`);
  return data.result;
}

async function loadLiveExchangeRates() {
  const [eurPlnOffers, eurSekOffers, eurDkkOffers] = await Promise.all([
    loadWalutomatOffer("EURPLN"),
    loadWalutomatOffer("EURSEK"),
    loadWalutomatOffer("EURDKK"),
  ]);

  const eurPln = bestOfferRate(eurPlnOffers, "EURPLN");
  const eurSek = bestOfferRate(eurSekOffers, "EURSEK");
  const eurDkk = bestOfferRate(eurDkkOffers, "EURDKK");
  const timestamps = [eurPlnOffers.ts, eurSekOffers.ts, eurDkkOffers.ts].filter(Boolean).sort();
  const updatedAt = timestamps[timestamps.length - 1] || new Date().toISOString();

  return {
    source: "Walutomat API - kurs sprzedaży",
    sourceUrl: "https://www.walutomat.pl/kursy-walut/",
    providerApiUrl: WALUTOMAT_API_URL,
    updatedAt,
    effectiveDate: updatedAt.slice(0, 10),
    margin: {
      EUR_PLN: EUR_PLN_MARGIN,
      note: "Do kursu sprzedaży EUR/PLN z Walutomat doliczono 0.02 PLN.",
    },
    rates: {
      EUR_PLN: { label: "EUR - PLN", value: Math.round((eurPln + EUR_PLN_MARGIN) * 10000) / 10000, unit: "PLN" },
      SEK_EUR: { label: "SEK - EUR", value: Math.round((1 / eurSek) * 10000) / 10000, unit: "EUR" },
      DKK_EUR: { label: "DKK - EUR", value: Math.round((1 / eurDkk) * 10000) / 10000, unit: "EUR" },
    },
  };
}

async function loadExchangeRates() {
  try {
    return await loadLiveExchangeRates();
  } catch (liveError) {
    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch(`${RATES_URL}?date=${today}`, { cache: "no-store" });
    if (!response.ok) throw liveError;
    return response.json();
  }
}

function ExchangeRatesPanel({ data, status, lang }) {
  const c = copy[lang];
  const safeData = data || RATES_FALLBACK;
  const rows = ["EUR_PLN", "SEK_EUR", "DKK_EUR"]
    .map((key) => safeData.rates?.[key])
    .filter(Boolean);

  return (
    <section className="ratesPanel" aria-label={c.ratesTitle}>
      <div className="ratesPanelHead">
        <strong>{c.ratesTitle}</strong>
        {status === "loading" && <span>{c.ratesLoading}</span>}
      </div>
      <div className="ratesTable">
        {rows.map((item) => (
          <React.Fragment key={item.label}>
            <span>{item.label}</span>
            <b>{formatRate(item.value)} {item.unit}</b>
          </React.Fragment>
        ))}
      </div>
      <small>
        {safeData.effectiveDate ? `${c.ratesUpdated}: ${safeData.effectiveDate}. ` : ""}
        {c.ratesSource}: {safeData.source || "Walutomat"}
      </small>
    </section>
  );
}

function MobileDeImport({ c, url, status, summary, onUrlChange, onImport }) {
  return (
    <section className="mobileImport">
      <label className="field">
        <span>{c.mobileImportTitle}</span>
        <div className="mobileImportControl">
          <input
            type="url"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder={c.mobileImportPlaceholder}
          />
          <button type="button" onClick={onImport} disabled={status === "loading" || !url.trim()}>
            {status === "loading" ? "..." : c.mobileImportButton}
          </button>
        </div>
      </label>
      {status && (
        <p className={`mobileImportStatus ${status}`}>
          {status === "loading" && c.mobileImportLoading}
          {status === "ready" && c.mobileImportReady}
          {status === "error" && c.mobileImportError}
        </p>
      )}
      {summary && status !== "error" && (
        <p className="mobileImportSummary">
          <b>{c.mobileImportFound}:</b> {summary}
        </p>
      )}
      {summary && status === "error" && (
        <p className="mobileImportSummary errorDetail">{summary}</p>
      )}
    </section>
  );
}

function MoneyIcon() {
  return (
    <svg className="moneyIcon" viewBox="0 0 48 48" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
        <ellipse cx="15" cy="9" rx="9" ry="4" />
        <path d="M6 9v18c0 2.2 4 4 9 4s9-1.8 9-4V9" />
        <path d="M6 15c0 2.2 4 4 9 4s9-1.8 9-4" />
        <path d="M6 21c0 2.2 4 4 9 4s9-1.8 9-4" />
        <ellipse cx="33" cy="16" rx="8" ry="3.5" />
        <path d="M25 16v10c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5V16" />
        <path d="M25 21c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5" />
        <path d="M14 35l18-9 10 9-18 9-10-9z" />
        <path d="M19 35l6-3 11 5" />
        <path d="M22 40l18-9" />
      </g>
    </svg>
  );
}

function DeliveryCar() {
  return (
    <svg className="deliveryCarIcon" viewBox="0 0 86 30" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 21h53c3.8 0 6.8-2.8 6.8-6.2 0-2.7-2-5.2-4.9-6l-10.5-3.1a15 15 0 0 0-4.3-.6H35.8c-3.7 0-7.2 1.4-9.7 3.9l-6.8 6.7H12c-2.6 0-4.8 1.9-4.8 4.2" />
        <path d="M30 9h16l5.2 7H23.5L30 9z" />
        <path d="M49 9h5.8c1 0 2 .2 2.9.5l7.7 2.3" />
        <circle cx="24" cy="22" r="4.2" />
        <circle cx="62" cy="22" r="4.2" />
        <path d="M2 25h8M75 25h9" />
      </g>
    </svg>
  );
}

function ProcessFlow({ steps }) {
  return (
    <footer className="processFlow" aria-label="Informacje">
      {steps.map((step, index) => (
        <React.Fragment key={`${step}-${index}`}>
          {index > 0 && <span className="processArrow" aria-hidden="true">›</span>}
          <span className="processStep">{step}</span>
        </React.Fragment>
      ))}
    </footer>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="errorBox">
          <h1>{copy.pl.errorTitle}</h1>
          <p>{copy.pl.errorBody}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function tagLabel(tag) {
  if (!tag) return null;
  const className = tag.replace("+", "plus").replace(/\s|%/g, "");
  return <span className={`tag tag-${className}`}>{tag}</span>;
}

function row(label, value, tag, sub, highlight = false, exact = false, valuePrefix = "") {
  return { label, value, tag, sub, highlight, exact, valuePrefix };
}

function calculate(tabId, values, rate, exciseRate, financed, lang) {
  const t = copy[lang].lines;
  const car = n(values.car);
  const fee = n(values.fee);
  const inspection = n(values.inspection);
  const transport = n(values.transport);
  const discount = n(values.discount);
  const useRate = rate > 0 ? rate : DEFAULT_RATE;
  const finFix = financed ? FIN_FIX : STD_FIX;
  const finPct = financed ? 0.05 : 0.02;

  if (tabId === 0) {
    const carPln = car * useRate;
    const inspectionBrutto = inspection * 1.23;
    const transportBrutto = transport * 1.23;
    const excise = exciseRate * carPln;
    const discountCommission = 0.3 * discount;
    const commissionNetto = STD_FIX + 0.01 * carPln + discountCommission;
    const commissionBrutto = commissionNetto * 1.23;
    const discountText = discount > 0 ? `; 30% × ${money(discount)}` : "";
    const total = carPln + inspectionBrutto + transportBrutto + excise + commissionBrutto + TO_FEE + DOC_TRANSLATION;
    return {
      total,
      rows: [
        row(t.directCarBrutto, carPln, "", "", false, false, conversionPrefix(car)),
        row(t.inspection, inspection, "+VAT 23%", `${money(inspectionBrutto)} brutto`),
        row(t.transport, transport, "+VAT 23%", `${money(transportBrutto)} brutto`),
        row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`),
        row(t.commission, commissionNetto, "+VAT 23%", `${money(commissionBrutto)} brutto${discountText}`),
        row(t.to, TO_FEE, "", "", false, true),
        row(t.doc, DOC_TRANSLATION, "", "", false, true),
      ],
    };
  }

  if (tabId === 1) {
    const carPln = car * useRate;
    const feePln = fee * useRate;
    const transPln = transport;
    const base = carPln + feePln;
    const excise = exciseRate * base;
    const commissionNetto = finFix + finPct * base;
    const vatBase = base + transPln + excise + commissionNetto;
    const vat = vatBase * VAT;
    const total = vatBase + vat + TO_FEE;
    return {
      total,
      rows: [
        row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)),
        row(t.auctionFee, feePln, "", "", false, false, conversionPrefix(fee)),
        row(t.transport, transPln, "+VAT 23%", ""),
        row(t.excise, excise, "+VAT 23%", `${(exciseRate * 100).toFixed(2)}% × ${money(base)}`),
        row(t.commission, commissionNetto, "+VAT 23%", `${money(finFix)} + ${(finPct * 100).toFixed(0)}% × ${money(base)}`),
        row(t.to, TO_FEE, "", "", false, true),
        row(t.vat, vat, "", `23% × ${money(vatBase)}`),
      ],
    };
  }

  if (tabId === 2) {
    const carPln = car * useRate;
    const feePln = fee * useRate;
    const transNetto = transport;
    const transBrutto = transNetto * 1.23;
    const base = carPln + feePln;
    const excise = exciseRate * base;
    const exciseBrutto = excise * 1.23;
    const commissionNetto = finFix + finPct * base;
    const commissionBrutto = commissionNetto * 1.23;
    const total = carPln + feePln + transBrutto + exciseBrutto + commissionBrutto + TO_FEE;
    return {
      total,
      rows: [
        row(t.car, carPln, "", "", false, false, conversionPrefix(car)),
        row(t.auctionFee, feePln, "", "", false, false, conversionPrefix(fee)),
        row(t.transport, transNetto, "+VAT 23%", `${money(transBrutto)} brutto`),
        row(t.excise, excise, "+VAT 23%", `${money(exciseBrutto)} brutto`),
        row(t.commission, commissionNetto, "+VAT 23%", `${money(commissionBrutto)} brutto`),
        row(t.to, TO_FEE, "", "", false, true),
      ],
    };
  }

  if (tabId === 3) {
    const carPln = car * useRate;
    const excise = exciseRate * carPln;
    const bruttoBase = carPln * 1.19;
    const discountCommission = 0.3 * discount;
    const commissionNetto = finFix + finPct * bruttoBase + discountCommission;
    const discountText = discount > 0 ? ` + 30% × ${money(discount)}` : "";
    const vatBase = carPln + inspection + transport + excise + commissionNetto;
    const vat = vatBase * VAT;
    const total = vatBase + vat + TO_FEE;
    return {
      total,
      rows: [
        row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)),
        row(t.inspection, inspection, "+VAT 23%", ""),
        row(t.transport, transport, "+VAT 23%", ""),
        row(t.excise, excise, "+VAT 23%", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`),
        row(t.commission, commissionNetto, "+VAT 23%", `${money(finFix)} + ${(finPct * 100).toFixed(0)}% × ${money(bruttoBase)}${discountText}`),
        row(t.to, TO_FEE, "", "", false, true),
        row(t.vat, vat, "", `23% × ${money(vatBase)}`),
      ],
    };
  }

  const carPln = car * useRate;
  const inspectionBrutto = inspection * 1.23;
  const transportBrutto = transport * 1.23;
  const excise = exciseRate * carPln;
  const exciseBrutto = excise * 1.23;
  const discountCommission = 0.3 * discount;
  const commissionNetto = finFix + finPct * carPln + discountCommission;
  const commissionBrutto = commissionNetto * 1.23;
  const discountText = discount > 0 ? `; 30% × ${money(discount)}` : "";
  const total = carPln + inspectionBrutto + transportBrutto + exciseBrutto + commissionBrutto + TO_FEE;
  return {
    total,
    rows: [
      row(t.car, carPln, "", "", false, false, conversionPrefix(car)),
      row(t.inspection, inspection, "+VAT 23%", `${money(inspectionBrutto)} brutto`),
      row(t.transport, transport, "+VAT 23%", `${money(transportBrutto)} brutto`),
      row(t.excise, excise, "+VAT 23%", `${money(exciseBrutto)} brutto`),
      row(t.commission, commissionNetto, "+VAT 23%", `${money(commissionBrutto)} brutto${discountText}`),
      row(t.to, TO_FEE, "", "", false, true),
    ],
  };
}

function printCalculation({ lang, tab, rows, total, rate, financed }) {
  const c = copy[lang];
  const roundedTotal = roundedCurrencyValue(total, "PLN");
  const logoUrl = new URL("./assets/autogood-logo.png", window.location.href).href;
  const homeUrl = new URL("./", window.location.href).href;
  const rowsHtml = rows
    .map(
      (item, index) => `
        <tr class="${item.highlight ? "vat" : ""} ${index === 0 ? "mainRow" : ""}">
          <td>
            <strong>${item.label}</strong>
            ${item.sub ? `<small>${item.sub}</small>` : ""}
          </td>
          <td>
            <div class="amount">
              <em class="${item.valuePrefix ? "" : "isEmpty"}">${item.valuePrefix || "0 EUR ="}</em>
              <b>${item.exact ? moneyExact(item.value) : money(item.value)}</b>
              ${item.tag ? `<span>${item.tag}</span>` : ""}
            </div>
          </td>
        </tr>`
    )
    .join("");
  const processSteps = getProcessSteps(tab, lang, financed);
  const processHtml = processSteps
    .map((step, index) => `${index > 0 ? '<span class="processArrow">›</span>' : ""}<span class="processStep">${step}</span>`)
    .join("");
  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title></title>
  <style>
    @page{size:auto;margin:0}
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;margin:0;background:#eef3f8;color:#102033;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{position:relative;min-height:100vh;padding:28px 34px 32px;background:#fff;overflow:hidden}
    .page:before{content:"";position:absolute;inset:0 0 auto;height:10px;background:#005B82}
    .page:after{content:"";position:absolute;right:-78px;top:54px;width:230px;height:230px;border:22px solid rgba(0,91,130,.10);border-radius:50%}
    .corner{position:absolute;right:0;bottom:0;width:190px;height:190px;background:linear-gradient(135deg,transparent 50%,rgba(0,91,130,.08) 50%)}
    header{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:20px;padding-bottom:18px;border-bottom:2px solid #dbe4ee}
    .brand{display:flex;align-items:center;gap:18px;text-decoration:none;color:#102033}
    .printLogo{display:block;width:250px;height:auto}
    .titleBox{text-align:right;padding-top:4px}
    h1{margin:0;color:#005B82;font-size:30px;line-height:1;font-weight:800}
    .accentGrid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
    .accent{min-height:8px;border-radius:999px;background:#005B82}
    .accent:nth-child(2){background:#dbe4ee}
    .accent:nth-child(3){background:#102033}
    table{position:relative;z-index:1;width:100%;border-collapse:separate;border-spacing:0 7px;margin-top:4px}
    td{background:#fff;border-top:1px solid #dbe4ee;border-bottom:1px solid #dbe4ee;padding:11px 14px;vertical-align:middle}
    td:first-child{border-left:1px solid #dbe4ee;border-radius:8px 0 0 8px}
    td:last-child{width:320px;border-right:1px solid #dbe4ee;border-radius:0 8px 8px 0;text-align:right;font-weight:800;white-space:nowrap}
    strong{font-size:15px}
    small{display:block;color:#64748b;margin-top:3px;font-size:11px}
    span{border-radius:999px;padding:3px 7px;font-size:11px;color:#c2410c;background:#fff7ed;font-weight:800}
    .amount{display:grid;grid-template-columns:92px max-content auto;justify-content:end;align-items:center;column-gap:4px}
    .amount em{font-style:normal;color:#64748b;font-weight:800;text-align:right}
    .amount em.isEmpty{visibility:hidden}
    .amount b{font-size:17px}
    .mainRow td{padding-top:14px;padding-bottom:14px;border-color:#cbd8e6;background:#f8fbfd}
    .mainRow strong{font-size:18px;color:#005B82}
    .mainRow .amount b{font-size:21px;color:#005B82}
    .vat td{background:#fff}
    .total{position:relative;z-index:1;display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px 22px;margin-top:18px;padding:22px 24px 18px;border:3px solid #005B82;border-radius:14px;background:#005B82;color:#fff}
    .totalLabel{font-size:22px;font-weight:900;text-align:left}
    .total b{display:block;margin:0;color:#fff;font-size:48px;line-height:1;font-weight:900;letter-spacing:0}
    .totalAmount{color:#fff;font-size:22px;font-weight:900;text-align:right}
    .totalAmount div{margin-top:4px}
    .totalRate{grid-column:1/-1;text-align:right;font-style:italic;color:rgba(255,255,255,.82);font-size:13px;padding-right:2px}
    .deliveryRoad{position:relative;z-index:1;width:100%;height:30px;margin:8px 0 2px;color:#005B82}
    .deliveryRoad:before{content:"";position:absolute;left:0;right:0;top:17px;border-top:1px dashed #94a3b8}
    .deliveryRoad svg{position:absolute;right:56px;top:0;width:86px;height:30px;color:#005B82;opacity:.72;background:#fff;padding:0 5px;transform:scaleX(-1)}
    .processFlow{position:relative;z-index:1;display:flex;align-items:center;flex-wrap:wrap;gap:7px;border:1px solid #dbe4ee;border-radius:9px;margin-top:14px;padding:10px 12px;background:#f8fbfd;color:#475569;font-size:13.5px;font-style:italic}
    .processStep{display:inline-flex;align-items:center}
    .processArrow{color:#005B82;opacity:.48;font-size:18px;font-style:normal;font-weight:900}
    .footerMark{position:absolute;left:34px;bottom:20px;color:rgba(0,91,130,.12);font-size:78px;font-weight:900;letter-spacing:3px;line-height:1}
  </style>
</head>
<body>
  <main class="page">
    <div class="corner"></div>
    <header>
      <a class="brand" href="${homeUrl}" target="_blank" rel="noopener">
        <img class="printLogo" src="${logoUrl}" alt="AUTOGOOD" />
      </a>
      <div class="titleBox">
        <h1>${c.results} — ${tab.name[lang]}</h1>
      </div>
    </header>
    <div class="accentGrid"><div class="accent"></div><div class="accent"></div><div class="accent"></div></div>
    <table>${rowsHtml}</table>
    <div class="total"><div class="totalLabel">${c.total}</div><div class="totalAmount"><b>${money(total)}</b><div>${money(roundedTotal / rate, "EUR")}</div></div><div class="totalRate">${c.rateLine}: 1 EUR = ${rateLabel(rate)} PLN</div></div>
    <div class="deliveryRoad">
      <svg viewBox="0 0 86 30" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h53c3.8 0 6.8-2.8 6.8-6.2 0-2.7-2-5.2-4.9-6l-10.5-3.1a15 15 0 0 0-4.3-.6H35.8c-3.7 0-7.2 1.4-9.7 3.9l-6.8 6.7H12c-2.6 0-4.8 1.9-4.8 4.2"/><path d="M30 9h16l5.2 7H23.5L30 9z"/><path d="M49 9h5.8c1 0 2 .2 2.9.5l7.7 2.3"/><circle cx="24" cy="22" r="4.2"/><circle cx="62" cy="22" r="4.2"/><path d="M2 25h8M75 25h9"/></g></svg>
    </div>
    <div class="processFlow">${processHtml}</div>
    <div class="footerMark">AG</div>
  </main>
  <script>window.onload = function(){ window.print(); };</script>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 1);
  });
}

function App() {
  const [lang, setLang] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [marketRates, setMarketRates] = useState(RATES_FALLBACK);
  const [ratesStatus, setRatesStatus] = useState("loading");
  const [engineIndex, setEngineIndex] = useState(3);
  const [financed, setFinanced] = useState(false);
  const [values, setValues] = useState({});
  const [mobileDeUrl, setMobileDeUrl] = useState("");
  const [mobileDeStatus, setMobileDeStatus] = useState("");
  const [mobileDeSummary, setMobileDeSummary] = useState("");
  const [screenshotStatus, setScreenshotStatus] = useState("");
  const resultsRef = useRef(null);
  const rateTouchedRef = useRef(false);

  const safeLang = lang || "pl";
  const c = copy[safeLang];
  const tab = tabs[activeTab];
  const exciseRate = engineTypes[engineIndex]?.rate ?? 0;
  const calc = useMemo(
    () => calculate(activeTab, values, n(rate), exciseRate, financed, safeLang),
    [activeTab, values, rate, exciseRate, financed, safeLang]
  );
  const roundedTotal = roundedCurrencyValue(calc.total, "PLN");
  const processSteps = getProcessSteps(tab, safeLang, financed);

  useEffect(() => {
    let isMounted = true;
    loadExchangeRates()
      .then((data) => {
        if (!isMounted) return;
        setMarketRates(data);
        setRatesStatus("ready");
        const nextRate = Number(data?.rates?.EUR_PLN?.value);
        if (Number.isFinite(nextRate) && nextRate > 0 && !rateTouchedRef.current) {
          setRate(rateLabel(nextRate));
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setMarketRates(RATES_FALLBACK);
        setRatesStatus("fallback");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const switchTab = (id) => {
    setActiveTab(id);
    setValues({});
    setFinanced(false);
  };

  const setField = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const setManualRate = (value) => {
    rateTouchedRef.current = true;
    setRate(value);
  };

  const loadMobileDeData = async () => {
    const sourceUrl = mobileDeUrl.trim();
    if (!sourceUrl) return;

    setMobileDeStatus("loading");
    setMobileDeSummary("");

    try {
      const response = await fetch(`${MOBILEDE_API_URL}?url=${encodeURIComponent(sourceUrl)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || "Mobile.de import failed");
      }
      const data = await response.json();
      const carBruttoEur = Number(data?.carBruttoEur);
      const nextEngineIndex = Number(data?.engineTypeIndex);

      if (Number.isFinite(carBruttoEur) && carBruttoEur > 0) {
        setField("car", String(Math.round(carBruttoEur)));
      }

      if (Number.isInteger(nextEngineIndex) && engineTypes[nextEngineIndex]) {
        setEngineIndex(nextEngineIndex);
      }

      const summaryParts = [];
      if (Number.isFinite(carBruttoEur) && carBruttoEur > 0) summaryParts.push(formatPlainAmount(carBruttoEur, "EUR"));
      if (data?.fuel) summaryParts.push(data.fuel);
      if (data?.displacementCcm) summaryParts.push(`${data.displacementCcm} cm³`);
      if (data?.engineTypeLabel) summaryParts.push(data.engineTypeLabel);

      setMobileDeSummary(summaryParts.join(" • "));
      setMobileDeStatus("ready");
    } catch (error) {
      setMobileDeSummary(error.message || "");
      setMobileDeStatus("error");
    }
  };

  const copyScreenshot = async () => {
    setScreenshotStatus("");

    try {
      if (!window.html2canvas || !resultsRef.current) throw new Error("Screenshot tool not available");
      const canvas = await window.html2canvas(resultsRef.current, {
        backgroundColor: "#ffffff",
        scale: Math.min(2, window.devicePixelRatio || 1),
        useCORS: true,
      });
      const blob = await canvasToBlob(canvas);
      if (!blob) throw new Error("Image was not created");

      if (navigator.clipboard?.write && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setScreenshotStatus("ready");
        return;
      }

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setScreenshotStatus("opened");
    } catch (error) {
      setScreenshotStatus("error");
    }
  };

  if (!lang) {
    return (
      <main className="startup">
        <section className="languageCard">
          <a className="logoLink logoLinkStartup" href="./" aria-label="AUTOGOOD home">
            <img className="logoMark logoMarkStartup" src="./assets/autogood-logo.png" alt="AUTOGOOD" />
          </a>
          <h1>{copy.pl.pickLang} / {copy.ru.pickLang}</h1>
          <div className="startupActions">
            <button onClick={() => setLang("pl")}>PL</button>
            <button onClick={() => setLang("ru")}>RU</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="appShell">
      <header className="topbar">
        <a className="logoLink" href="./" aria-label="AUTOGOOD home">
          <img className="logoMark" src="./assets/autogood-logo.png" alt="AUTOGOOD" />
        </a>
        <div className="headerActions">
          <ExchangeRatesPanel data={marketRates} status={ratesStatus} lang={safeLang} />
          <RateInput label={c.exchange} value={rate} onChange={setManualRate} />
          <div className="segmented" aria-label="Language">
            <button className={lang === "pl" ? "active" : ""} onClick={() => setLang("pl")}>PL</button>
            <button className={lang === "ru" ? "active" : ""} onClick={() => setLang("ru")}>RU</button>
          </div>
          <button className="printBtn" onClick={() => printCalculation({ lang, tab, rows: calc.rows, total: calc.total, rate: n(rate) || DEFAULT_RATE, financed })}>
            {c.print}
          </button>
          <button className="printBtn screenshotBtn" onClick={copyScreenshot}>
            {c.screenshot}
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Calculators">
        {tabs.map((item) => (
          <button key={item.id} className={item.id === activeTab ? "active" : ""} onClick={() => switchTab(item.id)}>
            <span>{item.id}</span>
            {item.name[lang]}
          </button>
        ))}
      </nav>

      <section className="grid">
        <aside className="card sidebar">
          <h2>{c.inputs}</h2>

          {activeTab === 0 && (
            <MobileDeImport
              c={c}
              url={mobileDeUrl}
              status={mobileDeStatus}
              summary={mobileDeSummary}
              onUrlChange={setMobileDeUrl}
              onImport={loadMobileDeData}
            />
          )}

          <label className="field">
            <span>{c.engine}</span>
            <select value={engineIndex} onChange={(event) => setEngineIndex(Number(event.target.value))}>
              {engineTypes.map((engine, index) => (
                <option key={engine.label} value={index}>
                  {engine.label} - {percentLabel(engine.rate)}
                </option>
              ))}
            </select>
          </label>

          {activeTab > 0 && (
            <div className="toggleBlock">
              <span>{c.commissionType}</span>
              <div className="segmented full">
                <button className={!financed ? "active" : ""} onClick={() => setFinanced(false)}>{c.standard}</button>
                <button className={financed ? "active" : ""} onClick={() => setFinanced(true)}>{c.financing}</button>
              </div>
            </div>
          )}

          <div className="divider" />

          {tab.fields.map((field) => (
            <NumInput
              key={field.key}
              label={field.label[lang]}
              value={values[field.key] || ""}
              onChange={(value) => setField(field.key, value)}
              suffix={field.currency}
            />
          ))}
        </aside>

        <section className="card results" ref={resultsRef}>
          <div className="resultsTitle">
            <h2><MoneyIcon />{c.results} — {tab.name[lang]}</h2>
          </div>

          <div className="rows">
            {calc.rows.map((item, index) => (
              <div key={`${item.label}-${item.value}-${item.tag}`} className={`resultRow ${item.highlight ? "vatRow" : ""} ${index === 0 ? "isPrimary" : ""}`}>
                <div>
                  <span className="rowLabel">{item.label}</span>
                  {item.sub && <small>{item.sub}</small>}
                </div>
                <div className="rowValue">
                  <span className={`valuePrefix ${item.valuePrefix ? "" : "isEmpty"}`}>{item.valuePrefix}</span>
                  <strong>{item.exact ? moneyExact(item.value) : money(item.value)}</strong>
                  {tagLabel(item.tag)}
                </div>
              </div>
            ))}
          </div>

          <div className="totalBox">
            <div className="totalLabel">
              <span>{c.total}</span>
            </div>
            <div className="totalValue">
              <strong>{money(calc.total)}</strong>
              <em>({money(roundedTotal / (n(rate) || DEFAULT_RATE), "EUR")})</em>
            </div>
            <div className="totalRate">{c.rateLine}: 1 EUR = {rateLabel(n(rate) || DEFAULT_RATE)} PLN</div>
          </div>

          <div className="deliveryRoad" aria-hidden="true">
            <span />
            <DeliveryCar />
          </div>

          <ProcessFlow steps={processSteps} />
        </section>
      </section>
      {screenshotStatus && (
        <div className={`toast ${screenshotStatus}`}>
          {screenshotStatus === "ready" && c.screenshotReady}
          {screenshotStatus === "opened" && c.screenshotOpened}
          {screenshotStatus === "error" && c.screenshotError}
        </div>
      )}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
