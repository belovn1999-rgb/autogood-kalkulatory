(() => {
  // The same button sits in the offer panel and under the form.
  const analysisOpens = Array.from(document.querySelectorAll("[data-mobile-market-analysis-open]"));
  const analysisOpen = analysisOpens[0];
  const analysisBack = document.querySelector("[data-mobile-market-analysis-back]");
  const analysisView = document.querySelector("[data-mobile-market-analysis-view]");
  const analysisContent = document.querySelector("[data-mobile-market-analysis-content]");
  const manualView = document.querySelector('[data-mobile-method-view="manual"]');
  const listingFrame = document.querySelector(".mobileListingSearch");
  // The market analysis replaces the whole search area: link frame and manual form.
  const setManualViewHidden = (hidden) => {
    manualView.hidden = hidden;
    if (listingFrame) listingFrame.hidden = hidden;
  };
  const historySaves = Array.from(document.querySelectorAll("[data-mobile-market-history-save]"));
  const historyList = document.querySelector("[data-mobile-market-history-list]");
  const historyCount = document.querySelector("[data-mobile-market-history-count]");

  if (!analysisOpen || !analysisBack || !analysisView || !analysisContent || !manualView || !historySaves.length || !historyList || !historyCount) return;

  const marketCopy = {
    pl: {
      analysisButton: "Analiza rynku",
      saveButton: "Zapisz dane",
      saveSuccess: "Dane zapisane w historii.",
      historyUpdateSuccess: "Dane wpisu zostały zaktualizowane.",
      historyConfirm: "Zapisz zmiany w tym wpisie",
      favoritesHeading: "Ulubione auta",
      favoritesEmpty: "Oznacz wpis w historii gwiazdką ★ — pojawi się tutaj.",
      favoritesPick: "Wybierz auto z ulubionych albo wpisz markę i model w formularzu.",
      favoritesNoData: "brak cen",
      dataAtHint: "„Odśwież dane” zapisze nowy pomiar do historii cen.",
      priceHistoryHeading: "Historia cen",
      priceHistoryFirst: "Pierwszy pomiar. Każde odświeżenie danych doda kolejny — zobaczysz, jak zmienia się mediana.",
      priceHistoryDate: "Data",
      priceHistoryCount: "ofert",
      comparePrice: "Porównaj cenę (EUR)",
      comparePlaceholder: "np. 25 000",
      compareHint: "Wpisz cenę auta, a pokażemy je na wykresie.",
      comparedCar: "Porównywana cena",
      historyHeading: "Historia wyszukiwania",
      historyEmpty: "Nie masz jeszcze zapisanych wyszukiwań.",
      historyAnalysis: "Analiza rynku",
      historyOpenList: "Otwórz listę",
      historyDelete: "Usuń",
      otomotoFetching: "Pobieram oferty z otomoto.pl…",
      otomotoFetched: "Wczytano {count} z {total} ofert otomoto.pl.",
      otomotoFailed: "Nie udało się pobrać ofert z otomoto.pl.",
      otomotoLabel: "Dane: otomoto.pl",
      mixedLabel: "Dane: otomoto.pl + mobile.de",
      mixedDescription: "Oferty otomoto.pl (PLN) i mobile.de (EUR przeliczone na PLN) na jednym wykresie.",
      otomotoDescription: "Próbka aktualnych ofert otomoto.pl z całej listy wyników (ceny w PLN).",
      verdictHeading: "Co to znaczy",
      verdictMedian: "Mediana ceny ofert: {median}.",
      verdictMiddle: "Typowy zakres: {low} – {high} ({count} ofert).",
      verdictDeals: "Poniżej {low} jest {count} ofert — to dół rynku.",
      tableHeading: "Oferty w analizie",
      tablePrice: "Cena",
      tableYear: "Rok",
      tableMileage: "Przebieg",
      tableOpen: "Otwórz",
      tableSortHint: "Kliknij nagłówek, aby posortować.",
      axisMileage: "Oś pozioma: przebieg",
      sourceOtomoto: "otomoto.pl",
      sourceMobile: "mobile.de",
      sourcesLabel: "Źródła ofert",
      axisLabel: "Oś pozioma",
      axisRank: "Kolejność cen",
      axisMileageShort: "Przebieg",
      axisYearShort: "Rok",
      axisRankCaption: "Miejsce oferty na liście portalu posortowanej od najtańszej",
      axisMileageCaption: "Przebieg",
      axisYearCaption: "Rok produkcji",
      axisRankStart: "najtańsza",
      axisRankEnd: "najdroższa",
      trendLegend: "Mediana ceny",
      curveLegend: "Krzywa cen",
      hiddenNoAxis: "{count} ofert bez tej wartości nie ma na wykresie.",
      tableSource: "Źródło",
      sourceEmpty: "brak danych",
      fetchMobile: "Pobierz z mobile.de ↗",
      fetchMobileHint: "Lista mobile.de otwarta w nowej karcie — kliknij tam zakładkę „AUTOGOOD”. Oferty trafią na wykres.",
      mobileAdded: "Dodano {count} ofert mobile.de (z {total}).",
      mobilePending: "Oferty mobile.de ({count}) czekają — otwórz Analizę rynku dla tego auta.",
      bookmarkletInstall: "Zakładka do mobile.de:",
      bookmarkletInstallHint: "przeciągnij na pasek zakładek",
      yourCar: "To auto",
      yourCarVerdict: "To auto: {price} — taniej niż {share}% ofert, {diff} mediany.",
      belowMedian: "{pct}% poniżej",
      aboveMedian: "{pct}% powyżej",
      atMedian: "na poziomie",
      yourCarMileageVerdict: "Przy takim przebiegu mediana to około {reference} — cena tego auta jest {diff} mediany.",
      yourCarYearVerdict: "Dla tego rocznika mediana to około {reference} — cena tego auta jest {diff} mediany.",
      axisYear: "Oś pozioma: rok",
      historyPin: "Zapisz na stałe",
      historyPinned: "Zapisane na stałe",
      historyPinnedBadge: "Zapisane",
      historyUnpin: "Usuń z zapisanych",
      historySaveHint: "{count} / {limit} ostatnich sprawdzeń",
      historyReady: "{count} ofert · wykres gotowy",
      historyWaiting: "Brak danych rynku",
      historyStorageError: "Nie udało się zapisać historii w tej przeglądarce.",
      backToFilters: "← Wróć do filtrów",
      heading: "Analiza rynku",
      waitingLabel: "Brak danych ofert",
      waitingDescription: "Wczytaj ceny ofert, aby zbudować analizę.",
      importedLabel: "Dane importowane",
      importedDescription: "Wykres przygotowany z wczytanych cen ofert.",
      importHeading: "Źródło cen",
      importDescription: "Ceny pobierane są automatycznie z otomoto.pl. Mobile.de można wczytać z pliku JSON lub CSV (kolumna price w EUR) — plik zostaje tylko w tej przeglądarce.",
      importButton: "Importuj JSON / CSV",
      clearImport: "Usuń zaimportowane oferty",
      importedFile: "Wczytano {count} ofert z pliku {file}.",
      importInvalid: "Plik musi zawierać co najmniej 3 poprawne oferty z ceną w EUR.",
      importReadError: "Nie udało się odczytać pliku JSON / CSV.",
      chartTitle: "Rozkład cen ofert",
      lowMarket: "Dół rynku",
      middleMarket: "Typowy zakres",
      highMarket: "Góra rynku",
      count: "Liczba ofert",
      minimum: "Minimum",
      median: "Mediana",
      middleRange: "Typowy zakres (P25–P75)",
      middleOffers: "Oferty w zakresie",
      sampleDate: "Ceny ofert · stan na {date}",
      limitedSample: "Mała próba: typowa cena może być niestabilna. Do oceny auta potrzeba co najmniej 8 ofert.",
      priceFilterWarning: "Filtr ceny ogranicza porównanie. Usuń go, aby ocenić cały rynek.",
      wideRangeWarning: "Skrajne ceny mocno rozciągają skalę. Wszystkie oferty pozostają na wykresie.",
      maximum: "Maksimum",
      openSearch: "Otwórz wyszukiwanie mobile.de ↗",
      openOtomoto: "Otwórz listę otomoto.pl ↗",
      pointHint: "Kliknij, aby otworzyć ogłoszenie",
      summaryVehicle: "Auto i sprzedawca",
      summaryParameters: "Parametry",
      summaryEquipment: "Wyposażenie",
      priceHistorySource: "Źródło",
      searchHeading: "Parametry poszukiwania",
      analysisCardHeading: "Analiza i rozkład cen",
      openSearches: "Otwórz wyszukiwania",
      checkedAt: "stan na {date}",
      priceHistoryOffers: "Oferty",
      countries: "Kraj",
      refresh: "Odśwież dane",
      refreshing: "Odświeżam dane rynku…",
      refreshUnavailable: "Źródło danych nie jest jeszcze podłączone.",
      refreshInvalid: "Źródło nie zwróciło co najmniej 3 cen ofert.",
      snapshotSaved: "Zapisano nowy snapshot cen.",
      emptyHeading: "Brak realnych ofert do analizy",
      emptyDescription: "Pobierz oferty z mobile.de zakładką AUTOGOOD albo zaimportuj JSON lub CSV. Wykres nie pokazuje punktów testowych.",
      missingVehicle: "Wybierz markę i model przed uruchomieniem analizy rynku.",
      invalidData: "Źródło nie zwróciło co najmniej 3 poprawnych ogłoszeń mobile.de.",
      preparing: "Przygotowuję analizę rynku…",
      mileage: "Przebieg",
      price: "Cena",
      year: "Rok",
      displacement: "Pojemność",
      power: "Moc",
      seats: "Liczba miejsc",
      engine: "Silnik",
      gearbox: "Skrzynia",
      fuelPetrol: "Benzyna",
      fuelDiesel: "Diesel",
      fuelHybridDiesel: "Hybryda diesel",
      fuelHybridPetrol: "Hybryda benzyna",
      fuelElectric: "Elektryk",
      fuelPlugin: "Hybryda plug-in",
      gearboxAny: "Dowolna",
      gearboxAutomatic: "Automatyczna",
      gearboxManual: "Manualna",
    },
    ru: {
      analysisButton: "Анализ рынка",
      saveButton: "Сохрани данные",
      saveSuccess: "Данные сохранены в истории.",
      historyUpdateSuccess: "Данные записи обновлены.",
      historyConfirm: "Сохранить изменения в этой записи",
      favoritesHeading: "Избранные авто",
      favoritesEmpty: "Отметьте запись в истории звёздочкой ★ — она появится здесь.",
      favoritesPick: "Выберите авто из избранного или укажите марку и модель в форме.",
      favoritesNoData: "нет цен",
      dataAtHint: "«Обновить данные» сохранит новый замер в историю цен.",
      priceHistoryHeading: "История цен",
      priceHistoryFirst: "Первый замер. Каждое обновление данных добавит следующий — будет видно, как меняется медиана.",
      priceHistoryDate: "Дата",
      priceHistoryCount: "объявл.",
      comparePrice: "Сравнить цену (EUR)",
      comparePlaceholder: "напр. 25 000",
      compareHint: "Введите цену авто — покажем его на графике.",
      comparedCar: "Сравниваемая цена",
      historyHeading: "История поиска",
      historyEmpty: "Сохранённых поисков пока нет.",
      historyAnalysis: "Анализ рынка",
      historyOpenList: "Открыть список",
      historyDelete: "Удалить",
      otomotoFetching: "Загружаю объявления с otomoto.pl…",
      otomotoFetched: "Загружено {count} из {total} объявлений otomoto.pl.",
      otomotoFailed: "Не удалось загрузить объявления с otomoto.pl.",
      otomotoLabel: "Данные: otomoto.pl",
      mixedLabel: "Данные: otomoto.pl + mobile.de",
      mixedDescription: "Объявления otomoto.pl (PLN) и mobile.de (EUR, пересчитано в PLN) на одном графике.",
      otomotoDescription: "Выборка актуальных объявлений otomoto.pl по всему списку (цены в PLN).",
      verdictHeading: "Что это значит",
      verdictMedian: "Медиана цен объявлений: {median}.",
      verdictMiddle: "Типичный диапазон: {low} – {high} ({count} объявлений).",
      verdictDeals: "Дешевле {low} — {count} объявлений, это низ рынка.",
      tableHeading: "Объявления в анализе",
      tablePrice: "Цена",
      tableYear: "Год",
      tableMileage: "Пробег",
      tableOpen: "Открыть",
      tableSortHint: "Нажми на заголовок, чтобы отсортировать.",
      axisMileage: "Горизонтальная ось: пробег",
      sourceOtomoto: "otomoto.pl",
      sourceMobile: "mobile.de",
      sourcesLabel: "Источники",
      axisLabel: "Горизонтальная ось",
      axisRank: "Порядок цен",
      axisMileageShort: "Пробег",
      axisYearShort: "Год",
      axisRankCaption: "Место объявления в списке портала, отсортированном от самого дешёвого",
      axisMileageCaption: "Пробег",
      axisYearCaption: "Год выпуска",
      axisRankStart: "самое дешёвое",
      axisRankEnd: "самое дорогое",
      trendLegend: "Медиана цены",
      curveLegend: "Кривая цен",
      hiddenNoAxis: "Объявлений без этого значения нет на графике: {count}.",
      tableSource: "Источник",
      sourceEmpty: "нет данных",
      fetchMobile: "Загрузить с mobile.de ↗",
      fetchMobileHint: "Список mobile.de открыт в новой вкладке — нажми там закладку «AUTOGOOD». Объявления появятся на графике.",
      mobileAdded: "Добавлено объявлений mobile.de: {count} (из {total}).",
      mobilePending: "Объявления mobile.de ({count}) ждут — открой анализ рынка для этого авто.",
      bookmarkletInstall: "Закладка для mobile.de:",
      bookmarkletInstallHint: "перетащи на панель закладок",
      yourCar: "Это авто",
      yourCarVerdict: "Это авто: {price} — дешевле {share}% объявлений, {diff} медианы.",
      belowMedian: "на {pct}% ниже",
      aboveMedian: "на {pct}% выше",
      atMedian: "на уровне",
      yourCarMileageVerdict: "При таком пробеге медиана около {reference} — цена этого авто {diff} медианы.",
      yourCarYearVerdict: "Для этого года медиана около {reference} — цена этого авто {diff} медианы.",
      axisYear: "Горизонтальная ось: год",
      historyPin: "Сохранить навсегда",
      historyPinned: "Сохранено навсегда",
      historyPinnedBadge: "Сохранено",
      historyUnpin: "Убрать из сохранённых",
      historySaveHint: "{count} / {limit} последних проверок",
      historyReady: "Объявлений: {count} · график готов",
      historyWaiting: "Нет данных рынка",
      historyStorageError: "Не удалось сохранить историю в этом браузере.",
      backToFilters: "← Вернуться к фильтрам",
      heading: "Анализ рынка",
      waitingLabel: "Нет данных объявлений",
      waitingDescription: "Загрузите цены объявлений, чтобы построить анализ.",
      importedLabel: "Импортированные данные",
      importedDescription: "График построен по загруженным ценам объявлений.",
      importHeading: "Загрузить реальные объявления",
      importDescription: "JSON или CSV: обязателен price в EUR. Файл остаётся только в этом браузере.",
      importButton: "Импортировать JSON / CSV",
      clearImport: "Удалить импортированные объявления",
      importedFile: "Загружено объявлений: {count}. Файл: {file}.",
      importInvalid: "Файл должен содержать минимум 3 корректных объявления с ценой в EUR.",
      importReadError: "Не удалось прочитать файл JSON / CSV.",
      chartTitle: "Распределение цен объявлений",
      lowMarket: "Низ рынка",
      middleMarket: "Типичный диапазон",
      highMarket: "Верх рынка",
      count: "Объявлений",
      minimum: "Минимум",
      median: "Медиана",
      middleRange: "Типичный диапазон (P25–P75)",
      middleOffers: "В диапазоне",
      sampleDate: "Цены объявлений · данные на {date}",
      limitedSample: "Маленькая выборка: типичная цена может быть нестабильной. Для оценки автомобиля нужно минимум 8 объявлений.",
      priceFilterWarning: "Фильтр цены ограничивает сравнение. Уберите его, чтобы оценить весь рынок.",
      wideRangeWarning: "Крайние цены сильно растягивают шкалу. Все объявления остаются на графике.",
      maximum: "Максимум",
      openSearch: "Открыть поиск mobile.de ↗",
      openOtomoto: "Открыть список otomoto.pl ↗",
      pointHint: "Нажми, чтобы открыть объявление",
      summaryVehicle: "Авто и продавец",
      summaryParameters: "Параметры",
      summaryEquipment: "Оснащение",
      priceHistorySource: "Источник",
      searchHeading: "Параметры поиска",
      analysisCardHeading: "Анализ и распределение цен",
      openSearches: "Открыть поиск",
      checkedAt: "данные на {date}",
      priceHistoryOffers: "Объявл.",
      countries: "Страна",
      refresh: "Обновить данные",
      refreshing: "Обновляю рыночные данные…",
      refreshUnavailable: "Источник данных ещё не подключён.",
      refreshInvalid: "Источник не вернул минимум 3 цен объявлений.",
      snapshotSaved: "Новый снимок цен сохранён.",
      emptyHeading: "Нет реальных объявлений для анализа",
      emptyDescription: "Загрузите объявления с mobile.de закладкой AUTOGOOD или импортируйте JSON либо CSV. На графике нет тестовых точек.",
      missingVehicle: "Выберите марку и модель перед запуском анализа рынка.",
      invalidData: "Источник не вернул минимум 3 корректных объявления mobile.de.",
      preparing: "Подготавливаю анализ рынка…",
      mileage: "Пробег",
      price: "Цена",
      year: "Год",
      displacement: "Объём",
      power: "Мощность",
      seats: "Количество мест",
      engine: "Двигатель",
      gearbox: "Коробка передач",
      fuelPetrol: "Бензин",
      fuelDiesel: "Дизель",
      fuelHybridDiesel: "Гибрид дизель",
      fuelHybridPetrol: "Гибрид бензин",
      fuelElectric: "Электрик",
      fuelPlugin: "Гибрид plug-in",
      gearboxAny: "Любая",
      gearboxAutomatic: "Автоматическая",
      gearboxManual: "Механическая",
    },
  };

  const HISTORY_STORAGE_KEY = "autogood.mobile.marketHistory.v2";
  const LEGACY_HISTORY_STORAGE_KEY = "autogood.mobile.marketHistory.v1";
  // Every Mobile.de search is logged automatically; only the last 20 unpinned
  // checks are kept, while pinned ones (e.g. a client's car) stay on top.
  const HISTORY_LIMIT = 20;
  const PRICE_LOG_LIMIT = 120;
  const PRICE_POINT_MERGE_MS = 2 * 60 * 60 * 1000;

  // Otomoto blocks cross-origin reads, so its result pages come through a
  // reader proxy. Point AUTOGOOD_MARKET_PROXY at your own one to replace it.
  const MARKET_PROXY = () => window.AUTOGOOD_MARKET_PROXY || "https://r.jina.ai/";
  const OTOMOTO_PAGES = 8;
  const OTOMOTO_PARALLEL = 3;

  let activeAnalysis = null;
  let otomotoTotal = 0;
  let tableSort = { key: "price", direction: "asc" };
  // Chart view: which marketplaces are shown and what the horizontal axis carries.
  const MARKET_SOURCES = ["otomoto", "mobile"];
  const EUR_PLN_FALLBACK_RATE = 4.3;
  let chartSources = { otomoto: true, mobile: true };
  let chartAxis = "rank";
  let displayCurrency = "EUR";
  // Mobile.de offers that arrived before the analysis was opened.
  let pendingMobile = null;

  function exchangeRate() {
    const rate = Number(window.AUTOGOOD_EXCHANGE_RATES?.rates?.EUR_PLN?.value);
    return Number.isFinite(rate) && rate > 0 ? rate : 0;
  }
  let importedDataset = null;
  let marketHistory = [];
  let editingHistoryId = "";

  function currentLanguage() {
    return document.documentElement.lang === "ru" ? "ru" : "pl";
  }

  function copy() {
    return marketCopy[currentLanguage()];
  }

  function filterSignature(filters) {
    return JSON.stringify(filters || {});
  }

  function vehicleDataKey(filters) {
    return [filters?.brand, filters?.model, filters?.version]
      .map((value) => String(value || "").trim())
      .join("|");
  }

  function escapeMarketHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function seededNumber(value) {
    return [...String(value || "AUTOGOOD")]
      .reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
  }

  function parseMarketNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const compact = String(value ?? "").trim().replace(/\s+/g, "").replace(/[^\d.,-]/g, "");
    if (!compact) return null;
    const lastComma = compact.lastIndexOf(",");
    const lastDot = compact.lastIndexOf(".");
    const decimalIndex = Math.max(lastComma, lastDot);
    const decimalDigits = decimalIndex >= 0 ? compact.length - decimalIndex - 1 : 0;
    let normalized;
    if (decimalIndex >= 0 && decimalDigits > 0 && decimalDigits <= 2) {
      normalized = `${compact.slice(0, decimalIndex).replace(/[.,]/g, "")}.${compact.slice(decimalIndex + 1)}`;
    } else {
      normalized = compact.replace(/[.,]/g, "");
    }
    const number = Number(normalized);
    return Number.isFinite(number) && number >= 0 ? number : null;
  }

  function listingValue(row, aliases) {
    const entries = Object.entries(row || {});
    for (const alias of aliases) {
      const match = entries.find(([key]) => String(key).trim().toLowerCase() === alias);
      if (match && match[1] !== "") return match[1];
    }
    return "";
  }

  function isDirectOtomotoListingUrl(url) {
    return url.hostname.endsWith("otomoto.pl") && url.pathname.includes("/oferta/");
  }

  function isDirectMobileListingUrl(url) {
    const mobileHost = url.hostname === "mobile.de" || url.hostname.endsWith(".mobile.de");
    const canonicalListing = url.pathname.endsWith("/fahrzeuge/details.html")
      && /^\d+$/.test(url.searchParams.get("id") || "");
    const localizedListing = /\/(\d+)\.html$/.test(url.pathname);
    return mobileHost && (canonicalListing || localizedListing);
  }

  function normalizeListing(row, index) {
    const price = parseMarketNumber(listingValue(row, ["price", "price_eur", "cena", "preis"]));
    const urlValue = listingValue(row, ["url", "link", "listing_url", "listingurl"]);
    let url = "";
    try {
      const parsedUrl = new URL(String(urlValue || "").trim());
      if (/^https?:$/.test(parsedUrl.protocol) && (isDirectMobileListingUrl(parsedUrl) || isDirectOtomotoListingUrl(parsedUrl))) {
        url = parsedUrl.toString();
      }
    } catch {
      // A link is intentionally optional: prices, not outbound links, power this chart.
    }
    if (!price || price <= 0) return null;
    const yearMatch = String(listingValue(row, ["year", "registration_year", "first_registration", "rok"]) || "").match(/(?:19|20)\d{2}/);
    const mileage = parseMarketNumber(listingValue(row, ["mileage", "mileage_km", "km", "przebieg"]));
    const title = String(listingValue(row, ["title", "name", "model", "auto"]) || "").trim();
    const id = String(listingValue(row, ["id", "listing_id", "ad_id"]) || (url ? new URL(url).searchParams.get("id") : "") || `import-${index + 1}`);
    const currency = String(listingValue(row, ["currency", "waluta"]) || "EUR").toUpperCase() === "PLN" ? "PLN" : "EUR";
    const listing = {
      id,
      title: title || `mobile.de · ${String(index + 1).padStart(2, "0")}`,
      price: Math.round(price),
      currency,
      year: yearMatch ? Number(yearMatch[0]) : null,
      mileage: mileage === null ? null : Math.round(mileage),
      url: url.toString(),
      power: String(listingValue(row, ["power", "moc"]) || "").slice(0, 40),
      subtitle: String(listingValue(row, ["subtitle"]) || "").slice(0, 160),
    };
    listing.source = listingSource({ ...listing, source: listingValue(row, ["source", "zrodlo"]) });
    // Position in the marketplace's own price-sorted result list, when known.
    const rank = Number(listingValue(row, ["rank"]));
    const marketTotal = Number(listingValue(row, ["markettotal"]));
    if (Number.isFinite(rank) && rank > 0 && Number.isFinite(marketTotal) && marketTotal >= rank) {
      listing.rank = rank;
      listing.marketTotal = marketTotal;
    }
    return listing;
  }

  // Marketplaces complement each other: new offers replace only their own source.
  function mergeBySource(current, incoming) {
    const incomingSources = new Set(incoming.map(listingSource));
    return [...(current || []).filter((listing) => !incomingSources.has(listingSource(listing))), ...incoming];
  }

  // Which marketplace an offer comes from: explicit tag first, then its link,
  // then its currency (Otomoto lists in PLN, Mobile.de in EUR).
  function listingSource(listing) {
    const tagged = String(listing?.source || "").toLowerCase();
    if (tagged === "otomoto" || tagged === "mobile") return tagged;
    const url = String(listing?.url || "");
    if (url.includes("otomoto.pl")) return "otomoto";
    if (url.includes("mobile.de")) return "mobile";
    return listing?.currency === "PLN" ? "otomoto" : "mobile";
  }

  function normalizeListings(rows) {
    const seenListings = new Set();
    return (Array.isArray(rows) ? rows : [])
      .map(normalizeListing)
      .filter((listing) => {
        if (!listing) return false;
        const key = listing.url || listing.id;
        if (seenListings.has(key)) return false;
        seenListings.add(key);
        return true;
      });
  }

  // Otomoto's result page carries every offer as JSON in __NEXT_DATA__, so the
  // proxy is asked for the raw HTML and the numbers are read from there.
  function parseOtomotoPage(html) {
    const raw = String(html || "").match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!raw) return { total: 0, listings: [] };
    let search = null;
    const walk = (value) => {
      if (!value || typeof value !== "object" || search) return;
      if (Array.isArray(value.edges) && value.edges[0]?.node?.price) search = value;
      else Object.values(value).forEach(walk);
    };
    const urqlState = JSON.parse(raw[1])?.props?.pageProps?.urqlState || {};
    Object.values(urqlState).forEach((entry) => {
      if (!entry?.data || search) return;
      try {
        walk(JSON.parse(entry.data));
      } catch {
        // A cache entry that is not a search result is simply skipped.
      }
    });
    if (!search) return { total: 0, listings: [] };
    const listings = (search.edges || []).map((edge) => {
      const node = edge?.node || {};
      const amount = node.price?.amount || {};
      const parameters = Object.fromEntries((node.parameters || []).map((item) => [item.key, item.value]));
      const price = Number(amount.units ?? amount.value);
      if (!Number.isFinite(price) || price <= 0) return null;
      return {
        id: String(node.id || node.url || ""),
        url: String(node.url || ""),
        title: String(node.title || "otomoto.pl"),
        // The seller's own headline, the full name shown on otomoto.pl.
        subtitle: String(node.shortDescription || "").slice(0, 160),
        source: "otomoto",
        price,
        currency: String(amount.currencyCode || "PLN"),
        mileage: parameters.mileage || "",
        year: parameters.year || "",
        power: parameters.engine_power ? `${parameters.engine_power} KM` : "",
      };
    }).filter(Boolean);
    return { total: Number(search.totalCount) || listings.length, listings };
  }

  async function fetchOtomotoPage(searchUrl, page) {
    const pageUrl = page > 1 ? `${searchUrl}&page=${page}` : searchUrl;
    const response = await fetch(`${MARKET_PROXY()}${pageUrl}`, { headers: { "x-respond-with": "html" } });
    if (!response.ok) throw new Error(String(response.status));
    return parseOtomotoPage(await response.text());
  }

  // The search is sorted by price, so pages taken at even distances across the
  // whole result list describe the market far better than the first pages only.
  function otomotoSamplePages(total, pageSize) {
    const pageCount = Math.max(1, Math.min(Math.ceil(total / pageSize), 500));
    if (pageCount === 1) return [];
    // A short list is taken whole: no sampling needed.
    if (pageCount <= OTOMOTO_PAGES) return Array.from({ length: pageCount - 1 }, (_, index) => index + 2);
    const wanted = Array.from({ length: OTOMOTO_PAGES }, (_, index) => (
      Math.round(1 + (index * (pageCount - 1)) / (OTOMOTO_PAGES - 1))
    ));
    return [...new Set(wanted)].filter((page) => page > 1);
  }

  async function fetchOtomotoListings(filters, onProgress) {
    const searchUrl = buildOtomotoSearchUrl(filters);
    const seen = new Set();
    const listings = [];
    const collect = (pageListings) => pageListings.forEach((listing) => {
      const key = listing.url || listing.id || `${listing.price}|${listing.mileage}|${listing.year}`;
      if (seen.has(key)) return;
      seen.add(key);
      listings.push(listing);
    });

    onProgress?.(1, "…");
    const first = await fetchOtomotoPage(searchUrl, 1);
    const pageSize = first.listings.length || 32;
    // The search is sorted by price, so page and position give each offer its
    // real place in the whole result list — the chart puts it exactly there.
    const ranked = (pageListings, page) => pageListings.map((listing, index) => ({
      ...listing,
      rank: (page - 1) * pageSize + index + 1,
      marketTotal: first.total,
    }));
    collect(ranked(first.listings, 1));
    const pages = otomotoSamplePages(first.total, pageSize);
    let done = 1;
    // A few pages at a time: quicker than one by one, gentle on the proxy.
    for (let start = 0; start < pages.length; start += OTOMOTO_PARALLEL) {
      const batch = pages.slice(start, start + OTOMOTO_PARALLEL);
      const results = await Promise.allSettled(batch.map((page) => fetchOtomotoPage(searchUrl, page)));
      results.forEach((result, index) => {
        // One unreachable page still leaves a usable sample.
        if (result.status === "fulfilled") collect(ranked(result.value.listings, batch[index]));
      });
      done += batch.length;
      onProgress?.(done, pages.length + 1);
    }
    return { listings, total: first.total };
  }

  const otomotoProvider = {
    id: "otomoto",
    async getListings({ filters }) {
      const c = copy();
      setAnalysisStatus(c.otomotoFetching);
      const { listings, total } = await fetchOtomotoListings(filters, (page, pages) => {
        setAnalysisStatus(`${c.otomotoFetching} ${page}/${pages}`);
      });
      if (!listings.length) throw new Error(c.otomotoFailed);
      otomotoTotal = total;
      setAnalysisStatus(c.otomotoFetched.replace("{count}", String(listings.length)).replace("{total}", String(total)));
      return listings;
    },
  };

  function loadMarketHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || localStorage.getItem(LEGACY_HISTORY_STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((entry) => entry?.filters?.brand && entry?.filters?.model)
        .map((entry, index) => ({
          id: String(entry.id || `legacy-${index}`),
          filters: entry.filters,
          signature: filterSignature(entry.filters),
          listings: normalizeListings(entry.listings),
          sourceFileName: String(entry.sourceFileName || ""),
          searchUrl: String(entry.searchUrl || ""),
          pinned: Boolean(entry.pinned),
          // Entries saved before prices were dated count from their last update.
          dataAt: String(entry.dataAt || (entry.listings?.length >= 3 ? entry.updatedAt || entry.createdAt || "" : "")),
          priceLog: Array.isArray(entry.priceLog) ? entry.priceLog.filter((point) => point && point.at).slice(-PRICE_LOG_LIMIT) : [],
          createdAt: String(entry.createdAt || entry.updatedAt || new Date().toISOString()),
          updatedAt: String(entry.updatedAt || entry.createdAt || new Date().toISOString()),
        }));
      return trimHistory(parsed);
    } catch {
      return [];
    }
  }

  // Pinned entries first, then the newest checks; unpinned ones are capped.
  function trimHistory(entries) {
    const sorted = [...entries].sort((left, right) => {
      if (Boolean(left.pinned) !== Boolean(right.pinned)) return left.pinned ? -1 : 1;
      return String(right.updatedAt).localeCompare(String(left.updatedAt));
    });
    const pinned = sorted.filter((entry) => entry.pinned);
    const recent = sorted.filter((entry) => !entry.pinned).slice(0, HISTORY_LIMIT);
    return [...pinned, ...recent];
  }

  function storeMarketHistory(entries) {
    try {
      const trimmed = trimHistory(entries);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
      marketHistory = trimmed;
      return true;
    } catch {
      setAnalysisStatus(copy().historyStorageError, true);
      return false;
    }
  }

  function historyEntryForFilters(filters) {
    const signature = filterSignature(filters);
    return marketHistory.find((entry) => entry.signature === signature) || null;
  }

  // Price history: every time an entry gets new prices, the typical price of
  // each marketplace is written down with the date, so price changes of a
  // tracked car can be followed over weeks. Otomoto in PLN, Mobile.de in EUR,
  // so the exchange rate does not move the history.
  function marketPricePoint(listings, at) {
    const rate = exchangeRate() || EUR_PLN_FALLBACK_RATE;
    const point = { at };
    MARKET_SOURCES.forEach((source) => {
      const currency = source === "otomoto" ? "PLN" : "EUR";
      const inCurrency = (listing) => {
        if ((listing.currency || "EUR") === currency) return listing.price;
        return currency === "PLN" ? listing.price * rate : listing.price / rate;
      };
      // Every offer counts, as on the chart.
      const kept = listings.filter((listing) => listingSource(listing) === source);
      if (kept.length < 3) return;
      const byPrice = [...kept].sort((left, right) => inCurrency(left) - inCurrency(right));
      const prices = byPrice.map(inCurrency);
      point[source] = {
        currency,
        count: prices.length,
        median: Math.round(percentile(prices, 0.5)),
        p25: Math.round(percentile(prices, 0.25)),
        p75: Math.round(percentile(prices, 0.75)),
        min: Math.round(prices[0]),
        max: Math.round(prices[prices.length - 1]),
        minUrl: byPrice[0].url || "",
        maxUrl: byPrice[byPrice.length - 1].url || "",
      };
    });
    return MARKET_SOURCES.some((source) => point[source]) ? point : null;
  }

  function withPriceLog(entry, previous) {
    const sameMarket = !previous || previous.signature === entry.signature;
    const log = sameMarket ? [...(previous?.priceLog || [])] : [];
    const dataAt = sameMarket ? previous?.dataAt || "" : "";
    const now = new Date().toISOString();
    const point = entry.listings.length >= 3 ? marketPricePoint(entry.listings, now) : null;
    if (!point) return { ...entry, priceLog: log, dataAt: entry.listings.length >= 3 ? dataAt : "" };
    const last = log[log.length - 1];
    const sameAsLast = last && MARKET_SOURCES.every((source) => (
      (last[source]?.count || 0) === (point[source]?.count || 0) && (last[source]?.median || 0) === (point[source]?.median || 0)
    ));
    if (sameAsLast) return { ...entry, priceLog: log, dataAt: dataAt || now };
    // Otomoto and Mobile.de fetched minutes apart are one measurement.
    if (last && Date.parse(now) - Date.parse(last.at) < PRICE_POINT_MERGE_MS) log[log.length - 1] = point;
    else log.push(point);
    return { ...entry, priceLog: log.slice(-PRICE_LOG_LIMIT), dataAt: now };
  }

  function createMarketSnapshot(filters, listings, sourceFileName = "", searchUrl = "", pinned = false) {
    const now = new Date().toISOString();
    const entry = {
      id: `${Date.now()}-${seededNumber(`${filterSignature(filters)}|${now}`).toString(16)}`,
      filters,
      signature: filterSignature(filters),
      listings: normalizeListings(listings),
      sourceFileName,
      searchUrl: searchUrl || buildMobileDeSearchUrl(filters),
      pinned,
      createdAt: now,
      updatedAt: now,
    };
    const dated = withPriceLog(entry, null);
    if (!storeMarketHistory([dated, ...marketHistory])) return null;
    renderHistory();
    return dated;
  }

  function updateMarketSnapshot(historyId, filters, listings, sourceFileName = "", searchUrl = "", pinned = null) {
    const index = marketHistory.findIndex((entry) => entry.id === historyId);
    if (index < 0) return null;
    const existing = marketHistory[index];
    const entry = {
      ...existing,
      filters,
      signature: filterSignature(filters),
      listings: normalizeListings(listings),
      sourceFileName,
      searchUrl: searchUrl || buildMobileDeSearchUrl(filters),
      pinned: pinned === null ? Boolean(existing.pinned) : pinned,
      updatedAt: new Date().toISOString(),
    };
    const updatedHistory = [...marketHistory];
    updatedHistory[index] = withPriceLog(entry, existing);
    if (!storeMarketHistory(updatedHistory)) return null;
    renderHistory();
    return updatedHistory[index];
  }

  function formatHistoryDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(currentLanguage() === "ru" ? "ru-RU" : "pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }

  function historyMeta(filters) {
    const c = copy();
    const fuelLabels = {
      petrol: c.fuelPetrol,
      diesel: c.fuelDiesel,
      hybrid_diesel: c.fuelHybridDiesel,
      hybrid_petrol: c.fuelHybridPetrol,
      electric: c.fuelElectric,
      plugin: c.fuelPlugin,
    };
    const engine = manualFuelValues(filters)
      .map((fuel) => fuelLabels[fuel])
      .filter(Boolean)
      .join(", ");
    const gearbox = {
      automatic: c.gearboxAutomatic,
      manual: c.gearboxManual,
      any: c.gearboxAny,
    }[filters.gearbox || "any"] || c.gearboxAny;
    return [
      rangeSummary(c.price, filters.priceFrom, filters.priceTo, "EUR"),
      rangeSummary(c.year, filters.yearFrom, filters.yearTo),
      rangeSummary(c.mileage, filters.mileageFrom, filters.mileageTo, "km"),
      engine ? `${c.engine}: ${engine}` : "",
      `${c.gearbox}: ${gearbox}`,
    ].filter(Boolean);
  }

  function historySearchUrl(entry) {
    if (entry.searchUrl) return entry.searchUrl;
    try {
      return buildMobileDeSearchUrl(entry.filters);
    } catch {
      return "";
    }
  }

  function renderHistory() {
    const c = copy();
    const pinnedCount = marketHistory.filter((entry) => entry.pinned).length;
    const recentCount = marketHistory.length - pinnedCount;
    historyCount.textContent = pinnedCount
      ? `★ ${pinnedCount} · ${recentCount} / ${HISTORY_LIMIT}`
      : `${recentCount} / ${HISTORY_LIMIT}`;
    if (!marketHistory.length) {
      historyList.innerHTML = `<p class="mobileMarketHistoryEmpty">${escapeMarketHtml(c.historyEmpty)}</p>`;
      return;
    }

    historyList.innerHTML = marketHistory.map((entry) => {
      const title = [entry.filters.brand, entry.filters.model, entry.filters.version].filter(Boolean).join(" ");
      const meta = historyMeta(entry.filters);
      const ready = entry.listings.length >= 3;
      const status = ready
        ? c.historyReady.replace("{count}", String(entry.listings.length))
        : c.historyWaiting;
      return `
        <article class="mobileMarketHistoryItem${ready ? " isReady" : ""}${entry.pinned ? " isPinned" : ""}${editingHistoryId === entry.id ? " isSelected" : ""}">
          <label class="mobileMarketHistorySelect">
            <input type="radio" name="mobile-market-history-selection" value="${escapeMarketHtml(entry.id)}" data-mobile-market-history-select${editingHistoryId === entry.id ? " checked" : ""} />
            <span class="mobileMarketHistoryMain">
              <span class="mobileMarketHistoryTitleRow">
                <strong>${entry.pinned ? '<i class="mobileMarketHistoryPinMark" aria-hidden="true">★</i>' : ""}${escapeMarketHtml(title)}</strong>
                <time datetime="${escapeMarketHtml(entry.updatedAt)}">${escapeMarketHtml(formatHistoryDate(entry.updatedAt))}</time>
              </span>
              ${meta.length ? `<span class="mobileMarketHistoryMeta">${meta.map((item) => `<span>${escapeMarketHtml(item)}</span>`).join("")}</span>` : ""}
              <span class="mobileMarketHistoryStatus">${escapeMarketHtml(status)}</span>
            </span>
          </label>
          <div class="mobileMarketHistoryActions">
            ${editingHistoryId === entry.id ? `<button class="mobileMarketHistoryIconButton mobileMarketHistoryConfirmButton" type="button" data-mobile-market-history-confirm="${escapeMarketHtml(entry.id)}" aria-label="${escapeMarketHtml(c.historyConfirm)}" title="${escapeMarketHtml(c.historyConfirm)}" hidden>✓</button>` : ""}
            <button class="mobileMarketHistoryIconButton mobileMarketHistoryFavoriteButton${entry.pinned ? " isPinned" : ""}" type="button" data-mobile-market-history-pin="${escapeMarketHtml(entry.id)}" data-mobile-market-history-pinned="${entry.pinned ? "true" : "false"}" aria-pressed="${entry.pinned ? "true" : "false"}" aria-label="${escapeMarketHtml(entry.pinned ? c.historyUnpin : c.historyPin)}" title="${escapeMarketHtml(entry.pinned ? c.historyUnpin : c.historyPin)}">★</button>
            <button class="isDelete mobileMarketHistoryIconButton" type="button" data-mobile-market-history-delete="${escapeMarketHtml(entry.id)}" aria-label="${escapeMarketHtml(c.historyDelete)}" title="${escapeMarketHtml(c.historyDelete)}">×</button>
          </div>
        </article>`;
    }).join("");
    updateHistoryConfirm();
  }

  // The ✓ appears on the selected entry once the form no longer matches it.
  function updateHistoryConfirm() {
    const button = historyList.querySelector("[data-mobile-market-history-confirm]");
    if (!button) return;
    const entry = marketHistory.find((item) => item.id === editingHistoryId);
    let changed = false;
    try {
      changed = Boolean(entry) && filterSignature(readManualFields()) !== filterSignature(entry.filters);
    } catch {
      changed = false;
    }
    button.hidden = !changed;
  }

  function confirmHistoryChanges(historyId) {
    const c = copy();
    const entry = marketHistory.find((item) => item.id === historyId);
    if (!entry) return;
    try {
      const filters = readManualFields();
      if (!filters.brand || !filters.model) throw new Error(c.missingVehicle);
      // Prices collected for the old filters no longer describe the new ones.
      const same = filterSignature(filters) === filterSignature(entry.filters);
      const snapshot = updateMarketSnapshot(entry.id, filters, same ? entry.listings : [], same ? entry.sourceFileName : "", buildMobileDeSearchUrl(filters));
      if (!snapshot) return;
      editingHistoryId = snapshot.id;
      renderHistory();
      setAnalysisStatus(c.historyUpdateSuccess);
    } catch (error) {
      setAnalysisStatus(error.message || c.missingVehicle, true);
    }
  }

  function setElementValue(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.value = value || "";
  }

  function setHistoryCheckboxes(selector, values) {
    const selected = new Set(Array.isArray(values) ? values : []);
    document.querySelectorAll(selector).forEach((input) => {
      input.checked = selected.has(input.value);
    });
  }

  function restoreManualFilters(filters) {
    const valueSelectors = {
      brand: "[data-mobile-brand]",
      model: "[data-mobile-model]",
      version: "[data-mobile-version]",
      body: "[data-mobile-body]",
      priceFrom: "[data-mobile-price-from]",
      priceTo: "[data-mobile-price-to]",
      mileageFrom: "[data-mobile-mileage-from]",
      mileageTo: "[data-mobile-mileage-to]",
      yearFrom: "[data-mobile-year-from]",
      yearTo: "[data-mobile-year-to]",
      displacementFrom: "[data-mobile-displacement-from]",
      displacementTo: "[data-mobile-displacement-to]",
      powerFrom: "[data-mobile-power-from]",
      powerTo: "[data-mobile-power-to]",
      seatsFrom: "[data-mobile-seats-from]",
      seatsTo: "[data-mobile-seats-to]",
      vat: "[data-mobile-vat]",
      seller: "[data-mobile-seller]",
      damagedVehicles: "[data-mobile-damaged-vehicles]",
    };
    Object.entries(valueSelectors).forEach(([key, selector]) => setElementValue(selector, filters[key]));
    document.querySelectorAll("[data-mobile-drive]").forEach((input) => {
      input.checked = input.value === (filters.drive || "any");
    });
    document.querySelectorAll("[data-mobile-gearbox]").forEach((input) => {
      input.checked = input.value === (filters.gearbox || "any");
    });
    document.querySelectorAll("[data-mobile-air-conditioning]").forEach((input) => {
      input.checked = input.value === (filters.airConditioning || "");
    });
    document.querySelectorAll("[data-mobile-trailer-coupling]").forEach((input) => {
      input.checked = input.value === (filters.trailerCoupling || "any");
    });
    document.querySelectorAll("[data-mobile-cruise-control]").forEach((input) => {
      input.checked = input.value === (filters.cruiseControl || "any");
    });
    setHistoryCheckboxes("[data-mobile-country]", filters.countries?.length ? filters.countries : ["DE"]);
    setHistoryCheckboxes("[data-mobile-fuel]", manualFuelValues(filters));
    setHistoryCheckboxes("[data-mobile-interior-material]", filters.interiorMaterials);
    setHistoryCheckboxes("[data-mobile-feature]", filters.features);
    setHistoryCheckboxes("[data-mobile-parking-sensor]", filters.parkingSensors);
    setHistoryCheckboxes("[data-mobile-exterior-color]", filters.exteriorColors);
    setHistoryCheckboxes("[data-mobile-interior-color]", filters.interiorColors);
    const booleanSelectors = {
      matte: "[data-mobile-matte]",
      metallic: "[data-mobile-metallic]",
      nonSmoking: "[data-mobile-non-smoking]",
      roadworthy: "[data-mobile-roadworthy]",
    };
    Object.entries(booleanSelectors).forEach(([key, selector]) => {
      const input = document.querySelector(selector);
      if (input) input.checked = key === "roadworthy" ? filters[key] !== false : Boolean(filters[key]);
    });
    if (typeof renderManualOptions === "function") renderManualOptions(true);
  }

  function saveCurrentHistory() {
    const c = copy();
    try {
      const filters = readManualFields();
      if (!filters.brand || !filters.model) throw new Error(c.missingVehicle);
      const searchUrl = buildMobileDeSearchUrl(filters);
      const matchingImport = importedDataset?.filterKey === vehicleDataKey(filters) ? importedDataset : null;
      const editedEntry = marketHistory.find((entry) => entry.id === editingHistoryId) || null;
      const existing = editedEntry || historyEntryForFilters(filters);
      const matchingFilters = existing?.signature === filterSignature(filters);
      const listings = matchingImport?.listings || (matchingFilters ? existing?.listings || [] : []);
      const sourceFileName = matchingImport?.fileName || (matchingFilters ? existing?.sourceFileName || "" : "");
      const snapshot = editedEntry
        ? updateMarketSnapshot(editedEntry.id, filters, listings, sourceFileName, searchUrl, true)
        : createMarketSnapshot(filters, listings, sourceFileName, searchUrl, true);
      if (snapshot) setAnalysisStatus(editedEntry ? c.historyUpdateSuccess : c.saveSuccess);
    } catch (error) {
      setAnalysisStatus(error.message || c.missingVehicle, true);
    }
  }

  // Called when the user opens a marketplace search: log it, or refresh the
  // timestamp of the same search so it moves back to the top of the list.
  function logSearchToHistory(searchUrl = "") {
    let filters;
    try {
      filters = readManualFields();
    } catch {
      return;
    }
    if (!filters.brand || !filters.model) return;
    const existing = historyEntryForFilters(filters);
    let resolvedSearchUrl = String(searchUrl || "");
    if (!resolvedSearchUrl) {
      try {
        resolvedSearchUrl = buildMobileDeSearchUrl(filters);
      } catch {
        return;
      }
    }
    if (existing) updateMarketSnapshot(existing.id, filters, existing.listings, existing.sourceFileName, resolvedSearchUrl);
    else createMarketSnapshot(filters, [], "", resolvedSearchUrl);
  }

  function setHistoryPinned(historyId, pinned) {
    const entry = marketHistory.find((item) => item.id === historyId);
    if (!entry) return;
    if (!storeMarketHistory(marketHistory.map((item) => (
      item.id === historyId ? { ...item, pinned } : item
    )))) return;
    renderHistory();
    setAnalysisStatus(pinned ? copy().historyPinned : copy().historyUnpin);
  }

  function deleteHistoryEntry(historyId) {
    const entry = marketHistory.find((item) => item.id === historyId);
    if (!entry) return;
    if (!storeMarketHistory(marketHistory.filter((item) => item.id !== historyId))) return;
    if (activeAnalysis?.historyId === historyId) activeAnalysis.historyId = "";
    if (editingHistoryId === historyId) editingHistoryId = "";
    renderHistory();
  }

  function selectHistoryEntry(historyId) {
    const entry = marketHistory.find((item) => item.id === historyId);
    if (!entry) return;
    restoreManualFilters(entry.filters);
    editingHistoryId = entry.id;
    analysisView.hidden = true;
    setManualViewHidden(false);
    setAnalysisStatus("");
    renderHistory();
  }

  function clearHistorySelection() {
    editingHistoryId = "";
    document.querySelector("[data-mobile-manual-reset]")?.click();
    renderHistory();
  }

  function openHistoryAnalysis(historyId) {
    const entry = marketHistory.find((item) => item.id === historyId);
    if (!entry) return;
    restoreManualFilters(entry.filters);
    const searchUrl = buildMobileDeSearchUrl(entry.filters);
    importedDataset = entry.listings.length >= 3 ? {
      listings: entry.listings,
      fileName: entry.sourceFileName,
      filterKey: vehicleDataKey(entry.filters),
    } : null;
    activeAnalysis = {
      filters: entry.filters,
      listings: entry.listings,
      searchUrl,
      providerId: entry.listings.length >= 3 ? "history" : "empty",
      sourceFileName: entry.sourceFileName,
      historyId: entry.id,
    };
    renderAnalysis();
    setManualViewHidden(true);
    analysisView.hidden = false;
    setAnalysisStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function csvDelimiter(text) {
    const firstLine = String(text).split(/\r?\n/).find((line) => line.trim()) || "";
    const candidates = [",", ";", "\t"];
    return candidates.sort((left, right) => firstLine.split(right).length - firstLine.split(left).length)[0];
  }

  function parseCsv(text) {
    const delimiter = csvDelimiter(text);
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (character === '"') {
        if (quoted && text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else quoted = !quoted;
      } else if (character === delimiter && !quoted) {
        row.push(field.trim());
        field = "";
      } else if ((character === "\n" || character === "\r") && !quoted) {
        if (character === "\r" && text[index + 1] === "\n") index += 1;
        row.push(field.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        field = "";
      } else field += character;
    }
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
    if (rows.length < 2) return [];
    const headers = rows[0].map((header) => header.trim().toLowerCase());
    return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
  }

  async function parseListingFile(file) {
    if (file.size > 5 * 1024 * 1024) return [];
    const text = (await file.text()).replace(/^\uFEFF/, "").trim();
    if (!text) return [];
    let rows;
    if (file.name.toLowerCase().endsWith(".json") || /^[\[{]/.test(text)) {
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : parsed.listings || parsed.results || parsed.items || [];
    } else rows = parseCsv(text);
    return normalizeListings(rows);
  }

  function selectedOptionText(selector) {
    const option = document.querySelector(`${selector} option:checked`);
    if (option?.value) return option.textContent.trim();
    const displaySelectors = {
      "[data-mobile-vat]": "[data-mobile-vat-label]",
      "[data-mobile-seller]": "[data-mobile-seller-label]",
    };
    const value = document.querySelector(selector)?.value;
    return value ? document.querySelector(displaySelectors[selector])?.value.trim() || "" : "";
  }

  function checkedLabel(selector) {
    const input = document.querySelector(`${selector}:checked`);
    return input?.closest("label")?.textContent.trim() || "";
  }

  function checkedLabels(selector) {
    return [...document.querySelectorAll(`${selector}:checked`)]
      .map((input) => input.closest("label")?.textContent.trim())
      .filter(Boolean);
  }

  function rangeSummary(label, from, to, unit = "") {
    if (!from && !to) return "";
    const range = [from || "—", to || "—"].join("–");
    return `${label}: ${range}${unit ? ` ${unit}` : ""}`;
  }

  function filterSummary(filters) {
    const c = copy();
    const summary = [];
    summary.push([filters.brand, filters.model, filters.version].filter(Boolean).join(" "));
    const fuelLabels = checkedLabels("[data-mobile-fuel]");
    if (fuelLabels.length) summary.push(fuelLabels.join(", "));
    const body = filters.body ? checkedLabel("[data-mobile-body-choice]") : "";
    if (body) summary.push(body);
    summary.push(rangeSummary(c.price, filters.priceFrom, filters.priceTo, "EUR"));
    summary.push(rangeSummary(c.year, filters.yearFrom, filters.yearTo));
    summary.push(rangeSummary(c.mileage, filters.mileageFrom, filters.mileageTo, "km"));
    summary.push(rangeSummary(c.displacement, filters.displacementFrom, filters.displacementTo, "ccm"));
    summary.push(rangeSummary(c.power, filters.powerFrom, filters.powerTo, "KM"));
    summary.push(rangeSummary(c.seats, filters.seatsFrom, filters.seatsTo));
    if (filters.drive && filters.drive !== "any") summary.push(checkedLabel("[data-mobile-drive]"));
    if (filters.gearbox && filters.gearbox !== "any") summary.push(checkedLabel("[data-mobile-gearbox]"));
    const vat = selectedOptionText("[data-mobile-vat]");
    if (vat) summary.push(vat);
    const seller = selectedOptionText("[data-mobile-seller]");
    if (seller) summary.push(seller);
    const countries = checkedLabels("[data-mobile-country]");
    if (countries.length) summary.push(`${c.countries}: ${countries.join(", ")}`);
    summary.push(...checkedLabels("[data-mobile-interior-material]"));
    if (filters.airConditioning) summary.push(checkedLabel("[data-mobile-air-conditioning]"));
    if (filters.trailerCoupling && filters.trailerCoupling !== "any") summary.push(checkedLabel("[data-mobile-trailer-coupling]"));
    summary.push(...checkedLabels("[data-mobile-feature]"));
    summary.push(...checkedLabels("[data-mobile-parking-sensor]"));
    if (filters.cruiseControl && filters.cruiseControl !== "any") summary.push(checkedLabel("[data-mobile-cruise-control]"));
    summary.push(...checkedLabels("[data-mobile-exterior-color]"));
    summary.push(...checkedLabels("[data-mobile-interior-color]"));
    if (filters.matte) summary.push(document.querySelector("[data-mobile-matte]")?.closest("label")?.textContent.trim());
    if (filters.metallic) summary.push(document.querySelector("[data-mobile-metallic]")?.closest("label")?.textContent.trim());
    if (filters.nonSmoking) summary.push(document.querySelector("[data-mobile-non-smoking]")?.closest("label")?.textContent.trim());
    if (filters.roadworthy) summary.push(document.querySelector("[data-mobile-roadworthy]")?.closest("label")?.textContent.trim());
    return summary.filter(Boolean);
  }

  // The same summary in three columns: the car and its seller, the technical
  // parameters, the equipment.
  function filterSummaryGroups(filters) {
    const c = copy();
    const labelOf = (selector) => document.querySelector(selector)?.closest("label")?.textContent.trim();
    const vehicle = [
      [filters.brand, filters.model, filters.version].filter(Boolean).join(" "),
    ];
    const countries = checkedLabels("[data-mobile-country]");
    if (countries.length) vehicle.push(`${c.countries}: ${countries.join(", ")}`);
    vehicle.push(selectedOptionText("[data-mobile-vat]"), selectedOptionText("[data-mobile-seller]"));
    if (filters.nonSmoking) vehicle.push(labelOf("[data-mobile-non-smoking]"));
    if (filters.roadworthy) vehicle.push(labelOf("[data-mobile-roadworthy]"));

    const parameters = [];
    const fuelLabels = checkedLabels("[data-mobile-fuel]");
    if (fuelLabels.length) parameters.push(fuelLabels.join(", "));
    if (filters.body) parameters.push(checkedLabel("[data-mobile-body-choice]"));
    parameters.push(
      rangeSummary(c.price, filters.priceFrom, filters.priceTo, "EUR"),
      rangeSummary(c.year, filters.yearFrom, filters.yearTo),
      rangeSummary(c.mileage, filters.mileageFrom, filters.mileageTo, "km"),
      rangeSummary(c.displacement, filters.displacementFrom, filters.displacementTo, "ccm"),
      rangeSummary(c.power, filters.powerFrom, filters.powerTo, "KM"),
      rangeSummary(c.seats, filters.seatsFrom, filters.seatsTo),
    );
    if (filters.drive && filters.drive !== "any") parameters.push(checkedLabel("[data-mobile-drive]"));
    if (filters.gearbox && filters.gearbox !== "any") parameters.push(checkedLabel("[data-mobile-gearbox]"));

    const equipment = [...checkedLabels("[data-mobile-interior-material]")];
    if (filters.airConditioning) equipment.push(checkedLabel("[data-mobile-air-conditioning]"));
    if (filters.trailerCoupling && filters.trailerCoupling !== "any") equipment.push(checkedLabel("[data-mobile-trailer-coupling]"));
    equipment.push(...checkedLabels("[data-mobile-feature]"), ...checkedLabels("[data-mobile-parking-sensor]"));
    if (filters.cruiseControl && filters.cruiseControl !== "any") equipment.push(checkedLabel("[data-mobile-cruise-control]"));
    equipment.push(...checkedLabels("[data-mobile-exterior-color]"), ...checkedLabels("[data-mobile-interior-color]"));
    if (filters.matte) equipment.push(labelOf("[data-mobile-matte]"));
    if (filters.metallic) equipment.push(labelOf("[data-mobile-metallic]"));
    return [vehicle, parameters, equipment].map((items) => items.filter(Boolean));
  }

  function percentile(sortedValues, percentileValue) {
    if (!sortedValues.length) return 0;
    const index = (sortedValues.length - 1) * percentileValue;
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const weight = index - lowerIndex;
    return sortedValues[lowerIndex] + ((sortedValues[upperIndex] - sortedValues[lowerIndex]) * weight);
  }

  function marketStatistics(listings) {
    const prices = listings.map((listing) => listing.price).sort((left, right) => left - right);
    // Typical range: the middle half of the offers (P25–P75).
    const lowEnd = percentile(prices, 0.25);
    const highStart = percentile(prices, 0.75);
    return {
      count: prices.length,
      min: prices[0],
      median: percentile(prices, 0.5),
      max: prices[prices.length - 1],
      middleLow: lowEnd,
      middleHigh: highStart,
      middleCount: prices.filter((price) => price >= lowEnd && price <= highStart).length,
      lowCount: prices.filter((price) => price < lowEnd).length,
      highCount: prices.filter((price) => price > highStart).length,
      step: displayCurrency === "PLN" ? 5000 : 1000,
    };
  }

  function activeCurrency() {
    return displayCurrency;
  }

  function numberFormat() {
    return new Intl.NumberFormat(currentLanguage() === "ru" ? "ru-RU" : "pl-PL");
  }

  function formatMarketPrice(value, currency = activeCurrency()) {
    return new Intl.NumberFormat(currentLanguage() === "ru" ? "ru-RU" : "pl-PL", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  }

  function verticalMarketPosition(value, minimum, maximum) {
    if (maximum <= minimum) return 50;
    return 5 + (((maximum - value) / (maximum - minimum)) * 90);
  }

  function marketScaleTicks(minimum, maximum, step) {
    const ticks = [];
    const first = Math.ceil(minimum / step) * step;
    for (let price = first; price < maximum; price += step) {
      if (price > minimum) ticks.push(price);
    }
    return ticks;
  }

  function marketTickLabelStep(minimum, maximum, step) {
    return step * Math.max(1, Math.ceil((maximum - minimum) / (8 * step)));
  }

  function marketClass(price, statistics) {
    if (price < statistics.middleLow) return "isLow";
    if (price > statistics.middleHigh) return "isHigh";
    return "isMiddle";
  }

  function statHtml(label, value, modifier = "") {
    return `<div class="mobileMarketStat${modifier ? ` ${modifier}` : ""}"><dt>${escapeMarketHtml(label)}</dt><dd>${escapeMarketHtml(value)}</dd></div>`;
  }

  function formatPlainPrice(value, currency) {
    return formatMarketPrice(value, currency);
  }

  // Latest typical price of an entry, in the marketplace's own currency.
  function latestPriceLabel(entry) {
    const last = entry.priceLog?.[entry.priceLog.length - 1];
    if (!last) return "";
    return MARKET_SOURCES.filter((source) => last[source])
      .map((source) => `${source === "otomoto" ? "otomoto" : "mobile.de"} ${formatPlainPrice(last[source].median, last[source].currency)}`)
      .join(" · ");
  }

  function favoritesHtml(activeId = "") {
    const c = copy();
    const favorites = marketHistory.filter((entry) => entry.pinned);
    return `
      <section class="mobileMarketFavorites" aria-label="${escapeMarketHtml(c.favoritesHeading)}">
        <strong class="mobileMarketFavoritesTitle"><i aria-hidden="true">★</i>${escapeMarketHtml(c.favoritesHeading)}</strong>
        ${favorites.length ? `<div class="mobileMarketFavoritesList">
          ${favorites.map((entry) => {
            const title = [entry.filters.brand, entry.filters.model, entry.filters.version].filter(Boolean).join(" ");
            const meta = historyMeta(entry.filters).slice(0, 2).join(" · ");
            const price = latestPriceLabel(entry);
            const date = entry.dataAt ? formatHistoryDate(entry.dataAt) : "";
            return `<button class="mobileMarketFavorite${entry.id === activeId ? " isActive" : ""}" type="button" data-mobile-market-favorite="${escapeMarketHtml(entry.id)}"${entry.id === activeId ? ' aria-current="true"' : ""}>
              <b>${escapeMarketHtml(title)}</b>
              ${meta ? `<small>${escapeMarketHtml(meta)}</small>` : ""}
              <span>${escapeMarketHtml(price || c.favoritesNoData)}${date ? ` · ${escapeMarketHtml(date)}` : ""}</span>
            </button>`;
          }).join("")}
        </div>` : `<p>${escapeMarketHtml(c.favoritesEmpty)}</p>`}
      </section>`;
  }

  // Every measurement of this search, newest first, one row per marketplace,
  // each value compared with the previous measurement of that marketplace.
  function priceHistoryHtml(entry) {
    const c = copy();
    const log = entry?.priceLog || [];
    if (!log.length) return "";
    const numbers = numberFormat();
    const change = (current, previous) => {
      if (!Number.isFinite(current) || !Number.isFinite(previous) || !previous) return "";
      const pct = ((current - previous) / previous) * 100;
      if (Math.abs(pct) < 0.5) return `<em class="isFlat">=</em>`;
      return `<em class="${pct < 0 ? "isDown" : "isUp"}">${pct > 0 ? "▲" : "▼"} ${escapeMarketHtml(numbers.format(Math.round(Math.abs(pct) * 10) / 10))}%</em>`;
    };
    const price = (value, currency) => (Number.isFinite(value) ? escapeMarketHtml(formatPlainPrice(value, currency)) : "—");
    const groups = [];
    log.forEach((point, index) => {
      const rows = [];
      groups.push(rows);
      MARKET_SOURCES.forEach((source) => {
        const current = point[source];
        if (!current) return;
        const previous = log.slice(0, index).reverse().find((item) => item[source])?.[source];
        const cell = (key) => {
          const url = current[`${key}Url`];
          const value = url
            ? `<a class="agPriceLink" href="${escapeMarketHtml(url)}" target="_blank" rel="noopener">${price(current[key], current.currency)}<img class="agBrandMark" src="${BRAND_MARKS[source]}" alt="" /></a>`
            : price(current[key], current.currency);
          return `<td>${value} ${previous ? change(current[key], previous[key]) : ""}</td>`;
        };
        rows.push(`
          <tr>
            <td>${escapeMarketHtml(formatHistoryDate(point.at))}</td>
            <td><span class="mobileMarketSourceTag is${source === "otomoto" ? "Otomoto" : "Mobile"}"><i aria-hidden="true"></i>${escapeMarketHtml(source === "otomoto" ? c.sourceOtomoto : c.sourceMobile)}</span></td>
            <td>${current.count} ${previous ? change(current.count, previous.count) : ""}</td>
            ${cell("min")}${cell("p25")}${cell("median")}${cell("p75")}${cell("max")}
          </tr>`);
      });
    });
    return `
      <section class="mobileMarketCard mobileMarketPriceHistory" aria-label="${escapeMarketHtml(c.priceHistoryHeading)}">
        <h2 class="mobileMarketCardTitle">${escapeMarketHtml(c.priceHistoryHeading)}</h2>
        <div class="mobileMarketTableScroll">
          <table class="mobileMarketTable">
            <thead><tr>
              <th scope="col">${escapeMarketHtml(c.priceHistoryDate)}</th>
              <th scope="col">${escapeMarketHtml(c.priceHistorySource)}</th>
              <th scope="col">${escapeMarketHtml(c.priceHistoryOffers)}</th>
              <th scope="col">${escapeMarketHtml(c.minimum)}</th>
              <th scope="col">P25</th>
              <th scope="col">${escapeMarketHtml(c.median)}</th>
              <th scope="col">P75</th>
              <th scope="col">${escapeMarketHtml(c.maximum)}</th>
            </tr></thead>
            <tbody>${groups.reverse().flat().join("")}</tbody>
          </table>
        </div>
      </section>`;
  }

  // "Analiza rynku" without a car chosen: the favourites to pick from.
  function renderFavoritesPage() {
    const c = copy();
    activeAnalysis = null;
    analysisContent.innerHTML = `
      <article class="mobileMarketAnalysisPanel">
        ${favoritesHtml()}
        <header class="mobileMarketAnalysisHead">
          <div>
            <h1>${escapeMarketHtml(c.heading)}</h1>
            <p>${escapeMarketHtml(c.favoritesPick)}</p>
          </div>
        </header>
      </article>`;
    setManualViewHidden(true);
    analysisView.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openFavorite(historyId) {
    const entry = marketHistory.find((item) => item.id === historyId);
    if (!entry) return;
    chartSources = { otomoto: true, mobile: true };
    if (entry.listings.length >= 3) {
      openHistoryAnalysis(historyId);
      return;
    }
    // No prices saved yet: fetch them for this car's filters.
    restoreManualFilters(entry.filters);
    openAnalysis();
  }

  const BRAND_MARKS = {
    mobile: "./assets/brands/mobile-de-mark.svg",
    otomoto: "./assets/brands/otomoto-mark.svg",
  };
  const BRAND_LOGOS = {
    mobile: "./assets/brands/mobile-de-logo.svg",
    otomoto: "./assets/brands/otomoto-logo.svg",
  };

  // The marketplace's own logo as the link to its search.
  function brandLogoLink(source, url, label) {
    return `<a class="agBrandLink is${source === "otomoto" ? "Otomoto" : "Mobile"}" href="${escapeMarketHtml(url)}" target="_blank" rel="noopener" title="${escapeMarketHtml(label)}" aria-label="${escapeMarketHtml(label)}"><img src="${BRAND_LOGOS[source]}" alt="" /></a>`;
  }

  // The marketplace's small mark as the link to one of its offers.
  function brandMarkLink(source, url, label) {
    return `<a class="agBrandMarkLink" href="${escapeMarketHtml(url)}" target="_blank" rel="noopener" title="${escapeMarketHtml(label)}" aria-label="${escapeMarketHtml(label)}"><img src="${BRAND_MARKS[source === "otomoto" ? "otomoto" : "mobile"]}" alt="" /></a>`;
  }

  // The searched market in the same four columns as a recognised car:
  // body and engine, mileage and drive, equipment, other information.
  function searchSpecColumns(filters, sources) {
    const t = window.AUTOGOOD_SPEC_COPY?.() || {};
    const numbers = numberFormat();
    const any = t.specAny || "—";
    const range = (from, to, unit = "", plain = false) => {
      const format = (value) => (plain ? String(value) : numbers.format(Number(value)));
      const suffix = unit ? ` ${unit}` : "";
      if (from && to) return from === to ? `${format(from)}${suffix}` : `${format(from)} – ${format(to)}${suffix}`;
      if (from) return `${t.specFrom} ${format(from)}${suffix}`;
      if (to) return `${t.specTo} ${format(to)}${suffix}`;
      return any;
    };
    const labelOf = (selector) => document.querySelector(selector)?.closest("label")?.textContent.trim();
    const fuels = checkedLabels("[data-mobile-fuel]");
    const equipment = [
      ...checkedLabels("[data-mobile-interior-material]"),
      filters.airConditioning ? checkedLabel("[data-mobile-air-conditioning]") : "",
      ...checkedLabels("[data-mobile-parking-sensor]"),
      filters.cruiseControl && filters.cruiseControl !== "any" ? checkedLabel("[data-mobile-cruise-control]") : "",
      filters.trailerCoupling && filters.trailerCoupling !== "any" ? checkedLabel("[data-mobile-trailer-coupling]") : "",
      ...checkedLabels("[data-mobile-feature]"),
      ...checkedLabels("[data-mobile-exterior-color]"),
      filters.metallic ? labelOf("[data-mobile-metallic]") : "",
      filters.matte ? labelOf("[data-mobile-matte]") : "",
      ...checkedLabels("[data-mobile-interior-color]").map((label) => `${t.interiorColorLabel || ""}: ${label}`),
    ].filter(Boolean);
    const countries = [
      ...(sources.includes("mobile") ? (checkedLabels("[data-mobile-country]").length ? checkedLabels("[data-mobile-country]") : []) : []),
      ...(sources.includes("otomoto") ? [t.countryNames?.PL || "Polska"] : []),
    ];
    const status = [
      filters.roadworthy ? labelOf("[data-mobile-roadworthy]") : "",
      filters.nonSmoking ? labelOf("[data-mobile-non-smoking]") : "",
      filters.damagedVehicles ? selectedOptionText("[data-mobile-damaged-vehicles]") : "",
    ].filter(Boolean);
    return [
      { heading: t.specEngineHeading, rows: [
        [t.specBody, filters.body ? checkedLabel("[data-mobile-body-choice]") || any : any],
        [t.specEngineType, fuels.length ? fuels.join(", ") : any],
        [t.specDisplacement, range(filters.displacementFrom, filters.displacementTo, "ccm")],
        [t.specPower, range(filters.powerFrom, filters.powerTo, "KM")],
      ] },
      { heading: t.specUsageHeading, rows: [
        [t.specMileage, range(filters.mileageFrom, filters.mileageTo, "km")],
        [t.specRegistration, range(filters.yearFrom, filters.yearTo, "", true)],
        [t.specGearbox, filters.gearbox && filters.gearbox !== "any" ? checkedLabel("[data-mobile-gearbox]") : any],
        [t.specDrive, filters.drive && filters.drive !== "any" ? checkedLabel("[data-mobile-drive]") : any],
      ] },
      { heading: t.specEquipmentHeading, text: equipment.length ? equipment.join(" - ") : t.specNoEquipment, muted: !equipment.length },
      { heading: t.specOtherHeading, rows: [
        [t.specCountry, countries.length ? countries.join(", ") : any],
        [t.specStatus, status.length ? status.join(", ") : any],
        [t.specVat, selectedOptionText("[data-mobile-vat]") || any],
        [t.specSeller, selectedOptionText("[data-mobile-seller]") || any],
        ...(filters.priceFrom || filters.priceTo ? [[t.specPrice, range(filters.priceFrom, filters.priceTo, "EUR")]] : []),
      ] },
    ];
  }

  function renderAnalysis() {
    if (!activeAnalysis) return;
    const c = copy();
    const { filters, listings, searchUrl, providerId, sourceFileName } = activeAnalysis;
    const historyEntry = marketHistory.find((entry) => entry.id === activeAnalysis.historyId) || null;
    const comparePriceEur = Number(String(activeAnalysis.comparePrice || "").replace(/[^\d]/g, "")) || 0;
    let otomotoUrl = "";
    try {
      otomotoUrl = buildOtomotoSearchUrl(filters);
    } catch {
      // Otomoto has no twin for this vehicle; its link is simply left out.
    }
    const stored = providerId === "import" || providerId === "history";
    // Every valid offer remains in the sample, including unusually priced ones.
    const bySource = { otomoto: [], mobile: [] };
    listings.forEach((listing) => bySource[listingSource(listing)].push(listing));
    const cleaned = bySource;
    const availableSources = MARKET_SOURCES.filter((source) => cleaned[source].length);
    const pickedSources = availableSources.filter((source) => chartSources[source]);
    const shownSources = pickedSources.length ? pickedSources : availableSources;
    // One chart, one currency: PLN whenever Otomoto is on it, EUR for Mobile.de alone.
    displayCurrency = shownSources.includes("otomoto") ? "PLN" : "EUR";
    const rate = exchangeRate() || EUR_PLN_FALLBACK_RATE;
    const inDisplayCurrency = (listing) => {
      if (listing.currency === displayCurrency) return listing.price;
      return displayCurrency === "PLN" ? listing.price * rate : listing.price / rate;
    };
    const marketListings = shownSources.flatMap((source) => cleaned[source]).map((listing) => ({
      ...listing,
      source: listingSource(listing),
      originalPrice: listing.price,
      originalCurrency: listing.currency,
      price: Math.round(inDisplayCurrency(listing)),
    }));
    const hasListings = marketListings.length >= 3;
    const onlyOtomoto = shownSources.length === 1 && shownSources[0] === "otomoto";
    const mixedSources = shownSources.length > 1;
    const summary = filterSummary(filters);
    const sourceName = (source) => (source === "otomoto" ? c.sourceOtomoto : c.sourceMobile);
    const listingKey = (listing) => listing.url || `${listing.source}-${listing.id}`;
    let statsContent = "";
    let marketContent = `
      <section class="mobileMarketEmpty">
        <strong>${escapeMarketHtml(c.emptyHeading)}</strong>
        <p>${escapeMarketHtml(c.emptyDescription)}</p>
        <button class="mobileMarketSourceButton isMobile isFetch" type="button" data-mobile-market-fetch-mobile><img class="agBrandMark" src="${BRAND_MARKS.mobile}" alt="" />${escapeMarketHtml(c.fetchMobile)}</button>
      </section>`;

    if (hasListings) {
      const statistics = marketStatistics(marketListings);
      const domainMinimum = statistics.min;
      const domainMaximum = statistics.max;
      const middleHighPosition = verticalMarketPosition(statistics.middleHigh, domainMinimum, domainMaximum);
      const middleLowPosition = verticalMarketPosition(statistics.middleLow, domainMinimum, domainMaximum);
      const medianPosition = verticalMarketPosition(statistics.median, domainMinimum, domainMaximum);
      const scaleTicks = marketScaleTicks(domainMinimum, domainMaximum, statistics.step);
      const labelStep = marketTickLabelStep(domainMinimum, domainMaximum, statistics.step);
      const canJudge = statistics.count >= 8 && !filters.priceFrom && !filters.priceTo;
      const numbers = numberFormat();

      // Horizontal axis: rank in the price-sorted list (the offers laid out the
      // way the site sorts them), mileage or year.
      // Each offer sits at its share of its own marketplace's price-sorted list:
      // the true place when the site told us (Otomoto), otherwise its order
      // inside that marketplace's sample (imported files).
      const rankOf = new Map();
      shownSources.forEach((source) => {
        const own = marketListings.filter((listing) => listing.source === source)
          .sort((left, right) => left.price - right.price);
        own.forEach((listing, index) => rankOf.set(listing, listing.rank && listing.marketTotal > 1
          ? (listing.rank - 1) / (listing.marketTotal - 1)
          : index / Math.max(1, own.length - 1)));
      });
      const singleRankedSource = shownSources.length === 1
        && marketListings.every((listing) => listing.rank && listing.marketTotal > 1);
      const marketTotal = singleRankedSource ? Math.max(...marketListings.map((listing) => listing.marketTotal)) : 0;
      const axisValueOf = (listing) => {
        if (chartAxis === "mileage") return Number.isFinite(listing.mileage) && listing.mileage > 0 ? listing.mileage : null;
        if (chartAxis === "year") return Number.isFinite(listing.year) && listing.year > 0 ? listing.year : null;
        return rankOf.get(listing);
      };
      const axisValues = marketListings.map(axisValueOf).filter((value) => value !== null);
      const axisMin = chartAxis === "rank" ? 0 : (axisValues.length ? Math.min(...axisValues) : 0);
      const axisMax = chartAxis === "rank" ? 1 : (axisValues.length ? Math.max(...axisValues) : 1);
      const axisSpan = axisMax - axisMin;
      const xOf = (listing) => {
        const value = axisValueOf(listing);
        if (value === null) return null;
        let x = axisSpan ? (value - axisMin) / axisSpan : 0.5;
        // Offers of the same year would stack into one dot: spread them a little.
        if (chartAxis === "year") {
          const spread = axisSpan ? Math.min(0.35 / (axisSpan + 1), 0.05) : 0.2;
          x += (((seededNumber(`${listing.id}|${listing.price}`) % 1000) / 1000) - 0.5) * spread;
        }
        return Math.min(1, Math.max(0, x));
      };
      const plotted = marketListings
        .map((listing) => ({ listing, x: xOf(listing), y: verticalMarketPosition(listing.price, domainMinimum, domainMaximum) }))
        .filter((point) => point.x !== null);
      const hiddenByAxis = marketListings.length - plotted.length;

      const niceStep = (span, count) => {
        const rough = Math.max(1, span) / count;
        const magnitude = 10 ** Math.floor(Math.log10(rough));
        const normalized = rough / magnitude;
        return (normalized > 5 ? 10 : normalized > 2 ? 5 : normalized > 1 ? 2 : 1) * magnitude;
      };
      let xTicks = [];
      if (chartAxis === "rank") {
        // One marketplace: places in its list. Several: share of each list.
        xTicks = [0, 0.25, 0.5, 0.75, 1].map((x) => ({
          x,
          label: marketTotal
            ? (x === 0 ? `1 · ${c.axisRankStart}` : x === 1 ? `${numbers.format(marketTotal)} · ${c.axisRankEnd}` : numbers.format(Math.round(marketTotal * x)))
            : (x === 0 ? `0% · ${c.axisRankStart}` : x === 1 ? `100% · ${c.axisRankEnd}` : `${x * 100}%`),
        }));
      } else if (axisSpan) {
        const step = chartAxis === "year" ? Math.max(1, Math.ceil(axisSpan / 8)) : niceStep(axisSpan, 5);
        for (let value = Math.ceil(axisMin / step) * step; value <= axisMax; value += step) {
          xTicks.push({
            x: (value - axisMin) / axisSpan,
            label: chartAxis === "mileage" ? `${numbers.format(value)} km` : String(value),
          });
        }
      } else if (axisValues.length) {
        xTicks = [{ x: 0.5, label: chartAxis === "mileage" ? `${numbers.format(axisMin)} km` : String(axisMin) }];
      }

      // Median price along mileage or year: offers under the line are cheap
      // for what they are, not only cheap overall.
      let trendLine = "";
      let trendMedians = [];
      if (chartAxis === "rank" && plotted.length >= 3) {
        const curves = shownSources.map((source) => {
          const curve = plotted.filter((point) => point.listing.source === source).sort((left, right) => left.x - right.x);
          return curve.length >= 2
            ? `<polyline class="is${source === "otomoto" ? "Otomoto" : "Mobile"}" points="${curve.map((point) => `${(point.x * 100).toFixed(2)},${point.y.toFixed(2)}`).join(" ")}" />`
            : "";
        }).join("");
        trendLine = `
            <svg class="mobileMarketTrend isCurve" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${curves}</svg>`;
      }
      if (chartAxis !== "rank" && plotted.length >= 6 && axisSpan) {
        const bins = new Map();
        plotted.forEach((point) => {
          const value = axisValueOf(point.listing);
          const bin = chartAxis === "year" ? value : Math.min(7, Math.floor(((value - axisMin) / axisSpan) * 8));
          bins.set(bin, [...(bins.get(bin) || []), point]);
        });
        const trendPoints = [...bins.entries()]
          .filter(([, points]) => points.length >= 2)
          .sort(([left], [right]) => left - right)
          .map(([, points]) => {
            const prices = points.map((point) => point.listing.price).sort((left, right) => left - right);
            const xs = points.map((point) => axisValueOf(point.listing)).sort((left, right) => left - right);
            const value = percentile(xs, 0.5);
            const price = percentile(prices, 0.5);
            return {
              value,
              price,
              x: ((value - axisMin) / axisSpan) * 100,
              y: verticalMarketPosition(price, domainMinimum, domainMaximum),
            };
          });
        trendMedians = trendPoints;
        if (trendPoints.length >= 2) {
          trendLine = `
            <svg class="mobileMarketTrend" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points="${trendPoints.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ")}" />
            </svg>`;
        }
      }

      const sortedListings = [...marketListings].sort((left, right) => {
        const factor = tableSort.direction === "asc" ? 1 : -1;
        return ((Number(left[tableSort.key]) || 0) - (Number(right[tableSort.key]) || 0)) * factor;
      });

      const describe = (listing) => [
        listing.year ? String(listing.year) : "",
        listing.mileage ? `${numbers.format(listing.mileage)} km` : "",
        listing.power || "",
      ].filter(Boolean).join(" · ");
      // Placeholder names ("otomoto.pl", "mobile.de · 03") say nothing.
      const fullTitle = (listing) => (/^(otomoto\.pl|mobile\.de · \d+)$/.test(listing.title || "") ? "" : listing.title || "");
      const points = [...plotted]
        .sort((left, right) => right.listing.price - left.listing.price)
        .map(({ listing, x, y }) => {
          const tooltipClass = x > 0.72 ? " isTooltipLeft" : "";
          const details = describe(listing);
          const original = listing.originalCurrency !== displayCurrency
            ? formatMarketPrice(listing.originalPrice, listing.originalCurrency)
            : "";
          const title = fullTitle(listing);
          const label = `${title ? `${title}, ` : ""}${listing.subtitle ? `${listing.subtitle}, ` : ""}${formatMarketPrice(listing.price)}${details ? `, ${details}` : ""}, ${sourceName(listing.source)}.${listing.url ? ` ${c.pointHint}` : ""}`;
          const tooltip = `
              <span class="mobileMarketPointTooltip" aria-hidden="true">
                ${title ? `<i class="mobileMarketPointTitle">${escapeMarketHtml(title)}</i>` : ""}
                ${listing.subtitle ? `<i class="mobileMarketPointSubtitle">${escapeMarketHtml(listing.subtitle)}</i>` : ""}
                <strong>${escapeMarketHtml(formatMarketPrice(listing.price))}${original ? ` <small>(${escapeMarketHtml(original)})</small>` : ""}</strong>
                ${details ? `<em>${escapeMarketHtml(details)}</em>` : ""}
                <b class="is${listing.source === "otomoto" ? "Otomoto" : "Mobile"}">${escapeMarketHtml(sourceName(listing.source))}</b>
              </span>`;
          const attributes = `class="mobileMarketPoint is${listing.source === "otomoto" ? "Otomoto" : "Mobile"}${tooltipClass}" data-market-key="${escapeMarketHtml(listingKey(listing))}" aria-label="${escapeMarketHtml(label)}" style="--x:${x.toFixed(4)};top:${y}%"`;
          return listing.url
            ? `<a ${attributes} href="${escapeMarketHtml(listing.url)}" target="_blank" rel="noopener">${tooltip}</a>`
            : `<span ${attributes} role="img">${tooltip}</span>`;
        })
        .join("");

      // The car recognised from a link, placed among the offers.
      const recognised = comparePriceEur
        ? { carBruttoEur: comparePriceEur, matchedFilters: { brand: filters.brand, model: filters.model }, isComparison: true }
        : (typeof state !== "undefined" ? state.data : null);
      const carLabel = recognised?.isComparison ? c.comparedCar : c.yourCar;
      const sameCar = recognised?.carBruttoEur
        && normalizeToken(recognised.matchedFilters?.brand || "") === normalizeToken(filters.brand || "")
        && normalizeToken(recognised.matchedFilters?.model || "") === normalizeToken(filters.model || "");
      let carMarker = "";
      let carVerdict = "";
      let carLocalVerdict = "";
      if (sameCar) {
        const carPrice = displayCurrency === "PLN" ? recognised.carBruttoEur * rate : recognised.carBruttoEur;
        const carYear = Number((String(recognised.firstRegistration || "").match(/(?:19|20)\d{2}/) || [])[0]) || null;
        const carMileage = Number(recognised.mileageKm) || null;
        const cheaperThan = marketListings.filter((listing) => listing.price > carPrice).length;
        const share = Math.round((cheaperThan / marketListings.length) * 100);
        const cheaperShare = marketListings.filter((listing) => listing.price < carPrice).length / marketListings.length;
        let carX = null;
        if (chartAxis === "rank") carX = cheaperShare;
        else if (chartAxis === "mileage" && carMileage && axisSpan) carX = (carMileage - axisMin) / axisSpan;
        else if (chartAxis === "year" && carYear && axisSpan) carX = (carYear - axisMin) / axisSpan;
        const clampedY = verticalMarketPosition(Math.min(Math.max(carPrice, domainMinimum), domainMaximum), domainMinimum, domainMaximum);
        if (carX !== null) {
          carMarker = `<span class="mobileMarketCar" style="--x:${Math.min(1, Math.max(0, carX)).toFixed(4)};top:${clampedY}%" role="img" aria-label="${escapeMarketHtml(`${carLabel}: ${formatMarketPrice(carPrice)}`)}"><i aria-hidden="true"></i><b>${escapeMarketHtml(carLabel)} · ${escapeMarketHtml(formatMarketPrice(carPrice))}</b></span>`;
        }
        const diffPct = Math.round(((carPrice - statistics.median) / statistics.median) * 100);
        const diff = Math.abs(diffPct) < 1 ? c.atMedian
          : (diffPct < 0 ? c.belowMedian : c.aboveMedian).replace("{pct}", String(Math.abs(diffPct)));
        const priceLabel = displayCurrency === "PLN"
          ? `${formatMarketPrice(carPrice)} (${formatMarketPrice(recognised.carBruttoEur, "EUR")})`
          : formatMarketPrice(carPrice);
        if (canJudge) carVerdict = c.yourCarVerdict.replace(c.yourCar, carLabel).replace("{price}", priceLabel).replace("{share}", String(share)).replace("{diff}", diff);
        // Against offers like it: the median price at its own mileage or year.
        const carValue = chartAxis === "mileage" ? carMileage : chartAxis === "year" ? carYear : null;
        if (carValue && trendMedians.length >= 2) {
          const sortedTrend = [...trendMedians].sort((left, right) => left.value - right.value);
          let reference = null;
          if (carValue <= sortedTrend[0].value) reference = sortedTrend[0].price;
          else if (carValue >= sortedTrend[sortedTrend.length - 1].value) reference = sortedTrend[sortedTrend.length - 1].price;
          else {
            const upper = sortedTrend.findIndex((point) => point.value >= carValue);
            const low = sortedTrend[upper - 1];
            const high = sortedTrend[upper];
            reference = low.price + ((carValue - low.value) / ((high.value - low.value) || 1)) * (high.price - low.price);
          }
          const localPct = Math.round(((carPrice - reference) / reference) * 100);
          const localDiff = Math.abs(localPct) < 1 ? c.atMedian
            : (localPct < 0 ? c.belowMedian : c.aboveMedian).replace("{pct}", String(Math.abs(localPct)));
          if (canJudge) carLocalVerdict = (chartAxis === "mileage" ? c.yourCarMileageVerdict : c.yourCarYearVerdict)
            .replace("{reference}", formatMarketPrice(reference))
            .replace("{diff}", localDiff);
        }
      }
      const sourceCount = (source) => cleaned[source].length;
      const axisCaption = chartAxis === "mileage" ? c.axisMileageCaption : chartAxis === "year" ? c.axisYearCaption : c.axisRankCaption;

      statsContent = `
        <div class="mobileMarketStatsBody">
        ${filters.priceFrom || filters.priceTo ? `<p class="mobileMarketCaution">${escapeMarketHtml(c.priceFilterWarning)}</p>` : ""}
        ${statistics.min < statistics.median / 3 || statistics.max > statistics.median * 3 ? `<p class="mobileMarketCaution">${escapeMarketHtml(c.wideRangeWarning)}</p>` : ""}
        <dl class="mobileMarketStats">
          ${statHtml(c.count, String(statistics.count))}
          ${statHtml(c.minimum, formatMarketPrice(statistics.min))}
          ${statHtml(c.median, formatMarketPrice(statistics.median))}
          ${statHtml(c.middleRange, `${formatMarketPrice(statistics.middleLow)} – ${formatMarketPrice(statistics.middleHigh)}`, "isRange")}
          ${statHtml(c.middleOffers, String(statistics.middleCount))}
          ${statHtml(c.maximum, formatMarketPrice(statistics.max))}
        </dl>
        </div>`;
      marketContent = `
        <div class="mobileMarketChartHead">
          <label class="mobileMarketCompare">
            <span>${escapeMarketHtml(c.comparePrice)}</span>
            <input type="text" inputmode="numeric" autocomplete="off" data-mobile-market-compare-price placeholder="${escapeMarketHtml(c.comparePlaceholder)}" value="${escapeMarketHtml(activeAnalysis.comparePrice || "")}" />
          </label>
          <div class="mobileMarketControls">
            <div class="mobileMarketToggle" role="group" aria-label="${escapeMarketHtml(c.sourcesLabel)}">
              ${MARKET_SOURCES.map((source) => {
                const count = sourceCount(source);
                const pressed = count > 0 && shownSources.includes(source);
                if (!count && source === "mobile") {
                  return `<button class="mobileMarketSourceButton isMobile isFetch" type="button" data-mobile-market-fetch-mobile><img class="agBrandMark" src="${BRAND_MARKS.mobile}" alt="" />${escapeMarketHtml(c.fetchMobile)}</button>`;
                }
                return `<button class="mobileMarketSourceButton is${source === "otomoto" ? "Otomoto" : "Mobile"}" type="button" data-mobile-market-source="${source}" aria-pressed="${pressed ? "true" : "false"}"${count ? "" : " disabled"}><i aria-hidden="true"></i>${escapeMarketHtml(sourceName(source))} · ${count || escapeMarketHtml(c.sourceEmpty)}</button>`;
              }).join("")}
            </div>
            <div class="mobileMarketToggle" role="group" aria-label="${escapeMarketHtml(c.axisLabel)}">
              ${[["rank", c.axisRank], ["mileage", c.axisMileageShort], ["year", c.axisYearShort]].map(([axis, label]) => `
                <button class="mobileMarketAxisButton" type="button" data-mobile-market-axis="${axis}" aria-pressed="${chartAxis === axis ? "true" : "false"}">${escapeMarketHtml(label)}</button>`).join("")}
            </div>
          </div>
        </div>

        ${carVerdict || carLocalVerdict ? `<ul class="mobileMarketCarVerdict">
          ${carVerdict ? `<li>${escapeMarketHtml(carVerdict)}</li>` : ""}
          ${carLocalVerdict ? `<li>${escapeMarketHtml(carLocalVerdict)}</li>` : ""}
        </ul>` : ""}

        <div class="mobileMarketLegend">
          ${shownSources.map((source) => `<span class="is${source === "otomoto" ? "Otomoto" : "Mobile"}"><i></i>${escapeMarketHtml(sourceName(source))}</span>`).join("")}
          ${carMarker ? `<span class="isCar"><i></i>${escapeMarketHtml(c.yourCar)}</span>` : ""}
          ${trendLine ? `<span class="isTrend"><i></i>${escapeMarketHtml(chartAxis === "rank" ? c.curveLegend : c.trendLegend)}</span>` : ""}
          <span class="isBandLow"><i></i>${escapeMarketHtml(c.lowMarket)} · ${statistics.lowCount}</span>
          <span class="isBandMiddle"><i></i>${escapeMarketHtml(c.middleMarket)} · ${statistics.middleCount}</span>
          <span class="isBandHigh"><i></i>${escapeMarketHtml(c.highMarket)} · ${statistics.highCount}</span>
        </div>

        <div
          class="mobileMarketScale${chartAxis === "rank" ? " isRankAxis" : ""}"
          role="group"
          aria-label="${escapeMarketHtml(c.chartTitle)}"
          data-currency="${escapeMarketHtml(displayCurrency)}"
          style="--market-high-end:${middleHighPosition}%;--market-middle-end:${middleLowPosition}%"
        >
          <div class="mobileMarketAxis"></div>
          <div class="mobileMarketBoundary" style="top:${middleHighPosition}%"></div>
          <div class="mobileMarketMedian" style="top:${medianPosition}%" aria-hidden="true"></div>
          <div class="mobileMarketBoundary" style="top:${middleLowPosition}%"></div>
          ${scaleTicks.map((price) => {
            const position = verticalMarketPosition(price, domainMinimum, domainMaximum);
            return `<div class="mobileMarketGridLine" style="top:${position}%"></div>${price % labelStep === 0 ? `<span class="mobileMarketTick isGrid" style="top:${position}%">${escapeMarketHtml(formatMarketPrice(price))}</span>` : ""}`;
          }).join("")}
          ${xTicks.map((tick) => `<div class="mobileMarketGridColumn" style="--x:${tick.x.toFixed(4)}"></div>`).join("")}
          <div class="mobileMarketPlot">${trendLine}</div>
          ${points}
          ${carMarker}
          ${Math.abs(middleHighPosition - medianPosition) >= 4 ? `<span class="mobileMarketKeyTick" style="top:${middleHighPosition}%">P75 · ${escapeMarketHtml(formatMarketPrice(statistics.middleHigh))}</span>` : ""}
          <span class="mobileMarketKeyTick isMedian" style="top:${medianPosition}%">${escapeMarketHtml(c.median)} · ${escapeMarketHtml(formatMarketPrice(statistics.median))}</span>
          ${Math.abs(middleLowPosition - medianPosition) >= 4 ? `<span class="mobileMarketKeyTick" style="top:${middleLowPosition}%">P25 · ${escapeMarketHtml(formatMarketPrice(statistics.middleLow))}</span>` : ""}
          <span class="mobileMarketTick isLimit" style="top:5%">${escapeMarketHtml(formatMarketPrice(domainMaximum))}</span>
          <span class="mobileMarketTick isLimit" style="top:95%">${escapeMarketHtml(formatMarketPrice(domainMinimum))}</span>
        </div>
        <div class="mobileMarketXAxis">
          <div class="mobileMarketXTicks">
            ${xTicks.map((tick) => `<em style="--x:${tick.x.toFixed(4)}">${escapeMarketHtml(tick.label)}</em>`).join("")}
          </div>
          <span class="mobileMarketXCaption">${escapeMarketHtml(axisCaption)}</span>
        </div>

          ${hiddenByAxis ? `<p class="mobileMarketAxisNote">${escapeMarketHtml(c.hiddenNoAxis.replace("{count}", String(hiddenByAxis)))}</p>` : ""}

        <section class="mobileMarketTableBlock" aria-label="${escapeMarketHtml(c.tableHeading)}">
          <div class="mobileMarketTableHead">
            <h2>${escapeMarketHtml(c.tableHeading)} · ${marketListings.length}</h2>
            <span>${escapeMarketHtml(c.tableSortHint)}</span>
          </div>
          <div class="mobileMarketTableScroll">
            <table class="mobileMarketTable">
              <thead>
                <tr>
                  ${[["price", c.tablePrice], ["year", c.tableYear], ["mileage", c.tableMileage]].map(([key, label]) => `
                    <th scope="col">
                      <button type="button" data-mobile-market-sort="${key}">${escapeMarketHtml(label)}${tableSort.key === key ? (tableSort.direction === "asc" ? " ↑" : " ↓") : ""}</button>
                    </th>`).join("")}
                  <th scope="col">${escapeMarketHtml(c.tableSource)}</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                ${sortedListings.map((listing) => `
                  <tr class="${marketClass(listing.price, statistics)}" data-market-key="${escapeMarketHtml(listingKey(listing))}">
                    <td>${escapeMarketHtml(formatMarketPrice(listing.price))}</td>
                    <td>${escapeMarketHtml(listing.year ? String(listing.year) : "—")}</td>
                    <td>${escapeMarketHtml(listing.mileage ? `${numbers.format(listing.mileage)} km` : "—")}</td>
                    <td><span class="mobileMarketSourceTag is${listing.source === "otomoto" ? "Otomoto" : "Mobile"}"><i aria-hidden="true"></i>${escapeMarketHtml(sourceName(listing.source))}</span></td>
                    <td>${listing.url ? brandMarkLink(listing.source, listing.url, `${c.tableOpen}: ${sourceName(listing.source)}`) : ""}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </section>`;
    }

    const dataDate = historyEntry?.dataAt || activeAnalysis.fetchedAt || "";
    const reportSources = shownSources.length ? shownSources : MARKET_SOURCES.filter((source) => chartSources[source]);
    const spec = window.AUTOGOOD_SPEC_SHEET?.({
      kicker: window.AUTOGOOD_SPEC_COPY?.().specSearchKicker || c.searchHeading,
      title: [filters.brand, filters.model, filters.version].filter(Boolean).join(" "),
      aside: `
        ${dataDate && hasListings ? `<span class="agSpecDate">${escapeMarketHtml(c.checkedAt.replace("{date}", formatHistoryDate(dataDate)))}</span>` : ""}
        <span class="agBrandLinks">
          ${brandLogoLink("mobile", searchUrl, c.openSearch)}
          ${otomotoUrl ? brandLogoLink("otomoto", otomotoUrl, c.openOtomoto) : ""}
        </span>`,
      columns: searchSpecColumns(filters, reportSources),
    }) || "";
    analysisContent.innerHTML = `
      <article class="mobileMarketAnalysisPanel">
        ${favoritesHtml(historyEntry?.pinned ? historyEntry.id : "")}
        <section class="mobileMarketCard mobileMarketSearchCard" aria-label="${escapeMarketHtml(c.searchHeading)}">
          <div class="mobileMarketToolbar">
            <span class="mobileBookmarkletRow">${escapeMarketHtml(c.bookmarkletInstall)}
              <a class="mobileBookmarkletLink" href="#" data-autogood-bookmarklet draggable="true">AUTOGOOD ↦ mobile.de</a>
              <em>${escapeMarketHtml(c.bookmarkletInstallHint)}</em></span>
            <div class="mobileMarketImportActions">
              <label class="mobileMarketImportButton">
                <input type="file" accept=".json,.csv,application/json,text/csv" data-mobile-market-file />
                <span>${escapeMarketHtml(c.importButton)}</span>
              </label>
              ${stored ? `<button class="mobileMarketImportClear" type="button" data-mobile-market-import-clear>${escapeMarketHtml(c.clearImport)}</button>` : ""}
              <button class="mobileMarketImportClear isPrimary" type="button" data-mobile-market-refresh>${escapeMarketHtml(c.refresh)}</button>
            </div>
          </div>
          ${analysisStatusHtml()}
          ${stored && /\.(json|csv)$/i.test(sourceFileName || "") ? `<p class="mobileMarketImportedNote">${escapeMarketHtml(c.importedFile.replace("{count}", String(listings.length)).replace("{file}", sourceFileName))}</p>` : ""}
          ${spec}
          ${statsContent}
        </section>

        <section class="mobileMarketCard mobileMarketChartCard" aria-label="${escapeMarketHtml(c.chartTitle)}">
          ${marketContent}
        </section>

        ${priceHistoryHtml(historyEntry)}
      </article>`;
    window.AUTOGOOD_PREPARE_BOOKMARKLETS?.();
  }

  // The filters' status line is hidden while the analysis is open, so the
  // analysis repeats the latest message in its own line.
  let analysisMessage = { text: "", isError: false };
  function analysisStatusHtml() {
    return `<p class="mobileMarketAnalysisStatus${analysisMessage.isError ? " isError" : ""}" aria-live="polite" data-mobile-market-analysis-status${analysisMessage.text ? "" : " hidden"}>${escapeMarketHtml(analysisMessage.text)}</p>`;
  }

  function setAnalysisStatus(message, isError = false) {
    if (typeof setMarketSearchStatus === "function") setMarketSearchStatus(message, isError);
    analysisMessage = { text: message || "", isError: Boolean(message) && isError };
    const line = analysisContent.querySelector("[data-mobile-market-analysis-status]");
    if (line) line.outerHTML = analysisStatusHtml();
  }

  async function openAnalysis() {
    const c = copy();
    try {
      const filters = readManualFields();
      if ((!filters.brand || !filters.model) && marketHistory.some((entry) => entry.pinned)) {
        setAnalysisStatus("");
        renderFavoritesPage();
        return;
      }
      if (!filters.brand || !filters.model) throw new Error(c.missingVehicle);
      const searchUrl = buildMobileDeSearchUrl(filters);
      const vehicleKey = vehicleDataKey(filters);
      if (importedDataset?.filterKey !== vehicleKey) importedDataset = null;
      const savedEntry = historyEntryForFilters(filters);
      // Otomoto samples saved before offers carried their place in the sorted
      // list cannot be laid out correctly, so those are fetched again.
      const savedUsable = savedEntry?.listings?.length >= 3 && savedEntry.listings
        .every((listing) => listingSource(listing) !== "otomoto" || listing.rank);
      const savedListings = savedUsable ? savedEntry.listings : null;
      setAnalysisStatus(c.preparing);
      analysisOpens.forEach((button) => { button.disabled = true; });
      const provider = importedDataset || savedListings ? null : window.AUTOGOOD_MOBILE_MARKET_PROVIDER;
      // Otomoto being unreachable (or empty) still opens the analysis, so the
      // Mobile.de offers can be added to it.
      let providerError = "";
      let rawListings = importedDataset?.listings || savedListings || [];
      if (provider) {
        try {
          rawListings = await provider.getListings({ filters, searchUrl });
        } catch (error) {
          providerError = error.message || c.invalidData;
        }
      }
      const normalizedListings = normalizeListings(rawListings);
      let listings = normalizedListings;
      if (pendingMobile?.listings?.length) {
        listings = mergeBySource(listings, pendingMobile.listings);
        pendingMobile = null;
      }
      const fetchedFromProvider = Boolean(provider) && listings.length >= 3;
      // A fetched price sample belongs to the saved search, so the history row
      // shows how many offers it is based on.
      const snapshot = fetchedFromProvider
        ? (savedEntry
          ? updateMarketSnapshot(savedEntry.id, filters, listings, provider.id, searchUrl)
          : createMarketSnapshot(filters, listings, provider.id, searchUrl))
        : null;
      activeAnalysis = {
        filters,
        listings,
        searchUrl,
        providerId: importedDataset ? "import" : (savedListings ? "history" : (provider?.id || "empty")),
        sourceFileName: importedDataset?.fileName || snapshot?.sourceFileName || savedEntry?.sourceFileName || "",
        historyId: snapshot?.id || savedEntry?.id || "",
        fetchedAt: provider && listings.length ? new Date().toISOString() : "",
      };
      analysisMessage = { text: providerError, isError: Boolean(providerError) };
      renderAnalysis();
      setManualViewHidden(true);
      analysisView.hidden = false;
      setAnalysisStatus(providerError, Boolean(providerError));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setAnalysisStatus(error.message || c.invalidData, true);
    } finally {
      analysisOpens.forEach((button) => { button.disabled = false; });
    }
  }

  function closeAnalysis() {
    analysisView.hidden = true;
    setManualViewHidden(false);
    requestAnimationFrame(() => analysisOpen.focus());
  }

  function renderMarketTranslations() {
    const c = copy();
    document.querySelectorAll("[data-market-i18n]").forEach((node) => {
      const value = c[node.dataset.marketI18n];
      if (value) node.textContent = value;
    });
    document.querySelectorAll("[data-market-icon-label]").forEach((button) => {
      const value = c[button.dataset.marketIconLabel];
      if (!value) return;
      button.setAttribute("aria-label", value);
      button.title = value;
    });
    renderHistory();
    renderAnalysis();
  }

  analysisContent.addEventListener("change", async (event) => {
    const input = event.target.closest("[data-mobile-market-file]");
    if (!input?.files?.[0] || !activeAnalysis) return;
    const c = copy();
    try {
      const imported = await parseListingFile(input.files[0]);
      if (imported.length < 3) throw new Error(c.importInvalid);
      // A Mobile.de file joins the Otomoto sample instead of replacing it.
      const listings = mergeBySource(activeAnalysis.listings, imported);
      importedDataset = {
        listings,
        fileName: input.files[0].name,
        filterKey: vehicleDataKey(activeAnalysis.filters),
      };
      activeAnalysis = {
        ...activeAnalysis,
        listings,
        providerId: "import",
        sourceFileName: input.files[0].name,
      };
      const snapshot = activeAnalysis.historyId
        ? updateMarketSnapshot(activeAnalysis.historyId, activeAnalysis.filters, listings, input.files[0].name, activeAnalysis.searchUrl)
        : createMarketSnapshot(activeAnalysis.filters, listings, input.files[0].name, activeAnalysis.searchUrl);
      if (snapshot) activeAnalysis.historyId = snapshot.id;
      setAnalysisStatus("");
      renderAnalysis();
    } catch (error) {
      setAnalysisStatus(error instanceof SyntaxError ? c.importReadError : (error.message || c.importReadError), true);
      input.value = "";
    }
  });

  async function refreshActiveAnalysis() {
    if (!activeAnalysis) return;
    const c = copy();
    const provider = window.AUTOGOOD_MOBILE_MARKET_PROVIDER;
    if (!provider || typeof provider.getListings !== "function") {
      setAnalysisStatus(c.refreshUnavailable, true);
      return;
    }
    try {
      setAnalysisStatus(c.refreshing);
      const fetched = normalizeListings(await provider.getListings({
        filters: activeAnalysis.filters,
        searchUrl: activeAnalysis.searchUrl,
      }));
      if (fetched.length < 3) throw new Error(c.refreshInvalid);
      // Refreshing Otomoto keeps any Mobile.de offers already in the analysis.
      const listings = mergeBySource(activeAnalysis.listings, fetched);
      const snapshot = activeAnalysis.historyId
        ? updateMarketSnapshot(activeAnalysis.historyId, activeAnalysis.filters, listings, "API", activeAnalysis.searchUrl)
        : createMarketSnapshot(activeAnalysis.filters, listings, "API", activeAnalysis.searchUrl);
      if (!snapshot) return;
      importedDataset = null;
      activeAnalysis = {
        ...activeAnalysis,
        listings,
        providerId: provider.id || "api",
        sourceFileName: "API",
        historyId: snapshot.id,
      };
      renderAnalysis();
      setAnalysisStatus(c.snapshotSaved);
    } catch (error) {
      setAnalysisStatus(error.message || c.refreshInvalid, true);
    }
  }

  // Mobile.de offers read by the bookmarklet on the result list.
  window.AUTOGOOD_ADD_MOBILE_LISTINGS = (rows, meta = {}) => {
    const c = copy();
    const listings = normalizeListings(rows).map((listing) => ({ ...listing, source: "mobile" }));
    if (!listings.length) return;
    const message = c.mobileAdded.replace("{count}", String(listings.length)).replace("{total}", String(meta.total || listings.length));
    if (!activeAnalysis || analysisView.hidden) {
      pendingMobile = { listings };
      setAnalysisStatus(c.mobilePending.replace("{count}", String(listings.length)));
      return;
    }
    const merged = mergeBySource(activeAnalysis.listings, listings);
    const snapshot = activeAnalysis.historyId
      ? updateMarketSnapshot(activeAnalysis.historyId, activeAnalysis.filters, merged, "mobile.de", activeAnalysis.searchUrl)
      : createMarketSnapshot(activeAnalysis.filters, merged, "mobile.de", activeAnalysis.searchUrl);
    activeAnalysis = { ...activeAnalysis, listings: merged, historyId: snapshot?.id || activeAnalysis.historyId };
    chartSources = { ...chartSources, mobile: true };
    renderAnalysis();
    setAnalysisStatus(message);
    window.focus();
  };

  // The comparison price is applied when the field is left or Enter is
  // pressed; re-drawing on every key would take the cursor out of the field.
  analysisContent.addEventListener("change", (event) => {
    const input = event.target.closest("[data-mobile-market-compare-price]");
    if (!input || !activeAnalysis) return;
    activeAnalysis.comparePrice = input.value.replace(/[^\d\s]/g, "").trim();
    renderAnalysis();
  });

  analysisContent.addEventListener("click", (event) => {
    const favorite = event.target.closest("[data-mobile-market-favorite]");
    if (favorite) {
      openFavorite(favorite.dataset.mobileMarketFavorite);
      return;
    }
    const fetchMobile = event.target.closest("[data-mobile-market-fetch-mobile]");
    if (fetchMobile && activeAnalysis) {
      // A tab this page keeps a handle on: the bookmark there answers it directly.
      window.open(buildMobileDeSearchUrl(activeAnalysis.filters), "_blank");
      setAnalysisStatus(copy().fetchMobileHint);
      return;
    }
    const bookmarklet = event.target.closest("[data-autogood-bookmarklet]");
    if (bookmarklet) {
      event.preventDefault();
      window.AUTOGOOD_BRIDGE_HINT?.();
      return;
    }
    const sourceButton = event.target.closest("[data-mobile-market-source]");
    if (sourceButton && !sourceButton.disabled) {
      const source = sourceButton.dataset.mobileMarketSource;
      const next = { ...chartSources, [source]: !chartSources[source] };
      // Hiding the last visible marketplace would leave an empty chart.
      const stillShown = MARKET_SOURCES.some((item) => next[item]
        && analysisContent.querySelector(`[data-mobile-market-source="${item}"]:not([disabled])`));
      if (stillShown) {
        chartSources = next;
        renderAnalysis();
      }
      return;
    }
    const axisButton = event.target.closest("[data-mobile-market-axis]");
    if (axisButton) {
      chartAxis = axisButton.dataset.mobileMarketAxis;
      renderAnalysis();
      return;
    }
    const sortButton = event.target.closest("[data-mobile-market-sort]");
    if (sortButton) {
      const key = sortButton.dataset.mobileMarketSort;
      tableSort = tableSort.key === key
        ? { key, direction: tableSort.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" };
      renderAnalysis();
      return;
    }
    const refreshButton = event.target.closest("[data-mobile-market-refresh]");
    if (refreshButton) {
      refreshActiveAnalysis();
      return;
    }
    const clearButton = event.target.closest("[data-mobile-market-import-clear]");
    if (!clearButton || !activeAnalysis) return;
    importedDataset = null;
    // Removing the file drops only the Mobile.de offers it brought in.
    const listings = activeAnalysis.listings.filter((listing) => listingSource(listing) === "otomoto");
    activeAnalysis = {
      ...activeAnalysis,
      listings,
      providerId: listings.length ? "otomoto" : "empty",
      sourceFileName: "",
    };
    renderAnalysis();
  });

  // A table row lights up its dot on the chart.
  const highlightMarketPoint = (key, on) => {
    analysisContent.querySelectorAll(".mobileMarketPoint.isHighlighted").forEach((point) => point.classList.remove("isHighlighted"));
    if (!on || !key) return;
    analysisContent.querySelectorAll(".mobileMarketPoint").forEach((point) => {
      if (point.dataset.marketKey === key) point.classList.add("isHighlighted");
    });
  };
  analysisContent.addEventListener("mouseover", (event) => {
    const row = event.target.closest("tr[data-market-key]");
    if (row) highlightMarketPoint(row.dataset.marketKey, true);
  });
  analysisContent.addEventListener("mouseout", (event) => {
    const row = event.target.closest("tr[data-market-key]");
    if (row && !row.contains(event.relatedTarget)) highlightMarketPoint("", false);
  });

  historySaves.forEach((button) => button.addEventListener("click", saveCurrentHistory));
  document.querySelectorAll("[data-mobile-manual-reset]").forEach((button) => button.addEventListener("click", () => {
    editingHistoryId = "";
  }));
  const manualForm = document.querySelector(".mobileManualForm");
  manualForm?.addEventListener("input", () => setTimeout(updateHistoryConfirm));
  manualForm?.addEventListener("change", () => setTimeout(updateHistoryConfirm));
  historyList.addEventListener("click", (event) => {
    const confirmButton = event.target.closest("[data-mobile-market-history-confirm]");
    if (confirmButton) {
      confirmHistoryChanges(confirmButton.dataset.mobileMarketHistoryConfirm);
      return;
    }
    const deleteButton = event.target.closest("[data-mobile-market-history-delete]");
    if (deleteButton) {
      deleteHistoryEntry(deleteButton.dataset.mobileMarketHistoryDelete);
      return;
    }
    const pinButton = event.target.closest("[data-mobile-market-history-pin]");
    if (pinButton) {
      setHistoryPinned(pinButton.dataset.mobileMarketHistoryPin, pinButton.dataset.mobileMarketHistoryPinned !== "true");
      return;
    }
    const selection = event.target.closest("[data-mobile-market-history-select]");
    if (selection) {
      event.preventDefault();
      if (editingHistoryId === selection.value) clearHistorySelection();
      else selectHistoryEntry(selection.value);
      return;
    }
    const button = event.target.closest("[data-mobile-market-history-analysis]");
    if (button) openHistoryAnalysis(button.dataset.mobileMarketHistoryAnalysis);
  });
  analysisOpens.forEach((button) => button.addEventListener("click", openAnalysis));
  analysisBack.addEventListener("click", closeAnalysis);
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.addEventListener("click", () => requestAnimationFrame(renderMarketTranslations));
  });

  // The steps under the page title jump to the link card, the vehicle
  // filters or the market analysis (the favourites when no car is chosen).
  document.querySelectorAll("[data-mobile-step]").forEach((button) => button.addEventListener("click", () => {
    const step = button.dataset.mobileStep;
    if (step === "analysis") {
      let filters = {};
      try {
        filters = readManualFields();
      } catch {
        filters = {};
      }
      if (filters.brand && filters.model) openAnalysis();
      else {
        setAnalysisStatus("");
        renderFavoritesPage();
      }
      return;
    }
    if (!analysisView.hidden) closeAnalysis();
    const target = step === "link"
      ? document.querySelector(".mobileListingLinkCard")
      : document.getElementById("mobile-filter-group-vehicle")?.closest(".mobileFilterCard");
    requestAnimationFrame(() => target?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }));

  window.AUTOGOOD_MOBILE_LOG_SEARCH = logSearchToHistory;
  // Used by the sticky panel to show how many offers the filters match.
  window.AUTOGOOD_MOBILE_OTOMOTO_COUNT = async (filters) => (await fetchOtomotoPage(buildOtomotoSearchUrl(filters), 1)).total;
  if (!window.AUTOGOOD_MOBILE_MARKET_PROVIDER) window.AUTOGOOD_MOBILE_MARKET_PROVIDER = otomotoProvider;

  fetch("./data/exchange-rates.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((rates) => {
      if (rates) window.AUTOGOOD_EXCHANGE_RATES = rates;
    })
    .catch(() => {
      // Without a rate the budget line is simply not shown.
    });

  marketHistory = loadMarketHistory();
  renderMarketTranslations();
})();
