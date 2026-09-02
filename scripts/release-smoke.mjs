import { readFile } from "node:fs/promises";

const pagesUrl = process.env.PAGES_URL || "https://belovn1999-rgb.github.io/autogood-kalkulatory/";
const converterUrl =
  process.env.CONVERTER_URL || "https://autogood-pdf-converter.onrender.com/api/convert-docx-to-pdf";
const templatePath =
  process.env.SMOKE_TEMPLATE || "contract-pdf-work/templates/Umowa_Zamowienia_Pojazdu_AG_template_signed.docx";
// Leading slash: converterUrl already carries a path, and a relative segment
// would resolve under it.
const converterHealthUrl = process.env.CONVERTER_HEALTH_URL || new URL("/api/health", converterUrl).href;
// Set once the VIN service has a stable address; skipped until then.
const vinApiUrl = process.env.VIN_API_URL || "";
// Set to a git SHA to assert exactly which build answered.
const expectedRevision = process.env.EXPECTED_REVISION || "";
const origin = new URL(pagesUrl).origin;

async function expectOk(url, label) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(label + " returned HTTP " + response.status);
  console.log(label + ": HTTP " + response.status);
}

// A deploy that silently never happened looks exactly like a healthy service.
// The only thing that tells them apart is the build the service reports.
async function expectRevision(healthUrl, label) {
  const response = await fetch(healthUrl, { redirect: "follow" });
  if (!response.ok) throw new Error(label + " health returned HTTP " + response.status);

  const health = await response.json().catch(() => ({}));
  const revision = health.revision;

  if (!revision) {
    throw new Error(
      label + " health has no `revision` field. The running build predates the field itself, "
      + "which means it is older than the current main. Deploy the approved commit and re-run."
    );
  }
  if (revision === "local") {
    throw new Error(label + " reports revision `local` — it was not built from a tagged commit.");
  }
  if (expectedRevision && !expectedRevision.startsWith(revision) && !revision.startsWith(expectedRevision)) {
    throw new Error(
      label + " is running revision " + revision + ", expected " + expectedRevision + "."
    );
  }
  console.log(label + " revision: " + revision + (expectedRevision ? " (matches expected)" : ""));
}

await expectOk(pagesUrl, "GitHub Pages root");
await expectOk(new URL("pdf.html", pagesUrl), "Contract page");

const preflight = await fetch(converterUrl, {
  method: "OPTIONS",
  headers: {
    Origin: origin,
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type,x-filename",
  },
});
const allowedOrigin = preflight.headers.get("access-control-allow-origin");
if (!preflight.ok || (allowedOrigin !== origin && allowedOrigin !== "*")) {
  throw new Error("Converter CORS preflight failed.");
}
console.log("Converter CORS preflight: HTTP " + preflight.status);

const response = await fetch(converterUrl, {
  method: "POST",
  headers: {
    Origin: origin,
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "X-Filename": "release-smoke.docx",
  },
  body: await readFile(templatePath),
});
const pdf = Buffer.from(await response.arrayBuffer());
if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf") || !pdf.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
  throw new Error("Contract conversion smoke test failed with HTTP " + response.status);
}

console.log("Contract conversion: HTTP " + response.status + ", " + pdf.length + " bytes.");

await expectRevision(converterHealthUrl, "Converter");

if (!vinApiUrl) {
  console.log("VIN API: skipped (set VIN_API_URL once the service has a stable address).");
} else {
  const vinHealthUrl = new URL("/health", vinApiUrl).href;
  const vinResponse = await fetch(vinHealthUrl, { redirect: "follow" });
  if (!vinResponse.ok) throw new Error("VIN API health returned HTTP " + vinResponse.status);

  const vinHealth = await vinResponse.json().catch(() => ({}));
  // A VIN check needs both halves; reporting which one is missing saves a
  // round of guessing at 2am.
  if (!vinHealth.partslink24) {
    const detail = vinHealth.partslink24Detail || {};
    throw new Error(
      "VIN API cannot serve checks — credentials: " + Boolean(detail.credentials)
      + ", browser: " + Boolean(detail.browser) + "."
    );
  }
  console.log("VIN API health: HTTP " + vinResponse.status + ", partslink24 ready.");
  await expectRevision(vinHealthUrl, "VIN API");
}
