/* Bridge between mobile.html and the AUTOGOOD bookmarklet running on mobile.de.
 * The bookmarklet answers the tab that opened mobile.de (postMessage) or, when
 * it was clicked on a tab opened by hand, opens mobile.html with the data in
 * the #autogood-import=… fragment (never sent to any server).
 */
(() => {
  const MOBILE_ORIGINS = /^https:\/\/(suchen|www|m)\.mobile\.de$/;
  const MAX_LISTINGS = 2000;

  // The bookmark is built from src/autogood-bookmarklet.js with this page's
  // own address, so it always sends the data back to where it came from.
  let bookmarkletHref = null;

  async function prepareBookmarklets() {
    const links = [...document.querySelectorAll("[data-autogood-bookmarklet]")];
    if (!links.length) return;
    try {
      if (!bookmarkletHref) {
        const response = await fetch("./src/autogood-bookmarklet.js?v=bridge6-20260924");
        if (!response.ok) return;
        const appUrl = `${location.origin}${location.pathname}`;
        // Only the quoted constant: the file's comments mention the placeholder too.
        const code = (await response.text()).replace('"__AUTOGOOD_APP__"', JSON.stringify(appUrl));
        bookmarkletHref = `javascript:${encodeURIComponent(code)}`;
      }
      links.forEach((link) => {
        link.href = bookmarkletHref;
        if (link.dataset.autogoodReady) return;
        link.dataset.autogoodReady = "true";
        // Clicking it here does nothing useful: it is meant to be dragged to the bar.
        link.addEventListener("click", (event) => {
          event.preventDefault();
          window.AUTOGOOD_BRIDGE_HINT?.();
        });
      });
    } catch {
      // Without the file the bookmark simply stays inactive.
    }
  }

  window.AUTOGOOD_PREPARE_BOOKMARKLETS = prepareBookmarklets;

  const number = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };
  const textValue = (value, limit = 300) => String(value ?? "").slice(0, limit);

  // Data from another site: keep only the fields and types mobile.html uses.
  function cleanAd(ad) {
    if (!ad || typeof ad !== "object") return null;
    const price = number(ad.carBruttoEur);
    if (!price) return null;
    const location = ad.location && typeof ad.location === "object" ? ad.location : {};
    return {
      sourceUrl: /^https:\/\/(suchen|www|m)\.mobile\.de\//.test(String(ad.sourceUrl)) ? String(ad.sourceUrl) : "",
      adId: textValue(ad.adId, 40),
      title: textValue(ad.title),
      brand: textValue(ad.brand, 60),
      model: textValue(ad.model, 80),
      carBruttoEur: price,
      vatReclaimable: Boolean(ad.vatReclaimable),
      priceText: textValue(ad.priceText, 200),
      mileageKm: number(ad.mileageKm),
      firstRegistration: textValue(ad.firstRegistration, 20),
      fuel: textValue(ad.fuel, 60),
      gearbox: textValue(ad.gearbox, 60),
      powerHp: number(ad.powerHp),
      displacementCcm: number(ad.displacementCcm),
      bodyType: textValue(ad.bodyType, 80),
      category: textValue(ad.category, 120),
      color: textValue(ad.color, 60),
      location: {
        address: textValue(location.address, 200),
        city: textValue(location.city, 80),
        postalCode: textValue(location.postalCode, 12),
        country: textValue(location.country, 40),
        sellerName: textValue(location.sellerName, 120),
      },
    };
  }

  function cleanListings(listings) {
    if (!Array.isArray(listings)) return [];
    return listings.slice(0, MAX_LISTINGS).map((item) => {
      const price = number(item?.price);
      if (!price) return null;
      const url = /^https:\/\/(suchen|www|m)\.mobile\.de\//.test(String(item.url)) ? String(item.url) : "";
      return {
        id: textValue(item.id, 40),
        url,
        title: textValue(item.title, 120),
        price,
        currency: "EUR",
        year: number(item.year),
        mileage: number(item.mileage),
        rank: number(item.rank),
        markettotal: number(item.marketTotal),
        source: "mobile",
      };
    }).filter(Boolean);
  }

  function receive(message) {
    if (!message || message.source !== "autogood-mobile") return false;
    if (message.kind === "ad") {
      const ad = cleanAd(message.ad);
      if (ad) window.AUTOGOOD_APPLY_MOBILE_AD?.(ad);
      return Boolean(ad);
    }
    if (message.kind === "search") {
      const listings = cleanListings(message.listings);
      if (listings.length) {
        window.AUTOGOOD_ADD_MOBILE_LISTINGS?.(listings, {
          total: number(message.total) || listings.length,
          searchUrl: textValue(message.searchUrl, 2000),
        });
      }
      return listings.length > 0;
    }
    return false;
  }

  window.addEventListener("message", (event) => {
    if (!MOBILE_ORIGINS.test(event.origin)) return;
    receive(event.data);
  });

  function readFragment() {
    const match = location.hash.match(/^#autogood-import=(.+)$/);
    if (!match) return;
    // The data is read once and the address is cleaned right away.
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    try {
      receive(JSON.parse(decodeURIComponent(match[1])));
    } catch {
      // A damaged link is ignored.
    }
  }

  prepareBookmarklets();
  // mobile.js and the market analysis register their handlers in scripts
  // above this one; "load" is not waited for, a slow font would hold it up.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", readFragment);
  else readFragment();
})();
