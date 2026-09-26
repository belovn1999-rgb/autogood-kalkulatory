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
  mobileDeMakeIds: { Mazda: "16800", Nissan: "18700", BMW: "3500", "Mercedes-Benz": "17200" },
  mobileDeModelIdsByBrand: { Mazda: { "6": "7" }, Nissan: { Skyline: "33" }, BMW: { "330": "15", "840": "42", "850": "43" }, "Mercedes-Benz": {} },
  mobileDeGroupIdsByBrand: { BMW: { "3 Series": "21" }, "Mercedes-Benz": { "C-Class": "6" } },
  mobileDeOptionParams: { LED_HEADLIGHTS: "hlt", XENON_HEADLIGHTS: "hlt", BI_XENON_HEADLIGHTS: "hlt", REAR_TRAFFIC_ALERT: "fe" },
  mobileDeUnsupportedFeatures: new Set(["HALOGEN_HEADLIGHTS", "COMFORT_SEATS", "ELECTRIC_FRONT_SEATS"]),
  modelGroupsForBrand: (brand) => brand === "BMW" ? [{ group: "8 Series", models: ["8", "840", "850"] }] : [],
  generatedMobileModelCatalog: { makeKeys: {} },
  mobileDeBodyValues: { coupe: "SportsCar" },
  mobileDeFuelValues: { petrol: "PETROL", electric: "ELECTRICITY" },
  mobileDeDriveValues: {},
  mobileDeGearboxValues: { automatic: "AUTOMATIC_GEAR" },
  mobileDeSellerValues: {},
  mobileDeInteriorMaterialValues: {},
  mobileDeAirConditioningValues: {},
  mobileDeTrailerCouplingValues: {},
};
vm.createContext(context);
[
  "mobileDeNumber",
  "rangeBounds",
  "mobileDeModelId",
  "mobileDeGroupId",
  "mobileDeModelSelection",
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
assert.equal(emptyVersionUrl.pathname, "/fahrzeuge/search.html", "a model must never use the filter-dropping SEO route");
assert.equal(emptyVersionUrl.searchParams.get("ms"), "16800;7;;", "selected model must use its numeric Mobile.de ID");

const versionUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, version: "Kombi" }));
assert.equal(versionUrl.searchParams.get("ms"), "16800;7;;Kombi", "only the Version value may occupy the Version segment");

const seriesUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, brand: "BMW", model: "3", yearFrom: "2019" }));
assert.equal(seriesUrl.searchParams.get("ms"), "3500;;21;", "a series entry must select the Mobile.de model group");
assert.equal(seriesUrl.searchParams.get("fr"), "2019:", "filters must survive a model group search");
const classUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, brand: "Mercedes-Benz", model: "C" }));
assert.equal(classUrl.searchParams.get("ms"), "17200;;6;", "Mercedes C must select the C-Class group");
const exactBmwUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, brand: "BMW", model: "330" }));
assert.equal(exactBmwUrl.searchParams.get("ms"), "3500;15;;", "an exact model must win over its group");

const openLowUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, displacementFrom: "< 5000" }));
assert.equal(openLowUrl.searchParams.get("cc"), ":5000", "\"< 5000\" as the lower bound means up to 5000 ccm");
const openHighUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, displacementFrom: "3000", displacementTo: "> 5000" }));
assert.equal(openHighUrl.searchParams.get("cc"), "3000:", "\"> 5000\" as the upper bound removes the upper limit");

const ownSeriesUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, brand: "BMW", model: "8" }));
assert.deepEqual(ownSeriesUrl.searchParams.getAll("ms"), ["3500;42;;", "3500;43;;"], "a series without a Mobile.de group must select each of its models");

const unknownModelUrl = new URL(context.buildMobileDeSearchUrl({ ...baseFilters, model: "Custom", version: "2.0" }));
assert.equal(unknownModelUrl.pathname, "/fahrzeuge/search.html", "an unknown model must keep the search page");
assert.equal(unknownModelUrl.searchParams.get("ms"), "16800;;;Custom 2.0", "an unknown model must fall back to a text search within the make");

const optionUrl = new URL(context.buildMobileDeSearchUrl({
  ...baseFilters,
  fuels: ["petrol", "plugin"],
  features: ["BI_XENON_HEADLIGHTS", "PANORAMIC_GLASS_ROOF"],
  parkingSensors: ["REAR_TRAFFIC_ALERT", "REAR_VIEW_CAM"],
}));
assert.deepEqual(optionUrl.searchParams.getAll("ft"), ["PETROL"], "plug-in is not a Mobile.de fuel type");
assert.deepEqual(optionUrl.searchParams.getAll("hlt"), ["BI_XENON_HEADLIGHTS"], "headlights must use Mobile.de's hlt parameter");
assert.deepEqual(optionUrl.searchParams.getAll("fe"), ["PANORAMIC_GLASS_ROOF", "REAR_TRAFFIC_ALERT", "HYBRID_PLUGIN"], "plug-in and rear traffic alert are Mobile.de features");
assert.deepEqual(optionUrl.searchParams.getAll("pa"), ["REAR_VIEW_CAM"], "parking assistants must use Mobile.de's pa parameter");

const filterUrl = new URL(context.buildMobileDeSearchUrl({
  ...baseFilters,
  model: "",
  version: "",
  fuels: ["electric"],
  seatsFrom: "5",
  seatsTo: "7",
  parkingSensors: ["REAR_VIEW_CAM", "FRONT_SENSORS"],
  cruiseControl: "ADAPTIVE_CRUISE_CONTROL",
  roadworthy: true,
}));
assert.equal(filterUrl.searchParams.get("sc"), "5:7", "seat range must use Mobile.de's sc parameter");
assert.deepEqual(filterUrl.searchParams.getAll("ft"), ["ELECTRICITY"], "electric fuel must use Mobile.de's ELECTRICITY value");
assert.deepEqual(filterUrl.searchParams.getAll("pa"), ["REAR_VIEW_CAM", "FRONT_SENSORS"], "parking assistants must use Mobile.de's pa parameter");
assert.equal(filterUrl.searchParams.get("spc"), "ADAPTIVE_CRUISE_CONTROL", "cruise control must use Mobile.de's spc parameter");
assert.equal(filterUrl.searchParams.get("rtd"), "true", "roadworthy must use Mobile.de's rtd parameter");
assert.equal(filterUrl.searchParams.get("rd"), null, "roadworthy must not set Mobile.de's location radius");

const comfortUrl = new URL(context.buildMobileDeSearchUrl({
  ...baseFilters,
  features: ["LED_HEADLIGHTS", "NAVIGATION_SYSTEM", "SOUND_SYSTEM", "HALOGEN_HEADLIGHTS", "COMFORT_SEATS", "ELECTRIC_FRONT_SEATS"],
  parkingSensors: ["FRONT_REAR_SENSORS", "FRONT_SENSORS"],
}));
assert.deepEqual(comfortUrl.searchParams.getAll("hlt"), ["LED_HEADLIGHTS"], "LED headlights use the headlight parameter");
assert.deepEqual(comfortUrl.searchParams.getAll("fe"), ["NAVIGATION_SYSTEM", "SOUND_SYSTEM", "ELECTRIC_ADJUSTABLE_SEATS"], "confirmed equipment and the broad electric-seat fallback use Mobile.de features");
assert.deepEqual(comfortUrl.searchParams.getAll("pa"), ["FRONT_SENSORS", "REAR_SENSORS"], "the combined parking choice expands without duplicates");

vm.runInContext(functionSource("recognizedEquipmentFilters"), context);
const recognized = context.recognizedEquipmentFilters({ equipment: [
  "Front and rear parking sensors", "LED headlights", "Heated rear seats", "Lumbar support", "Harman Kardon",
] });
assert.deepEqual(Array.from(recognized.parkingSensors), ["FRONT_REAR_SENSORS"], "a stated front and rear assistant becomes the combined choice");
assert.equal(recognized.features.includes("ELECTRIC_HEATED_REAR_SEATS"), true, "rear heating is recognized");
assert.equal(recognized.features.includes("ELECTRIC_HEATED_SEATS"), false, "rear heating alone does not imply front heating");
assert.equal(recognized.features.includes("MASSAGE_SEATS"), false, "an unmentioned massage feature remains unknown");
assert.equal(recognized.features.includes("HALOGEN_HEADLIGHTS"), false, "an unmentioned halogen feature remains unknown");
assert.equal(recognized.features.includes("LED_HEADLIGHTS"), true, "LED headlamps are recognized");
assert.equal(recognized.features.includes("SOUND_SYSTEM"), true, "branded premium audio is recognized");

const skylineUrl = new URL(context.buildMobileDeSearchUrl({
  ...baseFilters,
  brand: "Nissan",
  model: "Skyline",
  body: "coupe",
  priceFrom: "25000",
  priceTo: "30000",
  mileageTo: "135000",
  yearFrom: "2017",
  yearTo: "2019",
  fuel: "petrol",
  gearbox: "automatic",
  countries: ["DE"],
  features: ["PANORAMIC_GLASS_ROOF"],
  nonSmoking: true,
  roadworthy: true,
}));
assert.equal(skylineUrl.pathname, "/fahrzeuge/search.html", "verified model ID must avoid the SEO redirect route");
assert.equal(skylineUrl.searchParams.get("ms"), "18700;33;;", "Nissan Skyline must keep its Mobile.de model ID");
assert.equal(skylineUrl.searchParams.get("p"), "25000:30000", "price range must be preserved");
assert.equal(skylineUrl.searchParams.get("ml"), ":135000", "mileage limit must be preserved");
assert.equal(skylineUrl.searchParams.get("fr"), "2017:2019", "first-registration range must be preserved");
assert.equal(skylineUrl.searchParams.get("c"), "SportsCar", "body type must be preserved");
assert.deepEqual(skylineUrl.searchParams.getAll("ft"), ["PETROL"], "fuel must be preserved");
assert.equal(skylineUrl.searchParams.get("tr"), "AUTOMATIC_GEAR", "transmission must be preserved");
assert.deepEqual(skylineUrl.searchParams.getAll("cn"), ["DE"], "country must be preserved");
assert.deepEqual(skylineUrl.searchParams.getAll("fe"), ["PANORAMIC_GLASS_ROOF", "NONSMOKER_VEHICLE"], "options must be preserved");
assert.equal(skylineUrl.searchParams.get("rtd"), "true", "roadworthy state must be preserved");
assert.equal(skylineUrl.searchParams.get("rd"), null, "roadworthy must not create a location radius");
assert.equal(skylineUrl.searchParams.get("sb"), "p", "result sorting must use price");
assert.equal(skylineUrl.searchParams.get("od"), "up", "result sorting must use ascending order");
