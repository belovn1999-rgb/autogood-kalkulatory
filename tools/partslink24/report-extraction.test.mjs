import test from "node:test";
import assert from "node:assert/strict";
import {
  extractVehicleInfoFromText,
  formatProductionDate
} from "./report-extraction.mjs";

test("BMW uses the market name and decodes its engine code", () => {
  const result = extractVehicleInfoFromText(`
Nr nadwozia                      WBA31AA0905V40977
Oznaczenie modelu                X1 F48 LCI
Data produkcji                   22.04.2022
Nazwa handlowa specyficzna dla   X1 sDrive18i
Kod silnika                      B38A15M1
Pojemność skokowa                1,50
`, { brand: "BMW", language: "PL" });

  assert.deepEqual(result, {
    model: "X1 sDrive18i",
    productionDate: "22.04.2022",
    engineType: "Бензин",
    engineVolume: "1,50 л"
  });
});

test("Mercedes fields are equivalent in RU, PL and ENG reports", () => {
  const reports = [
    ["RU", `Торговое наименование              C 300 e универсал\nДата поставки                      16.10.2023\nM20         РАБОЧИЙ ОБЪЁМ 2,0 ЛИТРА\nM254        ДВИГАТЕЛЬ С ИСКРОВЫМ ЗАЖИГАНИЕМ\nME10        ГИБРИДНЫЙ АВТОМОБИЛЬ (ПОДКЛЮЧАЕМЫЙ, PHEV)`],
    ["PL", `oznaczenie handlowe               C 300 e Kombi\nData dostawy                      16.10.2023\nM20         POJEMNOŚĆ SKOKOWA 2,0 L\nM254        SILNIK BENZYNOWY\nME10        POJAZD HYBRYDOWY (PLUG-IN, PHEV)`],
    ["ENG", `Trade designation                 C 300 e Estate\nDelivery date                     16.10.2023\nM20         Engine displacement 2.0 L\nM254        Gasoline engine\nME10        Plug-in hybrid vehicle (PHEV)`]
  ];

  for (const [language, text] of reports) {
    const result = extractVehicleInfoFromText(text, { brand: "Mercedes-Benz", language });
    assert.equal(result.productionDate, "16.10.2023 (дата поставки)");
    assert.equal(result.engineType, "Бензин + Plug-in Гибрид");
    assert.match(result.engineVolume, /^2[,.]0 л$/);
  }
});

test("PSA reports derive dates from alphanumeric DAM and read the engine row", () => {
  const result = extractVehicleInfoFromText(`
Модель                                 C5 AIRCROSS (C84)
DAM                                    16403CJ
ДВИГАТЕЛЬ                              DV5RC/UE63 1.5 L DIESEL
`, { brand: "Citroen", language: "RU" });

  assert.deepEqual(result, {
    model: "C5 AIRCROSS (C84)",
    productionDate: "05.10.2021",
    engineType: "Дизель",
    engineVolume: "1.5 л"
  });
});

test("Peugeot reads engine volume from the translated power row", () => {
  const latinUnitResult = extractVehicleInfoFromText(`
МОДЕЛЬНЫЙ РЯД                           3008 (P84E)
DAM                                      15320CJ
МОЩНОСТЬ                                1600 CM3
МОЩНОСТЬ СОПРОТИВЛЕНИЯ CTP              БЕЗ МОЩНОСТИ СОПРОТИВЛЕНИЯ CTP
ОРИГИНАЛЬНАЯ БАЗА ДВИГАТЕЛЯ             БАЗА ДВИГАТЕЛЯ EP6FADT
`, { brand: "Peugeot", language: "RU" });
  const cyrillicUnitResult = extractVehicleInfoFromText("МОЩНОСТЬ    1500 СМ3", { brand: "Peugeot", language: "RU" });

  assert.equal(latinUnitResult.engineVolume, "1600 cm3");
  assert.equal(cyrillicUnitResult.engineVolume, "1500 cm3");
});

test("Stellantis reports use transmission data as hybrid evidence", () => {
  const reports = [
    ["RU", `ДВИГАТЕЛЬ          EP6FADTXHPD UE64 1,6 Л БЕНЗИН
КОРОБКА ПЕРЕДАЧ     4X2 8-СТУП. АКП, ГИБРИДНЫЙ ПРИВОД`],
    ["PL", `SILNIK                 EP6FADTXHPD UE64, 1,6 L, BENZYNA
PRZENIESIENIE NAPĘDU   4X2 AUTOMATYCZNA 8 BIEGOWA HYBRYDA`],
    ["ENG", `ENGINE                 EP6FADTXHPD UE64, 1.6 L, GASOLINE
TRANSMISSION           4X2 8-SPEED AUTOMATIC HYBRID DRIVE`]
  ];

  for (const [language, text] of reports) {
    const result = extractVehicleInfoFromText(text, { brand: "DS", language });
    assert.equal(result.engineType, "Обычный гибрид");
  }

  const diesel = extractVehicleInfoFromText(`
ДВИГАТЕЛЬ          DV5RC/UE63 1.5L ДИЗЕЛЬ
КОРОБКА ПЕРЕДАЧ     АКП 8 СТУП. ТИПА STT
`, { brand: "DS", language: "RU" });
  assert.equal(diesel.engineType, "Дизель");
});

test("VAG reports separate model, powertrain type and engine volume", () => {
  const phev = extractVehicleInfoFromText(`
Модель                             Audi A7 Sportback гибр. PHEV 2,0 A7
Альтернативная система привода     Гибридная системы привода PHEV
Топливные системы                  Непосредственный впрыск бенз. двигателя (FSI)
Спецификации двигателей            4 цил. бенз. двигатель 2,0 л/185 кВт гибрид
`, { brand: "Audi", language: "RU" });
  assert.equal(phev.model, "A7 Sportback");
  assert.equal(phev.engineType, "PHEV");
  assert.equal(phev.engineVolume, "2,0 л");

  const electric = extractVehicleInfoFromText(`
Модель                             Audi e-tron ETRSP
Спецификации двигателей            Электродвигатель, общая мощность 230 кВт
`, { brand: "Audi", language: "RU" });
  assert.equal(electric.model, "e-tron");
  assert.equal(electric.engineType, "Электрический");
  assert.equal(electric.engineVolume, "");

  const sharedModels = [
    ["Volkswagen", "Passat Variant BlueMotion Technology PA", "Passat Variant BlueMotion Technology"],
    ["Seat", "Ateca Xperience AT", "Ateca Xperience"],
    ["Skoda", "Octavia Combi TDI OCT", "Octavia Combi"],
    ["Cupra", "Formentor TSI CUPRA FOR", "Formentor"]
  ];
  for (const [brand, model, expected] of sharedModels) {
    assert.equal(extractVehicleInfoFromText(`Model  ${model}`, { brand, language: "ENG" }).model, expected);
  }
});

test("Hyundai HEV is not reduced to gasoline", () => {
  const result = extractVehicleInfoFromText(`
model               SANTA FE HYBRID 20
Date of production  2020-10-28
ENGINE CAPACITY     1600 CC - GAMMA-II
FUEL TYPE           GASOLINE - UNLEADED
SPECIAL CAR         ELECTRIC VEHICLE - HEV(HYBRID ELECTRIC VEHICLE)
`, { brand: "Hyundai", language: "ENG" });

  assert.equal(result.engineType, "Обычный гибрид");
  assert.equal(result.engineVolume, "1600 cm3");
});

test("Ford Pro reuses Ford fields in a translated report", () => {
  const result = extractVehicleInfoFromText(`
Дата производства         21.01.19
Модельный ряд             Transit/Tourneo Custom 2012
Engine Type               2.0 EcoBlue B
`, { brand: "Ford Pro", language: "RU" });

  assert.deepEqual(result, {
    model: "Transit/Tourneo Custom 2012",
    productionDate: "21.01.2019",
    engineType: "Дизель",
    engineVolume: "2.0 л"
  });
});

test("Volvo returns model, production week, fuel and volume", () => {
  const result = extractVehicleInfoFromText(`
Модельный год                          2023
Модель                                 V60 Cross Country (19-)
Производственная неделя                202237
Двигатель                              DK5KERS / D420T8
CF3C        ENGINE VED4 HP 2.0L 197/420
CG02        FUEL Diesel
`, { brand: "Volvo", language: "RU" });

  assert.deepEqual(result, {
    model: "V60 Cross Country (19-)",
    productionDate: "37 неделя 2022 года",
    engineType: "Дизель",
    engineVolume: "2.0 л"
  });
});

test("brand engine-code fallbacks cover Toyota, Nissan and Suzuki", () => {
  const toyota = extractVehicleInfoFromText("ENGINE 1      1800CC 16-VALVE DOHC EFI (2ZRFXE)", { brand: "Toyota", language: "ENG" });
  const nissan = extractVehicleInfoFromText("Od       2019-09\nSilnik   K9K TYPE ENGINE", { brand: "Nissan", language: "PL" });
  const suzuki = extractVehicleInfoFromText("Data produkcji   2016-10\nNr silnika   K12C-5104637", { brand: "Suzuki", language: "PL" });

  assert.equal(toyota.engineType, "Обычный гибрид");
  assert.equal(toyota.engineVolume, "1800 cm3");
  assert.equal(nissan.productionDate, "09.2019");
  assert.equal(nissan.engineType, "Дизель");
  assert.equal(nissan.engineVolume, "1461 cm3");
  assert.equal(suzuki.productionDate, "10.2016");
  assert.equal(suzuki.engineType, "Бензин");
});

test("translated and shortened dates are normalized", () => {
  assert.equal(formatProductionDate("21 нояб. 2023?г.", "RU"), "21.11.2023");
  assert.equal(formatProductionDate("Nov 21, 2023", "ENG"), "21.11.2023");
  assert.equal(formatProductionDate("1/10/14", "ENG", "YY-MM-DD"), "10.01.2014");
  assert.equal(formatProductionDate("23-03-31", "PL", "YY-MM-DD"), "31.03.2023");
});
