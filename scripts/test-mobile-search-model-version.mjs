import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../src/mobile.js", import.meta.url), "utf8");

function functionSource(name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Nie znaleziono funkcji ${name}.`);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = source.indexOf("{", start); index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "'" || character === '"' || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Nie zamknięto funkcji ${name}.`);
}

const context = {
  URLSearchParams,
  copy: { pl: { marketSearchInvalidRange: "invalid", marketSearchUnsupportedBrand: "invalid", marketSearchChooseBrand: "invalid" } },
  state: { lang: "pl" },
  compactNumber: (value) => String(value || "").replace(/\s+/g, "").match(/\d+/)?.[0] || "",
  normalizeToken: (value) => String(value || "").trim().toLowerCase(),
  mobileDeMakeIds: { Mazda: "16800" },
  mobileDeModelIdsByBrand: { Mazda: {} },
  generatedMobileModelCatalog: { makeKeys: {} },
  mobileDeBodyValues: {},
  mobileDeFuelValues: {},
  mobileDeDriveValues: {},
  mobileDeGearboxValues: {},
  mobileDeSellerValues: {},
  mobileDeInteriorMaterialValues: {},
  mobileDeAirConditioningValues: {},
  mobileDeTrailerCouplingValues: {},
};
vm.createContext(context);
[
  "mobileDeNumber",
  "mobileDeModelId",
  "appendMobileDeRange",
  "manualFuelValues",
  "buildMobileDeSearchUrl",
].forEach((name) => vm.runInContext(functionSource(name), context));

const baseFilters = {
  brand: "Mazda",
  model: "6",
  fuel: "",
  plugin: "",
  body: "",
  mileageFrom: "",
  mileageTo: "",
  yearFrom: "",
  yearTo: "",
  displacementFrom: "",
  displacementTo: "",
  powerFrom: "",
  powerTo: "",
  seatsFrom: "",
  seatsTo: "",
  drive: "any",
  gearbox: "any",
  vat: "",
  seller: "",
  countries: [],
  interiorMaterials: [],
  airConditioning: "",
  trailerCoupling: "any",
  features: [],
  parkingSensors: [],
  cruiseControl: "any",
  exteriorColors: [],
  interiorColors: [],
  matte: false,
  metallic: false,
  nonSmoking: false,
  roadworthy: false,
  damagedVehicles: "show",
};

const emptyVersionUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, version: "" }));
assert.equal(emptyVersionUrl.pathname, "/auto/mazda-6.html", "selected model must use its Mobile.de model route");
assert.equal(emptyVersionUrl.searchParams.get("ms"), null, "empty Version must not receive the selected model");

const versionUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, version: "Kombi" }));
assert.equal(versionUrl.pathname, "/auto/mazda-6.html", "selected model route must remain unchanged when Version is set");
assert.equal(versionUrl.searchParams.get("ms"), ";;;Kombi", "only the Version value may occupy the Version segment");
