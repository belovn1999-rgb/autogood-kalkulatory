import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileSource = await fs.readFile(path.join(repoRoot, "src/mobile.js"), "utf8");
const generatedSource = await fs.readFile(
  path.join(repoRoot, "src/mobile-model-catalog.generated.js"),
  "utf8",
);

function extractLiteral(source, name) {
  const marker = `const ${name} = `;
  const declaration = source.indexOf(marker);
  if (declaration < 0) throw new Error(`Nie znaleziono deklaracji ${name}.`);

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
  throw new Error(`Nie zamknięto deklaracji ${name}.`);
}

function equalObject(actual, expected, label) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: ${actualJson} != ${expectedJson}`);
  }
}

function requireSource(fragment, label) {
  if (!mobileSource.includes(fragment)) throw new Error(`Brak mapowania: ${label}.`);
}

function extractFunction(source, name) {
  const declaration = source.indexOf(`function ${name}(`);
  if (declaration < 0) throw new Error(`Nie znaleziono funkcji ${name}.`);
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
  throw new Error(`Nie zamknięto funkcji ${name}.`);
}

const generatedContext = { window: {} };
vm.runInNewContext(generatedSource, generatedContext);
const generatedCatalog = generatedContext.window.AUTOGOOD_MOBILE_MODEL_CATALOG;
const bmwGroups = extractLiteral(mobileSource, "modelGroupsByBrand").BMW;
const bmwModelIds = extractLiteral(mobileSource, "mobileDeBmwModelIds");
const groupsByBrand = { BMW: bmwGroups, ...generatedCatalog.groups };
const modelIdsByBrand = { BMW: bmwModelIds, ...generatedCatalog.modelIds };
const makeIds = extractLiteral(mobileSource, "mobileDeMakeIds");
const makeKeys = generatedCatalog.makeKeys || {};

equalObject(extractLiteral(mobileSource, "mobileDeFuelValues"), {
  petrol: "PETROL",
  diesel: "DIESEL",
  hybrid_diesel: "HYBRID_DIESEL",
  hybrid_petrol: "HYBRID",
  electric: "ELECTRIC",
}, "Paliwo");
equalObject(extractLiteral(mobileSource, "mobileDeBodyValues"), {
  limousine: "Limousine",
  estate: "EstateCar",
  suv: "OffRoad",
  hatchback: "SmallCar",
  coupe: "SportsCar",
  cabrio: "Cabrio",
  van_minibus: "Van",
  pickup: "OffRoad",
  other: "OtherCar",
}, "Nadwozie");
equalObject(extractLiteral(mobileSource, "mobileDeDriveValues"), {
  awd: "ALL_WHEEL",
  fwd: "FRONT",
  rwd: "REAR",
}, "Napęd");
equalObject(extractLiteral(mobileSource, "mobileDeGearboxValues"), {
  automatic: "AUTOMATIC_GEAR",
  manual: "MANUAL_GEAR",
}, "Skrzynia biegów");
equalObject(extractLiteral(mobileSource, "mobileDeSellerValues"), {
  dealer: "DEALER",
  private: "FSBO",
  company: "COMM_FSBO",
}, "Sprzedawca");
equalObject(extractLiteral(mobileSource, "mobileDeInteriorMaterialValues"), {
  alcantara: "ALCANTARA",
  cloth: "FABRIC",
  part_leather: "PARTIAL_LEATHER",
  full_leather: "LEATHER",
}, "Materiał wnętrza");
equalObject(extractLiteral(mobileSource, "mobileDeAirConditioningValues"), {
  automatic: "AUTOMATIC_CLIMATISATION",
  manual: "MANUAL_CLIMATISATION",
  automatic_2_zones: "AUTOMATIC_CLIMATISATION_2_ZONES",
  automatic_3_zones: "AUTOMATIC_CLIMATISATION_3_ZONES",
  automatic_4_zones: "AUTOMATIC_CLIMATISATION_4_ZONES",
}, "Klimatyzacja");
equalObject(extractLiteral(mobileSource, "mobileDeTrailerCouplingValues"), {
  all: "TRAILER_COUPLING_FIX",
  detachable_or_swiveling: "TRAILER_COUPLING_DETACHABLE",
  swiveling: "TRAILER_COUPLING_SWIVELING",
}, "Hak holowniczy");

const contractFragments = [
  ['params.set("lang", "en")', "język angielski"],
  ['params.set("isSearchRequest", "true")', "żądanie wyszukiwania"],
  ['params.set("s", "Car")', "klasa Car"],
  ['params.set("vc", "Car")', "typ Car"],
  ['params.set("dam", "false")', "pojazdy uszkodzone"],
  ['params.set("ms", `${makeId};${exactModelId};;${version}`)', "marka/model/wersja"],
  ['searchBaseUrl = `https://suchen.mobile.de/auto/${slug}.html`', "SEO fallback marki/modelu"],
  ['params.set("c", body)', "nadwozie"],
  ['appendMobileDeRange(params, "ml"', "przebieg"],
  ['appendMobileDeRange(params, "fr"', "rok"],
  ['appendMobileDeRange(params, "cc"', "pojemność"],
  ['appendMobileDeRange(\n    params,\n    "pw"', "moc"],
  ['filters.plugin === "yes" ? "HYBRID_PLUGIN"', "Plug-in"],
  ['params.append("ft", fuel)', "paliwo"],
  ['params.set("dt", drive)', "napęd"],
  ['params.set("tr", gearbox)', "skrzynia biegów"],
  ['params.set("vat", "1")', "VAT zwrotny"],
  ['params.set("vat", "0")', "VAT niezwrotny"],
  ['params.set("st", seller)', "sprzedawca"],
  ['params.append("cn", country)', "kraj"],
  ['params.append("it", value)', "materiał wnętrza"],
  ['params.set("clim", airConditioning)', "klimatyzacja"],
  ['params.set("tct", trailerCoupling)', "hak holowniczy"],
  ['params.append("fe", "ELECTRIC_TAILGATE")', "elektryczna klapa bagażnika"],
  ['params.append("fe", feature)', "wyposażenie"],
  ['params.append("fe", sensor)', "asystenci parkowania"],
  ['params.append("fe", filters.cruiseControl)', "tempomat"],
  ['params.append("ecol", color.toUpperCase())', "kolor nadwozia"],
  ['params.append("icol"', "kolor wnętrza"],
  ['params.append("fe", "MATTE_COLOR")', "matowy"],
  ['params.append("fe", "METALLIC")', "metallic"],
  ['params.append("fe", "NONSMOKER_VEHICLE")', "niepalący"],
  ['params.set("sb", "p")', "sortowanie po cenie"],
  ['params.set("od", "up")', "kolejność rosnąca"],
];
contractFragments.forEach(([fragment, label]) => requireSource(fragment, label));

let modelCount = 0;
for (const [brand, groups] of Object.entries(groupsByBrand)) {
  if (!makeIds[brand] && !makeKeys[brand]) throw new Error(`${brand}: brak identyfikatora marki.`);
  const models = groups.flatMap((group) => group.models);
  const uniqueModels = new Set(models);
  if (uniqueModels.size !== models.length) throw new Error(`${brand}: duplikaty modeli.`);
  const modelIds = modelIdsByBrand[brand] || {};
  const extraIds = Object.keys(modelIds).filter((model) => !uniqueModels.has(model));
  if (extraIds.length) throw new Error(`${brand}: nadmiar ID [${extraIds.join(", ")}].`);
  modelCount += models.length;
}
const catalogBrandCount = Object.keys(makeKeys).length;
if (Object.keys(groupsByBrand).length !== catalogBrandCount) {
  throw new Error(`Katalog obejmuje ${Object.keys(groupsByBrand).length}/${catalogBrandCount} marek.`);
}
if (!groupsByBrand.Mazda?.flatMap((group) => group.models).length) {
  throw new Error("Mazda: brak modeli.");
}

const seriesContext = {
  normalizeToken: (value) => String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim(),
};
vm.runInNewContext([
  extractFunction(mobileSource, "modelMenuGroupLabel"),
  extractFunction(mobileSource, "escapeModelPrefix"),
  extractFunction(mobileSource, "seriesBaseModel"),
  extractFunction(mobileSource, "withSeriesBaseModels"),
].join("\n"), seriesContext);

if (seriesContext.modelMenuGroupLabel("7 Series", "BMW") !== "7 Series") {
  throw new Error("BMW: nazwa marki nie może być powielana w nagłówku grupy modeli.");
}
if (seriesContext.modelMenuGroupLabel("Pozostałe BMW", "BMW") !== "") {
  throw new Error("Pozostałe modele: nagłówek grupy powinien pozostać ukryty.");
}

const seriesGroups = seriesContext.withSeriesBaseModels(groupsByBrand["Mercedes-Benz"]);
const bmwSeriesGroups = seriesContext.withSeriesBaseModels(groupsByBrand.BMW);
const lexusSeriesGroups = seriesContext.withSeriesBaseModels(groupsByBrand.Lexus);
const volkswagenSeriesGroups = seriesContext.withSeriesBaseModels(groupsByBrand.Volkswagen);
const miniSeriesGroups = seriesContext.withSeriesBaseModels(groupsByBrand.Mini);
const firstModel = (groups, groupName) => groups.find((group) => group.group === groupName)?.models[0];
const requiredSeries = [
  [seriesGroups, "GLC-Class", "GLC"],
  [bmwSeriesGroups, "5 Series", "5"],
  [bmwSeriesGroups, "8 Series", "8"],
  [lexusSeriesGroups, "RX Series", "RX"],
  [volkswagenSeriesGroups, "T6", "T6"],
  [miniSeriesGroups, "Aceman", "Aceman"],
];
requiredSeries.forEach(([groups, groupName, expected]) => {
  if (firstModel(groups, groupName) !== expected) {
    throw new Error(`${groupName}: oczekiwano bazowego modelu ${expected}.`);
  }
});
if (bmwSeriesGroups.find((group) => group.group === "X Series")?.models[0] === "X") {
  throw new Error("X Series: nie wolno dodawać ogólnego modelu X.");
}
if (bmwSeriesGroups.find((group) => group.group === "M Models")?.models[0] === "M") {
  throw new Error("M Models: nie wolno dodawać ogólnego modelu M.");
}
for (const [brand, groups] of Object.entries(groupsByBrand)) {
  const projectedModels = seriesContext.withSeriesBaseModels(groups).flatMap((group) => group.models);
  if (new Set(projectedModels).size !== projectedModels.length) {
    throw new Error(`${brand}: duplikat po dodaniu bazowych modeli serii.`);
  }
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.de.mobile.api+json" },
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

const brandResults = [];
if (!process.argv.includes("--offline")) {
  const makes = (await getJson("https://services.mobile.de/refdata/classes/Car/makes")).values;
  const officialKeys = new Set(makes.map((make) => make.name));
  const missingMakes = Object.entries(makeKeys)
    .filter(([, key]) => !officialKeys.has(key))
    .map(([brand]) => brand);
  const extraMakes = makes
    .filter((make) => !Object.values(makeKeys).includes(make.name))
    .map((make) => make.description);
  if (missingMakes.length || extraMakes.length) {
    throw new Error(`Niezgodne marki. Brak: [${missingMakes.join(", ")}], nadmiar: [${extraMakes.join(", ")}].`);
  }

  const mazda = makes.find((make) => make.name === "MAZDA");
  const officialMazdaModels = new Set((await getJson(`${mazda.url}/models`)).values.map((model) => model.description));
  const localMazdaModels = groupsByBrand.Mazda.flatMap((group) => group.models);
  const missingMazdaModels = [...officialMazdaModels].filter((model) => !localMazdaModels.includes(model));
  const extraMazdaModels = localMazdaModels.filter((model) => !officialMazdaModels.has(model));
  if (missingMazdaModels.length || extraMazdaModels.length) {
    throw new Error(`Mazda niezgodna. Brak: [${missingMazdaModels.join(", ")}], nadmiar: [${extraMazdaModels.join(", ")}].`);
  }
  brandResults.push(`marki ${catalogBrandCount}/${makes.length}`, `Mazda ${localMazdaModels.length}/${officialMazdaModels.size}`);
}

console.log(`OK: ${modelCount} modeli, ${Object.keys(groupsByBrand).length} marek z katalogiem.`);
console.log("OK: zapisane web-ID są zgodne; pozostałe modele używają fallbacku tekstowego.");
console.log(`OK: ${contractFragments.length} kontrakty pól i parametrów wyszukiwania.`);
if (brandResults.length) console.log(`OK refdata: ${brandResults.join("; ")}.`);
