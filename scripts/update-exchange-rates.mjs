import { mkdir, writeFile } from "node:fs/promises";

const WALUTOMAT_URL = "https://www.walutomat.pl/kursy-walut/";
const WALUTOMAT_API_URL = "https://api.walutomat.pl/api/v2.0.0/market_fx/best_offers";
const OUTPUT_PATH = new URL("../data/exchange-rates.json", import.meta.url);

function rounded(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function numberFromOffer(offer, pair) {
  const value = Number(offer?.price);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid Walutomat price for ${pair}`);
  }
  return value;
}

async function loadBestOffer(pair) {
  const url = new URL(WALUTOMAT_API_URL);
  url.searchParams.set("currencyPair", pair);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "AUTOGOOD tools exchange-rate updater",
    },
  });

  if (!response.ok) {
    throw new Error(`Walutomat API returned ${response.status} for ${pair}`);
  }

  const data = await response.json();
  if (!data?.success || data?.result?.currencyPair !== pair) {
    throw new Error(`Walutomat API returned invalid response for ${pair}`);
  }

  return data.result;
}

function bestSellRate(offers, pair) {
  const ask = offers?.asks?.[0];
  if (ask) return numberFromOffer(ask, pair);

  const bid = offers?.bids?.[0];
  if (bid) return numberFromOffer(bid, pair);

  throw new Error(`Walutomat API returned no offers for ${pair}`);
}

async function loadWalutomatRates() {
  const eurPlnOffers = await loadBestOffer("EURPLN");

  const eurPlnSell = bestSellRate(eurPlnOffers, "EURPLN");

  return {
    EUR_PLN: rounded(eurPlnSell, 4),
  };
}

const rates = await loadWalutomatRates();
const today = new Date().toISOString().slice(0, 10);

const data = {
  source: "Walutomat - kurs sprzedaży",
  sourceUrl: WALUTOMAT_URL,
  providerApiUrl: WALUTOMAT_API_URL,
  updatedAt: new Date().toISOString(),
  effectiveDate: today,
  rates: {
    EUR_PLN: {
      label: "EUR - PLN",
      value: rates.EUR_PLN,
      unit: "PLN",
    },
  },
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.log(`Updated exchange rates from ${data.source}`);
console.log(`${data.rates.EUR_PLN.label}: ${data.rates.EUR_PLN.value} ${data.rates.EUR_PLN.unit}`);
