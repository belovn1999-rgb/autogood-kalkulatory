(function () {
  const rowsNode = document.querySelector("[data-home-rates]");
  const sourceNode = document.querySelector("[data-home-rates-source]");
  if (!rowsNode) return;

  const WALUTOMAT_API_URL = "https://api.walutomat.pl/api/v2.0.0/market_fx/best_offers";
  const EUR_PLN_MARGIN = 0.02;
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
    const [eurPlnOffers, eurSekOffers, eurDkkOffers] = await Promise.all([
      loadWalutomatOffer("EURPLN"),
      loadWalutomatOffer("EURSEK"),
      loadWalutomatOffer("EURDKK"),
    ]);
    const eurPln = bestOfferRate(eurPlnOffers, "EURPLN");
    const eurSek = bestOfferRate(eurSekOffers, "EURSEK");
    const eurDkk = bestOfferRate(eurDkkOffers, "EURDKK");
    const timestamps = [eurPlnOffers.ts, eurSekOffers.ts, eurDkkOffers.ts].filter(Boolean).sort();
    const updatedAt = timestamps[timestamps.length - 1] || new Date().toISOString();

    return {
      source: "Walutomat API - kurs sprzedaży",
      effectiveDate: updatedAt.slice(0, 10),
      rates: {
        EUR_PLN: { label: "EUR - PLN", value: Math.round((eurPln + EUR_PLN_MARGIN) * 10000) / 10000, unit: "PLN" },
        SEK_EUR: { label: "SEK - EUR", value: Math.round((1 / eurSek) * 10000) / 10000, unit: "EUR" },
        DKK_EUR: { label: "DKK - EUR", value: Math.round((1 / eurDkk) * 10000) / 10000, unit: "EUR" },
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
      const keys = ["EUR_PLN", "SEK_EUR", "DKK_EUR"];
      rowsNode.innerHTML = keys
        .map((key) => {
          const item = data.rates?.[key];
          if (!item) return "";
          return `<span>${item.label}</span><b>${formatRate(item.value)} ${item.unit}</b>`;
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
