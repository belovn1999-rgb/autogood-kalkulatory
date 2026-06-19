import { mkdir, writeFile } from "node:fs/promises";

const WALUTOMAT_URL = "https://www.walutomat.pl/kursy-walut/";
const WALUTOMAT_API_URL = "https://api.walutomat.pl/api/v2.0.0/market_fx/best_offers";
const OUTPUT_PATH = new URL("../data/exchange-rates.json", import.meta.url);
const EUR_PLN_MARGIN = 0.02;

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
  const [eurPlnOffers, eurSekOffers, eurDkkOffers] = await Promise.all([
    loadBestOffer("EURPLN"),
    loadBestOffer("EURSEK"),
    loadBestOffer("EURDKK"),
  ]);

  const eurPlnSell = bestSellRate(eurPlnOffers, "EURPLN");
  const eurSekSell = bestSellRate(eurSekOffers, "EURSEK");
  const eurDkkSell = bestSellRate(eurDkkOffers, "EURDKK");

  return {
    EUR_PLN: rounded(eurPlnSell + EUR_PLN_MARGIN, 4),
    SEK_EUR: rounded(1 / eurSekSell, 4),
    DKK_EUR: rounded(1 / eurDkkSell, 4),
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
  margin: {
    EUR_PLN: EUR_PLN_MARGIN,
    note: "Do kursu sprzedaży EUR/PLN z Walutomat doliczono 0.02 PLN.",
  },
  rates: {
    EUR_PLN: {
      label: "EUR - PLN",
      value: rates.EUR_PLN,
      unit: "PLN",
    },
    SEK_EUR: {
      label: "SEK - EUR",
      value: rates.SEK_EUR,
      unit: "EUR",
    },
    DKK_EUR: {
      label: "DKK - EUR",
      value: rates.DKK_EUR,
      unit: "EUR",
    },
  },
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.log(`Updated exchange rates from ${data.source}`);
console.log(`${data.rates.EUR_PLN.label}: ${data.rates.EUR_PLN.value} ${data.rates.EUR_PLN.unit}`);
console.log(`${data.rates.SEK_EUR.label}: ${data.rates.SEK_EUR.value} ${data.rates.SEK_EUR.unit}`);
console.log(`${data.rates.DKK_EUR.label}: ${data.rates.DKK_EUR.value} ${data.rates.DKK_EUR.unit}`);
