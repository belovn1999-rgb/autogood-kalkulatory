const dealStorageKey = "autogoodDealDesk.v1";

const fallbackDeal = {
  clientName: "не указано",
  clientPhone: "не указано",
  clientEmail: "не указано",
  leadSource: "не указано",
  carModel: "не указано",
  vin: "не указано",
  year: "не указано",
  mileage: "не указано",
  listingUrl: "не указано",
  status: "Новый запрос",
  carSource: "не указан",
  clientBudget: "не указан",
  targetPrice: "не указана",
  nextStep: "не указан",
  carPriceEur: "не указана",
  eurRate: "4.26",
  transportPln: "не указана",
  costsPln: "не указаны",
  commissionPln: "не указана",
  salePricePln: "не указана",
  notes: "",
};

const documents = [
  {
    id: "client-brief",
    title: { ru: "Бриф клиента", pl: "Brief klienta" },
    ru: (d) => `AUTOGOOD | БРИФ КЛИЕНТА

Клиент
- Имя: ${d.clientName}
- Телефон / WhatsApp: ${d.clientPhone}
- Email: ${d.clientEmail}
- Канал входа: ${d.leadSource}

Запрос по автомобилю
- Авто: ${d.carModel}
- Год: ${d.year}
- Пробег: ${d.mileage} км
- Бюджет клиента: ${d.clientBudget} PLN
- Источник авто: ${d.carSource}

Текущий статус
- Статус: ${d.status}
- Следующий шаг: ${d.nextStep}

Заметки менеджера
${d.notes || "Нет заметок."}`,
    pl: (d) => `AUTOGOOD | BRIEF KLIENTA

Klient
- Imie: ${d.clientName}
- Telefon / WhatsApp: ${d.clientPhone}
- Email: ${d.clientEmail}
- Kanal pozyskania: ${d.leadSource}

Zapytanie o auto
- Auto: ${d.carModel}
- Rok: ${d.year}
- Przebieg: ${d.mileage} km
- Budzet klienta: ${d.clientBudget} PLN
- Zrodlo auta: ${d.carSource}

Aktualny status
- Status: ${d.status}
- Nastepny krok: ${d.nextStep}

Notatki managera
${d.notes || "Brak notatek."}`,
  },
  {
    id: "offer-summary",
    title: { ru: "Offer summary", pl: "Podsumowanie oferty" },
    ru: (d) => `AUTOGOOD | КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ

Автомобиль
- Модель: ${d.carModel}
- VIN: ${d.vin}
- Год: ${d.year}
- Пробег: ${d.mileage} км
- Ссылка: ${d.listingUrl}

Финансовый ориентир
- Цена авто: ${d.carPriceEur} EUR
- Курс EUR/PLN: ${d.eurRate}
- Доставка: ${d.transportPln} PLN
- Дополнительные расходы: ${d.costsPln} PLN
- Комиссия AUTOGOOD: ${d.commissionPln} PLN
- Плановая цена клиенту: ${d.salePricePln || d.targetPrice} PLN

Комментарий
Финальный расчёт зависит от подтверждения цены продавцом, типа VAT, акциза, транспорта и комплекта документов.`,
    pl: (d) => `AUTOGOOD | PODSUMOWANIE OFERTY

Auto
- Model: ${d.carModel}
- VIN: ${d.vin}
- Rok: ${d.year}
- Przebieg: ${d.mileage} km
- Link: ${d.listingUrl}

Orientacja finansowa
- Cena auta: ${d.carPriceEur} EUR
- Kurs EUR/PLN: ${d.eurRate}
- Transport: ${d.transportPln} PLN
- Dodatkowe koszty: ${d.costsPln} PLN
- Prowizja AUTOGOOD: ${d.commissionPln} PLN
- Planowana cena dla klienta: ${d.salePricePln || d.targetPrice} PLN

Komentarz
Koncowa kalkulacja zalezy od potwierdzenia ceny przez sprzedawce, typu VAT, akcyzy, transportu i kompletu dokumentow.`,
  },
  {
    id: "seller-questions",
    title: { ru: "Вопросы продавцу", pl: "Pytania do sprzedawcy" },
    ru: (d) => `AUTOGOOD | ВОПРОСЫ ПРОДАВЦУ

Авто: ${d.carModel}
VIN: ${d.vin}
Ссылка: ${d.listingUrl}

Просим подтвердить:
1. Актуальна ли цена и доступность автомобиля?
2. Какой тип продажи: VAT 23%, VAT Marża или другой?
3. Есть ли повреждения, перекрасы, технические дефекты?
4. Есть ли полная сервисная история?
5. Возможны ли дополнительные фото/видео салона, кузова, шин и документов?
6. Какие документы будут переданы с автомобилем?
7. Возможен ли осмотр специалистом?
8. Где находится автомобиль и когда возможен забор?

Внутренние заметки AUTOGOOD:
${d.notes || "Нет заметок."}`,
    pl: (d) => `AUTOGOOD | PYTANIA DO SPRZEDAWCY

Auto: ${d.carModel}
VIN: ${d.vin}
Link: ${d.listingUrl}

Prosimy o potwierdzenie:
1. Czy cena i dostepnosc auta sa aktualne?
2. Jaki jest typ sprzedazy: VAT 23%, VAT Marza czy inny?
3. Czy auto ma uszkodzenia, lakierowane elementy lub usterki techniczne?
4. Czy jest pelna historia serwisowa?
5. Czy mozna otrzymac dodatkowe zdjecia/wideo wnetrza, nadwozia, opon i dokumentow?
6. Jakie dokumenty beda przekazane z autem?
7. Czy mozliwa jest inspekcja specjalisty?
8. Gdzie znajduje sie auto i kiedy mozliwy jest odbior?

Wewnetrzne notatki AUTOGOOD:
${d.notes || "Brak notatek."}`,
  },
  {
    id: "payment-checklist",
    title: { ru: "Чеклист оплаты", pl: "Checklista platnosci" },
    ru: (d) => `AUTOGOOD | ЧЕКЛИСТ ОПЛАТЫ И ДОКУМЕНТОВ

Сделка
- Клиент: ${d.clientName}
- Авто: ${d.carModel}
- VIN: ${d.vin}
- Источник: ${d.carSource}
- Статус: ${d.status}

Перед оплатой проверить:
[ ] Данные продавца совпадают с документами
[ ] VIN совпадает в объявлении, документах и счёте
[ ] Тип VAT подтверждён
[ ] Сумма и валюта подтверждены
[ ] Назначение платежа согласовано
[ ] Proforma / faktura получена
[ ] Срок резерва автомобиля понятен
[ ] Ответственный менеджер подтвердил оплату

Следующий шаг:
${d.nextStep}`,
    pl: (d) => `AUTOGOOD | CHECKLISTA PLATNOSCI I DOKUMENTOW

Transakcja
- Klient: ${d.clientName}
- Auto: ${d.carModel}
- VIN: ${d.vin}
- Zrodlo: ${d.carSource}
- Status: ${d.status}

Przed platnoscia sprawdzic:
[ ] Dane sprzedawcy zgadzaja sie z dokumentami
[ ] VIN zgadza sie w ogloszeniu, dokumentach i fakturze
[ ] Typ VAT jest potwierdzony
[ ] Kwota i waluta sa potwierdzone
[ ] Tytul przelewu jest uzgodniony
[ ] Proforma / faktura otrzymana
[ ] Termin rezerwacji auta jest jasny
[ ] Odpowiedzialny manager potwierdzil platnosc

Nastepny krok:
${d.nextStep}`,
  },
  {
    id: "handover-checklist",
    title: { ru: "Чеклист выдачи", pl: "Checklista wydania" },
    ru: (d) => `AUTOGOOD | ЧЕКЛИСТ ВЫДАЧИ АВТО

Клиент: ${d.clientName}
Авто: ${d.carModel}
VIN: ${d.vin}

Перед выдачей:
[ ] Автомобиль прибыл и осмотрен
[ ] Документы собраны
[ ] Переводы документов готовы / назначены
[ ] Техосмотр / регистрационные действия проверены
[ ] Финальный баланс сделки закрыт
[ ] Клиенту назначено время выдачи
[ ] Подготовлен короткий список рекомендаций по авто
[ ] После выдачи запросить отзыв

Заметки:
${d.notes || "Нет заметок."}`,
    pl: (d) => `AUTOGOOD | CHECKLISTA WYDANIA AUTA

Klient: ${d.clientName}
Auto: ${d.carModel}
VIN: ${d.vin}

Przed wydaniem:
[ ] Auto przyjechalo i zostalo sprawdzone
[ ] Dokumenty sa zebrane
[ ] Tlumaczenia dokumentow gotowe / zaplanowane
[ ] Badanie techniczne / rejestracja sprawdzone
[ ] Koncowy bilans transakcji zamkniety
[ ] Termin wydania uzgodniony z klientem
[ ] Przygotowana krotka lista rekomendacji dotyczacych auta
[ ] Po wydaniu poprosic o opinie

Notatki:
${d.notes || "Brak notatek."}`,
  },
];

const typeSelect = document.querySelector("#documentType");
const languageSelect = document.querySelector("#documentLanguage");
const output = document.querySelector("#documentOutput");
const title = document.querySelector("#documentTitle");
const state = document.querySelector("#documentState");
const copyButton = document.querySelector("#copyDocument");
const refreshButton = document.querySelector("#refreshDocument");
const downloadButton = document.querySelector("#downloadDocument");
const printButton = document.querySelector("#printDocument");

function readDeal() {
  try {
    const saved = JSON.parse(localStorage.getItem(dealStorageKey) || "{}");
    const cleaned = {};
    Object.entries(saved).forEach(([key, value]) => {
      cleaned[key] = value === "" ? fallbackDeal[key] || "" : value;
    });
    return { ...fallbackDeal, ...cleaned };
  } catch {
    return fallbackDeal;
  }
}

function updateSummary(deal) {
  document.querySelector("#documentClient").textContent = deal.clientName || "Не указано";
  document.querySelector("#documentCar").textContent = deal.carModel || "Не указано";
  document.querySelector("#documentSource").textContent = deal.carSource || "Не указан";
  document.querySelector("#documentStatus").textContent = deal.status || "Новый запрос";
}

function renderDocument() {
  const deal = readDeal();
  const selected = documents.find((doc) => doc.id === typeSelect.value) || documents[0];
  const language = languageSelect.value;
  updateSummary(deal);
  title.textContent = selected.title[language];
  output.textContent = selected[language](deal);
  state.textContent = "Готово";
}

function populateTypes() {
  typeSelect.innerHTML = documents
    .map((doc) => `<option value="${doc.id}">${doc.title.ru}</option>`)
    .join("");
}

async function copyDocument() {
  try {
    await navigator.clipboard.writeText(output.textContent);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(output);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("copy");
    selection.removeAllRanges();
  }
  state.textContent = "Скопировано";
}

function downloadDocument() {
  const selected = documents.find((doc) => doc.id === typeSelect.value) || documents[0];
  const blob = new Blob([output.textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `autogood-${selected.id}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

populateTypes();
typeSelect.addEventListener("change", renderDocument);
languageSelect.addEventListener("change", renderDocument);
refreshButton.addEventListener("click", renderDocument);
copyButton.addEventListener("click", copyDocument);
downloadButton.addEventListener("click", downloadDocument);
printButton.addEventListener("click", () => window.print());
renderDocument();
