(() => {
  const analysisOpen = document.querySelector("[data-mobile-market-analysis-open]");
  const analysisBack = document.querySelector("[data-mobile-market-analysis-back]");
  const analysisView = document.querySelector("[data-mobile-market-analysis-view]");
  const analysisContent = document.querySelector("[data-mobile-market-analysis-content]");
  const manualView = document.querySelector('[data-mobile-method-view="manual"]');

  if (!analysisOpen || !analysisBack || !analysisView || !analysisContent || !manualView) return;

  const marketCopy = {
    pl: {
      analysisButton: "Analiza rynku",
      backToFilters: "← Wróć do filtrów",
      heading: "Analiza rynku",
      testLabel: "Dane testowe",
      testDescription: "Podgląd działania wykresu przed podłączeniem oficjalnego źródła danych.",
      importedLabel: "Dane importowane",
      importedDescription: "Wykres przygotowany z wczytanych ofert i ich bezpośrednich linków.",
      importHeading: "Wczytaj realne oferty",
      importDescription: "JSON lub CSV: wymagane kolumny price i url; title, year oraz mileage są opcjonalne. Plik pozostaje tylko w tej przeglądarce.",
      importButton: "Importuj JSON / CSV",
      clearImport: "Wróć do danych testowych",
      importedFile: "Wczytano {count} ofert z pliku {file}.",
      importInvalid: "Plik musi zawierać co najmniej 3 poprawne oferty z ceną i linkiem.",
      importReadError: "Nie udało się odczytać pliku JSON / CSV.",
      chartTitle: "Rozkład cen ofert",
      lowMarket: "Dół rynku",
      middleMarket: "Środek rynku",
      highMarket: "Góra rynku",
      count: "Liczba ofert",
      minimum: "Minimum",
      p25: "P25",
      median: "Mediana",
      average: "Średnia",
      p75: "P75",
      maximum: "Maksimum",
      openSearch: "Otwórz wyszukiwanie mobile.de ↗",
      pointHint: "Kliknij, aby otworzyć wyszukiwanie",
      mockNotice: "To dane testowe. Punkty sprawdzają interakcję i obecnie otwierają wspólne wyszukiwanie mobile.de. Po podłączeniu API każdy punkt otrzyma link do konkretnego ogłoszenia.",
      missingVehicle: "Wybierz markę i model przed uruchomieniem analizy rynku.",
      invalidData: "Nie udało się przygotować testowych danych rynku.",
      preparing: "Przygotowuję testową analizę rynku…",
      mileage: "Przebieg",
      year: "Rok",
      displacement: "Pojemność",
      power: "Moc",
      countries: "Kraje",
    },
    ru: {
      analysisButton: "Анализ рынка",
      backToFilters: "← Вернуться к фильтрам",
      heading: "Анализ рынка",
      testLabel: "Тестовые данные",
      testDescription: "Проверка работы графика до подключения официального источника данных.",
      importedLabel: "Импортированные данные",
      importedDescription: "График построен по загруженным объявлениям и их прямым ссылкам.",
      importHeading: "Загрузить реальные объявления",
      importDescription: "JSON или CSV: обязательны поля price и url; title, year и mileage необязательны. Файл остаётся только в этом браузере.",
      importButton: "Импортировать JSON / CSV",
      clearImport: "Вернуться к тестовым данным",
      importedFile: "Загружено объявлений: {count}. Файл: {file}.",
      importInvalid: "Файл должен содержать минимум 3 корректных объявления с ценой и ссылкой.",
      importReadError: "Не удалось прочитать файл JSON / CSV.",
      chartTitle: "Распределение цен объявлений",
      lowMarket: "Низ рынка",
      middleMarket: "Середина рынка",
      highMarket: "Верх рынка",
      count: "Объявлений",
      minimum: "Минимум",
      p25: "P25",
      median: "Медиана",
      average: "Средняя",
      p75: "P75",
      maximum: "Максимум",
      openSearch: "Открыть поиск mobile.de ↗",
      pointHint: "Нажмите, чтобы открыть поиск",
      mockNotice: "Это тестовые данные. Точки проверяют взаимодействие и пока открывают общий поиск mobile.de. После подключения API каждая точка получит ссылку на конкретное объявление.",
      missingVehicle: "Выберите марку и модель перед запуском анализа рынка.",
      invalidData: "Не удалось подготовить тестовые данные рынка.",
      preparing: "Подготавливаю тестовый анализ рынка…",
      mileage: "Пробег",
      year: "Год",
      displacement: "Объём",
      power: "Мощность",
      countries: "Страны",
    },
  };

  const priceMultipliers = [
    0.69, 0.74, 0.78, 0.81, 0.84, 0.87, 0.9, 0.92, 0.94, 0.96, 0.98, 1,
    1.02, 1.04, 1.06, 1.09, 1.12, 1.16, 1.2, 1.25, 1.31, 1.39, 1.49,
  ];

  let activeAnalysis = null;
  let importedDataset = null;

  function currentLanguage() {
    return document.documentElement.lang === "ru" ? "ru" : "pl";
  }

  function copy() {
    return marketCopy[currentLanguage()];
  }

  function vehicleFilterKey(filters) {
    return [filters.brand, filters.model, filters.version].map((value) => String(value || "").trim()).join("|");
  }

  function escapeMarketHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function numericValue(value, fallback) {
    const match = String(value || "").replace(/\s+/g, "").match(/\d+/);
    return match ? Number(match[0]) : fallback;
  }

  function seededNumber(value) {
    return [...String(value || "AUTOGOOD")]
      .reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
  }

  function searchUrlWithMockId(searchUrl, id) {
    const url = new URL(searchUrl);
    url.searchParams.set("mockListing", id);
    return url.toString();
  }

  function createMockListings({ filters, searchUrl }) {
    const vehicleKey = [filters.brand, filters.model, filters.version].filter(Boolean).join(" ");
    const seed = seededNumber(vehicleKey);
    const basePrice = 18000 + (seed % 52000);
    const yearFrom = numericValue(filters.yearFrom, 2020);
    const yearTo = Math.max(yearFrom, numericValue(filters.yearTo, 2025));
    const mileageFrom = numericValue(filters.mileageFrom, 15000);
    const mileageTo = Math.max(mileageFrom, numericValue(filters.mileageTo, 140000));

    return priceMultipliers.map((multiplier, index) => {
      const ratio = priceMultipliers.length === 1 ? 0 : index / (priceMultipliers.length - 1);
      const price = Math.round((basePrice * multiplier) / 250) * 250;
      const year = Math.round(yearTo - ((yearTo - yearFrom) * ratio));
      const mileage = Math.round((mileageFrom + ((mileageTo - mileageFrom) * ratio)) / 1000) * 1000;
      const id = `mock-${String(index + 1).padStart(2, "0")}`;
      return {
        id,
        title: `${vehicleKey} · ${String(index + 1).padStart(2, "0")}`,
        price,
        currency: "EUR",
        year,
        mileage,
        url: searchUrlWithMockId(searchUrl, id),
      };
    });
  }

  const mockMarketProvider = {
    id: "mock",
    async getListings(context) {
      return createMockListings(context);
    },
  };

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

  function normalizeListing(row, index) {
    const price = parseMarketNumber(listingValue(row, ["price", "price_eur", "cena", "preis"]));
    const urlValue = listingValue(row, ["url", "link", "listing_url", "listingurl"]);
    let url;
    try {
      url = new URL(String(urlValue || "").trim());
      if (!/^https?:$/.test(url.protocol)) return null;
    } catch {
      return null;
    }
    if (!price || price <= 0) return null;
    const yearMatch = String(listingValue(row, ["year", "registration_year", "first_registration", "rok"]) || "").match(/(?:19|20)\d{2}/);
    const mileage = parseMarketNumber(listingValue(row, ["mileage", "mileage_km", "km", "przebieg"]));
    const title = String(listingValue(row, ["title", "name", "model", "auto"]) || "").trim();
    const id = String(listingValue(row, ["id", "listing_id", "ad_id"]) || url.searchParams.get("id") || `import-${index + 1}`);
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
    const seenUrls = new Set();
    return (Array.isArray(rows) ? rows : [])
      .map(normalizeListing)
      .filter((listing) => listing && !seenUrls.has(listing.url) && seenUrls.add(listing.url));
  }

  function selectedOptionText(selector) {
    const option = document.querySelector(`${selector} option:checked`);
    if (option?.value) return option.textContent.trim();
    const displaySelectors = {
      "[data-mobile-fuel]": "[data-mobile-fuel-label]",
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
    const fuel = selectedOptionText("[data-mobile-fuel]");
    if (fuel) summary.push(filters.plugin === "yes" ? `${fuel} · Plug-in` : fuel);
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

  function marketStatistics(listings) {
    const prices = listings.map((listing) => listing.price).sort((left, right) => left - right);
    return {
      count: prices.length,
      min: prices[0],
      p25: percentile(prices, 0.25),
      median: percentile(prices, 0.5),
      mean: prices.reduce((sum, value) => sum + value, 0) / prices.length,
      p75: percentile(prices, 0.75),
      max: prices[prices.length - 1],
    };
  }

  function formatMarketPrice(value) {
    return new Intl.NumberFormat(currentLanguage() === "ru" ? "ru-RU" : "pl-PL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  }

  function marketPosition(value, minimum, maximum) {
    if (maximum <= minimum) return 50;
    return 5 + (((value - minimum) / (maximum - minimum)) * 90);
  }

  function marketClass(price, statistics) {
    if (price < statistics.p25) return "isLow";
    if (price > statistics.p75) return "isHigh";
    return "isMiddle";
  }

  function statHtml(label, value) {
    return `<div class="mobileMarketStat"><dt>${escapeMarketHtml(label)}</dt><dd>${escapeMarketHtml(value)}</dd></div>`;
  }

  function renderAnalysis() {
    if (!activeAnalysis) return;
    const c = copy();
    const { filters, listings, searchUrl, providerId, sourceFileName } = activeAnalysis;
    const imported = providerId === "import";
    const statistics = marketStatistics(listings);
    const summary = filterSummary(filters);
    const p25Position = marketPosition(statistics.p25, statistics.min, statistics.max);
    const medianPosition = marketPosition(statistics.median, statistics.min, statistics.max);
    const p75Position = marketPosition(statistics.p75, statistics.min, statistics.max);
    const points = [...listings]
      .sort((left, right) => left.price - right.price)
      .map((listing, index) => {
        const left = marketPosition(listing.price, statistics.min, statistics.max);
        const top = 34 + ((index % 5) * 29);
        const pointClass = marketClass(listing.price, statistics);
        const details = [
          listing.year,
          Number.isFinite(listing.mileage) ? `${listing.mileage.toLocaleString(currentLanguage() === "ru" ? "ru-RU" : "pl-PL")} km` : "",
        ].filter(Boolean).join(" · ");
        const label = `${listing.title}, ${formatMarketPrice(listing.price)}${details ? `, ${details}` : ""}. ${c.pointHint}`;
        return `
          <a
            class="mobileMarketPoint ${pointClass}"
            href="${escapeMarketHtml(listing.url)}"
            target="_blank"
            rel="noopener"
            aria-label="${escapeMarketHtml(label)}"
            style="left:${left}%;top:${top}px"
          >
            <span class="mobileMarketPointTooltip" aria-hidden="true">
              <strong>${escapeMarketHtml(formatMarketPrice(listing.price))}</strong>
              ${details ? `<span>${escapeMarketHtml(details)}</span>` : ""}
            </span>
          </a>`;
      })
      .join("");

    analysisContent.innerHTML = `
      <article class="mobileMarketAnalysisPanel">
        <header class="mobileMarketAnalysisHead">
          <div>
            <h1>${escapeMarketHtml(c.heading)}</h1>
            <p>${escapeMarketHtml(imported ? c.importedDescription : c.testDescription)}</p>
            <div class="mobileMarketFilterSummary">
              ${summary.map((item) => `<span>${escapeMarketHtml(item)}</span>`).join("")}
            </div>
          </div>
          <span class="mobileMarketTestLabel${imported ? " isImported" : ""}">${escapeMarketHtml(imported ? c.importedLabel : c.testLabel)}</span>
        </header>

        <section class="mobileMarketImport" aria-label="${escapeMarketHtml(c.importHeading)}">
          <div class="mobileMarketImportCopy">
            <strong>${escapeMarketHtml(c.importHeading)}</strong>
            <span>${escapeMarketHtml(c.importDescription)}</span>
            ${imported ? `<small>${escapeMarketHtml(c.importedFile.replace("{count}", String(listings.length)).replace("{file}", sourceFileName || "—"))}</small>` : ""}
          </div>
          <div class="mobileMarketImportActions">
            <label class="mobileMarketImportButton">
              <input type="file" accept=".json,.csv,application/json,text/csv" data-mobile-market-file />
              <span>${escapeMarketHtml(c.importButton)}</span>
            </label>
            ${imported ? `<button class="mobileMarketImportClear" type="button" data-mobile-market-import-clear>${escapeMarketHtml(c.clearImport)}</button>` : ""}
          </div>
        </section>

        <dl class="mobileMarketStats">
          ${statHtml(c.count, String(statistics.count))}
          ${statHtml(c.minimum, formatMarketPrice(statistics.min))}
          ${statHtml(c.p25, formatMarketPrice(statistics.p25))}
          ${statHtml(c.median, formatMarketPrice(statistics.median))}
          ${statHtml(c.average, formatMarketPrice(statistics.mean))}
          ${statHtml(c.p75, formatMarketPrice(statistics.p75))}
          ${statHtml(c.maximum, formatMarketPrice(statistics.max))}
        </dl>

        <div class="mobileMarketChartHead">
          <h2>${escapeMarketHtml(c.chartTitle)}</h2>
          <div class="mobileMarketLegend" aria-label="${escapeMarketHtml(c.chartTitle)}">
            <span class="isLow"><i></i>${escapeMarketHtml(c.lowMarket)}</span>
            <span class="isMiddle"><i></i>${escapeMarketHtml(c.middleMarket)}</span>
            <span class="isHigh"><i></i>${escapeMarketHtml(c.highMarket)}</span>
          </div>
        </div>

        <div class="mobileMarketScale" style="--market-p25:${p25Position}%;--market-p75:${p75Position}%">
          <div class="mobileMarketAxis"></div>
          <div class="mobileMarketBoundary" style="left:${p25Position}%"></div>
          <div class="mobileMarketMedian" style="left:${medianPosition}%"></div>
          <div class="mobileMarketBoundary" style="left:${p75Position}%"></div>
          ${points}
          <span class="mobileMarketTick isStart" style="left:5%">${escapeMarketHtml(formatMarketPrice(statistics.min))}</span>
          <span class="mobileMarketTick isQuartile" style="left:${p25Position}%">P25</span>
          <span class="mobileMarketTick" style="left:${medianPosition}%">${escapeMarketHtml(formatMarketPrice(statistics.median))}</span>
          <span class="mobileMarketTick isQuartile" style="left:${p75Position}%">P75</span>
          <span class="mobileMarketTick isEnd" style="left:95%">${escapeMarketHtml(formatMarketPrice(statistics.max))}</span>
        </div>

        <footer class="mobileMarketNotice">
          <p>${escapeMarketHtml(imported ? c.importedDescription : c.mockNotice)}</p>
          <a class="mobileMarketSearchLink" href="${escapeMarketHtml(searchUrl)}" target="_blank" rel="noopener">${escapeMarketHtml(c.openSearch)}</a>
        </footer>
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
      if (importedDataset?.filterKey !== vehicleFilterKey(filters)) importedDataset = null;
      setAnalysisStatus(c.preparing);
      analysisOpen.disabled = true;
      const provider = importedDataset ? null : (window.AUTOGOOD_MOBILE_MARKET_PROVIDER || mockMarketProvider);
      const rawListings = importedDataset?.listings || await provider.getListings({ filters, searchUrl });
      const listings = (Array.isArray(rawListings) ? rawListings : []).filter((listing) => (
        Number.isFinite(Number(listing?.price)) && Number(listing.price) > 0 && listing?.url
      )).map((listing) => ({ ...listing, price: Number(listing.price) }));
      if (listings.length < 3) throw new Error(c.invalidData);
      activeAnalysis = {
        filters,
        listings,
        searchUrl,
        providerId: importedDataset ? "import" : (provider.id || "external"),
        sourceFileName: importedDataset?.fileName || "",
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
        filterKey: vehicleFilterKey(activeAnalysis.filters),
      };
      activeAnalysis = {
        ...activeAnalysis,
        listings,
        providerId: "import",
        sourceFileName: input.files[0].name,
      };
      setAnalysisStatus("");
      renderAnalysis();
    } catch (error) {
      setAnalysisStatus(error instanceof SyntaxError ? c.importReadError : (error.message || c.importReadError), true);
      input.value = "";
    }
  });

  analysisContent.addEventListener("click", (event) => {
    const clearButton = event.target.closest("[data-mobile-market-import-clear]");
    if (!clearButton || !activeAnalysis) return;
    importedDataset = null;
    activeAnalysis = {
      ...activeAnalysis,
      listings: createMockListings(activeAnalysis),
      providerId: "mock",
      sourceFileName: "",
    };
    renderAnalysis();
  });

  analysisOpen.addEventListener("click", openAnalysis);
  analysisBack.addEventListener("click", closeAnalysis);
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.addEventListener("click", () => requestAnimationFrame(renderMarketTranslations));
  });

  renderMarketTranslations();
})();
