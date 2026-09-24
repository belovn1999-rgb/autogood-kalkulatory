/* AUTOGOOD bookmarklet for mobile.de.
 * mobile.de refuses servers and reader proxies, but not the user's own
 * browser, so this runs on the open mobile.de page and hands the data to
 * mobile.html:
 *   - on an ad page: the car's data (fills the form, like "Rozpoznaj");
 *   - on a result list: offers sampled across the whole price-sorted list,
 *     each with its real place in that list (the market-analysis chart).
 * mobile.html turns this file into the bookmark (javascript: URL) and puts
 * its own address in place of __AUTOGOOD_APP__.
 */
(() => {
  const APP = "__AUTOGOOD_APP__";
  const APP_ORIGIN = new URL(APP).origin;
  const PAGES = 8;
  const PARALLEL = 3;

  const badge = document.createElement("div");
  badge.style.cssText = "position:fixed;z-index:2147483647;right:16px;bottom:16px;max-width:320px;"
    + "padding:12px 16px;border-radius:10px;background:#15304a;color:#fff;font:600 14px/1.4 Arial,sans-serif;"
    + "box-shadow:0 8px 24px rgba(0,0,0,.25)";
  const say = (text) => {
    badge.textContent = `AUTOGOOD: ${text}`;
    if (!badge.isConnected) document.body.append(badge);
  };
  const digits = (value) => {
    const match = String(value ?? "").replace(/[.,\s\u00a0\u202f](?=\d{3}\b)/g, "").match(/\d+/);
    return match ? Number(match[0]) : null;
  };
  const yearOf = (value) => {
    const match = String(value || "").match(/(?:19|20)\d{2}/);
    return match ? Number(match[0]) : null;
  };

  function deliver(payload) {
    const message = { ...payload, source: "autogood-mobile", version: 1 };
    // Opened from AUTOGOOD: answer the tab that asked. Otherwise open it.
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(message, APP_ORIGIN);
        say("dane wysłane do AUTOGOOD ✓ — możesz zamknąć tę kartę.");
        return;
      } catch {
        // Fall through to a new AUTOGOOD tab.
      }
    }
    window.open(`${APP}#autogood-import=${encodeURIComponent(JSON.stringify(message))}`, "_blank");
    say("otwieram AUTOGOOD z danymi ✓");
  }

  // ---- Ad page -----------------------------------------------------------
  function readAd() {
    const car = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((node) => {
        try {
          return JSON.parse(node.textContent);
        } catch {
          return null;
        }
      })
      .find((item) => item && item["@type"] === "Car") || {};
    const feature = (key) => document
      .querySelector(`[data-testid="vip-key-features-list-item-${key}"] h4`)?.textContent.trim() || "";
    const technical = (key) => document
      .querySelector(`[data-testid="${key}-item"]`)?.nextElementSibling?.textContent.trim() || "";
    const priceBox = document.querySelector('[data-testid="main-price-area"]')?.textContent || "";
    const offer = car.offers || {};
    const address = offer.offeredBy?.address || {};
    const power = technical("power") || feature("power");
    const powerHp = digits((power.match(/(\d+)\s*(?:hp|PS|KM|CV)/i) || [])[1]);
    const title = String(car.name || document.querySelector('[data-testid="vip-ad-title"]')?.textContent || document.title)
      .replace(/\s+/g, " ").trim();
    const url = new URL(location.href);
    const id = url.searchParams.get("id") || (url.pathname.match(/(\d{6,})/) || [])[1] || "";
    return {
      kind: "ad",
      ad: {
        sourceUrl: id ? `https://suchen.mobile.de/fahrzeuge/details.html?id=${id}` : location.href,
        adId: id,
        title,
        brand: car.brand?.name || "",
        model: car.model || "",
        carBruttoEur: Number(offer.price) || digits(priceBox),
        currency: offer.priceCurrency || "EUR",
        // "Net, 19% VAT" / "Netto, 19% MwSt." means VAT can be reclaimed.
        vatReclaimable: /net|netto/i.test(priceBox) && /vat|mwst|ust/i.test(priceBox),
        priceText: priceBox.replace(/\s+/g, " ").trim().slice(0, 160),
        mileageKm: Number(car.mileageFromOdometer?.value) || digits(feature("mileage")),
        firstRegistration: feature("firstRegistration") || technical("firstRegistration"),
        fuel: feature("fuel") || technical("fuel"),
        gearbox: feature("transmission") || technical("transmission"),
        powerHp,
        displacementCcm: digits(technical("cubicCapacity")),
        bodyType: car.bodyType || technical("category"),
        category: technical("category"),
        color: car.color || technical("color"),
        location: {
          address: [address.streetAddress, [address.postalCode, address.addressLocality].filter(Boolean).join(" ")]
            .filter(Boolean).join(", "),
          city: address.addressLocality || "",
          postalCode: address.postalCode || "",
          country: address.addressCountry || "",
          sellerName: offer.offeredBy?.name || "",
        },
      },
    };
  }

  // ---- Result list -------------------------------------------------------
  // The list arrives in Next.js' flight data, encoded twice.
  function searchResults(html) {
    let payload = "";
    for (const match of html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) {
      try {
        payload += JSON.parse(match[1]);
      } catch {
        // Not a text chunk.
      }
    }
    if (payload.includes('\\"numResultsTotal\\"')) {
      try {
        payload = JSON.parse(`"${payload.replace(/\n/g, "\\n")}"`);
      } catch {
        return null;
      }
    }
    const at = payload.indexOf('"searchResults":{"numResultsTotal"');
    if (at < 0) return null;
    const start = payload.indexOf("{", at);
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = start; index < payload.length; index += 1) {
      const character = payload[index];
      if (quoted) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') quoted = false;
        continue;
      }
      if (character === '"') quoted = true;
      else if (character === "{") depth += 1;
      else if (character === "}" && --depth === 0) return JSON.parse(payload.slice(start, index + 1));
    }
    return null;
  }

  async function readSearch() {
    const base = new URL(location.href);
    // Places in the list only mean something when it is sorted by price.
    base.searchParams.set("sb", "p");
    base.searchParams.delete("pageNumber");
    // mobile.de serves at most 100 pages of one sort order, so the expensive
    // end of a long list is read from the same list sorted the other way.
    const MAX_PAGE = 100;
    const pageUrl = (page, order) => {
      const url = new URL(base);
      url.searchParams.set("od", order);
      if (page > 1) url.searchParams.set("pageNumber", String(page));
      return url.toString();
    };
    // Ads (top of page, top in category) sit outside the price order.
    const ordered = (results) => (results?.listings || []).filter((item) => item.type === "regular" || item.type === "eyecatcher");
    const load = async (page, order) => searchResults(await (await fetch(pageUrl(page, order), { credentials: "include" })).text());

    say("pobieram 1. stronę listy…");
    const first = await load(1, "up");
    if (!first) throw new Error("nie znaleziono listy ofert na tej stronie");
    const total = Number(first.numResultsTotal) || 0;
    const pageSize = ordered(first).length || 20;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const wanted = pageCount <= PAGES
      ? Array.from({ length: pageCount - 1 }, (_, index) => index + 2)
      : [...new Set(Array.from({ length: PAGES }, (_, index) => Math.round(1 + (index * (pageCount - 1)) / (PAGES - 1))))]
        .filter((page) => page > 1);
    // Each wanted page of the cheapest-first list, as a request we can make.
    const requests = wanted.map((page) => {
      if (page <= MAX_PAGE) return { page, order: "up" };
      const fromTop = pageCount - page + 1;
      return fromTop <= MAX_PAGE ? { page: fromTop, order: "down" } : null;
    }).filter(Boolean);

    const offers = [];
    const seen = new Set();
    const collect = (results, request) => ordered(results).forEach((item, index) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      const price = Number(item.price?.grs?.amount);
      if (!price) return;
      const position = (request.page - 1) * pageSize + index;
      offers.push({
        id: String(item.id),
        url: `https://suchen.mobile.de/fahrzeuge/details.html?id=${item.id}`,
        title: [item.make?.localized, item.model?.localized].filter(Boolean).join(" "),
        price,
        currency: "EUR",
        year: yearOf(item.attr?.fr),
        mileage: digits(item.attr?.ml),
        // Real place in the cheapest-first list, whichever way it was read.
        rank: request.order === "up" ? position + 1 : total - position,
        marketTotal: total,
        source: "mobile",
      });
    });
    collect(first, { page: 1, order: "up" });
    for (let start = 0; start < requests.length; start += PARALLEL) {
      const batch = requests.slice(start, start + PARALLEL);
      say(`pobieram strony ${start + 2}–${start + 1 + batch.length} z ${requests.length + 1}…`);
      const results = await Promise.allSettled(batch.map((request) => load(request.page, request.order)));
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) collect(result.value, batch[index]);
      });
    }
    base.searchParams.set("od", "up");
    return { kind: "search", total, searchUrl: base.toString(), listings: offers };
  }

  (async () => {
    try {
      if (!/(^|\.)mobile\.de$/.test(location.hostname)) {
        say("otwórz stronę ogłoszenia albo listę wyników na mobile.de i kliknij ponownie.");
        return;
      }
      const isAd = /details\.html|\/fahrzeuge\/details|\/auto-inserat\//.test(location.pathname)
        || document.querySelector('[data-testid="vip-ad-title"]');
      if (isAd) {
        say("odczytuję ogłoszenie…");
        deliver(readAd());
      } else {
        const search = await readSearch();
        if (!search.listings.length) throw new Error("lista ofert jest pusta");
        deliver(search);
      }
    } catch (error) {
      say(`błąd — ${error.message || error}`);
    }
  })();
})();
