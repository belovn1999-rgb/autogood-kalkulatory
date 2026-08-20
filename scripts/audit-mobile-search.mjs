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

const generatedContext = { window: {} };
vm.runInNewContext(generatedSource, generatedContext);
const generatedCatalog = generatedContext.window.AUTOGOOD_MOBILE_MODEL_CATALOG;
const bmwGroups = extractLiteral(mobileSource, "modelGroupsByBrand").BMW;
const bmwModelIds = extractLiteral(mobileSource, "mobileDeBmwModelIds");
const groupsByBrand = { BMW: bmwGroups, ...generatedCatalog.groups };
const modelIdsByBrand = { BMW: bmwModelIds, ...generatedCatalog.modelIds };
const makeIds = extractLiteral(mobileSource, "mobileDeMakeIds");

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

const contractFragments = [
  ['params.set("lang", "en")', "język angielski"],
  ['params.set("isSearchRequest", "true")', "żądanie wyszukiwania"],
  ['params.set("s", "Car")', "klasa Car"],
  ['params.set("vc", "Car")', "typ Car"],
  ['params.set("dam", "false")', "pojazdy uszkodzone"],
  ['params.set("ms", `${makeId};${exactModelId};;${version}`)', "marka/model/wersja"],
  ['appendMobileDeRange(params, "ml"', "przebieg"],
  ['appendMobileDeRange(params, "fr"', "rok"],
  ['appendMobileDeRange(params, "cc"', "pojemność"],
  ['appendMobileDeRange(\n    params,\n    "pw"', "moc"],
  ['filters.plugin === "yes" ? "HYBRID_PLUGIN"', "Plug-in"],
  ['params.set("vat", "1")', "VAT zwrotny"],
  ['params.set("vat", "0")', "VAT niezwrotny"],
  ['params.append("cn", country)', "kraj"],
  ['params.append("it", value)', "materiał wnętrza"],
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
  if (!makeIds[brand]) throw new Error(`${brand}: brak ID marki.`);
  const models = groups.flatMap((group) => group.models);
  const uniqueModels = new Set(models);
  if (uniqueModels.size !== models.length) throw new Error(`${brand}: duplikaty modeli.`);
  const modelIds = modelIdsByBrand[brand] || {};
  const missingIds = models.filter((model) => !modelIds[model]);
  const extraIds = Object.keys(modelIds).filter((model) => !uniqueModels.has(model));
  if (missingIds.length || extraIds.length) {
    throw new Error(
      `${brand}: brak ID [${missingIds.join(", ")}], nadmiar ID [${extraIds.join(", ")}].`,
    );
  }
  modelCount += models.length;
}
if (modelCount !== 1056) throw new Error(`Oczekiwano 1056 modeli, znaleziono ${modelCount}.`);

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
  for (const [brand, groups] of Object.entries(groupsByBrand)) {
    const make = makes.find((entry) => entry.description.toLowerCase() === brand.toLowerCase());
    if (!make) throw new Error(`${brand}: brak marki w oficjalnym refdata.`);
    const modelGroups = (await getJson(`${make.url}/modelgroups`)).values;
    const directModels = (await getJson(`${make.url}/models`)).values;
    const groupedModels = (
      await Promise.all(modelGroups.map(async (group) => (await getJson(`${group.url}/models`)).values))
    ).flat();
    const officialModels = new Set(
      [...directModels, ...groupedModels].map((entry) => entry.description),
    );
    const localModels = groups.flatMap((group) => group.models);
    const missing = localModels.filter(
      (model) => model !== "Other" && !officialModels.has(model),
    );
    if (missing.length) throw new Error(`${brand}: brak w refdata: ${missing.join(", ")}.`);
    brandResults.push(`${brand} ${localModels.length}/${officialModels.size}`);
  }
}

console.log(`OK: ${modelCount} modeli, ${Object.keys(groupsByBrand).length} marek z katalogiem.`);
console.log("OK: wszystkie modele mają lokalny web-ID mobile.de.");
console.log(`OK: ${contractFragments.length} kontrakty pól i parametrów wyszukiwania.`);
if (brandResults.length) console.log(`OK refdata: ${brandResults.join("; ")}.`);
