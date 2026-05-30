const dealStorageKey = "autogoodDealDesk.v1";

const templates = [
  {
    id: "first-reply",
    title: { ru: "Первичный ответ", pl: "Pierwsza odpowiedz" },
    ru: `Здравствуйте, {clientName}.

Спасибо за обращение в AUTOGOOD. Я зафиксировал запрос по автомобилю {carModel}.

Следующий шаг: уточню вводные, проверю доступные варианты у дилеров и на аукционах, затем подготовлю понятный расчёт с доставкой, налогами и комиссией.

Если есть обязательные параметры по комплектации, пробегу, цвету или бюджету — пришлите, пожалуйста, одним сообщением.`,
    pl: `Dzien dobry, {clientName}.

Dziekuje za kontakt z AUTOGOOD. Zapisalem zapytanie dotyczace auta {carModel}.

Nastepny krok: doprecyzuje wymagania, sprawdze dostepne oferty u dealerow i na aukcjach, a nastepnie przygotuje przejrzysta kalkulacje z transportem, podatkami i prowizja.

Jesli sa obowiazkowe wymagania dotyczace wyposazenia, przebiegu, koloru albo budzetu, prosze wyslac je w jednej wiadomosci.`,
  },
  {
    id: "calculation-ready",
    title: { ru: "Расчёт готов", pl: "Kalkulacja gotowa" },
    ru: `{clientName}, подготовил расчёт по {carModel}.

Источник авто: {carSource}
Статус: {status}
Ориентир бюджета клиента: {clientBudget} PLN
Следующий шаг: {nextStep}

В расчёте отдельно учитываем стоимость автомобиля, доставку, технические расходы, акциз/VAT и комиссию AUTOGOOD. Если вариант подходит, следующим шагом проверяем VIN, историю и подтверждаем условия с продавцом.`,
    pl: `{clientName}, przygotowalem kalkulacje dla {carModel}.

Zrodlo auta: {carSource}
Status: {status}
Orientacyjny budzet klienta: {clientBudget} PLN
Nastepny krok: {nextStep}

W kalkulacji osobno uwzgledniamy cene auta, transport, koszty techniczne, akcyze/VAT oraz prowizje AUTOGOOD. Jesli wariant pasuje, kolejnym krokiem sprawdzamy VIN, historie i potwierdzamy warunki ze sprzedawca.`,
  },
  {
    id: "vin-check",
    title: { ru: "Проверка VIN", pl: "Sprawdzenie VIN" },
    ru: `{clientName}, по {carModel} перехожу к проверке автомобиля.

VIN: {vin}
Проверю историю, комплектацию, документы, фото/видео и возможные риски. Если появятся вопросы к продавцу, соберу их в один список и отправлю на подтверждение.`,
    pl: `{clientName}, przechodze do weryfikacji auta {carModel}.

VIN: {vin}
Sprawdze historie, wyposazenie, dokumenty, zdjecia/wideo oraz potencjalne ryzyka. Jesli pojawia sie pytania do sprzedawcy, zbiore je w jedna liste i wysle do potwierdzenia.`,
  },
  {
    id: "documents",
    title: { ru: "Документы и оплата", pl: "Dokumenty i platnosc" },
    ru: `{clientName}, по сделке {carModel} следующий этап — документы и оплата.

Подготовим договорённости, proforma/faktura и список платежей. Перед оплатой ещё раз сверим данные продавца, VIN, сумму, валюту и назначение платежа.`,
    pl: `{clientName}, dla transakcji {carModel} kolejnym etapem sa dokumenty i platnosc.

Przygotujemy ustalenia, proforme/fakture oraz liste platnosci. Przed platnoscia jeszcze raz sprawdzimy dane sprzedawcy, VIN, kwote, walute i tytul przelewu.`,
  },
  {
    id: "logistics",
    title: { ru: "Логистика", pl: "Logistyka" },
    ru: `{clientName}, автомобиль {carModel} переходит в этап логистики.

Согласуем адрес забора, перевозчика, стоимость и ориентировочную дату прибытия. Как только будет подтверждение по транспорту, отправлю обновление.`,
    pl: `{clientName}, auto {carModel} przechodzi do etapu logistyki.

Uzgodnimy adres odbioru, przewoznika, koszt oraz orientacyjna date dostawy. Gdy transport bedzie potwierdzony, wysle aktualizacje.`,
  },
  {
    id: "handover",
    title: { ru: "Выдача авто", pl: "Wydanie auta" },
    ru: `{clientName}, финальный этап по {carModel} — подготовка к выдаче.

Сверяем документы, регистрацию/техосмотр/переводы, финальный баланс и время передачи автомобиля. После выдачи буду благодарен за обратную связь и отзыв.`,
    pl: `{clientName}, finalny etap dla {carModel} to przygotowanie do wydania.

Sprawdzamy dokumenty, rejestracje/badanie techniczne/tlumaczenia, koncowy bilans i godzine przekazania auta. Po wydaniu bede wdzieczny za feedback i opinie.`,
  },
];

const fallbackDeal = {
  clientName: "клиент",
  carModel: "выбранному автомобилю",
  vin: "не указан",
  status: "Новый запрос",
  carSource: "не указан",
  clientBudget: "не указан",
  nextStep: "уточнить следующий шаг",
};

const languageSelect = document.querySelector("#messageLanguage");
const stageSelect = document.querySelector("#messageStage");
const messageTitle = document.querySelector("#messageTitle");
const messageText = document.querySelector("#messageText");
const copyButton = document.querySelector("#copyCurrentMessage");
const refreshButton = document.querySelector("#refreshMessages");
const copyState = document.querySelector("#copyState");

function readDeal() {
  try {
    return { ...fallbackDeal, ...JSON.parse(localStorage.getItem(dealStorageKey) || "{}") };
  } catch {
    return fallbackDeal;
  }
}

function fillTemplate(template, deal) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = deal[key];
    return value === undefined || value === "" ? fallbackDeal[key] || "не указано" : value;
  });
}

function updateDealSummary(deal) {
  document.querySelector("#messageClient").textContent = deal.clientName || "Не указано";
  document.querySelector("#messageCar").textContent = deal.carModel || "Не указано";
  document.querySelector("#messageStatus").textContent = deal.status || "Новый запрос";
  document.querySelector("#messageNextStep").textContent = deal.nextStep || "Не указан";
}

function renderMessage() {
  const deal = readDeal();
  const language = languageSelect.value;
  const selected = templates.find((template) => template.id === stageSelect.value) || templates[0];
  updateDealSummary(deal);
  messageTitle.textContent = selected.title[language];
  messageText.value = fillTemplate(selected[language], deal);
  copyState.textContent = "Готово";
}

function populateStages() {
  stageSelect.innerHTML = templates
    .map((template) => `<option value="${template.id}">${template.title.ru}</option>`)
    .join("");
}

async function copyMessage() {
  messageText.select();
  try {
    await navigator.clipboard.writeText(messageText.value);
    copyState.textContent = "Скопировано";
  } catch {
    document.execCommand("copy");
    copyState.textContent = "Скопировано";
  }
}

populateStages();
languageSelect.addEventListener("change", renderMessage);
stageSelect.addEventListener("change", renderMessage);
refreshButton.addEventListener("click", renderMessage);
copyButton.addEventListener("click", copyMessage);
renderMessage();
