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
  await page.goto("https://www.partslink24.com", { waitUntil: "domcontentloaded" });
  await setLanguage(page, credentials.language);

  await page.locator("#login-id").fill(credentials.companyId);
  await page.locator("#login-name").fill(credentials.username);
  await page.locator("#inputPassword").fill(credentials.password);

  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    page.locator("#hidden-login").click()
  ]);

  await confirmExistingSession(page);
  await waitForLogin(page);
}

async function confirmExistingSession(page) {
  const confirmButton = page.getByText(/подтвердить|confirm|potwierdź|potwierdz/i).first();
  if (!await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) return;

  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    confirmButton.click()
  ]);
}

async function waitForLogin(page) {
  const loginResult = await page.waitForFunction(() => {
    const error = document.querySelector("#loginErrorDiv")?.textContent?.trim();
    if (error) return { ok: false, error };
    const sessionText = document.body?.textContent || "";
    if (/завершить сеанс|session and log in|zakończyć sesję/i.test(sessionText)) return false;
    if (!document.querySelector("#login-id")) return { ok: true };
    return false;
  }, null, { timeout: 45000 });
  const result = await loginResult.jsonValue();
  if (!result.ok) fail(result.error || "PartsLink24 login failed.");

  await page.waitForLoadState("networkidle").catch(() => {});
}

async function setLanguage(page, language) {
  const codes = { RU: "ru", PL: "pl" };
  const code = codes[language];
  if (!code) return;

  await page.goto(`https://www.partslink24.com/partslink24/relaunch.do?changeLang=${code}`, {
    waitUntil: "domcontentloaded"
  });
  await page.locator("#login-id").waitFor({ timeout: 30000 });
}

async function openVehicle(page, brandConfig, vin) {
  if (brandConfig.route === "brand_first_search") {
    await page.getByRole("img", { name: new RegExp(brandConfig.brandTile || "", "i") }).click().catch(async () => {
      await page.getByText(new RegExp(brandConfig.brandTile || "", "i")).click();
    });
    await page.waitForLoadState("networkidle").catch(() => {});
  }

  const search = page.locator('input:visible:not([type="submit"]):not([type="password"])').first();
  await search.fill(vin);

  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    page.keyboard.press("Enter")
  ]);

  await page.getByText(vin).first().waitFor({ timeout: 45000 });
}

async function downloadPdf(page, options) {
  const pdfButton = page.locator('[title*="PDF" i], [aria-label*="PDF" i]')
    .or(page.getByText(/PDF/i))
    .first();
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
