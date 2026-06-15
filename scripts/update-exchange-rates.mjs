import { mkdir, writeFile } from "node:fs/promises";

const NBP_TABLE_C_URL = "https://api.nbp.pl/api/exchangerates/tables/C?format=json";
const MONEY_PL_URL = "https://www.money.pl/pieniadze/nbp/kupnosprzedaz/";
const OUTPUT_PATH = new URL("../data/exchange-rates.json", import.meta.url);

function rounded(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getRate(table, code) {
  const rate = table.rates.find((item) => item.code === code);
  if (!rate) throw new Error(`Missing ${code} in NBP table C`);
  return rate;
}

async function loadTableC() {
  const response = await fetch(NBP_TABLE_C_URL, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`NBP API returned ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || !payload[0]?.rates) {
    throw new Error("Unexpected NBP API payload");
  }

  return payload[0];
}

const table = await loadTableC();
const eur = getRate(table, "EUR");
const sek = getRate(table, "SEK");
const dkk = getRate(table, "DKK");

const data = {
  source: "money.pl / NBP tabela C - kurs sprzedaży",
  sourceUrl: MONEY_PL_URL,
  providerApiUrl: NBP_TABLE_C_URL,
  updatedAt: new Date().toISOString(),
  tradingDate: table.tradingDate,
  effectiveDate: table.effectiveDate,
  tableNo: table.no,
  rates: {
    EUR_PLN: {
      label: "EUR - PLN",
      value: rounded(eur.ask, 4),
      unit: "PLN",
    },
    EUR_SEK: {
      label: "EUR - SEK",
      value: rounded(eur.ask / sek.ask, 4),
      unit: "SEK",
    },
    EUR_DKK: {
      label: "EUR - DKK",
      value: rounded(eur.ask / dkk.ask, 4),
      unit: "DKK",
    },
  },
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.log(`Updated exchange rates from ${data.source}`);
console.log(`${data.rates.EUR_PLN.label}: ${data.rates.EUR_PLN.value} ${data.rates.EUR_PLN.unit}`);
console.log(`${data.rates.EUR_SEK.label}: ${data.rates.EUR_SEK.value} ${data.rates.EUR_SEK.unit}`);
console.log(`${data.rates.EUR_DKK.label}: ${data.rates.EUR_DKK.value} ${data.rates.EUR_DKK.unit}`);
