(function () {
  const rowsNode = document.querySelector("[data-home-rates]");
  const sourceNode = document.querySelector("[data-home-rates-source]");
  if (!rowsNode) return;

  const WALUTOMAT_API_URL = "https://api.walutomat.pl/api/v2.0.0/market_fx/best_offers";
  const RATES_URL = "./data/exchange-rates.json";

  const formatRate = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: number >= 1 ? 2 : 4,
      maximumFractionDigits: 4,
    }).format(number);
  };

  const bestOfferRate = (offers, pair) => {
    const offer = offers?.asks?.[0] || offers?.bids?.[0];
    const value = Number(offer?.price);
    if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid Walutomat rate for ${pair}`);
    return value;
  };

  const loadWalutomatOffer = async (pair) => {
    const url = new URL(WALUTOMAT_API_URL);
    url.searchParams.set("currencyPair", pair);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Walutomat API unavailable");
    const data = await response.json();
    if (!data?.success || data?.result?.currencyPair !== pair) throw new Error(`Invalid Walutomat response for ${pair}`);
    return data.result;
  };

  const loadLiveRates = async () => {
    const eurPlnOffers = await loadWalutomatOffer("EURPLN");
    const eurPln = bestOfferRate(eurPlnOffers, "EURPLN");
    const updatedAt = eurPlnOffers.ts || new Date().toISOString();

    return {
      source: "Walutomat API - kurs sprzedaży",
      effectiveDate: updatedAt.slice(0, 10),
      rates: {
        EUR_PLN: { label: "EUR - PLN", value: Math.round(eurPln * 10000) / 10000, unit: "PLN" },
      },
    };
  };

  const loadRates = async () => {
    try {
      return await loadLiveRates();
    } catch (liveError) {
      const today = new Date().toISOString().slice(0, 10);
      const response = await fetch(`${RATES_URL}?date=${today}`, { cache: "no-store" });
      if (!response.ok) throw liveError;
      return response.json();
    }
  };

  loadRates()
    .then((data) => {
      const keys = ["EUR_PLN"];
      rowsNode.innerHTML = keys
        .map((key) => {
          const item = data.rates?.[key];
          if (!item) return "";
          const label = String(item.label || key).replace(" - ", " — ");
          return `<span>${label}</span><b>${formatRate(item.value)} ${item.unit}</b>`;
        })
        .join("");

      if (sourceNode) {
        const date = data.effectiveDate ? `, ${data.effectiveDate}` : "";
        sourceNode.textContent = `źródło: ${data.source || "Walutomat"}${date}`;
      }
    })
    .catch(() => {
      if (sourceNode) sourceNode.textContent = "źródło: Walutomat";
    });
})();
