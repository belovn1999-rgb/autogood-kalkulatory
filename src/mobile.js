const DEFAULT_MOBILEDE_API_URL = "https://jay-hang-given-segment.trycloudflare.com/mobilede/import";

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
    ready: "Dane gotowe. Filtry analizy zostały uzupełnione.",
    error: "Nie udało się rozpoznać ogłoszenia. Sprawdź link albo backend.",
    listingEyebrow: "DANE Z OGŁOSZENIA",
    manualEyebrow: "WPISZ DANE RĘCZNIE",
    clearManualFilters: "Wyczyść filtry",
    selectedFiltersEmpty: "Brak wybranych parametrów",
    offerCountLabel: "AKTUALNE OFERTY",
    vehicleDataLabel: "DANE PODSTAWOWE POJAZDU",
    drivetrainLabel: "NAPĘD I SKRZYNIA",
    conditionLabel: "WNĘTRZE I STAN",
    tradeConditionsLabel: "Warunki zakupu",
    calculatorDataEyebrow: "DANE DO KALKULATORA",
    brandLabel: "Marka",
    modelLabel: "Model",
    versionLabel: "Wersja",
    fuelLabel: "Paliwo",
    pluginLabel: "Plug-in",
    bodyLabel: "Nadwozie",
    priceRangeLabel: "Cena (EUR)",
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
    bodyAny: "Dowolne",
    filterGroupVehicle: "Pojazd",
    pageTitle: "Wyszukiwanie i analiza cen",
    stepLink: "Link",
    stepFilters: "Filtry",
    stepAnalysis: "Analiza",
    modelOutsideCatalog: "Model spoza katalogu — szukamy po nazwie",
    recognitionUnavailable: "Serwis rozpoznawania jest niedostępny — wpisz dane ręcznie.",
    recognitionViaBookmarklet: "Ogłoszenie otwarte w nowej karcie — kliknij tam zakładkę „AUTOGOOD”, a dane wpiszą się same.",
    recognitionFromBookmarklet: "Dane pobrane z mobile.de przez zakładkę AUTOGOOD.",
    recognitionFromOtomoto: "Dane pobrane z ogłoszenia otomoto.pl.",
    otomotoAdFailed: "Nie udało się odczytać ogłoszenia otomoto.pl. Sprawdź link i spróbuj ponownie.",
    otomotoLinkExpected: "To nie jest link do ogłoszenia otomoto.pl.",
    bookmarkletHint: "Przeciągnij ten przycisk na pasek zakładek. Potem klikaj go na stronie ogłoszenia albo listy wyników mobile.de.",
    bookmarkletLabel: "AUTOGOOD ↦ mobile.de",
    bookmarkletInstall: "Zakładka do mobile.de:",
    offerCountLoading: "…",
    showMoreFilters: "Pokaż",
    hideMoreFilters: "Ukryj",
    filterGroupMileage: "Przebieg i rok",
    filterGroupPrice: "Cena",
    filterGroupEngine: "Silnik i napęd",
    filterGroupComfort: "Komfort",
    filterGroupColors: "Kolory",
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
    featureHeadUpDisplay: "Wyświetlacz Head-up (HUD)",
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
    damagedVehiclesShow: "Pokazuj",
    vehicleConditionLabel: "Stan pojazdu",
    otomotoSearchButton: "Szukaj na otomoto.pl",
    otomotoSearchOpening: "Otwieram Otomoto: od najniższej ceny.",
    otomotoPriceConverted: "Cena przeliczona na PLN po kursie {rate}.",
    otomotoSearchSkipped: "Otomoto nie ma dokładnego odpowiednika dla: {filters}. Pozostałe filtry zostały zastosowane.",
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
    specSearchKicker: "Parametry poszukiwania",
    specVehicleKicker: "Dane z ogłoszenia",
    specEngineHeading: "Nadwozie i silnik",
    specUsageHeading: "Przebieg i napęd",
    specEquipmentHeading: "Wyposażenie",
    specOtherHeading: "Inne informacje",
    specBody: "Nadwozie",
    specEngineType: "Typ silnika",
    specDisplacement: "Pojemność",
    specPower: "Moc",
    specMileage: "Przebieg",
    specRegistration: "Rok 1. rejestracji",
    specGearbox: "Skrzynia",
    specDrive: "Napęd",
    specCountry: "Kraj",
    specStatus: "Stan",
    specVat: "VAT",
    specSeller: "Sprzedawca",
    specPrice: "Cena",
    specAny: "dowolne",
    specNoEquipment: "bez dodatkowych wymagań",
    specShowAll: "pokaż wszystko",
    specShowLess: "zwiń",
    specFrom: "od",
    specTo: "do",
    countryNames: { DE: "Niemcy", PL: "Polska", AT: "Austria", BE: "Belgia", NL: "Holandia", FR: "Francja", IT: "Włochy", ES: "Hiszpania", CZ: "Czechy", CH: "Szwajcaria", LU: "Luksemburg", DK: "Dania", SE: "Szwecja" },
    sellerPrivate: "osoba prywatna",
    sellerDealer: "dealer",
    searchOnMobile: "Szukaj na mobile.de",
    searchOnOtomoto: "Szukaj na otomoto.pl",
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
    tariff: "Taryfa transportu",
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
    ready: "Данные готовы. Фильтры анализа заполнены.",
    error: "Не удалось распознать объявление. Проверь ссылку или backend.",
    listingEyebrow: "ДАННЫЕ ИЗ ОБЪЯВЛЕНИЯ",
    manualEyebrow: "ВВЕСТИ ДАННЫЕ ВРУЧНУЮ",
    clearManualFilters: "Очистить фильтры",
    selectedFiltersEmpty: "Нет выбранных параметров",
    offerCountLabel: "АКТУАЛЬНЫЕ ОБЪЯВЛЕНИЯ",
    vehicleDataLabel: "ОСНОВНЫЕ ДАННЫЕ АВТОМОБИЛЯ",
    drivetrainLabel: "ПРИВОД И КОРОБКА ПЕРЕДАЧ",
    conditionLabel: "САЛОН И СОСТОЯНИЕ",
    tradeConditionsLabel: "Условия сделки",
    calculatorDataEyebrow: "ДАННЫЕ ДЛЯ КАЛЬКУЛЯТОРА",
    brandLabel: "Марка",
    modelLabel: "Модель",
    versionLabel: "Версия",
    fuelLabel: "Топливо",
    pluginLabel: "Plug-in",
    bodyLabel: "Кузов",
    priceRangeLabel: "Цена (EUR)",
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
    bodyAny: "Любой",
    filterGroupVehicle: "Автомобиль",
    pageTitle: "Поиск и анализ цен",
    stepLink: "Ссылка",
    stepFilters: "Фильтры",
    stepAnalysis: "Анализ",
    modelOutsideCatalog: "Модель вне каталога — ищем по названию",
    recognitionUnavailable: "Сервис распознавания недоступен — введи данные вручную.",
    recognitionViaBookmarklet: "Объявление открыто в новой вкладке — нажми там закладку «AUTOGOOD», и данные заполнятся сами.",
    recognitionFromBookmarklet: "Данные получены с mobile.de через закладку AUTOGOOD.",
    recognitionFromOtomoto: "Данные получены из объявления otomoto.pl.",
    otomotoAdFailed: "Не удалось прочитать объявление otomoto.pl. Проверь ссылку и попробуй ещё раз.",
    otomotoLinkExpected: "Это не ссылка на объявление otomoto.pl.",
    bookmarkletHint: "Перетащи эту кнопку на панель закладок. Потом нажимай её на странице объявления или списка mobile.de.",
    bookmarkletLabel: "AUTOGOOD ↦ mobile.de",
    bookmarkletInstall: "Закладка для mobile.de:",
    offerCountLoading: "…",
    showMoreFilters: "Показать",
    hideMoreFilters: "Скрыть",
    filterGroupMileage: "Пробег и год",
    filterGroupPrice: "Цена",
    filterGroupEngine: "Двигатель и привод",
    filterGroupComfort: "Комфорт",
    filterGroupColors: "Цвета",
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
    featureHeadUpDisplay: "Проекционный дисплей (HUD)",
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
    vehicleConditionLabel: "Состояние автомобиля",
    otomotoSearchButton: "Найти на otomoto.pl",
    otomotoSearchOpening: "Открываю Otomoto: сначала самые дешёвые.",
    otomotoPriceConverted: "Цена пересчитана в PLN по курсу {rate}.",
    otomotoSearchSkipped: "В Otomoto нет точного аналога для: {filters}. Остальные фильтры применены.",
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
    specSearchKicker: "Параметры поиска",
    specVehicleKicker: "Данные объявления",
    specEngineHeading: "Кузов и двигатель",
    specUsageHeading: "Пробег и привод",
    specEquipmentHeading: "Оснащение",
    specOtherHeading: "Другая информация",
    specBody: "Кузов",
    specEngineType: "Тип двигателя",
    specDisplacement: "Объём",
    specPower: "Мощность",
    specMileage: "Пробег",
    specRegistration: "Год 1-й регистрации",
    specGearbox: "КПП",
    specDrive: "Привод",
    specCountry: "Страна",
    specStatus: "Состояние",
    specVat: "НДС",
    specSeller: "Продавец",
    specPrice: "Цена",
    specAny: "любой",
    specNoEquipment: "без дополнительных требований",
    specShowAll: "показать всё",
    specShowLess: "свернуть",
    specFrom: "от",
    specTo: "до",
    countryNames: { DE: "Германия", PL: "Польша", AT: "Австрия", BE: "Бельгия", NL: "Нидерланды", FR: "Франция", IT: "Италия", ES: "Испания", CZ: "Чехия", CH: "Швейцария", LU: "Люксембург", DK: "Дания", SE: "Швеция" },
    sellerPrivate: "частное лицо",
    sellerDealer: "дилер",
    searchOnMobile: "Искать на mobile.de",
    searchOnOtomoto: "Искать на otomoto.pl",
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
    tariff: "Тариф доставки",
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
const priceOptions = [
  5000,
  ...Array.from({ length: 15 }, (_, index) => (index + 6) * 1000),
  22500,
  25000,
  27500,
  30000,
  35000,
  40000,
  45000,
  50000,
  55000,
  60000,
  70000,
  80000,
  "90000+",
];

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
  MAN: "16500",
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
  electric: "ELECTRICITY",
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

// Options Mobile.de files under their own query parameter (checked against the
// filter contract embedded in suchen.mobile.de); anything under the wrong key is silently ignored.
const mobileDeOptionParams = {
  BI_XENON_HEADLIGHTS: "hlt",
  LASER_HEADLIGHTS: "hlt",
  ADAPTIVE_BENDING_LIGHTS: "blt",
  LED_RUNNING_LIGHTS: "drl",
  REAR_TRAFFIC_ALERT: "fe",
};

const otomotoMakeAliases = {
  "Asia Motors": "asia",
  Citroen: "citroen",
  Corvette: "chevrolet",
  DS: "ds-automobiles",
  KGM: "ssangyong",
  Mini: "mini",
  ORA: "gwm",
  "Mercedes Trucks": "mercedes-benz",
  "Mercedes Vans": "mercedes-benz",
  "Vw Nutzfahrzeuge": "volkswagen",
};

// Makes that Otomoto files as models of another make: every search stays on those models.
const otomotoMakeModels = {
  Corvette: ["corvette"],
  ORA: ["ora-03", "ora-07"],
};

// Mobile.de model -> Otomoto model id(s). { slugs, broad } marks an approximate match; [] means no equivalent.
const otomotoModelAliases = {
  Audi: {
    "A6 e-tron": "a6-e-tron",
    "Q4 e-tron": "q4",
    "Q6 e-tron": "q6",
    "R8": "r8",
    "TT RS": "tt-rs",
    TTS: "tt-s",
  },
  BAIC: {
    "Beijing X35": "senova-x35",
    "Beijing X55": "senova-x55",
    X55: "senova-x55",
  },
  Bentley: { "Continental Supersports": { slugs: "continental-gt", broad: true } },
  Citroen: { "Grand C4 Picasso / SpaceTourer": ["c4-grand-picasso", "c4-spacetourer"] },
  Cupra: {
    Formentor: "cupra-formentor",
    Leon: "cupra-leon",
  },
  Dodge: { Demon: { slugs: "challenger", broad: true } },
  DS: {
    "Nº4": "n-4",
    "Nº8": "n-8",
  },
  Ferrari: {
    550: "f550",
    "599 GTO": { slugs: "599gtb", broad: true },
    "599 SA Aperta": { slugs: "599gtb", broad: true },
  },
  Fiat: { "500e": "500-e" },
  Ford: {
    "Ka+": "ka_plus",
    Sportka: { slugs: "ka", broad: true },
    Raptor: { slugs: ["ranger-raptor", "f150"], broad: true },
  },
  Infiniti: {
    G35: { slugs: "g", broad: true },
    G37: { slugs: "g", broad: true },
    M30: { slugs: "m", broad: true },
    M35: { slugs: "m", broad: true },
    M37: { slugs: "m", broad: true },
  },
  JAC: { "8 Pro": "t8-pro" },
  Kia: { "cee'd Sportswagon": { slugs: "ceed", broad: true } },
  Lada: {
    Taiga: { slugs: "niva", broad: true },
    Urban: { slugs: "niva", broad: true },
  },
  Maserati: {
    222: { slugs: "biturbo", broad: true },
    228: { slugs: "biturbo", broad: true },
    418: { slugs: "biturbo", broad: true },
    420: { slugs: "biturbo", broad: true },
    422: { slugs: "biturbo", broad: true },
    424: { slugs: "biturbo", broad: true },
    430: { slugs: "biturbo", broad: true },
    4200: { slugs: ["coupe", "spyder"], broad: true },
  },
  Mazda: {
    "B series": "seria-b",
    "CX-6e": [],
    "E series": "seria-e",
  },
  "Mercedes-Benz": {
    190: "w201-190",
    B: "klasa-b",
    "B Electric Drive": { slugs: "klasa-b", broad: true },
    CE: "klasa-e",
    R: "klasa-r",
    "T-Class": "t-klasa",
    "X-Class": "x-klasa",
  },
  MG: {
    MG4: "4",
    "MG4 EV Urban": { slugs: "4", broad: true },
    MG5: "5",
  },
  Mini: { Clubvan: { slugs: "clubman", broad: true } },
  Mitsubishi: {
    Mirage: "space-star",
    "Pick-up": { slugs: "l200", broad: true },
  },
  Morgan: { "3 Wheeler": { slugs: "super-3", broad: true } },
  Nissan: { Evalia: { slugs: "nv200", broad: true } },
  OMODA: { "5 EV": "e5" },
  Opel: { "Pick Up Sportscap": "pick-up-sportcap" },
  ORA: { "Funky Cat": "ora-03" },
  Peugeot: { TePee: { slugs: "partner", broad: true } },
  Renault: {
    "Grand Kangoo E-TECH": { slugs: "kangoo", broad: true },
    Rapid: { slugs: "express", broad: true },
  },
  Suzuki: { Cappuccino: "cappucino" },
  Tesla: { "Model Y": "y" },
  Toyota: { "Prius+": "prius_plus" },
  Volkswagen: {
    "ID.3": "id3",
    "ID.4": "id4",
    "ID.5": "id5",
    "ID.7 Tourer": "id7-tourer",
    "up!": "up",
  },
  Volvo: { EX40: { slugs: "xc-40", broad: true } },
};

const otomotoFuelValues = {
  petrol: "petrol",
  diesel: "diesel",
  hybrid_diesel: "hybrid",
  hybrid_petrol: "hybrid",
  electric: "electric",
  plugin: "plugin-hybrid",
};

const otomotoBodyValues = {
  limousine: "sedan",
  estate: "combi",
  suv: "suv",
  hatchback: "compact",
  coupe: "coupe",
  cabrio: "cabrio",
  van_minibus: "minivan",
};

const otomotoDriveValues = {
  awd: ["all-wheel-auto", "all-wheel-lock", "all-wheel-permanent"],
  fwd: ["front-wheel"],
  rwd: ["rear-wheel"],
};

const otomotoGearboxValues = {
  automatic: "automatic",
  manual: "manual",
};

const otomotoSellerValues = {
  dealer: "business",
  company: "business",
  private: "private",
};

const otomotoInteriorMaterialValues = {
  alcantara: "alcantara-upholstery",
  cloth: "textile-upholstery",
  part_leather: "upholstery-with-leather-inserts",
  full_leather: "leather-upholstery",
};

const otomotoAirConditioningValues = {
  automatic: "automatic-climate-control",
  manual: "air-conditioning",
  automatic_2_zones: "dualzone-automatic-climate-control",
  automatic_3_zones: "trizone-automatic-climate-control",
  automatic_4_zones: "4-or-more-zone-automatic-climate-control",
};


const otomotoExteriorColorValues = {
  beige: "brown-beige",
  black: "black",
  blue: "blue",
  brown: "brown",
  yellow: "yellow",
  gold: "yellow-gold",
  green: "green",
  grey: "grey",
  orange: "orange",
  red: "red",
  silver: "silver",
  purple: "violet",
  white: "white",
};

const otomotoFeatureFilters = {
  PANORAMIC_GLASS_ROOF: [["filter_enum_sunroof", "glass-sunroof-fixed"]],
  AIR_SUSPENSION: [["filter_enum_air_suspension", "1"]],
  PERFORMANCE_HANDLING_SYSTEM: [["filter_enum_sport_suspension", "1"]],
  LASER_HEADLIGHTS: [["filter_enum_headlight_lamp_type", "laser-head-lamps"]],
  BI_XENON_HEADLIGHTS: [["filter_enum_headlight_lamp_type", "bi-xenon-head-lamps"]],
  ADAPTIVE_BENDING_LIGHTS: [["filter_enum_dynamic_directional_lights", "1"]],
  BLIND_SPOT_MONITOR: [["filter_enum_blind_spot_warning", "1"]],
  KEYLESS_ENTRY: [["filter_enum_keyless_entry", "1"]],
  ELECTRIC_HEATED_SEATS: [
    ["filter_enum_heated_seat_driver", "1"],
    ["filter_enum_heated_seat_passenger", "1"],
  ],
  HEATED_WINDSHIELD: [["filter_enum_windscreen_heating", "1"]],
  VENTILATED_SEATS: [["filter_enum_ventilated_front_seat", "1"]],
  CARPLAY: [["filter_enum_apple_carplay", "1"]],
  ANDROID_AUTO: [["filter_enum_android_auto", "1"]],
  HEAD_UP_DISPLAY: [["filter_enum_head_up_display", "1"]],
  ELECTRIC_ADJUSTABLE_SEATS: [["filter_enum_driver_seat_electrically_adjustable", "1"]],
  MEMORY_SEATS: [["filter_enum_memory_seat", "1"]],
  WIRELESS_CHARGING: [["filter_enum_wireless_device_charging", "1"]],
};

const otomotoParkingFilters = {
  CAM_360_DEGREES: [["filter_enum_360_view_camera", "1"]],
  REAR_VIEW_CAM: [["filter_enum_rear_view_camera", "1"]],
  FRONT_SENSORS: [["filter_enum_park_distance_control_front", "1"]],
  REAR_SENSORS: [["filter_enum_park_distance_control_rear", "1"]],
  AUTOMATIC_PARKING: [["filter_enum_park_assistant", "1"]],
};

const otomotoUnsupportedFeatures = new Set([
  "ROOF_RAILS",
  "LED_RUNNING_LIGHTS",
  "SPORT_PACKAGE",
  "HEATED_STEERING_WHEEL",
  "ELECTRIC_HEATED_REAR_SEATS",
  "SPORT_SEATS",
  "MASSAGE_SEATS",
  "NIGHT_VISION_ASSIST",
  "ALLOY_WHEELS",
  "TRAFFIC_SIGN_RECOGNITION",
  "AMBIENT_LIGHTING",
  "DIGITAL_COCKPIT",
  "WINTER_TIRES",
  "SUMMER_TIRES",
  "ELECTRIC_TAILGATE",
]);

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

// Verified in Mobile.de's own search form: Nissan Skyline resolves to model ID 33.
// Keep this numeric ID instead of the SEO model route: SEO redirects discard filters.
const mobileDeNissanModelIds = {
  Skyline: "33",
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
  Nissan: mobileDeNissanModelIds,
  ...(generatedMobileModelCatalog.modelIds || {}),
};
// Numeric make IDs straight from Mobile.de's search form (tools/generate-mobile-de-ids.py).
// Only numeric IDs keep filters: the /auto/<make>-<model>.html SEO route redirects and drops them.
Object.assign(mobileDeMakeIds, generatedMobileModelCatalog.mobileDeMakeIds || {});
const mobileDeGroupIdsByBrand = generatedMobileModelCatalog.groupIds || {};

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
  bodyChoices: document.querySelector("[data-mobile-body-choices]"),
  priceFrom: document.querySelector("[data-mobile-price-from]"),
  priceTo: document.querySelector("[data-mobile-price-to]"),
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
  modelHint: document.querySelector("[data-mobile-model-hint]"),
  searchCount: document.querySelector("[data-mobile-search-count]"),
  otomotoSearches: Array.from(document.querySelectorAll("[data-mobile-otomoto-search]")),
  marketSearches: Array.from(document.querySelectorAll("[data-mobile-market-search]")),
  marketSearchStatus: document.querySelector("[data-mobile-market-search-status]"),
  manualResets: Array.from(document.querySelectorAll("[data-mobile-manual-reset]")),
  selectedFilters: document.querySelector("[data-mobile-selected-filters]"),
  listingResult: document.querySelector("[data-mobile-listing-result]"),
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

function detailRow(label, value) {
  return `<div class="mobileDataRow"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

// One layout for a car (from an ad) and for a market search (analysis):
// a title line, then four columns — body and engine, mileage and drive,
// equipment, other information. Columns are {heading, rows: [[label, value]]}
// or {heading, text}; rows without a value are left out.
function specSheetHtml({ kicker = "", title = "", meta = "", aside = "", columns = [] }) {
  const columnHtml = columns.map((column) => {
    const rows = (column.rows || []).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");
    const long = column.text !== undefined && column.text.length > 180;
    const body = column.text !== undefined
      ? `<p class="agSpecText${column.muted ? " isMuted" : ""}${long ? " isClamped" : ""}">${escapeHtml(column.text)}</p>${long ? `<button class="agSpecMore" type="button" data-spec-expand>${escapeHtml(copy[state.lang].specShowAll)}</button>` : ""}`
      : `<dl>${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
    return `<section class="agSpecColumn"><h4>${escapeHtml(column.heading)}</h4>${body}</section>`;
  }).join("");
  return `
    <div class="agSpec">
      <div class="agSpecHead">
        <div class="agSpecTitle">
          ${kicker ? `<span class="agSpecKicker">${escapeHtml(kicker)}</span>` : ""}
          <div class="agSpecTitleLine"><strong>${escapeHtml(title)}</strong>${meta ? `<span class="agSpecDate">${escapeHtml(meta)}</span>` : ""}</div>
        </div>
        ${aside ? `<div class="agSpecAside">${aside}</div>` : ""}
      </div>
      <div class="agSpecColumns" style="grid-template-columns:${columns.map((column) => (column.text !== undefined ? "minmax(0, 1.6fr)" : "minmax(0, 1fr)")).join(" ")}">${columnHtml}</div>
    </div>`;
}

window.AUTOGOOD_SPEC_SHEET = specSheetHtml;

// A long equipment list opens and closes in place.
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-spec-expand]");
  if (!button) return;
  const textNode = button.previousElementSibling;
  const open = textNode.classList.toggle("isOpen");
  button.textContent = open ? copy[state.lang].specShowLess : copy[state.lang].specShowAll;
});
window.AUTOGOOD_SPEC_COPY = () => copy[state.lang];

function fuelLabelOf(value, title = "") {
  const key = normalizeFuel(value, title);
  const option = fuelOptions.find((item) => item.value === key);
  return option ? option[state.lang] : text(value);
}

function bodyLabelOf(value) {
  const key = normalizeBody(value);
  const option = bodyOptions.find((item) => item.value === key);
  return option && key !== "other" ? option[state.lang] : (value ? String(value) : "");
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
    models.unshift({ value: currentModel, label: currentModel, isCurrentInput: true });
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
    price: priceOptions.map((value) => ({
      value: String(value),
      label: `${formatPriceValue(value)} EUR`,
    })),
    priceTo: valuesAfter(priceOptions, els.priceFrom?.value, true).map((value) => ({
      value: String(value),
      label: `${formatPriceValue(value)} EUR`,
    })),
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
    const matchingOptions = filter
      ? options.filter((option) => normalizeToken(`${option.label} ${option.value}`).includes(filter))
      : options;
    const visibleOptions = filter && matchingOptions.some((option) => !option.isCurrentInput)
      ? matchingOptions.filter((option) => !option.isCurrentInput)
      : matchingOptions;
    const keyboardActiveOption = filter && visibleOptions.length === 1 ? visibleOptions[0] : null;
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
      const optionClasses = [
        option.isPopular ? "isPopular" : "",
        option === keyboardActiveOption ? "isKeyboardActive" : "",
      ].filter(Boolean).join(" ");
      items.push(`
        <button class="${optionClasses}" type="button" data-mobile-option-value="${escapeHtml(option.value)}" data-mobile-option-label="${escapeHtml(option.label)}">
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
    [els.priceFrom, c.fromPlaceholder],
    [els.mileageFrom, c.fromPlaceholder],
    [els.yearFrom, c.fromPlaceholder],
    [els.displacementFrom, c.fromPlaceholder],
    [els.powerFrom, c.fromPlaceholder],
    [els.priceTo, c.toPlaceholder],
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

// Body type is a one-click chip row (like the gearbox); the hidden input keeps the value.
function setBodyDisplay(value) {
  if (!els.bodyChoices) return;
  const current = value || "";
  const options = [{ value: "", pl: copy.pl.bodyAny, ru: copy.ru.bodyAny }, ...bodyOptions];
  els.bodyChoices.innerHTML = options.map((option) => `
    <label class="mobileChoiceOption">
      <input data-mobile-body-choice name="mobile-body" type="radio" value="${escapeHtml(option.value)}"${option.value === current ? " checked" : ""} />
      <span>${escapeHtml(option[state.lang])}</span>
    </label>
  `).join("");
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
    priceFrom: "",
    priceTo: "",
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
    nonSmoking: false,
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
  els.priceFrom.value = current.priceFrom || "";
  els.priceTo.value = current.priceTo || "";
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
  if (typeof updateModelHint === "function") updateModelHint();
  if (typeof scheduleOfferCount === "function") scheduleOfferCount();
  document.querySelectorAll("[data-mobile-collapsible]").forEach((card) => {
    if (typeof updateCollapsibleCard === "function") updateCollapsibleCard(card);
  });
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
    priceFrom: els.priceFrom?.value || "",
    priceTo: els.priceTo?.value || "",
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

function priceFilterSummary(from, to) {
  if (!from && !to) return "";
  const fromLabel = formatPriceValue(from) || copy[state.lang].fromPlaceholder;
  const toLabel = formatPriceValue(to) || copy[state.lang].toPlaceholder;
  return `${copy[state.lang].priceRangeLabel}: ${fromLabel} - ${toLabel} EUR`;
}

function updateSelectedFiltersSummary() {
  if (!els.selectedFilters) return;
  const c = copy[state.lang];
  const filters = readManualFields();
  const parts = [
    { value: [filters.brand, filters.model].filter(Boolean).join(" - "), icon: "", primary: true, target: els.brand },
    { value: filters.version, icon: "list", target: els.version },
    ...selectedInputSummaryParts(els.fuels, "fuel"),
    { value: filters.body ? optionLabel(bodyOptions, filters.body) : "", icon: "car", target: els.bodyChoices },
    { value: priceFilterSummary(filters.priceFrom, filters.priceTo), icon: "tag", target: els.priceFrom },
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

function formatPriceValue(value) {
  const amount = mobileDeNumber(value);
  if (amount === null) return "";
  const grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${grouped}${String(value).trim().endsWith("+") ? "+" : ""}`;
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

// A series entry ("3" in BMW 3 Series, "C" in Mercedes C-Class) or a group name
// selects the whole Mobile.de model group, which lives in the third ms segment.
function mobileDeGroupId(brand, model) {
  const normalized = normalizeToken(model);
  if (!normalized) return "";
  const match = Object.entries(mobileDeGroupIdsByBrand[brand] || {}).find(([label]) => {
    const group = label.replace(/\s*\(alle\)\s*$/i, "");
    const series = group.replace(/(?:\s+|-)(?:class|klasse|series|serie|reihe)$/i, "");
    return [label, group, series].some((value) => normalizeToken(value) === normalized);
  });
  return match?.[1] || "";
}

function mobileDeModelSelection(filters) {
  const makeId = filters.brand ? mobileDeMakeIds[filters.brand] || "" : "";
  const model = String(filters.model || "").trim();
  const version = String(filters.version || "").trim();
  if (!makeId) return "";
  if (!model) return version ? `${makeId};;;${version}` : makeId;
  const modelId = mobileDeModelId(filters.brand, model);
  if (modelId) return `${makeId};${modelId};;${version}`;
  const groupId = mobileDeGroupId(filters.brand, model);
  if (groupId) return `${makeId};;${groupId};${version}`;
  // A series we group ourselves (BMW 8 Series) has no Mobile.de group: select each of its models.
  // withSeriesBaseModels puts that series entry first in its group.
  const series = modelGroupsForBrand(filters.brand)
    .find((group) => normalizeToken(group.models[0]) === normalizeToken(model));
  const seriesIds = (series?.models.slice(1) || []).map((name) => mobileDeModelId(filters.brand, name)).filter(Boolean);
  if (seriesIds.length) return seriesIds.map((id) => `${makeId};${id};;${version}`);
  // Unknown model text: search it as a model description instead of losing the make and filters.
  return `${makeId};;;${[model, version].filter(Boolean).join(" ")}`;
}

// Open-ended options: "< 5000" picked as the lower bound means "up to 5000",
// "> 5000" picked as the upper bound means "over 5000" (no upper limit).
function rangeBounds(fromValue, toValue) {
  const rawFrom = String(fromValue || "").trim();
  const rawTo = String(toValue || "").trim();
  let from = mobileDeNumber(rawFrom);
  let to = mobileDeNumber(rawTo);
  if (/^</.test(rawFrom)) {
    if (to === null) to = from;
    from = null;
  }
  if (/^>/.test(rawTo)) {
    if (from === null) from = to;
    to = null;
  }
  return { from, to };
}

function appendMobileDeRange(params, key, fromValue, toValue, transform = (value) => value) {
  const { from, to } = rangeBounds(fromValue, toValue);
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

  if (filters.brand && !mobileDeMakeIds[filters.brand]) throw new Error(c.marketSearchUnsupportedBrand);
  if (filters.model && !filters.brand) throw new Error(c.marketSearchChooseBrand);
  [mobileDeModelSelection(filters)].flat().filter(Boolean).forEach((selection) => params.append("ms", selection));

  const body = mobileDeBodyValues[filters.body];
  if (body) params.set("c", body);

  appendMobileDeRange(params, "p", filters.priceFrom, String(filters.priceTo || "").trim().endsWith("+") ? "" : filters.priceTo);
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
  appendMobileDeRange(params, "sc", filters.seatsFrom, filters.seatsTo);

  const fuels = manualFuelValues(filters);
  fuels
    .map((value) => mobileDeFuelValues[value])
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
  (filters.features || []).forEach((feature) => params.append(mobileDeOptionParams[feature] || "fe", feature));
  (filters.parkingSensors || []).forEach((sensor) => params.append(mobileDeOptionParams[sensor] || "pa", sensor));
  if (filters.cruiseControl && filters.cruiseControl !== "any") params.set("spc", filters.cruiseControl);
  filters.exteriorColors.forEach((color) => params.append("ecol", color.toUpperCase()));
  filters.interiorColors.forEach((color) => {
    params.append("icol", color === "other" ? "OTHER_INTERIOR_COLOR" : color.toUpperCase());
  });
  if (filters.matte) params.append("fe", "MATTE_COLOR");
  if (filters.metallic) params.append("fe", "METALLIC");
  if (filters.nonSmoking) params.append("fe", "NONSMOKER_VEHICLE");
  // Mobile.de treats plug-in hybrids as a feature (fe), not a fuel type: ft=HYBRID_PLUGIN is ignored.
  if (fuels.includes("plugin")) params.append("fe", "HYBRID_PLUGIN");
  if (filters.roadworthy) params.set("rtd", "true");

  params.set("sb", "p");
  params.set("od", "up");
  return `https://suchen.mobile.de/fahrzeuge/search.html?${params.toString()}`;
}

function otomotoSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function otomotoMakeSelection(brand) {
  const slug = brand ? otomotoMakeAliases[brand] || otomotoSlug(brand) : "";
  const catalog = window.AUTOGOOD_OTOMOTO_CATALOG?.modelsByMake;
  const unsupported = Boolean(slug && catalog && !catalog[slug]);
  return { slug: unsupported ? "" : slug, unsupported };
}

function otomotoModelToken(value) {
  return otomotoSlug(value).replace(/-/g, "");
}

function validatedOtomotoModel(makeSlug, requestedSlugs, broad = false) {
  const catalogModels = window.AUTOGOOD_OTOMOTO_CATALOG?.modelsByMake?.[makeSlug];
  const slugs = [...new Set([requestedSlugs].flat().filter(Boolean))];
  if (!catalogModels) return { slugs, broad, unsupported: false };
  const validSlugs = slugs.filter((slug) => catalogModels.some((model) => model.id === slug));
  return { slugs: validSlugs, broad, unsupported: Boolean(slugs.length && !validSlugs.length) };
}

function otomotoModelWords(value) {
  return otomotoSlug(value).split("-").filter(Boolean);
}

// Mini trims that Otomoto lists next to the body models (Clubman, Countryman, ...).
const otomotoMiniTrims = ["cooper", "cooper-s", "one", "john-cooper-works"];

function matchedOtomotoModels(makeSlug, model) {
  const catalogModels = window.AUTOGOOD_OTOMOTO_CATALOG?.modelsByMake?.[makeSlug] || [];
  const requestedSlug = otomotoSlug(model);
  const requestedToken = otomotoModelToken(model);
  if (!requestedSlug || !catalogModels.length) return { slugs: [], broad: false };

  const exact = catalogModels.filter((candidate) => (
    candidate.id === requestedSlug
    || otomotoModelToken(candidate.id) === requestedToken
    || otomotoModelToken(candidate.name) === requestedToken
  ));
  if (exact.length) return { slugs: exact.map((candidate) => candidate.id), broad: false };

  const descendants = catalogModels.filter((candidate) => candidate.id !== "other" && (
    candidate.id.startsWith(`${requestedSlug}-`)
    || otomotoModelToken(candidate.name).startsWith(requestedToken)
  ));
  if (descendants.length) {
    return { slugs: descendants.map((candidate) => candidate.id), broad: false };
  }

  // Broader Otomoto model whose words open or close the requested name:
  // "Cooper SE" -> cooper, "e-2008" -> 2008, "595 Competizione" -> 595 (not 595c).
  const requestedWords = otomotoModelWords(model);
  const wordScore = (candidate) => Math.max(...[candidate.id, candidate.name].map((value) => {
    const words = otomotoModelWords(value);
    if (!words.length || words.length >= requestedWords.length) return 0;
    const opens = words.every((word, index) => requestedWords[index] === word);
    const closes = words.every((word, index) => requestedWords[requestedWords.length - words.length + index] === word);
    // The leading words name the model more often than trailing ones ("S6 e-tron" -> s6).
    return (opens ? 100 : 0) + (opens || closes ? words.join("").length : 0);
  }));
  // A number or trim letter glued to the model: "EX35" -> ex, "XKR" -> xk, "500C" -> 500.
  // Digits never extend a number: "H 100" is not h-1, "X55" is not x5.
  const glueScore = (candidate) => Math.max(...[candidate.id, candidate.name].map((value) => {
    const token = otomotoModelToken(value);
    if (token.length < 2 || token.length >= requestedToken.length) return 0;
    if (requestedToken.startsWith(token)) {
      const rest = requestedToken.slice(token.length);
      return /^[a-z]$/.test(rest) || (/^\d+$/.test(rest) && !/\d$/.test(token)) ? token.length : 0;
    }
    const lead = requestedToken.slice(0, -token.length);
    // "C1500" -> 1500; "eVito" -> vito (electric twin).
    return requestedToken.endsWith(token) && (lead === "e" || (/^[a-z]$/.test(lead) && /^\d/.test(token))) ? token.length : 0;
  }));

  for (const score of [wordScore, glueScore]) {
    let ranked = catalogModels
      .filter((candidate) => candidate.id !== "other")
      .map((candidate) => ({ candidate, value: score(candidate) }))
      .filter((entry) => entry.value > 0);
    if (makeSlug === "mini" && ranked.some((entry) => !otomotoMiniTrims.includes(entry.candidate.id))) {
      ranked = ranked.filter((entry) => !otomotoMiniTrims.includes(entry.candidate.id));
    }
    if (!ranked.length) continue;
    const best = Math.max(...ranked.map((entry) => entry.value));
    return {
      slugs: ranked.filter((entry) => entry.value === best).map((entry) => entry.candidate.id),
      broad: true,
    };
  }
  // Electric twins Otomoto keeps under the base model: "ë-C4 X" -> c4x.
  if (requestedWords[0] === "e" && requestedWords.length > 1) {
    const base = matchedOtomotoModels(makeSlug, requestedWords.slice(1).join(" "));
    return { slugs: base.slugs, broad: base.slugs.length > 0 };
  }
  return { slugs: [], broad: false };
}

function otomotoModelSelection(brand, model) {
  // Mini "SD" is the diesel Cooper S.
  let cleanModel = String(model || "").trim();
  if (brand === "Mini") cleanModel = cleanModel.replace(/\bCooper SD\b/i, "Cooper S");
  if (!cleanModel) return { slugs: [], broad: false, unsupported: false };
  const makeSlug = otomotoMakeSelection(brand).slug;
  if (!makeSlug) return { slugs: [], broad: false, unsupported: true };

  if (brand === "BMW") {
    const baseSeries = cleanModel.match(/^([1-8])$/)?.[1];
    if (baseSeries) return validatedOtomotoModel(makeSlug, `seria-${baseSeries}`);

    const numberedSeries = cleanModel.match(/^([1-8])(?:\d{2}|er\b)/i)?.[1]
      || cleanModel.match(/^ActiveHybrid\s+([1-8])$/i)?.[1]
      || cleanModel.match(/^M([1-8])\d/i)?.[1];
    if (numberedSeries) return validatedOtomotoModel(makeSlug, `seria-${numberedSeries}`, true);

    const xOrZVariant = cleanModel.match(/^([XZ]\d)(?:\s+(.+))$/i);
    if (xOrZVariant && !/^[M]$/i.test(xOrZVariant[2])) {
      return validatedOtomotoModel(makeSlug, otomotoSlug(xOrZVariant[1]), true);
    }
  }

  if (brand === "Mercedes-Benz") {
    const classVariant = cleanModel.match(/^(CLA|CLC|CLE|CLK|CLS|GLA|GLB|GLC|GLE|GLK|GLS|SLC|SLK|SL|CL|GL|ML|A|B|C|E|G|R|S|V|X)\s+\d/i);
    if (classVariant) {
      const modelClass = classVariant[1].toUpperCase();
      const classSlug = ["A", "B", "C", "E", "G", "R", "S", "V"].includes(modelClass)
        ? `klasa-${modelClass.toLowerCase()}`
        : modelClass === "X" ? "x-klasa" : modelClass.toLowerCase();
      return validatedOtomotoModel(makeSlug, classSlug, true);
    }
  }

  const alias = otomotoModelAliases[brand]?.[cleanModel];
  if (alias !== undefined) {
    const { slugs, broad = false } = typeof alias === "object" && !Array.isArray(alias) ? alias : { slugs: alias };
    if (![slugs].flat().length) return { slugs: [], broad: false, unsupported: true };
    return validatedOtomotoModel(makeSlug, slugs, broad);
  }
  if (otomotoMakeModels[brand]) return validatedOtomotoModel(makeSlug, otomotoMakeModels[brand], true);
  const matches = matchedOtomotoModels(makeSlug, cleanModel);
  if (matches.slugs.length) return validatedOtomotoModel(makeSlug, matches.slugs, matches.broad);
  const fallback = otomotoModelFallback(brand, cleanModel);
  if (fallback.length) return validatedOtomotoModel(makeSlug, fallback, true);
  return validatedOtomotoModel(makeSlug, otomotoSlug(cleanModel));
}

// Model families Otomoto keeps under one name: generations, old numbering, T-series vans.
function otomotoModelFallback(brand, model) {
  if (brand === "Porsche" && /^9\d\d$/.test(model) && model !== "918") return ["911"];
  const volvoSeries = brand === "Volvo" && model.match(/^([2-9])\d\d$/)?.[1];
  if (volvoSeries) return [`seria-${volvoSeries}00`];
  const renaultNumber = brand === "Renault" && model.match(/^R\s*(\d+)$/i)?.[1];
  if (renaultNumber) return [renaultNumber];
  if (brand === "Mercedes-Benz" && /^CE\s+\d/i.test(model)) return ["klasa-e"];
  if (brand === "Mercedes-Benz" && /^(200|220|230|240|250|260|300)$/.test(model)) return ["w123", "w124-1984-1993"];
  const vanSeries = brand === "Volkswagen" && model.match(/^T([1-7])\b/i)?.[1];
  if (vanSeries) return Number(vanSeries) < 3 ? ["transporter"] : ["transporter", "multivan", "caravelle", "california"];
  return [];
}

function appendOtomotoValues(params, filterId, values) {
  const uniqueValues = [...new Set((values || []).filter(Boolean))];
  if (!uniqueValues.length) return;
  if (uniqueValues.length === 1) {
    params.set(`search[${filterId}]`, uniqueValues[0]);
    return;
  }
  uniqueValues.forEach((value, index) => params.set(`search[${filterId}][${index}]`, value));
}

// Otomoto prices are in PLN while the form asks for EUR, so the price range is
// converted with the stored exchange rate (data/exchange-rates.json).
const EUR_PLN_FALLBACK = 4.3;

function eurPlnRate() {
  const rate = Number(window.AUTOGOOD_EXCHANGE_RATES?.rates?.EUR_PLN?.value);
  return Number.isFinite(rate) && rate > 0 ? rate : EUR_PLN_FALLBACK;
}

function appendOtomotoPriceRange(params, fromValue, toValue) {
  const rate = eurPlnRate();
  const { from, to } = rangeBounds(fromValue, toValue);
  if (from !== null) params.set("search[filter_float_price:from]", String(Math.round(from * rate)));
  if (to !== null) params.set("search[filter_float_price:to]", String(Math.round(to * rate)));
}

function appendOtomotoRange(params, filterId, fromValue, toValue) {
  const { from, to } = rangeBounds(fromValue, toValue);
  if (from !== null && to !== null && from > to) {
    throw new Error(copy[state.lang].marketSearchInvalidRange);
  }
  if (from !== null) params.set(`search[${filterId}:from]`, String(from));
  if (to !== null) params.set(`search[${filterId}:to]`, String(to));
}

function buildOtomotoSearchUrl(filters) {
  const makeSlug = otomotoMakeSelection(filters.brand).slug;
  if (filters.model && !filters.brand) throw new Error(copy[state.lang].marketSearchChooseBrand);

  const modelSelection = otomotoModelSelection(filters.brand, filters.model);
  const pathParts = ["https://www.otomoto.pl/osobowe", makeSlug].filter(Boolean);
  const params = new URLSearchParams();

  appendOtomotoValues(
    params,
    "filter_enum_model",
    modelSelection.slugs.length || filters.model ? modelSelection.slugs : otomotoMakeModels[filters.brand],
  );
  const body = otomotoBodyValues[filters.body];
  if (body) params.set("search[filter_enum_body_type]", body);
  appendOtomotoPriceRange(params, filters.priceFrom, String(filters.priceTo || "").trim().endsWith("+") ? "" : filters.priceTo);
  appendOtomotoRange(params, "filter_float_mileage", filters.mileageFrom, filters.mileageTo);
  appendOtomotoRange(params, "filter_float_year", filters.yearFrom, filters.yearTo);
  appendOtomotoRange(params, "filter_float_engine_capacity", filters.displacementFrom, filters.displacementTo);
  appendOtomotoRange(params, "filter_float_engine_power", filters.powerFrom, filters.powerTo);
  appendOtomotoRange(params, "filter_float_nr_seats", filters.seatsFrom, filters.seatsTo);

  appendOtomotoValues(
    params,
    "filter_enum_fuel_type",
    manualFuelValues(filters).map((value) => otomotoFuelValues[value]),
  );
  appendOtomotoValues(params, "filter_enum_transmission", otomotoDriveValues[filters.drive]);

  const gearbox = otomotoGearboxValues[filters.gearbox];
  if (gearbox) params.set("search[filter_enum_gearbox]", gearbox);
  if (filters.vat === "reclaimable") params.set("search[filter_enum_vat]", "1");
  if (filters.vat === "non_reclaimable") params.set("search[filter_enum_vat_discount]", "1");

  const seller = otomotoSellerValues[filters.seller];
  if (seller) params.set("search[private_business]", seller);
  // Mobile.de "cn" is where the car is offered. Otomoto listings are all in Poland, and its
  // "Kraj pochodzenia" (import origin) is a different filter, so countries stay reported, not sent.
  appendOtomotoValues(
    params,
    "filter_enum_upholstery_type",
    (filters.interiorMaterials || []).map((material) => otomotoInteriorMaterialValues[material]),
  );

  const airConditioning = otomotoAirConditioningValues[filters.airConditioning];
  if (airConditioning) params.set("search[filter_enum_air_conditioning_type]", airConditioning);
  if (filters.trailerCoupling && filters.trailerCoupling !== "any") {
    params.set("search[filter_enum_towbar]", "1");
  }

  const equipment = new Map();
  const addEquipment = (entries) => (entries || []).forEach(([filterId, value]) => {
    equipment.set(filterId, [...(equipment.get(filterId) || []), value]);
  });
  (filters.features || []).forEach((feature) => addEquipment(otomotoFeatureFilters[feature]));
  (filters.parkingSensors || []).forEach((sensor) => addEquipment(otomotoParkingFilters[sensor]));
  if (filters.cruiseControl === "CRUISE_CONTROL") {
    addEquipment([["filter_enum_cruisecontrol_type", "cruise-control"]]);
  }
  if (filters.cruiseControl === "ADAPTIVE_CRUISE_CONTROL") {
    addEquipment([
      ["filter_enum_cruisecontrol_type", "adaptive-cruise-control"],
      ["filter_enum_cruisecontrol_type", "adaptive-cruise-control-predictive"],
    ]);
  }
  equipment.forEach((values, filterId) => appendOtomotoValues(params, filterId, values));

  appendOtomotoValues(
    params,
    "filter_enum_color",
    (filters.exteriorColors || []).map((color) => otomotoExteriorColorValues[color]),
  );
  const colourTypes = [];
  if (filters.matte) colourTypes.push("matt");
  if (filters.metallic) colourTypes.push("metallic");
  appendOtomotoValues(params, "filter_enum_colour_type", colourTypes);
  if (filters.damagedVehicles !== "show") params.set("search[filter_enum_damaged]", "0");

  params.set("search[order]", "filter_float_price:asc");
  return `${pathParts.join("/")}?${params.toString()}`;
}

function otomotoSkippedFilterLabels(filters) {
  const c = copy[state.lang];
  const labels = [];
  const add = (label) => {
    if (label && !labels.includes(label)) labels.push(label);
  };

  if (otomotoMakeSelection(filters.brand).unsupported) add(c.brandLabel);
  if (filters.version) add(c.versionLabel);
  const modelSelection = otomotoModelSelection(filters.brand, filters.model);
  if (modelSelection.broad || modelSelection.unsupported) add(c.modelLabel);
  if (manualFuelValues(filters).some((fuel) => ["hybrid_diesel", "hybrid_petrol"].includes(fuel))) {
    add(c.fuelLabel);
  }
  if (["pickup", "other"].includes(filters.body)) add(c.bodyLabel);
  if (["dealer", "company"].includes(filters.seller)) add(c.sellerTypeLabel);
  if ((filters.countries || []).length) add(c.countryLabel);
  if (filters.trailerCoupling && filters.trailerCoupling !== "any") add(c.trailerCouplingLabel);
  (filters.features || [])
    .filter((feature) => otomotoUnsupportedFeatures.has(feature))
    .forEach((feature) => {
      const input = els.features.find((candidate) => candidate.value === feature);
      add(input ? optionLabelText(input) : feature);
    });
  if ((filters.parkingSensors || []).includes("REAR_TRAFFIC_ALERT")) add(c.parkingSensorsLabel);
  if ((filters.interiorColors || []).length) add(c.interiorColorLabel);
  if (filters.nonSmoking) add(c.nonSmokingLabel);
  if (filters.roadworthy) add(c.roadworthyLabel);
  return labels;
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
  model = model.replace(/\s{2,}/g, " ");
  // Listing titles carry engine and trim after the model ("i40 1.7 CRDi Kombi Style").
  // Keep the longest catalog model the title opens with, so searches use its ID.
  const catalogModel = catalogModelAtStart(brandMatch.value, model);
  return catalogModel || model.split(" ")[0] || model;
}

// Mobile.de names some models twice ("cee'd / Ceed", "pro cee'd / ProCeed"):
// either half counts, and apostrophes are ignored.
function catalogModelAtStart(brand, text) {
  const plain = (value) => String(value || "").toLowerCase().replace(/['’`]/g, "").replace(/\s{2,}/g, " ").trim();
  const lowerTitle = plain(text);
  if (!lowerTitle) return "";
  return modelGroupsForBrand(brand)
    .flatMap((group) => group.models)
    .filter((candidate) => candidate && candidate !== "Other")
    .map((candidate) => {
      const length = [candidate, ...candidate.split(" / ")].map(plain).filter((lowerCandidate) => {
        if (!lowerCandidate || !lowerTitle.startsWith(lowerCandidate)) return false;
        const next = lowerTitle.charAt(lowerCandidate.length);
        // "320d", "220i": a trim letter may follow a numeric model directly.
        return !next || !/[a-z0-9]/.test(next) || (/\d$/.test(lowerCandidate) && /^[a-z]\b/.test(lowerTitle.slice(lowerCandidate.length)));
      }).reduce((longest, lowerCandidate) => Math.max(longest, lowerCandidate.length), 0);
      return { candidate, length };
    })
    .filter((item) => item.length)
    .sort((left, right) => right.length - left.length)[0]?.candidate || "";
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

function recognizedEquipmentFilters(data) {
  const normalizeEquipment = (value) => normalizeToken(String(value || "").replace(/[łŁ]/g, "l").replace(/ß/g, "ss"));
  const items = [...(Array.isArray(data?.equipment) ? data.equipment : []), data?.title]
    .map(normalizeEquipment).filter(Boolean);
  const has = (pattern) => items.some((item) => pattern.test(item));
  const interior = normalizeEquipment(data?.interiorMaterial || "");
  const upholstery = [interior, ...items.filter((item) => /tapicer|polster|upholster|seats|sitze|fotele/.test(item))];
  const material = (pattern) => upholstery.some((item) => pattern.test(item));
  const interiorMaterials = [];
  if (material(/alcantara/)) interiorMaterials.push("alcantara");
  if (material(/czesciow.*skor|teil.*leder|part.*leather/)) interiorMaterials.push("part_leather");
  else if (material(/skorzan|leder|leather/)) interiorMaterials.push("full_leather");
  if (material(/materialow|tkanin|stoff|cloth|fabric/)) interiorMaterials.push("cloth");

  const parkingSensors = [];
  const camera360 = has(/kamera 360|360 grad kamera|360 degree camera|surround view/);
  if (camera360) parkingSensors.push("CAM_360_DEGREES");
  if (has(/kamera cofania|kamera wsteczna|ruckfahrkamera|rear view cam|reversing camera|back up camera/)
    || (!camera360 && has(/\bkamera\b|\bcamera\b/))) parkingSensors.push("REAR_VIEW_CAM");
  if (has(/czujnik.*parkowania.*przod|parksensor.*vorn|front parking sensor|front park assist/)) parkingSensors.push("FRONT_SENSORS");
  if (has(/czujnik.*parkowania.*tyl|parksensor.*hinten|rear parking sensor|rear park assist/)) parkingSensors.push("REAR_SENSORS");
  if (has(/ruchu poprzecznego.*tyl|querverkehr.*hinten|rear cross traffic/)) parkingSensors.push("REAR_TRAFFIC_ALERT");
  if (has(/automatyczn.*parkowan|samopark|selbstpark|self parking|automatic parking/)) parkingSensors.push("AUTOMATIC_PARKING");

  let cruiseControl = "any";
  if (has(/adaptacyjn.*tempomat|aktywn.*tempomat|abstandstempomat|abstandsregeltempomat|adaptive cruise|acc tempomat/)) cruiseControl = "ADAPTIVE_CRUISE_CONTROL";
  else if (has(/tempomat|geschwindigkeitsregelanlage|cruise control/)) cruiseControl = "CRUISE_CONTROL";

  let airConditioning = "";
  if (has(/klimatyzacj.*4 stref|4 zonen klima|4 zone climate/)) airConditioning = "automatic_4_zones";
  else if (has(/klimatyzacj.*3 stref|3 zonen klima|3 zone climate/)) airConditioning = "automatic_3_zones";
  else if (has(/klimatyzacj.*2 stref|2 zonen klima|2 zone climate|dwustrefow.*klimatyzacj/)) airConditioning = "automatic_2_zones";
  else if (has(/klimatyzacj.*automat|klimaautomatik|automatic.*climate|automatic air conditioning/)) airConditioning = "automatic";
  else if (has(/klimatyzacj.*manual|manuelle klimaanlage|manual air conditioning/)) airConditioning = "manual";

  let trailerCoupling = "any";
  if (has(/odchylan.*hak|(?:schwenkbar.*anhangerkupplung|anhangerkupplung.*schwenkbar)|swiveling tow/)) trailerCoupling = "swiveling";
  else if (has(/odlacz.*hak|odpinan.*hak|(?:abnehmbar.*anhangerkupplung|anhangerkupplung.*abnehmbar)|detachable tow/)) trailerCoupling = "detachable_or_swiveling";
  else if (has(/hak holowniczy|anhangerkupplung|tow ?bar|trailer hitch/)) trailerCoupling = "all";

  const featurePatterns = {
    PANORAMIC_GLASS_ROOF: /dach panoramiczn|panoramadach|panoramic roof/,
    ROOF_RAILS: /relingi dachowe|dachreling|roof rail/,
    AIR_SUSPENSION: /zawieszenie pneumatyczne|luftfederung|air suspension/,
    PERFORMANCE_HANDLING_SYSTEM: /sportowe zawieszenie|sportfahrwerk|sport suspension/,
    LASER_HEADLIGHTS: /reflektor.*laser|laserscheinwerfer|laser headlight/,
    LED_RUNNING_LIGHTS: /swiatla do jazdy dziennej led|led tagfahrlicht|led daytime running/,
    BI_XENON_HEADLIGHTS: /reflektor.*biksenon|bi xenon|bi xenon scheinwerfer/,
    ADAPTIVE_BENDING_LIGHTS: /adaptacyjn.*swiatl|swiatla doswietlajace zakret|kurvenlicht|adaptive headlight/,
    BLIND_SPOT_MONITOR: /asystent martwego pola|totwinkel|blind spot/,
    SPORT_PACKAGE: /pakiet sportowy|sportpaket|sport package/,
    KEYLESS_ENTRY: /zamek bezkluczykowy|bezkluczykowy centralny|schlussellos|keyless entry/,
    ELECTRIC_HEATED_SEATS: /podgrzewan.*(?:fotel|siedzen)|sitzheizung|heated seats/,
    HEATED_WINDSHIELD: /podgrzewan.*przedni.*szyb|beheizbare frontscheibe|heated windshield/,
    HEATED_STEERING_WHEEL: /podgrzewan.*kierownic|lenkradheizung|heated steering wheel/,
    ELECTRIC_HEATED_REAR_SEATS: /podgrzewan.*tyln.*(?:fotel|siedzen)|sitzheizung hinten|heated rear seats/,
    VENTILATED_SEATS: /wentylowan.*(?:fotel|siedzen)|sitzbeluftung|ventilated seats/,
    SPORT_SEATS: /sportow.*(?:fotel|siedzen)|sportsitze|sport seats/,
    MASSAGE_SEATS: /masaz.*(?:fotel|siedzen)|massagesitze|massage seats/,
    NIGHT_VISION_ASSIST: /asystent noktowizyjny|night vision|nachtsicht/,
    ALLOY_WHEELS: /felgi aluminiowe|alufelgen|leichtmetallfelgen|alloy wheels/,
    TRAFFIC_SIGN_RECOGNITION: /rozpoznawanie znakow drogowych|verkehrszeichenerkennung|traffic sign recognition/,
    CARPLAY: /apple carplay|\bcarplay\b/,
    ANDROID_AUTO: /android auto/,
    AMBIENT_LIGHTING: /oswietlenie ambientowe|ambientebeleuchtung|ambient lighting/,
    DIGITAL_COCKPIT: /cyfrow.*(?:kokpit|zestaw wskaznikow)|digitales cockpit|volldigitales kombiinstrument|digital cockpit/,
    HEAD_UP_DISPLAY: /head up display|wyswietlacz head up/,
    ELECTRIC_ADJUSTABLE_SEATS: /elektryczn.*regulacj.*(?:fotel|siedzen)|elektrisch.*sitzverstellung|electric seat adjustment/,
    MEMORY_SEATS: /(?:fotel|siedzen).*pamiec|sitz.*memory|memory seats/,
    WIRELESS_CHARGING: /ladowanie indukcyjne|induktives laden|wireless charging/,
    WINTER_TIRES: /opony zimowe|winterreifen|winter tires/,
    SUMMER_TIRES: /opony letnie|sommerreifen|summer tires/,
    ELECTRIC_TAILGATE: /elektryczn.*klapa bagaznika|elektrische heckklappe|electric tailgate/,
  };
  const features = Object.entries(featurePatterns).filter(([, pattern]) => has(pattern)).map(([key]) => key);
  return { interiorMaterials, parkingSensors, cruiseControl, airConditioning, trailerCoupling, features };
}

function applyRecognizedManualFields(data) {
  const title = data?.title || "";
  const brandMatch = matchBrand(title);
  // The ad's own model field (bookmarklet) names the model exactly as the catalog does.
  const model = (brandMatch && catalogModelAtStart(brandMatch.value, data?.model)) || extractModel(title, brandMatch);
  const registrationYear = extractYear(data?.firstRegistration);
  const displacementCcm = compactNumber(data?.displacementCcm);
  const powerHp = compactNumber(data?.powerHp ?? data?.horsepower ?? data?.powerPs);
  const mileageKm = Number(compactNumber(data?.mileageKm));
  const equipment = recognizedEquipmentFilters(data);
  const next = {
    brand: brandMatch?.value || "",
    model,
    fuels: [
      normalizeFuel(data?.fuel, title),
      normalizePlugin(data?.fuel, title) === "yes" ? "plugin" : "",
    ].filter(Boolean),
    body: normalizeBody(data?.bodyType),
    // A fixed 30,000 km window keeps the first comparison reasonably close.
    mileageFrom: mileageKm > 0 ? String(Math.max(0, mileageKm - 30000)) : "",
    mileageTo: mileageKm > 0 ? String(mileageKm + 30000) : "",
    yearFrom: registrationYear || "",
    yearTo: registrationYear || "",
    displacementFrom: displacementCcm ? String(Math.max(0, Number(displacementCcm) - 100)) : "",
    displacementTo: displacementCcm ? String(Number(displacementCcm) + 100) : "",
    powerFrom: powerHp ? String(Math.floor(Number(powerHp) * 0.9)) : "",
    powerTo: powerHp ? String(Math.ceil(Number(powerHp) * 1.1)) : "",
    gearbox: normalizeGearboxChoice(data?.gearbox),
  };

  // Lets the market analysis tell whether it shows this very car's market.
  if (data && typeof data === "object") data.matchedFilters = { brand: next.brand, model: next.model };
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
  setCheckedValues(els.interiorMaterials, equipment.interiorMaterials);
  setCheckedValues(els.parkingSensors, equipment.parkingSensors);
  setCheckedValue(els.cruiseControl, equipment.cruiseControl);
  setCheckedValue(els.airConditioning, equipment.airConditioning);
  setCheckedValue(els.trailerCoupling, equipment.trailerCoupling);
  setCheckedValues(els.features, equipment.features);

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
  if (!els.scenarios) return;
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
  const title = text(data.title);
  const powerValue = data.powerHp ?? data.horsepower ?? data.powerPs;

  els.title.textContent = title;
  // Listing data and purchase paths appear only once a link has been recognised.
  if (els.listingResult) els.listingResult.hidden = !state.data;
  if (!state.data) {
    els.listingDetails.innerHTML = "";
    renderScenarios();
    return;
  }
  const location = data.location || {};
  const countryCode = String(location.country || "").toUpperCase();
  const country = [c.countryNames[countryCode] || location.country || "", location.city || ""].filter(Boolean).join(", ");
  const seller = [
    data.sellerType === "PRIVATE" ? c.sellerPrivate : data.sellerType ? c.sellerDealer : "",
    location.sellerName || "",
  ].filter(Boolean).join(" · ");
  const price = data.pricePln
    ? `<b>${escapeHtml(formatAmount(data.pricePln, "PLN"))}</b><small>≈ ${escapeHtml(formatAmount(data.carBruttoEur, "EUR"))}</small>`
    : `<b>${escapeHtml(formatAmount(data.carBruttoEur, "EUR"))}</b>`;
  const equipment = Array.isArray(data.equipment) ? data.equipment.filter(Boolean) : [];
  els.listingDetails.innerHTML = specSheetHtml({
    kicker: c.specVehicleKicker,
    title,
    aside: `<span class="agSpecPrice">${price}</span>`,
    columns: [
      { heading: c.specEngineHeading, rows: [
        [c.specBody, bodyLabelOf(data.bodyType)],
        [c.specEngineType, fuelLabelOf(data.fuel, title)],
        [c.specDisplacement, formatNumberWithUnit(data.displacementCcm, "ccm")],
        [c.specPower, formatNumberWithUnit(powerValue, "KM")],
      ] },
      { heading: c.specUsageHeading, rows: [
        [c.specMileage, formatNumberWithUnit(data.mileageKm, "km")],
        [c.specRegistration, listingRegistration(data.firstRegistration)],
        [c.specGearbox, listingGearboxLabel(data.gearbox)],
        [c.specDrive, data.drive || ""],
      ] },
      ...(equipment.length ? [{ heading: c.specEquipmentHeading, text: equipment.join(" - ") }] : []),
      { heading: c.specOtherHeading, rows: [
        [c.specCountry, country],
        [c.specStatus, data.condition || ""],
        [c.specVat, purchaseTypeLabel(data)],
        [c.specSeller, seller],
      ] },
    ],
  });

  renderScenarios();
}

function setStatus(status, message = "", replacesError = false) {
  const c = copy[state.lang];
  state.status = status;
  state.error = message;
  state.errorIsFullText = replacesError;
  els.status.classList.toggle("isError", status === "error");
  els.status.classList.toggle("isSuccess", status === "ready");
  els.status.textContent = status === "loading"
    ? c.loading
    : status === "ready"
      ? (state.errorIsFullText && message ? message : c.ready)
      : status === "error" || status === "waiting"
        ? (state.errorIsFullText ? message : `${c.error}${message ? ` ${message}` : ""}`)
        : c.helper;
  els.submit.disabled = status === "loading";
  renderI18n();
}

// ---- Data from the AUTOGOOD bookmarklet -----------------------------------
// Same delivery/inspection tariffs and excise class as server/mobilede-import.mjs,
// so an ad read in the browser gives the calculator the same numbers.
function tariffText(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function tariffCountry(location) {
  const raw = tariffText(location?.country);
  const byCode = { de: "DE", deu: "DE", be: "BE", bel: "BE", fr: "FR", fra: "FR", it: "IT", ita: "IT", es: "ES", esp: "ES", nl: "NL", nld: "NL", se: "SE", swe: "SE", lt: "BALTICS", lv: "BALTICS", ee: "BALTICS" };
  if (byCode[raw]) return byCode[raw];
  const text = tariffText(`${location?.country || ""} ${location?.address || ""} ${location?.city || ""}`);
  if (/\b(germany|deutschland|niemcy)\b/.test(text)) return "DE";
  if (/\b(belgium|belgie|belgia|belgique)\b/.test(text)) return "BE";
  if (/\b(france|frankreich|francja)\b/.test(text)) return "FR";
  if (/\b(italy|italien|wlochy|italia)\b/.test(text)) return "IT";
  if (/\b(netherlands|niederlande|holandia|nederland)\b/.test(text)) return "NL";
  if (/^\d{5}$/.test(String(location?.postalCode || ""))) return "DE";
  return "";
}

function estimateDeliveryInspection(bodyType, location) {
  const country = tariffCountry(location);
  const postalCode = String(location?.postalCode || "");
  const city = tariffText(location?.city);
  let tariff = { transport: 5000, inspection: 2500, rule: "other_europe" };
  if (country === "BE") tariff = { transport: 2500, inspection: 1500, rule: "belgium" };
  if (country === "NL") tariff = { transport: 2500, inspection: 1500, rule: "netherlands" };
  if (country === "ES") tariff = { transport: 4500, inspection: 2000, rule: "spain" };
  if (country === "BALTICS") tariff = { transport: 2000, inspection: 1500, rule: "baltics" };
  if (country === "DE") {
    const south = /^[6789]/.test(postalCode)
      || /\b(bayern|bavaria|baden|wurttemberg|munich|munchen|muenchen|stuttgart|nurnberg|nuernberg|augsburg|ulm|freiburg|konstanz)\b/.test(city);
    tariff = south
      ? { transport: 2700, inspection: 1500, rule: "germany_south" }
      : { transport: 2500, inspection: 1300, rule: "germany_north_middle_east_west" };
  }
  if (country === "FR") {
    const parisOrEast = /^(75|77|78|91|92|93|94|95|02|08|10|21|25|39|51|52|54|55|57|58|67|68|70|71|88|89|90)/.test(postalCode);
    tariff = parisOrEast
      ? { transport: 2750, inspection: 1800, rule: "france_paris_border_east" }
      : { transport: 3000, inspection: 2200, rule: "france_other" };
  }
  const body = String(bodyType || "").toLowerCase();
  const surcharge = /camper|camping|motorhome|wohnmobil|bus|buss|autobus/.test(body) ? 400
    : /suv|off-road|offroad|gel[aä]nde|terenowy|minibus|van|mpv|minivan/.test(body) ? 200 : 0;
  return { transport: tariff.transport + surcharge, inspection: tariff.inspection, currency: "PLN", netto: true, rule: tariff.rule, surcharge };
}

function classifyEngineType(fuel, displacementCcm) {
  const normalized = String(fuel || "").toLowerCase();
  const isOver2000 = (Number(displacementCcm) || 0) > 2000;
  const isPlugIn = /plug|phev/.test(normalized);
  const isElectric = /elect|elektro|elektry|bev/.test(normalized);
  const isHybrid = /hybrid|hybryd|hev/.test(normalized);
  if (isElectric && !isHybrid) return 0;
  if (isPlugIn) return isOver2000 ? 1 : 0;
  if (isHybrid) return isOver2000 ? 1 : 2;
  return isOver2000 ? 4 : 3;
}

const ENGINE_TYPE_LABELS = [
  "EL / PHEV <=2000cm³",
  "PHEV / HEV >2000cm³",
  "HEV <=2000cm³",
  "Spalinowy <=2000cm³",
  "Spalinowy >2000cm³",
];

// An ad read on mobile.de by the bookmarklet: same shape as the import backend's answer.
function applyMobileAd(ad) {
  const estimate = estimateDeliveryInspection(ad.bodyType || ad.category, ad.location);
  const engineTypeIndex = classifyEngineType(`${ad.fuel} ${ad.title}`, ad.displacementCcm);
  const title = ad.title || [ad.brand, ad.model].filter(Boolean).join(" ");
  state.data = {
    sourceUrl: ad.sourceUrl,
    adId: ad.adId,
    importMode: "bookmarklet",
    carBruttoEur: ad.carBruttoEur,
    purchaseType: ad.vatReclaimable ? "VAT" : "Marża",
    title,
    bodyType: ad.bodyType || ad.category,
    fuel: ad.fuel,
    displacementCcm: ad.displacementCcm,
    powerHp: ad.powerHp,
    gearbox: ad.gearbox,
    mileageKm: ad.mileageKm,
    firstRegistration: ad.firstRegistration,
    location: ad.location,
    condition: ad.condition || "",
    equipment: ad.equipment || [],
    sellerType: ad.sellerType || "",
    transportNettoPln: estimate.transport,
    inspectionNettoPln: estimate.inspection,
    transportEstimate: estimate,
    deliveryInspectionEstimate: estimate,
    engineTypeIndex,
    engineTypeLabel: ENGINE_TYPE_LABELS[engineTypeIndex],
  };
  if (ad.sourceUrl) els.url.value = ad.sourceUrl;
  setStatus("ready", copy[state.lang].recognitionFromBookmarklet, true);
  applyRecognizedManualFields(state.data);
  renderData();
}

window.AUTOGOOD_APPLY_MOBILE_AD = applyMobileAd;
window.AUTOGOOD_BRIDGE_HINT = () => setMarketSearchStatus(copy[state.lang].bookmarkletHint);

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
    // A dead import backend must not read as a broken link.
    const unreachable = error instanceof TypeError || /failed to fetch|networkerror/i.test(error.message || "");
    if (state.data) return;
    const viaBookmarklet = unreachable && /^https:\/\/(suchen|www|m)\.mobile\.de\//.test(sourceUrl);
    // Waiting for the bookmark is a next step, not an error.
    setStatus(
      viaBookmarklet ? "waiting" : "error",
      viaBookmarklet ? copy[state.lang].recognitionViaBookmarklet : unreachable ? copy[state.lang].recognitionUnavailable : (error.message || ""),
      unreachable,
    );
    renderData();
  }
}

document.querySelectorAll("[data-lang-button]").forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.langButton === "ru" ? "ru" : "pl";
    renderI18n();
    setStatus(state.status, state.error, state.errorIsFullText);
    renderData();
  });
});

function selectComboOption(optionButton) {
  const control = optionButton.closest(".mobileComboControl");
  const targetName = control?.dataset.mobileOptionsTarget;
  const input = targetName ? control.querySelector(`[${targetName}]`) : null;
  if (!input) return false;
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
  updateSelectedFiltersSummary();
  closeComboMenus();
  input.focus();
  return true;
}

document.addEventListener("pointerdown", (event) => {
  const optionButton = event.target.closest("[data-mobile-option-value]");
  if (!optionButton) return;
  event.preventDefault();
  optionButton.dataset.mobileOptionSelected = "true";
  selectComboOption(optionButton);
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
    if (optionButton.dataset.mobileOptionSelected !== "true") selectComboOption(optionButton);
    return;
  }

  const control = event.target.closest(".mobileComboControl[data-mobile-options]");
  if (control) {
    if (event.target.closest("input")) {
      // A click always shows the whole list; typing (the input event) narrows it.
      openComboMenu(control);
      if (!event.target.readOnly && event.target.value) event.target.select();
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
  if (event.key === "Enter") {
    const input = event.target.closest?.(".mobileComboControl[data-mobile-options] input:not([readonly])");
    const control = input?.closest(".mobileComboControl[data-mobile-options]");
    const activeOption = control?.querySelector(".mobileComboMenu button.isKeyboardActive");
    if (control?.classList.contains("isOpen") && activeOption) {
      event.preventDefault();
      selectComboOption(activeOption);
      return;
    }
  }
  if (event.key === "Escape") {
    closeComboMenus();
    closeMultiSelects();
  }
});

const rangeEndsByStart = new Map([
  [els.priceFrom, [els.priceTo, true]],
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

els.bodyChoices?.addEventListener("change", (event) => {
  const choice = event.target.closest("[data-mobile-body-choice]");
  if (choice) els.body.value = choice.value;
});
els.countries.forEach((input) => input.addEventListener("change", updateCountrySummary));
els.fuels.forEach((input) => input.addEventListener("change", updateFuelSummary));

// Live Otomoto match count in the sticky panel: one request per settled
// filter change, and the same filters are never asked twice.
const offerCounts = new Map();
let offerCountRequest = 0;
let offerCountTimer = 0;

function renderOfferCount(value) {
  if (els.searchCount) els.searchCount.textContent = value;
}

async function refreshOfferCount() {
  if (!els.searchCount || typeof window.AUTOGOOD_MOBILE_OTOMOTO_COUNT !== "function") return;
  let filters;
  try {
    filters = readManualFields();
  } catch {
    return;
  }
  if (!filters.brand || !filters.model) {
    renderOfferCount("—");
    return;
  }
  let key;
  try {
    key = buildOtomotoSearchUrl(filters);
  } catch {
    renderOfferCount("—");
    return;
  }
  if (offerCounts.has(key)) {
    renderOfferCount(offerCounts.get(key));
    return;
  }
  const request = ++offerCountRequest;
  renderOfferCount(copy[state.lang].offerCountLoading);
  try {
    const total = await window.AUTOGOOD_MOBILE_OTOMOTO_COUNT(filters);
    const label = new Intl.NumberFormat(state.lang === "ru" ? "ru-RU" : "pl-PL").format(total);
    offerCounts.set(key, label);
    if (request === offerCountRequest) renderOfferCount(label);
  } catch {
    if (request === offerCountRequest) renderOfferCount("—");
  }
}

function scheduleOfferCount() {
  window.clearTimeout(offerCountTimer);
  offerCountTimer = window.setTimeout(refreshOfferCount, 1200);
}

// Rarely used filter groups stay folded; the title shows what is set inside.
function updateCollapsibleCard(card) {
  const body = card.querySelector(".mobileFilterCardBody");
  const toggle = card.querySelector("[data-mobile-collapse-toggle]");
  if (!body || !toggle) return;
  const open = card.classList.contains("isOpen");
  const selected = card.querySelectorAll("input:checked:not([value='any']):not([value=''])").length;
  body.hidden = !open;
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.querySelector("span").textContent = open
    ? copy[state.lang].hideMoreFilters
    : copy[state.lang].showMoreFilters;
  const counter = card.querySelector("[data-mobile-collapse-count]");
  counter.textContent = selected ? String(selected) : "";
  counter.hidden = !selected;
}

document.querySelectorAll("[data-mobile-collapsible]").forEach((card) => {
  const title = card.querySelector(".mobileFilterCardTitle");
  if (!title) return;
  const counter = document.createElement("em");
  counter.dataset.mobileCollapseCount = "";
  counter.className = "mobileFilterCardCount";
  counter.hidden = true;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.dataset.mobileCollapseToggle = "";
  toggle.className = "mobileFilterCardToggle";
  toggle.innerHTML = "<span></span>";
  title.append(counter, toggle);
  toggle.addEventListener("click", () => {
    card.classList.toggle("isOpen");
    updateCollapsibleCard(card);
  });
  updateCollapsibleCard(card);
});

function updateModelHint() {
  if (!els.modelHint) return;
  const brand = canonicalBrand(els.brand?.value) || "";
  const model = String(els.model?.value || "").trim();
  const known = !model || !brand || modelGroupsForBrand(brand)
    .some((group) => group.models.some((name) => normalizeToken(name) === normalizeToken(model)));
  els.modelHint.hidden = known;
  els.model?.closest(".mobileComboControl")?.classList.toggle("isUnknownModel", !known);
}

document.querySelector(".mobileManualForm")?.addEventListener("input", updateSelectedFiltersSummary);
document.querySelector(".mobileManualForm")?.addEventListener("change", updateSelectedFiltersSummary);
document.querySelector(".mobileManualForm")?.addEventListener("input", () => {
  updateModelHint();
  scheduleOfferCount();
});
document.querySelector(".mobileManualForm")?.addEventListener("change", () => {
  document.querySelectorAll("[data-mobile-collapsible]").forEach(updateCollapsibleCard);
  updateModelHint();
  scheduleOfferCount();
});

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

// Both the sticky panel and the buttons under the form open the same searches.
els.otomotoSearches.forEach((link) => link.addEventListener("click", (event) => {
  try {
    const filters = readManualFields();
    const searchUrl = buildOtomotoSearchUrl(filters);
    link.href = searchUrl;
    window.AUTOGOOD_MOBILE_LOG_SEARCH?.(searchUrl);
    const skipped = otomotoSkippedFilterLabels(filters);
    const converted = (filters.priceFrom || filters.priceTo)
      ? ` ${copy[state.lang].otomotoPriceConverted.replace("{rate}", `1 € = ${eurPlnRate().toFixed(2)} zł`)}`
      : "";
    const message = (skipped.length
      ? copy[state.lang].otomotoSearchSkipped.replace("{filters}", skipped.join(", "))
      : copy[state.lang].otomotoSearchOpening) + converted;
    setMarketSearchStatus(message);
  } catch (error) {
    event.preventDefault();
    link.href = "#";
    setMarketSearchStatus(error.message || copy[state.lang].marketSearchInvalidRange, true);
  }
}));

els.marketSearches.forEach((link) => link.addEventListener("click", (event) => {
  try {
    const searchUrl = buildMobileDeSearchUrl(readManualFields());
    link.href = searchUrl;
    window.AUTOGOOD_MOBILE_LOG_SEARCH?.(searchUrl);
    setMarketSearchStatus(copy[state.lang].marketSearchOpening);
  } catch (error) {
    event.preventDefault();
    link.href = "#";
    setMarketSearchStatus(error.message || copy[state.lang].marketSearchInvalidRange, true);
  }
}));

// ---- Otomoto ad links ------------------------------------------------------
// Otomoto ads are read through the same reader proxy as the market analysis
// (Otomoto blocks cross-origin reads); the page's __NEXT_DATA__ carries the
// ad with machine-readable parameters.
const OTOMOTO_BODY_TYPES = {
  combi: "estate",
  compact: "hatchback",
  "city-car": "small car",
  sedan: "sedan",
  suv: "suv",
  minivan: "van",
  coupe: "coupe",
  cabrio: "cabrio",
};

// Otomoto fuel codes in the words the form's fuel reader understands.
const OTOMOTO_FUELS = {
  petrol: "petrol",
  diesel: "diesel",
  hybrid: "hybrid petrol",
  "plugin-hybrid": "plug-in hybrid petrol",
  electric: "electric",
  "petrol-lpg": "petrol",
  "petrol-cng": "petrol",
};

function isOtomotoUrl(value) {
  return /^https:\/\/(www\.|m\.)?otomoto\.pl\//.test(String(value || "").trim());
}

function linkSource() {
  return document.querySelector("[data-mobile-link-source]:checked")?.value || "mobile";
}

function setLinkSource(source) {
  document.querySelectorAll("[data-mobile-link-source]").forEach((input) => {
    input.checked = input.value === source;
  });
  els.url.placeholder = source === "otomoto" ? "https://www.otomoto.pl/osobowe/oferta/..." : "https://suchen.mobile.de/...";
  // The bookmark only works on mobile.de.
  const bookmarkletRow = document.querySelector("[data-mobile-bookmarklet-row]");
  if (bookmarkletRow) bookmarkletRow.hidden = source === "otomoto";
}

document.querySelectorAll("[data-mobile-link-source]").forEach((input) => {
  input.addEventListener("change", () => setLinkSource(linkSource()));
});
// A pasted link picks its portal by itself.
els.url.addEventListener("input", () => {
  const value = els.url.value.trim();
  if (isOtomotoUrl(value)) setLinkSource("otomoto");
  else if (/^https:\/\/(suchen|www|m)\.mobile\.de\//.test(value)) setLinkSource("mobile");
});

async function loadOtomotoAd(sourceUrl) {
  const c = copy[state.lang];
  setStatus("loading");
  state.data = null;
  renderData();
  try {
    const proxy = window.AUTOGOOD_MARKET_PROXY || "https://r.jina.ai/";
    const response = await fetch(`${proxy}${sourceUrl}`, { headers: { "x-respond-with": "html" } });
    if (!response.ok) throw new Error(String(response.status));
    const html = await response.text();
    const raw = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    const advert = raw ? JSON.parse(raw[1])?.props?.pageProps?.advert : null;
    if (!advert?.price?.value) throw new Error(c.otomotoAdFailed);
    const param = (key) => advert.parametersDict?.[key]?.values?.[0] || {};
    const pricePln = Number(advert.price.value) || 0;
    const currency = String(advert.price.currency || "PLN").toUpperCase();
    const rate = eurPlnRate();
    const priceEur = currency === "EUR" ? pricePln : pricePln / rate;
    const powerHp = Number(param("engine_power").value) || null;
    const displacementCcm = Number(param("engine_capacity").value) || null;
    const fuel = param("fuel_type").label || "";
    const title = String(advert.title || [param("make").label, param("model").label, param("version").label].filter(Boolean).join(" "));
    const location = advert.seller?.location || {};
    const engineTypeIndex = classifyEngineType(`${fuel} ${param("fuel_type").value || ""} ${title}`, displacementCcm);
    state.data = {
      sourceUrl,
      adId: String(advert.id || ""),
      importMode: "otomoto",
      carBruttoEur: Math.round(priceEur),
      pricePln: currency === "PLN" ? pricePln : Math.round(pricePln * rate),
      purchaseType: "Marża",
      title,
      model: param("model").label || "",
      // English words the form's normalisers already understand.
      bodyType: OTOMOTO_BODY_TYPES[param("body_type").value] || param("body_type").label || "",
      fuel,
      displacementCcm,
      powerHp,
      gearbox: param("gearbox").value || param("gearbox").label || "",
      mileageKm: Number(param("mileage").value) || null,
      firstRegistration: String(param("year").value || ""),
      drive: param("transmission").label || "",
      equipment: (advert.equipment || []).flatMap((group) => (group.values || []).map((item) => item.label)).filter(Boolean),
      condition: [
        param("damaged").value === "1" ? param("damaged").label && "Uszkodzony" : "",
        param("no_accident").value === "1" ? "Bezwypadkowy" : "",
        param("service_record").value === "1" ? "Serwisowany w ASO" : "",
      ].filter(Boolean).join(", "),
      sellerType: advert.seller?.type || "",
      location: {
        address: location.address || location.shortAddress || "",
        city: location.city || "",
        postalCode: location.postalCode || "",
        country: "PL",
        sellerName: advert.seller?.name || "",
      },
      // The car is already in Poland: no transport from Germany.
      transportNettoPln: 0,
      inspectionNettoPln: 0,
      engineTypeIndex,
      engineTypeLabel: ENGINE_TYPE_LABELS[engineTypeIndex],
    };
    setStatus("ready", c.recognitionFromOtomoto, true);
    const forForm = { ...state.data, fuel: OTOMOTO_FUELS[param("fuel_type").value] || fuel };
    applyRecognizedManualFields(forForm);
    state.data.matchedFilters = forForm.matchedFilters;
    renderData();
  } catch (error) {
    state.data = null;
    setStatus("error", error.message && !/^\d+$/.test(error.message) ? error.message : c.otomotoAdFailed, true);
    renderData();
  }
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const sourceUrl = els.url.value.trim();
  if (!sourceUrl) return;
  if (isOtomotoUrl(sourceUrl)) {
    setLinkSource("otomoto");
    loadOtomotoAd(sourceUrl);
    return;
  }
  if (linkSource() === "otomoto") {
    setStatus("error", copy[state.lang].otomotoLinkExpected, true);
    return;
  }
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

fetch("./data/exchange-rates.json")
  .then((response) => (response.ok ? response.json() : null))
  .then((rates) => {
    if (rates) window.AUTOGOOD_EXCHANGE_RATES = rates;
  })
  .catch(() => {
    // Without the file the fallback rate keeps the Otomoto price filter sane.
  });

// The sticky panels start below the global navigation, which can wrap to two
// rows on a narrow window, so its height is measured instead of guessed.
function syncNavigationHeight() {
  const nav = document.querySelector(".agGlobalNav");
  const height = nav ? Math.round(nav.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty("--ag-nav-height", `${height || 59}px`);
}

syncNavigationHeight();
window.addEventListener("resize", syncNavigationHeight);
window.addEventListener("load", syncNavigationHeight);

const initialParams = new URLSearchParams(window.location.search);
const initialUrl = initialParams.get("url");
if (initialUrl) els.url.value = initialUrl;

renderManualOptions(false);
renderI18n();
renderData();

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
