const umowyCopy = {
  pl: {
    navTools: "Narzędzia",
    navUmowy: "Umowy",
    eyebrow: "DOKUMENTY",
    subtitle: "Wybierz typ dokumentu: umowę wyszukiwania, umowę sprzedaży albo wariant eksportowy.",
    searchTitle: "Umowa wyszukiwania",
    searchDesc: "Zlecenie poszukiwania i zakupu pojazdu na rachunek klienta.",
    saleTitle: "Umowa sprzedaży",
    saleDesc: "Sprzedaż pojazdu klientowi — załącznik do faktury VAT Marża.",
    exportTitle: "Umowa wyszukiwania (Eksport)",
    exportDesc: "Wariant eksportowy zlecenia poszukiwania — na Białoruś.",
  },
  ru: {
    navTools: "Инструменты",
    navUmowy: "Договоры",
    eyebrow: "ДОКУМЕНТЫ",
    subtitle: "Выбери тип документа: договор поиска, договор продажи или экспортный вариант.",
    searchTitle: "Договор поиска",
    searchDesc: "Заявка на поиск и покупку автомобиля на счет клиента.",
    saleTitle: "Договор продажи",
    saleDesc: "Продажа автомобиля клиенту — приложение к фактуре VAT Marża.",
    exportTitle: "Договор поиска (Экспорт)",
    exportDesc: "Экспортный вариант заявки на поиск — на Беларусь.",
  },
};

const langButtons = document.querySelectorAll("[data-lang]");
const copyNodes = document.querySelectorAll("[data-i18n]");

function setUmowyLanguage(lang) {
  const copy = umowyCopy[lang] || umowyCopy.pl;
  document.documentElement.lang = lang;

  copyNodes.forEach((node) => {
    const key = node.dataset.i18n;
    if (copy[key]) {
      node.textContent = copy[key];
    }
  });

  langButtons.forEach((button) => {
    button.classList.toggle("isActive", button.dataset.lang === lang);
  });
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => setUmowyLanguage(button.dataset.lang));
});

setUmowyLanguage("pl");
