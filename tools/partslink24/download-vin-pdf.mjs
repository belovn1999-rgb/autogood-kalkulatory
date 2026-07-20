#!/usr/bin/env node
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
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
const userDataDir = resolve(process.env.PARTSLINK24_PROFILE_DIR || join(homedir(), "Library/Application Support/AUTOGOOD/partslink24-profile"));
const slowMo = Number(process.env.PARTSLINK24_SLOW_MO_MS || 350);
const systemChromePaths = [
  process.env.PARTSLINK24_CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
].filter(Boolean);

if (!vin) fail("Missing --vin.");
if (!brand) fail("Missing --brand.");

const companyId = process.env.PARTSLINK24_COMPANY_ID;
const username = process.env.PARTSLINK24_USERNAME;
const password = process.env.PARTSLINK24_PASSWORD;
const loginSelectors = {
  companyId: '[data-test-id="pl24-login-ui-loginForm-input-companyId"], #login-id',
  username: '[data-test-id="pl24-login-ui-loginForm-input-username"], #login-name',
  password: '[data-test-id="pl24-login-ui-loginForm-input-password"], #inputPassword',
  submit: '[data-test-id="pl24-login-ui-loginForm-button-submitForm"], #hidden-login',
  error: '[data-test-id="pl24-login-ui-login-errorMessage"], #loginErrorDiv',
  twoFa: '[data-test-id="pl24-login-ui-loginForm-input-twoFA"]',
  form: '[data-test-id="pl24-login-ui-loginForm-form"], #login-id, #login-name, #inputPassword, #hidden-login',
  squeezeOutConfirm: '[data-test-id="pl24-login-ui-sessionSqueezeOut-button-confirm"]'
};

if (!companyId || !username || !password) {
  fail("Set PARTSLINK24_COMPANY_ID, PARTSLINK24_USERNAME and PARTSLINK24_PASSWORD in the shell environment first.");
}

const routes = await readJson(join(__dirname, "brand-routes.json"));
const brandConfig = routes.brands[brand];
if (!brandConfig) fail(`Unknown brand: ${brand}`);
if (!routes.languages.includes(language)) fail(`Unsupported language: ${language}`);

mkdirSync(outDir, { recursive: true });
mkdirSync(userDataDir, { recursive: true });

let context;
let page;
try {
  const { chromium } = await import("playwright");
  const executablePath = systemChromePaths.find((path) => existsSync(path));
  context = await chromium.launchPersistentContext(userDataDir, {
    acceptDownloads: true,
    headless,
    slowMo,
    viewport: { width: 1280, height: 720 },
    ...(executablePath ? { executablePath } : {})
  });
  page = context.pages()[0] || await context.newPage();
  await login(page, { companyId, username, password, language });
  await openVehicle(page, brandConfig, vin);
  const pdfPaths = await downloadVehiclePdfs(page, brandConfig, { brand, vin, language, outDir });
  process.stdout.write(`${JSON.stringify({ ok: true, brand, vin, language, pdfPath: pdfPaths[0], pdfPaths }, null, 2)}\n`);
} catch (error) {
  const screenshotPath = join(outDir, `${brand}_${vin}_${language}_error.png`.replace(/[^A-Za-z0-9_.-]/g, "_"));
  await page?.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
  const message = error instanceof Error ? error.message : "Unknown error.";
  process.stderr.write(`${JSON.stringify({ ok: false, brand, vin, language, error: message, screenshotPath }, null, 2)}\n`);
  process.exitCode = 1;
} finally {
  await closeContext(context);
}

async function login(page, credentials) {
  await page.goto("https://www.partslink24.com", { waitUntil: "domcontentloaded" });
  await humanDelay();
  await setLanguage(page, credentials.language);

  const loginId = page.locator(loginSelectors.companyId).last();
  if (!await loginId.isVisible({ timeout: 10000 }).catch(() => false)) {
    await page.waitForLoadState("networkidle").catch(() => {});
    return;
  }

  await fillHuman(loginId, credentials.companyId);
  await fillHuman(page.locator(loginSelectors.username).last(), credentials.username);
  await fillHuman(page.locator(loginSelectors.password).last(), credentials.password);
  await humanDelay();

  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    page.locator(loginSelectors.submit).last().click()
  ]);

  await confirmExistingSession(page);
  await waitForLogin(page);
  await setLanguage(page, credentials.language);
}

async function confirmExistingSession(page) {
  const confirmButton = page.locator(loginSelectors.squeezeOutConfirm)
    .or(page.getByText(/подтвердить|confirm|potwierdź|potwierdz/i))
    .first();
  if (!await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) return;

  await humanDelay();
  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    confirmButton.click()
  ]);
}

async function waitForLogin(page) {
  const loginResult = await page.waitForFunction((selectors) => {
      const isVisible = (element) => Boolean(element?.offsetWidth || element?.offsetHeight || element?.getClientRects().length);
      const visibleElements = (selector) => [...document.querySelectorAll(selector)].filter(isVisible);
      const error = visibleElements(selectors.error).map((element) => element.textContent?.trim()).find(Boolean);
      if (error) return { ok: false, error };
      if (visibleElements(selectors.twoFa).length) {
        return { ok: false, error: "PartsLink24 requires a two-factor authentication code." };
      }
      const sessionText = document.body?.textContent || "";
      if (/завершить сеанс|session and log in|zakończyć sesję/i.test(sessionText)) return false;
      if (!/у вас еще нет учетной записи partslink24|имя пользователя|пароль|войти|nie masz jeszcze konta|nazwa użytkownika|hasło|zaloguj|login|password|username/i.test(sessionText)
        && !visibleElements(selectors.form).length) {
        return { ok: true };
      }
      return false;
    }, loginSelectors, { timeout: 45000 })
    .catch(() => fail("PartsLink24 login did not complete. Check local credentials or active session before VIN search."));
  const result = await loginResult.jsonValue();
  if (!result.ok) fail(result.error || "PartsLink24 login failed.");

  await page.waitForLoadState("networkidle").catch(() => {});
}

async function setLanguage(page, language) {
  const codes = { RU: "ru", PL: "pl", ENG: "en" };
  const labels = { RU: "Русский", PL: "Polski", ENG: "English" };
  const code = codes[language];
  if (!code) return;

  await page.goto(`https://www.partslink24.com/${code}/index.html`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await humanDelay();

  const portalToggle = page.locator('[data-test-id="pl24-portal-ui-desktopLanguageSwitcher-button-toggleMenu"]').first();
  if (!await portalToggle.isVisible({ timeout: 5000 }).catch(() => false)) return;

  const targetLabel = labels[language];
  const currentLabel = (await portalToggle.textContent().catch(() => "") || "").trim();
  if (targetLabel && currentLabel.includes(targetLabel)) return;

  await clickHuman(portalToggle);
  const targetLanguage = page.locator(`[data-test-id="pl24-portal-ui-desktopLanguageSwitcher-link-language-${code}"]`).first();
  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    clickHuman(targetLanguage)
  ]);
  await page.waitForFunction((label) => {
    const text = document.querySelector('[data-test-id="pl24-portal-ui-desktopLanguageSwitcher-button-toggleMenu"]')?.textContent || "";
    return text.includes(label);
  }, targetLabel, { timeout: 20000 }).catch(() => {});
  await humanDelay();
}

async function openVehicle(page, brandConfig, vin) {
  await assertLoggedIn(page);

  if (brandConfig.route === "pending_demo") {
    fail(`Для марки ${brand} нужен отдельный сценарий PartsLink. Запишите демонстрацию экрана перед включением загрузки.`);
  }

  if (["brand_first_search", "hyundai_two_file_print", "two_file_print"].includes(brandConfig.route)) {
    await clickBrandTile(page, brandConfig);
    await page.waitForLoadState("networkidle").catch(() => {});
    await humanDelay();
  }

  const search = page.locator('input:visible:not([type="submit"]):not([type="password"])').first();
  await fillHuman(search, vin);
  await humanDelay();

  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    page.keyboard.press("Enter")
  ]);

  await waitForVehicleLoaded(page, vin);
}

async function waitForVehicleLoaded(page, vin) {
  const result = await page.waitForFunction((expectedVin) => {
    const bodyText = document.body?.innerText || "";
    const url = window.location.href || "";
    const hasVin = bodyText.includes(expectedVin) || url.includes(expectedVin);
    const hasVehicleContext = /Идентификация автомобиля|identyfikacja pojazdu|vehicle identification|Данные автомобиля|parametry pojazdu/i.test(bodyText);

    return hasVin && hasVehicleContext;
  }, vin, { timeout: 45000 }).catch(() => null);

  if (result) return;

  await page.getByText(vin).first().waitFor({ timeout: 5000 });
}

async function downloadVehiclePdfs(page, brandConfig, options) {
  if (["hyundai_two_file_print", "two_file_print"].includes(brandConfig.route)) {
    return downloadTwoFilePrintPdfs(page, options);
  }

  return [await downloadPdf(page, options)];
}

async function clickBrandTile(page, brandConfig) {
  const names = [brandConfig.brandTile, ...(brandConfig.brandTileAliases || [])].filter(Boolean);

  for (const name of names) {
    const escapedName = escapeRegExp(name);
    const candidates = [
      page.getByRole("button", { name: new RegExp(escapedName, "i") }).first(),
      page.getByRole("img", { name: new RegExp(escapedName, "i") }).first(),
      page.locator(`[title="${cssString(name)}"]`).first(),
      page.getByText(new RegExp(escapedName, "i")).first()
    ];

    for (const candidate of candidates) {
      if (!await candidate.isVisible({ timeout: 1200 }).catch(() => false)) continue;
      await clickHuman(candidate);
      return;
    }
  }

  fail(`Не удалось найти логотип марки ${brandConfig.brandTile || brand}. Нужна демонстрация экрана для этой марки.`);
}

async function assertLoggedIn(page) {
  const onLoginPage = await page.evaluate((selectors) => {
    const isVisible = (element) => Boolean(element?.offsetWidth || element?.offsetHeight || element?.getClientRects().length);
    const text = document.body?.textContent || "";
    return /у вас еще нет учетной записи partslink24|имя пользователя|пароль|войти|nie masz jeszcze konta|nazwa użytkownika|hasło|zaloguj|login|password|username/i.test(text)
      || [...document.querySelectorAll(selectors.form)].some(isVisible);
  }, loginSelectors).catch(() => false);

  if (!onLoginPage) return;

  fail("PartsLink24 login did not complete. Check local credentials or active session before VIN search.");
}

async function downloadPdf(page, options) {
  const target = join(options.outDir, makePdfName(options));
  const pdfButton = page.locator('[title*="PDF" i], [aria-label*="PDF" i]')
    .or(page.getByText(/PDF/i))
    .first();
  const context = page.context();
  const pdfResponsePromise = waitForPdfResponse(context);
  const pagePromise = context.waitForEvent("page", { timeout: 45000 }).catch(() => null);
  const downloadPromise = page.waitForEvent("download", { timeout: 45000 }).catch(() => null);

  await clickHuman(pdfButton);

  const firstResult = await Promise.race([
    downloadPromise.then((download) => download ? { type: "download", download } : null),
    pdfResponsePromise.then((pdfResponse) => pdfResponse ? { type: "pdfResponse", pdfResponse } : null),
    pagePromise.then((pdfPage) => pdfPage ? { type: "pdfPage", pdfPage } : null),
    delay(45000).then(() => null)
  ]);

  const download = firstResult?.type === "download" ? firstResult.download : await settleWithin(downloadPromise, 1500);
  if (download) {
    await saveDownload(download, target);
    await assertPdfFile(target);
    return target;
  }

  const pdfResponse = firstResult?.type === "pdfResponse" ? firstResult.pdfResponse : await settleWithin(pdfResponsePromise, 5000);
  if (pdfResponse?.body) {
    await writePdfBuffer(target, pdfResponse.body);
    return target;
  }

  const pdfPage = firstResult?.type === "pdfPage" ? firstResult.pdfPage : await settleWithin(pagePromise, 1500);
  if (!pdfPage) fail("PDF did not open as a download or new page.");

  await pdfPage.waitForLoadState("domcontentloaded").catch(() => {});
  const latePdfResponse = await settleWithin(pdfResponsePromise, 8000);
  if (latePdfResponse?.body) {
    await writePdfBuffer(target, latePdfResponse.body);
    return target;
  }

  const pdfSourceUrl = extractChromePdfSource(pdfPage.url());
  if (pdfSourceUrl) {
    const response = await context.request.get(pdfSourceUrl).catch(() => null);
    const body = await response?.body().catch(() => null);
    if (body) {
      await writePdfBuffer(target, body);
      return target;
    }
  }

  fail("PDF page opened, but the script could not save a valid PDF body.");
}

async function downloadTwoFilePrintPdfs(page, options) {
  await waitForVehicleLoaded(page, options.vin);
  await humanDelay();

  const vehiclePath = join(options.outDir, makePdfName({ ...options, suffix: "vehicle" }));
  await saveTwoFilePanelPdf(page, vehiclePath, "vehicle");

  await openTwoFileEquipmentTab(page);
  const equipmentPath = join(options.outDir, makePdfName({ ...options, suffix: "equipment" }));
  await saveTwoFilePanelPdf(page, equipmentPath, "equipment");

  return [vehiclePath, equipmentPath];
}

async function openTwoFileEquipmentTab(page) {
  const candidates = [
    page.getByText(/Wyposażenie|Wyposazenie|Оснащение|Equipment/i).first(),
    page.locator('a, button, [role="tab"]').filter({ hasText: /Wyposażenie|Wyposazenie|Оснащение|Equipment/i }).first()
  ];

  for (const candidate of candidates) {
    if (!await candidate.isVisible({ timeout: 2000 }).catch(() => false)) continue;
    await clickHuman(candidate);
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return /Cecha\s+Nazwa|Cechy\s+Nazwa|Wyposażenie|Wyposazenie|Equipment/i.test(text);
    }, undefined, { timeout: 20000 }).catch(() => {});
    await humanDelay();
    return;
  }

  fail("Не удалось открыть вкладку оснащения для второго PDF.");
}

async function saveTwoFilePanelPdf(page, target, mode) {
  const marked = await markTwoFilePrintRoot(page, mode, vin);
  if (!marked) fail(`Не удалось подготовить ${mode} к печати.`);

  await savePagePdf(page, target);
  await page.evaluate(() => {
    document.querySelector("[data-autogood-print-root]")?.removeAttribute("data-autogood-print-root");
  }).catch(() => {});
}

async function markTwoFilePrintRoot(page, mode, expectedVin) {
  return page.evaluate(({ printMode, expectedVinValue }) => {
    document.querySelector("[data-autogood-print-style]")?.remove();
    document.querySelector("[data-autogood-print-root]")?.removeAttribute("data-autogood-print-root");

    const style = document.createElement("style");
    style.dataset.autogoodPrintStyle = "true";
    style.textContent = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        [data-autogood-print-root],
        [data-autogood-print-root] * {
          visibility: visible !important;
        }
        [data-autogood-print-root] {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          max-width: none !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          background: #fff !important;
        }
      }
    `;
    document.head.append(style);

    const needsEquipment = printMode === "equipment";
    const candidates = [...document.querySelectorAll("div, section, article, table, form")]
      .map((element) => {
        const text = element.innerText || "";
        const rect = element.getBoundingClientRect();
        return { element, text, area: rect.width * rect.height };
      })
      .filter(({ text, area }) => {
        if (area < 50000) return false;
        const hasIdentification = /identyfikacja pojazdu|Идентификация автомобиля|vehicle identification/i.test(text);
        const hasVehicle = /parametry pojazdu|Nr nadwozia|Данные автомобиля/i.test(text) || text.includes(expectedVinValue);
        const hasEquipment = /Wyposażenie|Wyposazenie|Cecha\s+Nazwa|Оснащение|Equipment/i.test(text);
        return hasIdentification && (needsEquipment ? hasEquipment : hasVehicle);
      })
      .map((candidate) => ({
        ...candidate,
        score: /The FI results|Wyniki FI|Результаты/i.test(candidate.text) ? 0 : 1
      }))
      .sort((a, b) => a.score - b.score || a.area - b.area);

    const chosen = candidates[0]?.element;
    if (!chosen) return false;
    chosen.setAttribute("data-autogood-print-root", "true");
    return true;
  }, { printMode: mode, expectedVinValue: expectedVin }).catch(() => false);
}

async function savePagePdf(page, target) {
  await page.emulateMedia({ media: "print" }).catch(() => {});
  await page.pdf({
    path: target,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: "8mm",
      right: "8mm",
      bottom: "8mm",
      left: "8mm"
    }
  });
  await assertPdfFile(target);
  await page.emulateMedia({ media: "screen" }).catch(() => {});
}

async function saveDownload(download, target) {
  const fs = await import("node:fs/promises");
  await fs.rm(target, { force: true }).catch(() => {});

  try {
    await download.saveAs(target);
    return;
  } catch (error) {
    const tempPath = await download.path().catch(() => null);
    if (!tempPath) throw error;
    const body = await fs.readFile(tempPath);
    await fs.writeFile(target, body);
  }
}

function waitForPdfResponse(context, timeout = 45000) {
  return new Promise((resolveResponse) => {
    const cleanup = () => {
      clearTimeout(timer);
      context.off("response", onResponse);
    };
    const finish = (value) => {
      cleanup();
      resolveResponse(value);
    };
    const onResponse = async (response) => {
      const headers = response.headers();
      const contentType = headers["content-type"] || "";
      const disposition = headers["content-disposition"] || "";
      const responseUrl = response.url();
      const looksLikePdf = /application\/pdf/i.test(contentType)
        || /\.pdf(?:[?#]|$)/i.test(responseUrl)
        || /filename=.*\.pdf/i.test(disposition);

      if (!looksLikePdf) return;

      const body = await response.body().catch(() => null);
      if (!body || !isPdfBody(body)) return;
      finish({ body, url: responseUrl });
    };
    const timer = setTimeout(() => finish(null), timeout);
    context.on("response", onResponse);
  });
}

async function writePdfBuffer(target, body) {
  if (!isPdfBody(body)) fail("PartsLink24 returned a PDF viewer page instead of a valid PDF file.");
  await import("node:fs/promises").then((fs) => fs.writeFile(target, body));
}

async function assertPdfFile(path) {
  const body = await import("node:fs/promises").then((fs) => fs.readFile(path));
  if (!isPdfBody(body)) fail("PartsLink24 returned a PDF viewer page instead of a valid PDF file.");
}

function isPdfBody(body) {
  return Buffer.from(body).subarray(0, 5).toString("ascii") === "%PDF-";
}

function extractChromePdfSource(url) {
  if (!String(url).startsWith("chrome-extension://")) return "";

  const parsed = new URL(url);
  return parsed.searchParams.get("src") || parsed.searchParams.get("file") || "";
}

async function settleWithin(promise, timeout) {
  return Promise.race([
    promise,
    delay(timeout).then(() => null)
  ]);
}

function makePdfName({ brand, vin, suffix = "" }) {
  return `${brand}_${vin}${suffix ? `_${suffix}` : ""}.pdf`.replace(/[^A-Za-z0-9_.-]/g, "_");
}

async function closeContext(contextToClose) {
  if (!contextToClose) return;

  let timedOut = false;
  await Promise.race([
    contextToClose.close().catch(() => {}),
    new Promise((resolveClose) => setTimeout(() => {
      timedOut = true;
      resolveClose();
    }, 5000))
  ]);

  if (timedOut) {
    setTimeout(() => process.exit(process.exitCode || 0), 0);
  }
}

async function readJson(path) {
  return JSON.parse(await import("node:fs").then((fs) => fs.readFileSync(path, "utf8")));
}

async function fillHuman(locator, value) {
  await locator.click();
  await humanDelay(200, 500);
  await locator.fill("");
  await locator.pressSequentially(String(value), { delay: randomInt(45, 120) });
}

async function clickHuman(locator) {
  await humanDelay();
  await locator.click();
  await humanDelay();
}

async function humanDelay(min = Number(process.env.PARTSLINK24_DELAY_MIN_MS || 650), max = Number(process.env.PARTSLINK24_DELAY_MAX_MS || 1600)) {
  await new Promise((resolveDelay) => setTimeout(resolveDelay, randomInt(min, max)));
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function randomInt(min, max) {
  const low = Math.max(0, Math.floor(min));
  const high = Math.max(low, Math.floor(max));
  return low + Math.floor(Math.random() * (high - low + 1));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cssString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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
