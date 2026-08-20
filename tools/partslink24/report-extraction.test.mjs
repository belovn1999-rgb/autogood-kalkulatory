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
    engineVolume: "1500 cm³"
  });
});

test("BMW market names determine d, e and i powertrains and retain MHEV evidence", () => {
  const reports = [
    ["320dA Touring", "", "Дизель"],
    ["330e Touring", "", "Бензин + PHEV (подключаемый гибрид)"],
    ["320i Limousine", "", "Бензин"],
    ["i4 eDrive40", "", "Электрический"],
    ["M340d xDrive Touring", "48 V MHEV mild hybrid system", "Дизель + MHEV (мягкий гибрид)"],
    ["318d Touring", "S1CEA Рекуперационная система", "Дизель + MHEV (мягкий гибрид)"]
  ];

  for (const [marketName, extraEvidence, engineType] of reports) {
    const result = extractVehicleInfoFromText(`
Специфическое для рынка торговое наименование   ${marketName}
${extraEvidence}
`, { brand: "BMW", language: "RU" });
    assert.equal(result.engineType, engineType);
  }

  const invalidVolume = extractVehicleInfoFromText(`
Специфическое для рынка торговое наименование   320dA Touring
Рабочий объем   0,00
Двигатель          XD5O 5,50
`, { brand: "BMW", language: "RU" });
  assert.equal(invalidVolume.engineVolume, "2000 cm³");

  const inferredVolumes = [
    ["X1 sDrive18i", "1500 cm³"],
    ["330d xDrive Touring", "3000 cm³"],
    ["330e Touring", "2000 cm³"],
    ["X5 xDrive45e", "3000 cm³"],
    ["i4 eDrive40", ""]
  ];
  for (const [marketName, engineVolume] of inferredVolumes) {
    const result = extractVehicleInfoFromText(`Специфическое для рынка торговое наименование   ${marketName}`, { brand: "BMW", language: "RU" });
    assert.equal(result.engineVolume, engineVolume);
  }
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
    assert.equal(result.engineType, "Бензин + PHEV (подключаемый гибрид)");
    assert.equal(result.engineVolume, "2000 cm³");
  }
});

test("Mercedes scans the full report for plug-in evidence after a diesel engine row", () => {
  const reports = [
    ["RU", `Тип двигателя                    Дизель
M654         ДИЗЕЛЬНЫЙ ДВИГАТЕЛЬ R4 OM654
ME05         ГИБРИДНЫЙ ПРИВОД (МОДИФИКАЦИЯ 85 КВТ - 94 КВТ),
             ПОДКЛЮЧАЕМЫЙ`],
    ["PL", `Rodzaj silnika                   Diesel
M654         SILNIK WYSOKOPRĘŻNY R4 OM654
ME05         NAPĘD HYBRYDOWY (WARIANT 85 KW - 94 KW),
             PLUG-IN`],
    ["ENG", `Engine type                     Diesel
M654         R4 DIESEL ENGINE OM654
ME05         HYBRID DRIVE (85 KW - 94 KW VARIANT),
             PLUG-IN`]
  ];

  for (const [language, text] of reports) {
    const result = extractVehicleInfoFromText(text, { brand: "Mercedes-Benz", language });
    assert.equal(result.engineType, "Дизель + PHEV (подключаемый гибрид)", language);
  }
});

test("all Mercedes catalogs use delivery date as the displayed date", () => {
  const brands = ["Mercedes-Benz", "Mercedes Classic", "Mercedes Trucks", "Mercedes Unimog", "Mercedes Vans"];
  const reports = [
    ["RU", "Дата поставки 15.02.2022"],
    ["PL", "Data dostawy 15.02.2022"],
    ["ENG", "Delivery date 15.02.2022"]
  ];

  for (const brand of brands) {
    for (const [language, text] of reports) {
      const result = extractVehicleInfoFromText(text, { brand, language });
      assert.equal(result.productionDate, "15.02.2022 (дата поставки)", `${brand} ${language}`);
    }
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
    engineVolume: "1500 cm³"
  });
});

test("Stellantis reads a separate fuel row and infers the 1KR displacement", () => {
  const citroen = extractVehicleInfoFromText(`
Модель                                  C1
DAM                                     13071UT
ДВИГАТЕЛЬ                               1KR EURO5 INJECTION
ТОПЛИВО                                 UNLEADED PETROL 95 QUALITY A/B/E/E+
`, { brand: "Citroen", language: "RU" });

  assert.deepEqual(citroen, {
    model: "C1",
    productionDate: "21.08.2012",
    engineType: "Бензин",
    engineVolume: "998 cm³"
  });

  const fuelRows = [
    ["RU", "ТОПЛИВО", "НЕЭТИЛИРОВАННЫЙ БЕНЗИН"],
    ["PL", "PALIWO", "BENZYNA BEZOŁOWIOWA"],
    ["ENG", "FUEL", "UNLEADED PETROL"]
  ];
  const brands = [
    "Abarth", "Alfa Romeo", "Citroen", "DS", "Fiat", "Fiat Professional", "Jeep", "Lancia",
    "Opel", "Opel Legacy", "Peugeot", "Vauxhall", "Vauxhall Legacy"
  ];

  for (const brand of brands) {
    for (const [language, label, value] of fuelRows) {
      const result = extractVehicleInfoFromText(`${label}    ${value}`, { brand, language });
      assert.equal(result.engineType, "Бензин", `${brand} ${language}`);
    }
  }
});

test("Alfa Romeo uses the commercial model row and FCA cylinder capacity", () => {
  const result = extractVehicleInfoFromText(`
Nr nadwozia               ZAR94000007103616
model                     191C56001000 (X7)
Podanie modelu            GIULIETTA 1.6 JTD 105CV CM 6M DISTINCTIVE
Data produkcji            09/07/2011
CC              1.6      POJ. CYLINDRÓW = 1.6
CMB             DS       PALIWO = DIESEL
`, { brand: "Alfa Romeo", language: "PL" });

  assert.deepEqual(result, {
    model: "GIULIETTA 1.6 JTD 105CV CM 6M DISTINCTIVE",
    productionDate: "09.07.2011",
    engineType: "Дизель",
    engineVolume: "1600 cm³"
  });
});

test("Jeep reads cylinder capacity from the dedicated CC row, not horsepower", () => {
  const result = extractVehicleInfoFromText(`
Model                           609322101000 (5I)
Date of production              30/01/2016
CMB                             BZ  PALIWO = BENZYNA
CC                              1.4  ŁOŚ ZWYKŁA (KOMERCYJNA) = 135 L.S.
`, { brand: "Jeep", language: "RU" });

  assert.equal(result.engineType, "Бензин");
  assert.equal(result.engineVolume, "1400 cm³");
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

  assert.equal(latinUnitResult.engineVolume, "1600 cm³");
  assert.equal(cyrillicUnitResult.engineVolume, "1500 cm³");
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
    assert.equal(result.engineType, "HEV (обычный гибрид)");
  }

  const diesel = extractVehicleInfoFromText(`
ДВИГАТЕЛЬ          DV5RC/UE63 1.5L ДИЗЕЛЬ
КОРОБКА ПЕРЕДАЧ     АКП 8 СТУП. ТИПА STT
`, { brand: "DS", language: "RU" });
  assert.equal(diesel.engineType, "Дизель");
});

test("all Stellantis reports upgrade a generic hybrid to plug-in from full-report evidence", () => {
  const reports = [
    ["RU", `ДВИГАТЕЛЬ              EP6FADTXHP 1.6L PETROL
КОРОБКА ПЕРЕДАЧ       4X2 8-SPEED AUTOMATIC HYBRID
СИЛОВОЙ АГРЕГАТ       PHEV DRIVE TRAIN`],
    ["PL", `SILNIK                 EP6FADTXHP 1.6L PETROL
SKRZYNIA BIEGÓW        4X2 8-SPEED AUTOMATIC HYBRID
UKŁAD NAPĘDOWY         PHEV DRIVE TRAIN`],
    ["ENG", `ENGINE                 EP6FADTXHP 1.6L PETROL
TRANSMISSION           4X2 8-SPEED AUTOMATIC HYBRID
POWER TRAIN            PHEV DRIVE TRAIN`]
  ];
  const brands = [
    "Abarth", "Alfa Romeo", "Citroen", "DS", "Fiat", "Fiat Professional", "Jeep", "Lancia",
    "Opel", "Opel Legacy", "Peugeot", "Vauxhall", "Vauxhall Legacy"
  ];

  for (const brand of brands) {
    for (const [language, text] of reports) {
      const result = extractVehicleInfoFromText(text, { brand, language });
      assert.equal(result.engineType, "Бензин + PHEV (подключаемый гибрид)", `${brand} ${language}`);
    }
  }
});

test("all Stellantis reports treat T2 charging and E-TENSE as plug-in evidence for combustion engines", () => {
  const reports = [
    ["RU", `ДВИГАТЕЛЬ                         EP6FADTXHPD UE64 1,6 Л БЕНЗИН
КОРОБКА ПЕРЕДАЧ                  4X2 8-СТУП. АКП, ГИБРИДНЫЙ ПРИВОД
БЫТОВАЯ СЕТЬ РЕЖИМ 3             РАЗЪЕМ T2 WALLBOX
РАЗЪЕМ ЗАРЯДКИ АВТОМОБИЛЯ        РАЗЪЕМ ЗАРЯДКИ АВТОМОБИЛЯ T2
ЭМБЛЕМЫ                          E-TENSE`],
    ["PL", `SILNIK                            EP6FADTXHPD UE64 1,6 L BENZYNA
SKRZYNIA BIEGÓW                   4X2 AUTOMATYCZNA 8 BIEGOWA HYBRYDA
GNIAZDO ŁADOWANIA POJAZDU         GNIAZDO ŁADOWANIA POJAZDU T2
EMBLEMATY                         E-TENSE`],
    ["ENG", `ENGINE                            EP6FADTXHPD UE64 1.6 L PETROL
TRANSMISSION                      4X2 8-SPEED AUTOMATIC HYBRID DRIVE
VEHICLE CHARGING SOCKET           VEHICLE CHARGING SOCKET T2
BADGES                            E-TENSE`]
  ];
  const brands = [
    "Abarth", "Alfa Romeo", "Citroen", "DS", "Fiat", "Fiat Professional", "Jeep", "Lancia",
    "Opel", "Opel Legacy", "Peugeot", "Vauxhall", "Vauxhall Legacy"
  ];

  for (const brand of brands) {
    for (const [language, text] of reports) {
      const result = extractVehicleInfoFromText(text, { brand, language });
      assert.equal(result.engineType, "Бензин + PHEV (подключаемый гибрид)", `${brand} ${language}`);
    }
  }
});

test("all Stellantis reports ignore explicitly absent charging equipment", () => {
  const text = `ДВИГАТЕЛЬ                              DV5RC UE64 1,5 Л ДИЗЕЛЬ
КОРОБКА ПЕРЕДАЧ                        АКП 8 СТУП. ТИПА STT
БЫТОВАЯ СЕТЬ РЕЖИМ 3                   БЕЗ РАЗЪЕМА БЫТОВОЙ СЕТИ
ВАРИАНТ, СВЯЗАННЫЙ С БОРТОВЫМ          БЕЗ УСТАНОВЛЕННОГО ЗАРЯДНОГО УСТРОЙСТВА
ЗАРЯДНЫМ УСТРОЙСТВОМ
РАЗЪЕМ ЗАРЯДКИ АВТОМОБИЛЯ              БЕЗ РАЗЪЕМА ЗАРЯДКИ АВТОМОБИЛЯ
ШТЕПСЕЛЬНЫЙ РАЗЪЕМ ДЛЯ ЗАРЯДКИ          БЕЗ ДАТЧИКА ЗАГРУЗКИ АВТОМОБИЛЯ
ЭМБЛЕМЫ                                E-TENSE`;
  const brands = [
    "Abarth", "Alfa Romeo", "Citroen", "DS", "Fiat", "Fiat Professional", "Jeep", "Lancia",
    "Opel", "Opel Legacy", "Peugeot", "Vauxhall", "Vauxhall Legacy"
  ];

  for (const brand of brands) {
    const result = extractVehicleInfoFromText(text, { brand, language: "RU" });
    assert.equal(result.engineType, "Дизель", brand);
  }
});

test("all Stellantis reports recognize BSG and H:DRIVE as mild-hybrid evidence", () => {
  const reports = [
    ["RU", `ДВИГАТЕЛЬ                    1,0 Л БЕНЗИН
ELT BSG12                       ТИП ЭЛЕКТРИФИКАЦИИ = BELT STARTER GENERATOR 12V
ЭМБЛЕМЫ                         BADGE H:DRIVE`],
    ["PL", `SILNIK                        1,0 L BENZYNA
ELT BSG12                       TYP ELEKTRYFIKACJI = BELT STARTER GENERATOR 12V
EMBLEMATY                       BADGE H:DRIVE`],
    ["ENG", `ENGINE                        1.0 L PETROL
ELT BSG12                       ELECTRIFICATION TYPE = BELT STARTER GENERATOR 12V
BADGES                          H:DRIVE`]
  ];
  const brands = [
    "Abarth", "Alfa Romeo", "Citroen", "DS", "Fiat", "Fiat Professional", "Jeep", "Lancia",
    "Opel", "Opel Legacy", "Peugeot", "Vauxhall", "Vauxhall Legacy"
  ];

  for (const brand of brands) {
    for (const [language, text] of reports) {
      const result = extractVehicleInfoFromText(text, { brand, language });
      assert.equal(result.engineType, "Бензин + MHEV (мягкий гибрид)", `${brand} ${language}`);
    }
  }
});

test("Stellantis engine rows outrank unrelated electric equipment descriptions", () => {
  const reports = [
    ["RU", `ДВИГАТЕЛЬ                 DV5RC UE64 1.5 L DIESEL
КОРОБКА ПЕРЕДАЧ          STT TYPE 8-SPEED AUTOMATIC GEARBOX
ЭЛЕКТРОДВИГАТЕЛЬ СИСТЕМЫ ОХЛАЖДЕНИЯ
ЭЛЕКТРИЧЕСКИЙ УСИЛИТЕЛЬ РУЛЯ`],
    ["PL", `SILNIK                    DV5RC UE64 1.5 L DIESEL
SKRZYNIA BIEGÓW           STT TYPE 8-SPEED AUTOMATIC GEARBOX
SILNIK ELEKTRYCZNY UKŁADU CHŁODZENIA
ELEKTRYCZNE WSPOMAGANIE KIEROWNICY`],
    ["ENG", `ENGINE                    DV5RC UE64 1.5 L DIESEL
TRANSMISSION              STT TYPE 8-SPEED AUTOMATIC GEARBOX
ELECTRIC COOLING SYSTEM MOTOR
ELECTRIC POWER STEERING`]
  ];
  const brands = [
    "Abarth", "Alfa Romeo", "Citroen", "DS", "Fiat", "Fiat Professional", "Jeep", "Lancia",
    "Opel", "Opel Legacy", "Peugeot", "Vauxhall", "Vauxhall Legacy"
  ];

  for (const brand of brands) {
    for (const [language, text] of reports) {
      const result = extractVehicleInfoFromText(text, { brand, language });
      assert.equal(result.engineType, "Дизель", `${brand} ${language}`);
      assert.equal(result.engineVolume, "1500 cm³", `${brand} ${language}`);
    }
  }
});

test("VAG reports separate model, powertrain type and engine volume", () => {
  const phev = extractVehicleInfoFromText(`
Модель                             Audi A7 Sportback гибр. PHEV 2,0 A7
Альтернативная система привода     Гибридная системы привода PHEV
Топливные системы                  Непосредственный впрыск бенз. двигателя (FSI)
Спецификации двигателей            4 цил. бенз. двигатель 2,0 л/185 кВт гибрид
`, { brand: "Audi", language: "RU" });
  assert.equal(phev.model, "A7 Sportback");
  assert.equal(phev.engineType, "Бензин + PHEV (подключаемый гибрид)");
  assert.equal(phev.engineVolume, "2000 cm³");

  const phevBrands = ["Audi", "Cupra", "Seat", "Skoda", "Volkswagen", "Vw Nutzfahrzeuge"];
  for (const brand of phevBrands) {
    const gasolinePhev = extractVehicleInfoFromText(`
Альтернативная система привода     Гибридная система привода PHEV
Топливные системы                  Топливная система бензинового двигателя с впрыском
Спецификации двигателей            4-цилиндровый бензиновый двигатель 1,4 л TSI
`, { brand, language: "RU" });
    assert.equal(gasolinePhev.engineType, "Бензин + PHEV (подключаемый гибрид)", brand);
  }

  const dieselPhev = extractVehicleInfoFromText(`
Alternative powertrain system      PHEV
Fuel type                          Diesel
Engine specification               4-cylinder diesel engine 2.0 L TDI
`, { brand: "Volkswagen", language: "ENG" });
  assert.equal(dieselPhev.engineType, "Дизель + PHEV (подключаемый гибрид)");

  const electric = extractVehicleInfoFromText(`
Модель                             Audi e-tron ETRSP
Спецификации двигателей            Электродвигатель, общая мощность 230 кВт
`, { brand: "Audi", language: "RU" });
  assert.equal(electric.model, "e-tron");
  assert.equal(electric.engineType, "Электрический");
  assert.equal(electric.engineVolume, "");

  const mildHybridDiesel = extractVehicleInfoFromText(`
model                                Audi A6 Av. 2.0 TDI A6
Układy paliwowe                      0F3  Układ paliwowy - olej napędowy
Alternatywny układ napędowy          0K4  Hybrydowy układ napędowy M-HEV
Napęd hybrydowy                      20A  Bez silnika elektrycznego (Hybrid)
Specyfikacja silnika                 DE9  4-cyl. silnik wysokoprężny 2,0 l/100 kW TDI
`, { brand: "Audi", language: "PL" });
  assert.equal(mildHybridDiesel.engineType, "Дизель + MHEV (мягкий гибрид)");
  assert.equal(mildHybridDiesel.engineVolume, "2000 cm³");

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

test("missing engine fields fall back to translated evidence from the whole PDF", () => {
  const reports = [
    ["RU", "Базовый двигател TQ6 4-цил. бензиновый двигатель 1,8 л агр. 06L.A", "1800 cm³"],
    ["PL", "Silnik podstawowy TQ6 4-cylindrowy silnik benzynowy 1,8 l, agregat 06L.A", "1800 cm³"],
    ["ENG", "Base engine TQ6 4-cylinder gasoline engine 1.8 l, unit 06L.A", "1800 cm³"]
  ];

  for (const [language, text, volume] of reports) {
    const result = extractVehicleInfoFromText(text, { brand: "Audi", language });
    assert.equal(result.engineType, "Бензин");
    assert.equal(result.engineVolume, volume);
  }

  const negativeHybrid = extractVehicleInfoFromText(`
Hybrid drive      Without electric motor (hybrid)
Base engine       TQ6 4-cylinder gasoline engine 1.8 l
`, { brand: "Audi", language: "ENG" });
  assert.equal(negativeHybrid.engineType, "Бензин");
  assert.equal(negativeHybrid.engineVolume, "1800 cm³");
});

test("Hyundai HEV is not reduced to gasoline", () => {
  const result = extractVehicleInfoFromText(`
model               SANTA FE HYBRID 20
Date of production  2020-10-28
ENGINE CAPACITY     1600 CC - GAMMA-II
FUEL TYPE           GASOLINE - UNLEADED
SPECIAL CAR         ELECTRIC VEHICLE - HEV(HYBRID ELECTRIC VEHICLE)
`, { brand: "Hyundai", language: "ENG" });

  assert.equal(result.engineType, "HEV (обычный гибрид)");
  assert.equal(result.engineVolume, "1600 cm³");
});

test("Hyundai detects an electric motor from the labeled engine and fuel rows", () => {
  const result = extractVehicleInfoFromText(`
Модель                         IONIQ 5 21
Дата производства              13.04.2022
Рабочий объем двигателя        MOTOR - 160KW
Двигатель                      ELECTRIC - ELECTRIC
Топливо                        ELECTRIC - ELECTRIC
`, { brand: "Hyundai", language: "RU" });

  assert.equal(result.engineType, "Электрический");
  assert.equal(result.engineVolume, "");
});

test("Hyundai ignores hybrid wording in non-powertrain equipment", () => {
  const result = extractVehicleInfoFromText(`
model               TUCSON 18 HEURPD718 /
Date of production  2018-10-08
ENGINE CAPACITY     1600 CC - GAMMA
Топливо             GASOLINE - UNLEADED
9819A2              BLADE TYPE - HYBRID
`, { brand: "Hyundai", language: "RU" });

  assert.equal(result.engineType, "Бензин");
  assert.equal(result.engineVolume, "1600 cm³");
});

test("Kia reads gasoline from the dedicated fuel row in every report language", () => {
  const reports = [
    ["RU", "Топливо                    GASOLINE - UNLEADED"],
    ["PL", "Paliwo                     GASOLINE - UNLEADED"],
    ["ENG", "Fuel                       GASOLINE - UNLEADED"]
  ];

  for (const [language, text] of reports) {
    const result = extractVehicleInfoFromText(text, { brand: "Kia", language });
    assert.equal(result.engineType, "Бензин", language);
  }
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
    engineVolume: "2000 cm³"
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
    productionDate: "12-18.09.2022",
    engineType: "Дизель",
    engineVolume: "2000 cm³"
  });

  const dieselPhev = extractVehicleInfoFromText(`
Модель                                 V60 (-18)
Дата производства                      12.01.15
Двигатель                              D82PHEV
CG02        FUEL                       Diesel
3B03        DIM SKINS                  DIM skin PHEV
`, { brand: "Volvo", language: "RU" });

  assert.equal(dieselPhev.model, "V60 (-18)");
  assert.equal(dieselPhev.engineType, "Дизель + PHEV (подключаемый гибрид)");

  const currentV60 = extractVehicleInfoFromText(`
Rok modelowy                         2025
model                                V60 (19-)
Tydzień strukturyzowany              202417
Kod silnika                          K8
Silnik                               BK8KERS / B420T5
CM03  ENHANCED REGEN/48V KERS        With 48V KERS
CF38  ENGINE VEP4 LP                 2.0L 197/300
CG01  FUEL                           Petrol
G602  FUEL TANK, VOLUME              Volume 60 Litre
`, { brand: "Volvo", language: "PL" });

  assert.deepEqual(currentV60, {
    model: "V60 (19-)",
    productionDate: "22-28.04.2024",
    engineType: "Бензин + MHEV (мягкий гибрид)",
    engineVolume: "2000 cm³"
  });

  const compactEngine = extractVehicleInfoFromText(`
Structured week                      202401
Engine                               B3154T9
FUEL                                 Petrol
FUEL TANK, VOLUME                    Volume 54 Litre
`, { brand: "Volvo", language: "ENG" });
  assert.equal(compactEngine.productionDate, "01-07.01.2024");
  assert.equal(compactEngine.engineVolume, "1500 cm³");
});

test("brand engine-code fallbacks cover Toyota, Nissan and Suzuki", () => {
  const toyota = extractVehicleInfoFromText("ENGINE 1      1800CC 16-VALVE DOHC EFI (2ZRFXE)", { brand: "Toyota", language: "ENG" });
  const toyotaGasoline = extractVehicleInfoFromText("ENGINE 1      1500CC 12-VALVE DOHC (M15AFKS)", { brand: "Toyota", language: "RU" });
  const nissan = extractVehicleInfoFromText("Od       2019-09\nSilnik   K9K TYPE ENGINE", { brand: "Nissan", language: "PL" });
  const suzuki = extractVehicleInfoFromText("Data produkcji   2016-10\nNr silnika   K12C-5104637", { brand: "Suzuki", language: "PL" });

  assert.equal(toyota.engineType, "HEV (обычный гибрид)");
  assert.equal(toyota.engineVolume, "1800 cm³");
  assert.equal(toyotaGasoline.engineType, "Бензин");
  assert.equal(toyotaGasoline.engineVolume, "1500 cm³");
  assert.equal(nissan.productionDate, "09.2019");
  assert.equal(nissan.engineType, "Дизель");
  assert.equal(nissan.engineVolume, "1461 cm³");
  assert.equal(suzuki.productionDate, "10.2016");
  assert.equal(suzuki.engineType, "Бензин");
});

test("Toyota and Lexus distinguish plug-in hybrids by the fitted AC Type 2 charger", () => {
  const plugIn = extractVehicleInfoFromText(`
ENGINE 1                2000CC 16-VALVE DOHC (M20AFXS)
006I battery charging cable     without
011D charger                    ac type2 (3.3kw)
051I wireless charger           without
`, { brand: "Toyota", language: "RU" });
  const selfCharging = extractVehicleInfoFromText(`
ENGINE 1                1800CC 16-VALVE DOHC EFI (2ZRFXE)
006I battery charging cable     without
051I wireless charger           without
`, { brand: "Lexus", language: "ENG" });

  assert.equal(plugIn.engineType, "PHEV (подключаемый гибрид)");
  assert.equal(selfCharging.engineType, "HEV (обычный гибрид)");
});

test("Toyota reads fuel and displacement from a first-page powertrain row", () => {
  const result = extractVehicleInfoFromText(`
Номер шасси                    YARVAYHVMGZ008825
Модель                         PROACE VERSO PASSENGER (K0)
Дата производства              25.09.2021
B0DNP                          COMBI L3 H1
B0FPP                          DIESEL DV5RUC/UE63 1.5 L
B0G0K                          STT TYPE 6-SPEED MANUAL GEARBOX
\f
DBG02                          FUEL TANK CAP WITH LOCK
`, { brand: "Toyota", language: "RU" });

  assert.deepEqual(result, {
    model: "PROACE VERSO PASSENGER (K0)",
    productionDate: "25.09.2021",
    engineType: "Дизель",
    engineVolume: "1500 cm³"
  });
});

test("translated and shortened dates are normalized", () => {
  assert.equal(formatProductionDate("21 нояб. 2023?г.", "RU"), "21.11.2023");
  assert.equal(formatProductionDate("Nov 21, 2023", "ENG"), "21.11.2023");
  assert.equal(formatProductionDate("1/10/14", "ENG", "YY-MM-DD"), "10.01.2014");
  assert.equal(formatProductionDate("23-03-31", "PL", "YY-MM-DD"), "31.03.2023");
});
