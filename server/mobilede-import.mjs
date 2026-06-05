import http from "node:http";

const PORT = Number(process.env.PORT || 8788);

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function firstFinite(...values) {
  for (const value of values) {
    const number = Number(String(value ?? "").replace(",", "."));
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
}

function walk(value, visitor) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, visitor));
    return;
  }
  Object.entries(value).forEach(([key, child]) => {
    visitor(key, child, value);
    walk(child, visitor);
  });
}

function readJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return blocks
    .map((match) => {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function extractPrice(html, jsonLd) {
  const candidates = [];

  jsonLd.forEach((item) => {
    walk(item, (key, value, parent) => {
      const lower = key.toLowerCase();
      if (["price", "grossprice", "consumerpricegross"].includes(lower)) candidates.push(value);
      if (lower === "amount" && /eur/i.test(String(parent?.currency || parent?.priceCurrency || ""))) candidates.push(value);
    });
  });

  [
    /"grossPrice"\s*:\s*"?(\d+(?:[.,]\d+)?)"?/i,
    /"consumerPriceGross"\s*:\s*"?(\d+(?:[.,]\d+)?)"?/i,
    /"price"\s*:\s*"?(\d+(?:[.,]\d+)?)"?/i,
    /€\s*([\d. ]+)/i,
    /([\d. ]+)\s*€/i,
  ].forEach((pattern) => {
    const match = html.match(pattern);
    if (match?.[1]) candidates.push(match[1].replace(/[ .]/g, ""));
  });

  return firstFinite(...candidates);
}

function extractDisplacement(html, jsonLd, text) {
  const candidates = [];

  jsonLd.forEach((item) => {
    walk(item, (key, value) => {
      if (/displacement|hubraum|ccm|enginecapacity/i.test(key)) candidates.push(value);
    });
  });

  [
    /"displacementCcm"\s*:\s*(\d+)/i,
    /"cubicCapacity"\s*:\s*(\d+)/i,
    /Hubraum[^0-9]{0,80}([\d. ]+)\s*cm/i,
    /([\d. ]+)\s*cm³/i,
    /([\d. ]+)\s*ccm/i,
  ].forEach((pattern) => {
    const match = (html.match(pattern) || text.match(pattern));
    if (match?.[1]) candidates.push(String(match[1]).replace(/[ .]/g, ""));
  });

  return Math.round(firstFinite(...candidates));
}

function extractFuel(html, jsonLd, text) {
  const candidates = [];

  jsonLd.forEach((item) => {
    walk(item, (key, value) => {
      if (/fuel|kraftstoff|engine/i.test(key) && typeof value !== "object") candidates.push(value);
    });
  });

  [
    /"fuel"\s*:\s*"([^"]+)"/i,
    /"fuelType"\s*:\s*"([^"]+)"/i,
    /Kraftstoff(?:art)?[^A-Za-zА-Яа-я0-9]{0,80}([A-Za-zÄÖÜäöüß -]+)/i,
  ].forEach((pattern) => {
    const match = (html.match(pattern) || text.match(pattern));
    if (match?.[1]) candidates.push(match[1]);
  });

  const joined = candidates.map(String).join(" ").trim();
  if (joined) return joined;

  const lowerText = text.toLowerCase();
  if (lowerText.includes("plug-in")) return "Plug-in-Hybrid";
  if (lowerText.includes("elektro")) return "Elektro";
  if (lowerText.includes("hybrid")) return "Hybrid";
  if (lowerText.includes("diesel")) return "Diesel";
  if (lowerText.includes("benzin")) return "Benzin";
  return "";
}

function classifyEngine(fuel, displacementCcm) {
  const normalized = String(fuel || "").toLowerCase();
  const ccm = Number(displacementCcm) || 0;
  const isOver2000 = ccm > 2000;
  const isPlugIn = /plug|phev/.test(normalized);
  const isElectric = /elect|elektro|bev/.test(normalized);
  const isHybrid = /hybrid|hev/.test(normalized);

  if (isElectric && !isHybrid) return 0;
  if (isPlugIn) return isOver2000 ? 1 : 0;
  if (isHybrid) return isOver2000 ? 1 : 2;
  return isOver2000 ? 4 : 3;
}

async function fetchListing(url) {
  const response = await fetch(url, {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "de-DE,de;q=0.9,en;q=0.7",
      "user-agent": "Mozilla/5.0 AUTOGOOD-Calculator/1.0",
    },
    redirect: "follow",
  });

  if (!response.ok) throw new Error(`Mobile.de returned ${response.status}`);
  return response.text();
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") return sendJson(response, 204, {});

  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  if (requestUrl.pathname !== "/mobilede/import") {
    return sendJson(response, 404, { error: "Not found" });
  }

  const sourceUrl = requestUrl.searchParams.get("url") || "";
  if (!/^https?:\/\/([^/]+\.)?mobile\.de\//i.test(sourceUrl)) {
    return sendJson(response, 400, { error: "Expected a mobile.de listing URL" });
  }

  try {
    const html = await fetchListing(sourceUrl);
    const text = stripTags(html);
    const jsonLd = readJsonLd(html);
    const carBruttoEur = extractPrice(html, jsonLd);
    const displacementCcm = extractDisplacement(html, jsonLd, text);
    const fuel = extractFuel(html, jsonLd, text);
    const engineTypeIndex = classifyEngine(fuel, displacementCcm);

    if (!carBruttoEur) throw new Error("Price not found");

    sendJson(response, 200, {
      sourceUrl,
      carBruttoEur,
      fuel,
      displacementCcm,
      engineTypeIndex,
      engineTypeLabel: [
        "EL / PHEV <=2000cm³",
        "PHEV / HEV >2000cm³",
        "HEV <=2000cm³",
        "Spalinowy <=2000cm³",
        "Spalinowy >2000cm³",
      ][engineTypeIndex],
    });
  } catch (error) {
    sendJson(response, 502, {
      error: "Could not import Mobile.de listing",
      detail: error.message,
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mobile.de import backend: http://127.0.0.1:${PORT}/mobilede/import?url=...`);
});
