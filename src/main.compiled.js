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
const WALUTOMAT_API_URL = "https://api.walutomat.pl/api/v2.0.0/market_fx/best_offers";
const DEFAULT_MOBILEDE_API_URL = "https://adams-led-geographical-practitioner.trycloudflare.com/mobilede/import";
const readMobileDeApiUrl = () => {
  const configuredUrl = window.AUTOGOOD_MOBILEDE_API_URL;
  const params = new URLSearchParams(window.location.search);
  const queryUrl = params.get("mobiledeApi");
  return configuredUrl || queryUrl || DEFAULT_MOBILEDE_API_URL;
};
const MOBILEDE_API_URL = readMobileDeApiUrl();
const HISTORY_KEY = "autogood-calculation-history";
const FINAL_HISTORY_KEY = "autogood-final-balance-history";
const HISTORY_LIMIT = 5;
const FINAL_TAB_ID = 5;
const RATES_FALLBACK = {
  source: "Walutomat",
  sourceUrl: "https://www.walutomat.pl/kursy-walut/",
  effectiveDate: "",
  rates: {
    EUR_PLN: {
      label: "EUR - PLN",
      value: DEFAULT_RATE,
      unit: "PLN"
    }
  }
};
const copy = {
  pl: {
    appTitle: "AUTOGOOD Kalkulatory",
    navTitle: "Kalkulatory",
    print: "Druk / PDF",
    screenshot: "Kopiuj obraz",
    screenshotReady: "Obraz skopiowany.",
    screenshotOpened: "Obraz otwarty w nowej karcie.",
    screenshotError: "Nie udało się skopiować obrazu.",
    saveCalculation: "Zapisz kalkulację",
    saveCalculationReady: "Kalkulacja zapisana.",
    saveCalculationEmpty: "Najpierw wpisz dane kalkulacji.",
    exchange: "Kurs EUR/PLN",
    avgRate: "Średni kurs",
    engine: "Typ silnika",
    commissionType: "Rodzaj prowizji",
    standard: "Standard",
    financing: "Finansowanie",
    inputs: "Dane",
    results: "Kalkulacja",
    total: "Razem",
    totalJoin: "lub",
    rateLine: "Przeliczono po kursie",
    historyTitle: "Historia zmian",
    historyEmpty: "Tutaj pojawi się 5 ostatnich kalkulacji.",
    historyRestore: "Przywróć kalkulację",
    finalHistoryEmpty: "Tutaj pojawi się 5 ostatnich rozliczeń.",
    finalBalance: "Finalne rozliczenie",
    finalCurrency: "Waluta rozliczenia",
    finalFixedCosts: "Aktywne pozycje",
    finalExtras: "Nieaktywne pozycje",
    finalAddExtra: "Dodaj",
    finalRemove: "Usuń",
    finalModePlus: "Do zapłaty",
    finalModeMinus: "Zapłacone / odjęcie",
    finalModeOff: "Nie licz",
    finalDue: "Pozostało do dopłaty",
    finalOverpaid: "Nadpłata / do zwrotu",
    finalRateLine: "Kurs EUR/PLN",
    finalCustomTitle: "Dodaj własny koszt",
    finalCustomPlaceholder: "Nazwa kosztu",
    finalCustomAdd: "Dodaj koszt",
    finalCustomDelete: "Usuń pozycję",
    finalVatToggle: "Dodaj VAT 23%",
    mobileImportTitle: "Link Mobile.de",
    mobileImportPlaceholder: "Wklej link ogłoszenia",
    mobileImportButton: "Załaduj dane",
    mobileImportLoading: "Pobieram dane...",
    mobileImportReady: "Dane podstawione: cena brutto, silnik, akcyza i dane ogłoszenia.",
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
      germanCommission: "Prowizja firmy niemieckiej"
    }
  },
  ru: {
    appTitle: "AUTOGOOD Калькуляторы",
    navTitle: "Калькуляторы",
    print: "Печать / PDF",
    screenshot: "Скопировать скрин",
    screenshotReady: "Скрин скопирован.",
    screenshotOpened: "Скрин открыт в новой вкладке.",
    screenshotError: "Не удалось скопировать скрин.",
    saveCalculation: "Сохранить расчёт",
    saveCalculationReady: "Расчёт сохранён.",
    saveCalculationEmpty: "Сначала внеси данные расчёта.",
    exchange: "Курс EUR/PLN",
    avgRate: "Средний курс",
    engine: "Тип двигателя",
    commissionType: "Тип комиссии",
    standard: "Стандарт",
    financing: "Финансирование",
    inputs: "Данные",
    results: "Расчёт",
    total: "Итого",
    totalJoin: "или",
    rateLine: "Расчёт по курсу",
    historyTitle: "История изменений",
    historyEmpty: "Здесь появятся 5 последних расчётов.",
    historyRestore: "Вернуть расчёт",
    finalHistoryEmpty: "Здесь появятся 5 последних финальных расчётов.",
    finalBalance: "Финальный расчёт",
    finalCurrency: "Валюта расчёта",
    finalFixedCosts: "Активные позиции",
    finalExtras: "Неактивные позиции",
    finalAddExtra: "Добавить",
    finalRemove: "Удалить",
    finalModePlus: "К доплате",
    finalModeMinus: "Оплачено / минус",
    finalModeOff: "Не считать",
    finalDue: "Осталось доплатить",
    finalOverpaid: "Переплата / к возврату",
    finalRateLine: "Курс EUR/PLN",
    finalCustomTitle: "Добавить свой расход",
    finalCustomPlaceholder: "Название расхода",
    finalCustomAdd: "Добавить расход",
    finalCustomDelete: "Удалить позицию",
    finalVatToggle: "Добавить НДС 23%",
    mobileImportTitle: "Ссылка Mobile.de",
    mobileImportPlaceholder: "Вставь ссылку объявления",
    mobileImportButton: "Загрузить данные",
    mobileImportLoading: "Загружаю данные...",
    mobileImportReady: "Данные подставлены: цена brutto, двигатель, акциз и данные объявления.",
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
      germanCommission: "Комиссия немецкой фирмы"
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
  }, {
    key: "discount",
    label: {
      pl: "Rabat",
      ru: "Скидка"
    },
    currency: "PLN"
  }]
}, {
  id: 1,
  name: {
    pl: "Aukcje VAT 23%",
    ru: "Аукционы VAT 23%"
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
  }]
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
  }]
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
  }, {
    key: "germanCommission",
    label: {
      pl: "Prowizja firmy niemieckiej",
      ru: "Комиссия немецкой фирмы"
    },
    currency: "EUR",
    optional: true
  }, {
    key: "discount",
    label: {
      pl: "Rabat",
      ru: "Скидка"
    },
    currency: "EUR"
  }]
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
  }, {
    key: "germanCommission",
    label: {
      pl: "Prowizja firmy niemieckiej",
      ru: "Комиссия немецкой фирмы"
    },
    currency: "EUR",
    optional: true
  }, {
    key: "discount",
    label: {
      pl: "Rabat",
      ru: "Скидка"
    },
    currency: "EUR"
  }]
}, {
  id: FINAL_TAB_ID,
  name: {
    pl: "Finalne rozliczenie",
    ru: "Финальный расчёт"
  },
  subtitle: {
    pl: "Bilans dla klienta: co już zapłacono i co zostało do dopłaty.",
    ru: "Баланс для клиента: что уже оплачено и что осталось доплатить."
  },
  fields: []
}];
function calculatorName(tab, lang, financed) {
  if (financed && tab?.id === 1) {
    return lang === "ru" ? "Аукцион Лизинг VAT 23%" : "Aukcja Leasing VAT 23%";
  }
  if (financed && tab?.id === 3) {
    return lang === "ru" ? "Дилер Лизинг VAT 23%" : "Dealer Leasing VAT 23%";
  }
  return tab?.name?.[lang] || "";
}
const directSellerPayment = {
  pl: "Płatność za pojazd do sprzedawcy w EUR",
  ru: "Вы платите за автомобиль продавцу в EUR"
};
const financingNotes = {
  pl: {
    ownFunds: "Kupujemy pojazd z własnych środków",
    ownFundsDeposit: "Kupujemy pojazd z własnych środków oraz wpłacamy kaucję w wys. zagranicznego VAT-u",
    ownContribution: "Wpłacenie wkładu własnego"
  },
  ru: {
    ownFunds: "Покупаем автомобиль за собственные средства",
    ownFundsDeposit: "Покупаем автомобиль за собственные средства и вносим депозит в размере иностранного VAT",
    ownContribution: "Вы вносите собственный взнос"
  }
};
function getProcessSteps(tab, lang, financed, hasGermanCommission = false) {
  const steps = {
    0: {
      pl: ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", directSellerPayment.pl],
      ru: ["Возвращаем 70% полученной скидки от продавца", directSellerPayment.ru]
    },
    1: {
      pl: financed ? [financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, "Sprzedajemy na Fakturę VAT 23%"] : ["Płatność w PLN lub EUR", "Sprzedajemy na Fakturę VAT 23%"],
      ru: financed ? [financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, "Продаём по Faktura VAT 23%"] : ["Вы оплачиваете всю сумму в PLN или EUR", "Продаём по Faktura VAT 23%"]
    },
    2: {
      pl: financed ? [financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, "Sprzedajemy na Fakturę VAT Marża"] : ["Płatność w PLN lub EUR", "Sprzedajemy na Fakturę VAT Marża"],
      ru: financed ? [financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, "Продаём по Faktura VAT Marża"] : ["Вы оплачиваете всю сумму в PLN или EUR", "Продаём по Faktura VAT Marża"]
    },
    3: {
      pl: financed ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFundsDeposit, "Sprzedajemy na Fakturę VAT 23%"] : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Wpłacamy kaucję w wys. zagranicznego VAT-u", "Płatność w PLN lub EUR", "Sprzedajemy na Fakturę VAT 23%"],
      ru: financed ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFundsDeposit, "Продаём по Faktura VAT 23%"] : ["Возвращаем 70% полученной скидки от продавца", "Вносим депозит в размере иностранного VAT", "Вы оплачиваете всю сумму в PLN или EUR", "Продаём по Faktura VAT 23%"]
    },
    4: {
      pl: financed ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, "Sprzedajemy na Fakturę VAT Marża"] : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Płatność w PLN lub EUR", "Sprzedajemy na Fakturę VAT Marża"],
      ru: financed ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, "Продаём по Faktura VAT Marża"] : ["Возвращаем 70% полученной скидки от продавца", "Вы оплачиваете всю сумму в PLN или EUR", "Продаём по Faktura VAT Marża"]
    }
  };
  if (hasGermanCommission && tab.id === 3) {
    return lang === "ru" ? financed ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFundsDeposit, directSellerPayment.ru] : ["Возвращаем 70% полученной скидки от продавца", "Вносим депозит в размере иностранного VAT", directSellerPayment.ru] : financed ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFundsDeposit, directSellerPayment.pl] : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Wpłacamy kaucję w wys. zagranicznego VAT-u", directSellerPayment.pl];
  }
  if (hasGermanCommission && tab.id === 4) {
    return lang === "ru" ? financed ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, directSellerPayment.ru] : ["Возвращаем 70% полученной скидки от продавца", directSellerPayment.ru] : financed ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, directSellerPayment.pl] : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", directSellerPayment.pl];
  }
  return steps[tab.id]?.[lang] || [];
}
const processHighlights = ["70% uzyskanego rabatu", "70% полученной скидки", "Вы оплачиваете автомобиль", "Вы платите за автомобиль", "do sprzedawcy w EUR", "продавцу в EUR", "Вы оплачиваете всю сумму", "w PLN lub EUR", "PLN lub EUR", "PLN или EUR", "na Fakturę VAT 23%", "Fakturę VAT 23%", "Faktura VAT 23%", "na Fakturę VAT Marża", "Fakturę VAT Marża", "Faktura VAT Marża", "Продаём", "własnych środków", "wkładu własnego", "Вы вносите собственный взнос", "Wpłacamy kaucję", "wpłacamy kaucję", "Вносим депозит", "вносим депозит"];
function splitHighlightedText(text) {
  const escaped = processHighlights.map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`(${escaped})`, "gi");
  return String(text).split(pattern).filter(Boolean);
}
function isHighlightedText(part) {
  return processHighlights.some(phrase => phrase.toLowerCase() === String(part).toLowerCase());
}
function renderHighlightedText(text) {
  return splitHighlightedText(text).map((part, index) => isHighlightedText(part) ? /*#__PURE__*/React.createElement("strong", {
    key: `${part}-${index}`
  }, part) : /*#__PURE__*/React.createElement(React.Fragment, {
    key: `${part}-${index}`
  }, part));
}
function highlightedHtml(text) {
  return splitHighlightedText(text).map(part => isHighlightedText(part) ? `<strong>${part}</strong>` : part).join("");
}
function n(value) {
  const parsed = Number(String(value).replace(/\s/g, "").replace(",", "."));
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
function rowContribution(item) {
  const value = Number(item?.totalValue);
  return Number.isFinite(value) ? value : n(item?.value);
}
function rowOverrideKey(tabId, index) {
  return `${tabId}:${index}`;
}
function rowEditValue(item) {
  return String(Math.round(item.exact ? n(item.value) : roundedCurrencyValue(n(item.value), "PLN")));
}
function applyManualOverrides(calc, overrides, tabId) {
  let hasOverrides = false;
  const rows = calc.rows.map((item, index) => {
    const key = rowOverrideKey(tabId, index);
    if (!Object.prototype.hasOwnProperty.call(overrides, key)) {
      return {
        ...item,
        totalValue: rowContribution(item)
      };
    }
    hasOverrides = true;
    const manualValue = n(overrides[key]);
    const multiplier = Number(item.manualMultiplier);
    const safeMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
    return {
      ...item,
      value: manualValue,
      totalValue: manualValue * safeMultiplier,
      manualText: overrides[key]
    };
  });
  return {
    ...calc,
    rows,
    total: hasOverrides ? rows.reduce((sum, item) => sum + rowContribution(item), 0) : calc.total
  };
}
function formatHistoryDate(value, lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
function readHistory(key = HISTORY_KEY) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
  } catch (error) {
    return [];
  }
}
function writeHistory(items, key = HISTORY_KEY) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    // The calculator still works if the browser blocks local storage.
  }
}
function normalizeHistoryValues(values) {
  return Object.fromEntries(Object.entries(values || {}).filter(([, value]) => String(value ?? "").trim() !== ""));
}
function hasCalculationInput(values) {
  return Object.values(values || {}).some(value => n(value) > 0);
}
function historySignature(item) {
  return JSON.stringify({
    activeTab: item.activeTab,
    rate: item.rate,
    engineIndex: item.engineIndex,
    financed: item.financed,
    values: item.values || {},
    manualOverrides: item.manualOverrides || {}
  });
}
function percentLabel(value) {
  if (value === 0) return "0%";
  const digits = value === 0.0155 ? 2 : 1;
  return `${(value * 100).toFixed(digits).replace(".", ",")}%`;
}
function rateLabel(value) {
  return (Number.isFinite(value) ? value : DEFAULT_RATE).toFixed(4);
}
function calculationRateLabel(value) {
  const safeValue = Number.isFinite(value) ? value : DEFAULT_RATE;
  return (Math.round((safeValue + Number.EPSILON) * 100) / 100).toFixed(2);
}
function rateWithCalculationMargin(value) {
  const safeValue = Number.isFinite(value) ? value : DEFAULT_RATE;
  return Math.round((safeValue + 0.02) * 100) / 100;
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
function formatPlainAmount(value, currency = "EUR") {
  return `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0)} ${currency}`;
}
const finalFixedTemplates = [{
  key: "inspection",
  label: {
    pl: "Oględziny specjalisty",
    ru: "Осмотр специалиста"
  },
  mode: "plus",
  vat: true
}, {
  key: "delivery",
  label: {
    pl: "Dostawa na lawecie",
    ru: "Доставка на автовозе"
  },
  mode: "plus",
  vat: true
}, {
  key: "translation",
  label: {
    pl: "Tłumaczenie dokumentów",
    ru: "Перевод документов"
  },
  mode: "plus",
  defaultPln: DOC_TRANSLATION
}, {
  key: "technical",
  label: {
    pl: "Przegląd techniczny",
    ru: "Техосмотр"
  },
  mode: "plus",
  defaultPln: TO_FEE
}, {
  key: "commission",
  label: {
    pl: "Prowizja AUTOGOOD",
    ru: "Комиссия AUTOGOOD"
  },
  mode: "plus",
  vat: true
}, {
  key: "deposit",
  label: {
    pl: "Zaliczka",
    ru: "Аванс"
  },
  mode: "minus"
}];
const finalExtraTemplates = [{
  key: "dealerDiscount30",
  label: {
    pl: "30% rabatu dealera",
    ru: "30% скидки дилера"
  },
  group: "extra",
  mode: "off",
  activeMode: "minus"
}, {
  key: "germanCompanyCommission",
  label: {
    pl: "Prowizja firmy niemieckiej",
    ru: "Комиссия немецкой фирмы"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "inspection2",
  label: {
    pl: "Oględziny x2",
    ru: "Осмотр x2"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus",
  vat: true
}, {
  key: "detailing",
  label: {
    pl: "Detailing",
    ru: "Дитейлинг"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "painting",
  label: {
    pl: "Lakierowanie",
    ru: "Покраска"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "service",
  label: {
    pl: "Serwis",
    ru: "Сервис"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "registration",
  label: {
    pl: "Rejestracja",
    ru: "Регистрация"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "deposit2",
  label: {
    pl: "Zaliczka 2",
    ru: "Аванс 2"
  },
  group: "extra",
  mode: "off",
  activeMode: "minus"
}];
const finalTemplates = [...finalFixedTemplates, ...finalExtraTemplates];
function convertFinalAmount(value, fromCurrency, toCurrency, rate) {
  const amount = n(value);
  const safeRate = n(rate) || DEFAULT_RATE;
  if (!amount) return "";
  if (fromCurrency === toCurrency) return amount;
  return fromCurrency === "PLN" ? amount / safeRate : amount * safeRate;
}
function finalInputValue(value, currency) {
  if (!Number.isFinite(value) || value <= 0) return "";
  return currency === "EUR" ? String(Math.round(value * 100) / 100) : String(Math.round(value));
}
function createFinalItem(template, currency, rate) {
  const converted = template.defaultPln ? convertFinalAmount(template.defaultPln, "PLN", currency, rate) : "";
  return {
    key: template.key,
    label: template.label,
    group: template.group || "fixed",
    amount: finalInputValue(converted, currency),
    mode: template.mode || "plus",
    activeMode: template.activeMode || template.mode || "plus",
    vat: Boolean(template.vat)
  };
}
function initialFinalItems(currency = "PLN", rate = DEFAULT_RATE) {
  return finalTemplates.map(template => createFinalItem(template, currency, rate));
}
function finalLineSignedValue(item) {
  if (item.mode === "off") return 0;
  const amount = n(item.amount);
  if (!amount) return 0;
  return item.mode === "minus" ? -amount : amount;
}
function finalLineVatValue(item) {
  if (item.mode !== "plus" || !item.vatAdded) return 0;
  return n(item.amount) * VAT;
}
function calculateFinalBalance(items) {
  const active = items.filter(item => item.mode !== "off");
  const positive = active.reduce((sum, item) => {
    const value = finalLineSignedValue(item);
    return value > 0 ? sum + value + finalLineVatValue(item) : sum;
  }, 0);
  const negative = active.reduce((sum, item) => {
    const value = finalLineSignedValue(item);
    return value < 0 ? sum + Math.abs(value) : sum;
  }, 0);
  return {
    rows: active,
    positive,
    negative,
    total: positive - negative
  };
}
function hasFinalInput(items) {
  return items.some(item => item.mode !== "off" && n(item.amount) > 0);
}
function finalHistorySignature(item) {
  return JSON.stringify({
    finalCurrency: item.finalCurrency,
    rate: item.rate,
    items: item.items || []
  });
}
function finalSignedAmountLabel(item, currency) {
  const value = Math.abs(n(item.amount));
  const sign = item.mode === "minus" ? "−" : "+";
  return `${sign} ${moneyExact(value, currency)}`;
}
function oppositeCurrencyAmount(value, currency, rate) {
  const safeRate = n(rate) || DEFAULT_RATE;
  if (currency === "EUR") return moneyExact(Math.abs(value) * safeRate, "PLN");
  return moneyExact(Math.abs(value) / safeRate, "EUR");
}
function finalTemplateForKey(key) {
  return finalTemplates.find(template => template.key === key);
}
function normalizeFinalItem(item) {
  const template = finalTemplateForKey(item.key);
  return {
    ...item,
    label: template?.label || item.label,
    group: template?.group || item.group || "fixed",
    mode: item.mode || template?.mode || "plus",
    activeMode: template?.activeMode || item.activeMode || template?.mode || "plus",
    vat: Boolean(template?.vat || item.vat),
    vatAdded: Boolean(item.vatAdded)
  };
}
function customFinalItem(label, currency) {
  const safeLabel = String(label || "").trim();
  return {
    key: `custom-${Date.now()}-${Math.round(Math.random() * 100000)}`,
    label: {
      pl: safeLabel,
      ru: safeLabel
    },
    group: "custom",
    amount: "",
    mode: "plus",
    activeMode: "plus",
    vat: false,
    vatAdded: false,
    isCustom: true,
    currency
  };
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
function OptionalAmountInput({
  label,
  value,
  checked,
  onToggle,
  onChange,
  suffix
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `field optionalAmountField ${checked ? "isChecked" : ""}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "optionalAmountLabel"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: event => onToggle(event.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, label)), checked && /*#__PURE__*/React.createElement("div", {
    className: "inputWrap"
  }, /*#__PURE__*/React.createElement("input", {
    inputMode: "decimal",
    type: "text",
    value: value,
    onChange: event => onChange(event.target.value),
    placeholder: "0.00"
  }), /*#__PURE__*/React.createElement("b", null, suffix)));
}
function formatAvgRate(value) {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : DEFAULT_RATE);
}
function RateWidget({
  c,
  avgRateLabel,
  rateDate,
  value,
  onChange
}) {
  const currentRate = n(value) || DEFAULT_RATE;
  const stepRate = delta => {
    const nextRate = Math.max(0, currentRate + delta);
    onChange(calculationRateLabel(nextRate));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "rateWidget"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rateWidgetEyebrow"
  }, c.exchange), /*#__PURE__*/React.createElement("div", {
    className: "rateWidgetRow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rateWidgetAvg"
  }, /*#__PURE__*/React.createElement("span", null, c.avgRate, ": ", /*#__PURE__*/React.createElement("strong", null, avgRateLabel, " PLN")), /*#__PURE__*/React.createElement("em", null, rateDate)), /*#__PURE__*/React.createElement("div", {
    className: "rateWidgetControl"
  }, /*#__PURE__*/React.createElement("input", {
    inputMode: "decimal",
    type: "text",
    value: value,
    onChange: event => onChange(event.target.value),
    placeholder: "4.26"
  }), /*#__PURE__*/React.createElement("b", null, "PLN"), /*#__PURE__*/React.createElement("div", {
    className: "rateWidgetSteps"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Zwi\u0119ksz kurs",
    onClick: () => stepRate(0.01)
  }, "+"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Zmniejsz kurs",
    onClick: () => stepRate(-0.01)
  }, "\u2212")))));
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
  const response = await fetch(url, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Walutomat API returned ${response.status}`);
  const data = await response.json();
  if (!data?.success || data?.result?.currencyPair !== pair) throw new Error(`Invalid Walutomat response for ${pair}`);
  return data.result;
}
async function loadLiveExchangeRates() {
  const eurPlnOffers = await loadWalutomatOffer("EURPLN");
  const eurPln = bestOfferRate(eurPlnOffers, "EURPLN");
  const updatedAt = eurPlnOffers.ts || new Date().toISOString();
  return {
    source: "Walutomat API - kurs sprzedaży",
    sourceUrl: "https://www.walutomat.pl/kursy-walut/",
    providerApiUrl: WALUTOMAT_API_URL,
    updatedAt,
    effectiveDate: updatedAt.slice(0, 10),
    rates: {
      EUR_PLN: {
        label: "EUR - PLN",
        value: Math.round(eurPln * 10000) / 10000,
        unit: "PLN"
      }
    }
  };
}
async function loadExchangeRates() {
  try {
    return await loadLiveExchangeRates();
  } catch (liveError) {
    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch(`${RATES_URL}?date=${today}`, {
      cache: "no-store"
    });
    if (!response.ok) throw liveError;
    return response.json();
  }
}
function MobileDeImport({
  c,
  url,
  status,
  summary,
  onUrlChange,
  onImport
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "mobileImport"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field"
  }, /*#__PURE__*/React.createElement("span", null, c.mobileImportTitle), /*#__PURE__*/React.createElement("div", {
    className: "mobileImportControl"
  }, /*#__PURE__*/React.createElement("input", {
    type: "url",
    value: url,
    onChange: event => onUrlChange(event.target.value),
    placeholder: c.mobileImportPlaceholder
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onImport,
    disabled: status === "loading" || !url.trim()
  }, status === "loading" ? "..." : c.mobileImportButton))), status && /*#__PURE__*/React.createElement("p", {
    className: `mobileImportStatus ${status}`
  }, status === "loading" && c.mobileImportLoading, status === "ready" && c.mobileImportReady, status === "error" && c.mobileImportError), summary && status !== "error" && /*#__PURE__*/React.createElement("p", {
    className: "mobileImportSummary"
  }, /*#__PURE__*/React.createElement("b", null, c.mobileImportFound, ":"), " ", summary), summary && status === "error" && /*#__PURE__*/React.createElement("p", {
    className: "mobileImportSummary errorDetail"
  }, summary));
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
function ProcessFlow({
  steps
}) {
  return /*#__PURE__*/React.createElement("ol", {
    className: "processFlow",
    "aria-label": "Informacje"
  }, steps.map((step, index) => /*#__PURE__*/React.createElement("li", {
    key: `${step}-${index}`,
    className: "processStep"
  }, renderHighlightedText(step))));
}
function HistoryPanel({
  c,
  history,
  lang,
  onRestore,
  emptyText
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "card historyPanel"
  }, /*#__PURE__*/React.createElement("h2", null, c.historyTitle), history.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "historyEmpty"
  }, emptyText || c.historyEmpty) : /*#__PURE__*/React.createElement("div", {
    className: "historyList"
  }, history.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    className: "historyItem",
    type: "button",
    title: c.historyRestore,
    onClick: () => onRestore(item)
  }, /*#__PURE__*/React.createElement("strong", null, item.title), /*#__PURE__*/React.createElement("span", null, formatHistoryDate(item.savedAt, lang), " \xB7 ", item.type === "final" ? item.finalCurrency : item.financed ? c.financing : c.standard), /*#__PURE__*/React.createElement("em", null, money(item.total, item.finalCurrency || "PLN"))))));
}
function FinalModeControl({
  c,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "finalModeControl",
    "aria-label": c.finalCurrency
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: value === "plus" ? "active plus" : "plus",
    onClick: () => onChange("plus")
  }, "+"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: value === "minus" ? "active minus" : "minus",
    onClick: () => onChange("minus")
  }, "\u2212"));
}
function FinalOffButton({
  item,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `finalOffButton ${item.mode === "off" ? "active" : ""}`,
    onClick: onToggle,
    "aria-label": "Nie licz"
  }, "\xD7");
}
function FinalItemInput({
  c,
  item,
  lang,
  currency,
  onAmountChange,
  onModeChange,
  onOffToggle,
  onDelete
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `finalInputRow mode-${item.mode}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "finalRowActions"
  }, /*#__PURE__*/React.createElement(FinalOffButton, {
    item: item,
    onToggle: onOffToggle
  }), item.isCustom && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "finalCustomDeleteBtn",
    onClick: onDelete,
    title: c.finalCustomDelete
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    className: "finalInputLabel"
  }, /*#__PURE__*/React.createElement("span", null, item.label[lang]), /*#__PURE__*/React.createElement(FinalModeControl, {
    c: c,
    value: item.mode,
    onChange: onModeChange
  })), /*#__PURE__*/React.createElement("div", {
    className: "inputWrap"
  }, /*#__PURE__*/React.createElement("input", {
    inputMode: "decimal",
    type: "text",
    value: item.amount,
    onChange: event => onAmountChange(event.target.value),
    placeholder: "0.00",
    disabled: item.mode === "off"
  }), /*#__PURE__*/React.createElement("b", null, currency)));
}
function FinalBalanceInputs({
  c,
  lang,
  currency,
  items,
  customName,
  onCustomNameChange,
  onAddCustom,
  onAmountChange,
  onModeChange,
  onOffToggle,
  onDeleteCustom
}) {
  const leftItems = items.filter(item => item.group !== "extra");
  const rightItems = items.filter(item => item.group === "extra");
  const renderItem = item => /*#__PURE__*/React.createElement(FinalItemInput, {
    key: item.key,
    c: c,
    item: item,
    lang: lang,
    currency: currency,
    onAmountChange: value => onAmountChange(item.key, value),
    onModeChange: mode => onModeChange(item.key, mode),
    onOffToggle: () => onOffToggle(item.key),
    onDelete: item.isCustom ? () => onDeleteCustom(item.key) : undefined
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "finalColumns"
  }, /*#__PURE__*/React.createElement("div", {
    className: "finalColumn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "finalInputList"
  }, leftItems.map(renderItem))), /*#__PURE__*/React.createElement("div", {
    className: "finalColumn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "finalInputList"
  }, rightItems.map(renderItem)))), /*#__PURE__*/React.createElement("div", {
    className: "finalCustomAdd"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "sidebarSubhead"
  }, c.finalCustomTitle), /*#__PURE__*/React.createElement("div", {
    className: "finalCustomControl"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: customName,
    onChange: event => onCustomNameChange(event.target.value),
    placeholder: c.finalCustomPlaceholder
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAddCustom,
    disabled: !String(customName).trim()
  }, c.finalCustomAdd))));
}
function FinalCurrencyControl({
  c,
  currency,
  onCurrencyChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "finalResultCurrency"
  }, /*#__PURE__*/React.createElement("span", null, c.finalCurrency), /*#__PURE__*/React.createElement("div", {
    className: "segmented full"
  }, /*#__PURE__*/React.createElement("button", {
    className: currency === "PLN" ? "active" : "",
    onClick: () => onCurrencyChange("PLN")
  }, "PLN"), /*#__PURE__*/React.createElement("button", {
    className: currency === "EUR" ? "active" : "",
    onClick: () => onCurrencyChange("EUR")
  }, "EUR")));
}
function FinalBalanceResults({
  c,
  lang,
  currency,
  rate,
  calc,
  onCurrencyChange,
  onToggleVat
}) {
  const totalIsNegative = calc.total < 0;
  const totalLabel = totalIsNegative ? c.finalOverpaid : c.finalDue;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    className: "resultCornerLogo",
    src: "./assets/ag-opt.svg",
    alt: "AUTOGOOD"
  }), /*#__PURE__*/React.createElement(FinalCurrencyControl, {
    c: c,
    currency: currency,
    onCurrencyChange: onCurrencyChange
  }), /*#__PURE__*/React.createElement("div", {
    className: "resultsTitle"
  }, /*#__PURE__*/React.createElement("h2", null, /*#__PURE__*/React.createElement(MoneyIcon, null), c.finalBalance)), /*#__PURE__*/React.createElement("div", {
    className: "rows finalRows"
  }, calc.rows.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.key,
    className: "finalResultLine"
  }, /*#__PURE__*/React.createElement("div", {
    className: `resultRow finalResultRow mode-${item.mode}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "rowText"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rowLabel"
  }, item.label[lang])), /*#__PURE__*/React.createElement("div", {
    className: "rowValue finalRowValue"
  }, /*#__PURE__*/React.createElement("strong", null, finalSignedAmountLabel(item, currency)), /*#__PURE__*/React.createElement("span", {
    className: "finalVatSlot"
  }, item.vatAdded && tagLabel("+VAT 23%")))), item.mode === "plus" && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `finalVatToggle ${item.vatAdded ? "active" : ""}`,
    onClick: () => onToggleVat(item.key),
    title: c.finalVatToggle
  }, item.vatAdded ? "−" : "+")))), /*#__PURE__*/React.createElement("div", {
    className: `totalBox finalTotalBox ${totalIsNegative ? "isOverpaid" : ""}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "totalMarker",
    "aria-hidden": "true"
  }, "="), /*#__PURE__*/React.createElement("div", {
    className: "totalLabel"
  }, /*#__PURE__*/React.createElement("span", null, totalLabel)), /*#__PURE__*/React.createElement("div", {
    className: "totalValue"
  }, /*#__PURE__*/React.createElement("strong", null, moneyExact(Math.abs(calc.total), currency)), /*#__PURE__*/React.createElement("em", null, "(", oppositeCurrencyAmount(calc.total, currency, rate), ")")), /*#__PURE__*/React.createElement("div", {
    className: "totalRate"
  }, c.finalRateLine, ": ", calculationRateLabel(n(rate) || DEFAULT_RATE), " PLN")));
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
  const label = tag === "+VAT 23%" ? "+VAT 23%" : tag;
  const className = tag.replace("+", "plus").replace(/\s|%/g, "");
  return /*#__PURE__*/React.createElement("span", {
    className: `tag tag-${className}`
  }, label);
}
function row(label, value, tag, sub, highlight = false, exact = false, valuePrefix = "", totalValue = value, manualMultiplier = 1) {
  return {
    label,
    value,
    tag,
    sub,
    highlight,
    exact,
    valuePrefix,
    totalValue,
    manualMultiplier
  };
}
function commissionFormula(fix, pct, base, discountPart = "") {
  return `${money(fix)} + (${(pct * 100).toFixed(0)}% × ${money(base)})${discountPart}`;
}
function calculate(tabId, values, rate, exciseRate, financed, lang) {
  const t = copy[lang].lines;
  const car = n(values.car);
  const fee = n(values.fee);
  const inspection = n(values.inspection);
  const transport = n(values.transport);
  const discount = n(values.discount);
  const germanCommission = values.germanCommissionEnabled ? n(values.germanCommission) : 0;
  const useRate = rate > 0 ? rate : DEFAULT_RATE;
  const germanCommissionPln = germanCommission * useRate;
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
    const discountText = discount > 0 ? ` + (30% × ${money(discount)})` : "";
    const total = carPln + inspectionBrutto + transportBrutto + excise + commissionBrutto + TO_FEE + DOC_TRANSLATION;
    return {
      total,
      rows: [row(t.directCarBrutto, carPln, "", "", false, false, conversionPrefix(car)), row(t.inspection, inspection, "+VAT 23%", `${money(inspectionBrutto)} brutto`, false, false, "", inspectionBrutto, 1.23), row(t.transport, transport, "+VAT 23%", `${money(transportBrutto)} brutto`, false, false, "", transportBrutto, 1.23), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`), row(t.commission, commissionNetto, "+VAT 23%", commissionFormula(STD_FIX, 0.01, carPln, discountText), false, false, "", commissionBrutto, 1.23), row(t.to, TO_FEE, "", "", false, true), row(t.doc, DOC_TRANSLATION, "", "", false, true)]
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
      rows: [row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)), row(t.auctionFee, feePln, "+VAT 23%", "", false, false, conversionPrefix(fee)), row(t.transport, transPln, "+VAT 23%", `${money(transPln * 1.23)} brutto`), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(base)}`), row(t.commission, commissionNetto, "+VAT 23%", commissionFormula(finFix, finPct, base)), row(t.to, TO_FEE, "", "", false, true), row(t.vat, vat, "", `23% × ${money(vatBase)}`)]
    };
  }
  if (tabId === 2) {
    const carPln = car * useRate;
    const feePln = fee * useRate;
    const feeBrutto = feePln * 1.23;
    const transNetto = transport;
    const transBrutto = transNetto * 1.23;
    const base = carPln + feePln;
    const excise = exciseRate * base;
    const exciseBrutto = excise * 1.23;
    const commissionNetto = finFix + finPct * base;
    const commissionBrutto = commissionNetto * 1.23;
    const total = carPln + feeBrutto + transBrutto + exciseBrutto + commissionBrutto + TO_FEE;
    return {
      total,
      rows: [row(t.car, carPln, "", "", false, false, conversionPrefix(car)), row(t.auctionFee, feePln, "+VAT 23%", `${money(feeBrutto)} brutto`, false, false, conversionPrefix(fee), feeBrutto, 1.23), row(t.transport, transNetto, "+VAT 23%", `${money(transBrutto)} brutto`, false, false, "", transBrutto, 1.23), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(base)}`, false, false, "", exciseBrutto, 1.23), row(t.commission, commissionNetto, "+VAT 23%", commissionFormula(finFix, finPct, base), false, false, "", commissionBrutto, 1.23), row(t.to, TO_FEE, "", "", false, true)]
    };
  }
  if (tabId === 3) {
    const carPln = car * useRate;
    const inspectionBrutto = inspection * 1.23;
    const excise = exciseRate * carPln;
    const bruttoBase = carPln * 1.19;
    const discountPln = discount * useRate;
    const discountCommission = 0.3 * discountPln;
    const commissionNetto = finFix + finPct * bruttoBase + discountCommission;
    const discountText = discount > 0 ? ` + (30% × ${inputCurrencyLabel(discount)})` : "";
    const vatBase = carPln + inspection + transport + excise + commissionNetto;
    const vat = vatBase * VAT;
    const total = vatBase + vat + TO_FEE + germanCommissionPln;
    const rows = [row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)), ...(values.germanCommissionEnabled ? [row(t.germanCommission, germanCommissionPln, "", "", false, false, conversionPrefix(germanCommission))] : []), row(t.inspection, inspection, "+VAT 23%", `${money(inspectionBrutto)} brutto`), row(t.transport, transport, "+VAT 23%", `${money(transport * 1.23)} brutto`), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`), row(t.commission, commissionNetto, "+VAT 23%", commissionFormula(finFix, finPct, bruttoBase, discountText)), row(t.to, TO_FEE, "", "", false, true), row(t.vat, vat, "", `23% × ${money(vatBase)}`)];
    return {
      total,
      rows
    };
  }
  const carPln = car * useRate;
  const inspectionBrutto = inspection * 1.23;
  const transportBrutto = transport * 1.23;
  const excise = exciseRate * carPln;
  const exciseBrutto = excise * 1.23;
  const discountPln = discount * useRate;
  const discountCommission = 0.3 * discountPln;
  const commissionNetto = finFix + finPct * carPln + discountCommission;
  const commissionBrutto = commissionNetto * 1.23;
  const discountText = discount > 0 ? ` + (30% × ${inputCurrencyLabel(discount)})` : "";
  const total = carPln + inspectionBrutto + transportBrutto + exciseBrutto + commissionBrutto + TO_FEE + germanCommissionPln;
  const rows = [row(t.car, carPln, "", "", false, false, conversionPrefix(car)), ...(values.germanCommissionEnabled ? [row(t.germanCommission, germanCommissionPln, "", "", false, false, conversionPrefix(germanCommission))] : []), row(t.inspection, inspection, "+VAT 23%", `${money(inspectionBrutto)} brutto`, false, false, "", inspectionBrutto, 1.23), row(t.transport, transport, "+VAT 23%", `${money(transportBrutto)} brutto`, false, false, "", transportBrutto, 1.23), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`, false, false, "", exciseBrutto, 1.23), row(t.commission, commissionNetto, "+VAT 23%", commissionFormula(finFix, finPct, carPln, discountText), false, false, "", commissionBrutto, 1.23), row(t.to, TO_FEE, "", "", false, true)];
  return {
    total,
    rows
  };
}
function printCalculation({
  lang,
  tab,
  title,
  rows,
  total,
  rate,
  financed,
  hasGermanCommission
}) {
  const c = copy[lang];
  const calculationTitle = title || calculatorName(tab, lang, financed);
  const roundedTotal = roundedCurrencyValue(total, "PLN");
  const logoUrl = new URL("./assets/autogood-logo.png", window.location.href).href;
  const homeUrl = new URL("./", window.location.href).href;
  const rowsHtml = rows.map((item, index) => {
    const displayTag = item.tag === "+VAT 23%" ? "+VAT 23%" : item.tag;
    return `
        <tr class="${item.highlight ? "vat" : ""} ${index === 0 ? "mainRow" : ""}">
          <td>
            <strong>${item.label}</strong>
            ${item.sub ? `<small>${item.sub}</small>` : ""}
          </td>
          <td>
            <div class="amount">
              <em class="${item.valuePrefix ? "" : "isEmpty"}">${item.valuePrefix || "0 EUR ="}</em>
              <b>${item.exact ? moneyExact(item.value) : money(item.value)}</b>
              ${displayTag ? `<span class="${item.tag === "+VAT 23%" ? "softVatTag" : ""}">${displayTag}</span>` : ""}
            </div>
          </td>
        </tr>`;
  }).join("");
  const processSteps = getProcessSteps(tab, lang, financed, hasGermanCommission);
  const processHtml = processSteps.map((step, index) => `${index > 0 ? '<span class="processArrow"> → </span>' : ""}<span class="processStep">${highlightedHtml(step)}</span>`).join("");
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
    .amount span{display:inline-flex;align-items:center;justify-self:start;width:max-content;max-width:max-content;line-height:1;white-space:nowrap}
    .softVatTag{color:#64748b;background:#f1f5f9;font-size:8.5px;letter-spacing:.03em}
    .amount{display:grid;grid-template-columns:92px max-content auto;justify-content:end;align-items:center;column-gap:4px}
    .amount em{font-style:normal;color:#64748b;font-weight:800;text-align:right}
    .amount em.isEmpty{visibility:hidden}
    .amount b{font-size:17px}
    .mainRow td{padding-top:14px;padding-bottom:14px;border-color:#cbd8e6;background:#f8fbfd}
    .mainRow strong{font-size:18px;color:#005B82}
    .mainRow .amount b{font-size:21px;color:#005B82}
    .vat td{background:#fff}
    .total{position:relative;z-index:1;display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px 22px;margin-top:18px;padding:22px 24px 18px;border:3px solid #005B82;border-radius:14px;background:#005B82;color:#fff}
    .totalLabel{font-size:24px;font-weight:900;text-align:left}
    .total b{display:block;margin:0;color:#fff;font-size:48px;line-height:1;font-weight:900;letter-spacing:0}
    .totalAmount{color:#fff;font-size:22px;font-weight:900;text-align:right}
    .totalAmount div{margin-top:4px}
    .totalRate{grid-column:1/-1;text-align:right;font-style:italic;color:rgba(255,255,255,.82);font-size:13px;padding-right:22px}
    .deliveryRoad{position:relative;z-index:1;width:100%;height:46px;margin:8px 0 2px;color:#005B82}
    .deliveryRoad:before{content:"";position:absolute;left:16px;right:16px;top:17px;border-top:1px dashed #94a3b8}
    .processFlow{position:relative;z-index:1;display:flex;align-items:center;flex-wrap:wrap;gap:6px;border:1px solid #dbe4ee;border-radius:9px;margin-top:14px;padding:10px 12px;background:#f8fbfd;color:#475569;font-size:13.5px;font-style:italic}
    .processStep{display:inline-block;white-space:nowrap}
    .processStep strong{color:#102033;font-weight:900}
    .processArrow{color:#005B82;opacity:.52;font-size:18px;font-style:normal;font-weight:900;letter-spacing:.5px;white-space:pre}
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
        <h1>${c.results} — ${calculationTitle}</h1>
      </div>
    </header>
    <div class="accentGrid"><div class="accent"></div><div class="accent"></div><div class="accent"></div></div>
    <table>${rowsHtml}</table>
    <div class="total"><div class="totalLabel">${c.total}</div><div class="totalAmount"><b>${money(total)}</b><div>${money(roundedTotal / rate, "EUR")}</div></div><div class="totalRate">${c.rateLine}: ${calculationRateLabel(rate)} PLN</div></div>
    <div class="deliveryRoad"></div>
    <div class="processFlow">${processHtml}</div>
    <div class="footerMark">AG</div>
  </main>
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
function printFinalBalance({
  lang,
  rows,
  total,
  currency,
  rate
}) {
  const c = copy[lang];
  const logoUrl = new URL("./assets/autogood-logo.png", window.location.href).href;
  const homeUrl = new URL("./", window.location.href).href;
  const totalIsNegative = total < 0;
  const rowsHtml = rows.map(item => `
      <tr class="${item.mode === "minus" ? "minusRow" : ""}">
        <td><strong>${item.label[lang]}</strong></td>
        <td><b>${finalSignedAmountLabel(item, currency)}</b>${item.vatAdded ? '<span class="softVatTag">+VAT 23%</span>' : ""}</td>
      </tr>`).join("");
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
    header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:20px;padding-bottom:18px;border-bottom:2px solid #dbe4ee}
    .printLogo{display:block;width:250px;height:auto}
    h1{margin:0;color:#005B82;font-size:30px;line-height:1;font-weight:800;text-align:right}
    table{width:100%;border-collapse:separate;border-spacing:0 7px;margin-top:4px}
    td{background:#fff;border-top:1px solid #dbe4ee;border-bottom:1px solid #dbe4ee;padding:12px 14px;vertical-align:middle}
    td:first-child{border-left:1px solid #dbe4ee;border-radius:8px 0 0 8px}
    td:last-child{width:260px;border-right:1px solid #dbe4ee;border-radius:0 8px 8px 0;text-align:right;white-space:nowrap}
    .minusRow td{background:#f8fbfd}
    .minusRow b{color:#0f766e}
    .softVatTag{display:inline-flex;margin-left:8px;border-radius:999px;padding:3px 7px;color:#64748b;background:#f1f5f9;font-size:8.5px;font-weight:900;letter-spacing:.03em;vertical-align:middle}
    .total{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px 22px;margin-top:18px;padding:22px 24px 18px;border-radius:14px;background:#005B82;color:#fff}
    .total.overpaid{background:#0f766e}
    .totalLabel{font-size:24px;font-weight:900;text-align:left}
    .total b{display:block;margin:0;color:#fff;font-size:48px;line-height:1;font-weight:900}
    .totalRate{grid-column:1/-1;text-align:right;font-style:italic;color:rgba(255,255,255,.82);font-size:13px}
    .footerMark{position:absolute;left:34px;bottom:20px;color:rgba(0,91,130,.12);font-size:78px;font-weight:900;letter-spacing:3px;line-height:1}
  </style>
</head>
<body>
  <main class="page">
    <header>
      <a href="${homeUrl}" target="_blank" rel="noopener"><img class="printLogo" src="${logoUrl}" alt="AUTOGOOD" /></a>
      <h1>${c.finalBalance}</h1>
    </header>
    <table>${rowsHtml}</table>
    <div class="total ${totalIsNegative ? "overpaid" : ""}">
      <div class="totalLabel">${totalIsNegative ? c.finalOverpaid : c.finalDue}</div>
      <div><b>${moneyExact(Math.abs(total), currency)}</b></div>
      <div class="totalRate">${c.finalRateLine}: ${calculationRateLabel(rate)} PLN</div>
    </div>
    <div class="footerMark">AG</div>
  </main>
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
function canvasToBlob(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), "image/png", 1);
  });
}
async function waitForCaptureAssets(root) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(images.map(image => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    if (image.decode) return image.decode().catch(() => undefined);
    return new Promise(resolve => {
      image.addEventListener("load", resolve, {
        once: true
      });
      image.addEventListener("error", resolve, {
        once: true
      });
    });
  }));
}
function App() {
  const [lang, setLang] = useState("pl");
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
  const [history, setHistory] = useState(() => readHistory());
  const [finalHistory, setFinalHistory] = useState(() => readHistory(FINAL_HISTORY_KEY));
  const [finalCurrency, setFinalCurrency] = useState("PLN");
  const [finalItems, setFinalItems] = useState(() => initialFinalItems("PLN", DEFAULT_RATE));
  const [finalCustomName, setFinalCustomName] = useState("");
  const [manualOverrides, setManualOverrides] = useState({});
  const [editingOverride, setEditingOverride] = useState("");
  const resultsRef = useRef(null);
  const rateTouchedRef = useRef(false);
  const safeLang = lang || "pl";
  const c = copy[safeLang];
  const tab = tabs[activeTab];
  const isFinalBalance = activeTab === FINAL_TAB_ID;
  const exciseRate = engineTypes[engineIndex]?.rate ?? 0;
  const baseCalc = useMemo(() => calculate(activeTab, values, n(rate), exciseRate, financed, safeLang), [activeTab, values, rate, exciseRate, financed, safeLang]);
  const calc = useMemo(() => applyManualOverrides(baseCalc, manualOverrides, activeTab), [baseCalc, manualOverrides, activeTab]);
  const finalCalc = useMemo(() => calculateFinalBalance(finalItems), [finalItems]);
  const roundedTotal = roundedCurrencyValue(calc.total, "PLN");
  const activeTabName = calculatorName(tab, safeLang, activeTab > 0 && financed);
  const hasGermanCommission = (activeTab === 3 || activeTab === 4) && Boolean(values.germanCommissionEnabled);
  const processSteps = getProcessSteps(tab, safeLang, financed, hasGermanCommission);
  const visibleHistory = isFinalBalance ? finalHistory : history;
  const avgRateLabel = formatAvgRate(Number(marketRates?.rates?.EUR_PLN?.value));
  const rateDate = new Intl.DateTimeFormat(safeLang === "ru" ? "ru-RU" : "pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(marketRates?.effectiveDate ? new Date(marketRates.effectiveDate) : new Date());
  useEffect(() => {
    let isMounted = true;
    loadExchangeRates().then(data => {
      if (!isMounted) return;
      setMarketRates(data);
      setRatesStatus("ready");
      const nextRate = Number(data?.rates?.EUR_PLN?.value);
      if (Number.isFinite(nextRate) && nextRate > 0 && !rateTouchedRef.current) {
        setRate(calculationRateLabel(rateWithCalculationMargin(nextRate)));
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
    setManualOverrides({});
    setEditingOverride("");
  };
  const clearManualOverrides = () => {
    setManualOverrides({});
    setEditingOverride("");
  };
  const setField = (key, value) => {
    clearManualOverrides();
    setValues(current => ({
      ...current,
      [key]: value
    }));
  };
  const setManualRate = value => {
    rateTouchedRef.current = true;
    clearManualOverrides();
    setRate(value);
  };
  const switchFinalCurrency = currency => {
    if (currency === finalCurrency) return;
    const safeRate = n(rate) || DEFAULT_RATE;
    setFinalItems(current => current.map(item => {
      const converted = convertFinalAmount(item.amount, finalCurrency, currency, safeRate);
      return {
        ...item,
        amount: finalInputValue(converted, currency)
      };
    }));
    setFinalCurrency(currency);
  };
  const setFinalAmount = (key, amount) => {
    setFinalItems(current => current.map(item => item.key === key ? {
      ...item,
      amount
    } : item));
  };
  const setFinalMode = (key, mode) => {
    setFinalItems(current => current.map(item => item.key === key ? {
      ...item,
      mode,
      activeMode: mode,
      vatAdded: mode === "plus" ? item.vatAdded : false
    } : item));
  };
  const toggleFinalOff = key => {
    setFinalItems(current => current.map(item => item.key === key ? {
      ...item,
      mode: item.mode === "off" ? item.activeMode || "plus" : "off"
    } : item));
  };
  const toggleFinalVat = key => {
    setFinalItems(current => current.map(item => item.key === key && item.mode === "plus" ? {
      ...item,
      vatAdded: !item.vatAdded
    } : item));
  };
  const addCustomFinalItem = () => {
    const label = finalCustomName.trim();
    if (!label) return;
    setFinalItems(current => [customFinalItem(label, finalCurrency), ...current]);
    setFinalCustomName("");
  };
  const deleteCustomFinalItem = key => {
    setFinalItems(current => current.filter(item => item.key !== key || !item.isCustom));
  };
  const setManualOverride = (key, value) => {
    setManualOverrides(current => {
      if (String(value).trim() === "") {
        const next = {
          ...current
        };
        delete next[key];
        return next;
      }
      return {
        ...current,
        [key]: value
      };
    });
  };
  const startManualOverride = (key, item) => {
    setManualOverrides(current => Object.prototype.hasOwnProperty.call(current, key) ? current : {
      ...current,
      [key]: rowEditValue(item)
    });
    setEditingOverride(key);
  };
  const saveCalculation = () => {
    if (isFinalBalance) {
      if (!hasFinalInput(finalItems)) {
        setScreenshotStatus("saveEmpty");
        return;
      }
      const item = {
        id: `${Date.now()}-final`,
        type: "final",
        savedAt: new Date().toISOString(),
        lang: safeLang,
        finalCurrency,
        rate: calculationRateLabel(n(rate) || DEFAULT_RATE),
        items: finalItems,
        total: finalCalc.total,
        title: c.finalBalance
      };
      const signature = finalHistorySignature(item);
      setFinalHistory(current => {
        const next = [item, ...current.filter(saved => finalHistorySignature(saved) !== signature)].slice(0, HISTORY_LIMIT);
        writeHistory(next, FINAL_HISTORY_KEY);
        return next;
      });
      setScreenshotStatus("saved");
      return;
    }
    if (!hasCalculationInput(values)) {
      setScreenshotStatus("saveEmpty");
      return;
    }
    const item = {
      id: `${Date.now()}-${activeTab}`,
      savedAt: new Date().toISOString(),
      lang: safeLang,
      activeTab,
      rate: calculationRateLabel(n(rate) || DEFAULT_RATE),
      engineIndex,
      financed: activeTab > 0 && financed,
      values: normalizeHistoryValues(values),
      manualOverrides,
      total: calc.total,
      title: activeTabName
    };
    const signature = historySignature(item);
    setHistory(current => {
      const next = [item, ...current.filter(saved => historySignature(saved) !== signature)].slice(0, HISTORY_LIMIT);
      writeHistory(next);
      return next;
    });
    setScreenshotStatus("saved");
  };
  const restoreHistoryItem = item => {
    if (item.type === "final") {
      setLang(item.lang === "ru" ? "ru" : "pl");
      setActiveTab(FINAL_TAB_ID);
      setFinalCurrency(item.finalCurrency === "EUR" ? "EUR" : "PLN");
      setFinalItems(Array.isArray(item.items) && item.items.length ? item.items.map(normalizeFinalItem) : initialFinalItems(item.finalCurrency || "PLN", n(rate) || DEFAULT_RATE));
      setRate(item.rate || DEFAULT_RATE);
      rateTouchedRef.current = true;
      setMobileDeUrl("");
      setMobileDeStatus("");
      setMobileDeSummary("");
      return;
    }
    const nextTab = tabs[item.activeTab] ? item.activeTab : 0;
    setLang(item.lang === "ru" ? "ru" : "pl");
    setActiveTab(nextTab);
    setValues(item.values && typeof item.values === "object" ? item.values : {});
    setManualOverrides(item.manualOverrides && typeof item.manualOverrides === "object" ? item.manualOverrides : {});
    setEditingOverride("");
    setRate(item.rate || DEFAULT_RATE);
    rateTouchedRef.current = true;
    setEngineIndex(Number.isInteger(item.engineIndex) && engineTypes[item.engineIndex] ? item.engineIndex : 3);
    setFinanced(nextTab > 0 && Boolean(item.financed));
    setMobileDeUrl("");
    setMobileDeStatus("");
    setMobileDeSummary("");
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
      const transportNettoPln = Number(data?.transportNettoPln);
      const nextEngineIndex = Number(data?.engineTypeIndex);
      if (Number.isFinite(carBruttoEur) && carBruttoEur > 0) {
        setField("car", String(Math.round(carBruttoEur)));
      }
      if (Number.isFinite(transportNettoPln) && transportNettoPln > 0) {
        setField("transport", String(Math.round(transportNettoPln)));
      }
      if (Number.isInteger(nextEngineIndex) && engineTypes[nextEngineIndex]) {
        setEngineIndex(nextEngineIndex);
      }
      const summaryParts = [];
      if (data?.title) summaryParts.push(data.title);
      if (Number.isFinite(carBruttoEur) && carBruttoEur > 0) summaryParts.push(formatPlainAmount(carBruttoEur, "EUR"));
      if (data?.fuel) summaryParts.push(data.fuel);
      if (data?.bodyType) summaryParts.push(data.bodyType);
      if (data?.displacementCcm) summaryParts.push(`${data.displacementCcm} cm³`);
      if (data?.engineTypeLabel) summaryParts.push(data.engineTypeLabel);
      if (Number.isFinite(transportNettoPln) && transportNettoPln > 0) {
        summaryParts.push(`${formatPlainAmount(transportNettoPln, "PLN")} transport netto`);
      }
      if (data?.mileageKm) summaryParts.push(`${data.mileageKm.toLocaleString("pl-PL")} km`);
      if (data?.firstRegistration) summaryParts.push(data.firstRegistration);
      if (data?.location?.city || data?.location?.address) {
        summaryParts.push(data.location.address || data.location.city);
      }
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
      await waitForCaptureAssets(resultsRef.current);
      const rect = resultsRef.current.getBoundingClientRect();
      const canvas = await window.html2canvas(resultsRef.current, {
        backgroundColor: "#ffffff",
        width: rect.width,
        height: rect.height,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        scale: Math.min(2, window.devicePixelRatio || 1),
        useCORS: true
      });
      const blob = await canvasToBlob(canvas);
      if (!blob) throw new Error("Image was not created");
      if (navigator.clipboard?.write && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({
          "image/png": blob
        })]);
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
  return /*#__PURE__*/React.createElement("main", {
    className: `appShell ${isFinalBalance ? "appShellFinal" : ""}`
  }, /*#__PURE__*/React.createElement("header", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logoGroup"
  }, /*#__PURE__*/React.createElement("a", {
    className: "logoLink",
    href: "./",
    "aria-label": "AUTOGOOD home"
  }, /*#__PURE__*/React.createElement("img", {
    className: "logoMark",
    src: "./assets/autogood-logo.png",
    alt: "AUTOGOOD"
  })), /*#__PURE__*/React.createElement("span", {
    className: "logoDivider",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "logoTitle"
  }, c.navTitle)), /*#__PURE__*/React.createElement("div", {
    className: "headerActions"
  }, /*#__PURE__*/React.createElement(RateWidget, {
    c: c,
    avgRateLabel: avgRateLabel,
    rateDate: rateDate,
    value: rate,
    onChange: setManualRate
  }), /*#__PURE__*/React.createElement("div", {
    className: "langSwitch",
    "aria-label": "Language"
  }, /*#__PURE__*/React.createElement("button", {
    className: lang === "pl" ? "active" : "",
    onClick: () => setLang("pl")
  }, "PL"), /*#__PURE__*/React.createElement("button", {
    className: lang === "ru" ? "active" : "",
    onClick: () => setLang("ru")
  }, "RU")), /*#__PURE__*/React.createElement("button", {
    className: "printBtn",
    onClick: () => isFinalBalance ? printFinalBalance({
      lang: safeLang,
      rows: finalCalc.rows,
      total: finalCalc.total,
      currency: finalCurrency,
      rate: n(rate) || DEFAULT_RATE
    }) : printCalculation({
      lang: safeLang,
      tab,
      title: activeTabName,
      rows: calc.rows,
      total: calc.total,
      rate: n(rate) || DEFAULT_RATE,
      financed,
      hasGermanCommission
    })
  }, c.print), /*#__PURE__*/React.createElement("button", {
    className: "printBtn screenshotBtn",
    onClick: copyScreenshot
  }, c.screenshot), /*#__PURE__*/React.createElement("button", {
    className: "printBtn saveBtn",
    onClick: saveCalculation
  }, c.saveCalculation))), /*#__PURE__*/React.createElement("nav", {
    className: "tabs",
    "aria-label": "Calculators"
  }, tabs.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    className: item.id === activeTab ? "active" : "",
    onClick: () => switchTab(item.id)
  }, calculatorName(item, safeLang, item.id === activeTab && item.id > 0 && financed)))), /*#__PURE__*/React.createElement("section", {
    className: `grid ${isFinalBalance ? "finalGrid" : ""}`
  }, /*#__PURE__*/React.createElement("aside", {
    className: isFinalBalance ? "card sidebar finalSidebar" : "panelData"
  }, isFinalBalance ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", null, c.inputs), /*#__PURE__*/React.createElement(FinalBalanceInputs, {
    c: c,
    lang: safeLang,
    currency: finalCurrency,
    items: finalItems,
    customName: finalCustomName,
    onCustomNameChange: setFinalCustomName,
    onAddCustom: addCustomFinalItem,
    onAmountChange: setFinalAmount,
    onModeChange: setFinalMode,
    onOffToggle: toggleFinalOff,
    onDeleteCustom: deleteCustomFinalItem
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    className: "panelEyebrow"
  }, c.inputs), activeTab === 0 && /*#__PURE__*/React.createElement(MobileDeImport, {
    c: c,
    url: mobileDeUrl,
    status: mobileDeStatus,
    summary: mobileDeSummary,
    onUrlChange: setMobileDeUrl,
    onImport: loadMobileDeData
  }), activeTab > 0 && /*#__PURE__*/React.createElement("div", {
    className: "toggleBlock"
  }, /*#__PURE__*/React.createElement("span", null, c.commissionType), /*#__PURE__*/React.createElement("div", {
    className: "commissionSegment"
  }, /*#__PURE__*/React.createElement("button", {
    className: !financed ? "active" : "",
    onClick: () => {
      clearManualOverrides();
      setFinanced(false);
    }
  }, c.standard), /*#__PURE__*/React.createElement("button", {
    className: financed ? "active" : "",
    onClick: () => {
      clearManualOverrides();
      setFinanced(true);
    }
  }, c.financing))), /*#__PURE__*/React.createElement("label", {
    className: "field"
  }, /*#__PURE__*/React.createElement("span", null, c.engine), /*#__PURE__*/React.createElement("select", {
    value: engineIndex,
    onChange: event => {
      clearManualOverrides();
      setEngineIndex(Number(event.target.value));
    }
  }, engineTypes.map((engine, index) => /*#__PURE__*/React.createElement("option", {
    key: engine.label,
    value: index
  }, engine.label, " \u2014 ", percentLabel(engine.rate))))), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), tab.fields.map(field => field.optional ? /*#__PURE__*/React.createElement(OptionalAmountInput, {
    key: field.key,
    label: field.label[lang],
    checked: Boolean(values[`${field.key}Enabled`]),
    value: values[field.key] || "",
    onToggle: checked => setField(`${field.key}Enabled`, checked),
    onChange: value => setField(field.key, value),
    suffix: field.currency
  }) : /*#__PURE__*/React.createElement(NumInput, {
    key: field.key,
    label: field.label[lang],
    value: values[field.key] || "",
    onChange: value => setField(field.key, value),
    suffix: field.currency
  })))), /*#__PURE__*/React.createElement("section", {
    className: isFinalBalance ? "card results finalResults" : "panelCalc",
    ref: resultsRef
  }, isFinalBalance ? /*#__PURE__*/React.createElement(FinalBalanceResults, {
    c: c,
    lang: safeLang,
    currency: finalCurrency,
    rate: n(rate) || DEFAULT_RATE,
    calc: finalCalc,
    onCurrencyChange: switchFinalCurrency,
    onToggleVat: toggleFinalVat
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    className: "calcEyebrow"
  }, c.results, " \u2014 ", activeTabName), /*#__PURE__*/React.createElement("div", {
    className: "resultsList"
  }, calc.rows.map((item, index) => {
    const overrideKey = rowOverrideKey(activeTab, index);
    const isEditing = editingOverride === overrideKey;
    const isPrimary = index === 0;
    return /*#__PURE__*/React.createElement("div", {
      key: `${item.label}-${index}`,
      className: `resultLine ${isPrimary ? "isPrimaryLine" : ""}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "resultLineMarker",
      "aria-hidden": "true"
    }, isPrimary ? "" : "+"), /*#__PURE__*/React.createElement("div", {
      className: "resultLineBody"
    }, /*#__PURE__*/React.createElement("span", {
      className: "resultLineLabel"
    }, item.label), item.sub && /*#__PURE__*/React.createElement("div", {
      className: "resultLineSub"
    }, item.sub)), /*#__PURE__*/React.createElement("span", {
      className: "resultLinePrefix"
    }, item.valuePrefix), isEditing ? /*#__PURE__*/React.createElement("input", {
      className: "resultLineAmount resultLineAmountInput",
      autoFocus: true,
      inputMode: "decimal",
      type: "text",
      value: manualOverrides[overrideKey] ?? rowEditValue(item),
      onChange: event => setManualOverride(overrideKey, event.target.value),
      onBlur: () => setEditingOverride(""),
      onKeyDown: event => {
        if (event.key === "Enter" || event.key === "Escape") {
          event.currentTarget.blur();
        }
      }
    }) : /*#__PURE__*/React.createElement("strong", {
      className: "resultLineAmount resultLineAmountEdit",
      role: "button",
      tabIndex: 0,
      onClick: () => startManualOverride(overrideKey, item),
      onKeyDown: event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startManualOverride(overrideKey, item);
        }
      }
    }, item.exact ? moneyExact(item.value) : money(item.value)), /*#__PURE__*/React.createElement("span", {
      className: "resultLineTag"
    }, item.tag));
  })), /*#__PURE__*/React.createElement("div", {
    className: "totalBar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "totalBarLeft"
  }, /*#__PURE__*/React.createElement("span", {
    className: "totalBarMark",
    "aria-hidden": "true"
  }, "="), /*#__PURE__*/React.createElement("span", {
    className: "totalBarLabel"
  }, c.total)), /*#__PURE__*/React.createElement("div", {
    className: "totalBarRight"
  }, /*#__PURE__*/React.createElement("div", {
    className: "totalBarValueRow"
  }, /*#__PURE__*/React.createElement("strong", {
    className: "totalBarValue"
  }, money(calc.total)), /*#__PURE__*/React.createElement("em", {
    className: "totalBarEur"
  }, "= ", money(roundedTotal / (n(rate) || DEFAULT_RATE), "EUR"))), /*#__PURE__*/React.createElement("div", {
    className: "totalBarRate"
  }, c.rateLine, ": ", calculationRateLabel(n(rate) || DEFAULT_RATE), " PLN"))), /*#__PURE__*/React.createElement(ProcessFlow, {
    steps: processSteps
  }))), /*#__PURE__*/React.createElement(HistoryPanel, {
    c: c,
    history: visibleHistory,
    lang: safeLang,
    onRestore: restoreHistoryItem,
    emptyText: isFinalBalance ? c.finalHistoryEmpty : c.historyEmpty
  })), screenshotStatus && /*#__PURE__*/React.createElement("div", {
    className: `toast ${screenshotStatus}`
  }, screenshotStatus === "ready" && c.screenshotReady, screenshotStatus === "opened" && c.screenshotOpened, screenshotStatus === "error" && c.screenshotError, screenshotStatus === "saved" && c.saveCalculationReady, screenshotStatus === "saveEmpty" && c.saveCalculationEmpty));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));