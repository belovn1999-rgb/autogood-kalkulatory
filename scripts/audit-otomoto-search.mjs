import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileSource = await fs.readFile(path.join(repoRoot, "src/mobile.js"), "utf8");
const mobileHtml = await fs.readFile(path.join(repoRoot, "mobile.html"), "utf8");
const mobileCatalogSource = await fs.readFile(path.join(repoRoot, "src/mobile-model-catalog.generated.js"), "utf8");
const otomotoCatalogSource = await fs.readFile(path.join(repoRoot, "src/otomoto-catalog.generated.js"), "utf8");

function extractLiteral(source, name) {
  const marker = `const ${name} = `;
  const declaration = source.indexOf(marker);
  if (declaration < 0) throw new Error(`Missing ${name}.`);
  const start = declaration + marker.length;
  const open = source[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === open) depth += 1;
    else if (character === close && --depth === 0) {
      return vm.runInNewContext(`(${source.slice(start, index + 1)})`);
    }
  }
  throw new Error(`Unclosed ${name}.`);
}

function extractFunction(source, name) {
  const declaration = source.indexOf(`function ${name}(`);
  if (declaration < 0) throw new Error(`Missing function ${name}.`);
  const start = source.indexOf("{", declaration);
  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    else if (character === "}" && --depth === 0) return source.slice(declaration, index + 1);
  }
  throw new Error(`Unclosed function ${name}.`);
}

const literalNames = [
  "otomotoMakeAliases",
  "otomotoModelAliases",
  "otomotoFuelValues",
  "otomotoBodyValues",
  "otomotoDriveValues",
  "otomotoGearboxValues",
  "otomotoSellerValues",
  "otomotoInteriorMaterialValues",
  "otomotoAirConditioningValues",
  "otomotoCountryOriginValues",
  "otomotoExteriorColorValues",
  "otomotoFeatureFilters",
  "otomotoParkingFilters",
];
const context = {
  URLSearchParams,
  copy: { pl: { marketSearchInvalidRange: "invalid range", marketSearchChooseBrand: "choose brand" } },
  state: { lang: "pl" },
  window: {
    AUTOGOOD_OTOMOTO_CATALOG: vm.runInNewContext(
      `(${otomotoCatalogSource.slice(otomotoCatalogSource.indexOf("=") + 1, otomotoCatalogSource.lastIndexOf(";")).trim()})`,
    ),
  },
};
literalNames.forEach((name) => {
  context[name] = extractLiteral(mobileSource, name);
});
vm.createContext(context);
[
  "manualFuelValues",
  "compactNumber",
  "mobileDeNumber",
  "otomotoSlug",
  "otomotoMakeSelection",
  "validatedOtomotoModel",
  "otomotoModelToken",
  "matchedOtomotoModels",
  "otomotoModelSelection",
  "appendOtomotoValues",
  "appendOtomotoRange",
  "buildOtomotoSearchUrl",
].forEach((name) => vm.runInContext(extractFunction(mobileSource, name), context));

const filters = {
  brand: "BMW",
  model: "X3",
  version: "",
  fuels: ["diesel", "hybrid_petrol", "plugin"],
  fuel: "diesel",
  plugin: "yes",
  body: "suv",
  mileageFrom: "10000",
  mileageTo: "100000",
  yearFrom: "2020",
  yearTo: "2023",
  displacementFrom: "1800",
  displacementTo: "2000",
  powerFrom: "150",
  powerTo: "250",
  seatsFrom: "5",
  seatsTo: "7",
  drive: "awd",
  gearbox: "automatic",
  vat: "reclaimable",
  seller: "dealer",
  countries: ["DE", "BE"],
  interiorMaterials: ["alcantara", "full_leather"],
  airConditioning: "automatic_2_zones",
  trailerCoupling: "swiveling",
  features: [
    "PANORAMIC_GLASS_ROOF",
    "AIR_SUSPENSION",
    "LASER_HEADLIGHTS",
    "ELECTRIC_HEATED_SEATS",
    "CARPLAY",
    "ROOF_RAILS",
  ],
  parkingSensors: ["CAM_360_DEGREES", "FRONT_SENSORS", "REAR_TRAFFIC_ALERT"],
  cruiseControl: "ADAPTIVE_CRUISE_CONTROL",
  exteriorColors: ["black", "blue"],
  interiorColors: ["black"],
  matte: true,
  metallic: true,
  nonSmoking: true,
  roadworthy: true,
  damagedVehicles: "hide",
};

const url = new URL(context.buildOtomotoSearchUrl(filters));
if (url.origin !== "https://www.otomoto.pl" || url.pathname !== "/osobowe/bmw") {
  throw new Error(`Unexpected Otomoto path: ${url.href}`);
}
const expectedScalars = {
  "search[filter_enum_body_type]": "suv",
  "search[filter_float_mileage:from]": "10000",
  "search[filter_float_mileage:to]": "100000",
  "search[filter_float_year:from]": "2020",
  "search[filter_float_year:to]": "2023",
  "search[filter_float_engine_capacity:from]": "1800",
  "search[filter_float_engine_capacity:to]": "2000",
  "search[filter_float_engine_power:from]": "150",
  "search[filter_float_engine_power:to]": "250",
  "search[filter_float_nr_seats:from]": "5",
  "search[filter_float_nr_seats:to]": "7",
  "search[filter_enum_gearbox]": "automatic",
  "search[filter_enum_vat]": "1",
  "search[private_business]": "business",
  "search[filter_enum_air_conditioning_type]": "dualzone-automatic-climate-control",
  "search[filter_enum_towbar]": "1",
  "search[filter_enum_sunroof]": "glass-sunroof-fixed",
  "search[filter_enum_air_suspension]": "1",
  "search[filter_enum_headlight_lamp_type]": "laser-head-lamps",
  "search[filter_enum_heated_seat_driver]": "1",
  "search[filter_enum_heated_seat_passenger]": "1",
  "search[filter_enum_apple_carplay]": "1",
  "search[filter_enum_360_view_camera]": "1",
  "search[filter_enum_park_distance_control_front]": "1",
  "search[filter_enum_damaged]": "0",
  "search[order]": "filter_float_price:asc",
};
Object.entries(expectedScalars).forEach(([key, value]) => {
  if (url.searchParams.get(key) !== value) throw new Error(`${key}: expected ${value}.`);
});
if (url.searchParams.get("search[filter_enum_model]") !== "x3") {
  throw new Error("BMW X3 model was not mapped.");
}

const expectedMultiValues = {
  filter_enum_fuel_type: ["diesel", "hybrid", "plugin-hybrid"],
  filter_enum_transmission: ["all-wheel-auto", "all-wheel-lock", "all-wheel-permanent"],
  filter_enum_country_origin: ["d", "b"],
  filter_enum_upholstery_type: ["alcantara-upholstery", "leather-upholstery"],
  filter_enum_cruisecontrol_type: ["adaptive-cruise-control", "adaptive-cruise-control-predictive"],
  filter_enum_color: ["black", "blue"],
  filter_enum_colour_type: ["matt", "metallic"],
};
Object.entries(expectedMultiValues).forEach(([filterId, values]) => {
  values.forEach((value, index) => {
    const key = `search[${filterId}][${index}]`;
    if (url.searchParams.get(key) !== value) throw new Error(`${key}: expected ${value}.`);
  });
});

for (const unsupported of ["ROOF_RAILS", "REAR_TRAFFIC_ALERT"]) {
  if (url.href.includes(unsupported)) throw new Error(`${unsupported} must not leak into the Otomoto URL.`);
}
if (!context.buildOtomotoSearchUrl({ ...filters, model: "520" }).includes("search%5Bfilter_enum_model%5D=seria-5")) {
  throw new Error("BMW 520 must open the broad Otomoto Seria 5 model.");
}
if (!context.buildOtomotoSearchUrl({ ...filters, brand: "Mercedes-Benz", model: "GLC 200" }).includes("search%5Bfilter_enum_model%5D=glc")) {
  throw new Error("Mercedes-Benz GLC 200 must open the broad Otomoto GLC model.");
}
if (context.otomotoModelSelection("Abarth", "595 Competizione").unsupported) {
  throw new Error("Abarth 595 Competizione must map to the broader Otomoto 595 model.");
}
const audiA4 = context.otomotoModelSelection("Audi", "A4");
if (audiA4.unsupported || !audiA4.slugs.includes("a4-avant") || !audiA4.slugs.includes("a4-limousine")) {
  throw new Error("Audi A4 must cover Otomoto body variants.");
}
if (!context.otomotoModelSelection("Aston Martin", "AR1").unsupported) {
  throw new Error("An Otomoto-incompatible model must be reported instead of silently ignored.");
}

const mobileCatalogContext = { window: {} };
vm.createContext(mobileCatalogContext);
vm.runInContext(mobileCatalogSource, mobileCatalogContext);
let availableModels = 0;
let mappedModels = 0;
Object.entries(mobileCatalogContext.window.AUTOGOOD_MOBILE_MODEL_CATALOG.groups).forEach(([brand, groups]) => {
  if (context.otomotoMakeSelection(brand).unsupported) return;
  groups.forEach((group) => group.models.forEach((model) => {
    if (model === "Other") return;
    availableModels += 1;
    if (!context.otomotoModelSelection(brand, model).unsupported) mappedModels += 1;
  }));
});
const mappedModelRatio = mappedModels / availableModels;
if (mappedModelRatio < 0.8) {
  throw new Error(`Only ${(mappedModelRatio * 100).toFixed(1)}% of compatible Mobile.de models are mapped.`);
}
if (!mobileHtml.includes("data-mobile-otomoto-search")) throw new Error("Missing Otomoto search button.");
if (!mobileHtml.includes("Szukaj na otomoto.pl")) throw new Error("Missing Polish Otomoto label.");

const mappedOrReportedFields = [
  "brand", "model", "version", "fuels", "fuel", "plugin", "body", "mileageFrom", "mileageTo",
  "yearFrom", "yearTo", "displacementFrom", "displacementTo", "powerFrom", "powerTo", "seatsFrom",
  "seatsTo", "drive", "gearbox", "vat", "seller", "countries", "interiorMaterials", "airConditioning",
  "trailerCoupling", "features", "parkingSensors", "cruiseControl", "exteriorColors", "interiorColors",
  "matte", "metallic", "nonSmoking", "roadworthy", "damagedVehicles",
];
const readFieldsSource = extractFunction(mobileSource, "readManualFields");
mappedOrReportedFields.forEach((field) => {
  if (!readFieldsSource.includes(`${field}:`)) throw new Error(`Manual field missing from audit: ${field}.`);
  if (!mobileSource.includes(`filters.${field}`) && !["fuel", "plugin"].includes(field)) {
    throw new Error(`Otomoto mapping/report missing for manual field: ${field}.`);
  }
});

console.log(
  `Otomoto search audit passed: full form contract, ascending-price URL and ${mappedModels}/${availableModels} compatible models verified.`,
);
