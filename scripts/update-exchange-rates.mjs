import { mkdir, writeFile } from "node:fs/promises";

const WALUTOMAT_URL = "https://www.walutomat.pl/kursy-walut/";
const OUTPUT_PATH = new URL("../data/exchange-rates.json", import.meta.url);
const EUR_PLN_MARGIN = 0.02;

function rounded(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function decimal(value) {
  return Number(String(value).replace(/\s/g, "").replace(",", "."));
}

function stripTags(value) {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractSellRate(html, key) {
  const rowPattern = new RegExp(
    `<a[^>]+data-rate="${key}"[\\s\\S]*?<\\/a>`,
    "i"
  );
  const row = html.match(rowPattern)?.[0];
  if (!row) throw new Error(`Missing ${key} row on Walutomat page`);

  const values = [...row.matchAll(/data-rate-value>([\s\S]*?)<\/span>/gi)].map((match) => stripTags(match[1]));
  if (values.length < 2) throw new Error(`Missing sell value for ${key}`);

  const value = decimal(values[1].split(" ")[0]);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid sell value for ${key}: ${values[1]}`);
  return value;
}

async function loadWalutomatRates() {
  const response = await fetch(WALUTOMAT_URL, {
    headers: {
      Accept: "text/html",
      "User-Agent": "AUTOGOOD tools exchange-rate updater",
    },
  });

  if (!response.ok) {
    throw new Error(`Walutomat returned ${response.status}`);
  }

  const html = await response.text();
  const eurPlnSell = extractSellRate(html, "EUR_PLN");

  return {
    EUR_PLN: rounded(eurPlnSell + EUR_PLN_MARGIN, 4),
    SEK_PLN: rounded(extractSellRate(html, "SEK_PLN"), 4),
    DKK_PLN: rounded(extractSellRate(html, "DKK_PLN"), 4),
  };
}

const rates = await loadWalutomatRates();
const today = new Date().toISOString().slice(0, 10);

const data = {
  source: "Walutomat - kurs sprzedaży",
  sourceUrl: WALUTOMAT_URL,
  providerApiUrl: WALUTOMAT_URL,
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
    SEK_PLN: {
      label: "SEK - PLN",
      value: rates.SEK_PLN,
      unit: "PLN",
    },
    DKK_PLN: {
      label: "DKK - PLN",
      value: rates.DKK_PLN,
      unit: "PLN",
    },
  },
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.log(`Updated exchange rates from ${data.source}`);
console.log(`${data.rates.EUR_PLN.label}: ${data.rates.EUR_PLN.value} ${data.rates.EUR_PLN.unit}`);
console.log(`${data.rates.SEK_PLN.label}: ${data.rates.SEK_PLN.value} ${data.rates.SEK_PLN.unit}`);
console.log(`${data.rates.DKK_PLN.label}: ${data.rates.DKK_PLN.value} ${data.rates.DKK_PLN.unit}`);
