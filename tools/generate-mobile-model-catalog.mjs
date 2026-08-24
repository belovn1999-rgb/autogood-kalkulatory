#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const outputPath = new URL("../src/mobile-model-catalog.generated.js", import.meta.url);
const makeUrl = "https://services.mobile.de/refdata/classes/Car/makes";

// These are the car makes already supported by buildMobileDeSearchUrl().
// BMW remains in src/mobile.js because its verified model IDs are maintained there.
const targetMakeKeys = {
  Abarth: "ABARTH",
  "Alfa Romeo": "ALFA ROMEO",
  Alpine: "ALPINE",
  Bentley: "BENTLEY",
  Citroen: "CITROEN",
  Cupra: "CUPRA",
  Dacia: "DACIA",
  DS: "DS",
  Fiat: "FIAT",
  Hyundai: "HYUNDAI",
  Infiniti: "INFINITI",
  Iveco: "IVECO",
  Jaguar: "JAGUAR",
  Jeep: "JEEP",
  Kia: "KIA",
  "Land Rover": "LAND ROVER",
  Lancia: "LANCIA",
  Lexus: "LEXUS",
  MAN: "MAN",
  Mini: "MINI",
  Mitsubishi: "MITSUBISHI",
  Nissan: "NISSAN",
  Polestar: "POLESTAR",
  Smart: "SMART",
  Suzuki: "SUZUKI",
};

const decodeXml = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&apos;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

function xmlItems(xml) {
  return [...xml.matchAll(/<reference:item\b([^>]*)>([\s\S]*?)<\/reference:item>/g)].map((match) => {
    const attributes = match[1];
    const body = match[2];
    return {
      key: decodeXml((attributes.match(/\bkey="([^"]*)"/) || [])[1] || ""),
      url: decodeXml((attributes.match(/\burl="([^"]*)"/) || [])[1] || ""),
      label: decodeXml((body.match(/<resource:local-description\b[^>]*>([\s\S]*?)<\/resource:local-description>/) || [])[1] || ""),
    };
  }).filter((item) => item.key && item.label);
}

async function fetchItems(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return xmlItems(await response.text());
}

async function mapConcurrent(values, limit, work) {
  const result = [];
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (next < values.length) {
      const index = next++;
      result[index] = await work(values[index]);
    }
  }));
  return result;
}

function existingCatalog(source) {
  const context = { window: {} };
  Function("window", source)(context.window);
  return context.window.AUTOGOOD_MOBILE_MODEL_CATALOG || { groups: {}, modelIds: {} };
}

async function catalogForMake(make) {
  const [models, groupItems] = await Promise.all([
    fetchItems(`${make.url}/models`),
    fetchItems(`${make.url}/modelgroups`),
  ]);
  const modelByKey = new Map(models.map((model) => [model.key, model]));
  const groupedKeys = new Set();
  const groups = [];

  const groupedModels = await mapConcurrent(groupItems, 6, async (group) => {
    try {
      return { group, models: await fetchItems(`${group.url}/models`) };
    } catch {
      return { group, models: [] };
    }
  });

  groupedModels.forEach(({ group, models: groupModels }) => {
    const entries = groupModels
      .map((model) => modelByKey.get(model.key) || model)
      .filter((model) => !groupedKeys.has(model.key));
    entries.forEach((model) => groupedKeys.add(model.key));
    if (entries.length) groups.push({ group: group.label, models: entries.map((model) => model.label) });
  });

  const ungrouped = models.filter((model) => !groupedKeys.has(model.key)).map((model) => model.label);
  if (ungrouped.length) groups.push({ group: `Pozostałe ${make.displayName}`, models: ungrouped });
  return groups;
}

const source = await readFile(outputPath, "utf8");
const catalog = existingCatalog(source);
const makes = await fetchItems(makeUrl);
const makeByKey = new Map(makes.map((make) => [make.key, make]));
const missing = Object.entries(targetMakeKeys).filter(([brand]) => !catalog.groups[brand]);

const additions = await mapConcurrent(missing, 4, async ([brand, key]) => {
  const make = makeByKey.get(key);
  if (!make) throw new Error(`Mobile.de make not found: ${brand} (${key})`);
  process.stdout.write(`Loading ${brand}\n`);
  return [brand, await catalogForMake({ ...make, displayName: brand })];
});

additions.forEach(([brand, groups]) => {
  catalog.groups[brand] = groups;
});

const generatedAt = new Date().toISOString().slice(0, 10);
const content = [
  `/* Generated from official Mobile.de refdata on ${generatedAt}. Do not hand-edit. */`,
  `window.AUTOGOOD_MOBILE_MODEL_CATALOG = ${JSON.stringify(catalog, null, 2)};`,
  "",
].join("\n");

await writeFile(outputPath, content);
const totalModels = Object.values(catalog.groups).reduce(
  (sum, groups) => sum + groups.reduce((groupSum, group) => groupSum + group.models.length, 0),
  0,
);
console.log(`Saved ${Object.keys(catalog.groups).length} brands and ${totalModels} models.`);
