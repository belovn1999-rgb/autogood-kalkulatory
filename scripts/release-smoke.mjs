import { readFile } from "node:fs/promises";

const pagesUrl = process.env.PAGES_URL || "https://belovn1999-rgb.github.io/autogood-kalkulatory/";
const converterUrl =
  process.env.CONVERTER_URL || "https://autogood-pdf-converter.onrender.com/api/convert-docx-to-pdf";
const templatePath =
  process.env.SMOKE_TEMPLATE || "contract-pdf-work/templates/Umowa_Zamowienia_Pojazdu_AG_template_signed.docx";
const origin = new URL(pagesUrl).origin;

async function expectOk(url, label) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(label + " returned HTTP " + response.status);
  console.log(label + ": HTTP " + response.status);
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
