#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const outputPath = new URL("../src/mobile-model-catalog.generated.js", import.meta.url);
const makeUrl = "https://services.mobile.de/refdata/classes/Car/makes";

// Keep internal names compatible with the existing parser and calculator data.
const canonicalMakeNames = {
  CITROEN: "Citroen",
  DS: "DS",
  MINI: "Mini",
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

async function fetchItems(url, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) return xmlItems(await response.text());
    if (attempt === attempts) throw new Error(`${response.status} ${url}`);
  }
  return [];
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
  return context.window.AUTOGOOD_MOBILE_MODEL_CATALOG || { groups: {}, modelIds: {}, makeKeys: {} };
}

async function catalogForMake(make) {
  const models = await fetchItems(`${make.url}/models`);
  const groupItems = await fetchItems(`${make.url}/modelgroups`).catch(() => []);
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
const officialMakes = makes.map((make) => ({
  ...make,
  displayName: canonicalMakeNames[make.key] || make.label,
}));

catalog.makeKeys = Object.fromEntries(officialMakes.map((make) => [make.displayName, make.key]));
catalog.makeLabels = Object.fromEntries(officialMakes.map((make) => [make.displayName, make.label]));

// BMW remains in src/mobile.js because its verified groups and legacy model IDs
// are maintained there. Every other Car make is refreshed from Mobile.de.
const refreshed = await mapConcurrent(officialMakes.filter((make) => make.key !== "BMW"), 6, async (make) => {
  const brand = make.displayName;
  process.stdout.write(`Loading ${brand}\n`);
  return [brand, await catalogForMake(make)];
});

catalog.groups = Object.fromEntries(refreshed);

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
