(() => {
  const analysisOpen = document.querySelector("[data-mobile-market-analysis-open]");
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
      historyHeading: "Historia wyszukiwania",
      historyEmpty: "Nie masz jeszcze zapisanych wyszukiwań.",
      historyAnalysis: "Analiza rynku",
      historyOpenList: "Otwórz listę",
      historyEdit: "Edytuj dane",
      historyEditReady: "Dane przeniesiono do formularza. Zapisz, aby zaktualizować ten wpis.",
      historyDelete: "Usuń",
      otomotoFetching: "Pobieram oferty z otomoto.pl…",
      otomotoFetched: "Wczytano {count} z {total} ofert otomoto.pl.",
      otomotoFailed: "Nie udało się pobrać ofert z otomoto.pl.",
      otomotoLabel: "Dane: otomoto.pl",
      otomotoDescription: "Próbka aktualnych ofert otomoto.pl z całej listy wyników (ceny w PLN).",
      outliersSkipped: "Pominięto {count} ofert odstających (cena poza zakresem 1/3–3× mediany).",
      verdictHeading: "Co to znaczy",
      verdictMedian: "Połowa ofert kosztuje poniżej {median}.",
      verdictMiddle: "Środek rynku: {low} – {high} ({count} ofert).",
      verdictDeals: "Poniżej {low} jest {count} ofert — to dół rynku.",
      verdictBudget: "Twój budżet {budget} to {position} (kurs {rate}).",
      positionLow: "dół rynku",
      positionMiddle: "środek rynku",
      positionHigh: "góra rynku",
      tableHeading: "Oferty w analizie",
      tablePrice: "Cena",
      tableYear: "Rok",
      tableMileage: "Przebieg",
      tableOpen: "Otwórz",
      tableSortHint: "Kliknij nagłówek, aby posortować.",
      axisMileage: "Oś pozioma: przebieg",
      axisYear: "Oś pozioma: rok",
      historyPin: "Zapisz na stałe",
      historyPinned: "Zapisane na stałe",
      historyPinnedBadge: "Zapisane",
      historyUnpin: "Usuń z zapisanych",
      historySaveHint: "{count} / {limit} ostatnich sprawdzeń",
      historyDeleteConfirm: "Usunąć ten zapis historii?",
      historyDeleteSuccess: "Wpis został usunięty z historii.",
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
      middleMarket: "Środek rynku",
      highMarket: "Góra rynku",
      count: "Liczba ofert",
      minimum: "Minimum",
      median: "Mediana",
      middleRange: "Środek rynku",
      middleOffers: "Oferty w środku",
      maximum: "Maksimum",
      openSearch: "Otwórz wyszukiwanie mobile.de ↗",
      openOtomoto: "Otwórz listę otomoto.pl ↗",
      pointHint: "Kliknij, aby otworzyć ogłoszenie",
      directNotice: "Każda kropka to jedna oferta — kliknij, aby otworzyć ogłoszenie.",
      countries: "Kraj",
      refresh: "Odśwież dane",
      refreshing: "Odświeżam dane rynku…",
      refreshUnavailable: "Źródło danych nie jest jeszcze podłączone.",
      refreshInvalid: "Źródło nie zwróciło co najmniej 3 cen ofert.",
      snapshotSaved: "Zapisano nowy snapshot cen.",
      emptyHeading: "Brak realnych ofert do analizy",
      emptyDescription: "Zaimportuj JSON lub CSV. Wykres nie pokazuje punktów testowych ani linków do ogólnego wyszukiwania.",
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
      historyHeading: "История поиска",
      historyEmpty: "Сохранённых поисков пока нет.",
      historyAnalysis: "Анализ рынка",
      historyOpenList: "Открыть список",
      historyEdit: "Изменить данные",
      historyEditReady: "Данные перенесены в форму. Сохраните, чтобы обновить эту запись.",
      historyDelete: "Удалить",
      otomotoFetching: "Загружаю объявления с otomoto.pl…",
      otomotoFetched: "Загружено {count} из {total} объявлений otomoto.pl.",
      otomotoFailed: "Не удалось загрузить объявления с otomoto.pl.",
      otomotoLabel: "Данные: otomoto.pl",
      otomotoDescription: "Выборка актуальных объявлений otomoto.pl по всему списку (цены в PLN).",
      outliersSkipped: "Пропущено объявлений с выбивающейся ценой: {count} (вне диапазона 1/3–3× медианы).",
      verdictHeading: "Что это значит",
      verdictMedian: "Половина объявлений дешевле {median}.",
      verdictMiddle: "Середина рынка: {low} – {high} ({count} объявлений).",
      verdictDeals: "Дешевле {low} — {count} объявлений, это низ рынка.",
      verdictBudget: "Твой бюджет {budget} — это {position} (курс {rate}).",
      positionLow: "низ рынка",
      positionMiddle: "середина рынка",
      positionHigh: "верх рынка",
      tableHeading: "Объявления в анализе",
      tablePrice: "Цена",
      tableYear: "Год",
      tableMileage: "Пробег",
      tableOpen: "Открыть",
      tableSortHint: "Нажми на заголовок, чтобы отсортировать.",
      axisMileage: "Горизонтальная ось: пробег",
      axisYear: "Горизонтальная ось: год",
      historyPin: "Сохранить навсегда",
      historyPinned: "Сохранено навсегда",
      historyPinnedBadge: "Сохранено",
      historyUnpin: "Убрать из сохранённых",
      historySaveHint: "{count} / {limit} последних проверок",
      historyDeleteConfirm: "Удалить эту запись из истории?",
      historyDeleteSuccess: "Запись удалена из истории.",
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
      middleMarket: "Середина рынка",
      highMarket: "Верх рынка",
      count: "Объявлений",
      minimum: "Минимум",
      median: "Медиана",
      middleRange: "Середина рынка",
      middleOffers: "В середине рынка",
      maximum: "Максимум",
      openSearch: "Открыть поиск mobile.de ↗",
      openOtomoto: "Открыть список otomoto.pl ↗",
      pointHint: "Нажми, чтобы открыть объявление",
      directNotice: "Каждая точка — одно объявление, нажми, чтобы открыть его.",
      countries: "Страна",
      refresh: "Обновить данные",
      refreshing: "Обновляю рыночные данные…",
      refreshUnavailable: "Источник данных ещё не подключён.",
      refreshInvalid: "Источник не вернул минимум 3 цен объявлений.",
      snapshotSaved: "Новый снимок цен сохранён.",
      emptyHeading: "Нет реальных объявлений для анализа",
      emptyDescription: "Импортируйте JSON или CSV либо подключите источник данных для текущих фильтров.",
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

  // Otomoto blocks cross-origin reads, so its result pages come through a
  // reader proxy. Point AUTOGOOD_MARKET_PROXY at your own one to replace it.
  const MARKET_PROXY = () => window.AUTOGOOD_MARKET_PROXY || "https://r.jina.ai/";
  const OTOMOTO_PAGES = 4;

  let activeAnalysis = null;
  let otomotoTotal = 0;
  let tableSort = { key: "price", direction: "asc" };

  // Damaged cars, parts and lease instalments are listed at a fraction of the
  // real price; anything outside a third of the median to three times it is
  // left out of the statistics.
  function splitMarketOutliers(listings) {
    const prices = listings.map((listing) => listing.price).sort((left, right) => left - right);
    if (prices.length < 5) return { kept: listings, skipped: [] };
    const median = percentile(prices, 0.5);
    const kept = listings.filter((listing) => listing.price >= median / 3 && listing.price <= median * 3);
    return kept.length >= 3
      ? { kept, skipped: listings.filter((listing) => !kept.includes(listing)) }
      : { kept: listings, skipped: [] };
  }

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
    return {
      id,
      title: title || `mobile.de · ${String(index + 1).padStart(2, "0")}`,
      price: Math.round(price),
      currency: String(listingValue(row, ["currency", "waluta"]) || "EUR").toUpperCase() === "PLN" ? "PLN" : "EUR",
      year: yearMatch ? Number(yearMatch[0]) : null,
      mileage: mileage === null ? null : Math.round(mileage),
      url: url.toString(),
    };
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
        price,
        currency: String(amount.currencyCode || "PLN"),
        mileage: parameters.mileage || "",
        year: parameters.year || "",
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
    const wanted = [Math.round(pageCount * 0.33), Math.round(pageCount * 0.66), pageCount];
    return [...new Set(wanted)].filter((page) => page > 1).slice(0, OTOMOTO_PAGES - 1);
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

    onProgress?.(1, OTOMOTO_PAGES);
    const first = await fetchOtomotoPage(searchUrl, 1);
    collect(first.listings);
    const pages = otomotoSamplePages(first.total, first.listings.length || 32);
    for (const [index, page] of pages.entries()) {
      onProgress?.(index + 2, pages.length + 1);
      try {
        collect((await fetchOtomotoPage(searchUrl, page)).listings);
      } catch {
        // One unreachable page still leaves a usable sample.
      }
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
    if (!storeMarketHistory([entry, ...marketHistory])) return null;
    renderHistory();
    return entry;
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
    updatedHistory[index] = entry;
    if (!storeMarketHistory(updatedHistory)) return null;
    renderHistory();
    return entry;
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
    try {
      return buildMobileDeSearchUrl(entry.filters);
    } catch {
      return entry.searchUrl;
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
      const searchUrl = historySearchUrl(entry);
      const status = ready
        ? c.historyReady.replace("{count}", String(entry.listings.length))
        : c.historyWaiting;
      return `
        <article class="mobileMarketHistoryItem${ready ? " isReady" : ""}${entry.pinned ? " isPinned" : ""}">
          <div class="mobileMarketHistoryMain">
            <div class="mobileMarketHistoryTitleRow">
              <strong>${entry.pinned ? '<i class="mobileMarketHistoryPinMark" aria-hidden="true">★</i>' : ""}${escapeMarketHtml(title)}</strong>
              <time datetime="${escapeMarketHtml(entry.updatedAt)}">${escapeMarketHtml(formatHistoryDate(entry.updatedAt))}</time>
            </div>
            ${meta.length ? `<div class="mobileMarketHistoryMeta">${meta.map((item) => `<span>${escapeMarketHtml(item)}</span>`).join("")}</div>` : ""}
            <span class="mobileMarketHistoryStatus">${escapeMarketHtml(status)}</span>
          </div>
          <div class="mobileMarketHistoryActions">
            <button type="button" data-mobile-market-history-analysis="${escapeMarketHtml(entry.id)}">${escapeMarketHtml(c.historyAnalysis)} <i aria-hidden="true">→</i></button>
            ${searchUrl ? `<a href="${escapeMarketHtml(searchUrl)}" target="_blank" rel="noopener">${escapeMarketHtml(c.historyOpenList)} <i aria-hidden="true">↗</i></a>` : ""}
            <button type="button" data-mobile-market-history-edit="${escapeMarketHtml(entry.id)}">${escapeMarketHtml(c.historyEdit)}</button>
            <button class="${entry.pinned ? "isPinned" : ""}" type="button" data-mobile-market-history-pin="${escapeMarketHtml(entry.id)}" data-mobile-market-history-pinned="${entry.pinned ? "true" : "false"}">${escapeMarketHtml(entry.pinned ? c.historyUnpin : c.historyPin)}</button>
            <button class="isDelete mobileMarketHistoryIconButton" type="button" data-mobile-market-history-delete="${escapeMarketHtml(entry.id)}" aria-label="${escapeMarketHtml(c.historyDelete)}" title="${escapeMarketHtml(c.historyDelete)}">×</button>
          </div>
        </article>`;
    }).join("");
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

  // Called when the user opens a Mobile.de search: log it, or refresh the
  // timestamp of the same search so it moves back to the top of the list.
  function logSearchToHistory() {
    let filters;
    try {
      filters = readManualFields();
    } catch {
      return;
    }
    if (!filters.brand || !filters.model) return;
    const existing = historyEntryForFilters(filters);
    let searchUrl = "";
    try {
      searchUrl = buildMobileDeSearchUrl(filters);
    } catch {
      return;
    }
    if (existing) updateMarketSnapshot(existing.id, filters, existing.listings, existing.sourceFileName, searchUrl);
    else createMarketSnapshot(filters, [], "", searchUrl);
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
    const c = copy();
    const entry = marketHistory.find((item) => item.id === historyId);
    if (!entry || !window.confirm(c.historyDeleteConfirm)) return;
    if (!storeMarketHistory(marketHistory.filter((item) => item.id !== historyId))) return;
    if (activeAnalysis?.historyId === historyId) activeAnalysis.historyId = "";
    if (editingHistoryId === historyId) editingHistoryId = "";
    renderHistory();
    setAnalysisStatus(c.historyDeleteSuccess);
  }

  function editHistoryEntry(historyId) {
    const entry = marketHistory.find((item) => item.id === historyId);
    if (!entry) return;
    restoreManualFilters(entry.filters);
    editingHistoryId = entry.id;
    analysisView.hidden = true;
    setManualViewHidden(false);
    setAnalysisStatus(copy().historyEditReady);
    manualView.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector("[data-mobile-brand]")?.focus({ preventScroll: true });
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

  function percentile(sortedValues, percentileValue) {
    if (!sortedValues.length) return 0;
    const index = (sortedValues.length - 1) * percentileValue;
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const weight = index - lowerIndex;
    return sortedValues[lowerIndex] + ((sortedValues[upperIndex] - sortedValues[lowerIndex]) * weight);
  }

  // About seven price lines, whatever the price range is: 1/2/5 × 10^n.
  function marketPriceStep(range) {
    const rough = Math.max(1, range) / 7;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const normalized = rough / magnitude;
    const factor = normalized > 5 ? 10 : normalized > 2 ? 5 : normalized > 1 ? 2 : 1;
    return factor * magnitude;
  }

  function marketStatistics(listings) {
    const prices = listings.map((listing) => listing.price).sort((left, right) => left - right);
    const lowEnd = percentile(prices, 1 / 3);
    const highStart = percentile(prices, 2 / 3);
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
      step: marketPriceStep(prices[prices.length - 1] - prices[0]),
    };
  }

  function activeCurrency() {
    return activeAnalysis?.listings?.[0]?.currency === "PLN" ? "PLN" : "EUR";
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

  function marketClass(price, statistics) {
    if (price < statistics.middleLow) return "isLow";
    if (price > statistics.middleHigh) return "isHigh";
    return "isMiddle";
  }

  function statHtml(label, value, modifier = "") {
    return `<div class="mobileMarketStat${modifier ? ` ${modifier}` : ""}"><dt>${escapeMarketHtml(label)}</dt><dd>${escapeMarketHtml(value)}</dd></div>`;
  }

  function renderAnalysis() {
    if (!activeAnalysis) return;
    const c = copy();
    const { filters, listings, searchUrl, providerId, sourceFileName } = activeAnalysis;
    let otomotoUrl = "";
    try {
      otomotoUrl = buildOtomotoSearchUrl(filters);
    } catch {
      // Otomoto has no twin for this vehicle; its link is simply left out.
    }
    const stored = providerId === "import" || providerId === "history";
    const { kept: marketListings, skipped: outliers } = splitMarketOutliers(listings);
    const hasListings = marketListings.length >= 3;
    const summary = filterSummary(filters);
    let marketContent = `
      <section class="mobileMarketEmpty">
        <strong>${escapeMarketHtml(c.emptyHeading)}</strong>
        <p>${escapeMarketHtml(c.emptyDescription)}</p>
      </section>`;

    if (hasListings) {
      const statistics = marketStatistics(marketListings);
      const domainMinimum = statistics.min;
      const domainMaximum = statistics.max;
      const middleHighPosition = verticalMarketPosition(statistics.middleHigh, domainMinimum, domainMaximum);
      const middleLowPosition = verticalMarketPosition(statistics.middleLow, domainMinimum, domainMaximum);
      const medianPosition = verticalMarketPosition(statistics.median, domainMinimum, domainMaximum);
      const scaleTicks = marketScaleTicks(domainMinimum, domainMaximum, statistics.step);
      // Horizontal position carries mileage (or the year), so no two offers
      // sit on top of each other and the spread itself is readable.
      const axisValues = marketListings.map((listing) => listing.mileage).filter((value) => Number.isFinite(value) && value > 0);
      const axisByMileage = axisValues.length >= Math.max(3, marketListings.length / 2);
      const yearValues = marketListings.map((listing) => listing.year).filter((value) => Number.isFinite(value) && value > 0);
      const axisSource = axisByMileage ? axisValues : yearValues;
      const axisMin = axisSource.length ? Math.min(...axisSource) : 0;
      const axisMax = axisSource.length ? Math.max(...axisSource) : 0;
      const axisSpan = axisMax - axisMin;
      const axisValueOf = (listing) => (axisByMileage ? listing.mileage : listing.year);
      const horizontalPosition = (listing) => {
        const value = axisValueOf(listing);
        if (!axisSource.length || !axisSpan || !Number.isFinite(value)) {
          return 24 + ((seededNumber(`${listing.id}|${listing.price}`) % 6800) / 100);
        }
        return 24 + (((value - axisMin) / axisSpan) * 68);
      };
      const axisTicks = axisSource.length && axisSpan
        ? [axisMin, axisMin + axisSpan / 2, axisMax].map((value) => (axisByMileage
          ? `${new Intl.NumberFormat(currentLanguage() === "ru" ? "ru-RU" : "pl-PL").format(Math.round(value))} km`
          : String(Math.round(value))))
        : [];
      const rate = exchangeRate();
      const budgetEur = Number(String(filters.priceTo || filters.priceFrom || "").replace(/[^\d]/g, ""));
      const budget = rate && budgetEur && activeCurrency() === "PLN" ? budgetEur * rate : 0;
      const budgetVerdict = budget
        ? c.verdictBudget
          .replace("{budget}", `${formatMarketPrice(budget)}`)
          .replace("{position}", budget < statistics.middleLow ? c.positionLow : budget > statistics.middleHigh ? c.positionHigh : c.positionMiddle)
          .replace("{rate}", `1 € = ${rate.toFixed(2)} zł`)
        : "";
      const sortedListings = [...marketListings].sort((left, right) => {
        const factor = tableSort.direction === "asc" ? 1 : -1;
        return ((Number(left[tableSort.key]) || 0) - (Number(right[tableSort.key]) || 0)) * factor;
      });
      const points = [...marketListings]
        .sort((left, right) => right.price - left.price)
        .map((listing) => {
          const top = verticalMarketPosition(listing.price, domainMinimum, domainMaximum);
          const left = horizontalPosition(listing);
          const pointClass = marketClass(listing.price, statistics);
          const tooltipClass = left > 72 ? " isTooltipLeft" : "";
          const details = [
            Number.isFinite(listing.year) && listing.year ? String(listing.year) : "",
            Number.isFinite(listing.mileage) && listing.mileage
              ? `${new Intl.NumberFormat(currentLanguage() === "ru" ? "ru-RU" : "pl-PL").format(listing.mileage)} km`
              : "",
          ].filter(Boolean).join(" · ");
          const label = `${formatMarketPrice(listing.price)}${details ? `, ${details}` : ""}. ${c.pointHint}`;
          const tooltip = `
              <span class="mobileMarketPointTooltip" aria-hidden="true">
                <strong>${escapeMarketHtml(formatMarketPrice(listing.price))}</strong>
                ${details ? `<em>${escapeMarketHtml(details)}</em>` : ""}
              </span>`;
          return listing.url
            ? `<a class="mobileMarketPoint ${pointClass}${tooltipClass}" href="${escapeMarketHtml(listing.url)}" target="_blank" rel="noopener" aria-label="${escapeMarketHtml(label)}" style="left:${left}%;top:${top}%">${tooltip}</a>`
            : `<span class="mobileMarketPoint ${pointClass}${tooltipClass}" role="img" aria-label="${escapeMarketHtml(label)}" style="left:${left}%;top:${top}%">${tooltip}</span>`;
        })
        .join("");

      marketContent = `
        <dl class="mobileMarketStats">
          ${statHtml(c.count, String(statistics.count))}
          ${statHtml(c.minimum, formatMarketPrice(statistics.min))}
          ${statHtml(c.median, formatMarketPrice(statistics.median))}
          ${statHtml(c.middleRange, `${formatMarketPrice(statistics.middleLow)} – ${formatMarketPrice(statistics.middleHigh)}`, "isRange")}
          ${statHtml(c.middleOffers, String(statistics.middleCount))}
          ${statHtml(c.maximum, formatMarketPrice(statistics.max))}
        </dl>

        <div class="mobileMarketChartHead">
          <h2>${escapeMarketHtml(c.chartTitle)}</h2>
          <div class="mobileMarketLegend" aria-label="${escapeMarketHtml(c.chartTitle)}">
            <span class="isLow"><i></i>${escapeMarketHtml(c.lowMarket)} · ${statistics.lowCount}</span>
            <span class="isMiddle"><i></i>${escapeMarketHtml(c.middleMarket)} · ${statistics.middleCount}</span>
            <span class="isHigh"><i></i>${escapeMarketHtml(c.highMarket)} · ${statistics.highCount}</span>
          </div>
        </div>

        <div
          class="mobileMarketScale"
          role="group"
          aria-label="${escapeMarketHtml(c.chartTitle)}"
          data-currency="${escapeMarketHtml(activeCurrency())}"
          style="--market-high-end:${middleHighPosition}%;--market-middle-end:${middleLowPosition}%"
        >
          <div class="mobileMarketAxis"></div>
          <div class="mobileMarketBoundary" style="top:${middleHighPosition}%"></div>
          <div class="mobileMarketMedian" style="top:${medianPosition}%"></div>
          <div class="mobileMarketBoundary" style="top:${middleLowPosition}%"></div>
          ${scaleTicks.map((price) => {
            const position = verticalMarketPosition(price, domainMinimum, domainMaximum);
            return `<div class="mobileMarketGridLine" style="top:${position}%"></div><span class="mobileMarketTick isGrid" style="top:${position}%">${escapeMarketHtml(formatMarketPrice(price))}</span>`;
          }).join("")}
          ${points}
          <span class="mobileMarketTick isLimit" style="top:5%">${escapeMarketHtml(formatMarketPrice(domainMaximum))}</span>
          <span class="mobileMarketTick isLimit" style="top:95%">${escapeMarketHtml(formatMarketPrice(domainMinimum))}</span>
        </div>
        ${axisTicks.length ? `
        <div class="mobileMarketAxisFooter">
          <span>${escapeMarketHtml(axisByMileage ? c.axisMileage : c.axisYear)}</span>
          <span class="mobileMarketAxisTicks">${axisTicks.map((tick) => `<em>${escapeMarketHtml(tick)}</em>`).join("")}</span>
        </div>` : ""}

        <section class="mobileMarketVerdict" aria-label="${escapeMarketHtml(c.verdictHeading)}">
          <strong>${escapeMarketHtml(c.verdictHeading)}</strong>
          <ul>
            <li>${escapeMarketHtml(c.verdictMedian.replace("{median}", formatMarketPrice(statistics.median)))}</li>
            <li>${escapeMarketHtml(c.verdictMiddle
              .replace("{low}", formatMarketPrice(statistics.middleLow))
              .replace("{high}", formatMarketPrice(statistics.middleHigh))
              .replace("{count}", String(statistics.middleCount)))}</li>
            <li>${escapeMarketHtml(c.verdictDeals
              .replace("{low}", formatMarketPrice(statistics.middleLow))
              .replace("{count}", String(statistics.lowCount)))}</li>
            ${budgetVerdict ? `<li>${escapeMarketHtml(budgetVerdict)}</li>` : ""}
            ${outliers.length ? `<li>${escapeMarketHtml(c.outliersSkipped.replace("{count}", String(outliers.length)))}</li>` : ""}
          </ul>
        </section>

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
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                ${sortedListings.map((listing) => `
                  <tr class="${marketClass(listing.price, statistics)}">
                    <td>${escapeMarketHtml(formatMarketPrice(listing.price))}</td>
                    <td>${escapeMarketHtml(listing.year ? String(listing.year) : "—")}</td>
                    <td>${escapeMarketHtml(listing.mileage ? `${numberFormat().format(listing.mileage)} km` : "—")}</td>
                    <td>${listing.url ? `<a href="${escapeMarketHtml(listing.url)}" target="_blank" rel="noopener">${escapeMarketHtml(c.tableOpen)} ↗</a>` : ""}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </section>

        <footer class="mobileMarketNotice">
          <p>${escapeMarketHtml(c.directNotice)}</p>
          <a class="mobileMarketSearchLink" href="${escapeMarketHtml(searchUrl)}" target="_blank" rel="noopener">${escapeMarketHtml(c.openSearch)}</a>
          ${otomotoUrl ? `<a class="mobileMarketSearchLink" href="${escapeMarketHtml(otomotoUrl)}" target="_blank" rel="noopener">${escapeMarketHtml(c.openOtomoto)}</a>` : ""}
        </footer>`;
    }

    analysisContent.innerHTML = `
      <article class="mobileMarketAnalysisPanel">
        <header class="mobileMarketAnalysisHead">
          <div>
            <h1>${escapeMarketHtml(c.heading)}</h1>
            <p>${escapeMarketHtml(hasListings ? (providerId === "otomoto" ? c.otomotoDescription : c.importedDescription) : c.waitingDescription)}</p>
            <div class="mobileMarketFilterSummary">
              ${summary.map((item) => `<span>${escapeMarketHtml(item)}</span>`).join("")}
            </div>
          </div>
          <span class="mobileMarketTestLabel${hasListings ? " isImported" : ""}">${escapeMarketHtml(hasListings ? (providerId === "otomoto" ? c.otomotoLabel : c.importedLabel) : c.waitingLabel)}</span>
        </header>

        <section class="mobileMarketImport" aria-label="${escapeMarketHtml(c.importHeading)}">
          <div class="mobileMarketImportCopy">
            <strong>${escapeMarketHtml(c.importHeading)}</strong>
            <span>${escapeMarketHtml(c.importDescription)}</span>
            ${stored ? `<small>${escapeMarketHtml(c.importedFile.replace("{count}", String(listings.length)).replace("{file}", sourceFileName || "—"))}</small>` : ""}
          </div>
          <div class="mobileMarketImportActions">
            <label class="mobileMarketImportButton">
              <input type="file" accept=".json,.csv,application/json,text/csv" data-mobile-market-file />
              <span>${escapeMarketHtml(c.importButton)}</span>
            </label>
            <button class="mobileMarketImportClear" type="button" data-mobile-market-refresh>${escapeMarketHtml(c.refresh)}</button>
            ${stored ? `<button class="mobileMarketImportClear" type="button" data-mobile-market-import-clear>${escapeMarketHtml(c.clearImport)}</button>` : ""}
          </div>
        </section>

        ${marketContent}
      </article>`;
  }

  function setAnalysisStatus(message, isError = false) {
    if (typeof setMarketSearchStatus === "function") setMarketSearchStatus(message, isError);
  }

  async function openAnalysis() {
    const c = copy();
    try {
      const filters = readManualFields();
      if (!filters.brand || !filters.model) throw new Error(c.missingVehicle);
      const searchUrl = buildMobileDeSearchUrl(filters);
      const vehicleKey = vehicleDataKey(filters);
      if (importedDataset?.filterKey !== vehicleKey) importedDataset = null;
      const savedEntry = historyEntryForFilters(filters);
      const savedListings = savedEntry?.listings?.length >= 3 ? savedEntry.listings : null;
      setAnalysisStatus(c.preparing);
      analysisOpen.disabled = true;
      const provider = importedDataset || savedListings ? null : window.AUTOGOOD_MOBILE_MARKET_PROVIDER;
      const rawListings = importedDataset?.listings || savedListings || (provider ? await provider.getListings({ filters, searchUrl }) : []);
      const normalizedListings = normalizeListings(rawListings);
      const listings = normalizedListings;
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
      };
      renderAnalysis();
      setManualViewHidden(true);
      analysisView.hidden = false;
      setAnalysisStatus("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setAnalysisStatus(error.message || c.invalidData, true);
    } finally {
      analysisOpen.disabled = false;
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
      const listings = await parseListingFile(input.files[0]);
      if (listings.length < 3) throw new Error(c.importInvalid);
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
      const snapshot = createMarketSnapshot(activeAnalysis.filters, listings, input.files[0].name, activeAnalysis.searchUrl);
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
      const listings = normalizeListings(await provider.getListings({
        filters: activeAnalysis.filters,
        searchUrl: activeAnalysis.searchUrl,
      }));
      if (listings.length < 3) throw new Error(c.refreshInvalid);
      const snapshot = createMarketSnapshot(activeAnalysis.filters, listings, "API", activeAnalysis.searchUrl);
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

  analysisContent.addEventListener("click", (event) => {
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
    activeAnalysis = {
      ...activeAnalysis,
      listings: [],
      providerId: "empty",
      sourceFileName: "",
    };
    renderAnalysis();
  });

  historySaves.forEach((button) => button.addEventListener("click", saveCurrentHistory));
  document.querySelectorAll("[data-mobile-manual-reset]").forEach((button) => button.addEventListener("click", () => {
    editingHistoryId = "";
  }));
  historyList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-mobile-market-history-delete]");
    if (deleteButton) {
      deleteHistoryEntry(deleteButton.dataset.mobileMarketHistoryDelete);
      return;
    }
    const editButton = event.target.closest("[data-mobile-market-history-edit]");
    if (editButton) {
      editHistoryEntry(editButton.dataset.mobileMarketHistoryEdit);
      return;
    }
    const pinButton = event.target.closest("[data-mobile-market-history-pin]");
    if (pinButton) {
      setHistoryPinned(pinButton.dataset.mobileMarketHistoryPin, pinButton.dataset.mobileMarketHistoryPinned !== "true");
      return;
    }
    const button = event.target.closest("[data-mobile-market-history-analysis]");
    if (button) openHistoryAnalysis(button.dataset.mobileMarketHistoryAnalysis);
  });
  analysisOpen.addEventListener("click", openAnalysis);
  analysisBack.addEventListener("click", closeAnalysis);
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.addEventListener("click", () => requestAnimationFrame(renderMarketTranslations));
  });

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
