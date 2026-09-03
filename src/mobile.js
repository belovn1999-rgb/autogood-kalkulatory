const DEFAULT_MOBILEDE_API_URL = "https://dual-combines-syndrome-existed.trycloudflare.com/mobilede/import";

const copy = {
  pl: {
    pageHeading: "Mobile.de — wyszukiwanie auta",
    eyebrow: "LINK MOBILE.DE",
    lead: "Wklej link, sprawdź dane auta i wybierz scenariusz zakupu. Kalkulator dostanie cenę, transport, oględziny i akcyzę.",
    methodPrompt: "WYBIERZ METODĘ",
    listingChoiceDescription: "Wklej link z mobile.de i pobierz dane automatycznie.",
    manualChoiceDescription: "Uzupełnij parametry auta samodzielnie.",
    backToMethods: "← Wybierz metodę",
    inputLabel: "Link ogłoszenia",
    loadButton: "Rozpoznaj",
    loadingButton: "Pobieram",
    helper: "",
    loading: "Pobieram dane z mobile.de. To może chwilę potrwać.",
    ready: "Dane gotowe. Wybierz scenariusz zakupu na dole strony.",
    error: "Nie udało się rozpoznać ogłoszenia. Sprawdź link albo backend.",
    listingEyebrow: "DANE Z OGŁOSZENIA",
    manualEyebrow: "WPISZ DANE RĘCZNIE",
    clearManualFilters: "Wyczyść filtry",
    selectedFiltersEmpty: "Brak wybranych parametrów",
    offerCountLabel: "AKTUALNE OFERTY",
    vehicleDataLabel: "DANE PODSTAWOWE POJAZDU",
    drivetrainLabel: "NAPĘD I SKRZYNIA",
    conditionLabel: "WNĘTRZE I STAN",
    tradeConditionsLabel: "WARUNKI ZAKUPU",
    calculatorDataEyebrow: "DANE DO KALKULATORA",
    brandLabel: "Marka",
    modelLabel: "Model",
    versionLabel: "Wersja",
    fuelLabel: "Paliwo",
    pluginLabel: "Plug-in",
    bodyLabel: "Nadwozie",
    mileageRangeLabel: "Przebieg",
    yearRangeLabel: "Rok",
    displacementRangeLabel: "Pojemność silnika",
    powerRangeLabel: "Moc silnika (KM)",
    driveLabel: "Napęd",
    driveAny: "Dowolny",
    driveAwd: "AWD",
    driveFwd: "FWD",
    driveRwd: "RWD",
    gearboxLabel: "Skrzynia biegów",
    gearboxAny: "Dowolny",
    gearboxAutomatic: "Automatyczna",
    gearboxManual: "Manualna",
    vatLabel: "VAT",
    vatAny: "Dowolny",
    vatReclaimable: "VAT zwrotny",
    vatNonReclaimable: "VAT niezwrotny",
    countryLabel: "Kraj",
    countryGermany: "Niemcy",
    countryBelgium: "Belgia",
    countryNetherlands: "Holandia",
    countryFrance: "Francja",
    countryAustria: "Austria",
    countryLuxembourg: "Luksemburg",
    countrySweden: "Szwecja",
    countryItaly: "Włochy",
    countryDenmark: "Dania",
    countryCzechia: "Czechy",
    countryLithuania: "Litwa",
    countryLatvia: "Łotwa",
    countryEstonia: "Estonia",
    countrySlovakia: "Słowacja",
    sellerTypeLabel: "Sprzedawca",
    sellerAny: "Dowolny",
    sellerDealer: "Dealer",
    sellerPrivate: "Prywatny",
    sellerCompany: "Firma",
    interiorMaterialLabel: "Typ salonu",
    materialAlcantara: "Alcantara",
    materialCloth: "Materiał",
    materialPartLeather: "Skóra częściowa",
    materialFullLeather: "Skóra",
    featureOptionsLabel: "Opcje",
    airConditioningLabel: "Klimatyzacja",
    airConditioningAutomatic: "Automatyczna",
    airConditioningAutomatic2Zones: "Automatyczna, 2 strefy",
    airConditioningAutomatic3Zones: "Automatyczna, 3 strefy",
    airConditioningAutomatic4Zones: "Automatyczna, 4 strefy",
    airConditioningManual: "Manualna lub automatyczna",
    trailerCouplingLabel: "Hak holowniczy",
    trailerCouplingAny: "Dowolny",
    trailerCouplingAll: "Stały, odpinany lub odchylany",
    trailerCouplingDetachableOrSwiveling: "Odpinany lub odchylany",
    trailerCouplingSwiveling: "Hak holowniczy odchylany",
    electricTailgate: "Elektryczna klapa bagażnika",
    seatsRangeLabel: "Liczba miejsc",
    featurePanoramicRoof: "Dach panoramiczny",
    featureRoofRails: "Relingi dachowe",
    featureAirSuspension: "Zawieszenie pneumatyczne",
    featureSportsSuspension: "Sportowe zawieszenie",
    featureLaserHeadlights: "Reflektory laserowe",
    featureLedRunningLights: "Światła do jazdy dziennej LED",
    featureBiXenonHeadlights: "Reflektory biksenonowe",
    featureAdaptiveLighting: "Adaptacyjne światła",
    featureBlindSpotAssist: "Asystent martwego pola",
    featureSportsPackage: "Pakiet sportowy",
    featureKeylessCentralLocking: "Bezkluczykowy centralny zamek",
    featureHeatedSeats: "Podgrzewane fotele",
    featureHeatedWindshield: "Podgrzewana przednia szyba",
    featureHeatedSteeringWheel: "Podgrzewana kierownica",
    featureHeatedRearSeats: "Podgrzewane tylne fotele",
    featureSeatVentilation: "Wentylowane fotele",
    featureSportSeats: "Fotele sportowe",
    featureMassageSeats: "Fotele z masażem",
    featureNightVisionAssist: "Asystent noktowizyjny",
    featureAlloyWheels: "Felgi aluminiowe",
    featureTrafficSignRecognition: "Rozpoznawanie znaków drogowych",
    featureAppleCarplay: "Apple CarPlay",
    featureAndroidAuto: "Android Auto",
    featureAmbientLighting: "Oświetlenie ambientowe",
    featureDigitalCockpit: "Cyfrowy kokpit",
    featureElectricSeatAdjustment: "Elektryczna regulacja foteli",
    featureMemorySeats: "Elektryczna regulacja foteli z pamięcią",
    featureWirelessCharging: "Ładowanie indukcyjne smartfona",
    featureWinterTyres: "Opony zimowe",
    featureSummerTyres: "Opony letnie",
    parkingSensorsLabel: "Asystenci parkowania",
    parkingCamera360: "Kamera 360°",
    parkingCamera: "Kamera",
    parkingFront: "Przód",
    parkingRear: "Tył",
    parkingRearTrafficAlert: "Asystent ruchu poprzecznego z tyłu",
    parkingSelfSteering: "Systemy samoparkowania",
    cruiseControlLabel: "Tempomat",
    cruiseControlAny: "Dowolny",
    cruiseControlStandard: "Tempomat",
    cruiseControlAdaptive: "Adaptacyjny tempomat",
    exteriorColorLabel: "Kolor nadwozia",
    interiorColorLabel: "Kolor wnętrza",
    colorBeige: "beżowy",
    colorBlack: "czarny",
    colorBlue: "niebieski",
    colorBrown: "brązowy",
    colorYellow: "żółty",
    colorGold: "złoty",
    colorGreen: "zielony",
    colorGrey: "szary",
    colorOrange: "pomarańczowy",
    colorRed: "czerwony",
    colorSilver: "srebrny",
    colorPurple: "fioletowy",
    colorWhite: "biały",
    colorOther: "inny",
    matteLabel: "Matowy",
    metallicLabel: "Metallic",
    nonSmokingLabel: "Auto niepalącego",
    roadworthyLabel: "Sprawny technicznie",
    damagedVehiclesLabel: "Uszkodzone pojazdy",
    damagedVehiclesHide: "Nie pokazuj",
    damagedVehiclesShow: "Pokaż",
    marketSearchButton: "Szukaj na mobile.de",
    marketSearchOpening: "Otwieram wyniki od najniższej ceny.",
    marketSearchChooseBrand: "Wybierz markę przed wpisaniem modelu.",
    marketSearchUnsupportedBrand: "Ta marka nie występuje w wyszukiwarce samochodów mobile.de.",
    marketSearchInvalidRange: "Wartość „od” nie może być większa niż „do”.",
    fromPlaceholder: "od",
    toPlaceholder: "do",
    sourceEyebrow: "SPRZEDAWCA",
    actionsTitle: "Wybierz ścieżkę zakupu",
    footer: "Mobile.de → kalkulatory operacyjne",
    emptyTitle: "—",
    emptyValue: "—",
    price: "Cena z ogłoszenia",
    purchaseType: "Typ zakupu",
    fuel: "Paliwo",
    engine: "Typ silnika / akcyza",
    displacement: "Pojemność silnika",
    power: "Moc silnika",
    gearbox: "Skrzynia biegów",
    body: "Nadwozie",
    mileage: "Przebieg",
    registration: "Rok / pierwsza rejestracja",
    location: "Lokalizacja",
    seller: "Sprzedawca",
    delivery: "Transport netto",
    inspection: "Oględziny netto",
    tariff: "Typ zakupu",
    selectEmpty: "Wybierz",
    scenarios: [
      { key: "direct", number: "01", tab: 0, title: "Zakup bezpośredni" },
      { key: "company", number: "02", tab: 3, title: "Dealerzy VAT 23%" },
      { key: "ag", number: "03", tab: 4, title: "Dealerzy VAT Marża" },
    ],
  },
  ru: {
    pageHeading: "Mobile.de — поиск автомобиля",
    eyebrow: "ССЫЛКА MOBILE.DE",
    lead: "Вставь ссылку, проверь данные авто и выбери сценарий покупки. Калькулятор получит цену, доставку, осмотр и акциз.",
    methodPrompt: "ВЫБЕРИ СПОСОБ",
    listingChoiceDescription: "Вставь ссылку mobile.de и получи данные автоматически.",
    manualChoiceDescription: "Заполни параметры автомобиля вручную.",
    backToMethods: "← Выбрать способ",
    inputLabel: "Ссылка объявления",
    loadButton: "Распознать",
    loadingButton: "Загружаю",
    helper: "",
    loading: "Загружаю данные с mobile.de. Это может занять время.",
    ready: "Данные готовы. Выбери сценарий покупки внизу страницы.",
    error: "Не удалось распознать объявление. Проверь ссылку или backend.",
    listingEyebrow: "ДАННЫЕ ИЗ ОБЪЯВЛЕНИЯ",
    manualEyebrow: "ВВЕСТИ ДАННЫЕ ВРУЧНУЮ",
    clearManualFilters: "Очистить фильтры",
    selectedFiltersEmpty: "Нет выбранных параметров",
    offerCountLabel: "АКТУАЛЬНЫЕ ОБЪЯВЛЕНИЯ",
    vehicleDataLabel: "ОСНОВНЫЕ ДАННЫЕ АВТОМОБИЛЯ",
    drivetrainLabel: "ПРИВОД И КОРОБКА ПЕРЕДАЧ",
    conditionLabel: "САЛОН И СОСТОЯНИЕ",
    tradeConditionsLabel: "УСЛОВИЯ СДЕЛКИ",
    calculatorDataEyebrow: "ДАННЫЕ ДЛЯ КАЛЬКУЛЯТОРА",
    brandLabel: "Марка",
    modelLabel: "Модель",
    versionLabel: "Версия",
    fuelLabel: "Топливо",
    pluginLabel: "Plug-in",
    bodyLabel: "Кузов",
    mileageRangeLabel: "Пробег",
    yearRangeLabel: "Год",
    displacementRangeLabel: "Объём двигателя",
    powerRangeLabel: "Мощность двигателя (л.с.)",
    driveLabel: "Привод",
    driveAny: "Любой",
    driveAwd: "Полный",
    driveFwd: "Передний",
    driveRwd: "Задний",
    gearboxLabel: "Коробка передач",
    gearboxAny: "Любая",
    gearboxAutomatic: "Автоматическая",
    gearboxManual: "Механическая",
    vatLabel: "VAT",
    vatAny: "Любой",
    vatReclaimable: "VAT возвратный",
    vatNonReclaimable: "VAT невозвратный",
    countryLabel: "Страна",
    countryGermany: "Германия",
    countryBelgium: "Бельгия",
    countryNetherlands: "Нидерланды",
    countryFrance: "Франция",
    countryAustria: "Австрия",
    countryLuxembourg: "Люксембург",
    countrySweden: "Швеция",
    countryItaly: "Италия",
    countryDenmark: "Дания",
    countryCzechia: "Чехия",
    countryLithuania: "Литва",
    countryLatvia: "Латвия",
    countryEstonia: "Эстония",
    countrySlovakia: "Словакия",
    sellerTypeLabel: "Продавец",
    sellerAny: "Любой",
    sellerDealer: "Дилер",
    sellerPrivate: "Частный",
    sellerCompany: "Фирма",
    interiorMaterialLabel: "Материал салона",
    materialAlcantara: "Алькантара",
    materialCloth: "Материал",
    materialPartLeather: "Комбинированная кожа",
    materialFullLeather: "Кожа",
    featureOptionsLabel: "Опции",
    airConditioningLabel: "Климат-контроль",
    airConditioningAutomatic: "Автоматический",
    airConditioningAutomatic2Zones: "Автоматический, 2 зоны",
    airConditioningAutomatic3Zones: "Автоматический, 3 зоны",
    airConditioningAutomatic4Zones: "Автоматический, 4 зоны",
    airConditioningManual: "Ручной или автоматический",
    trailerCouplingLabel: "Фаркоп",
    trailerCouplingAny: "Любой",
    trailerCouplingAll: "Фиксированный, съёмный или поворотный",
    trailerCouplingDetachableOrSwiveling: "Съёмный или поворотный",
    trailerCouplingSwiveling: "Поворотный фаркоп",
    electricTailgate: "Электропривод крышки багажника",
    seatsRangeLabel: "Количество мест",
    featurePanoramicRoof: "Панорамная крыша",
    featureRoofRails: "Рейлинги на крыше",
    featureAirSuspension: "Пневмоподвеска",
    featureSportsSuspension: "Спортивная подвеска",
    featureLaserHeadlights: "Лазерные фары",
    featureLedRunningLights: "Дневные ходовые огни LED",
    featureBiXenonHeadlights: "Биксеноновые фары",
    featureAdaptiveLighting: "Адаптивный свет",
    featureBlindSpotAssist: "Контроль слепых зон",
    featureSportsPackage: "Спортивный пакет",
    featureKeylessCentralLocking: "Бесключевой центральный замок",
    featureHeatedSeats: "Подогрев сидений",
    featureHeatedWindshield: "Подогрев лобового стекла",
    featureHeatedSteeringWheel: "Подогрев руля",
    featureHeatedRearSeats: "Подогрев задних сидений",
    featureSeatVentilation: "Вентиляция сидений",
    featureSportSeats: "Спортивные сиденья",
    featureMassageSeats: "Сиденья с массажем",
    featureNightVisionAssist: "Система ночного видения",
    featureAlloyWheels: "Легкосплавные диски",
    featureTrafficSignRecognition: "Распознавание дорожных знаков",
    featureAppleCarplay: "Apple CarPlay",
    featureAndroidAuto: "Android Auto",
    featureAmbientLighting: "Атмосферная подсветка",
    featureDigitalCockpit: "Цифровая приборная панель",
    featureElectricSeatAdjustment: "Электрорегулировка сидений",
    featureMemorySeats: "Электрорегулировка сидений с памятью",
    featureWirelessCharging: "Беспроводная зарядка смартфона",
    featureWinterTyres: "Зимние шины",
    featureSummerTyres: "Летние шины",
    parkingSensorsLabel: "Парковочные ассистенты",
    parkingCamera360: "Камера 360°",
    parkingCamera: "Камера",
    parkingFront: "Передние",
    parkingRear: "Задние",
    parkingRearTrafficAlert: "Контроль поперечного движения сзади",
    parkingSelfSteering: "Система автоматической парковки",
    cruiseControlLabel: "Круиз-контроль",
    cruiseControlAny: "Любой",
    cruiseControlStandard: "Круиз-контроль",
    cruiseControlAdaptive: "Адаптивный круиз-контроль",
    exteriorColorLabel: "Цвет кузова",
    interiorColorLabel: "Цвет салона",
    colorBeige: "бежевый",
    colorBlack: "чёрный",
    colorBlue: "синий",
    colorBrown: "коричневый",
    colorYellow: "жёлтый",
    colorGold: "золотой",
    colorGreen: "зелёный",
    colorGrey: "серый",
    colorOrange: "оранжевый",
    colorRed: "красный",
    colorSilver: "серебристый",
    colorPurple: "фиолетовый",
    colorWhite: "белый",
    colorOther: "другой",
    matteLabel: "Матовый",
    metallicLabel: "Металлик",
    nonSmokingLabel: "Авто для некурящих",
    roadworthyLabel: "Технически исправный",
    damagedVehiclesLabel: "Повреждённые автомобили",
    damagedVehiclesHide: "Не показывать",
    damagedVehiclesShow: "Показывать",
    marketSearchButton: "Найти на mobile.de",
    marketSearchOpening: "Открываю результаты: сначала самые дешёвые.",
    marketSearchChooseBrand: "Сначала выбери марку, затем введи модель.",
    marketSearchUnsupportedBrand: "Этой марки нет в поиске легковых автомобилей mobile.de.",
    marketSearchInvalidRange: "Значение «от» не может быть больше значения «до».",
    fromPlaceholder: "от",
    toPlaceholder: "до",
    sourceEyebrow: "ПРОДАВЕЦ",
    actionsTitle: "Выбери путь покупки",
    footer: "Mobile.de → рабочие калькуляторы",
    emptyTitle: "—",
    emptyValue: "—",
    price: "Цена из объявления",
    purchaseType: "Тип закупа",
    fuel: "Топливо",
    engine: "Тип двигателя / акциз",
    displacement: "Объём двигателя",
    power: "Мощность двигателя",
    gearbox: "Коробка передач",
    body: "Кузов",
    mileage: "Пробег",
    registration: "Год / первая регистрация",
    location: "Локация",
    seller: "Продавец",
    delivery: "Доставка netto",
    inspection: "Осмотр netto",
    tariff: "Тип закупа",
    selectEmpty: "Выбери",
    scenarios: [
      { key: "direct", number: "01", tab: 0, title: "Прямая покупка" },
      { key: "company", number: "02", tab: 3, title: "Дилеры VAT 23%" },
      { key: "ag", number: "03", tab: 4, title: "Дилеры VAT Маржа" },
    ],
  },
};

const fallbackBrands = {
  "Alfa Romeo": {},
  Audi: {},
  BMW: {},
  Citroen: {},
  Cupra: {},
  Dacia: {},
  DS: {},
  Fiat: {},
  Ford: {},
  Hyundai: {},
  Iveco: {},
  Jaguar: {},
  Jeep: {},
  Kia: {},
  "Land Rover": {},
  Lexus: {},
  "Mercedes-Benz": {},
  "Mercedes Trucks": {},
  "Mercedes Vans": {},
  Mini: {},
  Mitsubishi: {},
  Nissan: {},
  Opel: {},
  Peugeot: {},
  Porsche: {},
  Renault: {},
  Seat: {},
  Skoda: {},
  Smart: {},
  Suzuki: {},
  Toyota: {},
  Volvo: {},
  Volkswagen: {},
  "Vw Nutzfahrzeuge": {},
};

const favoriteBrands = [
  { value: "Audi", label: "Audi" },
  { value: "BMW", label: "BMW" },
  { value: "Ford", label: "Ford" },
  { value: "Mercedes-Benz", label: "Mercedes-Benz" },
  { value: "Peugeot", label: "Peugeot" },
  { value: "Renault", label: "Renault" },
  { value: "Toyota", label: "Toyota" },
  { value: "Volvo", label: "Volvo" },
  { value: "Volkswagen", label: "Volkswagen" },
];

const brandAliases = {
  Citroen: ["Citroën"],
  "Mercedes-Benz": ["Mercedes Benz", "Mercedes"],
  Volkswagen: ["VW", "Vw"],
  "Vw Nutzfahrzeuge": ["Volkswagen Nutzfahrzeuge", "VW Nutzfahrzeuge", "Vw Nutzfahrzeuge"],
};

const fuelOptions = [
  { value: "petrol", pl: "Benzyna", ru: "Бензин" },
  { value: "diesel", pl: "Diesel", ru: "Дизель" },
  { value: "hybrid_diesel", pl: "Hybryda diesel", ru: "Гибрид дизель" },
  { value: "hybrid_petrol", pl: "Hybryda benzyna", ru: "Гибрид бензин" },
  { value: "electric", pl: "Elektryk", ru: "Электрик" },
  { value: "plugin", pl: "Plug-in", ru: "Plug-in" },
];

const bodyOptions = [
  { value: "limousine", pl: "Sedan", ru: "Седан" },
  { value: "estate", pl: "Kombi", ru: "Универсал" },
  { value: "suv", pl: "SUV", ru: "SUV" },
  { value: "hatchback", pl: "Hatchback", ru: "Хэтчбек" },
  { value: "coupe", pl: "Coupe", ru: "Купе" },
  { value: "cabrio", pl: "Cabrio", ru: "Кабриолет" },
  { value: "van_minibus", pl: "VAN", ru: "VAN" },
  { value: "pickup", pl: "Pickup", ru: "Пикап" },
  { value: "other", pl: "Inne", ru: "Другой" },
];

const seatsOptions = Array.from({ length: 9 }, (_, index) => String(index + 1));

const mobileDeMakeIds = {
  Abarth: "140",
  "Alfa Romeo": "900",
  Alpine: "5",
  Audi: "1900",
  Bentley: "3100",
  BMW: "3500",
  Citroen: "5900",
  Cupra: "3",
  Dacia: "6600",
  DS: "235",
  Fiat: "8800",
  Ford: "9000",
  Hyundai: "11600",
  Infiniti: "11650",
  Iveco: "12100",
  Jaguar: "12400",
  Jeep: "12600",
  Kia: "13200",
  "Land Rover": "14800",
  Lancia: "14700",
  Lexus: "15200",
  MAN: "186",
  Mazda: "16800",
  "Mercedes-Benz": "17200",
  Mini: "17500",
  Mitsubishi: "17700",
  Nissan: "18700",
  Opel: "19000",
  Peugeot: "19300",
  Polestar: "4",
  Porsche: "20100",
  Renault: "20700",
  Seat: "22500",
  Skoda: "22900",
  Smart: "23000",
  Suzuki: "23600",
  Toyota: "24100",
  Volvo: "25100",
  Volkswagen: "25200",
  "Vw Nutzfahrzeuge": "25200",
};

const mobileDeFuelValues = {
  petrol: "PETROL",
  diesel: "DIESEL",
  hybrid_diesel: "HYBRID_DIESEL",
  hybrid_petrol: "HYBRID",
  electric: "ELECTRIC",
};

const mobileDeBodyValues = {
  limousine: "Limousine",
  estate: "EstateCar",
  suv: "OffRoad",
  hatchback: "SmallCar",
  coupe: "SportsCar",
  cabrio: "Cabrio",
  van_minibus: "Van",
  pickup: "OffRoad",
  other: "OtherCar",
};

const mobileDeDriveValues = {
  awd: "ALL_WHEEL",
  fwd: "FRONT",
  rwd: "REAR",
};

const mobileDeGearboxValues = {
  automatic: "AUTOMATIC_GEAR",
  manual: "MANUAL_GEAR",
};

const mobileDeSellerValues = {
  dealer: "DEALER",
  private: "FSBO",
  company: "COMM_FSBO",
};

const mobileDeInteriorMaterialValues = {
  alcantara: "ALCANTARA",
  cloth: "FABRIC",
  part_leather: "PARTIAL_LEATHER",
  full_leather: "LEATHER",
};

const mobileDeAirConditioningValues = {
  automatic: "AUTOMATIC_CLIMATISATION",
  manual: "MANUAL_CLIMATISATION",
  automatic_2_zones: "AUTOMATIC_CLIMATISATION_2_ZONES",
  automatic_3_zones: "AUTOMATIC_CLIMATISATION_3_ZONES",
  automatic_4_zones: "AUTOMATIC_CLIMATISATION_4_ZONES",
};

const mobileDeTrailerCouplingValues = {
  all: "TRAILER_COUPLING_FIX",
  detachable_or_swiveling: "TRAILER_COUPLING_DETACHABLE",
  swiveling: "TRAILER_COUPLING_SWIVELING",
};

const displacementOptions = ["1000", "1200", "1400", "1600", "1800", "2000", "2600", "3000", "> 5000", "< 5000"];
const powerOptions = ["75", "90", "101", "118", "131", "150", "200", "252", "303", "358", "402", "452"];

const modelGroupsByBrand = {
  BMW: [
    { group: "1 Series", models: ["114", "116", "118", "120", "123", "125", "128", "130", "135", "1er M Coupé"] },
    { group: "2 Series", models: ["2er Gran Coupé", "214 Active Tourer", "214 Gran Tourer", "216", "216 Active Tourer", "216 Gran Coupé", "216 Gran Tourer", "218", "218 Active Tourer", "218 Gran Coupé", "218 Gran Tourer", "220", "220 Active Tourer", "220 Gran Coupé", "220 Gran Tourer", "223", "223 Active Tourer", "223 Gran Coupé", "225", "225 Active Tourer", "228", "230", "230 Active Tourer"] },
    { group: "3 Series", models: ["315", "316", "318", "318 Gran Turismo", "320", "320 Gran Turismo", "323", "324", "325", "325 Gran Turismo", "328", "328 Gran Turismo", "330", "330 Gran Turismo", "335", "335 Gran Turismo", "340", "340 Gran Turismo", "ActiveHybrid 3"] },
    { group: "4 Series", models: ["418", "418 Gran Coupé", "420", "420 Gran Coupé", "425", "425 Gran Coupé", "428", "428 Gran Coupé", "430", "430 Gran Coupé", "435", "435 Gran Coupé", "440", "440 Gran Coupé"] },
    { group: "5 Series", models: ["518", "520", "520 Gran Turismo", "523", "524", "525", "528", "530", "530 Gran Turismo", "535", "535 Gran Turismo", "540", "545", "550", "550 Gran Turismo", "ActiveHybrid 5"] },
    { group: "6 Series", models: ["620 Gran Turismo", "628", "630", "630 Gran Turismo", "633", "635", "640", "640 Gran Coupé", "640 Gran Turismo", "645", "650", "650 Gran Coupé"] },
    { group: "7 Series", models: ["725", "728", "730", "732", "735", "740", "745", "750", "760", "ActiveHybrid 7"] },
    { group: "M Models", models: ["M135", "M140i", "M2", "M235", "M240i", "M3", "M340d", "M340i", "M4", "M440", "M5", "M550", "M6", "M760", "M8", "M850"] },
    { group: "X Series", models: ["ActiveHybrid X6", "X1", "X2", "X3", "X3 M", "X3 M40", "X3 M50", "X4", "X4 M", "X4 M40", "X5", "X5 M", "X5 M50", "X5 M60", "X6", "X6 M", "X6 M50", "X6 M60", "X7", "X7 M50", "X7 M60", "XM"] },
    { group: "Z Series", models: ["Z1", "Z3", "Z3 M", "Z4", "Z4 M", "Z4 M40", "Z8"] },
    { group: "8 Series", models: ["840", "850"] },
    { group: "Pozostałe BMW", models: ["2002", "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX2", "iX3", "Other"] },
  ],
};

const mobileDeBmwModelIds = {
  "114": "73",
  "116": "2",
  "118": "3",
  "120": "4",
  "123": "59",
  "125": "61",
  "128": "328",
  "130": "5",
  "135": "58",
  "1er M Coupé": "87",
  "2002": "71",
  "2er Gran Coupé": "322",
  "214 Active Tourer": "110",
  "214 Gran Tourer": "116",
  "216": "106",
  "216 Active Tourer": "111",
  "216 Gran Coupé": "345",
  "216 Gran Tourer": "114",
  "218": "90",
  "218 Active Tourer": "107",
  "218 Gran Coupé": "343",
  "218 Gran Tourer": "112",
  "220": "84",
  "220 Active Tourer": "108",
  "220 Gran Coupé": "344",
  "220 Gran Tourer": "113",
  "223": "351",
  "223 Active Tourer": "333",
  "223 Gran Coupé": "350",
  "225": "91",
  "225 Active Tourer": "109",
  "228": "104",
  "230": "125",
  "230 Active Tourer": "334",
  "315": "7",
  "316": "8",
  "318": "9",
  "318 Gran Turismo": "75",
  "320": "10",
  "320 Gran Turismo": "76",
  "323": "11",
  "324": "12",
  "325": "13",
  "325 Gran Turismo": "88",
  "328": "14",
  "328 Gran Turismo": "77",
  "330": "15",
  "330 Gran Turismo": "103",
  "335": "56",
  "335 Gran Turismo": "78",
  "340": "118",
  "340 Gran Turismo": "130",
  "ActiveHybrid 3": "72",
  "418": "115",
  "418 Gran Coupé": "98",
  "420": "80",
  "420 Gran Coupé": "99",
  "425": "102",
  "425 Gran Coupé": "124",
  "428": "81",
  "428 Gran Coupé": "100",
  "430": "83",
  "430 Gran Coupé": "105",
  "435": "82",
  "435 Gran Coupé": "101",
  "440": "120",
  "440 Gran Coupé": "121",
  "518": "16",
  "520": "17",
  "520 Gran Turismo": "74",
  "523": "18",
  "524": "19",
  "525": "20",
  "528": "21",
  "530": "22",
  "530 Gran Turismo": "65",
  "535": "23",
  "535 Gran Turismo": "66",
  "540": "24",
  "545": "25",
  "550": "26",
  "550 Gran Turismo": "67",
  "ActiveHybrid 5": "70",
  "620 Gran Turismo": "144",
  "628": "27",
  "630": "28",
  "630 Gran Turismo": "127",
  "633": "29",
  "635": "30",
  "640": "68",
  "640 Gran Coupé": "94",
  "640 Gran Turismo": "128",
  "645": "31",
  "650": "32",
  "650 Gran Coupé": "95",
  "725": "33",
  "728": "34",
  "730": "35",
  "732": "36",
  "735": "37",
  "740": "38",
  "745": "39",
  "750": "40",
  "760": "41",
  "ActiveHybrid 7": "63",
  "840": "42",
  "850": "43",
  "i3": "79",
  "i4": "330",
  "i5": "341",
  "i7": "336",
  "i8": "89",
  "iX": "331",
  "iX1": "337",
  "iX2": "346",
  "iX3": "329",
  "M135": "69",
  "M140i": "122",
  "M2": "117",
  "M235": "85",
  "M240i": "123",
  "M3": "45",
  "M340d": "342",
  "M340i": "152",
  "M4": "93",
  "M440": "335",
  "M5": "46",
  "M550": "86",
  "M6": "47",
  "M760": "126",
  "M8": "154",
  "M850": "140",
  "ActiveHybrid X6": "64",
  "X1": "6",
  "X2": "129",
  "X3": "48",
  "X3 M": "145",
  "X3 M40": "153",
  "X3 M50": "348",
  "X4": "92",
  "X4 M": "146",
  "X4 M40": "119",
  "X5": "49",
  "X5 M": "53",
  "X5 M50": "96",
  "X5 M60": "339",
  "X6": "60",
  "X6 M": "62",
  "X6 M50": "97",
  "X6 M60": "340",
  "X7": "143",
  "X7 M50": "332",
  "X7 M60": "347",
  "XM": "338",
  "Z1": "50",
  "Z3": "51",
  "Z3 M": "57",
  "Z4": "52",
  "Z4 M": "55",
  "Z4 M40": "349",
  "Z8": "54",
  "Other": "1",
};

const generatedMobileModelCatalog = globalThis.AUTOGOOD_MOBILE_MODEL_CATALOG || {};
Object.assign(modelGroupsByBrand, generatedMobileModelCatalog.groups || {});
const generatedMobileBrandRoutes = Object.fromEntries(
  Object.keys(generatedMobileModelCatalog.makeKeys || {}).map((brand) => [brand, {}]),
);
function mobileBrandRoutes(routeData = {}) {
  const catalogBrands = Object.keys(generatedMobileBrandRoutes);
  if (!catalogBrands.length) return routeData && Object.keys(routeData).length ? routeData : fallbackBrands;
  return Object.fromEntries(catalogBrands.map((brand) => [brand, routeData[brand] || {}]));
}
const mobileModelCatalogAliases = {
  "Vw Nutzfahrzeuge": "Volkswagen",
};
const mobileDeModelIdsByBrand = {
  BMW: mobileDeBmwModelIds,
  ...(generatedMobileModelCatalog.modelIds || {}),
};

const state = {
  lang: new URLSearchParams(window.location.search).get("lang") === "ru" ? "ru" : "pl",
  mode: null,
  data: null,
  status: "idle",
  error: "",
  brandRoutes: mobileBrandRoutes(fallbackBrands),
};

const els = {
  form: document.querySelector("[data-mobile-form]"),
  url: document.querySelector("[data-mobile-url]"),
  submit: document.querySelector("[data-mobile-submit]"),
  status: document.querySelector("[data-mobile-status]"),
  listingDetails: document.querySelector("[data-mobile-listing-details]"),
  title: document.querySelector("[data-mobile-title]"),
  scenarios: document.querySelector("[data-mobile-scenarios]"),
  brand: document.querySelector("[data-mobile-brand]"),
  brandOptions: document.querySelector("[data-mobile-brand-options]"),
  model: document.querySelector("[data-mobile-model]"),
  version: document.querySelector("[data-mobile-version]"),
  modelOptions: document.querySelector("[data-mobile-model-options]"),
  fuels: Array.from(document.querySelectorAll("[data-mobile-fuel]")),
  fuelSummary: document.querySelector("[data-mobile-fuel-summary]"),
  body: document.querySelector("[data-mobile-body]"),
  bodyLabel: document.querySelector("[data-mobile-body-label]"),
  mileageFrom: document.querySelector("[data-mobile-mileage-from]"),
  mileageTo: document.querySelector("[data-mobile-mileage-to]"),
  mileageOptions: document.querySelector("[data-mobile-mileage-options]"),
  yearFrom: document.querySelector("[data-mobile-year-from]"),
  yearTo: document.querySelector("[data-mobile-year-to]"),
  yearOptions: document.querySelector("[data-mobile-year-options]"),
  displacementFrom: document.querySelector("[data-mobile-displacement-from]"),
  displacementTo: document.querySelector("[data-mobile-displacement-to]"),
  displacementOptions: document.querySelector("[data-mobile-displacement-options]"),
  powerFrom: document.querySelector("[data-mobile-power-from]"),
  powerTo: document.querySelector("[data-mobile-power-to]"),
  seatsFrom: document.querySelector("[data-mobile-seats-from]"),
  seatsTo: document.querySelector("[data-mobile-seats-to]"),
  powerOptions: document.querySelector("[data-mobile-power-options]"),
  drive: Array.from(document.querySelectorAll("[data-mobile-drive]")),
  gearbox: Array.from(document.querySelectorAll("[data-mobile-gearbox]")),
  vat: document.querySelector("[data-mobile-vat]"),
  vatLabel: document.querySelector("[data-mobile-vat-label]"),
  seller: document.querySelector("[data-mobile-seller]"),
  sellerLabel: document.querySelector("[data-mobile-seller-label]"),
  countries: Array.from(document.querySelectorAll("[data-mobile-country]")),
  countrySummary: document.querySelector("[data-mobile-country-summary]"),
  interiorMaterials: Array.from(document.querySelectorAll("[data-mobile-interior-material]")),
  airConditioning: Array.from(document.querySelectorAll("[data-mobile-air-conditioning]")),
  trailerCoupling: Array.from(document.querySelectorAll("[data-mobile-trailer-coupling]")),
  features: Array.from(document.querySelectorAll("[data-mobile-feature]")),
  parkingSensors: Array.from(document.querySelectorAll("[data-mobile-parking-sensor]")),
  cruiseControl: Array.from(document.querySelectorAll("[data-mobile-cruise-control]")),
  exteriorColors: Array.from(document.querySelectorAll("[data-mobile-exterior-color]")),
  interiorColors: Array.from(document.querySelectorAll("[data-mobile-interior-color]")),
  matte: document.querySelector("[data-mobile-matte]"),
  metallic: document.querySelector("[data-mobile-metallic]"),
  nonSmoking: document.querySelector("[data-mobile-non-smoking]"),
  roadworthy: document.querySelector("[data-mobile-roadworthy]"),
  damagedVehicles: document.querySelector("[data-mobile-damaged-vehicles]"),
  damagedVehiclesLabel: document.querySelector("[data-mobile-damaged-label]"),
  marketSearch: document.querySelector("[data-mobile-market-search]"),
  marketSearchStatus: document.querySelector("[data-mobile-market-search-status]"),
  manualResets: Array.from(document.querySelectorAll("[data-mobile-manual-reset]")),
  selectedFilters: document.querySelector("[data-mobile-selected-filters]"),
  methodChooser: document.querySelector("[data-mobile-method-chooser]"),
  methodViews: Array.from(document.querySelectorAll("[data-mobile-method-view]")),
};

function readMobileDeApiUrl() {
  const configuredUrl = window.AUTOGOOD_MOBILEDE_API_URL;
  const params = new URLSearchParams(window.location.search);
  const queryUrl = params.get("mobiledeApi");
  return configuredUrl || queryUrl || DEFAULT_MOBILEDE_API_URL;
}

function formatAmount(value, currency) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return copy[state.lang].emptyValue;
  return `${Math.round(amount).toLocaleString("pl-PL")} ${currency}`;
}

function formatNumberWithUnit(value, unit) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return copy[state.lang].emptyValue;
  return `${Math.round(amount).toLocaleString("pl-PL")} ${unit}`;
}

function text(value) {
  return value === null || value === undefined || value === "" ? copy[state.lang].emptyValue : String(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function datalistOptionHtml(value, label = "") {
  return `<option value="${escapeHtml(value)}"${label ? ` label="${escapeHtml(label)}"` : ""}></option>`;
}

function normalizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function renderI18n() {
  const c = copy[state.lang];
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (c[key]) node.textContent = c[key];
  });
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.classList.toggle("isActive", button.dataset.langButton === state.lang);
  });
  const label = els.submit?.querySelector("span");
  if (label) label.textContent = state.status === "loading" ? c.loadingButton : c.loadButton;
  els.manualResets.forEach((button) => {
    button.setAttribute("aria-label", c.clearManualFilters);
    button.title = c.clearManualFilters;
  });
  setRangePlaceholders();
  renderManualOptions(true);
}

function setMode(mode) {
  state.mode = mode === "listing" || mode === "manual" ? mode : null;
  els.methodChooser.hidden = Boolean(state.mode);
  els.methodViews.forEach((view) => {
    view.hidden = view.dataset.mobileMethodView !== state.mode;
  });

  if (state.mode === "listing") {
    requestAnimationFrame(() => els.url?.focus());
  }
}

function detailRow(label, value) {
  return `<div class="mobileDataRow"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function purchaseTypeLabel(data) {
  const rawValue = [
    data?.purchaseType,
    data?.taxType,
    data?.vatType,
    data?.priceType,
    data?.priceTaxType,
    data?.price?.type,
    data?.price?.taxType,
    data?.price?.vatType,
  ].find((value) => value !== null && value !== undefined && String(value).trim() !== "");
  const normalized = String(rawValue || "").toLowerCase();
  if (/marża|marza|margin|marge|differenz/.test(normalized)) return "Marża";
  if (/vat|mwst|ust|tax|netto|deduct/.test(normalized)) return "VAT";
  return rawValue ? String(rawValue) : copy[state.lang].emptyValue;
}

function brandDisplayOptions() {
  const favoriteValues = new Set(favoriteBrands.map((brand) => brand.value));
  const favorites = favoriteBrands.filter((brand) => state.brandRoutes[brand.value]);
  const regularBrands = Object.keys(state.brandRoutes)
    .filter((brand) => !favoriteValues.has(brand))
    .sort((left, right) => left.localeCompare(right, "pl"));
  return [
    ...favorites.map((brand) => ({ value: brand.value, label: `★ ${brand.label}` })),
    ...regularBrands.map((brand) => ({
      value: brand,
      label: generatedMobileModelCatalog.makeLabels?.[brand] || brand,
    })),
  ];
}

function canonicalBrand(value) {
  const normalized = normalizeToken(value);
  if (!normalized) return "";
  return Object.keys(state.brandRoutes).find((brand) => {
    const aliases = [
      brand,
      generatedMobileModelCatalog.makeLabels?.[brand],
      ...(brandAliases[brand] || []),
    ];
    return aliases.some((alias) => normalizeToken(alias) === normalized);
  }) || "";
}

function brandCatalogOptions() {
  const favoriteValues = new Set(favoriteBrands.map((brand) => brand.value));
  const favorites = favoriteBrands.filter((brand) => state.brandRoutes[brand.value]);
  const regularBrands = Object.keys(state.brandRoutes)
    .filter((brand) => !favoriteValues.has(brand))
    .sort((left, right) => left.localeCompare(right, "pl"));
  return [
    ...favorites.map((brand) => ({ value: brand.value, label: brand.label, isPopular: true })),
    ...regularBrands.map((brand) => ({
      value: brand,
      label: generatedMobileModelCatalog.makeLabels?.[brand] || brand,
      isPopular: false,
    })),
  ];
}

function renderBrandOptions(extraBrand = "") {
  if (!els.brandOptions) return;
  const options = brandCatalogOptions();
  const known = options.some((brand) => normalizeToken(brand.value) === normalizeToken(extraBrand));
  if (extraBrand && !known) options.unshift({ value: extraBrand, label: extraBrand });
  els.brandOptions.innerHTML = options.map((brand) => datalistOptionHtml(brand.value, brand.label)).join("");
}

function mileageOptions() {
  const values = [];
  for (let value = 0; value <= 500000; value += 10000) values.push(value);
  return values;
}

function yearOptions() {
  const currentYear = new Date().getFullYear();
  const values = [];
  for (let year = currentYear + 1; year >= 1990; year -= 1) values.push(String(year));
  return values;
}

function renderDatalist(el, values) {
  if (!el) return;
  el.innerHTML = values.map((value) => datalistOptionHtml(String(value))).join("");
}

function modelMenuGroupLabel(group) {
  const rawGroup = String(group || "").trim();
  if (/^(pozostałe|other)\b/i.test(rawGroup)) return "";
  return rawGroup.replace(/\s*\(alle\)\s*/i, "").trim();
}

function escapeModelPrefix(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function seriesBaseModel(group) {
  const models = Array.isArray(group?.models) ? group.models : [];
  if (models.length < 2) return "";

  const rawGroup = String(group?.group || "").trim().replace(/\s*\(alle\)\s*$/i, "");
  if (!rawGroup || /^(pozostałe|other)\b/i.test(rawGroup) || /\b(models?|modelle)\b/i.test(rawGroup)) return "";

  const candidate = rawGroup.replace(/(?:\s+|-)(?:class|klasse|series|serie)$/i, "").trim();
  if (!candidate || /\b(other|others|pozostałe)\b/i.test(candidate)) return "";
  if (models.some((model) => normalizeToken(model) === normalizeToken(candidate))) return "";

  const prefix = escapeModelPrefix(candidate);
  const pattern = /^\d+$/.test(candidate)
    ? new RegExp(`^${prefix}(?:\\d|\\s|-)`, "i")
    : new RegExp(`^${prefix}(?:\\s|-)`, "i");
  return models.filter((model) => pattern.test(model)).length >= 2 ? candidate : "";
}

function withSeriesBaseModels(groups) {
  const assignments = new Map();
  groups.forEach((group, index) => {
    const baseModel = seriesBaseModel(group);
    const normalized = normalizeToken(baseModel);
    if (baseModel && normalized && !assignments.has(normalized)) {
      assignments.set(normalized, { index, baseModel });
    }
  });

  return groups.map((group, index) => {
    const assignment = [...assignments.values()].find((item) => item.index === index);
    const models = group.models.filter((model) => {
      const destination = assignments.get(normalizeToken(model));
      return !destination || destination.index === index;
    });
    return assignment ? { ...group, models: [assignment.baseModel, ...models] } : { ...group, models };
  });
}

function modelGroupsForBrand(brand) {
  const catalogBrand = canonicalBrand(brand) || brand;
  const groups = modelGroupsByBrand[mobileModelCatalogAliases[catalogBrand] || catalogBrand] || [];
  return withSeriesBaseModels(groups);
}

function renderModelOptions(extraModel = "") {
  if (!els.modelOptions) return;
  const groups = modelGroupsForBrand(els.brand?.value || "");
  const seen = new Set();
  const options = groups.flatMap((group) => group.models.map((model) => {
    seen.add(normalizeToken(model));
    return datalistOptionHtml(model, model);
  }));
  const normalizedExtra = normalizeToken(extraModel);
  if (extraModel && !seen.has(normalizedExtra)) {
    options.unshift(datalistOptionHtml(extraModel, extraModel));
  }
  els.modelOptions.innerHTML = options.join("");
}

function comboOptionSets() {
  const modelGroups = modelGroupsForBrand(els.brand?.value || "");
  const c = copy[state.lang];
  const seenModels = new Set();
  const models = modelGroups.flatMap((group) => group.models.flatMap((model) => {
    const normalized = normalizeToken(model);
    if (seenModels.has(normalized)) return [];
    seenModels.add(normalized);
    return [{ value: model, label: model, group: group.group }];
  }));
  const currentModel = String(els.model?.value || "").trim();
  if (currentModel && !seenModels.has(normalizeToken(currentModel))) {
    models.unshift({ value: currentModel, label: currentModel });
  }
  const valuesAfter = (values, fromValue, allowSame = false) => values
    .filter((value) => isAllowedRangeEndValue(value, fromValue, allowSame));
  const mileage = mileageOptions();
  const years = yearOptions();
  const displacement = displacementOptions;
  const power = powerOptions;
  return {
    brand: brandCatalogOptions(),
    model: models,
    mileage: mileage.map((value) => ({
      value: String(value),
      label: `${value.toLocaleString("pl-PL")} km`,
    })),
    mileageTo: valuesAfter(mileage, els.mileageFrom?.value).map((value) => ({
      value: String(value),
      label: `${value.toLocaleString("pl-PL")} km`,
    })),
    year: years.map((value) => ({ value, label: value })),
    yearTo: valuesAfter(years, els.yearFrom?.value, true).map((value) => ({ value, label: value })),
    displacement: displacement.map((value) => ({
      value,
      label: `${value} ccm`,
    })),
    displacementTo: valuesAfter(displacement, els.displacementFrom?.value).map((value) => ({
      value,
      label: `${value} ccm`,
    })),
    power: power.map((value) => ({
      value,
      label: `${value} KM`,
    })),
    powerTo: valuesAfter(power, els.powerFrom?.value).map((value) => ({
      value,
      label: `${value} KM`,
    })),
    seats: seatsOptions.map((value) => ({ value, label: value })),
    seatsTo: valuesAfter(seatsOptions, els.seatsFrom?.value, true).map((value) => ({ value, label: value })),
    body: [
      { value: "", label: c.selectEmpty },
      ...bodyOptions.map((body) => ({
      value: body.value,
      label: body[state.lang],
      })),
    ],
    vat: [
      { value: "", label: c.vatAny },
      { value: "reclaimable", label: c.vatReclaimable },
      { value: "non_reclaimable", label: c.vatNonReclaimable },
    ],
    seller: [
      { value: "", label: c.sellerAny },
      { value: "dealer", label: c.sellerDealer },
      { value: "private", label: c.sellerPrivate },
      { value: "company", label: c.sellerCompany },
    ],
    damaged: [
      { value: "hide", label: c.damagedVehiclesHide },
      { value: "show", label: c.damagedVehiclesShow },
    ],
  };
}

function closeComboMenus(exceptControl = null) {
  document.querySelectorAll(".mobileComboControl.isOpen").forEach((control) => {
    if (control === exceptControl) return;
    control.classList.remove("isOpen");
    control.setAttribute("aria-expanded", "false");
  });
}

function closeMultiSelects(exceptSelect = null) {
  document.querySelectorAll(".mobileMultiSelect[open]").forEach((select) => {
    if (select !== exceptSelect) select.removeAttribute("open");
  });
}

function renderComboMenus(filterControl = null) {
  const sets = comboOptionSets();
  document.querySelectorAll(".mobileComboControl[data-mobile-options]").forEach((control) => {
    const options = sets[control.dataset.mobileOptions] || [];
    const targetName = control.dataset.mobileOptionsTarget;
    const input = targetName ? control.querySelector(`[${targetName}]`) : null;
    const filter = control === filterControl ? normalizeToken(input?.value || "") : "";
    const visibleOptions = filter
      ? options.filter((option) => normalizeToken(`${option.label} ${option.value}`).includes(filter))
      : options;
    let menu = control.querySelector(".mobileComboMenu");
    if (!menu) {
      menu = document.createElement("div");
      menu.className = "mobileComboMenu";
      control.append(menu);
    }
    control.setAttribute("aria-expanded", control.classList.contains("isOpen") ? "true" : "false");
    const menuType = control.dataset.mobileOptions;
    let previousGroup = null;
    let previousPopular = null;
    menu.innerHTML = visibleOptions.flatMap((option) => {
      const items = [];
      if (menuType === "brand" && previousPopular === true && !option.isPopular) {
        items.push('<div class="mobileComboMenuDivider" aria-hidden="true"></div>');
      }
      if (menuType === "model" && option.group && option.group !== previousGroup) {
        const groupLabel = modelMenuGroupLabel(option.group);
        if (groupLabel) items.push(`<div class="mobileComboMenuGroup">${escapeHtml(groupLabel)}</div>`);
        else if (previousGroup) items.push('<div class="mobileComboMenuDivider" aria-hidden="true"></div>');
      }
      items.push(`
        <button class="${option.isPopular ? "isPopular" : ""}" type="button" data-mobile-option-value="${escapeHtml(option.value)}" data-mobile-option-label="${escapeHtml(option.label)}">
          ${escapeHtml(option.label)}
        </button>
      `);
      previousGroup = option.group || previousGroup;
      previousPopular = Boolean(option.isPopular);
      return items;
    }).join("");
  });
}

function openComboMenu(control, filterControl = null) {
  if (!control) return;
  closeComboMenus(control);
  control.classList.add("isOpen");
  control.setAttribute("aria-expanded", "true");
  renderComboMenus(filterControl);
}

function checkedValue(radios) {
  return radios.find((radio) => radio.checked)?.value || "";
}

function checkedValues(inputs) {
  return inputs.filter((input) => input.checked).map((input) => input.value);
}

function setCheckedValues(inputs, values) {
  const selected = new Set(values || []);
  inputs.forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function updateCountrySummary() {
  if (!els.countrySummary) return;
  const selected = els.countries.filter((input) => input.checked)
    .map((input) => input.closest("label")?.innerText.trim())
    .filter(Boolean);
  els.countrySummary.textContent = selected.length ? selected.join(", ") : copy[state.lang].selectEmpty;
}

function manualFuelValues(filters) {
  const values = Array.isArray(filters?.fuels) ? filters.fuels : [];
  const legacyValues = [
    filters?.fuel,
    filters?.plugin === "yes" ? "plugin" : "",
  ];
  return [...new Set([...values, ...legacyValues].filter(Boolean))];
}

function updateFuelSummary() {
  if (!els.fuelSummary) return;
  const selected = selectedInputLabels(els.fuels);
  els.fuelSummary.textContent = selected.length ? selected.join(", ") : copy[state.lang].selectEmpty;
}

function setCheckedValue(radios, value) {
  radios.forEach((radio) => {
    radio.checked = radio.value === value;
  });
}

function setRangePlaceholders() {
  const c = copy[state.lang];
  [
    [els.mileageFrom, c.fromPlaceholder],
    [els.yearFrom, c.fromPlaceholder],
    [els.displacementFrom, c.fromPlaceholder],
    [els.powerFrom, c.fromPlaceholder],
    [els.mileageTo, c.toPlaceholder],
    [els.yearTo, c.toPlaceholder],
    [els.displacementTo, c.toPlaceholder],
    [els.powerTo, c.toPlaceholder],
  ].forEach(([input, placeholder]) => {
    if (input) input.placeholder = placeholder;
  });
}

function mileageBucket(value, mode) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "";
  const bucket = mode === "to"
    ? Math.ceil(amount / 10000) * 10000
    : Math.floor(amount / 10000) * 10000;
  return String(Math.min(Math.max(bucket, 0), 500000));
}

function extractYear(value) {
  const match = String(value || "").match(/\b(19\d{2}|20\d{2})\b/);
  return match ? match[1] : "";
}

function compactNumber(value) {
  const match = String(value || "").replace(/\s+/g, "").match(/\d+/);
  return match ? match[0] : "";
}

function optionLabel(options, value) {
  const option = options.find((item) => item.value === value);
  return option ? option[state.lang] : "";
}

function setComboDisplay(input, value, options, emptyLabel = copy[state.lang].selectEmpty) {
  if (!input) return;
  input.value = value ? optionLabel(options, value) : "";
  input.placeholder = emptyLabel;
}

function setBodyDisplay(value) {
  setComboDisplay(els.bodyLabel, value, bodyOptions);
}

function setSimpleSelectDisplays(values) {
  const c = copy[state.lang];
  setComboDisplay(els.vatLabel, values.vat, [
    { value: "reclaimable", [state.lang]: c.vatReclaimable },
    { value: "non_reclaimable", [state.lang]: c.vatNonReclaimable },
  ], c.vatAny);
  setComboDisplay(els.sellerLabel, values.seller, [
    { value: "dealer", [state.lang]: c.sellerDealer },
    { value: "private", [state.lang]: c.sellerPrivate },
    { value: "company", [state.lang]: c.sellerCompany },
  ], c.sellerAny);
  setComboDisplay(els.damagedVehiclesLabel, values.damagedVehicles, [
    { value: "hide", [state.lang]: c.damagedVehiclesHide },
    { value: "show", [state.lang]: c.damagedVehiclesShow },
  ], c.damagedVehiclesHide);
}

function listingBodyLabel(value) {
  const normalized = normalizeBody(value);
  return optionLabel(bodyOptions, normalized) || text(value);
}

function listingGearboxLabel(value) {
  const normalized = String(value || "").toLowerCase();
  if (/auto|automat|automatic|automatyczna/.test(normalized)) return copy[state.lang].gearboxAutomatic;
  if (/manual|schalt|manualna|ręczna|reczna/.test(normalized)) return copy[state.lang].gearboxManual;
  return text(value);
}

function normalizeGearboxChoice(value) {
  const normalized = String(value || "").toLowerCase();
  if (/auto|automat|automatic|automatyczna/.test(normalized)) return "automatic";
  if (/manual|schalt|manualna|ręczna|reczna/.test(normalized)) return "manual";
  return "any";
}

function listingRegistration(value) {
  const year = extractYear(value);
  if (year && String(value).trim() !== year) return `${year} (${String(value).trim()})`;
  return text(value || year);
}

function defaultManualFields() {
  return {
    brand: "",
    model: "",
    version: "",
    fuels: [],
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
    countries: ["DE"],
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
    nonSmoking: true,
    roadworthy: true,
    damagedVehicles: "hide",
  };
}

function renderManualOptions(keepValues = true) {
  const c = copy[state.lang];
  const current = keepValues ? readManualFields() : defaultManualFields();

  const currentBrand = canonicalBrand(current.brand) || current.brand || "";
  els.brand.value = currentBrand;
  els.brand.placeholder = c.selectEmpty;
  renderBrandOptions(currentBrand);

  setCheckedValues(els.fuels, manualFuelValues(current));

  els.body.value = current.body || "";
  setBodyDisplay(current.body);

  els.vat.value = current.vat || "";
  els.seller.value = current.seller || "";
  els.damagedVehicles.value = current.damagedVehicles || "hide";
  setSimpleSelectDisplays({
    vat: current.vat,
    seller: current.seller,
    damagedVehicles: current.damagedVehicles || "hide",
  });

  els.model.value = current.model || "";
  els.version.value = current.version || "";
  renderModelOptions(current.model);
  renderDatalist(els.mileageOptions, mileageOptions());
  renderDatalist(els.yearOptions, yearOptions());
  renderDatalist(els.displacementOptions, displacementOptions);
  renderDatalist(els.powerOptions, powerOptions);
  renderComboMenus();
  els.mileageFrom.value = current.mileageFrom || "";
  els.mileageTo.value = current.mileageTo || "";
  els.yearFrom.value = current.yearFrom || "";
  els.yearTo.value = current.yearTo || "";
  els.displacementFrom.value = current.displacementFrom || "";
  els.displacementTo.value = current.displacementTo || "";
  els.powerFrom.value = current.powerFrom || "";
  els.powerTo.value = current.powerTo || "";
  els.seatsFrom.value = current.seatsFrom || "";
  els.seatsTo.value = current.seatsTo || "";
  setCheckedValue(els.drive, current.drive || "any");
  setCheckedValue(els.gearbox, current.gearbox || "any");
  setCheckedValues(els.countries, current.countries?.length ? current.countries : ["DE"]);
  setCheckedValues(els.interiorMaterials, current.interiorMaterials);
  setCheckedValue(els.airConditioning, current.airConditioning || "");
  setCheckedValue(els.trailerCoupling, current.trailerCoupling || "any");
  setCheckedValues(els.features, current.features);
  setCheckedValues(els.parkingSensors, current.parkingSensors);
  setCheckedValue(els.cruiseControl, current.cruiseControl || "any");
  setCheckedValues(els.exteriorColors, current.exteriorColors);
  setCheckedValues(els.interiorColors, current.interiorColors);
  els.matte.checked = Boolean(current.matte);
  els.metallic.checked = Boolean(current.metallic);
  els.nonSmoking.checked = Boolean(current.nonSmoking);
  els.roadworthy.checked = Boolean(current.roadworthy);
  updateFuelSummary();
  updateCountrySummary();
  updateSelectedFiltersSummary();
}

function readManualFields() {
  return {
    brand: canonicalBrand(els.brand?.value) || String(els.brand?.value || "").trim(),
    model: els.model?.value || "",
    version: els.version?.value || "",
    fuels: checkedValues(els.fuels),
    fuel: checkedValues(els.fuels).find((value) => value !== "plugin") || "",
    plugin: checkedValues(els.fuels).includes("plugin") ? "yes" : "",
    body: els.body?.value || "",
    mileageFrom: els.mileageFrom?.value || "",
    mileageTo: els.mileageTo?.value || "",
    yearFrom: els.yearFrom?.value || "",
    yearTo: els.yearTo?.value || "",
    displacementFrom: els.displacementFrom?.value || "",
    displacementTo: els.displacementTo?.value || "",
    powerFrom: els.powerFrom?.value || "",
    powerTo: els.powerTo?.value || "",
    seatsFrom: els.seatsFrom?.value || "",
    seatsTo: els.seatsTo?.value || "",
    drive: checkedValue(els.drive),
    gearbox: checkedValue(els.gearbox),
    vat: els.vat?.value || "",
    seller: els.seller?.value || "",
    countries: checkedValues(els.countries),
    interiorMaterials: checkedValues(els.interiorMaterials),
    airConditioning: checkedValue(els.airConditioning),
    trailerCoupling: checkedValue(els.trailerCoupling) || "any",
    features: checkedValues(els.features),
    parkingSensors: checkedValues(els.parkingSensors),
    cruiseControl: checkedValue(els.cruiseControl) || "any",
    exteriorColors: checkedValues(els.exteriorColors),
    interiorColors: checkedValues(els.interiorColors),
    matte: els.matte?.checked || false,
    metallic: els.metallic?.checked || false,
    nonSmoking: els.nonSmoking?.checked || false,
    roadworthy: els.roadworthy?.checked || false,
    damagedVehicles: els.damagedVehicles?.value || "hide",
  };
}

function optionLabelText(input) {
  return input.closest("label")?.textContent.replace(/\s+/g, " ").trim() || "";
}

function selectedInputLabels(inputs) {
  return inputs
    .filter((input) => input.checked)
    .map(optionLabelText)
    .filter(Boolean);
}

function selectedInputSummaryParts(inputs, icon) {
  return inputs
    .filter((input) => input.checked)
    .map((input) => ({
      value: optionLabelText(input),
      icon,
      target: input,
    }))
    .filter((part) => part.value);
}

function selectedRadioSummaryPart(inputs, value, icon) {
  if (!value || value === "any") return null;
  const input = inputs.find((candidate) => candidate.value === value);
  const label = input ? optionLabelText(input) : "";
  return label ? { value: label, icon, target: input } : null;
}

function summaryTargetFor(target) {
  if (!(target instanceof Element)) return "";
  if (!target.dataset.mobileSummaryAnchor) {
    target.dataset.mobileSummaryAnchor = `mobile-summary-target-${document.querySelectorAll("[data-mobile-summary-anchor]").length + 1}`;
  }
  return `[data-mobile-summary-anchor="${target.dataset.mobileSummaryAnchor}"]`;
}

function focusManualFilter(selector) {
  const target = selector ? document.querySelector(selector) : null;
  if (!target) return;
  const multiSelect = target.closest(".mobileMultiSelect");
  if (multiSelect) multiSelect.open = true;
  const scrollTarget = target.closest(".mobileField, .mobileChoiceField, .mobileMultiSelect") || target;
  scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });
  if (typeof target.focus === "function") target.focus({ preventScroll: true });
}

function rangeFilterSummary(label, from, to, unit = "") {
  if (!from && !to) return "";
  const range = [from || copy[state.lang].fromPlaceholder, to || copy[state.lang].toPlaceholder].join(" - ");
  return `${label}: ${range}${unit ? ` ${unit}` : ""}`;
}

function updateSelectedFiltersSummary() {
  if (!els.selectedFilters) return;
  const c = copy[state.lang];
  const filters = readManualFields();
  const parts = [
    { value: [filters.brand, filters.model].filter(Boolean).join(" - "), icon: "", primary: true, target: els.brand },
    { value: filters.version, icon: "list", target: els.version },
    ...selectedInputSummaryParts(els.fuels, "fuel"),
    { value: els.bodyLabel?.value, icon: "car", target: els.bodyLabel },
    { value: rangeFilterSummary(c.mileageRangeLabel, filters.mileageFrom, filters.mileageTo, "km"), icon: "gauge", target: els.mileageFrom },
    { value: rangeFilterSummary(c.yearRangeLabel, filters.yearFrom, filters.yearTo), icon: "calendar", target: els.yearFrom },
    { value: rangeFilterSummary(c.displacementRangeLabel, filters.displacementFrom, filters.displacementTo, "ccm"), icon: "settings", target: els.displacementFrom },
    { value: rangeFilterSummary(c.powerRangeLabel, filters.powerFrom, filters.powerTo, "KM"), icon: "zap", target: els.powerFrom },
    { value: rangeFilterSummary(c.seatsRangeLabel, filters.seatsFrom, filters.seatsTo), icon: "armchair", target: els.seatsFrom },
    selectedRadioSummaryPart(els.gearbox, filters.gearbox, "git-branch"),
    selectedRadioSummaryPart(els.drive, filters.drive, "route"),
    ...selectedInputSummaryParts(els.interiorMaterials, "armchair"),
    selectedRadioSummaryPart(els.airConditioning, filters.airConditioning, "settings"),
    selectedRadioSummaryPart(els.trailerCoupling, filters.trailerCoupling, "route"),
    ...selectedInputSummaryParts(els.features, "settings"),
    ...selectedInputSummaryParts(els.parkingSensors, "car"),
    selectedRadioSummaryPart(els.cruiseControl, filters.cruiseControl, "gauge"),
    ...selectedInputSummaryParts(els.exteriorColors, "palette"),
    ...selectedInputSummaryParts(els.interiorColors, "palette"),
    { value: filters.matte ? c.matteLabel : "", icon: "palette", target: els.matte },
    { value: filters.metallic ? c.metallicLabel : "", icon: "palette", target: els.metallic },
    { value: filters.nonSmoking ? c.nonSmokingLabel : "", icon: "settings", target: els.nonSmoking },
    { value: filters.roadworthy ? c.roadworthyLabel : "", icon: "check", target: els.roadworthy },
    { value: els.vatLabel?.value, icon: "percent", target: els.vatLabel },
    ...selectedInputSummaryParts(els.countries, "map-pin"),
    { value: els.sellerLabel?.value, icon: "store", target: els.sellerLabel },
    { value: filters.damagedVehicles === "show" ? els.damagedVehiclesLabel?.value : "", icon: "alert", target: els.damagedVehiclesLabel },
  ].filter((part) => part?.value);

  els.selectedFilters.replaceChildren();
  if (!parts.length) {
    els.selectedFilters.textContent = c.selectedFiltersEmpty;
    return;
  }

  parts.forEach((part, index) => {
    if (index) {
      const separator = document.createElement("span");
      separator.className = "mobileSelectedFilterSeparator";
      separator.textContent = "-";
      els.selectedFilters.append(separator);
    }

    const item = document.createElement("button");
    item.type = "button";
    item.className = `mobileSelectedFilterItem${part.primary ? " isVehicle" : ""}`;
    const target = summaryTargetFor(part.target);
    if (target) item.dataset.mobileSummaryTarget = target;
    item.title = part.value;
    if (part.icon) {
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("aria-hidden", "true");
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", `./src/mobile-icons.svg?v=manual-seats-roadworthy-20260902#${part.icon}`);
      icon.append(use);
      item.append(icon);
    }
    item.append(document.createTextNode(part.value));
    els.selectedFilters.append(item);
  });
}

function mobileDeNumber(value) {
  const compact = compactNumber(value);
  if (!compact) return null;
  const number = Number(compact);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function isAllowedRangeEndValue(value, fromValue, allowSame = false) {
  const from = mobileDeNumber(fromValue);
  if (from === null) return true;
  const rawValue = String(value || "").trim();
  if (/^<\s*\d/.test(rawValue)) return false;
  const to = mobileDeNumber(rawValue);
  if (to === null) return false;
  if (/^>\s*\d/.test(rawValue)) return to >= from;
  return allowSame ? to >= from : to > from;
}

function syncRangeEndValue(fromInput, toInput, allowSame = false) {
  if (!fromInput?.value || !toInput?.value) return;
  if (!isAllowedRangeEndValue(toInput.value, fromInput.value, allowSame)) toInput.value = "";
}

function mobileDeModelId(brand, model) {
  const normalized = normalizeToken(model);
  const match = Object.entries(mobileDeModelIdsByBrand[brand] || {})
    .find(([label]) => normalizeToken(label) === normalized);
  return match?.[1] || "";
}

function appendMobileDeRange(params, key, fromValue, toValue, transform = (value) => value) {
  const from = mobileDeNumber(fromValue);
  const to = mobileDeNumber(toValue);
  if (from !== null && to !== null && from > to) {
    throw new Error(copy[state.lang].marketSearchInvalidRange);
  }
  if (from === null && to === null) return;
  params.set(key, `${from === null ? "" : transform(from)}:${to === null ? "" : transform(to)}`);
}

function buildMobileDeSearchUrl(filters) {
  const c = copy[state.lang];
  const params = new URLSearchParams();
  params.set("lang", "en");
  params.set("isSearchRequest", "true");
  params.set("s", "Car");
  params.set("vc", "Car");

  if (filters.damagedVehicles !== "show") params.set("dam", "false");

  const makeId = filters.brand ? mobileDeMakeIds[filters.brand] : "";
  const makeKey = filters.brand ? generatedMobileModelCatalog.makeKeys?.[filters.brand] : "";
  let searchBaseUrl = "https://suchen.mobile.de/fahrzeuge/search.html";
  if (filters.brand && !makeId && !makeKey) throw new Error(c.marketSearchUnsupportedBrand);
  if (filters.model && !makeId && !makeKey) throw new Error(c.marketSearchChooseBrand);
  if (makeId) {
    const exactModelId = mobileDeModelId(filters.brand, filters.model);
    const version = String(filters.version || "").trim();
    if (exactModelId) params.set("ms", `${makeId};${exactModelId};;${version}`);
    else if (filters.model || version) {
      params.set("ms", `${makeId};;;${[filters.model, version].filter(Boolean).join(" ").trim()}`);
    } else params.set("ms", makeId);
  } else if (makeKey) {
    const slug = [filters.brand, filters.model]
      .filter(Boolean)
      .join(" ")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    searchBaseUrl = `https://suchen.mobile.de/auto/${slug}.html`;
    const version = String(filters.version || "").trim();
    if (version) params.set("ms", `;;;${version}`);
  }

  const body = mobileDeBodyValues[filters.body];
  if (body) params.set("c", body);

  appendMobileDeRange(params, "ml", filters.mileageFrom, filters.mileageTo);
  appendMobileDeRange(params, "fr", filters.yearFrom, filters.yearTo);
  appendMobileDeRange(params, "cc", filters.displacementFrom, filters.displacementTo);
  appendMobileDeRange(
    params,
    "pw",
    filters.powerFrom,
    filters.powerTo,
    (powerPs) => Math.round(powerPs * 0.735499),
  );
  appendMobileDeRange(params, "seats", filters.seatsFrom, filters.seatsTo);

  manualFuelValues(filters)
    .map((value) => value === "plugin" ? "HYBRID_PLUGIN" : mobileDeFuelValues[value])
    .filter(Boolean)
    .forEach((fuel) => params.append("ft", fuel));

  const drive = mobileDeDriveValues[filters.drive];
  if (drive) params.set("dt", drive);
  const gearbox = mobileDeGearboxValues[filters.gearbox];
  if (gearbox) params.set("tr", gearbox);

  if (filters.vat === "reclaimable") params.set("vat", "1");
  if (filters.vat === "non_reclaimable") params.set("vat", "0");
  const seller = mobileDeSellerValues[filters.seller];
  if (seller) params.set("st", seller);

  filters.countries.forEach((country) => params.append("cn", country));
  filters.interiorMaterials.forEach((material) => {
    const value = mobileDeInteriorMaterialValues[material];
    if (value) params.append("it", value);
  });
  const airConditioning = mobileDeAirConditioningValues[filters.airConditioning];
  if (airConditioning) params.set("clim", airConditioning);
  const trailerCoupling = mobileDeTrailerCouplingValues[filters.trailerCoupling];
  if (trailerCoupling) params.set("tct", trailerCoupling);
  (filters.features || []).forEach((feature) => params.append("fe", feature));
  (filters.parkingSensors || []).forEach((sensor) => params.append("fe", sensor));
  if (filters.cruiseControl && filters.cruiseControl !== "any") params.append("fe", filters.cruiseControl);
  filters.exteriorColors.forEach((color) => params.append("ecol", color.toUpperCase()));
  filters.interiorColors.forEach((color) => {
    params.append("icol", color === "other" ? "OTHER_INTERIOR_COLOR" : color.toUpperCase());
  });
  if (filters.matte) params.append("fe", "MATTE_COLOR");
  if (filters.metallic) params.append("fe", "METALLIC");
  if (filters.nonSmoking) params.append("fe", "NONSMOKER_VEHICLE");
  if (filters.roadworthy) params.set("rd", "true");

  params.set("sb", "p");
  params.set("od", "up");
  return `${searchBaseUrl}?${params.toString()}`;
}

function setMarketSearchStatus(message, isError = false) {
  if (!els.marketSearchStatus) return;
  els.marketSearchStatus.textContent = message;
  els.marketSearchStatus.classList.toggle("isError", isError);
}

function matchBrand(title) {
  const normalizedTitle = normalizeToken(title);
  const options = brandDisplayOptions().map((brand) => {
    const aliases = [brand.value, brand.label.replace(/^★\s*/, ""), ...(brandAliases[brand.value] || [])];
    const score = aliases.some((alias) => normalizedTitle.startsWith(normalizeToken(alias)))
      ? Math.max(...aliases.map((alias) => normalizeToken(alias).length))
      : 0;
    return { value: brand.value, score, aliases };
  }).filter((brand) => brand.score > 0);

  options.sort((left, right) => right.score - left.score);
  return options[0] || null;
}

function extractModel(title, brandMatch) {
  let model = String(title || "").trim();
  if (!model || !brandMatch) return model;
  const aliases = [brandMatch.value, ...(brandAliases[brandMatch.value] || [])]
    .sort((left, right) => right.length - left.length);
  for (const alias of aliases) {
    const pattern = new RegExp(`^${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
    if (pattern.test(model)) {
      model = model.replace(pattern, "").trim();
      break;
    }
  }
  return model.replace(/\s{2,}/g, " ");
}

function normalizeFuel(value, title = "") {
  const normalized = normalizeToken(`${value} ${title}`);
  const hasPlugin = /plug in|plugin|phev/.test(normalized);
  const hasHybrid = /hybrid|hybryd|hev|phev/.test(normalized);
  if (/electric|elektro|elektryk|bev/.test(normalized)) return "electric";
  if (/diesel|olej napedowy/.test(normalized) && hasHybrid) return "hybrid_diesel";
  if (/(petrol|benzin|benzyna|gasoline)/.test(normalized) && hasHybrid) return "hybrid_petrol";
  if (/diesel|olej napedowy/.test(normalized)) return "diesel";
  if (/petrol|benzin|benzyna|gasoline/.test(normalized)) return "petrol";
  return "";
}

function normalizePlugin(value, title = "") {
  const normalized = normalizeToken(`${value} ${title}`);
  return /plug in|plugin|phev/.test(normalized) ? "yes" : "";
}

function normalizeBody(value) {
  const normalized = normalizeToken(value);
  if (/kombi|estate|touring|avant|variant|wagon/.test(normalized)) return "estate";
  if (/suv|teren|off road|offroad|gelande/.test(normalized)) return "suv";
  if (/hatch|compact|small car|kleinwagen/.test(normalized)) return "hatchback";
  if (/coupe|coup/.test(normalized)) return "coupe";
  if (/cabrio|convertible|roadster/.test(normalized)) return "cabrio";
  if (/van|minibus|bus|mpv/.test(normalized)) return "van_minibus";
  if (/pickup|pick up/.test(normalized)) return "pickup";
  if (/limousine|sedan|saloon/.test(normalized)) return "limousine";
  return value ? "other" : "";
}

function applyRecognizedManualFields(data) {
  const title = data?.title || "";
  const brandMatch = matchBrand(title);
  const model = extractModel(title, brandMatch);
  const registrationYear = extractYear(data?.firstRegistration);
  const displacementCcm = compactNumber(data?.displacementCcm);
  const powerHp = compactNumber(data?.powerHp ?? data?.horsepower ?? data?.powerPs);
  const next = {
    brand: brandMatch?.value || "",
    model,
    fuels: [
      normalizeFuel(data?.fuel, title),
      normalizePlugin(data?.fuel, title) === "yes" ? "plugin" : "",
    ].filter(Boolean),
    body: normalizeBody(data?.bodyType),
    mileageFrom: mileageBucket(data?.mileageKm, "from"),
    mileageTo: mileageBucket(data?.mileageKm, "to"),
    yearFrom: registrationYear,
    yearTo: registrationYear,
    displacementFrom: displacementCcm,
    displacementTo: displacementCcm,
    powerFrom: powerHp,
    powerTo: powerHp,
    gearbox: normalizeGearboxChoice(data?.gearbox),
  };

  els.brand.value = next.brand;
  els.model.value = next.model;
  setCheckedValues(els.fuels, next.fuels);
  els.body.value = next.body;
  setBodyDisplay(next.body);
  els.mileageFrom.value = next.mileageFrom;
  els.mileageTo.value = next.mileageTo;
  els.yearFrom.value = next.yearFrom;
  els.yearTo.value = next.yearTo;
  els.displacementFrom.value = next.displacementFrom;
  els.displacementTo.value = next.displacementTo;
  els.powerFrom.value = next.powerFrom;
  els.powerTo.value = next.powerTo;
  setCheckedValue(els.drive, "any");
  setCheckedValue(els.gearbox, next.gearbox);

  renderModelOptions(next.model);
  updateFuelSummary();
  updateSelectedFiltersSummary();
}

function calculatorUrl(scenario) {
  if (!state.data) return "#";
  const params = new URLSearchParams();
  params.set("tab", String(scenario.tab));
  params.set("source", "mobile");
  params.set("scenario", scenario.key);
  if (state.lang === "ru") params.set("lang", "ru");
  if (state.data.sourceUrl) params.set("mobileUrl", state.data.sourceUrl);
  if (state.data.carBruttoEur) params.set("car", String(Math.round(Number(state.data.carBruttoEur))));
  if (state.data.transportNettoPln) params.set("transport", String(Math.round(Number(state.data.transportNettoPln))));
  if (state.data.inspectionNettoPln) params.set("inspection", String(Math.round(Number(state.data.inspectionNettoPln))));
  if (Number.isInteger(Number(state.data.engineTypeIndex))) params.set("engine", String(Number(state.data.engineTypeIndex)));
  return `./calculators.html?${params.toString()}`;
}

function renderScenarios() {
  const c = copy[state.lang];
  els.scenarios.innerHTML = c.scenarios.map((scenario) => {
    const disabled = !state.data;
    const href = disabled ? "#" : calculatorUrl(scenario);
    return `
      <a class="mobileScenarioCard" href="${escapeHtml(href)}" aria-disabled="${disabled ? "true" : "false"}">
        <b>${escapeHtml(scenario.number)}</b>
        <span>
          <strong>${escapeHtml(scenario.title)}</strong>
        </span>
        <i aria-hidden="true">→</i>
      </a>
    `;
  }).join("");
}

function renderData() {
  const c = copy[state.lang];
  const data = state.data || {};
  const location = data.location || {};
  const estimate = data.deliveryInspectionEstimate || data.transportEstimate || {};
  const title = text(data.title);
  const powerValue = data.powerHp ?? data.horsepower ?? data.powerPs;

  els.title.textContent = title;
  const listingRows = [
    detailRow(c.price, formatAmount(data.carBruttoEur, "EUR")),
    detailRow(c.purchaseType, purchaseTypeLabel(data)),
    detailRow(c.fuel, text(data.fuel)),
    detailRow(c.body, listingBodyLabel(data.bodyType)),
    detailRow(c.mileage, formatNumberWithUnit(data.mileageKm, "km")),
    detailRow(c.registration, listingRegistration(data.firstRegistration)),
    detailRow(c.displacement, formatNumberWithUnit(data.displacementCcm, "ccm")),
    detailRow(c.power, formatNumberWithUnit(powerValue, "KM")),
    detailRow(c.gearbox, listingGearboxLabel(data.gearbox)),
  ].join("");
  const calculatorRows = [
    detailRow(c.engine, text(data.engineTypeLabel)),
    detailRow(c.delivery, formatAmount(data.transportNettoPln ?? estimate.transport, "PLN")),
    detailRow(c.inspection, formatAmount(data.inspectionNettoPln ?? estimate.inspection, "PLN")),
    detailRow(c.tariff, text(estimate.rule)),
    detailRow(c.location, text(location.address || location.city)),
    detailRow(c.seller, text(location.sellerName)),
  ].join("");
  els.listingDetails.innerHTML = `
    <dl class="mobileDataGrid">${listingRows}</dl>
    <section class="mobileCalculatorDataBlock">
      <p>${escapeHtml(c.calculatorDataEyebrow)}</p>
      <dl class="mobileDataGrid">${calculatorRows}</dl>
    </section>
  `;

  renderScenarios();
}

function setStatus(status, message = "") {
  const c = copy[state.lang];
  state.status = status;
  state.error = message;
  els.status.classList.toggle("isError", status === "error");
  els.status.classList.toggle("isSuccess", status === "ready");
  els.status.textContent = status === "loading"
    ? c.loading
    : status === "ready"
      ? c.ready
      : status === "error"
        ? `${c.error}${message ? ` ${message}` : ""}`
        : c.helper;
  els.submit.disabled = status === "loading";
  renderI18n();
}

async function loadMobileDeData(sourceUrl) {
  setStatus("loading");
  state.data = null;
  renderData();

  try {
    const response = await fetch(`${readMobileDeApiUrl()}?url=${encodeURIComponent(sourceUrl)}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || "Mobile.de import failed");
    }
    state.data = await response.json();
    setStatus("ready");
    applyRecognizedManualFields(state.data);
    renderData();
  } catch (error) {
    setStatus("error", error.message || "");
    renderData();
  }
}

document.querySelectorAll("[data-lang-button]").forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.langButton === "ru" ? "ru" : "pl";
    renderI18n();
    setStatus(state.status, state.error);
    renderData();
  });
});

document.querySelectorAll("[data-mobile-method]").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mobileMethod));
});

document.querySelectorAll("[data-mobile-back]").forEach((button) => {
  button.addEventListener("click", () => setMode(null));
});

document.addEventListener("click", (event) => {
  closeMultiSelects(event.target.closest(".mobileMultiSelect"));

  const summaryButton = event.target.closest("[data-mobile-summary-target]");
  if (summaryButton) {
    focusManualFilter(summaryButton.dataset.mobileSummaryTarget);
    return;
  }

  const optionButton = event.target.closest("[data-mobile-option-value]");
  if (optionButton) {
    const control = optionButton.closest(".mobileComboControl");
    const targetName = control?.dataset.mobileOptionsTarget;
    const input = targetName ? control.querySelector(`[${targetName}]`) : null;
    if (input) {
      const value = optionButton.dataset.mobileOptionValue || "";
      const valueTargetName = control?.dataset.mobileValueTarget;
      const valueTarget = valueTargetName ? control.querySelector(`[${valueTargetName}]`) : null;
      if (valueTarget && valueTarget !== input) {
        input.value = value ? optionButton.dataset.mobileOptionLabel || value : "";
        valueTarget.value = value;
      } else {
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      input.focus();
    }
    updateSelectedFiltersSummary();
    closeComboMenus();
    return;
  }

  const control = event.target.closest(".mobileComboControl[data-mobile-options]");
  if (control) {
    if (event.target.closest("input")) {
      openComboMenu(control, control);
      return;
    }
    const isOpen = control.classList.contains("isOpen");
    closeComboMenus(control);
    if (!isOpen) openComboMenu(control);
    else control.setAttribute("aria-expanded", "false");
    return;
  }

  if (!event.target.closest(".mobileComboControl")) closeComboMenus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeComboMenus();
    closeMultiSelects();
  }
});

const rangeEndsByStart = new Map([
  [els.mileageFrom, [els.mileageTo, false]],
  [els.yearFrom, [els.yearTo, true]],
  [els.displacementFrom, [els.displacementTo, false]],
  [els.powerFrom, [els.powerTo, false]],
  [els.seatsFrom, [els.seatsTo, true]],
]);

document.querySelectorAll(".mobileComboControl input").forEach((input) => {
  input.addEventListener("input", () => {
    const rangeEnd = rangeEndsByStart.get(input);
    if (rangeEnd) syncRangeEndValue(input, ...rangeEnd);
    const control = input.closest(".mobileComboControl");
    openComboMenu(control, control);
  });
});

els.countries.forEach((input) => input.addEventListener("change", updateCountrySummary));
els.fuels.forEach((input) => input.addEventListener("change", updateFuelSummary));

document.querySelector(".mobileManualForm")?.addEventListener("input", updateSelectedFiltersSummary);
document.querySelector(".mobileManualForm")?.addEventListener("change", updateSelectedFiltersSummary);

els.manualResets.forEach((button) => {
  button.addEventListener("click", () => {
    closeComboMenus();
    closeMultiSelects();
    renderManualOptions(false);
    setMarketSearchStatus("");
  });
});

function playManualIconFeedback(button) {
  button.classList.remove("isAcknowledged");
  window.requestAnimationFrame(() => button.classList.add("isAcknowledged"));
  window.setTimeout(() => button.classList.remove("isAcknowledged"), 380);
}

document.querySelectorAll(".mobileManualIconButton").forEach((button) => {
  button.addEventListener("click", () => playManualIconFeedback(button));
});

els.marketSearch?.addEventListener("click", (event) => {
  try {
    const searchUrl = buildMobileDeSearchUrl(readManualFields());
    els.marketSearch.href = searchUrl;
    setMarketSearchStatus(copy[state.lang].marketSearchOpening);
  } catch (error) {
    event.preventDefault();
    els.marketSearch.href = "#";
    setMarketSearchStatus(error.message || copy[state.lang].marketSearchInvalidRange, true);
  }
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const sourceUrl = els.url.value.trim();
  if (!sourceUrl) return;
  loadMobileDeData(sourceUrl);
});

function handleBrandInput(event) {
  const canonical = canonicalBrand(els.brand.value);
  if (canonical && els.brand.value !== canonical) els.brand.value = canonical;
  renderModelOptions(els.model.value);
  renderComboMenus(event?.currentTarget?.closest(".mobileComboControl") || null);
}

els.brand.addEventListener("input", handleBrandInput);
els.brand.addEventListener("change", handleBrandInput);

const initialParams = new URLSearchParams(window.location.search);
const initialUrl = initialParams.get("url");
if (initialUrl) {
  els.url.value = initialUrl;
  setMode("listing");
}

renderManualOptions(false);
renderI18n();
renderData();
setMode(state.mode);

fetch("./tools/partslink24/brand-routes.json?v=20260720-5")
  .then((response) => response.ok ? response.json() : Promise.reject())
  .then((data) => {
    state.brandRoutes = mobileBrandRoutes(data.brands || fallbackBrands);
    renderManualOptions(true);
  })
  .catch(() => renderManualOptions(true));

if (initialUrl) {
  loadMobileDeData(initialUrl);
}
