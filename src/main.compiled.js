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
const REGISTRATION_NETTO = 580;
const STD_FIX = 1829.27;
const FIN_FIX = 2642.28;
const RATES_URL = "./data/exchange-rates.json";
const WALUTOMAT_API_URL = "https://api.walutomat.pl/api/v2.0.0/market_fx/best_offers";
const DEFAULT_MOBILEDE_API_URL = "https://albuquerque-junior-favourites-assist.trycloudflare.com/mobilede/import";
const readMobileDeApiUrl = () => {
  const configuredUrl = window.AUTOGOOD_MOBILEDE_API_URL;
  const params = new URLSearchParams(window.location.search);
  const queryUrl = params.get("mobiledeApi");
  return configuredUrl || queryUrl || DEFAULT_MOBILEDE_API_URL;
};
const MOBILEDE_API_URL = readMobileDeApiUrl();
// Tabs that offer the Mobile.de listing import: direct purchase plus both dealer calculators.
const MOBILEDE_TABS = [0, 3, 4];
const HISTORY_KEY = "autogood-calculation-history";
const FINAL_HISTORY_KEY = "autogood-final-balance-history";
const HISTORY_LIMIT = 8;
const FINAL_TAB_ID = 5;
const SCREENSHOT_EDGE_PADDING = 2;
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
    directCommission: "Bezpośrednio",
    inputs: "Dane",
    results: "Kalkulacja",
    total: "Razem",
    totalJoin: "lub",
    rateLine: "Przeliczono po kursie",
    historyTitle: "Historia zmian",
    historyEmpty: "Tutaj pojawi się 8 ostatnich kalkulacji.",
    historyRestore: "Przywróć kalkulację",
    historyDelete: "Usuń z historii",
    finalHistoryEmpty: "Tutaj pojawi się 8 ostatnich rozliczeń.",
    finalBalance: "Rozliczenie końcowe",
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
    mobileImportNoNetto: "W ogłoszeniu nie ma ceny netto (VAT niewyodrębniony) — wpisz „Cena pojazdu netto” ręcznie.",
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
      registration: "Rejestracja",
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
    directCommission: "Напрямую",
    inputs: "Данные",
    results: "Расчёт",
    total: "Итого",
    totalJoin: "или",
    rateLine: "Расчёт по курсу",
    historyTitle: "История изменений",
    historyEmpty: "Здесь появятся 8 последних расчётов.",
    historyRestore: "Вернуть расчёт",
    historyDelete: "Удалить из истории",
    finalHistoryEmpty: "Здесь появятся 8 последних финальных расчётов.",
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
    mobileImportNoNetto: "В объявлении нет цены netto (НДС не выделен) — впиши «Цена авто netto» вручную.",
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
      registration: "Регистрация",
      directCarBrutto: "Цена автомобиля brutto",
      germanCommission: "Комиссия немецкой фирмы"
    }
  },
  en: {
    appTitle: "AUTOGOOD Calculators",
    navTitle: "Calculators",
    print: "Print / PDF",
    screenshot: "Copy image",
    screenshotReady: "Image copied.",
    screenshotOpened: "Image opened in a new tab.",
    screenshotError: "Unable to copy the image.",
    saveCalculation: "Save calculation",
    saveCalculationReady: "Calculation saved.",
    saveCalculationEmpty: "Enter calculation data first.",
    exchange: "EUR/PLN exchange rate",
    avgRate: "Average rate",
    engine: "Engine type",
    commissionType: "Commission type",
    standard: "Standard",
    financing: "Financing",
    directCommission: "Direct",
    inputs: "Inputs",
    results: "Calculation",
    total: "Total",
    totalJoin: "or",
    rateLine: "Calculated at the rate",
    historyTitle: "History",
    historyEmpty: "Your last 8 calculations will appear here.",
    historyRestore: "Restore calculation",
    historyDelete: "Remove from history",
    finalHistoryEmpty: "Your last 8 final settlements will appear here.",
    finalBalance: "Final settlement",
    finalCurrency: "Settlement currency",
    finalFixedCosts: "Active items",
    finalExtras: "Inactive items",
    finalAddExtra: "Add",
    finalRemove: "Remove",
    finalModePlus: "To pay",
    finalModeMinus: "Paid / deduct",
    finalModeOff: "Do not include",
    finalDue: "Amount due",
    finalOverpaid: "Overpayment / refund due",
    finalRateLine: "EUR/PLN exchange rate",
    finalCustomTitle: "Add a custom cost",
    finalCustomPlaceholder: "Cost name",
    finalCustomAdd: "Add cost",
    finalCustomDelete: "Remove item",
    finalVatToggle: "Add VAT 23%",
    mobileImportTitle: "Mobile.de link",
    mobileImportPlaceholder: "Paste the listing link",
    mobileImportButton: "Load data",
    mobileImportLoading: "Loading data...",
    mobileImportReady: "Data filled in: gross price, engine, excise duty and listing data.",
    mobileImportError: "Unable to load data. Check the link or backend.",
    mobileImportFound: "Found",
    mobileImportNoNetto: "The listing has no net price (VAT is not shown separately) - enter \"Vehicle price net\" manually.",
    errorTitle: "Something went wrong.",
    errorBody: "Refresh the page and try again.",
    selectPlaceholder: "Select engine type",
    lines: {
      car: "Vehicle price",
      carNetto: "Vehicle price net",
      carBrutto: "Vehicle price gross",
      inspection: "Specialist inspection",
      transport: "Transport by car carrier",
      auctionFee: "Auction fee",
      excise: "Excise duty",
      commission: "AUTOGOOD commission",
      vat: "VAT 23%",
      to: "Technical inspection",
      doc: "Document translation",
      registration: "Registration",
      directCarBrutto: "Vehicle price gross",
      germanCommission: "German company commission"
    }
  }
};
const engineTypes = [{
  label: {
    pl: "EL / PHEV <=2000cm³",
    ru: "Электро / PHEV <=2000см³",
    en: "Electric / PHEV <=2000cc"
  },
  rate: 0
}, {
  label: {
    pl: "PHEV / HEV >2000cm³",
    ru: "PHEV / HEV >2000см³",
    en: "PHEV / HEV >2000cc"
  },
  rate: 0.093
}, {
  label: {
    pl: "HEV <=2000cm³",
    ru: "HEV <=2000см³",
    en: "HEV <=2000cc"
  },
  rate: 0.0155
}, {
  label: {
    pl: "Spalinowy <=2000cm³",
    ru: "ДВС <=2000см³",
    en: "Combustion <=2000cc"
  },
  rate: 0.031
}, {
  label: {
    pl: "Spalinowy >2000cm³",
    ru: "ДВС >2000см³",
    en: "Combustion >2000cc"
  },
  rate: 0.186
}];
const tabs = [{
  id: 0,
  name: {
    pl: "Zakup bezpośredni",
    ru: "Прямая покупка",
    en: "Direct purchase"
  },
  subtitle: {
    pl: "Klient płaci dealerowi bezpośrednio. VAT Marża.",
    ru: "Клиент платит дилеру напрямую. VAT Marża.",
    en: "The client pays the dealer directly. VAT Margin."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu",
      ru: "Цена автомобиля",
      en: "Vehicle price"
    },
    currency: "EUR"
  }, {
    key: "inspection",
    label: {
      pl: "Oględziny specjalisty netto",
      ru: "Инспекция специалиста netto",
      en: "Specialist inspection net"
    },
    currency: "PLN"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto",
      en: "Transport by car carrier net"
    },
    currency: "PLN"
  }, {
    key: "discount",
    label: {
      pl: "Rabat",
      ru: "Скидка",
      en: "Discount"
    },
    currency: "EUR"
  }]
}, {
  id: 1,
  name: {
    pl: "Aukcje VAT 23%",
    ru: "Аукционы VAT 23%",
    en: "Auctions VAT 23%"
  },
  subtitle: {
    pl: "Aukcja zagraniczna. Wszystkie wartości netto, VAT na końcu.",
    ru: "Зарубежный аукцион. Все значения netto, VAT в конце.",
    en: "Foreign auction. All values are net, VAT is added at the end."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu netto",
      ru: "Цена авто netto",
      en: "Vehicle price net"
    },
    currency: "EUR"
  }, {
    key: "fee",
    label: {
      pl: "Opłata aukcyjna netto",
      ru: "Аукционный сбор netto",
      en: "Auction fee net"
    },
    currency: "EUR"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto",
      en: "Transport by car carrier net"
    },
    currency: "PLN"
  }]
}, {
  id: 2,
  name: {
    pl: "Aukcje VAT Marża",
    ru: "Аукционы VAT Маржа",
    en: "Auctions VAT Margin"
  },
  subtitle: {
    pl: "Aukcja zagraniczna. Pojazd brutto, transport netto + VAT.",
    ru: "Зарубежный аукцион. Авто brutto, транспорт netto + VAT.",
    en: "Foreign auction. Vehicle gross, transport net plus VAT."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu",
      ru: "Цена автомобиля",
      en: "Vehicle price"
    },
    currency: "EUR"
  }, {
    key: "fee",
    label: {
      pl: "Opłata aukcyjna",
      ru: "Аукционный сбор",
      en: "Auction fee"
    },
    currency: "EUR"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto",
      en: "Transport by car carrier net"
    },
    currency: "PLN"
  }]
}, {
  id: 3,
  name: {
    pl: "Dealerzy VAT 23%",
    ru: "Дилеры VAT 23%",
    en: "Dealers VAT 23%"
  },
  subtitle: {
    pl: "Dealer zagraniczny przez AUTOGOOD. Auto netto, VAT na końcu.",
    ru: "Иностранный дилер через AUTOGOOD. Авто netto, VAT в конце.",
    en: "Foreign dealer via AUTOGOOD. Vehicle net, VAT is added at the end."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu netto",
      ru: "Цена авто netto",
      en: "Vehicle price net"
    },
    currency: "EUR"
  }, {
    key: "inspection",
    label: {
      pl: "Oględziny specjalisty netto",
      ru: "Инспекция специалиста netto",
      en: "Specialist inspection net"
    },
    currency: "PLN"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto",
      en: "Transport by car carrier net"
    },
    currency: "PLN"
  }, {
    key: "germanCommission",
    label: {
      pl: "Prowizja firmy niemieckiej",
      ru: "Комиссия немецкой фирмы",
      en: "German company commission"
    },
    currency: "EUR",
    optional: true
  }, {
    key: "discount",
    label: {
      pl: "Rabat",
      ru: "Скидка",
      en: "Discount"
    },
    currency: "EUR"
  }]
}, {
  id: 4,
  name: {
    pl: "Dealerzy VAT Marża",
    ru: "Дилеры VAT Маржа",
    en: "Dealers VAT Margin"
  },
  subtitle: {
    pl: "Dealer zagraniczny przez AUTOGOOD. Auto brutto, bez osobnej linii VAT.",
    ru: "Иностранный дилер через AUTOGOOD. Авто brutto, без отдельной строки VAT.",
    en: "Foreign dealer via AUTOGOOD. Vehicle gross, without a separate VAT line."
  },
  fields: [{
    key: "car",
    label: {
      pl: "Cena pojazdu",
      ru: "Цена автомобиля",
      en: "Vehicle price"
    },
    currency: "EUR"
  }, {
    key: "inspection",
    label: {
      pl: "Oględziny specjalisty netto",
      ru: "Инспекция специалиста netto",
      en: "Specialist inspection net"
    },
    currency: "PLN"
  }, {
    key: "transport",
    label: {
      pl: "Transport na lawecie netto",
      ru: "Транспорт на автовозе netto",
      en: "Transport by car carrier net"
    },
    currency: "PLN"
  }, {
    key: "germanCommission",
    label: {
      pl: "Prowizja firmy niemieckiej",
      ru: "Комиссия немецкой фирмы",
      en: "German company commission"
    },
    currency: "EUR",
    optional: true
  }, {
    key: "discount",
    label: {
      pl: "Rabat",
      ru: "Скидка",
      en: "Discount"
    },
    currency: "EUR"
  }]
}, {
  id: FINAL_TAB_ID,
  name: {
    pl: "Finalne rozliczenie",
    ru: "Финальный расчёт",
    en: "Final settlement"
  },
  subtitle: {
    pl: "Bilans dla klienta: co już zapłacono i co zostało do dopłaty.",
    ru: "Баланс для клиента: что уже оплачено и что осталось доплатить.",
    en: "Client balance: what has been paid and what remains due."
  },
  fields: []
}];
function calculatorName(tab, lang, financed) {
  if (financed && tab?.id === 1) {
    return {
      pl: "Aukcja Leasing VAT 23%",
      ru: "Аукцион Лизинг VAT 23%",
      en: "Auction Leasing VAT 23%"
    }[lang] || "Aukcja Leasing VAT 23%";
  }
  if (financed && tab?.id === 3) {
    return {
      pl: "Dealer Leasing VAT 23%",
      ru: "Дилер Лизинг VAT 23%",
      en: "Dealer Leasing VAT 23%"
    }[lang] || "Dealer Leasing VAT 23%";
  }
  return tab?.name?.[lang] || "";
}
const directSellerPayment = {
  pl: "Płatność za pojazd do sprzedawcy w EUR",
  ru: "Вы платите за автомобиль продавцу в EUR",
  en: "Payment to the seller in EUR"
};
const directDealerVat23Steps = {
  pl: ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Wpłacasz kaucję w wys. zagranicznego VAT-u", directSellerPayment.pl],
  ru: ["Возвращаем 70% полученной скидки от продавца", "Вы вносите депозит в размере иностранного VAT", directSellerPayment.ru],
  en: ["We return 70% of the discount received from the seller", "You pay a deposit equal to the foreign VAT", directSellerPayment.en]
};
const invoiceVat23 = {
  pl: "Sprzedajemy na Fakturę VAT 23%",
  ru: "Продаём по инвойсу VAT 23%",
  en: "Sold with a VAT 23% invoice"
};
const invoiceVatMargin = {
  pl: "Sprzedajemy na Fakturę VAT Marża",
  ru: "Продаём по инвойсу VAT Marża",
  en: "Sold with a VAT Margin invoice"
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
  },
  en: {
    ownFunds: "We buy the vehicle with our own funds",
    ownFundsDeposit: "We buy the vehicle with our own funds and pay a deposit equal to the foreign VAT",
    ownContribution: "You pay the down payment"
  }
};
function getProcessSteps(tab, lang, financed, hasGermanCommission = false, dealerDirect = false) {
  if (dealerDirect && tab.id === 3) {
    return directDealerVat23Steps[lang] || [];
  }
  const steps = {
    0: {
      pl: ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", directSellerPayment.pl],
      ru: ["Возвращаем 70% полученной скидки от продавца", directSellerPayment.ru],
      en: ["We return 70% of the discount received from the seller", directSellerPayment.en]
    },
    1: {
      pl: financed ? [financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, invoiceVat23.pl] : ["Płatność w PLN lub EUR", invoiceVat23.pl],
      ru: financed ? [financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, invoiceVat23.ru] : ["Вы оплачиваете всю сумму в PLN или EUR", invoiceVat23.ru],
      en: financed ? [financingNotes.en.ownContribution, financingNotes.en.ownFunds, invoiceVat23.en] : ["Payment in PLN or EUR", invoiceVat23.en]
    },
    2: {
      pl: financed ? [financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, invoiceVatMargin.pl] : ["Płatność w PLN lub EUR", invoiceVatMargin.pl],
      ru: financed ? [financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, invoiceVatMargin.ru] : ["Вы оплачиваете всю сумму в PLN или EUR", invoiceVatMargin.ru],
      en: financed ? [financingNotes.en.ownContribution, financingNotes.en.ownFunds, invoiceVatMargin.en] : ["Payment in PLN or EUR", invoiceVatMargin.en]
    },
    3: {
      pl: financed ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFundsDeposit, invoiceVat23.pl] : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Wpłacamy kaucję w wys. zagranicznego VAT-u", "Płatność w PLN lub EUR", invoiceVat23.pl],
      ru: financed ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFundsDeposit, invoiceVat23.ru] : ["Возвращаем 70% полученной скидки от продавца", "Вносим депозит в размере иностранного VAT", "Вы оплачиваете всю сумму в PLN или EUR", invoiceVat23.ru],
      en: financed ? ["We return 70% of the discount received from the seller", financingNotes.en.ownContribution, financingNotes.en.ownFundsDeposit, invoiceVat23.en] : ["We return 70% of the discount received from the seller", "You pay a deposit equal to the foreign VAT", "Payment in PLN or EUR", invoiceVat23.en]
    },
    4: {
      pl: financed ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, invoiceVatMargin.pl] : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Płatność w PLN lub EUR", invoiceVatMargin.pl],
      ru: financed ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, invoiceVatMargin.ru] : ["Возвращаем 70% полученной скидки от продавца", "Вы оплачиваете всю сумму в PLN или EUR", invoiceVatMargin.ru],
      en: financed ? ["We return 70% of the discount received from the seller", financingNotes.en.ownContribution, financingNotes.en.ownFunds, invoiceVatMargin.en] : ["We return 70% of the discount received from the seller", "Payment in PLN or EUR", invoiceVatMargin.en]
    }
  };
  if (hasGermanCommission && tab.id === 3) {
    if (lang === "ru") {
      return financed ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFundsDeposit, directSellerPayment.ru] : ["Возвращаем 70% полученной скидки от продавца", "Вносим депозит в размере иностранного VAT", directSellerPayment.ru];
    }
    if (lang === "en") {
      return financed ? ["We return 70% of the discount received from the seller", financingNotes.en.ownContribution, financingNotes.en.ownFundsDeposit, directSellerPayment.en] : ["We return 70% of the discount received from the seller", "You pay a deposit equal to the foreign VAT", directSellerPayment.en];
    }
    return financed ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFundsDeposit, directSellerPayment.pl] : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Wpłacamy kaucję w wys. zagranicznego VAT-u", directSellerPayment.pl];
  }
  if (hasGermanCommission && tab.id === 4) {
    if (lang === "ru") {
      return financed ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, directSellerPayment.ru] : ["Возвращаем 70% полученной скидки от продавца", directSellerPayment.ru];
    }
    if (lang === "en") {
      return financed ? ["We return 70% of the discount received from the seller", financingNotes.en.ownContribution, financingNotes.en.ownFunds, directSellerPayment.en] : ["We return 70% of the discount received from the seller", directSellerPayment.en];
    }
    return financed ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, directSellerPayment.pl] : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", directSellerPayment.pl];
  }
  return steps[tab.id]?.[lang] || [];
}
const processHighlights = ["70% uzyskanego rabatu", "70% полученной скидки", "Вы вносите депозит", "do sprzedawcy w EUR", "продавцу в EUR", "w PLN lub EUR", "PLN lub EUR", "PLN или EUR", "na Fakturę VAT 23%", "Fakturę VAT 23%", "Faktura VAT 23%", "na Fakturę VAT Marża", "Fakturę VAT Marża", "Faktura VAT Marża", "инвойсу VAT 23%", "инвойсу VAT Marża", "własnych środków", "wkładu własnego", "Wpłacamy kaucję", "wpłacamy kaucję", "70% of the discount received", "You pay a deposit", "to the seller in EUR", "in PLN or EUR", "VAT 23% invoice", "VAT Margin invoice", "with our own funds", "down payment"];
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

// Zloty is shown as the ISO code ("1 850 PLN"), not the "zl" symbol.
// Euro keeps its symbol, so only PLN switches to currencyDisplay: "code".
function currencyDisplayFor(currency) {
  return currency === "PLN" ? "code" : "symbol";
}
function money(value, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    currencyDisplay: currencyDisplayFor(currency),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(roundedCurrencyValue(value, currency));
}
function moneyExact(value, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    currencyDisplay: currencyDisplayFor(currency),
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
    const safeMultiplier = Number.isFinite(multiplier) && multiplier >= 0 ? multiplier : 1;
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
  return new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "pl-PL", {
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
  return Boolean(values?.registrationEnabled) || Object.values(values || {}).some(value => n(value) > 0);
}
function readCalculatorPrefill() {
  if (typeof window === "undefined") {
    return {
      lang: "pl",
      activeTab: 0,
      rate: DEFAULT_RATE,
      rateTouched: false,
      engineIndex: 3,
      financed: false,
      dealerDirect: false,
      values: {},
      mobileDeUrl: ""
    };
  }
  const params = new URLSearchParams(window.location.search);
  const tabId = Number(params.get("tab"));
  const nextTab = Number.isInteger(tabId) && tabs.some(tab => tab.id === tabId) ? tabId : 0;
  const engineRaw = params.get("engine") ?? params.get("engineIndex");
  const engineParam = engineRaw === null ? NaN : Number(engineRaw);
  const rateParam = params.get("rate");
  const nextRate = n(rateParam);
  const values = {};
  ["car", "fee", "transport", "inspection", "discount", "germanCommission"].forEach(key => {
    const value = params.get(key);
    if (value !== null && String(value).trim() !== "") {
      values[key] = value;
    }
  });
  if (values.germanCommission) {
    values.germanCommissionEnabled = true;
  }
  if (params.get("registration") === "1") {
    values.registrationEnabled = true;
  }
  return {
    lang: ["pl", "ru", "en"].includes(params.get("lang")) ? params.get("lang") : "pl",
    activeTab: nextTab,
    rate: nextRate > 0 ? calculationRateLabel(nextRate) : DEFAULT_RATE,
    rateTouched: nextRate > 0,
    engineIndex: Number.isInteger(engineParam) && engineTypes[engineParam] ? engineParam : 3,
    financed: nextTab > 0 && params.get("financed") === "1",
    dealerDirect: nextTab === 3 && (params.get("direct") === "1" || params.get("dealerDirect") === "1"),
    values,
    mobileDeUrl: params.get("mobileUrl") || params.get("url") || ""
  };
}
function historySignature(item) {
  return JSON.stringify({
    activeTab: item.activeTab,
    rate: item.rate,
    engineIndex: item.engineIndex,
    financed: item.financed,
    dealerDirect: item.dealerDirect,
    values: item.values || {},
    manualOverrides: item.manualOverrides || {}
  });
}
function percentLabel(value) {
  if (value === 0) return "0%";
  const digits = value === 0.0155 ? 2 : 1;
  return `${(value * 100).toFixed(digits).replace(".", ",")}%`;
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
    ru: "Осмотр специалиста",
    en: "Specialist inspection"
  },
  mode: "plus",
  vat: true
}, {
  key: "delivery",
  label: {
    pl: "Dostawa na lawecie",
    ru: "Доставка на автовозе",
    en: "Transport by car carrier"
  },
  mode: "plus",
  vat: true
}, {
  key: "translation",
  label: {
    pl: "Tłumaczenie dokumentów",
    ru: "Перевод документов",
    en: "Document translation"
  },
  mode: "plus",
  defaultPln: DOC_TRANSLATION
}, {
  key: "technical",
  label: {
    pl: "Przegląd techniczny",
    ru: "Техосмотр",
    en: "Technical inspection"
  },
  mode: "plus",
  defaultPln: TO_FEE
}, {
  key: "commission",
  label: {
    pl: "Prowizja AUTOGOOD",
    ru: "Комиссия AUTOGOOD",
    en: "AUTOGOOD commission"
  },
  mode: "plus",
  vat: true
}, {
  key: "deposit",
  label: {
    pl: "Zaliczka",
    ru: "Аванс",
    en: "Deposit"
  },
  mode: "minus"
}];
const finalExtraTemplates = [{
  key: "dealerDiscount30",
  label: {
    pl: "30% rabatu dealera",
    ru: "30% скидки дилера",
    en: "30% of dealer discount"
  },
  group: "extra",
  mode: "off",
  activeMode: "minus"
}, {
  key: "germanCompanyCommission",
  label: {
    pl: "Prowizja firmy niemieckiej",
    ru: "Комиссия немецкой фирмы",
    en: "German company commission"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "inspection2",
  label: {
    pl: "Oględziny x2",
    ru: "Осмотр x2",
    en: "Second inspection"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus",
  vat: true
}, {
  key: "detailing",
  label: {
    pl: "Detailing",
    ru: "Дитейлинг",
    en: "Detailing"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "painting",
  label: {
    pl: "Lakierowanie",
    ru: "Покраска",
    en: "Painting"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "service",
  label: {
    pl: "Serwis",
    ru: "Сервис",
    en: "Service"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "registration",
  label: {
    pl: "Rejestracja",
    ru: "Регистрация",
    en: "Registration"
  },
  group: "extra",
  mode: "off",
  activeMode: "plus"
}, {
  key: "deposit2",
  label: {
    pl: "Zaliczka 2",
    ru: "Аванс 2",
    en: "Deposit 2"
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
  const vatTotal = active.reduce((sum, item) => sum + finalLineVatValue(item), 0);
  return {
    rows: active,
    positive,
    negative,
    vatTotal,
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
      ru: safeLabel,
      en: safeLabel
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
function OptionalFixedCostToggle({
  label,
  checked,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `field optionalAmountField ${checked ? "isChecked" : ""}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "optionalAmountLabel"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: event => onToggle(event.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, label)));
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
  notice,
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
  }, status === "loading" && c.mobileImportLoading, status === "ready" && c.mobileImportReady, status === "error" && c.mobileImportError), notice && status === "ready" && /*#__PURE__*/React.createElement("p", {
    className: "mobileImportStatus warning"
  }, notice), summary && status !== "error" && /*#__PURE__*/React.createElement("p", {
    className: "mobileImportSummary"
  }, /*#__PURE__*/React.createElement("b", null, c.mobileImportFound, ":"), " ", summary), summary && status === "error" && /*#__PURE__*/React.createElement("p", {
    className: "mobileImportSummary errorDetail"
  }, summary));
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
  onDelete,
  emptyText
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "card historyPanel"
  }, /*#__PURE__*/React.createElement("h2", null, c.historyTitle), history.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "historyEmpty"
  }, emptyText || c.historyEmpty) : /*#__PURE__*/React.createElement("div", {
    className: "historyList"
  }, history.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.id,
    className: "historyEntry"
  }, /*#__PURE__*/React.createElement("button", {
    className: "historyItem",
    type: "button",
    title: c.historyRestore,
    onClick: () => onRestore(item)
  }, /*#__PURE__*/React.createElement("strong", null, item.title), /*#__PURE__*/React.createElement("span", null, formatHistoryDate(item.savedAt, lang), " \xB7 ", item.type === "final" ? item.finalCurrency : item.dealerDirect ? c.directCommission : item.financed ? c.financing : c.standard), /*#__PURE__*/React.createElement("em", null, money(item.total, item.finalCurrency || "PLN"))), /*#__PURE__*/React.createElement("button", {
    className: "historyDelete",
    type: "button",
    title: c.historyDelete,
    "aria-label": c.historyDelete,
    onClick: () => onDelete(item)
  }, "\xD7")))));
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
  onToggleVat
}) {
  const totalIsNegative = calc.total < 0;
  const totalLabel = totalIsNegative ? c.finalOverpaid : c.total;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    className: "resultCornerLogo",
    src: "./assets/ag-opt.svg",
    alt: "AUTOGOOD"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "calcEyebrow"
  }, c.finalBalance), /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("strong", null, finalSignedAmountLabel(item, currency)))), item.mode === "plus" && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `finalVatToggle ${item.vatAdded ? "active" : ""}`,
    onClick: () => onToggleVat(item.key),
    title: c.finalVatToggle,
    "aria-pressed": Boolean(item.vatAdded),
    "aria-label": c.finalVatToggle
  }, item.vatAdded ? "−" : "+"))), /*#__PURE__*/React.createElement("div", {
    className: "finalResultLine finalVatRow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "resultRow finalResultRow mode-plus"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rowText"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rowLabel"
  }, "VAT 23%")), /*#__PURE__*/React.createElement("div", {
    className: "rowValue finalRowValue"
  }, /*#__PURE__*/React.createElement("strong", null, "+ ", moneyExact(calc.vatTotal || 0, currency)))))), /*#__PURE__*/React.createElement("div", {
    className: `totalBox finalTotalBox ${totalIsNegative ? "isOverpaid" : ""}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "totalMarker",
    "aria-hidden": "true"
  }, "="), /*#__PURE__*/React.createElement("div", {
    className: "totalLabel"
  }, /*#__PURE__*/React.createElement("span", null, totalLabel)), /*#__PURE__*/React.createElement("div", {
    className: "totalValue"
  }, /*#__PURE__*/React.createElement("strong", null, moneyExact(Math.abs(calc.total), currency)), /*#__PURE__*/React.createElement("em", null, "= ", oppositeCurrencyAmount(calc.total, currency, rate))), /*#__PURE__*/React.createElement("div", {
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
function registrationRows(t, enabled, totalValue = REGISTRATION_NETTO, manualMultiplier = 1) {
  if (!enabled) return [];
  return [row(t.registration, REGISTRATION_NETTO, "", `${moneyExact(REGISTRATION_NETTO * (1 + VAT))} brutto`, false, true, "", totalValue, manualMultiplier)];
}
function commissionFormula(fix, pct, base, discountPart = "") {
  return `${money(fix)} + (${(pct * 100).toFixed(0)}% × ${money(base)})${discountPart}`;
}
function calculate(tabId, values, rate, exciseRate, financed, lang, dealerDirect = false) {
  const t = copy[lang].lines;
  const car = n(values.car);
  const fee = n(values.fee);
  const inspection = n(values.inspection);
  const transport = n(values.transport);
  const discount = n(values.discount);
  const germanCommission = values.germanCommissionEnabled ? n(values.germanCommission) : 0;
  const registrationNetto = values.registrationEnabled ? REGISTRATION_NETTO : 0;
  const registrationBrutto = registrationNetto * (1 + VAT);
  const useRate = rate > 0 ? rate : DEFAULT_RATE;
  const germanCommissionPln = germanCommission * useRate;
  const finFix = financed ? FIN_FIX : STD_FIX;
  const finPct = financed ? 0.05 : 0.02;
  const technicalBrutto = TO_FEE * 1.23;
  if (tabId === 0) {
    const carPln = car * useRate;
    const inspectionBrutto = inspection * 1.23;
    const transportBrutto = transport * 1.23;
    const excise = exciseRate * carPln;
    const discountPln = discount * useRate;
    const discountCommission = 0.3 * discountPln;
    const commissionNetto = STD_FIX + 0.01 * carPln + discountCommission;
    const commissionBrutto = commissionNetto * 1.23;
    const discountText = discount > 0 ? ` + (30% × ${inputCurrencyLabel(discount)})` : "";
    const vatBase = inspection + transport + commissionNetto + registrationNetto;
    const vat = vatBase * VAT;
    const total = carPln + inspectionBrutto + transportBrutto + excise + commissionBrutto + TO_FEE + DOC_TRANSLATION + registrationBrutto;
    return {
      total,
      rows: [row(t.directCarBrutto, carPln, "", "", false, false, conversionPrefix(car)), row(t.inspection, inspection, "", `${money(inspectionBrutto)} brutto`, false, false, "", inspectionBrutto, 1.23), row(t.transport, transport, "", `${money(transportBrutto)} brutto`, false, false, "", transportBrutto, 1.23), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`), row(t.commission, commissionNetto, "", commissionFormula(STD_FIX, 0.01, carPln, discountText), false, false, "", commissionBrutto, 1.23), row(t.to, TO_FEE, "", "", false, true), row(t.doc, DOC_TRANSLATION, "", "", false, true), ...registrationRows(t, values.registrationEnabled, registrationBrutto, 1.23), row(t.vat, vat, "", `23% × ${money(vatBase)}`, false, false, "", 0, 0)]
    };
  }
  if (tabId === 1) {
    const carPln = car * useRate;
    const feePln = fee * useRate;
    const transPln = transport;
    const base = carPln + feePln;
    const excise = exciseRate * base;
    const commissionBase = base * 1.23;
    const commissionNetto = finFix + finPct * commissionBase;
    const vatBase = base + transPln + excise + commissionNetto + TO_FEE + registrationNetto;
    const vat = vatBase * VAT;
    const total = vatBase + vat;
    return {
      total,
      rows: [row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)), row(t.auctionFee, feePln, "", `${money(feePln * 1.23)} brutto`, false, false, conversionPrefix(fee)), row(t.transport, transPln, "", `${money(transPln * 1.23)} brutto`), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(base)}`), row(t.commission, commissionNetto, "", commissionFormula(finFix, finPct, commissionBase)), row(t.to, TO_FEE, "", "", false, true), ...registrationRows(t, values.registrationEnabled), row(t.vat, vat, "", `23% × ${money(vatBase)}`, false, false, "", 0, 0)]
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
    const vatBase = feePln + transNetto + excise + commissionNetto + TO_FEE + registrationNetto;
    const vat = vatBase * VAT;
    const total = carPln + feeBrutto + transBrutto + exciseBrutto + commissionBrutto + technicalBrutto + registrationBrutto;
    return {
      total,
      rows: [row(t.car, carPln, "", "", false, false, conversionPrefix(car)), row(t.auctionFee, feePln, "", `${money(feeBrutto)} brutto`, false, false, conversionPrefix(fee), feeBrutto, 1.23), row(t.transport, transNetto, "", `${money(transBrutto)} brutto`, false, false, "", transBrutto, 1.23), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(base)}`, false, false, "", exciseBrutto, 1.23), row(t.commission, commissionNetto, "", commissionFormula(finFix, finPct, base), false, false, "", commissionBrutto, 1.23), row(t.to, TO_FEE, "", "", false, true, "", technicalBrutto, 1.23), ...registrationRows(t, values.registrationEnabled, registrationBrutto, 1.23), row(t.vat, vat, "", `23% × ${money(vatBase)}`)]
    };
  }
  if (tabId === 3) {
    const carPln = car * useRate;
    const inspectionBrutto = inspection * 1.23;
    const excise = exciseRate * carPln;
    const bruttoBase = carPln * 1.23;
    const discountPln = discount * useRate;
    const discountCommission = 0.3 * discountPln;
    const commissionNetto = dealerDirect ? STD_FIX + 0.01 * carPln : finFix + finPct * bruttoBase + discountCommission;
    const discountText = !dealerDirect && discount > 0 ? ` + (30% × ${inputCurrencyLabel(discount)})` : "";
    const commissionBase = dealerDirect ? carPln : bruttoBase;
    const commissionPct = dealerDirect ? 0.01 : finPct;
    const vatBase = (dealerDirect ? 0 : carPln) + inspection + transport + (dealerDirect ? 0 : excise) + commissionNetto + TO_FEE + registrationNetto;
    const vat = vatBase * VAT;
    const total = dealerDirect ? carPln + inspection + transport + excise + commissionNetto + TO_FEE + registrationNetto + vat + germanCommissionPln : vatBase + vat + germanCommissionPln;
    const rows = [row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)), ...(values.germanCommissionEnabled ? [row(t.germanCommission, germanCommissionPln, "", "", false, false, conversionPrefix(germanCommission))] : []), row(t.inspection, inspection, "", `${money(inspectionBrutto)} brutto`), row(t.transport, transport, "", `${money(transport * 1.23)} brutto`), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`), row(t.commission, commissionNetto, "", commissionFormula(dealerDirect ? STD_FIX : finFix, commissionPct, commissionBase, discountText)), row(t.to, TO_FEE, "", "", false, true), ...registrationRows(t, values.registrationEnabled), row(t.vat, vat, "", `23% × ${money(vatBase)}`)];
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
  const vatBase = inspection + transport + excise + commissionNetto + TO_FEE + registrationNetto;
  const vat = vatBase * VAT;
  const total = carPln + inspectionBrutto + transportBrutto + exciseBrutto + commissionBrutto + technicalBrutto + germanCommissionPln + registrationBrutto;
  const rows = [row(t.car, carPln, "", "", false, false, conversionPrefix(car)), ...(values.germanCommissionEnabled ? [row(t.germanCommission, germanCommissionPln, "", "", false, false, conversionPrefix(germanCommission))] : []), row(t.inspection, inspection, "", `${money(inspectionBrutto)} brutto`, false, false, "", inspectionBrutto, 1.23), row(t.transport, transport, "", `${money(transportBrutto)} brutto`, false, false, "", transportBrutto, 1.23), row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`, false, false, "", exciseBrutto, 1.23), row(t.commission, commissionNetto, "", commissionFormula(finFix, finPct, carPln, discountText), false, false, "", commissionBrutto, 1.23), row(t.to, TO_FEE, "", "", false, true, "", technicalBrutto, 1.23), ...registrationRows(t, values.registrationEnabled, registrationBrutto, 1.23), row(t.vat, vat, "", `23% × ${money(vatBase)}`, false, false, "", 0, 0)];
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
  hasGermanCommission,
  dealerDirect = false
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
  const processSteps = getProcessSteps(tab, lang, financed, hasGermanCommission, dealerDirect);
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
        <td><b>${finalSignedAmountLabel(item, currency)}</b></td>
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
function frameScreenshotCanvas(canvas, paddingCssPx, scale, color) {
  const padding = Math.max(0, Math.ceil(paddingCssPx * scale));
  if (!padding) return canvas;
  const framedCanvas = document.createElement("canvas");
  framedCanvas.width = canvas.width + padding * 2;
  framedCanvas.height = canvas.height + padding * 2;
  const context = framedCanvas.getContext("2d");
  if (!context) return canvas;
  context.fillStyle = color;
  context.fillRect(0, 0, framedCanvas.width, framedCanvas.height);
  context.drawImage(canvas, padding, padding);
  return framedCanvas;
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
  const initialPrefill = useMemo(() => readCalculatorPrefill(), []);
  const [lang, setLang] = useState(initialPrefill.lang);
  const [activeTab, setActiveTab] = useState(initialPrefill.activeTab);
  const [rate, setRate] = useState(initialPrefill.rate);
  const [marketRates, setMarketRates] = useState(RATES_FALLBACK);
  const [ratesStatus, setRatesStatus] = useState("loading");
  const [engineIndex, setEngineIndex] = useState(initialPrefill.engineIndex);
  const [financed, setFinanced] = useState(initialPrefill.financed);
  const [dealerDirect, setDealerDirect] = useState(initialPrefill.dealerDirect);
  const [values, setValues] = useState(initialPrefill.values);
  const [mobileDeUrl, setMobileDeUrl] = useState(initialPrefill.mobileDeUrl);
  const [mobileDeStatus, setMobileDeStatus] = useState("");
  const [mobileDeSummary, setMobileDeSummary] = useState("");
  const [mobileDeNotice, setMobileDeNotice] = useState("");
  const [screenshotStatus, setScreenshotStatus] = useState("");
  const [history, setHistory] = useState(() => readHistory());
  const [finalHistory, setFinalHistory] = useState(() => readHistory(FINAL_HISTORY_KEY));
  const [finalCurrency, setFinalCurrency] = useState("PLN");
  const [finalItems, setFinalItems] = useState(() => initialFinalItems("PLN", DEFAULT_RATE));
  const [finalCustomName, setFinalCustomName] = useState("");
  const [manualOverrides, setManualOverrides] = useState({});
  const [editingOverride, setEditingOverride] = useState("");
  const resultsRef = useRef(null);
  const rateTouchedRef = useRef(initialPrefill.rateTouched);
  const safeLang = lang || "pl";
  const c = copy[safeLang];
  const tab = tabs[activeTab];
  const isFinalBalance = activeTab === FINAL_TAB_ID;
  const exciseRate = engineTypes[engineIndex]?.rate ?? 0;
  const baseCalc = useMemo(() => calculate(activeTab, values, n(rate), exciseRate, financed, safeLang, dealerDirect), [activeTab, values, rate, exciseRate, financed, safeLang, dealerDirect]);
  const calc = useMemo(() => applyManualOverrides(baseCalc, manualOverrides, activeTab), [baseCalc, manualOverrides, activeTab]);
  const finalCalc = useMemo(() => calculateFinalBalance(finalItems), [finalItems]);
  const roundedTotal = roundedCurrencyValue(calc.total, "PLN");
  const activeTabName = calculatorName(tab, safeLang, activeTab > 0 && financed);
  const hasGermanCommission = (activeTab === 3 || activeTab === 4) && Boolean(values.germanCommissionEnabled);
  const processSteps = getProcessSteps(tab, safeLang, financed, hasGermanCommission, activeTab === 3 && dealerDirect);
  const visibleHistory = isFinalBalance ? finalHistory : history;
  const avgRateLabel = formatAvgRate(Number(marketRates?.rates?.EUR_PLN?.value));
  const rateDate = new Intl.DateTimeFormat(safeLang === "ru" ? "ru-RU" : safeLang === "en" ? "en-GB" : "pl-PL", {
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
    setDealerDirect(false);
    setManualOverrides({});
    setEditingOverride("");
    // Switching tabs wipes the imported values, so the import result no longer
    // describes what is on screen. Keep the link so it can be re-imported.
    setMobileDeStatus("");
    setMobileDeSummary("");
    setMobileDeNotice("");
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
  const setRegistrationEnabled = checked => {
    clearManualOverrides();
    setValues(current => {
      const next = {
        ...current
      };
      if (checked) next.registrationEnabled = true;else delete next.registrationEnabled;
      return next;
    });
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
      dealerDirect: activeTab === 3 && dealerDirect,
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
      setLang(["pl", "ru", "en"].includes(item.lang) ? item.lang : "pl");
      setActiveTab(FINAL_TAB_ID);
      setFinalCurrency(item.finalCurrency === "EUR" ? "EUR" : "PLN");
      setFinalItems(Array.isArray(item.items) && item.items.length ? item.items.map(normalizeFinalItem) : initialFinalItems(item.finalCurrency || "PLN", n(rate) || DEFAULT_RATE));
      setRate(item.rate || DEFAULT_RATE);
      rateTouchedRef.current = true;
      setMobileDeUrl("");
      setMobileDeStatus("");
      setMobileDeSummary("");
      setMobileDeNotice("");
      return;
    }
    const nextTab = tabs[item.activeTab] ? item.activeTab : 0;
    setLang(["pl", "ru", "en"].includes(item.lang) ? item.lang : "pl");
    setActiveTab(nextTab);
    setValues(item.values && typeof item.values === "object" ? item.values : {});
    setManualOverrides(item.manualOverrides && typeof item.manualOverrides === "object" ? item.manualOverrides : {});
    setEditingOverride("");
    setRate(item.rate || DEFAULT_RATE);
    rateTouchedRef.current = true;
    setEngineIndex(Number.isInteger(item.engineIndex) && engineTypes[item.engineIndex] ? item.engineIndex : 3);
    setFinanced(nextTab > 0 && Boolean(item.financed));
    setDealerDirect(nextTab === 3 && Boolean(item.dealerDirect));
    setMobileDeUrl("");
    setMobileDeStatus("");
    setMobileDeSummary("");
    setMobileDeNotice("");
  };
  const deleteHistoryItem = item => {
    if (item.type === "final") {
      setFinalHistory(current => {
        const next = current.filter(saved => saved.id !== item.id);
        writeHistory(next, FINAL_HISTORY_KEY);
        return next;
      });
      return;
    }
    setHistory(current => {
      const next = current.filter(saved => saved.id !== item.id);
      writeHistory(next);
      return next;
    });
  };
  const loadMobileDeData = async () => {
    const sourceUrl = mobileDeUrl.trim();
    if (!sourceUrl) return;
    setMobileDeStatus("loading");
    setMobileDeSummary("");
    setMobileDeNotice("");
    try {
      const response = await fetch(`${MOBILEDE_API_URL}?url=${encodeURIComponent(sourceUrl)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || "Mobile.de import failed");
      }
      const data = await response.json();
      const carBruttoEur = Number(data?.carBruttoEur);
      const carNettoEur = Number(data?.carNettoEur);
      const transportNettoPln = Number(data?.transportNettoPln);
      const inspectionNettoPln = Number(data?.inspectionNettoPln ?? data?.deliveryInspectionEstimate?.inspection ?? data?.transportEstimate?.inspection);
      const nextEngineIndex = Number(data?.engineTypeIndex);

      // "Dealerzy VAT 23%" asks for the net car price; every other tab wants the
      // gross listing price. VAT-deductible ads print the net price next to the
      // gross one — if it is missing (margin ads), leave the field for manual entry.
      const wantsNettoCar = activeTab === 3;
      const hasNettoCar = Number.isFinite(carNettoEur) && carNettoEur > 0;
      if (wantsNettoCar) {
        if (hasNettoCar) setField("car", String(Math.round(carNettoEur)));else setMobileDeNotice(c.mobileImportNoNetto);
      } else if (Number.isFinite(carBruttoEur) && carBruttoEur > 0) {
        setField("car", String(Math.round(carBruttoEur)));
      }
      if (Number.isFinite(transportNettoPln) && transportNettoPln > 0) {
        setField("transport", String(Math.round(transportNettoPln)));
      }
      if (Number.isFinite(inspectionNettoPln) && inspectionNettoPln > 0) {
        setField("inspection", String(Math.round(inspectionNettoPln)));
      }
      if (Number.isInteger(nextEngineIndex) && engineTypes[nextEngineIndex]) {
        setEngineIndex(nextEngineIndex);
      }
      const summaryParts = [];
      if (data?.title) summaryParts.push(data.title);
      if (Number.isFinite(carBruttoEur) && carBruttoEur > 0) summaryParts.push(`${formatPlainAmount(carBruttoEur, "EUR")} brutto`);
      if (hasNettoCar) summaryParts.push(`${formatPlainAmount(carNettoEur, "EUR")} netto`);
      if (data?.fuel) summaryParts.push(data.fuel);
      if (data?.bodyType) summaryParts.push(data.bodyType);
      if (data?.displacementCcm) summaryParts.push(`${data.displacementCcm} cm³`);
      if (data?.engineTypeLabel) summaryParts.push(data.engineTypeLabel);
      if (Number.isFinite(transportNettoPln) && transportNettoPln > 0) {
        summaryParts.push(`${formatPlainAmount(transportNettoPln, "PLN")} transport netto`);
      }
      if (Number.isFinite(inspectionNettoPln) && inspectionNettoPln > 0) {
        summaryParts.push(`${formatPlainAmount(inspectionNettoPln, "PLN")} inspection netto`);
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
      const scale = Math.min(2, window.devicePixelRatio || 1);
      const rawCanvas = await window.html2canvas(resultsRef.current, {
        backgroundColor: "#ffffff",
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        scale,
        useCORS: true
      });
      const canvas = frameScreenshotCanvas(rawCanvas, SCREENSHOT_EDGE_PADDING, scale, "#ffffff");
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
    className: `appShell ${isFinalBalance ? "appShellFinalVat" : ""}`
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
  }, /*#__PURE__*/React.createElement("div", {
    className: "langSwitch",
    "aria-label": "Language"
  }, /*#__PURE__*/React.createElement("button", {
    className: lang === "pl" ? "active" : "",
    onClick: () => setLang("pl")
  }, "PL"), /*#__PURE__*/React.createElement("button", {
    className: lang === "ru" ? "active" : "",
    onClick: () => setLang("ru")
  }, "RU"), /*#__PURE__*/React.createElement("button", {
    className: lang === "en" ? "active" : "",
    onClick: () => setLang("en")
  }, "EN")), /*#__PURE__*/React.createElement("button", {
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
      hasGermanCommission,
      dealerDirect: activeTab === 3 && dealerDirect
    })
  }, c.print), /*#__PURE__*/React.createElement("button", {
    className: "printBtn screenshotBtn",
    onClick: copyScreenshot
  }, c.screenshot), /*#__PURE__*/React.createElement("button", {
    className: "printBtn saveBtn",
    onClick: saveCalculation
  }, c.saveCalculation))), /*#__PURE__*/React.createElement("div", {
    className: "tabsRow"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "tabs",
    "aria-label": "Calculators"
  }, tabs.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    className: item.id === activeTab ? "active" : "",
    onClick: () => switchTab(item.id)
  }, calculatorName(item, safeLang, item.id === activeTab && item.id > 0 && financed)))), /*#__PURE__*/React.createElement(RateWidget, {
    c: c,
    avgRateLabel: avgRateLabel,
    rateDate: rateDate,
    value: rate,
    onChange: setManualRate
  })), /*#__PURE__*/React.createElement("section", {
    className: `grid ${isFinalBalance ? "finalGrid" : ""}`
  }, /*#__PURE__*/React.createElement("aside", {
    className: isFinalBalance ? "panelData finalSidebar" : "panelData"
  }, isFinalBalance ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "finalDataHeader"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "panelEyebrow"
  }, c.inputs), /*#__PURE__*/React.createElement(FinalCurrencyControl, {
    c: c,
    currency: finalCurrency,
    onCurrencyChange: switchFinalCurrency
  })), /*#__PURE__*/React.createElement(FinalBalanceInputs, {
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
  }, c.inputs), MOBILEDE_TABS.includes(activeTab) && /*#__PURE__*/React.createElement(MobileDeImport, {
    c: c,
    url: mobileDeUrl,
    status: mobileDeStatus,
    summary: mobileDeSummary,
    notice: mobileDeNotice,
    onUrlChange: setMobileDeUrl,
    onImport: loadMobileDeData
  }), activeTab > 0 && /*#__PURE__*/React.createElement("div", {
    className: "toggleBlock"
  }, /*#__PURE__*/React.createElement("span", null, c.commissionType), /*#__PURE__*/React.createElement("div", {
    className: `commissionSegment ${activeTab === 3 ? "withDirect" : ""}`
  }, /*#__PURE__*/React.createElement("button", {
    className: !financed && !dealerDirect ? "active" : "",
    onClick: () => {
      clearManualOverrides();
      setFinanced(false);
      setDealerDirect(false);
    }
  }, c.standard), /*#__PURE__*/React.createElement("button", {
    className: financed && !dealerDirect ? "active" : "",
    onClick: () => {
      clearManualOverrides();
      setFinanced(true);
      setDealerDirect(false);
    }
  }, c.financing), activeTab === 3 && /*#__PURE__*/React.createElement("button", {
    className: dealerDirect ? "active" : "",
    onClick: () => {
      clearManualOverrides();
      setFinanced(false);
      setDealerDirect(true);
    }
  }, c.directCommission))), /*#__PURE__*/React.createElement("label", {
    className: "field"
  }, /*#__PURE__*/React.createElement("span", null, c.engine), /*#__PURE__*/React.createElement("select", {
    value: engineIndex,
    onChange: event => {
      clearManualOverrides();
      setEngineIndex(Number(event.target.value));
    }
  }, engineTypes.map((engine, index) => /*#__PURE__*/React.createElement("option", {
    key: engine.label.pl,
    value: index
  }, engine.label[safeLang], " \u2014 ", percentLabel(engine.rate))))), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement(OptionalFixedCostToggle, {
    label: c.lines.registration,
    checked: Boolean(values.registrationEnabled),
    onToggle: setRegistrationEnabled
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
    className: isFinalBalance ? "panelCalc results finalResults" : "panelCalc",
    ref: resultsRef
  }, isFinalBalance ? /*#__PURE__*/React.createElement(FinalBalanceResults, {
    c: c,
    lang: safeLang,
    currency: finalCurrency,
    rate: n(rate) || DEFAULT_RATE,
    calc: finalCalc,
    onToggleVat: toggleFinalVat
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    className: "resultCornerLogo",
    src: "./assets/ag-opt.svg",
    alt: "AUTOGOOD"
  }), /*#__PURE__*/React.createElement("h2", {
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
    onDelete: deleteHistoryItem,
    emptyText: isFinalBalance ? c.finalHistoryEmpty : c.historyEmpty
  })), screenshotStatus && /*#__PURE__*/React.createElement("div", {
    className: `toast ${screenshotStatus}`
  }, screenshotStatus === "ready" && c.screenshotReady, screenshotStatus === "opened" && c.screenshotOpened, screenshotStatus === "error" && c.screenshotError, screenshotStatus === "saved" && c.saveCalculationReady, screenshotStatus === "saveEmpty" && c.saveCalculationEmpty));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));
