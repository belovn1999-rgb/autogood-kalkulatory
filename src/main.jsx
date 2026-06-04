const { Component, useMemo, useState } = React;

const VAT = 0.23;
const DEFAULT_RATE = 4.26;
const TO_FEE = 150;
const DOC_TRANSLATION = 250;
const STD_FIX = 1829.27;
const FIN_FIX = 2642.28;

const copy = {
  pl: {
    pickLang: "Wybierz język",
    appTitle: "AUTOGOOD Kalkulatory",
    print: "Druk / PDF",
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
    ],
    notes: {
      pl: ["* Bezpośrednia płatność za pojazd", "** Oddajemy 70% uzyskanego rabatu"],
      ru: ["* Прямая оплата за автомобиль", "** Возвращаем 70% полученной скидки"],
    },
  },
  {
    id: 1,
    name: { pl: "Aukcje VAT 23%", ru: "Аукциона VAT 23%" },
    subtitle: {
      pl: "Aukcja zagraniczna. Wszystkie wartości netto, VAT na końcu.",
      ru: "Зарубежный аукцион. Все значения netto, VAT в конце.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu netto", ru: "Цена авто netto" }, currency: "EUR" },
      { key: "fee", label: { pl: "Opłata aukcyjna netto", ru: "Аукционный сбор netto" }, currency: "EUR" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto" }, currency: "PLN" },
    ],
    notes: {
      pl: ["* Sprzedaż na Fakturę VAT 23%", "** Opłata w walucie PLN lub EUR"],
      ru: ["* Продажа по Faktura VAT 23%", "** Оплата в PLN или EUR"],
    },
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
    notes: {
      pl: ["* Sprzedaż na Fakturę VAT Marża", "** Opłata w walucie PLN lub EUR"],
      ru: ["* Продажа по Faktura VAT Marża", "** Оплата в PLN или EUR"],
    },
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
    ],
    notes: {
      pl: [
        "* Sprzedaż na Fakturę VAT 23%",
        "** Oddajemy 70% uzyskanego rabatu",
        "*** Wpłacamy kaucję w wys. zagranicznego VAT-u",
        "**** Opłata w walucie PLN lub EUR",
      ],
      ru: [
        "* Продажа по Faktura VAT 23%",
        "** Возвращаем 70% полученной скидки",
        "*** Вносим депозит в размере иностранного VAT",
        "**** Оплата в PLN или EUR",
      ],
    },
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
    ],
    notes: {
      pl: [
        "* Sprzedaż na Fakturę VAT Marża",
        "** Oddajemy 70% uzyskanego rabatu",
        "*** Możliwość opłaty w PLN / EUR",
      ],
      ru: [
        "* Продажа по Faktura VAT Marża",
        "** Возвращаем 70% полученной скидки",
        "*** Возможность оплаты в PLN / EUR",
      ],
    },
  },
];

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

function carConversionLabel(carEur, carPln) {
  return `${money(carEur, "EUR")} = ${money(carPln)}`;
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
    onChange(nextRate.toFixed(2));
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
          placeholder="4.26"
        />
        <div className="rateButtons">
          <button type="button" aria-label="Zwiększ kurs" onClick={() => stepRate(0.01)}>+</button>
          <button type="button" aria-label="Zmniejsz kurs" onClick={() => stepRate(-0.01)}>−</button>
        </div>
        <b>PLN</b>
      </div>
    </label>
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

function row(label, value, tag, sub, highlight = false, exact = false) {
  return { label, value, tag, sub, highlight, exact };
}

function calculate(tabId, values, rate, exciseRate, financed, lang) {
  const t = copy[lang].lines;
  const car = n(values.car);
  const fee = n(values.fee);
  const inspection = n(values.inspection);
  const transport = n(values.transport);
  const useRate = rate > 0 ? rate : DEFAULT_RATE;
  const finFix = financed ? FIN_FIX : STD_FIX;
  const finPct = financed ? 0.05 : 0.02;

  if (tabId === 0) {
    const carPln = car * useRate;
    const inspectionBrutto = inspection * 1.23;
    const transportBrutto = transport * 1.23;
    const excise = exciseRate * carPln;
    const commissionNetto = STD_FIX + 0.01 * carPln;
    const commissionBrutto = commissionNetto * 1.23;
    const total = carPln + inspectionBrutto + transportBrutto + excise + commissionBrutto + TO_FEE + DOC_TRANSLATION;
    return {
      total,
      rows: [
        row(t.directCarBrutto, carPln, "", carConversionLabel(car, carPln)),
        row(t.inspection, inspection, "+VAT 23%", `${money(inspectionBrutto)} brutto`),
        row(t.transport, transport, "+VAT 23%", `${money(transportBrutto)} brutto`),
        row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`),
        row(t.commission, commissionNetto, "+VAT 23%", `${money(commissionBrutto)} brutto`),
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
    const total = vatBase + vat + TO_FEE + DOC_TRANSLATION;
    return {
      total,
      rows: [
        row(t.carNetto, carPln, "", carConversionLabel(car, carPln)),
        row(t.auctionFee, feePln, "", `${money(fee, "EUR")} × ${useRate.toFixed(2)}`),
        row(t.transport, transPln, "+VAT 23%", ""),
        row(t.excise, excise, "+VAT 23%", `${(exciseRate * 100).toFixed(2)}% × ${money(base)}`),
        row(t.commission, commissionNetto, "+VAT 23%", `${money(finFix)} + ${(finPct * 100).toFixed(0)}% × ${money(base)}`),
        row(t.vat, vat, "", `23% × ${money(vatBase)}`),
        row(t.to, TO_FEE, "", "", false, true),
        row(t.doc, DOC_TRANSLATION, "", "", false, true),
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
    const total = carPln + feePln + transBrutto + exciseBrutto + commissionBrutto + TO_FEE + DOC_TRANSLATION;
    return {
      total,
      rows: [
        row(t.car, carPln, "", carConversionLabel(car, carPln)),
        row(t.auctionFee, feePln, "", `${money(fee, "EUR")} × ${useRate.toFixed(2)}`),
        row(t.transport, transNetto, "+VAT 23%", `${money(transBrutto)} brutto`),
        row(t.excise, excise, "+VAT 23%", `${money(exciseBrutto)} brutto`),
        row(t.commission, commissionNetto, "+VAT 23%", `${money(commissionBrutto)} brutto`),
        row(t.to, TO_FEE, "", "", false, true),
        row(t.doc, DOC_TRANSLATION, "", "", false, true),
      ],
    };
  }

  if (tabId === 3) {
    const carPln = car * useRate;
    const excise = exciseRate * carPln;
    const bruttoBase = carPln * 1.19;
    const commissionNetto = finFix + finPct * bruttoBase;
    const vatBase = carPln + inspection + transport + excise + commissionNetto;
    const vat = vatBase * VAT;
    const total = vatBase + vat + TO_FEE + DOC_TRANSLATION;
    return {
      total,
      rows: [
        row(t.carNetto, carPln, "", carConversionLabel(car, carPln)),
        row(t.inspection, inspection, "+VAT 23%", ""),
        row(t.transport, transport, "+VAT 23%", ""),
        row(t.excise, excise, "+VAT 23%", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`),
        row(t.commission, commissionNetto, "+VAT 23%", `${money(finFix)} + ${(finPct * 100).toFixed(0)}% × ${money(bruttoBase)}`),
        row(t.vat, vat, "", `23% × ${money(vatBase)}`),
        row(t.to, TO_FEE, "", "", false, true),
        row(t.doc, DOC_TRANSLATION, "", "", false, true),
      ],
    };
  }

  const carPln = car * useRate;
  const inspectionBrutto = inspection * 1.23;
  const transportBrutto = transport * 1.23;
  const excise = exciseRate * carPln;
  const exciseBrutto = excise * 1.23;
  const commissionNetto = finFix + finPct * carPln;
  const commissionBrutto = commissionNetto * 1.23;
  const total = carPln + inspectionBrutto + transportBrutto + exciseBrutto + commissionBrutto + TO_FEE + DOC_TRANSLATION;
  return {
    total,
    rows: [
    row(t.car, carPln, "", carConversionLabel(car, carPln)),
      row(t.inspection, inspection, "+VAT 23%", `${money(inspectionBrutto)} brutto`),
      row(t.transport, transport, "+VAT 23%", `${money(transportBrutto)} brutto`),
      row(t.excise, excise, "+VAT 23%", `${money(exciseBrutto)} brutto`),
      row(t.commission, commissionNetto, "+VAT 23%", `${money(commissionBrutto)} brutto`),
      row(t.to, TO_FEE, "", "", false, true),
      row(t.doc, DOC_TRANSLATION, "", "", false, true),
    ],
  };
}

function printCalculation({ lang, tab, rows, total, rate }) {
  const c = copy[lang];
  const roundedTotal = roundedCurrencyValue(total, "PLN");
  const rowsHtml = rows
    .map(
      (item) => `
        <tr class="${item.highlight ? "vat" : ""}">
          <td>
            <strong>${item.label}</strong>
            ${item.sub ? `<small>${item.sub}</small>` : ""}
          </td>
          <td>
            <div class="amount">${item.exact ? moneyExact(item.value) : money(item.value)} ${item.tag ? `<span>${item.tag}</span>` : ""}</div>
          </td>
        </tr>`
    )
    .join("");
  const notesHtml = tab.notes[lang].map((note) => `<p>${note}</p>`).join("");
  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${c.appTitle} - ${tab.name[lang]}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:32px;color:#102033}
    header{border-bottom:3px solid #005B82;padding-bottom:16px;margin-bottom:22px}
    .printLogo{display:block;width:260px;height:auto;margin:0 0 10px}
    h1{color:#005B82;margin:0 0 6px;font-size:26px}
    h2{margin:0;color:#334155;font-size:18px}
    table{width:100%;border-collapse:collapse;margin-top:18px}
    td{border-bottom:1px solid #dbe4ee;padding:12px 8px;vertical-align:top}
    td:last-child{text-align:right;font-weight:700;white-space:nowrap}
    small{display:block;color:#64748b;margin-top:3px}
    span{border:1px solid #cbd5e1;border-radius:999px;padding:3px 8px;font-size:12px;color:#64748b}
    .amount{display:flex;justify-content:flex-end;align-items:center;gap:8px}
    .vat{background:#fff;color:#102033}
    .total{background:#005B82;color:white;border-radius:12px;padding:18px 20px;margin-top:20px;text-align:right}
    .total b{display:block;font-size:30px;margin-top:4px}
    .rate{text-align:right;font-style:italic;color:#64748b;margin-top:10px}
    .notes{border-top:1px dashed #94a3b8;margin-top:18px;padding-top:10px;font-style:italic;color:#475569;font-size:13px}
  </style>
</head>
<body>
  <header>
    <img class="printLogo" src="./assets/autogood-logo.png" alt="AUTOGOOD" />
    <h2>${tab.name[lang]}</h2>
  </header>
  <table>${rowsHtml}</table>
  <div class="total">${c.total}<b>${money(total)}</b><div>${money(roundedTotal / rate, "EUR")}</div></div>
  <div class="rate">${c.rateLine}: 1 EUR = ${rate.toFixed(2)} PLN</div>
  <div class="notes">${notesHtml}</div>
  <script>window.onload = function(){ window.print(); };</script>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function App() {
  const [lang, setLang] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [engineIndex, setEngineIndex] = useState(0);
  const [financed, setFinanced] = useState(false);
  const [values, setValues] = useState({});

  const safeLang = lang || "pl";
  const c = copy[safeLang];
  const tab = tabs[activeTab];
  const exciseRate = engineTypes[engineIndex]?.rate ?? 0;
  const calc = useMemo(
    () => calculate(activeTab, values, n(rate), exciseRate, financed, safeLang),
    [activeTab, values, rate, exciseRate, financed, safeLang]
  );
  const roundedTotal = roundedCurrencyValue(calc.total, "PLN");

  const switchTab = (id) => {
    setActiveTab(id);
    setValues({});
    setFinanced(false);
  };

  const setField = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  if (!lang) {
    return (
      <main className="startup">
        <section className="languageCard">
          <img className="logoMark logoMarkStartup" src="./assets/autogood-logo.png" alt="AUTOGOOD" />
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
        <img className="logoMark" src="./assets/autogood-logo.png" alt="AUTOGOOD" />
        <div className="headerActions">
          <RateInput label={c.exchange} value={rate} onChange={setRate} />
          <div className="segmented" aria-label="Language">
            <button className={lang === "pl" ? "active" : ""} onClick={() => setLang("pl")}>PL</button>
            <button className={lang === "ru" ? "active" : ""} onClick={() => setLang("ru")}>RU</button>
          </div>
          <button className="printBtn" onClick={() => printCalculation({ lang, tab, rows: calc.rows, total: calc.total, rate: n(rate) || DEFAULT_RATE })}>
            {c.print}
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

        <section className="card results">
          <div className="resultsTitle">
            <h2><MoneyIcon />{c.results}</h2>
            <strong>{tab.name[lang]}</strong>
          </div>

          <div className="rows">
            {calc.rows.map((item) => (
              <div key={`${item.label}-${item.value}-${item.tag}`} className={`resultRow ${item.highlight ? "vatRow" : ""}`}>
                <div>
                  <span className="rowLabel">{item.label}</span>
                  {item.sub && <small>{item.sub}</small>}
                </div>
                <div className="rowValue">
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
          </div>

          <p className="rateNote">{c.rateLine}: 1 EUR = {(n(rate) || DEFAULT_RATE).toFixed(2)} PLN</p>

          <footer className="footnotes">
            {tab.notes[lang].map((note) => (
              <p key={note}>{note}</p>
            ))}
          </footer>
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
