import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileSource = await fs.readFile(path.join(repoRoot, "src/mobile.js"), "utf8");
const marketAnalysisSource = await fs.readFile(path.join(repoRoot, "src/mobile-market-analysis.js"), "utf8");
const mobileHtml = await fs.readFile(path.join(repoRoot, "mobile.html"), "utf8");
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

function requireHtml(fragment, label) {
  if (!mobileHtml.includes(fragment)) throw new Error(`Brak kontraktu HTML: ${label}.`);
}

function requireSource(fragment, label) {
  if (!mobileSource.includes(fragment)) throw new Error(`Brak mapowania: ${label}.`);
}

function requireMarketAnalysisSource(fragment, label) {
  if (!marketAnalysisSource.includes(fragment)) throw new Error(`Brak historii wyszukiwania: ${label}.`);
}

function forbidMarketAnalysisSource(fragment, label) {
  if (marketAnalysisSource.includes(fragment)) throw new Error(`Nadmiarowa akcja historii: ${label}.`);
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
const makeKeys = generatedCatalog.makeKeys || {};

equalObject(extractLiteral(mobileSource, "mobileDeFuelValues"), {
  petrol: "PETROL",
  diesel: "DIESEL",
  hybrid_diesel: "HYBRID_DIESEL",
  hybrid_petrol: "HYBRID",
  electric: "ELECTRICITY",
}, "Paliwo");

const fuelContext = {};
vm.runInNewContext(extractFunction(mobileSource, "manualFuelValues"), fuelContext);
equalObject(fuelContext.manualFuelValues({ fuels: ["petrol", "plugin"] }), ["petrol", "plugin"], "Wielokrotny wybór paliwa");
equalObject(fuelContext.manualFuelValues({ fuel: "diesel", plugin: "yes" }), ["diesel", "plugin"], "Zapisana historia Plug-in");

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
equalObject(extractLiteral(mobileSource, "priceOptions"), [
  5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000,
  17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000,
  50000, 55000, 60000, 70000, 80000, "90000+",
], "Cena");
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
equalObject(extractLiteral(mobileSource, "mobileDeOptionParams"), {
  BI_XENON_HEADLIGHTS: "hlt",
  LASER_HEADLIGHTS: "hlt",
  ADAPTIVE_BENDING_LIGHTS: "blt",
  LED_RUNNING_LIGHTS: "drl",
  REAR_TRAFFIC_ALERT: "fe",
}, "Parametry opcji");
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
  ['return `${makeId};${modelId};;${version}`', "marka/model/wersja"],
  ['return `${makeId};;${groupId};${version}`', "marka/grupa modeli/wersja"],
  ['params.append("ms", selection)', "identyfikatory marki i modelu"],
  ['return `https://suchen.mobile.de/fahrzeuge/search.html?${params.toString()}`', "wyszukiwarka bez przekierowania SEO"],
  ['params.set("c", body)', "nadwozie"],
  ['appendMobileDeRange(params, "p"', "cena"],
  ['appendMobileDeRange(params, "ml"', "przebieg"],
  ['appendMobileDeRange(params, "fr"', "rok"],
  ['appendMobileDeRange(params, "cc"', "pojemność"],
  ['appendMobileDeRange(\n    params,\n    "pw"', "moc"],
  ['appendMobileDeRange(params, "sc"', "liczba miejsc"],
  ['manualFuelValues(filters)', "wielokrotny wybór paliwa"],
  ['params.append("fe", "HYBRID_PLUGIN")', "Plug-in"],
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
  ['params.append(mobileDeOptionParams[feature] || "fe", feature)', "wyposażenie"],
  ['params.append(mobileDeOptionParams[sensor] || "pa", sensor)', "asystenci parkowania"],
  ['params.set("spc", filters.cruiseControl)', "tempomat"],
  ['params.append("ecol", color.toUpperCase())', "kolor nadwozia"],
  ['params.append("icol"', "kolor wnętrza"],
  ['params.append("fe", "MATTE_COLOR")', "matowy"],
  ['params.append("fe", "METALLIC")', "metallic"],
  ['params.append("fe", "NONSMOKER_VEHICLE")', "niepalący"],
  ['params.set("rtd", "true")', "sprawny technicznie"],
  ['params.set("sb", "p")', "sortowanie po cenie"],
  ['params.set("od", "up")', "kolejność rosnąca"],
];
contractFragments.forEach(([fragment, label]) => requireSource(fragment, label));
requireHtml('data-mobile-feature type="checkbox" value="ELECTRIC_TAILGATE"', "elektryczna klapa bagażnika w opcjach");
requireHtml('data-mobile-options="price"', "cena od");
requireHtml('data-mobile-options="priceTo"', "cena do");
requireHtml("data-mobile-search-count-mobilede", "miejsce na liczbę ofert Mobile.de");
requireHtml('class="mobileSearchCountSaveButton"', "gwiazdka zapisania przy liczbie ofert");
requireHtml('class="mobileManualPanelHeadRow"', "reset filtrów przy nagłówku ręcznego wpisywania");
requireHtml('data-mobile-feature type="checkbox" value="ROOF_RAILS"', "relingi dachowe w opcjach");
requireHtml('data-mobile-feature type="checkbox" value="HEAD_UP_DISPLAY"', "wyświetlacz Head-up w opcjach");
requireSource('featureHeadUpDisplay: "Wyświetlacz Head-up (HUD)"', "polska etykieta HUD");
requireSource('featureHeadUpDisplay: "Проекционный дисплей (HUD)"', "rosyjska etykieta HUD");
requireHtml('data-i18n="vehicleConditionLabel"', "sekcja stanu pojazdu");
requireSource('damagedVehiclesShow: "Pokazuj"', "pokazanie uszkodzonych pojazdów");
requireSource('function selectComboOption(optionButton)', "wybór pozycji z listy");
requireSource('document.addEventListener("pointerdown", (event) => {', "wybór po pierwszym kliknięciu");
requireSource('visibleOptions.length === 1 ? visibleOptions[0] : null', "automatyczne wyróżnienie jednego wyniku");
requireSource('matchingOptions.some((option) => !option.isCurrentInput)', "pominięcie niepełnego tekstu przy rzeczywistym dopasowaniu");
requireSource('event.key === "Enter"', "wybór klawiszem Enter");
requireSource('selectComboOption(activeOption)', "zatwierdzenie wyróżnionej opcji");
requireSource('const searchUrl = buildOtomotoSearchUrl(filters);', "adres wyszukiwania Otomoto");
requireSource('window.AUTOGOOD_MOBILE_LOG_SEARCH?.(searchUrl);', "zapis wyszukiwania rynku w historii");
requireMarketAnalysisSource('function logSearchToHistory(searchUrl = "")', "przekazanie adresu wybranego rynku");
requireMarketAnalysisSource('if (entry.searchUrl) return entry.searchUrl;', "otwieranie zapisanego rynku");
requireMarketAnalysisSource("data-mobile-market-history-select", "wybór wpisu historii");
requireMarketAnalysisSource("function selectHistoryEntry(historyId)", "wczytanie filtrów wybranego wpisu");
requireMarketAnalysisSource("function clearHistorySelection()", "wyczyszczenie filtrów po odznaczeniu wpisu");
requireMarketAnalysisSource('data-mobile-market-history-pin="${escapeMarketHtml(entry.id)}"', "usunięcie z zapisanych");
requireMarketAnalysisSource('aria-pressed="${entry.pinned ? "true" : "false"}"', "stan ikony zapisania");
requireMarketAnalysisSource('data-mobile-market-history-delete="${escapeMarketHtml(entry.id)}"', "usunięcie wpisu");
forbidMarketAnalysisSource('data-mobile-market-history-edit="${escapeMarketHtml(entry.id)}"', "osobna akcja edycji wpisu");
forbidMarketAnalysisSource('data-mobile-market-history-analysis="${escapeMarketHtml(entry.id)}"', "analiza rynku w wierszu historii");
forbidMarketAnalysisSource('<a href="${escapeMarketHtml(searchUrl)}" target="_blank"', "otwieranie listy w wierszu historii");
forbidMarketAnalysisSource("window.confirm(c.historyDeleteConfirm)", "potwierdzenie usunięcia wpisu");
forbidMarketAnalysisSource("setAnalysisStatus(c.historyDeleteSuccess)", "komunikat po usunięciu wpisu");

let modelCount = 0;
for (const [brand, groups] of Object.entries(groupsByBrand)) {
  if (!/^\d+$/.test(generatedCatalog.mobileDeMakeIds?.[brand] || "")) {
    throw new Error(`${brand}: brak numerycznego ID marki Mobile.de.`);
  }
  const models = groups.flatMap((group) => group.models);
  const uniqueModels = new Set(models);
  if (uniqueModels.size !== models.length) throw new Error(`${brand}: duplikaty modeli.`);
  const modelIds = modelIdsByBrand[brand] || {};
  const extraIds = Object.keys(modelIds).filter((model) => !uniqueModels.has(model));
  if (extraIds.length) throw new Error(`${brand}: nadmiar ID [${extraIds.join(", ")}].`);
  // Without a numeric model ID the search falls back to text and may miss listings.
  const missingIds = [...uniqueModels].filter((model) => !modelIds[model]);
  if (missingIds.length) throw new Error(`${brand}: brak ID Mobile.de [${missingIds.join(", ")}].`);
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
console.log("OK: każda marka i każdy model ma numeryczne ID Mobile.de.");
console.log(`OK: ${contractFragments.length} kontrakty pól i parametrów wyszukiwania.`);
if (brandResults.length) console.log(`OK refdata: ${brandResults.join("; ")}.`);
