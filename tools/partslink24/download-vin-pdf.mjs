#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

const vin = readOption(args, "--vin");
const brand = readOption(args, "--brand");
const language = readOption(args, "--language") || process.env.PARTSLINK24_DEFAULT_LANGUAGE || "RU";
const outDir = resolve(readOption(args, "--out-dir") || join(repoRoot, "output/partslink24"));
const headless = !args.includes("--headed");

if (!vin) fail("Missing --vin.");
if (!brand) fail("Missing --brand.");

const companyId = process.env.PARTSLINK24_COMPANY_ID;
const username = process.env.PARTSLINK24_USERNAME;
const password = process.env.PARTSLINK24_PASSWORD;

if (!companyId || !username || !password) {
  fail("Set PARTSLINK24_COMPANY_ID, PARTSLINK24_USERNAME and PARTSLINK24_PASSWORD in the shell environment first.");
}

const routes = await readJson(join(__dirname, "brand-routes.json"));
const brandConfig = routes.brands[brand];
if (!brandConfig) fail(`Unknown brand: ${brand}`);
if (!routes.languages.includes(language)) fail(`Unsupported language: ${language}`);

mkdirSync(outDir, { recursive: true });

const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless });
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();

try {
  await login(page, { companyId, username, password, language });
  await openVehicle(page, brandConfig, vin);
  const pdfPath = await downloadPdf(page, { brand, vin, language, outDir });
  process.stdout.write(`${JSON.stringify({ ok: true, brand, vin, language, pdfPath }, null, 2)}\n`);
} catch (error) {
  const screenshotPath = join(outDir, `${brand}_${vin}_${language}_error.png`.replace(/[^A-Za-z0-9_.-]/g, "_"));
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
  const message = error instanceof Error ? error.message : "Unknown error.";
  process.stderr.write(`${JSON.stringify({ ok: false, brand, vin, language, error: message, screenshotPath }, null, 2)}\n`);
  process.exitCode = 1;
} finally {
  await browser.close();
}

async function login(page, credentials) {
  await page.goto("https://www.partslink24.com/partslink24/user/login.do", { waitUntil: "domcontentloaded" });

  await page.locator('input[name*="company" i], input[name*="customer" i], input[name*="firm" i], input[type="text"]').first()
    .fill(credentials.companyId);
  await page.locator('input[name*="user" i], input[name*="login" i], input[type="text"]').nth(1)
    .fill(credentials.username);
  await page.locator('input[type="password"]').fill(credentials.password);

  await setLanguage(page, credentials.language);

  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    page.getByRole("button", { name: /log|login|zaloguj|вход/i }).click()
  ]);

  await page.waitForSelector('input:visible', { timeout: 30000 });
}

async function setLanguage(page, language) {
  const labels = {
    RU: [/рус/i, /russ/i],
    PL: [/polski/i, /polish/i],
    ENG: [/english/i, /engl/i]
  }[language];

  for (const label of labels) {
    const option = page.getByText(label).first();
    if (await option.count().catch(() => 0)) {
      await option.click().catch(() => {});
      return;
    }
  }
}

async function openVehicle(page, brandConfig, vin) {
  if (brandConfig.route === "brand_first_search") {
    await page.getByRole("img", { name: new RegExp(brandConfig.brandTile || "", "i") }).click().catch(async () => {
      await page.getByText(new RegExp(brandConfig.brandTile || "", "i")).click();
    });
    await page.waitForLoadState("networkidle").catch(() => {});
  }

  const search = page.locator('input:visible').first();
  await search.fill(vin);

  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    page.keyboard.press("Enter")
  ]);

  await page.getByText(vin).first().waitFor({ timeout: 45000 });
}

async function downloadPdf(page, options) {
  const pdfButton = page.locator('[title*="PDF" i], [aria-label*="PDF" i], text=/PDF/i').first();
  const pagePromise = page.context().waitForEvent("page").catch(() => null);
  const downloadPromise = page.waitForEvent("download").catch(() => null);

  await pdfButton.click();

  const download = await downloadPromise;
  if (download) {
    const target = join(options.outDir, makePdfName(options));
    await download.saveAs(target);
    return target;
  }

  const pdfPage = await pagePromise;
  if (!pdfPage) fail("PDF did not open as a download or new page.");

  await pdfPage.waitForLoadState("domcontentloaded").catch(() => {});
  const target = join(options.outDir, makePdfName(options));
  const response = await pdfPage.goto(pdfPage.url()).catch(() => null);
  if (response) {
    const body = await response.body();
    await import("node:fs").then((fs) => fs.writeFileSync(target, body));
    return target;
  }

  fail("PDF page opened, but the script could not save its body.");
}

function makePdfName({ brand, vin, language }) {
  return `${brand}_${vin}_${language}.pdf`.replace(/[^A-Za-z0-9_.-]/g, "_");
}

async function readJson(path) {
  return JSON.parse(await import("node:fs").then((fs) => fs.readFileSync(path, "utf8")));
}

function readOption(values, name) {
  const index = values.indexOf(name);
  return index >= 0 ? values[index + 1] : undefined;
}

function fail(message) {
  throw new Error(message);
}

function printHelp() {
  process.stdout.write(`Usage:
  node tools/partslink24/download-vin-pdf.mjs --brand BMW --vin WBA31AA0905V40977 --language RU

Required environment variables:
  PARTSLINK24_COMPANY_ID
  PARTSLINK24_USERNAME
  PARTSLINK24_PASSWORD
`);
}
