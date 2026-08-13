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

  function currentLanguage() {
    return document.documentElement.lang === "ru" ? "ru" : "pl";
  }

  function copy() {
    return marketCopy[currentLanguage()];
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

  function selectedOptionText(selector) {
    const option = document.querySelector(`${selector} option:checked`);
    return option?.value ? option.textContent.trim() : "";
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
    const { filters, listings, searchUrl } = activeAnalysis;
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
        const label = `${listing.title}, ${formatMarketPrice(listing.price)}, ${listing.year}, ${listing.mileage} km. ${c.pointHint}`;
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
              <span>${escapeMarketHtml(`${listing.year} · ${listing.mileage.toLocaleString(currentLanguage() === "ru" ? "ru-RU" : "pl-PL")} km`)}</span>
            </span>
          </a>`;
      })
      .join("");

    analysisContent.innerHTML = `
      <article class="mobileMarketAnalysisPanel">
        <header class="mobileMarketAnalysisHead">
          <div>
            <h1>${escapeMarketHtml(c.heading)}</h1>
            <p>${escapeMarketHtml(c.testDescription)}</p>
            <div class="mobileMarketFilterSummary">
              ${summary.map((item) => `<span>${escapeMarketHtml(item)}</span>`).join("")}
            </div>
          </div>
          <span class="mobileMarketTestLabel">${escapeMarketHtml(c.testLabel)}</span>
        </header>

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
          <p>${escapeMarketHtml(c.mockNotice)}</p>
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
      setAnalysisStatus(c.preparing);
      analysisOpen.disabled = true;
      const provider = window.AUTOGOOD_MOBILE_MARKET_PROVIDER || mockMarketProvider;
      const rawListings = await provider.getListings({ filters, searchUrl });
      const listings = (Array.isArray(rawListings) ? rawListings : []).filter((listing) => (
        Number.isFinite(Number(listing?.price)) && Number(listing.price) > 0 && listing?.url
      )).map((listing) => ({ ...listing, price: Number(listing.price) }));
      if (listings.length < 3) throw new Error(c.invalidData);
      activeAnalysis = { filters, listings, searchUrl, providerId: provider.id || "external" };
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

  analysisOpen.addEventListener("click", openAnalysis);
  analysisBack.addEventListener("click", closeAnalysis);
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.addEventListener("click", () => requestAnimationFrame(renderMarketTranslations));
  });

  renderMarketTranslations();
})();
