import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceUrl = "https://www.otomoto.pl/osobowe";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(repoRoot, "src/otomoto-catalog.generated.js");

const response = await fetch(sourceUrl, {
  headers: { "user-agent": "Mozilla/5.0 AUTOGOOD catalog generator" },
});
if (!response.ok) throw new Error(`Otomoto returned HTTP ${response.status}.`);

const html = await response.text();
const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (!nextDataMatch) throw new Error("Otomoto __NEXT_DATA__ was not found.");

const nextData = JSON.parse(nextDataMatch[1]);
const urqlState = nextData?.props?.pageProps?.urqlState || {};
const filterContainers = [];

function collectFilters(value) {
  if (Array.isArray(value)) {
    value.forEach(collectFilters);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (value.filters?.states) filterContainers.push(value.filters);
  Object.values(value).forEach(collectFilters);
}

Object.values(urqlState).forEach((entry) => {
  if (!entry?.data) return;
  collectFilters(JSON.parse(entry.data));
});

const modelsByMake = {};
filterContainers.forEach((filters) => {
  filters.states
    .filter((filterState) => filterState.filterId === "filter_enum_model")
    .forEach((filterState) => {
      const makeId = filterState.conditions?.find(
        (condition) => condition.filterId === "filter_enum_make" && condition.type === "IS",
      )?.value;
      if (!makeId) return;
      const models = filterState.values
        .flatMap((group) => group.values || [])
        .map((model) => ({ id: model.id, name: model.name || model.id }));
      modelsByMake[makeId] = Object.values(
        Object.fromEntries(models.map((model) => [model.id, model])),
      ).sort((left, right) => left.id.localeCompare(right.id, "en"));
    });
});

const sortedModels = Object.fromEntries(
  Object.entries(modelsByMake).sort(([left], [right]) => left.localeCompare(right, "en")),
);
if (Object.keys(sortedModels).length < 150) {
  throw new Error(`Only ${Object.keys(sortedModels).length} Otomoto makes were found.`);
}

const catalog = {
  generatedFrom: sourceUrl,
  generatedAt: new Date().toISOString(),
  modelsByMake: sortedModels,
};
const output = `/* Generated from Otomoto search filters. Do not hand-edit. */\nwindow.AUTOGOOD_OTOMOTO_CATALOG = ${JSON.stringify(catalog, null, 2)};\n`;
await fs.writeFile(outputPath, output);
console.log(`Saved ${Object.keys(sortedModels).length} Otomoto makes to ${outputPath}.`);
