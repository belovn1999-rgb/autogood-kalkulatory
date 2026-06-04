const {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState
} = React;
const VAT = 0.23;
const DEFAULT_RATE = 4.26;
const TO_FEE = 150;
const DOC_TRANSLATION = 250;
const STD_FIX = 1829.27;
const FIN_FIX = 2642.28;
const RATES_URL = "./data/exchange-rates.json";
const RATES_FALLBACK = {
  source: "money.pl / NBP",
  sourceUrl: "https://www.money.pl/pieniadze/nbp/kupnosprzedaz/",
  effectiveDate: "",
  rates: {
    EUR_PLN: {
      label: "EUR - PLN",
      value: DEFAULT_RATE,
      unit: "PLN"
    },
    SEK_EUR: {
      label: "SEK - EUR",
      value: 0,
      unit: "EUR"
    },
    DKK_EUR: {
      label: "DKK - EUR",
      value: 0,
      unit: "EUR"
    }
  }
};
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
    ratesTitle: "Kursy sprzedaży",
    ratesSource: "źródło",
    ratesUpdated: "aktualizacja",
    ratesLoading: "Ładowanie kursów",
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
      directCarBrutto: "Cena pojazdu brutto"
    }
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
    ratesTitle: "Курсы продажи",
    ratesSource: "источник",
    ratesUpdated: "обновлено",
    ratesLoading: "Загрузка курсов",
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
      directCarBrutto: "Цена автомобиля brutto"
    }
  }
};
const engineTypes = [{
  label: "EL / PHEV <=2000cm³",
  rate: 0
}, {
  label: "PHEV / HEV >2000cm³",
  rate: 0.093
}, {
  label: "HEV <=2000cm³",
  rate: 0.0155
}, {
  label: "Spalinowy <=2000cm³",
  rate: 0.031
}, {
  label: "Spalinowy >2000cm³",
  rate: 0.186
}];
const tabs = [{
  id: 0,
  name: {
    pl: "Zakup bezpośredni",
    ru: "Прямая покупка"
  },
  subtitle: {
    pl: "Klient płaci dealerowi bezpośrednio. VAT Marża.",
    ru: "Клиент платит дилеру напрямую. VAT Marża."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu",
      ru: "Цена автомобиля"
    },
    currency: "EUR"
  }, {
    key: "inspection",
    label: {
      pl: "Oględziny specjalisty netto",
      ru: "Инспекция специалиста netto"
    },
    currency: "PLN"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto"
    },
    currency: "PLN"
  }],
  notes: {
    pl: ["* Bezpośrednia płatność za pojazd", "** Oddajemy 70% uzyskanego rabatu"],
    ru: ["* Прямая оплата за автомобиль", "** Возвращаем 70% полученной скидки"]
  }
}, {
  id: 1,
  name: {
    pl: "Aukcje VAT 23%",
    ru: "Аукциона VAT 23%"
  },
  subtitle: {
    pl: "Aukcja zagraniczna. Wszystkie wartości netto, VAT na końcu.",
    ru: "Зарубежный аукцион. Все значения netto, VAT в конце."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu netto",
      ru: "Цена авто netto"
    },
    currency: "EUR"
  }, {
    key: "fee",
    label: {
      pl: "Opłata aukcyjna netto",
      ru: "Аукционный сбор netto"
    },
    currency: "EUR"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto"
    },
    currency: "PLN"
  }],
  notes: {
    pl: ["* Sprzedaż na Fakturę VAT 23%", "** Opłata w walucie PLN lub EUR"],
    ru: ["* Продажа по Faktura VAT 23%", "** Оплата в PLN или EUR"]
  }
}, {
  id: 2,
  name: {
    pl: "Aukcje VAT Marża",
    ru: "Аукционы VAT Маржа"
  },
  subtitle: {
    pl: "Aukcja zagraniczna. Pojazd brutto, transport netto + VAT.",
    ru: "Зарубежный аукцион. Авто brutto, транспорт netto + VAT."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu",
      ru: "Цена автомобиля"
    },
    currency: "EUR"
  }, {
    key: "fee",
    label: {
      pl: "Opłata aukcyjna",
      ru: "Аукционный сбор"
    },
    currency: "EUR"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto"
    },
    currency: "PLN"
  }],
  notes: {
    pl: ["* Sprzedaż na Fakturę VAT Marża", "** Opłata w walucie PLN lub EUR"],
    ru: ["* Продажа по Faktura VAT Marża", "** Оплата в PLN или EUR"]
  }
}, {
  id: 3,
  name: {
    pl: "Dealerzy VAT 23%",
    ru: "Дилеры VAT 23%"
  },
  subtitle: {
    pl: "Dealer zagraniczny przez AUTOGOOD. Auto netto, VAT na końcu.",
    ru: "Иностранный дилер через AUTOGOOD. Авто netto, VAT в конце."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu netto",
      ru: "Цена авто netto"
    },
    currency: "EUR"
  }, {
    key: "inspection",
    label: {
      pl: "Oględziny specjalisty netto",
      ru: "Инспекция специалиста netto"
    },
    currency: "PLN"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto"
    },
    currency: "PLN"
  }],
  notes: {
    pl: ["* Sprzedaż na Fakturę VAT 23%", "** Oddajemy 70% uzyskanego rabatu", "*** Wpłacamy kaucję w wys. zagranicznego VAT-u", "**** Opłata w walucie PLN lub EUR"],
    ru: ["* Продажа по Faktura VAT 23%", "** Возвращаем 70% полученной скидки", "*** Вносим депозит в размере иностранного VAT", "**** Оплата в PLN или EUR"]
  }
}, {
  id: 4,
  name: {
    pl: "Dealerzy VAT Marża",
    ru: "Дилеры VAT Маржа"
  },
  subtitle: {
    pl: "Dealer zagraniczny przez AUTOGOOD. Auto brutto, bez osobnej linii VAT.",
    ru: "Иностранный дилер через AUTOGOOD. Авто brutto, без отдельной строки VAT."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu",
      ru: "Цена автомобиля"
    },
    currency: "EUR"
  }, {
    key: "inspection",
    label: {
      pl: "Oględziny specjalisty netto",
      ru: "Инспекция специалиста netto"
    },
    currency: "PLN"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto"
    },
    currency: "PLN"
  }],
  notes: {
    pl: ["* Sprzedaż na Fakturę VAT Marża", "** Oddajemy 70% uzyskanego rabatu", "*** Możliwość opłaty w PLN / EUR"],
    ru: ["* Продажа по Faktura VAT Marża", "** Возвращаем 70% полученной скидки", "*** Возможность оплаты в PLN / EUR"]
  }
}];
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
    maximumFractionDigits: 0
  }).format(roundedCurrencyValue(value, currency));
}
function moneyExact(value, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
}
function percentLabel(value) {
  if (value === 0) return "0%";
  return `${(value * 100).toFixed(value === 0.0155 ? 2 : 1)}%`;
}
function inputCurrencyLabel(value, currency = "EUR") {
  return `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0)} ${currency}`;
}
function conversionPrefix(value, currency = "EUR") {
  return `${inputCurrencyLabel(value, currency)} =`;
}
function NumInput({
  label,
  value,
  onChange,
  suffix,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `field ${className}`
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("div", {
    className: "inputWrap"
  }, /*#__PURE__*/React.createElement("input", {
    inputMode: "decimal",
    type: "text",
    value: value,
    onChange: event => onChange(event.target.value),
    placeholder: "0.00"
  }), /*#__PURE__*/React.createElement("b", null, suffix)));
}
function RateInput({
  label,
  value,
  onChange
}) {
  const currentRate = n(value) || DEFAULT_RATE;
  const stepRate = delta => {
    const nextRate = Math.max(0, currentRate + delta);
    onChange(nextRate.toFixed(2));
  };
  return /*#__PURE__*/React.createElement("label", {
    className: "field rateField"
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("div", {
    className: "rateControl"
  }, /*#__PURE__*/React.createElement("input", {
    inputMode: "decimal",
    type: "text",
    value: value,
    onChange: event => onChange(event.target.value),
    placeholder: "4.26"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rateButtons"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Zwi\u0119ksz kurs",
    onClick: () => stepRate(0.01)
  }, "+"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Zmniejsz kurs",
    onClick: () => stepRate(-0.01)
  }, "\u2212")), /*#__PURE__*/React.createElement("b", null, "PLN")));
}
function formatRate(value, digits = 4) {
  if (!Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: digits
  }).format(Number(value));
}
function ExchangeRatesPanel({
  data,
  status,
  lang
}) {
  const c = copy[lang];
  const safeData = data || RATES_FALLBACK;
  const rows = ["EUR_PLN", "SEK_EUR", "DKK_EUR"].map(key => safeData.rates?.[key]).filter(Boolean);
  return /*#__PURE__*/React.createElement("section", {
    className: "ratesPanel",
    "aria-label": c.ratesTitle
  }, /*#__PURE__*/React.createElement("div", {
    className: "ratesPanelHead"
  }, /*#__PURE__*/React.createElement("strong", null, c.ratesTitle), status === "loading" && /*#__PURE__*/React.createElement("span", null, c.ratesLoading)), /*#__PURE__*/React.createElement("div", {
    className: "ratesTable"
  }, rows.map(item => /*#__PURE__*/React.createElement(React.Fragment, {
    key: item.label
  }, /*#__PURE__*/React.createElement("span", null, item.label), /*#__PURE__*/React.createElement("b", null, formatRate(item.value), " ", item.unit)))), /*#__PURE__*/React.createElement("small", null, safeData.effectiveDate ? `${c.ratesUpdated}: ${safeData.effectiveDate}. ` : "", c.ratesSource, ": money.pl / NBP"));
}
function MoneyIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "moneyIcon",
    viewBox: "0 0 48 48",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("g", {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "15",
    cy: "9",
    rx: "9",
    ry: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9v18c0 2.2 4 4 9 4s9-1.8 9-4V9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 15c0 2.2 4 4 9 4s9-1.8 9-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 21c0 2.2 4 4 9 4s9-1.8 9-4"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "33",
    cy: "16",
    rx: "8",
    ry: "3.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 16v10c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5V16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 21c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 35l18-9 10 9-18 9-10-9z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 35l6-3 11 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 40l18-9"
  })));
}
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }
  render() {
    if (this.state.hasError) {
      return /*#__PURE__*/React.createElement("div", {
        className: "errorBox"
      }, /*#__PURE__*/React.createElement("h1", null, copy.pl.errorTitle), /*#__PURE__*/React.createElement("p", null, copy.pl.errorBody));
    }
    return this.props.children;
  }
}
function tagLabel(tag) {
  if (!tag) return null;
  const className = tag.replace("+", "plus").replace(/\s|%/g, "");
  return /*#__PURE__*/React.createElement("span", {
    className: `tag tag-${className}`
  }, tag);
}
function row(label, value, tag, sub, highlight = false, exact = false, valuePrefix = "") {
  return {
    label,
    value,
    tag,
    sub,
    highlight,
    exact,
    valuePrefix
  };
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
      rows: [row(t.directCarBrutto, carPln, "", "", false, false, conversionPrefix(car)), row(t.inspection, inspection, "+VAT 23%", `${money(inspectionBrutto)} brutto`), row(t.transport, transport, "+VAT 23%", `${money(transportBrutto)} brutto`), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`), row(t.commission, commissionNetto, "+VAT 23%", `${money(commissionBrutto)} brutto`), row(t.to, TO_FEE, "", "", false, true), row(t.doc, DOC_TRANSLATION, "", "", false, true)]
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
      rows: [row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)), row(t.auctionFee, feePln, "", "", false, false, conversionPrefix(fee)), row(t.transport, transPln, "+VAT 23%", ""), row(t.excise, excise, "+VAT 23%", `${(exciseRate * 100).toFixed(2)}% × ${money(base)}`), row(t.commission, commissionNetto, "+VAT 23%", `${money(finFix)} + ${(finPct * 100).toFixed(0)}% × ${money(base)}`), row(t.vat, vat, "", `23% × ${money(vatBase)}`), row(t.to, TO_FEE, "", "", false, true), row(t.doc, DOC_TRANSLATION, "", "", false, true)]
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
      rows: [row(t.car, carPln, "", "", false, false, conversionPrefix(car)), row(t.auctionFee, feePln, "", "", false, false, conversionPrefix(fee)), row(t.transport, transNetto, "+VAT 23%", `${money(transBrutto)} brutto`), row(t.excise, excise, "+VAT 23%", `${money(exciseBrutto)} brutto`), row(t.commission, commissionNetto, "+VAT 23%", `${money(commissionBrutto)} brutto`), row(t.to, TO_FEE, "", "", false, true), row(t.doc, DOC_TRANSLATION, "", "", false, true)]
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
      rows: [row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)), row(t.inspection, inspection, "+VAT 23%", ""), row(t.transport, transport, "+VAT 23%", ""), row(t.excise, excise, "+VAT 23%", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`), row(t.commission, commissionNetto, "+VAT 23%", `${money(finFix)} + ${(finPct * 100).toFixed(0)}% × ${money(bruttoBase)}`), row(t.vat, vat, "", `23% × ${money(vatBase)}`), row(t.to, TO_FEE, "", "", false, true), row(t.doc, DOC_TRANSLATION, "", "", false, true)]
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
    rows: [row(t.car, carPln, "", "", false, false, conversionPrefix(car)), row(t.inspection, inspection, "+VAT 23%", `${money(inspectionBrutto)} brutto`), row(t.transport, transport, "+VAT 23%", `${money(transportBrutto)} brutto`), row(t.excise, excise, "+VAT 23%", `${money(exciseBrutto)} brutto`), row(t.commission, commissionNetto, "+VAT 23%", `${money(commissionBrutto)} brutto`), row(t.to, TO_FEE, "", "", false, true), row(t.doc, DOC_TRANSLATION, "", "", false, true)]
  };
}
function printCalculation({
  lang,
  tab,
  rows,
  total,
  rate
}) {
  const c = copy[lang];
  const roundedTotal = roundedCurrencyValue(total, "PLN");
  const rowsHtml = rows.map(item => `
        <tr class="${item.highlight ? "vat" : ""}">
          <td>
            <strong>${item.label}</strong>
            ${item.sub ? `<small>${item.sub}</small>` : ""}
          </td>
          <td>
            <div class="amount">${item.valuePrefix ? `<em>${item.valuePrefix}</em>` : ""} ${item.exact ? moneyExact(item.value) : money(item.value)} ${item.tag ? `<span>${item.tag}</span>` : ""}</div>
          </td>
        </tr>`).join("");
  const notesHtml = tab.notes[lang].map(note => `<p>${note}</p>`).join("");
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
    .amount em{font-style:normal;color:#64748b;font-weight:600}
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
  const blob = new Blob([html], {
    type: "text/html"
  });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function App() {
  const [lang, setLang] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [marketRates, setMarketRates] = useState(RATES_FALLBACK);
  const [ratesStatus, setRatesStatus] = useState("loading");
  const [engineIndex, setEngineIndex] = useState(0);
  const [financed, setFinanced] = useState(false);
  const [values, setValues] = useState({});
  const rateTouchedRef = useRef(false);
  const safeLang = lang || "pl";
  const c = copy[safeLang];
  const tab = tabs[activeTab];
  const exciseRate = engineTypes[engineIndex]?.rate ?? 0;
  const calc = useMemo(() => calculate(activeTab, values, n(rate), exciseRate, financed, safeLang), [activeTab, values, rate, exciseRate, financed, safeLang]);
  const roundedTotal = roundedCurrencyValue(calc.total, "PLN");
  useEffect(() => {
    let isMounted = true;
    const today = new Date().toISOString().slice(0, 10);
    fetch(`${RATES_URL}?date=${today}`, {
      cache: "no-store"
    }).then(response => {
      if (!response.ok) throw new Error("Rates file not available");
      return response.json();
    }).then(data => {
      if (!isMounted) return;
      setMarketRates(data);
      setRatesStatus("ready");
      const nextRate = Number(data?.rates?.EUR_PLN?.value);
      if (Number.isFinite(nextRate) && nextRate > 0 && !rateTouchedRef.current) {
        setRate(nextRate.toFixed(2));
      }
    }).catch(() => {
      if (!isMounted) return;
      setMarketRates(RATES_FALLBACK);
      setRatesStatus("fallback");
    });
    return () => {
      isMounted = false;
    };
  }, []);
  const switchTab = id => {
    setActiveTab(id);
    setValues({});
    setFinanced(false);
  };
  const setField = (key, value) => setValues(current => ({
    ...current,
    [key]: value
  }));
  const setManualRate = value => {
    rateTouchedRef.current = true;
    setRate(value);
  };
  if (!lang) {
    return /*#__PURE__*/React.createElement("main", {
      className: "startup"
    }, /*#__PURE__*/React.createElement("section", {
      className: "languageCard"
    }, /*#__PURE__*/React.createElement("a", {
      className: "logoLink logoLinkStartup",
      href: "./",
      "aria-label": "AUTOGOOD home"
    }, /*#__PURE__*/React.createElement("img", {
      className: "logoMark logoMarkStartup",
      src: "./assets/autogood-logo.png",
      alt: "AUTOGOOD"
    })), /*#__PURE__*/React.createElement("h1", null, copy.pl.pickLang, " / ", copy.ru.pickLang), /*#__PURE__*/React.createElement("div", {
      className: "startupActions"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setLang("pl")
    }, "PL"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setLang("ru")
    }, "RU"))));
  }
  return /*#__PURE__*/React.createElement("main", {
    className: "appShell"
  }, /*#__PURE__*/React.createElement("header", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("a", {
    className: "logoLink",
    href: "./",
    "aria-label": "AUTOGOOD home"
  }, /*#__PURE__*/React.createElement("img", {
    className: "logoMark",
    src: "./assets/autogood-logo.png",
    alt: "AUTOGOOD"
  })), /*#__PURE__*/React.createElement("div", {
    className: "headerActions"
  }, /*#__PURE__*/React.createElement(ExchangeRatesPanel, {
    data: marketRates,
    status: ratesStatus,
    lang: safeLang
  }), /*#__PURE__*/React.createElement(RateInput, {
    label: c.exchange,
    value: rate,
    onChange: setManualRate
  }), /*#__PURE__*/React.createElement("div", {
    className: "segmented",
    "aria-label": "Language"
  }, /*#__PURE__*/React.createElement("button", {
    className: lang === "pl" ? "active" : "",
    onClick: () => setLang("pl")
  }, "PL"), /*#__PURE__*/React.createElement("button", {
    className: lang === "ru" ? "active" : "",
    onClick: () => setLang("ru")
  }, "RU")), /*#__PURE__*/React.createElement("button", {
    className: "printBtn",
    onClick: () => printCalculation({
      lang,
      tab,
      rows: calc.rows,
      total: calc.total,
      rate: n(rate) || DEFAULT_RATE
    })
  }, c.print))), /*#__PURE__*/React.createElement("nav", {
    className: "tabs",
    "aria-label": "Calculators"
  }, tabs.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    className: item.id === activeTab ? "active" : "",
    onClick: () => switchTab(item.id)
  }, /*#__PURE__*/React.createElement("span", null, item.id), item.name[lang]))), /*#__PURE__*/React.createElement("section", {
    className: "grid"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "card sidebar"
  }, /*#__PURE__*/React.createElement("h2", null, c.inputs), /*#__PURE__*/React.createElement("label", {
    className: "field"
  }, /*#__PURE__*/React.createElement("span", null, c.engine), /*#__PURE__*/React.createElement("select", {
    value: engineIndex,
    onChange: event => setEngineIndex(Number(event.target.value))
  }, engineTypes.map((engine, index) => /*#__PURE__*/React.createElement("option", {
    key: engine.label,
    value: index
  }, engine.label, " - ", percentLabel(engine.rate))))), activeTab > 0 && /*#__PURE__*/React.createElement("div", {
    className: "toggleBlock"
  }, /*#__PURE__*/React.createElement("span", null, c.commissionType), /*#__PURE__*/React.createElement("div", {
    className: "segmented full"
  }, /*#__PURE__*/React.createElement("button", {
    className: !financed ? "active" : "",
    onClick: () => setFinanced(false)
  }, c.standard), /*#__PURE__*/React.createElement("button", {
    className: financed ? "active" : "",
    onClick: () => setFinanced(true)
  }, c.financing))), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), tab.fields.map(field => /*#__PURE__*/React.createElement(NumInput, {
    key: field.key,
    label: field.label[lang],
    value: values[field.key] || "",
    onChange: value => setField(field.key, value),
    suffix: field.currency
  }))), /*#__PURE__*/React.createElement("section", {
    className: "card results"
  }, /*#__PURE__*/React.createElement("div", {
    className: "resultsTitle"
  }, /*#__PURE__*/React.createElement("h2", null, /*#__PURE__*/React.createElement(MoneyIcon, null), c.results), /*#__PURE__*/React.createElement("strong", null, tab.name[lang])), /*#__PURE__*/React.createElement("div", {
    className: "rows"
  }, calc.rows.map(item => /*#__PURE__*/React.createElement("div", {
    key: `${item.label}-${item.value}-${item.tag}`,
    className: `resultRow ${item.highlight ? "vatRow" : ""}`
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "rowLabel"
  }, item.label), item.sub && /*#__PURE__*/React.createElement("small", null, item.sub)), /*#__PURE__*/React.createElement("div", {
    className: "rowValue"
  }, /*#__PURE__*/React.createElement("span", {
    className: `valuePrefix ${item.valuePrefix ? "" : "isEmpty"}`
  }, item.valuePrefix), /*#__PURE__*/React.createElement("strong", null, item.exact ? moneyExact(item.value) : money(item.value)), tagLabel(item.tag))))), /*#__PURE__*/React.createElement("div", {
    className: "totalBox"
  }, /*#__PURE__*/React.createElement("div", {
    className: "totalLabel"
  }, /*#__PURE__*/React.createElement("span", null, c.total)), /*#__PURE__*/React.createElement("div", {
    className: "totalValue"
  }, /*#__PURE__*/React.createElement("strong", null, money(calc.total)), /*#__PURE__*/React.createElement("em", null, "(", money(roundedTotal / (n(rate) || DEFAULT_RATE), "EUR"), ")"))), /*#__PURE__*/React.createElement("p", {
    className: "rateNote"
  }, c.rateLine, ": 1 EUR = ", (n(rate) || DEFAULT_RATE).toFixed(2), " PLN"), /*#__PURE__*/React.createElement("footer", {
    className: "footnotes"
  }, tab.notes[lang].map(note => /*#__PURE__*/React.createElement("p", {
    key: note
  }, note))))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));