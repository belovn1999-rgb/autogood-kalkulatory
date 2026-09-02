(() => {
  const analysisOpen = document.querySelector("[data-mobile-market-analysis-open]");
  const analysisBack = document.querySelector("[data-mobile-market-analysis-back]");
  const analysisView = document.querySelector("[data-mobile-market-analysis-view]");
  const analysisContent = document.querySelector("[data-mobile-market-analysis-content]");
  const manualView = document.querySelector('[data-mobile-method-view="manual"]');
  const historySaves = Array.from(document.querySelectorAll("[data-mobile-market-history-save]"));
  const historyList = document.querySelector("[data-mobile-market-history-list]");
  const historyCount = document.querySelector("[data-mobile-market-history-count]");

  if (!analysisOpen || !analysisBack || !analysisView || !analysisContent || !manualView || !historySaves.length || !historyList || !historyCount) return;

  const marketCopy = {
    pl: {
      analysisButton: "Analiza rynku",
      saveButton: "Zapisz dane",
      saveSuccess: "Dane zapisane w historii.",
      historyHeading: "Historia wyszukiwania",
      historyEmpty: "Nie masz jeszcze zapisanych wyszukiwań.",
      historyAnalysis: "Analiza rynku",
      historyOpenList: "Otwórz listę",
      historyDelete: "Usuń",
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
      importHeading: "Wczytaj realne oferty",
      importDescription: "JSON lub CSV: wymagane jest price w EUR. Plik pozostaje tylko w tej przeglądarce.",
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
      pointHint: "Punkt pokazuje cenę jednej oferty",
      directNotice: "Każda kropka pokazuje cenę jednej oferty. Punkty nie prowadzą do ogłoszeń.",
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
      year: "Rok",
      displacement: "Pojemność",
      power: "Moc",
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
      historyHeading: "История поиска",
      historyEmpty: "Сохранённых поисков пока нет.",
      historyAnalysis: "Анализ рынка",
      historyOpenList: "Открыть список",
      historyDelete: "Удалить",
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
      pointHint: "Точка показывает цену одного объявления",
      directNotice: "Каждая точка показывает цену одного объявления. Точки не ведут на объявления.",
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
      year: "Год",
      displacement: "Объём",
      power: "Мощность",
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
  const HISTORY_LIMIT = 15;

  let activeAnalysis = null;
  let importedDataset = null;
  let marketHistory = [];

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
      if (/^https?:$/.test(parsedUrl.protocol) && isDirectMobileListingUrl(parsedUrl)) url = parsedUrl.toString();
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
      currency: "EUR",
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
          createdAt: String(entry.createdAt || entry.updatedAt || new Date().toISOString()),
          updatedAt: String(entry.updatedAt || entry.createdAt || new Date().toISOString()),
        }))
        .slice(0, HISTORY_LIMIT);
    } catch {
      return [];
    }
  }

  function storeMarketHistory(entries) {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
      marketHistory = entries.slice(0, HISTORY_LIMIT);
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

  function createMarketSnapshot(filters, listings, sourceFileName = "", searchUrl = "") {
    const now = new Date().toISOString();
    const entry = {
      id: `${Date.now()}-${seededNumber(`${filterSignature(filters)}|${now}`).toString(16)}`,
      filters,
      signature: filterSignature(filters),
      listings: normalizeListings(listings),
      sourceFileName,
      searchUrl: searchUrl || buildMobileDeSearchUrl(filters),
      createdAt: now,
      updatedAt: now,
    };
    if (!storeMarketHistory([entry, ...marketHistory])) return null;
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
    historyCount.textContent = `${marketHistory.length} / ${HISTORY_LIMIT}`;
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
        <article class="mobileMarketHistoryItem${ready ? " isReady" : ""}">
          <div class="mobileMarketHistoryMain">
            <div class="mobileMarketHistoryTitleRow">
              <strong>${escapeMarketHtml(title)}</strong>
              <time datetime="${escapeMarketHtml(entry.updatedAt)}">${escapeMarketHtml(formatHistoryDate(entry.updatedAt))}</time>
            </div>
            ${meta.length ? `<div class="mobileMarketHistoryMeta">${meta.map((item) => `<span>${escapeMarketHtml(item)}</span>`).join("")}</div>` : ""}
            <span class="mobileMarketHistoryStatus">${escapeMarketHtml(status)}</span>
          </div>
          <div class="mobileMarketHistoryActions">
            <button type="button" data-mobile-market-history-analysis="${escapeMarketHtml(entry.id)}">${escapeMarketHtml(c.historyAnalysis)} <i aria-hidden="true">→</i></button>
            ${searchUrl ? `<a href="${escapeMarketHtml(searchUrl)}" target="_blank" rel="noopener">${escapeMarketHtml(c.historyOpenList)} <i aria-hidden="true">↗</i></a>` : ""}
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
      mileageFrom: "[data-mobile-mileage-from]",
      mileageTo: "[data-mobile-mileage-to]",
      yearFrom: "[data-mobile-year-from]",
      yearTo: "[data-mobile-year-to]",
      displacementFrom: "[data-mobile-displacement-from]",
      displacementTo: "[data-mobile-displacement-to]",
      powerFrom: "[data-mobile-power-from]",
      powerTo: "[data-mobile-power-to]",
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
    };
    Object.entries(booleanSelectors).forEach(([key, selector]) => {
      const input = document.querySelector(selector);
      if (input) input.checked = Boolean(filters[key]);
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
      const existing = historyEntryForFilters(filters);
      const snapshot = createMarketSnapshot(
        filters,
        matchingImport?.listings || existing?.listings || [],
        matchingImport?.fileName || existing?.sourceFileName || "",
        searchUrl,
      );
      if (snapshot) setAnalysisStatus(c.saveSuccess);
    } catch (error) {
      setAnalysisStatus(error.message || c.missingVehicle, true);
    }
  }

  function deleteHistoryEntry(historyId) {
    const c = copy();
    const entry = marketHistory.find((item) => item.id === historyId);
    if (!entry || !window.confirm(c.historyDeleteConfirm)) return;
    if (!storeMarketHistory(marketHistory.filter((item) => item.id !== historyId))) return;
    if (activeAnalysis?.historyId === historyId) activeAnalysis.historyId = "";
    renderHistory();
    setAnalysisStatus(c.historyDeleteSuccess);
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
    manualView.hidden = true;
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
      "[data-mobile-body]": "[data-mobile-body-label]",
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
    const body = selectedOptionText("[data-mobile-body]");
    if (body) summary.push(body);
    summary.push(rangeSummary(c.year, filters.yearFrom, filters.yearTo));
    summary.push(rangeSummary(c.mileage, filters.mileageFrom, filters.mileageTo, "km"));
    summary.push(rangeSummary(c.displacement, filters.displacementFrom, filters.displacementTo, "ccm"));
    summary.push(rangeSummary(c.power, filters.powerFrom, filters.powerTo, "KM"));
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

  function marketPriceStep(referencePrice) {
    return 1000;
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
      step: marketPriceStep(percentile(prices, 0.5)),
    };
  }

  function formatMarketPrice(value) {
    return new Intl.NumberFormat(currentLanguage() === "ru" ? "ru-RU" : "pl-PL", {
      style: "currency",
      currency: "EUR",
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
    const stored = providerId === "import" || providerId === "history";
    const hasListings = listings.length >= 3;
    const summary = filterSummary(filters);
    let marketContent = `
      <section class="mobileMarketEmpty">
        <strong>${escapeMarketHtml(c.emptyHeading)}</strong>
        <p>${escapeMarketHtml(c.emptyDescription)}</p>
      </section>`;

    if (hasListings) {
      const statistics = marketStatistics(listings);
      const domainMinimum = statistics.min;
      const domainMaximum = statistics.max;
      const middleHighPosition = verticalMarketPosition(statistics.middleHigh, domainMinimum, domainMaximum);
      const middleLowPosition = verticalMarketPosition(statistics.middleLow, domainMinimum, domainMaximum);
      const medianPosition = verticalMarketPosition(statistics.median, domainMinimum, domainMaximum);
      const scaleTicks = marketScaleTicks(domainMinimum, domainMaximum, statistics.step);
      const points = [...listings]
        .sort((left, right) => right.price - left.price)
        .map((listing) => {
          const top = verticalMarketPosition(listing.price, domainMinimum, domainMaximum);
          const left = 24 + ((seededNumber(`${listing.id}|${listing.price}`) % 6800) / 100);
          const pointClass = marketClass(listing.price, statistics);
          const tooltipClass = left > 72 ? " isTooltipLeft" : "";
          const label = `${formatMarketPrice(listing.price)}. ${c.pointHint}`;
          const tooltip = `
              <span class="mobileMarketPointTooltip" aria-hidden="true">
                <strong>${escapeMarketHtml(formatMarketPrice(listing.price))}</strong>
              </span>`;
          return `<span class="mobileMarketPoint ${pointClass}${tooltipClass}" role="img" aria-label="${escapeMarketHtml(label)}" style="left:${left}%;top:${top}%">${tooltip}</span>`;
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

        <footer class="mobileMarketNotice">
          <p>${escapeMarketHtml(c.directNotice)}</p>
          <a class="mobileMarketSearchLink" href="${escapeMarketHtml(searchUrl)}" target="_blank" rel="noopener">${escapeMarketHtml(c.openSearch)}</a>
        </footer>`;
    }

    analysisContent.innerHTML = `
      <article class="mobileMarketAnalysisPanel">
        <header class="mobileMarketAnalysisHead">
          <div>
            <h1>${escapeMarketHtml(c.heading)}</h1>
            <p>${escapeMarketHtml(hasListings ? c.importedDescription : c.waitingDescription)}</p>
            <div class="mobileMarketFilterSummary">
              ${summary.map((item) => `<span>${escapeMarketHtml(item)}</span>`).join("")}
            </div>
          </div>
          <span class="mobileMarketTestLabel${hasListings ? " isImported" : ""}">${escapeMarketHtml(hasListings ? c.importedLabel : c.waitingLabel)}</span>
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
      activeAnalysis = {
        filters,
        listings,
        searchUrl,
        providerId: importedDataset ? "import" : (savedListings ? "history" : (provider?.id || "empty")),
        sourceFileName: importedDataset?.fileName || savedEntry?.sourceFileName || "",
        historyId: savedEntry?.id || "",
      };
      renderAnalysis();
      manualView.hidden = true;
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
    manualView.hidden = false;
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
  historyList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-mobile-market-history-delete]");
    if (deleteButton) {
      deleteHistoryEntry(deleteButton.dataset.mobileMarketHistoryDelete);
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

  marketHistory = loadMarketHistory();
  renderMarketTranslations();
})();
