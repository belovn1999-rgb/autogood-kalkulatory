const LANGUAGE_STORAGE_KEY = "autogood-auction-language";
const supportedLanguages = new Set(["pl", "ru"]);

const translations = {
  pl: {
    "nav.tools": "Narzędzia",
    "nav.auctions": "Aukcje",
    "upload.prompt": "Wybierz albo przeciągnij plik PDF",
    "upload.local": "Plik pozostaje na tym urządzeniu i nie jest wysyłany na serwer.",
    "action.cleanDownload": "Oczyść i pobierz PDF",
    "action.download": "Pobierz gotowy PDF",
    "sidebar.removed": "Automatycznie usuwane",
    "preview.title": "Podgląd wyniku",
    "auto1.title": "Przygotuj raport dla klienta",
    "auto1.intro": "Wgraj surowy raport PDF pobrany z AUTO1. Program oczyści go z elementów aukcyjnych i zapisze z powrotem jako edytowalny PDF.",
    "auto1.waiting": "Czekam na plik AUTO1.",
    "auto1.fileReady": "{size} - gotowy do obróbki",
    "auto1.fileSelected": "Plik wybrany. Możesz uruchomić czyszczenie.",
    "auto1.buildingPage": "Buduję czysty PDF: strona {page}/{total}",
    "auto1.readingPage": "Czytam raport AUTO1: strona {page}/{total}",
    "auto1.loadingEngine": "Ładuję silnik PDF...",
    "auto1.building": "Buduję czysty PDF bez maskowania...",
    "auto1.saving": "Zapisuję czysty PDF...",
    "auto1.resultMeta": "Gotowy PDF: {pages} stron. Usunięte strony techniczne: {removedPages}.",
    "auto1.verifying": "Sprawdzam zachowanie danych w gotowym PDF...",
    "auto1.reviewNeeded": "Ten układ PDF wymaga sprawdzenia. Nie utworzono pliku do wysłania. Zachowaj oryginał do kontroli.",
    "auto1.done": "Gotowe. Sprawdź podgląd przed wysłaniem raportu.",
    "auto1.doneReview": "Gotowe. Strony {pages} zostawiono w wersji oryginalnej - obejrzyj je przed wysłaniem.",
    "auto1.error": "Nie udało się obrobić PDF.",
    "auto1.rule1": "voucher, Save cash, Export advantage, Premium Return Right",
    "auto1.rule2": "stock number i wewnętrzne numery aukcji",
    "auto1.rule3": "watchlist, high demand i podobne komunikaty",
    "auto1.rule4": "delivery, pickup, logistics, ceny i terminy odbioru",
    "auto1.rule5": "video overlay, pasek postępu i czas odtwarzacza",
    "auto1.rule6": "Total Pictures i techniczne komunikaty galerii",
    "auto1.rule7": "puste strony prawne / stopki AUTO1",
    "auto1.rulesLink": "Zobacz reguły z przykładu Jeep",
    "auto1.previewEmpty": "Po obróbce pojawi się tutaj gotowy PDF.",
    "auto1.historyEyebrow": "Ostatnie wyniki",
    "auto1.historyTitle": "Historia plików",
    "auto1.historyHint": "Gotowe pliki zapisują się automatycznie w tej przeglądarce.",
    "auto1.historyEmpty": "Tutaj pojawi się 10 ostatnich plików.",
    "auto1.historyDownload": "Pobierz",
    "auto1.historyDownloadLabel": "Pobierz {name} z historii",
    "auto1.historyMeta": "{date} · {pages} str. · {size}",
    "auto1.historyUnavailable": "Historia jest niedostępna w tej przeglądarce.",
    "auto1.historyDownloadError": "Nie udało się pobrać pliku z historii.",
    "auto1.historySaveFailed": "Nie udało się zapisać pliku w historii tej przeglądarki.",
    "autobid.title": "Przygotuj czysty raport dla klienta",
    "autobid.intro": "Wgraj oryginalny raport PDF pobrany z Autobid. Dokument jest czyszczony lokalnie w przeglądarce i pozostaje plikiem PDF.",
    "autobid.waiting": "Czekam na plik PDF z Autobid.",
    "autobid.wrongFile": "Wybierz plik PDF.",
    "autobid.onlyPdf": "Do czyszczenia można przygotować tylko pliki PDF.",
    "autobid.notPdf": "Wybrany plik nie jest PDF-em.",
    "autobid.fileReady": "{size} - gotowy do czyszczenia",
    "autobid.selected": "PDF wybrany. Gotowy do czyszczenia.",
    "autobid.editorMissing": "Edytor PDF nie został załadowany. Odśwież stronę i spróbuj ponownie.",
    "autobid.opening": "Otwieram PDF Autobid...",
    "autobid.cleaning": "Czyszczę {pages} {pagesLabel}...",
    "autobid.pageLabel": "stron",
    "autobid.done": "Gotowe. Sprawdź podgląd oczyszczonego PDF lub pobierz plik.",
    "autobid.processingError": "Tego PDF nie udało się przetworzyć. Spróbuj użyć oryginalnego raportu Autobid.",
    "autobid.rule1": "logo Autobid w prawym górnym rogu każdej strony",
    "autobid.rule2": "numer aukcji, numer kategorii, data aukcji i czas wydruku w stopce",
    "autobid.rule3": "cena wywoławcza na pierwszej stronie",
    "autobid.footerRetained": "Numer strony w stopce zostaje zachowany.",
    "autobid.previewEmpty": "Gotowy PDF pojawi się tutaj.",
  },
  ru: {
    "nav.tools": "Инструменты",
    "nav.auctions": "Аукционы",
    "upload.prompt": "Выберите или перетащите PDF-файл",
    "upload.local": "Файл остаётся на этом устройстве и не загружается на сервер.",
    "action.cleanDownload": "Очистить и скачать PDF",
    "action.download": "Скачать готовый PDF",
    "sidebar.removed": "Удаляется автоматически",
    "preview.title": "Предпросмотр результата",
    "auto1.title": "Подготовьте отчёт для клиента",
    "auto1.intro": "Загрузите исходный PDF-отчёт из AUTO1. Программа удалит аукционные элементы и сохранит редактируемый PDF.",
    "auto1.waiting": "Ожидаю файл AUTO1.",
    "auto1.fileReady": "{size} - готов к обработке",
    "auto1.fileSelected": "Файл выбран. Можно начать очистку.",
    "auto1.buildingPage": "Создаю чистый PDF: страница {page}/{total}",
    "auto1.readingPage": "Читаю отчёт AUTO1: страница {page}/{total}",
    "auto1.loadingEngine": "Загружаю PDF-движок...",
    "auto1.building": "Создаю чистый PDF без масок...",
    "auto1.saving": "Сохраняю чистый PDF...",
    "auto1.resultMeta": "Готово страниц: {pages}; удалено служебных страниц: {removedPages}.",
    "auto1.verifying": "Проверяю сохранность данных в готовом PDF...",
    "auto1.reviewNeeded": "Этот макет PDF требует проверки. Файл для отправки не создан. Сохраните исходник для проверки.",
    "auto1.done": "Готово. Проверьте предпросмотр перед отправкой отчёта.",
    "auto1.doneReview": "Готово. Страницы {pages} оставлены в исходном виде - просмотрите их перед отправкой.",
    "auto1.error": "Не удалось обработать PDF.",
    "auto1.rule1": "voucher, Save cash, Export advantage, Premium Return Right",
    "auto1.rule2": "stock number и внутренние номера аукциона",
    "auto1.rule3": "watchlist, high demand и похожие сообщения",
    "auto1.rule4": "delivery, pickup, logistics, цены и сроки выдачи",
    "auto1.rule5": "наложение видео, индикатор и время воспроизведения",
    "auto1.rule6": "Total Pictures и технические сообщения галереи",
    "auto1.rule7": "пустые юридические страницы / футеры AUTO1",
    "auto1.rulesLink": "Посмотреть правила на примере Jeep",
    "auto1.previewEmpty": "После обработки здесь появится готовый PDF.",
    "auto1.historyEyebrow": "Последние результаты",
    "auto1.historyTitle": "История файлов",
    "auto1.historyHint": "Готовые файлы автоматически сохраняются в этом браузере.",
    "auto1.historyEmpty": "Здесь появятся 10 последних файлов.",
    "auto1.historyDownload": "Скачать",
    "auto1.historyDownloadLabel": "Скачать {name} из истории",
    "auto1.historyMeta": "{date} · {pages} стр. · {size}",
    "auto1.historyUnavailable": "История недоступна в этом браузере.",
    "auto1.historyDownloadError": "Не удалось скачать файл из истории.",
    "auto1.historySaveFailed": "Не удалось сохранить файл в истории этого браузера.",
    "autobid.title": "Подготовьте чистый отчёт для клиента",
    "autobid.intro": "Загрузите исходный PDF-отчёт из Autobid. Документ очищается локально в браузере и остаётся PDF-файлом.",
    "autobid.waiting": "Ожидаю PDF-файл из Autobid.",
    "autobid.wrongFile": "Выберите PDF-файл.",
    "autobid.onlyPdf": "Для очистки можно подготовить только PDF-файлы.",
    "autobid.notPdf": "Выбранный файл не является PDF.",
    "autobid.fileReady": "{size} - готов к очистке",
    "autobid.selected": "PDF выбран. Готов к очистке.",
    "autobid.editorMissing": "Редактор PDF не загрузился. Обновите страницу и попробуйте снова.",
    "autobid.opening": "Открываю PDF Autobid...",
    "autobid.cleaning": "Очищаю {pages} {pagesLabel}...",
    "autobid.pageLabel": "страниц",
    "autobid.done": "Готово. Проверьте предпросмотр очищенного PDF или скачайте файл.",
    "autobid.processingError": "Не удалось обработать этот PDF. Попробуйте исходный отчёт Autobid.",
    "autobid.rule1": "логотип Autobid справа вверху на каждой странице",
    "autobid.rule2": "номер аукциона, номер категории, дату аукциона и время печати в футере",
    "autobid.rule3": "стартовую цену на первой странице",
    "autobid.footerRetained": "Номер страницы в футере сохраняется.",
    "autobid.previewEmpty": "Готовый PDF появится здесь.",
  },
};

function currentLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return supportedLanguages.has(savedLanguage) ? savedLanguage : "pl";
}

function translate(key, values = {}) {
  const template = translations[currentLanguage()][key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function applyLanguage(language) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    const isActive = button.dataset.language === language;
    button.classList.toggle("isActive", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  window.dispatchEvent(new CustomEvent("auctionlanguagechange", { detail: { language } }));
}

window.AUTOGOOD_AUCTION_LANGUAGE = { currentLanguage, translate };

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
});

applyLanguage(currentLanguage());
