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

  const phev520e = extractVehicleInfoFromText(`
Обозначение модели                         5' G31 Туринг LCI
Дата производства                          02.05.2022
Специфическое для рынка торговое наименование  520e Touring
Модель                                     520e
Код двигателя                              XB1141M1
Рабочий объем                              0,00
`, { brand: "BMW", language: "RU" });
  assert.equal(phev520e.engineType, "Бензин + PHEV (подключаемый гибрид)");
  assert.equal(phev520e.engineVolume, "2000 cm³");

  const inferredVolumes = [
    ["X1 sDrive18i", "1500 cm³"],
    ["330d xDrive Touring", "3000 cm³"],
    ["330e Touring", "2000 cm³"],
    ["520e Touring", "2000 cm³"],
    ["X5 xDrive45e", "3000 cm³"],
    ["i4 eDrive40", ""]
  ];
  for (const [marketName, engineVolume] of inferredVolumes) {
    const result = extractVehicleInfoFromText(`Специфическое для рынка торговое наименование   ${marketName}`, { brand: "BMW", language: "RU" });
    assert.equal(result.engineVolume, engineVolume);
  }
});

test("Mini decodes N1 gasoline engine codes", () => {
  const result = extractVehicleInfoFromText(`
Модель                         John Cooper Works Cabrio R57 LCI
Код двигателя                  N18B16T0
Pojemność silnika              1,60 l
`, { brand: "Mini", language: "RU" });

  assert.equal(result.engineType, "Бензин");
  assert.equal(result.engineVolume, "1600 cm³");
});

test("Mini Cooper S E ALL4 is a gasoline PHEV despite a zero catalog displacement", () => {
  const result = extractVehicleInfoFromText(`
Модель                         Cooper S E ALL4 Countryman F60
Код двигателя                  XB2131M0
Рабочий объем                  0,00
`, { brand: "Mini", language: "RU" });

  assert.equal(result.engineType, "Бензин + PHEV (подключаемый гибрид)");
  assert.equal(result.engineVolume, "1500 cm³");
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

test("Mercedes B01 48 V technology identifies a mild hybrid in every report language", () => {
  const reports = [
    ["RU", `M20         РАБОЧИЙ ОБЪЁМ 2,0 ЛИТРА\nM264        БЕНЗИНОВЫЙ ДВИГАТЕЛЬ РЯДНЫЙ 4-ЦИЛИНДРОВЫЙ M264\nB01         ТЕХНОЛОГИЯ 48 В`],
    ["PL", `M20         POJEMNOŚĆ SKOKOWA 2,0 L\nM264        4-CYLINDROWY RZĘDOWY SILNIK BENZYNOWY M264\nB01         TECHNOLOGIA 48 V`],
    ["ENG", `M20         ENGINE DISPLACEMENT 2.0 L\nM264        INLINE 4-CYLINDER GASOLINE ENGINE M264\nB01         48-VOLT TECHNOLOGY`]
  ];

  for (const [language, text] of reports) {
    const result = extractVehicleInfoFromText(text, { brand: "Mercedes-Benz", language });
    assert.equal(result.engineType, "Бензин + MHEV (мягкий гибрид)", language);
    assert.equal(result.engineVolume, "2000 cm³", language);
  }

  const plugIn = extractVehicleInfoFromText(`
M20         ENGINE DISPLACEMENT 2.0 L
M254        GASOLINE ENGINE
B01         48-VOLT TECHNOLOGY
ME10        PLUG-IN HYBRID VEHICLE PHEV
`, { brand: "Mercedes-Benz", language: "ENG" });
  assert.equal(plugIn.engineType, "Бензин + PHEV (подключаемый гибрид)");
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

  const enyaq = extractVehicleInfoFromText(`
Модель                             Skoda Enyaq
Дата производства                  09.04.2021
Спецификации двигателей            Электродвигатель 1000 cm3
`, { brand: "Skoda", language: "RU" });
  assert.equal(enyaq.engineType, "Электрический");
  assert.equal(enyaq.engineVolume, "");

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

  const nonHybridVagReports = [
    ["RU", `Гибридный привод  2A0 Без электрического двигателя (не гибрид)
Базовый двигатель T6F 4-цилиндровый дизель 2 л агрегат 05L.B`],
    ["PL", `Napęd hybrydowy  2A0 Bez silnika elektrycznego (nie hybryda)
Silnik podstawowy T6F 4-cylindrowy silnik wysokoprężny 2,0 l agregat 05L.B`],
    ["ENG", `Hybrid drive  2A0 Without electric motor (not hybrid)
Base engine T6F 4-cylinder diesel engine 2.0 l unit 05L.B`]
  ];
  const vagBrands = ["Audi", "Cupra", "Seat", "Skoda", "Volkswagen", "Vw Nutzfahrzeuge"];
  for (const brand of vagBrands) {
    for (const [language, text] of nonHybridVagReports) {
      const result = extractVehicleInfoFromText(text, { brand, language });
      assert.equal(result.engineType, "Дизель", `${brand} ${language}`);
      assert.equal(result.engineVolume, "2000 cm³", `${brand} ${language}`);
    }
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

test("Kia upgrades gasoline to PHEV from the special-car powertrain row", () => {
  const result = extractVehicleInfoFromText(`
Топливо                    GASOLINE - UNLEADED
SPECIAL CAR                ELECTRIC VEHICLE - PHEV(PLUG-IN HYBRID ELECTRIC VEHICLE)
`, { brand: "Kia", language: "RU" });

  assert.equal(result.engineType, "Бензин + PHEV (подключаемый гибрид)");
});

test("Kia detects an electric motor from the labeled engine and fuel rows", () => {
  const result = extractVehicleInfoFromText(`
Двигатель                    ELECTRIC - ELECTRIC
Топливо                      ELECTRIC - ELECTRIC
`, { brand: "Kia", language: "RU" });

  assert.equal(result.engineType, "Электрический");
  assert.equal(result.engineVolume, "");
});

test("Land Rover upgrades a gasoline engine to PHEV from the full report", () => {
  const result = extractVehicleInfoFromText(`
Тип двигателя                PETROL
Коды моделей в брошюре       L560 2.0 AJ20 P4H PHEV AWD 5DR SWB
`, { brand: "Land Rover", language: "RU" });

  assert.equal(result.engineType, "Бензин + PHEV (подключаемый гибрид)");
});

test("Porsche Boxster GTS 981 resolves the verified gasoline engine from model and code", () => {
  const result = extractVehicleInfoFromText(`
Модель                           Boxster GTS 981
Модельный год                    2015
Код двигателя                    A123
009                              "s" 981/991
011                              Специальная модель GTS (981/991)
`, { brand: "Porsche", language: "RU" });

  assert.equal(result.engineType, "Бензин");
  assert.equal(result.engineVolume, "3436 cm³");
});

test("Porsche Cayenne PHEV reads the full powertrain row in every report language", () => {
  const reports = [
    ["RU", `Модель                           Cayenne Coupe гибр. 9YA
Дата производства                14.02.2022
Код двигателя                    DCBE
Альтернативная система привода   0K3 Гибридная система привода PHEV
Объем двигателя                  3000 cm3`],
    ["PL", `Model                            Cayenne Coupe hyb. 9YA
Data produkcji                   14.02.2022
Kod silnika                      DCBE
Alternatywny układ napędowy      0K3 Hybrydowy układ napędowy PHEV
Pojemność silnika                3000 cm3`],
    ["ENG", `Model                            Cayenne Coupe hybrid 9YA
Production date                  14.02.2022
Engine code                      DCBE
Alternative drive system         0K3 Hybrid drive system PHEV
Engine capacity                  3000 cm3`]
  ];

  for (const [language, text] of reports) {
    const result = extractVehicleInfoFromText(text, { brand: "Porsche", language });
    assert.equal(result.productionDate, "14.02.2022", language);
    assert.equal(result.engineType, "Бензин + PHEV (подключаемый гибрид)", language);
    assert.equal(result.engineVolume, "3000 cm³", language);
  }
});

test("Porsche recognizes Taycan as an electric vehicle", () => {
  const result = extractVehicleInfoFromText(`
Модель                           Taycan 9J1-2
Код двигателя                    ECXE, ECX
Зарядный разъем                  Разъем тип 2
`, { brand: "Porsche", language: "RU" });

  assert.equal(result.engineType, "Электрический");
  assert.equal(result.engineVolume, "");
});

test("Porsche preserves an explicit diesel designation", () => {
  const result = extractVehicleInfoFromText(`
Модель                           Macan S Diesel
Код двигателя                    MCT.DA
`, { brand: "Porsche", language: "RU" });

  assert.equal(result.engineType, "Дизель");
});

test("Mitsubishi GA1W 1600 is a gasoline 1.6 without hybrid evidence", () => {
  const result = extractVehicleInfoFromText(`
Pojazd                         Mitsubishi ASX (EUR)
Oznaczenie                     GA1W 1600
Klasyfikacja                   2WD, 5-biegowa skrzynia manualna
`, { brand: "Mitsubishi", language: "PL" });

  assert.equal(result.engineType, "Бензин");
  assert.equal(result.engineVolume, "1600 cm³");
});

test("Mitsubishi recognizes another gasoline model designation", () => {
  const result = extractVehicleInfoFromText(`
Vehicle                        MIRAGE (EUR)
Model                          A03A 1200
Classification                 2WD, CVT
`, { brand: "Mitsubishi", language: "ENG" });

  assert.equal(result.engineType, "Бензин");
  assert.equal(result.engineVolume, "1200 cm³");
});

test("Mitsubishi keeps a D-TURBO model diesel", () => {
  const result = extractVehicleInfoFromText(`
Средство передвижения          PAJERO/MONTERO(EUR)
Модель                         V98W 3200D-TURBO/LONG WAGON<07M->
Классификация                  LYHJL6 GLX
`, { brand: "Mitsubishi", language: "RU" });

  assert.equal(result.engineType, "Дизель");
  assert.equal(result.engineVolume, "3200 cm³");
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

test("Ford prefers the applicable Fox engine over an unrelated liter value", () => {
  const result = extractVehicleInfoFromText(`
Дата производства         08.04.24
Модельный ряд             Focus 2018-
Engine Type               Alfa Romeo BLT 4.6L Cast Iron
                          1.0L Fox E
Требования к токсичности выхлопа   Стандарт выбросов Евро-6.2 MHEV
Fuel Capability Type      Газо-электрич. гибридн. двигатель
`, { brand: "Ford", language: "RU" });

  assert.deepEqual(result, {
    model: "Focus 2018-",
    productionDate: "08.04.2024",
    engineType: "Бензин + MHEV (мягкий гибрид)",
    engineVolume: "1000 cm³"
  });
});

test("Ford engine-family priority keeps EcoBoost gasoline and EcoBlue diesel", () => {
  const gasoline = extractVehicleInfoFromText(`
Vehicle Line             Puma 2019-
Engine Type              1.0L EcoBoost E
`, { brand: "Ford", language: "ENG" });
  const diesel = extractVehicleInfoFromText(`
Model Range              Focus 2018-
Engine Type              1.5 EcoBlue D
`, { brand: "Ford", language: "ENG" });

  assert.equal(gasoline.engineType, "Бензин");
  assert.equal(gasoline.engineVolume, "1000 cm³");
  assert.equal(diesel.engineType, "Дизель");
  assert.equal(diesel.engineVolume, "1500 cm³");
});

test("Ford uses the specific HEV badge instead of shared HEV/PHEV components", () => {
  const result = extractVehicleInfoFromText(`
Дата производства         19.01.21
Модельный ряд             Kuga 2020-
Engine Type               2.5L DURA D4 IVCT ATK HEV/PHEV
Коробка передач           Auto -H4F45 W/O ODC FHEV/PHEV
Fuel Capability Type      Газо-электрич. гибридн. двигатель
Tailgate Badges           Эмблема HEV на задней двери
`, { brand: "Ford", language: "RU" });

  assert.deepEqual(result, {
    model: "Kuga 2020-",
    productionDate: "19.01.2021",
    engineType: "Бензин + HEV (обычный гибрид)",
    engineVolume: "2500 cm³"
  });
});

test("Ford keeps PHEV when the specific vehicle evidence says PHEV", () => {
  const result = extractVehicleInfoFromText(`
Vehicle Line              Kuga 2020-
Engine Type               2.5L DURA D4 IVCT ATK HEV/PHEV
Transmission              Auto -H4F45 W/O ODC FHEV/PHEV
Tailgate Badges           PHEV badge on tailgate
`, { brand: "Ford", language: "ENG" });

  assert.equal(result.engineType, "Бензин + PHEV (подключаемый гибрид)");
  assert.equal(result.engineVolume, "2500 cm³");
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

  const combustionOnly = extractVehicleInfoFromText(`
Модель                                 EX40 / XC40
Производственная неделя                202325
Двигатель                              B3154T9
C701        ELECTRIC ENGINE            Only combustion engine for propulsion
CB01        PROPULSION TYPE             Combustion engine only
CF36        ENGINE                     GEP3 MP 1.5L 129/245
CG01        FUEL                       Petrol
CI01        ELECTRIC PROPULSION MOTOR  Without Electric Rear Propulsion Motor
CJ01        ELECTRIC VEHICLE INLET     No Electric Vehicle Inlet
CK01        HIGH VOLTAGE BATTERY       Without High Voltage Battery
CP01        FRONT EL PROPULSION MOTOR  Without Front Electric Propulsion Motor
`, { brand: "Volvo", language: "RU" });
  assert.deepEqual(combustionOnly, {
    model: "EX40 / XC40",
    productionDate: "19-25.06.2023",
    engineType: "Бензин",
    engineVolume: "1500 cm³"
  });

  const electric = extractVehicleInfoFromText(`
Model                                  EX40
Structured week                        202410
C701        ELECTRIC ENGINE            Electric engine for propulsion
CB04        PROPULSION TYPE             Battery electric vehicle
`, { brand: "Volvo", language: "ENG" });
  assert.equal(electric.engineType, "Электрический");
  assert.equal(electric.engineVolume, "");
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
  assert.equal(nissan.productionDate, "od 09.2019");
  assert.equal(nissan.engineType, "Дизель");
  assert.equal(nissan.engineVolume, "1461 cm³");
  assert.equal(suzuki.productionDate, "10.2016");
  assert.equal(suzuki.engineType, "Бензин");
  assert.equal(suzuki.engineVolume, "1242 cm³");
});

test("Suzuki reads ENGINE from page one and does not infer hybridization without explicit evidence", () => {
  const gasoline = extractVehicleInfoFromText(`
Модель               SWIFT (A2L412-5)
Дата производства    2022-12
Номер                K12D-1218835
Код модели           A2L412-5_E22
ENGINE                K12D
DRIVE                 2WD
TRANSMISSION          CVT
\f
HYBRID EMBLEM         WITHOUT
`, { brand: "Suzuki", language: "RU" });
  const mildHybrid = extractVehicleInfoFromText(`
Model                 SWIFT (A2L412-5)
Production date       2022-12
ENGINE                K12D
POWERTRAIN            SHVS
`, { brand: "Suzuki", language: "ENG" });
  const vitara = extractVehicleInfoFromText(`
Модель                 VITARA (APK414-B)
Дата производства      2023-10
Номер                  K14D-1340940
Код модели             APK414-B_P22
ENGINE                  K14D
DRIVING                 2WD
TRANSMISSION            6MT
`, { brand: "Suzuki", language: "RU" });

  assert.equal(gasoline.model, "SWIFT (A2L412-5)");
  assert.equal(gasoline.productionDate, "12.2022");
  assert.equal(gasoline.engineType, "Бензин");
  assert.equal(gasoline.engineVolume, "1197 cm³");
  assert.equal(mildHybrid.engineType, "Бензин + MHEV (мягкий гибрид)");
  assert.equal(mildHybrid.engineVolume, "1197 cm³");
  assert.equal(vitara.engineType, "Бензин");
  assert.equal(vitara.engineVolume, "1373 cm³");
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

  assert.equal(plugIn.engineType, "Бензин + PHEV (подключаемый гибрид)");
  assert.equal(selfCharging.engineType, "HEV (обычный гибрид)");
});

test("Toyota Prius PHV with AC-charge Type2 is a gasoline plug-in hybrid", () => {
  const result = extractVehicleInfoFromText(`
Модель                         PRIUS PHV
Дата производства              24.08.2018
ENGINE 1                       1800CC 16-VALVE DOHC EFI (2ZRFXE)
006M battery charging cable    eu se 7.5m
011D charger                   ac-charge (type2) only
`, { brand: "Toyota", language: "RU" });

  assert.deepEqual(result, {
    model: "PRIUS PHV",
    productionDate: "24.08.2018",
    engineType: "Бензин + PHEV (подключаемый гибрид)",
    engineVolume: "1800 cm³"
  });
});

test("Toyota RAV4 requires a fitted charging cable and AC onboard charger for PHEV", () => {
  const plugIn = extractVehicleInfoFromText(`
Модель                         RAV4
Дата производства              25.08.2023
ENGINE 1                       2500CC 16-VALVE DOHC (A25AFXS)
007R battery charging cable    eu sel (8a) 5m
075B wireless charger          with
077D charger                   ac (6.6kw)
`, { brand: "Toyota", language: "RU" });
  const noCable = extractVehicleInfoFromText(`
Модель                         RAV4
ENGINE 1                       2500CC 16-VALVE DOHC (A25AFXS)
007R battery charging cable    without
077D charger                   ac (6.6kw)
`, { brand: "Toyota", language: "ENG" });

  assert.deepEqual(plugIn, {
    model: "RAV4",
    productionDate: "25.08.2023",
    engineType: "Бензин + PHEV (подключаемый гибрид)",
    engineVolume: "2500 cm³"
  });
  assert.equal(noCable.engineType, "HEV (обычный гибрид)");
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

test("Toyota FTS turbo engine stays gasoline despite a HYBRID catalog group name", () => {
  const result = extractVehicleInfoFromText(`
model                            AURIS/HYBRID (UKP)
Data produkcji                  15.04.2016
ENGINE 1                        1200CC 16-VALVE DOHC D4 (8NRFTS)
FUEL INDUCTION                  TURBO SYSTEM
007B package option 2           stop & start system
`, { brand: "Toyota", language: "PL" });

  assert.deepEqual(result, {
    model: "AURIS/HYBRID (UKP)",
    productionDate: "15.04.2016",
    engineType: "Бензин",
    engineVolume: "1200 cm³"
  });
});

test("translated and shortened dates are normalized", () => {
  assert.equal(formatProductionDate("21 нояб. 2023?г.", "RU"), "21.11.2023");
  assert.equal(formatProductionDate("Nov 21, 2023", "ENG"), "21.11.2023");
  assert.equal(formatProductionDate("1/10/14", "ENG", "YY-MM-DD"), "10.01.2014");
  assert.equal(formatProductionDate("23-03-31", "PL", "YY-MM-DD"), "31.03.2023");
});
