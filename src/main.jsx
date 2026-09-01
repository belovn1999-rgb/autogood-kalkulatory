const { Component, useEffect, useMemo, useRef, useState } = React;

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
const MARGIN_AUCTION_TAB_ID = 2;
const SCREENSHOT_EDGE_PADDING = 2;
const RATES_FALLBACK = {
  source: "Walutomat",
  sourceUrl: "https://www.walutomat.pl/kursy-walut/",
  effectiveDate: "",
  rates: {
    EUR_PLN: { label: "EUR - PLN", value: DEFAULT_RATE, unit: "PLN" },
  },
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
    flexibleTitle: "Dostosuj kalkulację",
    flexibleAddTitle: "Dodaj pozycję",
    flexibleName: "Nazwa pozycji",
    flexibleAmount: "Kwota",
    flexibleCurrency: "Waluta",
    flexibleVat: "Dolicz VAT 23%",
    flexibleAdd: "Dodaj pozycję",
    flexibleEditTitle: "Edytuj nazwę",
    flexibleEditNote: "Edytuj opis",
    flexibleAddNote: "Dodaj opis",
    flexibleRemove: "Usuń pozycję z kalkulacji",
    flexibleRemoved: "Usunięte pozycje",
    flexibleRestore: "Przywróć do kalkulacji",
    breakdownVehicle: "Pojazd",
    breakdownTransport: "Transport",
    breakdownAuctionFee: "Opłata aukcyjna",
    breakdownInspection: "Oględziny",
    breakdownTaxes: "Podatki",
    breakdownOther: "Pozostałe opłaty",
    breakdownCommission: "Prowizja AUTOGOOD",
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
    finalDragTitle: "Przeciągnij, aby zmienić kolejność",
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
      germanCommission: "Prowizja firmy niemieckiej",
    },
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
    flexibleTitle: "Настройка расчёта",
    flexibleAddTitle: "Добавить позицию",
    flexibleName: "Название позиции",
    flexibleAmount: "Сумма",
    flexibleCurrency: "Валюта",
    flexibleVat: "Добавить VAT 23%",
    flexibleAdd: "Добавить позицию",
    flexibleEditTitle: "Изменить название",
    flexibleEditNote: "Изменить описание",
    flexibleAddNote: "Добавить описание",
    flexibleRemove: "Удалить позицию из расчёта",
    flexibleRemoved: "Удалённые позиции",
    flexibleRestore: "Вернуть в расчёт",
    breakdownVehicle: "Автомобиль",
    breakdownTransport: "Транспорт",
    breakdownAuctionFee: "Аукционный сбор",
    breakdownInspection: "Осмотр",
    breakdownTaxes: "Налоги",
    breakdownOther: "Другие обязательные оплаты",
    breakdownCommission: "Комиссия AUTOGOOD",
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
    finalDragTitle: "Перетащите, чтобы изменить порядок",
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
      germanCommission: "Комиссия немецкой фирмы",
    },
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
    flexibleTitle: "Customize calculation",
    flexibleAddTitle: "Add a position",
    flexibleName: "Position name",
    flexibleAmount: "Amount",
    flexibleCurrency: "Currency",
    flexibleVat: "Add VAT 23%",
    flexibleAdd: "Add position",
    flexibleEditTitle: "Edit title",
    flexibleEditNote: "Edit note",
    flexibleAddNote: "Add note",
    flexibleRemove: "Remove position from calculation",
    flexibleRemoved: "Removed positions",
    flexibleRestore: "Return to calculation",
    breakdownVehicle: "Vehicle",
    breakdownTransport: "Transport",
    breakdownAuctionFee: "Auction fee",
    breakdownInspection: "Inspection",
    breakdownTaxes: "Taxes",
    breakdownOther: "Other mandatory costs",
    breakdownCommission: "AUTOGOOD commission",
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
    finalDragTitle: "Drag to change the order",
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
      germanCommission: "German company commission",
    },
  },
};

const engineTypes = [
  { label: { pl: "EL / PHEV <=2000cm³", ru: "Электро / PHEV <=2000см³", en: "Electric / PHEV <=2000cc" }, rate: 0 },
  { label: { pl: "PHEV / HEV >2000cm³", ru: "PHEV / HEV >2000см³", en: "PHEV / HEV >2000cc" }, rate: 0.093 },
  { label: { pl: "HEV <=2000cm³", ru: "HEV <=2000см³", en: "HEV <=2000cc" }, rate: 0.0155 },
  { label: { pl: "Spalinowy <=2000cm³", ru: "ДВС <=2000см³", en: "Combustion <=2000cc" }, rate: 0.031 },
  { label: { pl: "Spalinowy >2000cm³", ru: "ДВС >2000см³", en: "Combustion >2000cc" }, rate: 0.186 },
];

const tabs = [
  {
    id: 0,
    name: { pl: "Zakup bezpośredni", ru: "Прямая покупка", en: "Direct purchase" },
    subtitle: {
      pl: "Klient płaci dealerowi bezpośrednio. VAT Marża.",
      ru: "Клиент платит дилеру напрямую. VAT Marża.",
      en: "The client pays the dealer directly. VAT Margin.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu", ru: "Цена автомобиля", en: "Vehicle price" }, currency: "EUR" },
      { key: "inspection", label: { pl: "Oględziny specjalisty netto", ru: "Инспекция специалиста netto", en: "Specialist inspection net" }, currency: "PLN" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto", en: "Transport by car carrier net" }, currency: "PLN" },
      { key: "discount", label: { pl: "Rabat", ru: "Скидка", en: "Discount" }, currency: "EUR" },
    ],
  },
  {
    id: 1,
    name: { pl: "Aukcje VAT 23%", ru: "Аукционы VAT 23%", en: "Auctions VAT 23%" },
    subtitle: {
      pl: "Aukcja zagraniczna. Wszystkie wartości netto, VAT na końcu.",
      ru: "Зарубежный аукцион. Все значения netto, VAT в конце.",
      en: "Foreign auction. All values are net, VAT is added at the end.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu netto", ru: "Цена авто netto", en: "Vehicle price net" }, currency: "EUR" },
      { key: "fee", label: { pl: "Opłata aukcyjna netto", ru: "Аукционный сбор netto", en: "Auction fee net" }, currency: "EUR" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto", en: "Transport by car carrier net" }, currency: "PLN" },
    ],
  },
  {
    id: 2,
    name: { pl: "Aukcje VAT Marża", ru: "Аукционы VAT Маржа", en: "Auctions VAT Margin" },
    subtitle: {
      pl: "Aukcja zagraniczna. Pojazd brutto, transport netto + VAT.",
      ru: "Зарубежный аукцион. Авто brutto, транспорт netto + VAT.",
      en: "Foreign auction. Vehicle gross, transport net plus VAT.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu", ru: "Цена автомобиля", en: "Vehicle price" }, currency: "EUR" },
      { key: "fee", label: { pl: "Opłata aukcyjna", ru: "Аукционный сбор", en: "Auction fee" }, currency: "EUR" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto", en: "Transport by car carrier net" }, currency: "PLN" },
    ],
  },
  {
    id: 3,
    name: { pl: "Dealerzy VAT 23%", ru: "Дилеры VAT 23%", en: "Dealers VAT 23%" },
    subtitle: {
      pl: "Dealer zagraniczny przez AUTOGOOD. Auto netto, VAT na końcu.",
      ru: "Иностранный дилер через AUTOGOOD. Авто netto, VAT в конце.",
      en: "Foreign dealer via AUTOGOOD. Vehicle net, VAT is added at the end.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu netto", ru: "Цена авто netto", en: "Vehicle price net" }, currency: "EUR" },
      { key: "inspection", label: { pl: "Oględziny specjalisty netto", ru: "Инспекция специалиста netto", en: "Specialist inspection net" }, currency: "PLN" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto", en: "Transport by car carrier net" }, currency: "PLN" },
      { key: "germanCommission", label: { pl: "Prowizja firmy niemieckiej", ru: "Комиссия немецкой фирмы", en: "German company commission" }, currency: "EUR", optional: true },
      { key: "discount", label: { pl: "Rabat", ru: "Скидка", en: "Discount" }, currency: "EUR" },
    ],
  },
  {
    id: 4,
    name: { pl: "Dealerzy VAT Marża", ru: "Дилеры VAT Маржа", en: "Dealers VAT Margin" },
    subtitle: {
      pl: "Dealer zagraniczny przez AUTOGOOD. Auto brutto, bez osobnej linii VAT.",
      ru: "Иностранный дилер через AUTOGOOD. Авто brutto, без отдельной строки VAT.",
      en: "Foreign dealer via AUTOGOOD. Vehicle gross, without a separate VAT line.",
    },
    fields: [
      { key: "car", label: { pl: "Cena pojazdu", ru: "Цена автомобиля", en: "Vehicle price" }, currency: "EUR" },
      { key: "inspection", label: { pl: "Oględziny specjalisty netto", ru: "Инспекция специалиста netto", en: "Specialist inspection net" }, currency: "PLN" },
      { key: "transport", label: { pl: "Transport na lawecie netto", ru: "Транспорт на автовозе netto", en: "Transport by car carrier net" }, currency: "PLN" },
      { key: "germanCommission", label: { pl: "Prowizja firmy niemieckiej", ru: "Комиссия немецкой фирмы", en: "German company commission" }, currency: "EUR", optional: true },
      { key: "discount", label: { pl: "Rabat", ru: "Скидка", en: "Discount" }, currency: "EUR" },
    ],
  },
  {
    id: FINAL_TAB_ID,
    name: { pl: "Finalne rozliczenie", ru: "Финальный расчёт", en: "Final settlement" },
    subtitle: {
      pl: "Bilans dla klienta: co już zapłacono i co zostało do dopłaty.",
      ru: "Баланс для клиента: что уже оплачено и что осталось доплатить.",
      en: "Client balance: what has been paid and what remains due.",
    },
    fields: [],
  },
];

function calculatorName(tab, lang, financed) {
  if (financed && tab?.id === 1) {
    return { pl: "Aukcja Leasing VAT 23%", ru: "Аукцион Лизинг VAT 23%", en: "Auction Leasing VAT 23%" }[lang] || "Aukcja Leasing VAT 23%";
  }

  if (financed && tab?.id === 3) {
    return { pl: "Dealer Leasing VAT 23%", ru: "Дилер Лизинг VAT 23%", en: "Dealer Leasing VAT 23%" }[lang] || "Dealer Leasing VAT 23%";
  }

  return tab?.name?.[lang] || "";
}

const directSellerPayment = {
  pl: "Płatność za pojazd do sprzedawcy w EUR",
  ru: "Вы платите за автомобиль продавцу в EUR",
  en: "Payment to the seller in EUR",
};

const directDealerVat23Steps = {
  pl: [
    "Oddajemy 70% uzyskanego rabatu od sprzedawcy",
    "Wpłacasz kaucję w wys. zagranicznego VAT-u",
    directSellerPayment.pl,
  ],
  ru: [
    "Возвращаем 70% полученной скидки от продавца",
    "Вы вносите депозит в размере иностранного VAT",
    directSellerPayment.ru,
  ],
  en: [
    "We return 70% of the discount received from the seller",
    "You pay a deposit equal to the foreign VAT",
    directSellerPayment.en,
  ],
};

const invoiceVat23 = {
  pl: "Sprzedajemy na Fakturę VAT 23%",
  ru: "Продаём по инвойсу VAT 23%",
  en: "Sold with a VAT 23% invoice",
};

const invoiceVatMargin = {
  pl: "Sprzedajemy na Fakturę VAT Marża",
  ru: "Продаём по инвойсу VAT Marża",
  en: "Sold with a VAT Margin invoice",
};

const financingNotes = {
  pl: {
    ownFunds: "Kupujemy pojazd z własnych środków",
    ownFundsDeposit: "Kupujemy pojazd z własnych środków oraz wpłacamy kaucję w wys. zagranicznego VAT-u",
    ownContribution: "Wpłacenie wkładu własnego",
  },
  ru: {
    ownFunds: "Покупаем автомобиль за собственные средства",
    ownFundsDeposit: "Покупаем автомобиль за собственные средства и вносим депозит в размере иностранного VAT",
    ownContribution: "Вы вносите собственный взнос",
  },
  en: {
    ownFunds: "We buy the vehicle with our own funds",
    ownFundsDeposit: "We buy the vehicle with our own funds and pay a deposit equal to the foreign VAT",
    ownContribution: "You pay the down payment",
  },
};

function getProcessSteps(tab, lang, financed, hasGermanCommission = false, dealerDirect = false) {
  if (dealerDirect && tab.id === 3) {
    return directDealerVat23Steps[lang] || [];
  }

  const steps = {
    0: {
      pl: ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", directSellerPayment.pl],
      ru: ["Возвращаем 70% полученной скидки от продавца", directSellerPayment.ru],
      en: ["We return 70% of the discount received from the seller", directSellerPayment.en],
    },
    1: {
      pl: financed ? [financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, invoiceVat23.pl] : ["Płatność w PLN lub EUR", invoiceVat23.pl],
      ru: financed ? [financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, invoiceVat23.ru] : ["Вы оплачиваете всю сумму в PLN или EUR", invoiceVat23.ru],
      en: financed ? [financingNotes.en.ownContribution, financingNotes.en.ownFunds, invoiceVat23.en] : ["Payment in PLN or EUR", invoiceVat23.en],
    },
    2: {
      pl: financed ? [financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, invoiceVatMargin.pl] : ["Płatność w PLN lub EUR", invoiceVatMargin.pl],
      ru: financed ? [financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, invoiceVatMargin.ru] : ["Вы оплачиваете всю сумму в PLN или EUR", invoiceVatMargin.ru],
      en: financed ? [financingNotes.en.ownContribution, financingNotes.en.ownFunds, invoiceVatMargin.en] : ["Payment in PLN or EUR", invoiceVatMargin.en],
    },
    3: {
      pl: financed
        ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFundsDeposit, invoiceVat23.pl]
        : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Wpłacamy kaucję w wys. zagranicznego VAT-u", "Płatność w PLN lub EUR", invoiceVat23.pl],
      ru: financed
        ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFundsDeposit, invoiceVat23.ru]
        : ["Возвращаем 70% полученной скидки от продавца", "Вносим депозит в размере иностранного VAT", "Вы оплачиваете всю сумму в PLN или EUR", invoiceVat23.ru],
      en: financed
        ? ["We return 70% of the discount received from the seller", financingNotes.en.ownContribution, financingNotes.en.ownFundsDeposit, invoiceVat23.en]
        : ["We return 70% of the discount received from the seller", "You pay a deposit equal to the foreign VAT", "Payment in PLN or EUR", invoiceVat23.en],
    },
    4: {
      pl: financed
        ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, invoiceVatMargin.pl]
        : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Płatność w PLN lub EUR", invoiceVatMargin.pl],
      ru: financed
        ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, invoiceVatMargin.ru]
        : ["Возвращаем 70% полученной скидки от продавца", "Вы оплачиваете всю сумму в PLN или EUR", invoiceVatMargin.ru],
      en: financed
        ? ["We return 70% of the discount received from the seller", financingNotes.en.ownContribution, financingNotes.en.ownFunds, invoiceVatMargin.en]
        : ["We return 70% of the discount received from the seller", "Payment in PLN or EUR", invoiceVatMargin.en],
    },
  };

  if (hasGermanCommission && tab.id === 3) {
    if (lang === "ru") {
      return (
        financed
          ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFundsDeposit, directSellerPayment.ru]
          : ["Возвращаем 70% полученной скидки от продавца", "Вносим депозит в размере иностранного VAT", directSellerPayment.ru]
      );
    }
    if (lang === "en") {
      return financed
        ? ["We return 70% of the discount received from the seller", financingNotes.en.ownContribution, financingNotes.en.ownFundsDeposit, directSellerPayment.en]
        : ["We return 70% of the discount received from the seller", "You pay a deposit equal to the foreign VAT", directSellerPayment.en];
    }
    return financed
      ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFundsDeposit, directSellerPayment.pl]
      : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", "Wpłacamy kaucję w wys. zagranicznego VAT-u", directSellerPayment.pl];
  }

  if (hasGermanCommission && tab.id === 4) {
    if (lang === "ru") {
      return (
        financed
          ? ["Возвращаем 70% полученной скидки от продавца", financingNotes.ru.ownContribution, financingNotes.ru.ownFunds, directSellerPayment.ru]
          : ["Возвращаем 70% полученной скидки от продавца", directSellerPayment.ru]
      );
    }
    if (lang === "en") {
      return financed
        ? ["We return 70% of the discount received from the seller", financingNotes.en.ownContribution, financingNotes.en.ownFunds, directSellerPayment.en]
        : ["We return 70% of the discount received from the seller", directSellerPayment.en];
    }
    return financed
      ? ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", financingNotes.pl.ownContribution, financingNotes.pl.ownFunds, directSellerPayment.pl]
      : ["Oddajemy 70% uzyskanego rabatu od sprzedawcy", directSellerPayment.pl];
  }

  return steps[tab.id]?.[lang] || [];
}

const processHighlights = [
  "70% uzyskanego rabatu",
  "70% полученной скидки",
  "Вы вносите депозит",
  "do sprzedawcy w EUR",
  "продавцу в EUR",
  "w PLN lub EUR",
  "PLN lub EUR",
  "PLN или EUR",
  "na Fakturę VAT 23%",
  "Fakturę VAT 23%",
  "Faktura VAT 23%",
  "na Fakturę VAT Marża",
  "Fakturę VAT Marża",
  "Faktura VAT Marża",
  "инвойсу VAT 23%",
  "инвойсу VAT Marża",
  "własnych środków",
  "wkładu własnego",
  "Wpłacamy kaucję",
  "wpłacamy kaucję",
  "70% of the discount received",
  "You pay a deposit",
  "to the seller in EUR",
  "in PLN or EUR",
  "VAT 23% invoice",
  "VAT Margin invoice",
  "with our own funds",
  "down payment",
];

function splitHighlightedText(text) {
  const escaped = processHighlights
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const pattern = new RegExp(`(${escaped})`, "gi");
  return String(text).split(pattern).filter(Boolean);
}

function isHighlightedText(part) {
  return processHighlights.some((phrase) => phrase.toLowerCase() === String(part).toLowerCase());
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightedHtml(text) {
  return splitHighlightedText(text)
    .map((part) => (isHighlightedText(part) ? `<strong>${escapeHtml(part)}</strong>` : escapeHtml(part)))
    .join("");
}

function sanitizeProcessStepHtml(value) {
  if (typeof document === "undefined") return "";
  const template = document.createElement("template");
  const allowedTags = new Set(["B", "BR", "EM", "I", "STRONG"]);
  template.innerHTML = String(value || "");

  const cleanNode = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) return;
      if (child.nodeType !== Node.ELEMENT_NODE) {
        child.remove();
        return;
      }
      if (child.tagName === "SCRIPT" || child.tagName === "STYLE") {
        child.remove();
        return;
      }
      cleanNode(child);
      if (allowedTags.has(child.tagName)) {
        Array.from(child.attributes).forEach((attribute) => child.removeAttribute(attribute.name));
      } else {
        child.replaceWith(...Array.from(child.childNodes));
      }
    });
  };

  cleanNode(template.content);
  return template.innerHTML.trim();
}

function processStepOverrideKey(tabId, lang, financed, hasGermanCommission, dealerDirect, index) {
  return [tabId, lang, financed ? 1 : 0, hasGermanCommission ? 1 : 0, dealerDirect ? 1 : 0, index].join(":");
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
    maximumFractionDigits: 0,
  }).format(roundedCurrencyValue(value, currency));
}

function moneyExact(value, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    currencyDisplay: currencyDisplayFor(currency),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function rowContribution(item) {
  const value = Number(item?.totalValue);
  return Number.isFinite(value) ? value : n(item?.value);
}

function rowOverrideKey(tabId, rowId) {
  return `${tabId}:${String(rowId)}`;
}

function rowEditValue(item) {
  return String(Math.round(item.exact ? n(item.value) : roundedCurrencyValue(n(item.value), "PLN")));
}

function applyManualOverrides(calc, overrides, tabId) {
  let hasOverrides = false;
  const rows = calc.rows.map((item, index) => {
    const key = rowOverrideKey(tabId, item.id || index);
    if (!Object.prototype.hasOwnProperty.call(overrides, key)) {
      return { ...item, totalValue: rowContribution(item) };
    }

    hasOverrides = true;
    const manualValue = n(overrides[key]);
    const multiplier = Number(item.manualMultiplier);
    const safeMultiplier = Number.isFinite(multiplier) && multiplier >= 0 ? multiplier : 1;
    return {
      ...item,
      value: manualValue,
      totalValue: manualValue * safeMultiplier,
      manualText: overrides[key],
    };
  });

  return {
    ...calc,
    rows,
    total: hasOverrides ? rows.reduce((sum, item) => sum + rowContribution(item), 0) : calc.total,
  };
}

function applyFlexiblePresentation(calc, state, rate) {
  const options = normalizeMarginAuctionState(state);
  const managedByCalculation = Boolean(calc.flexibleManaged);
  const standardRows = calc.rows.map((item, index) => item.id ? item : { ...item, id: `standard-${index}` });
  const customRows = managedByCalculation
    ? []
    : options.customRows.map((item) => marginAuctionCustomRow(item, rate, true));
  const allRows = [...standardRows, ...customRows];
  const excluded = new Set(options.excludedRowIds);
  const visibleRows = allRows.filter((item) => !excluded.has(item.id));
  const removedContribution = managedByCalculation
    ? 0
    : standardRows
      .filter((item) => excluded.has(item.id))
      .reduce((sum, item) => sum + rowContribution(item), 0);
  const customContribution = managedByCalculation
    ? 0
    : customRows.reduce((sum, item) => sum + rowContribution(item), 0);
  const byId = new Map(visibleRows.map((item) => [item.id, item]));
  const orderedIds = [
    ...options.rowOrder.filter((id) => byId.has(id)),
    ...visibleRows.map((item) => item.id).filter((id) => !options.rowOrder.includes(id)),
  ];
  const rows = orderedIds.map((id) => {
    const item = byId.get(id);
    const edit = options.rowEdits[id] || {};
    return {
      ...item,
      label: Object.prototype.hasOwnProperty.call(edit, "label") ? edit.label : item.label,
      sub: Object.prototype.hasOwnProperty.call(edit, "sub") ? edit.sub : item.sub,
      valuePrefix: Object.prototype.hasOwnProperty.call(edit, "valuePrefix") ? edit.valuePrefix : item.valuePrefix,
    };
  });
  return {
    ...calc,
    total: managedByCalculation ? calc.total : calc.total - removedContribution + customContribution,
    composition: managedByCalculation || !calc.composition
      ? calc.composition
      : { ...calc.composition, other: n(calc.composition.other) + customContribution },
    rows,
  };
}

function formatHistoryDate(value, lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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
  return Object.fromEntries(
    Object.entries(values || {}).filter(([, value]) => String(value ?? "").trim() !== "")
  );
}

function hasCalculationInput(values) {
  return Boolean(values?.registrationEnabled) || Object.values(values || {}).some((value) => n(value) > 0);
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
      mobileDeUrl: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const tabId = Number(params.get("tab"));
  const nextTab = Number.isInteger(tabId) && tabs.some((tab) => tab.id === tabId) ? tabId : 0;
  const engineRaw = params.get("engine") ?? params.get("engineIndex");
  const engineParam = engineRaw === null ? NaN : Number(engineRaw);
  const rateParam = params.get("rate");
  const nextRate = n(rateParam);
  const values = {};

  ["car", "fee", "transport", "inspection", "discount", "germanCommission"].forEach((key) => {
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
    mobileDeUrl: params.get("mobileUrl") || params.get("url") || "",
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
    manualOverrides: item.manualOverrides || {},
    marginAuctionState: item.marginAuctionState || {},
    processStepOverrides: item.processStepOverrides || {},
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

const finalFixedTemplates = [
  { key: "inspection", label: { pl: "Oględziny specjalisty", ru: "Осмотр специалиста", en: "Specialist inspection" }, mode: "plus", vat: true },
  { key: "delivery", label: { pl: "Dostawa na lawecie", ru: "Доставка на автовозе", en: "Transport by car carrier" }, mode: "plus", vat: true },
  { key: "translation", label: { pl: "Tłumaczenie dokumentów", ru: "Перевод документов", en: "Document translation" }, mode: "plus", defaultPln: DOC_TRANSLATION },
  { key: "technical", label: { pl: "Przegląd techniczny", ru: "Техосмотр", en: "Technical inspection" }, mode: "plus", defaultPln: TO_FEE },
  { key: "commission", label: { pl: "Prowizja AUTOGOOD", ru: "Комиссия AUTOGOOD", en: "AUTOGOOD commission" }, mode: "plus", vat: true },
  { key: "deposit", label: { pl: "Zaliczka", ru: "Аванс", en: "Deposit" }, mode: "minus" },
];

const finalExtraTemplates = [
  { key: "dealerDiscount30", label: { pl: "30% rabatu dealera", ru: "30% скидки дилера", en: "30% of dealer discount" }, group: "extra", mode: "off", activeMode: "minus" },
  { key: "germanCompanyCommission", label: { pl: "Prowizja firmy niemieckiej", ru: "Комиссия немецкой фирмы", en: "German company commission" }, group: "extra", mode: "off", activeMode: "plus" },
  { key: "inspection2", label: { pl: "Oględziny x2", ru: "Осмотр x2", en: "Second inspection" }, group: "extra", mode: "off", activeMode: "plus", vat: true },
  { key: "detailing", label: { pl: "Detailing", ru: "Дитейлинг", en: "Detailing" }, group: "extra", mode: "off", activeMode: "plus" },
  { key: "painting", label: { pl: "Lakierowanie", ru: "Покраска", en: "Painting" }, group: "extra", mode: "off", activeMode: "plus" },
  { key: "service", label: { pl: "Serwis", ru: "Сервис", en: "Service" }, group: "extra", mode: "off", activeMode: "plus" },
  { key: "registration", label: { pl: "Rejestracja", ru: "Регистрация", en: "Registration" }, group: "extra", mode: "off", activeMode: "plus" },
  { key: "deposit2", label: { pl: "Zaliczka 2", ru: "Аванс 2", en: "Deposit 2" }, group: "extra", mode: "off", activeMode: "minus" },
];
const finalTemplates = [...finalFixedTemplates, ...finalExtraTemplates];
const FINAL_VAT_ROW_KEY = "final-vat-total";

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
  const converted = template.defaultPln
    ? convertFinalAmount(template.defaultPln, "PLN", currency, rate)
    : "";
  return {
    key: template.key,
    label: template.label,
    group: template.group || "fixed",
    amount: finalInputValue(converted, currency),
    mode: template.mode || "plus",
    activeMode: template.activeMode || template.mode || "plus",
    vat: Boolean(template.vat),
  };
}

function initialFinalItems(currency = "PLN", rate = DEFAULT_RATE) {
  return finalTemplates.map((template) => createFinalItem(template, currency, rate));
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
  const active = items.filter((item) => item.mode !== "off");
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
    total: positive - negative,
  };
}

function hasFinalInput(items) {
  return items.some((item) => item.mode !== "off" && n(item.amount) > 0);
}

function finalHistorySignature(item) {
  return JSON.stringify({
    finalCurrency: item.finalCurrency,
    rate: item.rate,
    items: item.items || [],
    finalVatRowIndex: item.finalVatRowIndex,
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
  return finalTemplates.find((template) => template.key === key);
}

function normalizeFinalItem(item) {
  const template = finalTemplateForKey(item.key);
  const savedLabel = item.label && typeof item.label === "object" ? item.label : {};
  return {
    ...item,
    label: { ...(template?.label || {}), ...savedLabel },
    group: template?.group || item.group || "fixed",
    mode: item.mode || template?.mode || "plus",
    activeMode: template?.activeMode || item.activeMode || template?.mode || "plus",
    vat: Boolean(template?.vat || item.vat),
    vatAdded: Boolean(item.vatAdded),
  };
}

function customFinalItem(label, currency) {
  const safeLabel = String(label || "").trim();
  return {
    key: `custom-${Date.now()}-${Math.round(Math.random() * 100000)}`,
    label: { pl: safeLabel, ru: safeLabel, en: safeLabel },
    group: "custom",
    amount: "",
    mode: "plus",
    activeMode: "plus",
    vat: false,
    vatAdded: false,
    isCustom: true,
    currency,
  };
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

function OptionalAmountInput({ label, value, checked, onToggle, onChange, suffix }) {
  return (
    <label className={`field optionalAmountField ${checked ? "isChecked" : ""}`}>
      <span className="optionalAmountLabel">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onToggle(event.target.checked)}
        />
        <span>{label}</span>
      </span>
      {checked && (
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
      )}
    </label>
  );
}

function OptionalFixedCostToggle({ label, checked, onToggle }) {
  return (
    <label className={`field optionalAmountField ${checked ? "isChecked" : ""}`}>
      <span className="optionalAmountLabel">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onToggle(event.target.checked)}
        />
        <span>{label}</span>
      </span>
    </label>
  );
}

function formatAvgRate(value) {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : DEFAULT_RATE);
}

function RateWidget({ c, avgRateLabel, rateDate, value, onChange }) {
  const currentRate = n(value) || DEFAULT_RATE;
  const stepRate = (delta) => {
    const nextRate = Math.max(0, currentRate + delta);
    onChange(calculationRateLabel(nextRate));
  };

  return (
    <div className="rateWidget">
      <span className="rateWidgetEyebrow">{c.exchange}</span>
      <div className="rateWidgetRow">
        <div className="rateWidgetAvg">
          <span>{c.avgRate}: <strong>{avgRateLabel} PLN</strong></span>
          <em>{rateDate}</em>
        </div>
        <div className="rateWidgetControl">
          <input
            inputMode="decimal"
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="4.26"
          />
          <b>PLN</b>
          <div className="rateWidgetSteps">
            <button type="button" aria-label="Zwiększ kurs" onClick={() => stepRate(0.01)}>+</button>
            <button type="button" aria-label="Zmniejsz kurs" onClick={() => stepRate(-0.01)}>−</button>
          </div>
        </div>
      </div>
    </div>
  );
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
      EUR_PLN: { label: "EUR - PLN", value: Math.round(eurPln * 10000) / 10000, unit: "PLN" },
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

function MobileDeImport({ c, url, status, summary, notice, onUrlChange, onImport }) {
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
      {notice && status === "ready" && (
        <p className="mobileImportStatus warning">{notice}</p>
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

function ProcessFlow({ steps, onChange }) {
  return (
    <ol className="processFlow" aria-label="Informacje">
      {steps.map((step) => (
        <li key={step.key} className="processStep">
          <span
            className="processStepEditor"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="false"
            dangerouslySetInnerHTML={{ __html: step.html }}
            onBlur={(event) => onChange(step.key, sanitizeProcessStepHtml(event.currentTarget.innerHTML))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              const html = event.clipboardData.getData("text/html");
              const text = event.clipboardData.getData("text/plain");
              document.execCommand("insertHTML", false, html ? sanitizeProcessStepHtml(html) : escapeHtml(text));
            }}
          />
        </li>
      ))}
    </ol>
  );
}

function MarginAuctionBreakdown({ c, composition }) {
  const categories = [
    ["vehicle", c.breakdownVehicle, "#2f7eea", n(composition?.vehicle)],
    ["taxes", c.breakdownTaxes, "#ef4444", n(composition?.taxes)],
    ["auctionFee", c.breakdownAuctionFee, "#14b8a6", n(composition?.auctionFee)],
    ["inspection", c.breakdownInspection, "#10b981", n(composition?.inspection)],
    ["transport", c.breakdownTransport, "#8b5cf6", n(composition?.transport)],
    ["commission", c.breakdownCommission, "#f59e0b", n(composition?.commission)],
    ["other", c.breakdownOther, "#64748b", n(composition?.other)],
  ]
    .map(([key, label, color, value]) => ({ key, label, color, value: Math.max(0, value) }))
    .filter((item) => item.value > 0);
  const total = categories.reduce((sum, item) => sum + item.value, 0);

  if (total <= 0) return null;

  const vehicleShare = (n(composition?.vehicle) / total) * 100;
  const primaryShare = ((n(composition?.vehicle) + n(composition?.taxes)) / total) * 100;
  const remainingShare = Math.max(0, 100 - primaryShare);
  const remainingMidpoint = primaryShare + remainingShare / 2;
  const formatShare = (value) => `${value.toFixed(value < 10 ? 1 : 0).replace(".", ",")}%`;

  return (
    <section className="marginAuctionBreakdown" aria-label={c.results}>
      <div className="marginAuctionBreakdownChart">
        <div className="marginAuctionBreakdownSummary" aria-hidden="true">
          <span className="marginAuctionBreakdownSummaryPrimary" style={{ left: `${vehicleShare}%` }}>
            {formatShare(primaryShare)}
          </span>
          {remainingShare > 0 && (
            <span className="marginAuctionBreakdownSummaryRest" style={{ left: `${remainingMidpoint}%` }}>
              {formatShare(remainingShare)}
            </span>
          )}
        </div>
        <div className="marginAuctionBreakdownBar" aria-hidden="true">
          {categories.map((item) => {
            const percentage = `${(item.value / total) * 100}%`;
            return <span key={item.key} style={{ width: percentage, flexBasis: percentage, backgroundColor: item.color }} />;
          })}
        </div>
      </div>
      <div className="marginAuctionBreakdownLegend">
        {categories.map((item) => {
          const percentage = (item.value / total) * 100;
          return (
            <div key={item.key} className="marginAuctionBreakdownItem" style={{ "--breakdown-color": item.color }}>
              <i aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{percentage.toFixed(percentage < 10 ? 1 : 0).replace(".", ",")}%</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MarginAuctionResultLines({ c, tabId, rows, manualOverrides, editingOverride, onStartAmountEdit, onAmountChange, onFinishAmountEdit, editingText, onStartTextEdit, onTextChange, onFinishTextEdit, onRemove, draggedRowId, dropHint, onDragStart, onDragOver, onDragEnd, onDrop }) {
  return (
    <div className="resultsList marginAuctionResultsList">
      {rows.map((item) => {
        const overrideKey = rowOverrideKey(tabId, item.id);
        const isAmountEditing = editingOverride === overrideKey;
        const textEditing = editingText?.id === item.id ? editingText.field : "";
        const isPrimary = item.id === "car" || item.id === "standard-0";

        return (
          <div
            key={item.id}
            className={`resultLine marginAuctionResultLine ${isPrimary ? "isPrimaryLine" : ""} ${draggedRowId === item.id ? "isDragging" : ""} ${dropHint?.id === item.id ? `isDropTarget drop-${dropHint.position}` : ""}`}
            data-margin-auction-row-id={item.id}
            onDragOver={(event) => onDragOver(event, item.id)}
            onDrop={(event) => {
              event.preventDefault();
              onDrop(item.id, dropHint?.id === item.id ? dropHint.position : "before");
            }}
          >
            <button
              type="button"
              className="marginAuctionDragHandle"
              data-html2canvas-ignore
              draggable
              title={c.flexibleEditTitle}
              aria-label={c.flexibleEditTitle}
              onDragStart={() => onDragStart(item.id)}
              onDragEnd={onDragEnd}
              onPointerDown={(event) => {
                if (event.pointerType !== "mouse") onDragStart(item.id);
              }}
              onPointerUp={(event) => {
                if (event.pointerType === "mouse") return;
                const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-margin-auction-row-id]");
                if (target?.dataset.marginAuctionRowId) onDrop(target.dataset.marginAuctionRowId);
                else onDragEnd();
              }}
            >
              ::
            </button>
            <span className="resultLineMarker" aria-hidden="true">{isPrimary ? "" : "+"}</span>
            <div className="resultLineBody">
              {textEditing === "label" ? (
                <input
                  className="marginAuctionTextInput marginAuctionLabelInput"
                  autoFocus
                  value={item.label}
                  onChange={(event) => onTextChange(item.id, "label", event.target.value)}
                  onBlur={onFinishTextEdit}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
                  }}
                />
              ) : (
                <button type="button" className="marginAuctionTextEdit resultLineLabel" onClick={() => onStartTextEdit(item.id, "label")}>
                  {item.label || c.flexibleEditTitle}
                </button>
              )}
              {textEditing === "sub" ? (
                <input
                  className="marginAuctionTextInput marginAuctionSubInput"
                  autoFocus
                  value={item.sub || ""}
                  placeholder={c.flexibleAddNote}
                  onChange={(event) => onTextChange(item.id, "sub", event.target.value)}
                  onBlur={onFinishTextEdit}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
                  }}
                />
              ) : item.sub ? (
                <button type="button" className="marginAuctionTextEdit resultLineSub" onClick={() => onStartTextEdit(item.id, "sub")}>
                  {item.sub}
                </button>
              ) : (
                <button type="button" className="marginAuctionAddNote" data-html2canvas-ignore onClick={() => onStartTextEdit(item.id, "sub")}>
                  {c.flexibleAddNote}
                </button>
              )}
            </div>
            {textEditing === "valuePrefix" ? (
              <input
                className="marginAuctionTextInput marginAuctionPrefixInput resultLinePrefix"
                autoFocus
                value={item.valuePrefix || ""}
                onChange={(event) => onTextChange(item.id, "valuePrefix", event.target.value)}
                onBlur={onFinishTextEdit}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
                }}
              />
            ) : item.valuePrefix ? (
              <button
                type="button"
                className="marginAuctionTextEdit resultLinePrefix"
                title={c.flexibleEditTitle}
                onClick={() => onStartTextEdit(item.id, "valuePrefix")}
              >
                {item.valuePrefix}
              </button>
            ) : <span className="resultLinePrefix" />}
            {isAmountEditing ? (
              <input
                className="resultLineAmount resultLineAmountInput"
                autoFocus
                inputMode="decimal"
                type="text"
                value={manualOverrides[overrideKey] ?? rowEditValue(item)}
                onChange={(event) => onAmountChange(overrideKey, event.target.value)}
                onBlur={onFinishAmountEdit}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
                }}
              />
            ) : (
              <strong
                className={`resultLineAmount ${item.derived ? "" : "resultLineAmountEdit"}`}
                role={item.derived ? undefined : "button"}
                tabIndex={item.derived ? undefined : 0}
                onClick={item.derived ? undefined : () => onStartAmountEdit(overrideKey, item)}
                onKeyDown={item.derived ? undefined : (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onStartAmountEdit(overrideKey, item);
                  }
                }}
              >
                {item.exact ? moneyExact(item.value) : money(item.value)}
              </strong>
            )}
            <span className="resultLineTag">{item.tag}</span>
            <button
              type="button"
              className="marginAuctionRemove"
              data-html2canvas-ignore
              title={c.flexibleRemove}
              aria-label={c.flexibleRemove}
              onClick={() => onRemove(item.id)}
            >
              -
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MarginAuctionWorkbench({ c, draft, onDraftChange, onAdd, removedRows, onRestore }) {
  return (
    <section className="marginAuctionWorkbench" aria-label={c.flexibleTitle}>
      <h2>{c.finalCustomTitle}</h2>
      <div className="marginAuctionWorkbenchFields">
        <label className="field marginAuctionNameField">
          <input
            type="text"
            value={draft.label}
            aria-label={c.flexibleName}
            placeholder={c.flexibleName}
            onChange={(event) => onDraftChange({ ...draft, label: event.target.value })}
          />
        </label>
        <label className="field marginAuctionAmountField">
          <input
            type="text"
            inputMode="decimal"
            value={draft.amount}
            aria-label={c.flexibleAmount}
            placeholder={c.flexibleAmount}
            onChange={(event) => onDraftChange({ ...draft, amount: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") onAdd();
            }}
          />
        </label>
        <label className="field marginAuctionCurrencyField">
          <select aria-label={c.flexibleCurrency} value={draft.currency} onChange={(event) => onDraftChange({ ...draft, currency: event.target.value })}>
            <option value="PLN">PLN</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
        <label className="marginAuctionVatToggle">
          <input type="checkbox" checked={draft.vat} onChange={(event) => onDraftChange({ ...draft, vat: event.target.checked })} />
          <span>{c.flexibleVat}</span>
        </label>
        <button type="button" className="marginAuctionAddButton" onClick={onAdd}>{c.flexibleAdd}</button>
      </div>
      {removedRows.length > 0 && (
        <div className="marginAuctionRemovedRows">
          <span>{c.flexibleRemoved}</span>
          <div>
            {removedRows.map((item) => (
              <div key={item.id} className="marginAuctionRemovedRow">
                <span>{item.label}</span>
                <button type="button" title={c.flexibleRestore} aria-label={`${c.flexibleRestore}: ${item.label}`} onClick={() => onRestore(item.id)}>+</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function HistoryPanel({ c, history, lang, onRestore, onDelete, emptyText }) {
  return (
    <aside className="card historyPanel">
      <h2>{c.historyTitle}</h2>
      {history.length === 0 ? (
        <p className="historyEmpty">{emptyText || c.historyEmpty}</p>
      ) : (
        <div className="historyList">
          {history.map((item) => (
            <div key={item.id} className="historyEntry">
              <button
                className="historyItem"
                type="button"
                title={c.historyRestore}
                onClick={() => onRestore(item)}
              >
                <strong>{item.title}</strong>
                <span>
                  {formatHistoryDate(item.savedAt, lang)} · {item.type === "final" ? item.finalCurrency : (item.dealerDirect ? c.directCommission : (item.financed ? c.financing : c.standard))}
                </span>
                <em>{money(item.total, item.finalCurrency || "PLN")}</em>
              </button>
              <button
                className="historyDelete"
                type="button"
                title={c.historyDelete}
                aria-label={c.historyDelete}
                onClick={() => onDelete(item)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function FinalModeControl({ c, value, onChange }) {
  return (
    <div className="finalModeControl" aria-label={c.finalCurrency}>
      <button type="button" className={value === "plus" ? "active plus" : "plus"} onClick={() => onChange("plus")}>+</button>
      <button type="button" className={value === "minus" ? "active minus" : "minus"} onClick={() => onChange("minus")}>−</button>
    </div>
  );
}

function FinalOffButton({ item, onToggle }) {
  return (
    <button
      type="button"
      className={`finalOffButton ${item.mode === "off" ? "active" : ""}`}
      onClick={onToggle}
      aria-label="Nie licz"
    >
      ×
    </button>
  );
}

function FinalItemInput({ c, item, lang, currency, onAmountChange, onModeChange, onOffToggle, onDelete }) {
  return (
    <div className={`finalInputRow mode-${item.mode}`}>
      <div className="finalRowActions">
        <FinalOffButton item={item} onToggle={onOffToggle} />
        {item.isCustom && (
          <button type="button" className="finalCustomDeleteBtn" onClick={onDelete} title={c.finalCustomDelete}>
            ×
          </button>
        )}
      </div>
      <div className="finalInputLabel">
        <span>{item.label[lang]}</span>
        <FinalModeControl c={c} value={item.mode} onChange={onModeChange} />
      </div>
      <div className="inputWrap">
        <input
          inputMode="decimal"
          type="text"
          value={item.amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="0.00"
          disabled={item.mode === "off"}
        />
        <b>{currency}</b>
      </div>
    </div>
  );
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
  onDeleteCustom,
}) {
  const leftItems = items.filter((item) => item.group !== "extra");
  const rightItems = items.filter((item) => item.group === "extra");

  const renderItem = (item) => (
    <FinalItemInput
      key={item.key}
      c={c}
      item={item}
      lang={lang}
      currency={currency}
      onAmountChange={(value) => onAmountChange(item.key, value)}
      onModeChange={(mode) => onModeChange(item.key, mode)}
      onOffToggle={() => onOffToggle(item.key)}
      onDelete={item.isCustom ? () => onDeleteCustom(item.key) : undefined}
    />
  );

  return (
    <>
      <div className="finalColumns">
        <div className="finalColumn">
          <div className="finalInputList">
            {leftItems.map(renderItem)}
          </div>
        </div>
        <div className="finalColumn">
          <div className="finalInputList">
            {rightItems.map(renderItem)}
          </div>
        </div>
      </div>

      <div className="finalCustomAdd">
        <h3 className="sidebarSubhead">{c.finalCustomTitle}</h3>
        <div className="finalCustomControl">
          <input
            type="text"
            value={customName}
            onChange={(event) => onCustomNameChange(event.target.value)}
            placeholder={c.finalCustomPlaceholder}
          />
          <button type="button" onClick={onAddCustom} disabled={!String(customName).trim()}>
            {c.finalCustomAdd}
          </button>
        </div>
      </div>
    </>
  );
}

function FinalCurrencyControl({ c, currency, onCurrencyChange }) {
  return (
    <div className="finalResultCurrency">
      <span>{c.finalCurrency}</span>
      <div className="segmented full">
        <button className={currency === "PLN" ? "active" : ""} onClick={() => onCurrencyChange("PLN")}>PLN</button>
        <button className={currency === "EUR" ? "active" : ""} onClick={() => onCurrencyChange("EUR")}>EUR</button>
      </div>
    </div>
  );
}

function FinalBalanceResults({ c, lang, currency, rate, calc, vatRowIndex, dropHint, onToggleVat, draggedRowKey, onDragStart, onDragOver, onDragEnd, onDrop, editingField, onStartEdit, onFinishEdit, onLabelChange, onAmountChange }) {
  const totalIsNegative = calc.total < 0;
  const totalLabel = totalIsNegative ? c.finalOverpaid : c.total;
  const displayedRows = [...calc.rows];
  displayedRows.splice(Math.min(Math.max(vatRowIndex, 0), displayedRows.length), 0, { key: FINAL_VAT_ROW_KEY, isVatTotal: true });

  return (
    <>
      <img className="resultCornerLogo" src="./assets/ag-opt.svg" alt="AUTOGOOD" />

      <h2 className="calcEyebrow">{c.finalBalance}</h2>

      <div className="rows finalRows">
        {displayedRows.map((item) => (
          <div
            key={item.key}
            className={`finalResultLine finalReorderLine ${item.isVatTotal ? "finalVatRow" : ""} ${draggedRowKey === item.key ? "isDragging" : ""} ${dropHint?.key === item.key ? `isDropTarget drop-${dropHint.position}` : ""}`}
            data-final-row-key={item.key}
            onDragOver={(event) => onDragOver(event, item.key)}
            onDrop={(event) => {
              event.preventDefault();
              onDrop(item.key, dropHint?.key === item.key ? dropHint.position : "before");
            }}
          >
            <button
              type="button"
              className="marginAuctionDragHandle finalDragHandle"
              data-html2canvas-ignore
              draggable
              title={c.finalDragTitle}
              aria-label={c.finalDragTitle}
              onDragStart={() => onDragStart(item.key)}
              onDragEnd={onDragEnd}
              onPointerDown={(event) => {
                if (event.pointerType !== "mouse") onDragStart(item.key);
              }}
              onPointerUp={(event) => {
                if (event.pointerType === "mouse") return;
                const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-final-row-key]");
                if (target?.dataset.finalRowKey) onDrop(target.dataset.finalRowKey, "before");
                else onDragEnd();
              }}
            >
              ::
            </button>
            {item.isVatTotal ? (
              <div className="resultRow finalResultRow mode-plus">
                <div className="rowText">
                  <span className="rowLabel">VAT 23%</span>
                </div>
                <div className="rowValue finalRowValue">
                  <strong>+ {moneyExact(calc.vatTotal || 0, currency)}</strong>
                </div>
              </div>
            ) : (
            <div className={`resultRow finalResultRow mode-${item.mode}`}>
              <div className="rowText">
                {editingField?.key === item.key && editingField.field === "label" ? (
                  <input
                    className="marginAuctionTextInput finalResultLabelInput"
                    autoFocus
                    value={item.label[lang] || ""}
                    onChange={(event) => onLabelChange(item.key, event.target.value)}
                    onBlur={onFinishEdit}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="marginAuctionTextEdit rowLabel finalResultLabelEdit"
                    onClick={() => onStartEdit(item.key, "label")}
                  >
                    {item.label[lang]}
                  </button>
                )}
              </div>
              <div className="rowValue finalRowValue">
                {editingField?.key === item.key && editingField.field === "amount" ? (
                  <input
                    className="finalResultAmountInput"
                    autoFocus
                    inputMode="decimal"
                    type="text"
                    value={item.amount}
                    onChange={(event) => onAmountChange(item.key, event.target.value)}
                    onBlur={onFinishEdit}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
                    }}
                  />
                ) : (
                  <strong
                    className="finalResultAmountEdit"
                    role="button"
                    tabIndex={0}
                    onClick={() => onStartEdit(item.key, "amount")}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onStartEdit(item.key, "amount");
                      }
                    }}
                  >
                    {finalSignedAmountLabel(item, currency)}
                  </strong>
                )}
              </div>
            </div>
            )}
            {!item.isVatTotal && item.mode === "plus" && (
              <button
                type="button"
                className={`finalVatToggle ${item.vatAdded ? "active" : ""}`}
                onClick={() => onToggleVat(item.key)}
                title={c.finalVatToggle}
                aria-pressed={Boolean(item.vatAdded)}
                aria-label={c.finalVatToggle}
              >
                {item.vatAdded ? "−" : "+"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={`totalBox finalTotalBox ${totalIsNegative ? "isOverpaid" : ""}`}>
        <span className="totalMarker" aria-hidden="true">=</span>
        <div className="totalLabel">
          <span>{totalLabel}</span>
        </div>
        <div className="totalValue">
          <strong>{moneyExact(Math.abs(calc.total), currency)}</strong>
          <em>= {oppositeCurrencyAmount(calc.total, currency, rate)}</em>
        </div>
        <div className="totalRate">{c.finalRateLine}: {calculationRateLabel(n(rate) || DEFAULT_RATE)} PLN</div>
      </div>
    </>
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

function row(label, value, tag, sub, highlight = false, exact = false, valuePrefix = "", totalValue = value, manualMultiplier = 1) {
  return { label, value, tag, sub, highlight, exact, valuePrefix, totalValue, manualMultiplier };
}

function marginAuctionRow(id, label, value, tag, sub, highlight = false, exact = false, valuePrefix = "", totalValue = value, manualMultiplier = 1, extra = {}) {
  return { id, ...row(label, value, tag, sub, highlight, exact, valuePrefix, totalValue, manualMultiplier), ...extra };
}

function initialMarginAuctionState() {
  return {
    excludedRowIds: [],
    rowOrder: [],
    rowEdits: {},
    customRows: [],
    removedRows: [],
  };
}

function normalizeMarginAuctionState(value) {
  const state = value && typeof value === "object" ? value : {};
  return {
    excludedRowIds: Array.isArray(state.excludedRowIds) ? state.excludedRowIds.filter((id) => typeof id === "string") : [],
    rowOrder: Array.isArray(state.rowOrder) ? state.rowOrder.filter((id) => typeof id === "string") : [],
    rowEdits: state.rowEdits && typeof state.rowEdits === "object" ? state.rowEdits : {},
    customRows: Array.isArray(state.customRows)
      ? state.customRows.filter((item) => item && typeof item.id === "string")
      : [],
    removedRows: Array.isArray(state.removedRows)
      ? state.removedRows.filter((item) => item && typeof item.id === "string")
      : [],
  };
}

function marginAuctionCustomRow(item, rate, vatEnabled = true) {
  const amount = n(item.amount);
  const currency = item.currency === "EUR" ? "EUR" : "PLN";
  const value = currency === "EUR" ? amount * rate : amount;
  const hasVat = Boolean(item.vat && vatEnabled);
  const vatMultiplier = hasVat ? 1 + VAT : 1;
  const gross = value * vatMultiplier;
  const sub = hasVat ? `${money(gross)} brutto` : "";
  return marginAuctionRow(
    item.id,
    String(item.label || ""),
    value,
    "",
    sub,
    false,
    false,
    currency === "EUR" ? conversionPrefix(amount, "EUR") : "",
    gross,
    vatMultiplier,
    { custom: true, vatEligible: hasVat, customCurrency: currency },
  );
}

function registrationRows(t, enabled, totalValue = REGISTRATION_NETTO, manualMultiplier = 1) {
  if (!enabled) return [];
  return [
    row(
      t.registration,
      REGISTRATION_NETTO,
      "",
      `${moneyExact(REGISTRATION_NETTO * (1 + VAT))} brutto`,
      false,
      true,
      "",
      totalValue,
      manualMultiplier,
    ),
  ];
}

function commissionFormula(fix, pct, base, discountPart = "") {
  return `${money(fix)} + (${(pct * 100).toFixed(0)}% × ${money(base)})${discountPart}`;
}

function calculateMarginAuction(values, rate, exciseRate, financed, lang, state) {
  const t = copy[lang].lines;
  const options = normalizeMarginAuctionState(state);
  const excluded = new Set(options.excludedRowIds);
  const include = (id) => !excluded.has(id);
  const useRate = rate > 0 ? rate : DEFAULT_RATE;
  const vatEnabled = include("vat");
  const vatMultiplier = vatEnabled ? 1 + VAT : 1;
  const carPln = include("car") ? n(values.car) * useRate : 0;
  const feePln = include("auctionFee") ? n(values.fee) * useRate : 0;
  const transportNetto = include("transport") ? n(values.transport) : 0;
  const base = carPln + feePln;
  const excise = include("excise") ? exciseRate * base : 0;
  const finFix = financed ? FIN_FIX : STD_FIX;
  const finPct = financed ? 0.05 : 0.02;
  const commissionNetto = include("commission") ? finFix + finPct * base : 0;
  const technicalNetto = include("technical") ? TO_FEE : 0;
  const registrationNetto = include("registration") && values.registrationEnabled ? REGISTRATION_NETTO : 0;
  const customRows = options.customRows.map((item) => marginAuctionCustomRow(item, useRate, vatEnabled));
  const customNetto = customRows.reduce((sum, item) => sum + n(item.value), 0);
  const customVatBase = customRows.reduce((sum, item) => sum + (item.vatEligible ? n(item.value) : 0), 0);
  const vatBase = feePln + transportNetto + excise + commissionNetto + technicalNetto + registrationNetto + customVatBase;
  const vat = vatEnabled ? vatBase * VAT : 0;
  const total = carPln + feePln + transportNetto + excise + commissionNetto + technicalNetto + registrationNetto + customNetto + vat;
  const rows = [
    ...(include("car") ? [marginAuctionRow("car", t.car, carPln, "", "", false, false, conversionPrefix(n(values.car)))] : []),
    ...(include("auctionFee") ? [marginAuctionRow("auctionFee", t.auctionFee, feePln, "", vatEnabled ? `${money(feePln * vatMultiplier)} brutto` : "", false, false, conversionPrefix(n(values.fee)), feePln * vatMultiplier, vatMultiplier)] : []),
    ...(include("transport") ? [marginAuctionRow("transport", t.transport, transportNetto, "", vatEnabled ? `${money(transportNetto * vatMultiplier)} brutto` : "", false, false, "", transportNetto * vatMultiplier, vatMultiplier)] : []),
    ...(include("excise") ? [marginAuctionRow("excise", t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(base)}`, false, false, "", excise * vatMultiplier, vatMultiplier)] : []),
    ...(include("commission") ? [marginAuctionRow("commission", t.commission, commissionNetto, "", commissionFormula(finFix, finPct, base), false, false, "", commissionNetto * vatMultiplier, vatMultiplier)] : []),
    ...(include("technical") ? [marginAuctionRow("technical", t.to, technicalNetto, "", "", false, true, "", technicalNetto * vatMultiplier, vatMultiplier)] : []),
    ...(registrationNetto > 0 ? [marginAuctionRow("registration", t.registration, registrationNetto, "", vatEnabled ? `${money(registrationNetto * vatMultiplier)} brutto` : "", false, true, "", registrationNetto * vatMultiplier, vatMultiplier)] : []),
    ...customRows,
    ...(vatEnabled ? [marginAuctionRow("vat", t.vat, vat, "", `23% × ${money(vatBase)}`, false, false, "", 0, 0, { derived: true })] : []),
  ];

  return {
    total,
    rows,
    flexibleManaged: true,
    composition: {
      vehicle: carPln,
      taxes: excise + vat,
      auctionFee: feePln,
      transport: transportNetto,
      commission: commissionNetto,
      other: technicalNetto + registrationNetto + customNetto,
    },
  };
}

function calculate(tabId, values, rate, exciseRate, financed, lang, dealerDirect = false, marginAuctionState) {
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
      composition: {
        vehicle: carPln,
        taxes: excise + vat,
        inspection,
        transport,
        commission: commissionNetto,
        other: TO_FEE + DOC_TRANSLATION + registrationNetto,
      },
      rows: [
        row(t.directCarBrutto, carPln, "", "", false, false, conversionPrefix(car)),
        row(t.inspection, inspection, "", `${money(inspectionBrutto)} brutto`, false, false, "", inspectionBrutto, 1.23),
        row(t.transport, transport, "", `${money(transportBrutto)} brutto`, false, false, "", transportBrutto, 1.23),
        row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`),
        row(t.commission, commissionNetto, "", commissionFormula(STD_FIX, 0.01, carPln, discountText), false, false, "", commissionBrutto, 1.23),
        row(t.to, TO_FEE, "", "", false, true),
        row(t.doc, DOC_TRANSLATION, "", "", false, true),
        ...registrationRows(t, values.registrationEnabled, registrationBrutto, 1.23),
        row(t.vat, vat, "", `23% × ${money(vatBase)}`, false, false, "", 0, 0),
      ],
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
      composition: {
        vehicle: carPln,
        taxes: excise + vat,
        auctionFee: feePln,
        transport: transPln,
        commission: commissionNetto,
        other: TO_FEE + registrationNetto,
      },
      rows: [
        row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)),
        row(t.auctionFee, feePln, "", `${money(feePln * 1.23)} brutto`, false, false, conversionPrefix(fee)),
        row(t.transport, transPln, "", `${money(transPln * 1.23)} brutto`),
        row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(base)}`),
        row(t.commission, commissionNetto, "", commissionFormula(finFix, finPct, commissionBase)),
        row(t.to, TO_FEE, "", "", false, true),
        ...registrationRows(t, values.registrationEnabled),
        row(t.vat, vat, "", `23% × ${money(vatBase)}`, false, false, "", 0, 0),
      ],
    };
  }

  if (tabId === MARGIN_AUCTION_TAB_ID) return calculateMarginAuction(values, rate, exciseRate, financed, lang, marginAuctionState);

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
    const rows = [
      row(t.carNetto, carPln, "", "", false, false, conversionPrefix(car)),
      ...(values.germanCommissionEnabled ? [row(t.germanCommission, germanCommissionPln, "", "", false, false, conversionPrefix(germanCommission))] : []),
      row(t.inspection, inspection, "", `${money(inspectionBrutto)} brutto`),
      row(t.transport, transport, "", `${money(transport * 1.23)} brutto`),
      row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`),
      row(t.commission, commissionNetto, "", commissionFormula(dealerDirect ? STD_FIX : finFix, commissionPct, commissionBase, discountText)),
      row(t.to, TO_FEE, "", "", false, true),
      ...registrationRows(t, values.registrationEnabled),
      row(t.vat, vat, "", `23% × ${money(vatBase)}`),
    ];

    return {
      total,
      composition: {
        vehicle: carPln,
        taxes: excise + vat,
        inspection,
        transport,
        commission: commissionNetto,
        other: TO_FEE + registrationNetto + germanCommissionPln,
      },
      rows,
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
  const rows = [
    row(t.car, carPln, "", "", false, false, conversionPrefix(car)),
    ...(values.germanCommissionEnabled ? [row(t.germanCommission, germanCommissionPln, "", "", false, false, conversionPrefix(germanCommission))] : []),
    row(t.inspection, inspection, "", `${money(inspectionBrutto)} brutto`, false, false, "", inspectionBrutto, 1.23),
    row(t.transport, transport, "", `${money(transportBrutto)} brutto`, false, false, "", transportBrutto, 1.23),
    row(t.excise, excise, "", `${(exciseRate * 100).toFixed(2)}% × ${money(carPln)}`, false, false, "", exciseBrutto, 1.23),
    row(t.commission, commissionNetto, "", commissionFormula(finFix, finPct, carPln, discountText), false, false, "", commissionBrutto, 1.23),
    row(t.to, TO_FEE, "", "", false, true, "", technicalBrutto, 1.23),
    ...registrationRows(t, values.registrationEnabled, registrationBrutto, 1.23),
    row(t.vat, vat, "", `23% × ${money(vatBase)}`, false, false, "", 0, 0),
  ];

  return {
    total,
    composition: {
      vehicle: carPln,
      taxes: excise + vat,
      inspection,
      transport,
      commission: commissionNetto,
      other: TO_FEE + registrationNetto + germanCommissionPln,
    },
    rows,
  };
}

function printCalculation({ lang, tab, title, rows, total, rate, financed, hasGermanCommission, dealerDirect = false, processStepHtml }) {
  const c = copy[lang];
  const calculationTitle = title || calculatorName(tab, lang, financed);
  const roundedTotal = roundedCurrencyValue(total, "PLN");
  const logoUrl = new URL("./assets/autogood-logo.png", window.location.href).href;
  const homeUrl = new URL("./", window.location.href).href;
  const rowsHtml = rows
    .map(
      (item, index) => {
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
      }
    )
    .join("");
  const defaultProcessSteps = getProcessSteps(tab, lang, financed, hasGermanCommission, dealerDirect);
  const processSteps = Array.isArray(processStepHtml) && processStepHtml.length === defaultProcessSteps.length
    ? processStepHtml
    : defaultProcessSteps.map(highlightedHtml);
  const processHtml = processSteps
    .map((step, index) => `${index > 0 ? '<span class="processArrow"> → </span>' : ""}<span class="processStep">${step}</span>`)
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
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function printFinalBalance({ lang, rows, vatTotal, vatRowIndex, total, currency, rate }) {
  const c = copy[lang];
  const logoUrl = new URL("./assets/autogood-logo.png", window.location.href).href;
  const homeUrl = new URL("./", window.location.href).href;
  const totalIsNegative = total < 0;
  const displayedRows = [...rows];
  displayedRows.splice(Math.min(Math.max(vatRowIndex, 0), displayedRows.length), 0, { key: FINAL_VAT_ROW_KEY, isVatTotal: true });
  const rowsHtml = displayedRows
    .map((item) => `
      <tr class="${item.mode === "minus" ? "minusRow" : ""} ${item.isVatTotal ? "vatRow" : ""}">
        <td><strong>${item.isVatTotal ? "VAT 23%" : item.label[lang]}</strong></td>
        <td><b>${item.isVatTotal ? `+ ${moneyExact(vatTotal || 0, currency)}` : finalSignedAmountLabel(item, currency)}</b></td>
      </tr>`
    )
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
    header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:20px;padding-bottom:18px;border-bottom:2px solid #dbe4ee}
    .printLogo{display:block;width:250px;height:auto}
    h1{margin:0;color:#005B82;font-size:30px;line-height:1;font-weight:800;text-align:right}
    table{width:100%;border-collapse:separate;border-spacing:0 7px;margin-top:4px}
    td{background:#fff;border-top:1px solid #dbe4ee;border-bottom:1px solid #dbe4ee;padding:12px 14px;vertical-align:middle}
    td:first-child{border-left:1px solid #dbe4ee;border-radius:8px 0 0 8px}
    td:last-child{width:260px;border-right:1px solid #dbe4ee;border-radius:0 8px 8px 0;text-align:right;white-space:nowrap}
    .minusRow td{background:#f8fbfd}
    .minusRow b{color:#0f766e}
    .vatRow td{background:#f3f7fa}
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
  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      if (image.decode) return image.decode().catch(() => undefined);
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })
  );
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
  const [marginAuctionState, setMarginAuctionState] = useState(() => initialMarginAuctionState());
  const [marginAuctionDraft, setMarginAuctionDraft] = useState({ label: "", amount: "", currency: "PLN", vat: false });
  const [editingMarginAuctionText, setEditingMarginAuctionText] = useState(null);
  const [draggedMarginAuctionRow, setDraggedMarginAuctionRow] = useState("");
  const [marginAuctionDropHint, setMarginAuctionDropHint] = useState(null);
  const [draggedFinalRow, setDraggedFinalRow] = useState("");
  const [finalVatRowIndex, setFinalVatRowIndex] = useState(Number.MAX_SAFE_INTEGER);
  const [finalDropHint, setFinalDropHint] = useState(null);
  const [editingFinalResult, setEditingFinalResult] = useState(null);
  const [processStepOverrides, setProcessStepOverrides] = useState({});
  const resultsRef = useRef(null);
  const rateTouchedRef = useRef(initialPrefill.rateTouched);

  const safeLang = lang || "pl";
  const c = copy[safeLang];
  const tab = tabs[activeTab];
  const isFinalBalance = activeTab === FINAL_TAB_ID;
  const exciseRate = engineTypes[engineIndex]?.rate ?? 0;
  const baseCalc = useMemo(
    () => calculate(activeTab, values, n(rate), exciseRate, financed, safeLang, dealerDirect, marginAuctionState),
    [activeTab, values, rate, exciseRate, financed, safeLang, dealerDirect, marginAuctionState]
  );
  const presentedCalc = useMemo(
    () => isFinalBalance ? baseCalc : applyFlexiblePresentation(baseCalc, marginAuctionState, n(rate) || DEFAULT_RATE),
    [baseCalc, isFinalBalance, marginAuctionState, rate]
  );
  const calc = useMemo(
    () => applyManualOverrides(presentedCalc, manualOverrides, activeTab),
    [presentedCalc, manualOverrides, activeTab]
  );
  const finalCalc = useMemo(() => calculateFinalBalance(finalItems), [finalItems]);
  const roundedTotal = roundedCurrencyValue(calc.total, "PLN");
  const activeTabName = calculatorName(tab, safeLang, activeTab > 0 && financed);
  const hasGermanCommission = (activeTab === 3 || activeTab === 4) && Boolean(values.germanCommissionEnabled);
  const defaultProcessSteps = getProcessSteps(tab, safeLang, financed, hasGermanCommission, activeTab === 3 && dealerDirect);
  const processSteps = defaultProcessSteps.map((step, index) => {
    const key = processStepOverrideKey(activeTab, safeLang, financed, hasGermanCommission, activeTab === 3 && dealerDirect, index);
    return {
      key,
      html: Object.prototype.hasOwnProperty.call(processStepOverrides, key) ? processStepOverrides[key] : highlightedHtml(step),
    };
  });
  const visibleHistory = isFinalBalance ? finalHistory : history;
  const avgRateLabel = formatAvgRate(Number(marketRates?.rates?.EUR_PLN?.value));
  const rateDate = new Intl.DateTimeFormat(safeLang === "ru" ? "ru-RU" : safeLang === "en" ? "en-GB" : "pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(marketRates?.effectiveDate ? new Date(marketRates.effectiveDate) : new Date());

  useEffect(() => {
    let isMounted = true;
    loadExchangeRates()
      .then((data) => {
        if (!isMounted) return;
        setMarketRates(data);
        setRatesStatus("ready");
        const nextRate = Number(data?.rates?.EUR_PLN?.value);
        if (Number.isFinite(nextRate) && nextRate > 0 && !rateTouchedRef.current) {
          setRate(calculationRateLabel(rateWithCalculationMargin(nextRate)));
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
    setDealerDirect(false);
    setManualOverrides({});
    setEditingOverride("");
    setMarginAuctionState(initialMarginAuctionState());
    setMarginAuctionDraft({ label: "", amount: "", currency: "PLN", vat: false });
    setEditingMarginAuctionText(null);
    setDraggedMarginAuctionRow("");
    setMarginAuctionDropHint(null);
    setDraggedFinalRow("");
    setEditingFinalResult(null);
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
    setValues((current) => ({ ...current, [key]: value }));
  };

  const setRegistrationEnabled = (checked) => {
    clearManualOverrides();
    setValues((current) => {
      const next = { ...current };
      if (checked) next.registrationEnabled = true;
      else delete next.registrationEnabled;
      return next;
    });
  };

  const setManualRate = (value) => {
    rateTouchedRef.current = true;
    clearManualOverrides();
    setRate(value);
  };

  const switchFinalCurrency = (currency) => {
    if (currency === finalCurrency) return;
    const safeRate = n(rate) || DEFAULT_RATE;
    setFinalItems((current) => current.map((item) => {
      const converted = convertFinalAmount(item.amount, finalCurrency, currency, safeRate);
      return { ...item, amount: finalInputValue(converted, currency) };
    }));
    setFinalCurrency(currency);
  };

  const setFinalAmount = (key, amount) => {
    setFinalItems((current) => current.map((item) => (
      item.key === key ? { ...item, amount } : item
    )));
  };

  const setFinalLabel = (key, value) => {
    setFinalItems((current) => current.map((item) => (
      item.key === key ? { ...item, label: { ...item.label, [safeLang]: value } } : item
    )));
  };

  const setFinalMode = (key, mode) => {
    setFinalItems((current) => current.map((item) => (
      item.key === key ? { ...item, mode, activeMode: mode, vatAdded: mode === "plus" ? item.vatAdded : false } : item
    )));
  };

  const toggleFinalOff = (key) => {
    setFinalItems((current) => current.map((item) => (
      item.key === key
        ? { ...item, mode: item.mode === "off" ? (item.activeMode || "plus") : "off" }
        : item
    )));
  };

  const toggleFinalVat = (key) => {
    setFinalItems((current) => current.map((item) => (
      item.key === key && item.mode === "plus" ? { ...item, vatAdded: !item.vatAdded } : item
    )));
  };

  const addCustomFinalItem = () => {
    const label = finalCustomName.trim();
    if (!label) return;
    setFinalItems((current) => [customFinalItem(label, finalCurrency), ...current]);
    setFinalCustomName("");
  };

  const deleteCustomFinalItem = (key) => {
    setFinalItems((current) => current.filter((item) => item.key !== key || !item.isCustom));
  };

  const moveFinalDisplayRow = (sourceKey, targetKey, position = "before") => {
    if (!sourceKey || !targetKey || sourceKey === targetKey) return;
    const activeKeys = finalCalc.rows.map((item) => item.key);
    const displayKeys = [...activeKeys];
    displayKeys.splice(Math.min(finalVatRowIndex, displayKeys.length), 0, FINAL_VAT_ROW_KEY);
    const sourceIndex = displayKeys.indexOf(sourceKey);
    if (sourceIndex < 0 || !displayKeys.includes(targetKey)) return;
    displayKeys.splice(sourceIndex, 1);
    const targetIndex = displayKeys.indexOf(targetKey);
    displayKeys.splice(targetIndex + (position === "after" ? 1 : 0), 0, sourceKey);

    setFinalVatRowIndex(displayKeys.indexOf(FINAL_VAT_ROW_KEY));
    const orderedActiveKeys = displayKeys.filter((key) => key !== FINAL_VAT_ROW_KEY);
    const activeSet = new Set(orderedActiveKeys);
    setFinalItems((current) => {
      const byKey = new Map(current.map((item) => [item.key, item]));
      let activeIndex = 0;
      return current.map((item) => (
        activeSet.has(item.key) ? byKey.get(orderedActiveKeys[activeIndex++]) : item
      ));
    });
  };

  const setManualOverride = (key, value) => {
    setManualOverrides((current) => {
      if (String(value).trim() === "") {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: value };
    });
  };

  const startManualOverride = (key, item) => {
    setManualOverrides((current) => (
      Object.prototype.hasOwnProperty.call(current, key) ? current : { ...current, [key]: rowEditValue(item) }
    ));
    setEditingOverride(key);
  };

  const updateMarginAuctionState = (updater) => {
    setMarginAuctionState((current) => normalizeMarginAuctionState(updater(normalizeMarginAuctionState(current))));
  };

  const addMarginAuctionRow = () => {
    const label = String(marginAuctionDraft.label || "").trim();
    const amount = n(marginAuctionDraft.amount);
    if (!label || amount <= 0) return;
    updateMarginAuctionState((current) => ({
      ...current,
      customRows: [
        ...current.customRows,
        {
          id: `custom-${Date.now()}-${Math.round(Math.random() * 100000)}`,
          label,
          amount: String(marginAuctionDraft.amount),
          currency: marginAuctionDraft.currency === "EUR" ? "EUR" : "PLN",
          vat: Boolean(marginAuctionDraft.vat),
        },
      ],
    }));
    setMarginAuctionDraft((current) => ({ ...current, label: "", amount: "", vat: false }));
  };

  const removeMarginAuctionRow = (id) => {
    clearManualOverrides();
    const row = calc.rows.find((item) => item.id === id);
    updateMarginAuctionState((current) => {
      const customRow = current.customRows.find((item) => item.id === id);
      if (!row && !customRow) return current;
      return {
        ...current,
        excludedRowIds: customRow || current.excludedRowIds.includes(id)
          ? current.excludedRowIds.filter((rowId) => rowId !== id)
          : [...current.excludedRowIds, id],
        rowOrder: current.rowOrder.filter((rowId) => rowId !== id),
        customRows: customRow ? current.customRows.filter((item) => item.id !== id) : current.customRows,
        removedRows: [
          ...current.removedRows.filter((item) => item.id !== id),
          { id, label: row?.label || customRow?.label || id, customRow: customRow || undefined },
        ],
      };
    });
  };

  const restoreMarginAuctionRow = (id) => {
    updateMarginAuctionState((current) => {
      const removedRow = current.removedRows.find((item) => item.id === id);
      if (!removedRow) return current;
      return {
        ...current,
        excludedRowIds: current.excludedRowIds.filter((rowId) => rowId !== id),
        customRows: removedRow.customRow
          ? [...current.customRows.filter((item) => item.id !== id), removedRow.customRow]
          : current.customRows,
        removedRows: current.removedRows.filter((item) => item.id !== id),
      };
    });
  };

  const setMarginAuctionText = (id, field, value) => {
    updateMarginAuctionState((current) => ({
      ...current,
      rowEdits: {
        ...current.rowEdits,
        [id]: { ...(current.rowEdits[id] || {}), [field]: value },
      },
    }));
  };

  const moveMarginAuctionRow = (sourceId, targetId, position = "before") => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const ids = calc.rows.map((item) => item.id);
    const sourceIndex = ids.indexOf(sourceId);
    if (sourceIndex < 0 || !ids.includes(targetId)) return;
    const nextOrder = ids.filter((id) => id !== sourceId);
    const targetIndex = nextOrder.indexOf(targetId);
    nextOrder.splice(targetIndex + (position === "after" ? 1 : 0), 0, sourceId);
    updateMarginAuctionState((current) => ({ ...current, rowOrder: nextOrder }));
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
        finalVatRowIndex: Math.min(finalVatRowIndex, finalCalc.rows.length),
        total: finalCalc.total,
        title: c.finalBalance,
      };
      const signature = finalHistorySignature(item);

      setFinalHistory((current) => {
        const next = [item, ...current.filter((saved) => finalHistorySignature(saved) !== signature)].slice(0, HISTORY_LIMIT);
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
      marginAuctionState,
      processStepOverrides,
      total: calc.total,
      title: activeTabName,
    };
    const signature = historySignature(item);

    setHistory((current) => {
      const next = [item, ...current.filter((saved) => historySignature(saved) !== signature)].slice(0, HISTORY_LIMIT);
      writeHistory(next);
      return next;
    });
    setScreenshotStatus("saved");
  };

  const restoreHistoryItem = (item) => {
    if (item.type === "final") {
      setLang(["pl", "ru", "en"].includes(item.lang) ? item.lang : "pl");
      setActiveTab(FINAL_TAB_ID);
      setManualOverrides({});
      setEditingOverride("");
      setMarginAuctionState(initialMarginAuctionState());
      setMarginAuctionDraft({ label: "", amount: "", currency: "PLN", vat: false });
      setEditingMarginAuctionText(null);
      setDraggedMarginAuctionRow("");
      setDraggedFinalRow("");
      setFinalDropHint(null);
      setFinalVatRowIndex(Number.isInteger(item.finalVatRowIndex) ? item.finalVatRowIndex : Number.MAX_SAFE_INTEGER);
      setEditingFinalResult(null);
      setFinalCurrency(item.finalCurrency === "EUR" ? "EUR" : "PLN");
      setFinalItems(Array.isArray(item.items) && item.items.length
        ? item.items.map(normalizeFinalItem)
        : initialFinalItems(item.finalCurrency || "PLN", n(rate) || DEFAULT_RATE));
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
    setMarginAuctionState(normalizeMarginAuctionState(item.marginAuctionState));
    setProcessStepOverrides(item.processStepOverrides && typeof item.processStepOverrides === "object" ? item.processStepOverrides : {});
    setMarginAuctionDraft({ label: "", amount: "", currency: "PLN", vat: false });
    setEditingMarginAuctionText(null);
    setDraggedMarginAuctionRow("");
    setDraggedFinalRow("");
    setEditingFinalResult(null);
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

  const deleteHistoryItem = (item) => {
    if (item.type === "final") {
      setFinalHistory((current) => {
        const next = current.filter((saved) => saved.id !== item.id);
        writeHistory(next, FINAL_HISTORY_KEY);
        return next;
      });
      return;
    }

    setHistory((current) => {
      const next = current.filter((saved) => saved.id !== item.id);
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
      const inspectionNettoPln = Number(
        data?.inspectionNettoPln
        ?? data?.deliveryInspectionEstimate?.inspection
        ?? data?.transportEstimate?.inspection
      );
      const nextEngineIndex = Number(data?.engineTypeIndex);

      // "Dealerzy VAT 23%" asks for the net car price; every other tab wants the
      // gross listing price. VAT-deductible ads print the net price next to the
      // gross one — if it is missing (margin ads), leave the field for manual entry.
      const wantsNettoCar = activeTab === 3;
      const hasNettoCar = Number.isFinite(carNettoEur) && carNettoEur > 0;

      if (wantsNettoCar) {
        if (hasNettoCar) setField("car", String(Math.round(carNettoEur)));
        else setMobileDeNotice(c.mobileImportNoNetto);
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
        useCORS: true,
      });
      const canvas = frameScreenshotCanvas(rawCanvas, SCREENSHOT_EDGE_PADDING, scale, "#ffffff");
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

  return (
    <main className={`appShell ${isFinalBalance ? "appShellFinalVat" : ""}`}>
      <header className="topbar">
        <div className="logoGroup">
          <a className="logoLink" href="./" aria-label="AUTOGOOD home">
            <img className="logoMark" src="./assets/autogood-logo.png" alt="AUTOGOOD" />
          </a>
          <span className="logoDivider" aria-hidden="true" />
          <h1 className="logoTitle">{c.navTitle}</h1>
        </div>
        <div className="headerActions">
          <div className="langSwitch" aria-label="Language">
            <button className={lang === "pl" ? "active" : ""} onClick={() => setLang("pl")}>PL</button>
            <button className={lang === "ru" ? "active" : ""} onClick={() => setLang("ru")}>RU</button>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
          <button
            className="printBtn"
            onClick={() => (
              isFinalBalance
                ? printFinalBalance({
                  lang: safeLang,
                  rows: finalCalc.rows,
                  vatTotal: finalCalc.vatTotal,
                  vatRowIndex: finalVatRowIndex,
                  total: finalCalc.total,
                  currency: finalCurrency,
                  rate: n(rate) || DEFAULT_RATE,
                })
                : printCalculation({ lang: safeLang, tab, title: activeTabName, rows: calc.rows, total: calc.total, rate: n(rate) || DEFAULT_RATE, financed, hasGermanCommission, dealerDirect: activeTab === 3 && dealerDirect, processStepHtml: processSteps.map((step) => step.html) })
            )}
          >
            {c.print}
          </button>
          <button className="printBtn screenshotBtn" onClick={copyScreenshot}>
            {c.screenshot}
          </button>
          <button className="printBtn saveBtn" onClick={saveCalculation}>
            {c.saveCalculation}
          </button>
        </div>
      </header>

      <div className="tabsRow">
        <nav className="tabs" aria-label="Calculators">
          {tabs.map((item) => (
            <button key={item.id} className={item.id === activeTab ? "active" : ""} onClick={() => switchTab(item.id)}>
              {calculatorName(item, safeLang, item.id === activeTab && item.id > 0 && financed)}
            </button>
          ))}
        </nav>
        <RateWidget c={c} avgRateLabel={avgRateLabel} rateDate={rateDate} value={rate} onChange={setManualRate} />
      </div>

      <section className={`grid ${isFinalBalance ? "finalGrid" : ""}`}>
        <aside className={isFinalBalance ? "panelData finalSidebar" : "panelData"}>
          {isFinalBalance ? (
            <>
              <div className="finalDataHeader">
                <h2 className="panelEyebrow">{c.inputs}</h2>
                <FinalCurrencyControl c={c} currency={finalCurrency} onCurrencyChange={switchFinalCurrency} />
              </div>
              <FinalBalanceInputs
                c={c}
                lang={safeLang}
                currency={finalCurrency}
                items={finalItems}
                customName={finalCustomName}
                onCustomNameChange={setFinalCustomName}
                onAddCustom={addCustomFinalItem}
                onAmountChange={setFinalAmount}
                onModeChange={setFinalMode}
                onOffToggle={toggleFinalOff}
                onDeleteCustom={deleteCustomFinalItem}
              />
            </>
          ) : (
            <>
          <h2 className="panelEyebrow">{c.inputs}</h2>

          {MOBILEDE_TABS.includes(activeTab) && (
            <MobileDeImport
              c={c}
              url={mobileDeUrl}
              status={mobileDeStatus}
              summary={mobileDeSummary}
              notice={mobileDeNotice}
              onUrlChange={setMobileDeUrl}
              onImport={loadMobileDeData}
            />
          )}

          {activeTab > 0 && (
            <div className="toggleBlock">
              <span>{c.commissionType}</span>
              <div className={`commissionSegment ${activeTab === 3 ? "withDirect" : ""}`}>
                <button className={!financed && !dealerDirect ? "active" : ""} onClick={() => {
                  clearManualOverrides();
                  setFinanced(false);
                  setDealerDirect(false);
                }}>{c.standard}</button>
                <button className={financed && !dealerDirect ? "active" : ""} onClick={() => {
                  clearManualOverrides();
                  setFinanced(true);
                  setDealerDirect(false);
                }}>{c.financing}</button>
                {activeTab === 3 && (
                  <button className={dealerDirect ? "active" : ""} onClick={() => {
                    clearManualOverrides();
                    setFinanced(false);
                    setDealerDirect(true);
                  }}>{c.directCommission}</button>
                )}
              </div>
            </div>
          )}

          <label className="field">
            <span>{c.engine}</span>
            <select value={engineIndex} onChange={(event) => {
              clearManualOverrides();
              setEngineIndex(Number(event.target.value));
            }}>
              {engineTypes.map((engine, index) => (
                <option key={engine.label.pl} value={index}>
                  {engine.label[safeLang]} — {percentLabel(engine.rate)}
                </option>
              ))}
            </select>
          </label>

          <div className="divider" />

          <OptionalFixedCostToggle
            label={c.lines.registration}
            checked={Boolean(values.registrationEnabled)}
            onToggle={setRegistrationEnabled}
          />

          {tab.fields.map((field) => (
            field.optional ? (
              <OptionalAmountInput
                key={field.key}
                label={field.label[lang]}
                checked={Boolean(values[`${field.key}Enabled`])}
                value={values[field.key] || ""}
                onToggle={(checked) => setField(`${field.key}Enabled`, checked)}
                onChange={(value) => setField(field.key, value)}
                suffix={field.currency}
              />
            ) : (
              <NumInput
                key={field.key}
                label={field.label[lang]}
                value={values[field.key] || ""}
                onChange={(value) => setField(field.key, value)}
                suffix={field.currency}
              />
            )
          ))}

          {!isFinalBalance && (
            <MarginAuctionWorkbench
              c={c}
              draft={marginAuctionDraft}
              onDraftChange={setMarginAuctionDraft}
              onAdd={addMarginAuctionRow}
              removedRows={marginAuctionState.removedRows}
              onRestore={restoreMarginAuctionRow}
            />
          )}
            </>
          )}
        </aside>

        <section className={isFinalBalance ? "panelCalc results finalResults" : "panelCalc"} ref={resultsRef}>
          {isFinalBalance ? (
            <FinalBalanceResults
              c={c}
              lang={safeLang}
              currency={finalCurrency}
              rate={n(rate) || DEFAULT_RATE}
              calc={finalCalc}
              vatRowIndex={finalVatRowIndex}
              dropHint={finalDropHint}
              onToggleVat={toggleFinalVat}
              draggedRowKey={draggedFinalRow}
              onDragStart={(key) => {
                setDraggedFinalRow(key);
                setFinalDropHint(null);
              }}
              onDragOver={(event, key) => {
                event.preventDefault();
                if (!draggedFinalRow || draggedFinalRow === key) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const position = event.clientY >= rect.top + rect.height / 2 ? "after" : "before";
                setFinalDropHint({ key, position });
              }}
              onDragEnd={() => {
                setDraggedFinalRow("");
                setFinalDropHint(null);
              }}
              onDrop={(targetKey, position) => {
                moveFinalDisplayRow(draggedFinalRow, targetKey, position);
                setDraggedFinalRow("");
                setFinalDropHint(null);
              }}
              editingField={editingFinalResult}
              onStartEdit={(key, field) => setEditingFinalResult({ key, field })}
              onFinishEdit={() => setEditingFinalResult(null)}
              onLabelChange={setFinalLabel}
              onAmountChange={setFinalAmount}
            />
          ) : (
            <>
          <img className="resultCornerLogo" src="./assets/ag-opt.svg" alt="AUTOGOOD" />
          <h2 className="calcEyebrow">{c.results} — {activeTabName}</h2>

          <MarginAuctionResultLines
            c={c}
            tabId={activeTab}
            rows={calc.rows}
            manualOverrides={manualOverrides}
            editingOverride={editingOverride}
            onStartAmountEdit={startManualOverride}
            onAmountChange={setManualOverride}
            onFinishAmountEdit={() => setEditingOverride("")}
            editingText={editingMarginAuctionText}
            onStartTextEdit={(id, field) => setEditingMarginAuctionText({ id, field })}
            onTextChange={setMarginAuctionText}
            onFinishTextEdit={() => setEditingMarginAuctionText(null)}
            onRemove={removeMarginAuctionRow}
            draggedRowId={draggedMarginAuctionRow}
            dropHint={marginAuctionDropHint}
            onDragStart={(id) => {
              setDraggedMarginAuctionRow(id);
              setMarginAuctionDropHint(null);
            }}
            onDragOver={(event, id) => {
              event.preventDefault();
              if (!draggedMarginAuctionRow || draggedMarginAuctionRow === id) return;
              const rect = event.currentTarget.getBoundingClientRect();
              const position = event.clientY >= rect.top + rect.height / 2 ? "after" : "before";
              setMarginAuctionDropHint({ id, position });
            }}
            onDragEnd={() => {
              setDraggedMarginAuctionRow("");
              setMarginAuctionDropHint(null);
            }}
            onDrop={(targetId, position) => {
              moveMarginAuctionRow(draggedMarginAuctionRow, targetId, position);
              setDraggedMarginAuctionRow("");
              setMarginAuctionDropHint(null);
            }}
          />

          <div className="totalBar">
            <div className="totalBarLeft">
              <span className="totalBarMark" aria-hidden="true">=</span>
              <span className="totalBarLabel">{c.total}</span>
            </div>
            <div className="totalBarRight">
              <div className="totalBarValueRow">
                <strong className="totalBarValue">{money(calc.total)}</strong>
                <em className="totalBarEur">= {money(roundedTotal / (n(rate) || DEFAULT_RATE), "EUR")}</em>
              </div>
              <div className="totalBarRate">{c.rateLine}: {calculationRateLabel(n(rate) || DEFAULT_RATE)} PLN</div>
            </div>
          </div>

          <ProcessFlow
            steps={processSteps}
            onChange={(key, html) => setProcessStepOverrides((current) => ({ ...current, [key]: html }))}
          />
          {calc.composition && <MarginAuctionBreakdown c={c} composition={calc.composition} />}
            </>
          )}
        </section>

        <HistoryPanel
          c={c}
          history={visibleHistory}
          lang={safeLang}
          onRestore={restoreHistoryItem}
          onDelete={deleteHistoryItem}
          emptyText={isFinalBalance ? c.finalHistoryEmpty : c.historyEmpty}
        />
      </section>
      {screenshotStatus && (
        <div className={`toast ${screenshotStatus}`}>
          {screenshotStatus === "ready" && c.screenshotReady}
          {screenshotStatus === "opened" && c.screenshotOpened}
          {screenshotStatus === "error" && c.screenshotError}
          {screenshotStatus === "saved" && c.saveCalculationReady}
          {screenshotStatus === "saveEmpty" && c.saveCalculationEmpty}
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
