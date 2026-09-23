(() => {
  const script = document.currentScript || document.querySelector("script[data-ag-global-nav]");
  const basePath = script?.dataset.agNavRoot || "./";
  const historyKey = "autogood.globalNavigation.previousPath";
  const currentUrl = new URL(window.location.href);
  const homePath = new URL(basePath, currentUrl).pathname;
  const sections = [
    { href: "calculators.html", number: "01", label: "Калькулятор" },
    { href: "umowy.html", number: "02", label: "Документы" },
    { href: "auctions.html", number: "03", label: "Аукционы" },
    { href: "partslink24.html", number: "04", label: "VIN" },
    { href: "mobile.html", number: "05", label: "Mobile.de" },
  ];

  const isSameSitePage = (url) => url.origin === currentUrl.origin && url.pathname.startsWith(new URL(basePath, currentUrl).pathname);
  const previousPath = sessionStorage.getItem(historyKey);
  const hasPreviousPage = currentUrl.pathname !== homePath && previousPath && previousPath !== currentUrl.pathname + currentUrl.search;

  const navigation = document.createElement("header");
  navigation.className = "agGlobalNav";
  navigation.setAttribute("aria-label", "Основная навигация AUTOGOOD");

  const inner = document.createElement("div");
  inner.className = "agGlobalNavInner";
  navigation.append(inner);

  const identity = document.createElement("div");
  identity.className = "agGlobalNavIdentity";
  identity.innerHTML = `<a class="agGlobalNavBrand" href="${basePath}" aria-label="AUTOGOOD — главная страница"><img src="${basePath}assets/autogood-logo.png" alt="AUTOGOOD" /></a>`;

  if (hasPreviousPage) {
    const back = document.createElement("button");
    back.className = "agGlobalNavBack";
    back.type = "button";
    back.setAttribute("aria-label", "Вернуться на предыдущую страницу");
    back.innerHTML = '<b aria-hidden="true">←</b><span>Назад</span>';
    back.addEventListener("click", () => {
      if (document.referrer && new URL(document.referrer).origin === currentUrl.origin) {
        window.history.back();
      } else {
        window.location.assign(previousPath);
      }
    });
    identity.append(back);
  }

  const links = document.createElement("nav");
  links.className = "agGlobalNavSections";
  links.setAttribute("aria-label", "Разделы AUTOGOOD");
  for (const section of sections) {
    const link = document.createElement("a");
    const target = new URL(basePath + section.href, currentUrl);
    link.href = basePath + section.href;
    if (target.pathname === currentUrl.pathname) link.setAttribute("aria-current", "page");
    link.innerHTML = `<b>${section.number}</b><span>${section.label}</span>`;
    links.append(link);
  }

  inner.append(identity, links);
  document.body.prepend(navigation);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || link.target || event.defaultPrevented) return;
    const target = new URL(link.href, currentUrl);
    if (isSameSitePage(target) && target.href !== currentUrl.href) {
      sessionStorage.setItem(historyKey, currentUrl.pathname + currentUrl.search);
    }
  });
})();
