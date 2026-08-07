import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = (process.env.BASE_URL || "https://belovn1999-rgb.github.io/autogood-kalkulatory").replace(/\/$/, "");
const outputPath = path.resolve(process.env.OUTPUT_PATH || "outputs/contract-layout-reproducer-results.json");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sample = [
  "Zleceniodawca: Jolanta Piasek",
  "Adres: ul. Sloneczna 21A/65, 85-862 Bydgoszcz",
  "PESEL: 72042815966",
  "Telefon: +48 669 050 903",
  "E-mail: jolanta@example.com",
  "Auto: Mercedes-Benz Klasa E 220d Avantgarde Kombi Bardzo Dlugi Opis Testowy",
  "VIN: WDD2132041A123456",
  "Cena: 124 700 PLN",
].join("\n");

const routes = [
  {
    id: "01-poland",
    url: "/pdf.html?reproducer=contract-layout",
    raw: "#rawClient",
    parse: "#parseBtn",
    docx: "#generateBtn",
    pdf: "#printBtn",
    panel: ".paste-panel",
    status: "#status",
    expectedNameSelector: "#clientName",
    expectedName: "Jolanta Piasek",
  },
  {
    id: "02-sale",
    url: "/umowa-sprzedazy.html?reproducer=contract-layout",
    raw: "#rawSaleData",
    parse: "#parseSaleData",
    docx: "#generateSaleDocx",
    pdf: "#generateSalePdf",
    panel: ".paste-panel",
    status: "#saleStatus",
    expectedNameSelector: '[name="buyerName"]',
    expectedName: "Jolanta Piasek",
  },
  {
    id: "03-export",
    url: "/pdf.html?variant=export&reproducer=contract-layout",
    raw: "#rawClient",
    parse: "#parseBtn",
    docx: "#generateBtn",
    pdf: "#printBtn",
    panel: ".paste-panel",
    status: "#status",
    expectedNameSelector: "#clientName",
    expectedName: "Jolanta Piasek",
  },
];

const tinyPdf = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Root 1 0 R /Size 4 >>\nstartxref\n190\n%%EOF\n",
  "utf8",
);

function rectFailure(before, after, viewportWidth) {
  const tolerance = 1;
  const failures = [];
  if (Math.abs(after.x - before.x) > tolerance) failures.push(`panel x changed ${before.x} -> ${after.x}`);
  if (Math.abs(after.width - before.width) > tolerance) failures.push(`panel width changed ${before.width} -> ${after.width}`);
  if (after.right > viewportWidth + tolerance) failures.push(`panel right ${after.right} exceeds viewport ${viewportWidth}`);
  if (after.documentScrollWidth > after.documentClientWidth + tolerance) {
    failures.push(`document horizontal overflow ${after.documentScrollWidth} > ${after.documentClientWidth}`);
  }
  if (after.panelScrollWidth > after.panelClientWidth + tolerance) {
    failures.push(`panel horizontal overflow ${after.panelScrollWidth} > ${after.panelClientWidth}`);
  }
  if (after.statusScrollWidth > after.statusClientWidth + tolerance) {
    failures.push(`status horizontal overflow ${after.statusScrollWidth} > ${after.statusClientWidth}`);
  }
  return failures;
}

async function metrics(page, route) {
  return page.evaluate(({ panelSelector, statusSelector }) => {
    const panel = document.querySelector(panelSelector);
    const status = document.querySelector(statusSelector);
    const rect = panel?.getBoundingClientRect();
    return {
      x: Math.round((rect?.x || 0) * 100) / 100,
      width: Math.round((rect?.width || 0) * 100) / 100,
      right: Math.round((rect?.right || 0) * 100) / 100,
      panelClientWidth: panel?.clientWidth || 0,
      panelScrollWidth: panel?.scrollWidth || 0,
      statusClientWidth: status?.clientWidth || 0,
      statusScrollWidth: status?.scrollWidth || 0,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      downloadRows: [...document.querySelectorAll(".download-row")].map((row) => row.textContent.trim()),
    };
  }, { panelSelector: route.panel, statusSelector: route.status });
}

async function runRoute(page, route) {
  await page.goto(`${baseUrl}${route.url}`, { waitUntil: "networkidle" });
  await page.fill(route.raw, sample);
  const before = await metrics(page, route);

  await page.click(route.parse);
  await page.waitForTimeout(250);
  const parsedName = await page.locator(route.expectedNameSelector).inputValue();
  const parseFailures = parsedName === route.expectedName ? [] : [
    `parsed name "${parsedName}" did not equal "${route.expectedName}"`,
  ];

  await page.click(route.docx);
  await page.waitForFunction(() => document.querySelectorAll(".download-row").length >= 1, null, { timeout: 30000 });
  const afterDocx = await metrics(page, route);

  await page.click(route.pdf);
  await page.waitForFunction(() => document.querySelectorAll(".download-row").length >= 2, null, { timeout: 30000 });
  const afterPdf = await metrics(page, route);

  const docxFailures = rectFailure(before, afterDocx, page.viewportSize().width);
  const pdfFailures = rectFailure(before, afterPdf, page.viewportSize().width);
  const failures = [
    ...parseFailures.map((failure) => `parse: ${failure}`),
    ...docxFailures.map((failure) => `after DOCX: ${failure}`),
    ...pdfFailures.map((failure) => `after PDF: ${failure}`),
  ];

  return {
    id: route.id,
    url: `${baseUrl}${route.url}`,
    parsedName,
    before,
    afterDocx,
    afterPdf,
    failures,
    status: failures.length ? "REPRODUCED" : "NOT_REPRODUCED",
  };
}

const browser = await chromium.launch({
  headless: true,
  executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
});

const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 375, height: 667 },
});

await context.route(/\/api\/convert-docx-to-pdf$/, async (route) => {
  await route.fulfill({
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'inline; filename="contract.pdf"',
    },
    body: tinyPdf,
  });
});

const page = await context.newPage();
const results = [];
for (const route of routes) {
  results.push(await runRoute(page, route));
}

await browser.close();

const summary = {
  baseUrl,
  viewport: { width: 375, height: 667 },
  sample,
  routes: results,
  reproduced: results.some((result) => result.failures.length),
};

fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));

if (summary.reproduced) process.exitCode = 1;
