#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { extractPdfVehicleInfo, formatProductionDate, normalizeEngineInfo } from "./report-extraction.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const envLoadWarnings = [];
loadLocalEnv(join(homedir(), "Library/Application Support/AUTOGOOD/partslink24.env"));
if (!hasPartslinkCredentials()) loadLocalEnv(join(repoRoot, "server/.env"));
if (!hasPartslinkCredentials()) loadLocalEnv(join(__dirname, ".env"));

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

const vin = readOption(args, "--vin");
const brand = readOption(args, "--brand");
const language = readOption(args, "--language") || process.env.PARTSLINK24_DEFAULT_LANGUAGE || "RU";
const mode = readOption(args, "--mode") || (args.includes("--production-date-only") ? "production-date" : "pdf");
const outDir = resolve(readOption(args, "--out-dir") || process.env.PARTSLINK24_OUTPUT_DIR || join(homedir(), "Library/Application Support/AUTOGOOD/partslink24-output"));
const headless = !args.includes("--headed");
const userDataDir = resolve(process.env.PARTSLINK24_PROFILE_DIR || join(homedir(), "Library/Application Support/AUTOGOOD/partslink24-profile"));
const slowMo = Number(process.env.PARTSLINK24_SLOW_MO_MS || 280);
const systemChromePaths = [
  process.env.PARTSLINK24_CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
].filter(Boolean);

if (!vin) fail("Missing --vin.");
if (!brand) fail("Missing --brand.");
if (!["pdf", "production-date", "full"].includes(mode)) fail(`Unsupported --mode: ${mode}`);

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
const damProductionDateBrands = new Set(["Citroen", "DS", "Peugeot"]);

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
  const vehicleDescription = await extractVehicleDescription(page, { brand });
  if (mode === "production-date") {
    const productionDate = await extractProductionDate(page, { brand, language });
    const engineInfo = normalizeEngineInfo(await extractEngineInfo(page));
    process.stdout.write(`${JSON.stringify({ ok: true, brand, vin, language, vehicleDescription, productionDate: productionDate.value, productionDateLabel: productionDate.label, engineType: engineInfo.engineType, engineVolume: engineInfo.engineVolume }, null, 2)}\n`);
  } else if (mode === "full") {
    const pdfPaths = await downloadVehiclePdfs(page, brandConfig, { brand, vin, language, outDir });
    const reportInfo = extractPdfVehicleInfo(pdfPaths[0], { brand, language });
    const reportVehicleDescription = reportInfo.model ? `${brand} ${reportInfo.model}` : vehicleDescription;
    process.stdout.write(`${JSON.stringify({ ok: true, brand, vin, language, vehicleDescription: reportVehicleDescription, productionDate: reportInfo.productionDate, productionDateLabel: reportInfo.productionDate ? "PDF" : "", engineType: reportInfo.engineType, engineVolume: reportInfo.engineVolume, pdfPath: pdfPaths[0], pdfPaths }, null, 2)}\n`);
  } else {
    const pdfPaths = await downloadVehiclePdfs(page, brandConfig, { brand, vin, language, outDir });
    process.stdout.write(`${JSON.stringify({ ok: true, brand, vin, language, vehicleDescription, pdfPath: pdfPaths[0], pdfPaths }, null, 2)}\n`);
  }
} catch (error) {
  const screenshotPath = join(outDir, `${brand}_${vin}_${language}_error.png`.replace(/[^A-Za-z0-9_.-]/g, "_"));
  await page?.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
  const message = error instanceof Error ? error.message : "Unknown error.";
  const payload = { ok: false, brand, vin, language, error: message, screenshotPath };
  if (process.env.PARTSLINK24_DEBUG_ERRORS === "1" && error instanceof Error) payload.stack = error.stack;
  process.stderr.write(`${JSON.stringify(payload, null, 2)}\n`);
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

  const blockingMessage = await readPartslinkBlockingMessage(page);
  if (blockingMessage) fail(blockingMessage);

  await page.getByText(vin).first().waitFor({ timeout: 5000 });
}

async function readPartslinkBlockingMessage(page) {
  return page.evaluate(() => {
    const normalize = (value) => String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const text = normalize(document.body?.innerText || "");
    const patterns = [
      /(?:сожалени[ея][^.!?]{0,120})?идентификация[^.!?]{0,120}(?:vin|номера|шасси)[^.!?]{0,180}(?:недоступна|не доступна|неопределенного периода)/i,
      /identyfikacja[^.!?]{0,120}(?:vin|numeru|nadwozia|podwozia|chassis)[^.!?]{0,180}(?:niedostępna|niedostepna|nie będzie dostępna|nie bedzie dostepna)/i,
      /(?:vin|chassis number) identification[^.!?]{0,180}(?:unavailable|not available)/i
    ];
    return patterns.map((pattern) => text.match(pattern)?.[0]).find(Boolean) || "";
  }).catch(() => "");
}

async function downloadVehiclePdfs(page, brandConfig, options) {
  if (["hyundai_two_file_print", "two_file_print"].includes(brandConfig.route)) {
    return downloadTwoFilePrintPdfs(page, options);
  }

  return [await downloadPdf(page, options)];
}

async function extractVehicleDescription(page, options = {}) {
  return page.evaluate((defaultBrand) => {
    const normalize = (value) => String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const cleanValue = (value) => normalize(value)
      .replace(/^[\s:;|/\\-]+/, "")
      .replace(/[\s:;|/\\-]+$/, "");
    const isVisible = (element) => Boolean(element?.offsetWidth || element?.offsetHeight || element?.getClientRects().length);
    const brandLabelPattern = /^(?:marka|марка|make|manufacturer|producent)$/i;
    const modelLabelPattern = /^(?:model|модель|model pojazdu|vehicle model|linia pojazdu|vehicle line)$/i;
    const blockedValuePattern = /^(?:marka|марка|make|manufacturer|producent|model|модель|vin|data|date|production|vehicle identification|identyfikacja pojazdu|идентификация автомобиля)$/i;

    function directLabelValue(labelPattern) {
      const labelSource = labelPattern.source.replace(/^\^/, "").replace(/\$$/, "");
      const textNodes = [...document.querySelectorAll("td, th, dt, dd, label, span, div, p")]
        .filter(isVisible)
        .map((element) => ({ element, text: normalize(element.innerText || element.textContent || "") }))
        .filter((item) => item.text);

      for (const item of textNodes) {
        const inlineMatch = item.text.match(new RegExp(`^(?:${labelSource})\\s*[:\\-]?\\s+(.{2,80})$`, "i"));
        if (inlineMatch) {
          const value = cleanValue(inlineMatch[1]);
          if (value && !blockedValuePattern.test(value)) return value;
        }

        if (!labelPattern.test(item.text)) continue;

        const siblings = [
          item.element.nextElementSibling,
          item.element.parentElement?.nextElementSibling,
          ...[...(item.element.parentElement?.children || [])].filter((child) => child !== item.element)
        ].filter(Boolean);

        for (const sibling of siblings) {
          if (!isVisible(sibling)) continue;
          const value = cleanValue(sibling.innerText || sibling.textContent || "");
          if (value && value.length <= 80 && !blockedValuePattern.test(value)) return value;
        }
      }

      return "";
    }

    function rowLabelValue(labelPattern) {
      const labelSource = labelPattern.source.replace(/^\^/, "").replace(/\$$/, "");
      const looseLabelPattern = new RegExp(`\\b(?:${labelSource})\\b`, "i");
      const rows = [...document.querySelectorAll("tr, [role='row'], dl, li, section, article, div")]
        .filter(isVisible);
      for (const row of rows) {
        const text = normalize(row.innerText || row.textContent || "");
        if (!text || !looseLabelPattern.test(text)) continue;
        const parts = text.split(/[:\n\r\t]/).map(cleanValue).filter(Boolean);
        if (parts.length >= 2 && labelPattern.test(parts[0])) {
          const value = parts.slice(1).join(" ");
          if (value && value.length <= 80 && !blockedValuePattern.test(value)) return value;
        }
      }
      return "";
    }

    const brand = directLabelValue(brandLabelPattern) || rowLabelValue(brandLabelPattern);
    const model = directLabelValue(modelLabelPattern) || rowLabelValue(modelLabelPattern);
    return [brand || defaultBrand, model].filter(Boolean).join(" ");
  }, options.brand || "").catch(() => "");
}

async function extractProductionDate(page, options = {}) {
  const result = await page.evaluate(() => {
    const labelPattern = /(?:data\s+produkcji|дата\s+(?:производства|изготовления)|production\s+date|date\s+of\s+production|manufactur(?:e|ing)\s+date|build\s+date)/i;
    const monthPattern = [
      "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "wrzesnia", "października", "pazdziernika", "listopada", "grudnia",
      "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря",
      "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
    ].join("|");
    const datePattern = new RegExp([
      "\\b\\d{1,2}[.\\/-]\\d{1,2}[.\\/-]\\d{2,4}\\b",
      "\\b\\d{4}[.\\/-]\\d{1,2}[.\\/-]\\d{1,2}\\b",
      `\\b\\d{1,2}\\s+(?:${monthPattern})\\s+\\d{4}\\b`
    ].join("|"), "i");
    const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
    const isVisible = (element) => Boolean(element?.offsetWidth || element?.offsetHeight || element?.getClientRects().length);
    const pickDate = (value) => normalize(value).match(datePattern)?.[0] || "";
    const labelText = (value) => normalize(value).match(labelPattern)?.[0] || "";
    const rowSelectors = "tr, [role='row'], li, dl, div, section, article";

    for (const element of [...document.querySelectorAll(rowSelectors)].filter(isVisible)) {
      const text = normalize(element.innerText || element.textContent || "");
      if (!labelPattern.test(text)) continue;
      const label = labelText(text);
      const afterLabel = text.replace(labelPattern, " ");
      const value = pickDate(afterLabel) || pickDate(text);
      if (value) return { value, label };
    }

    const lines = String(document.body?.innerText || "")
      .split(/\r?\n/)
      .map(normalize)
      .filter(Boolean);

    for (let index = 0; index < lines.length; index += 1) {
      if (!labelPattern.test(lines[index])) continue;
      const label = labelText(lines[index]);
      const windowText = lines.slice(index, index + 4).join(" ");
      const afterLabel = windowText.replace(labelPattern, " ");
      const value = pickDate(afterLabel) || pickDate(windowText);
      if (value) return { value, label };
    }

    return { value: "", label: "" };
  });

  if (result.value) {
    return { ...result, value: formatProductionDate(result.value, options.language) };
  }

  if (options.allowDamFallback !== false && damProductionDateBrands.has(options.brand)) {
    const damCode = await extractDamCode(page);
    const damDate = formatDamProductionDate(damCode);
    if (damDate) {
      return { value: damDate, label: "DAM/OPR" };
    }
  }

  if (!result.value && options.required !== false) {
    fail("Дата производства не найдена на странице PartsLink24 для этого VIN.");
  }

  return result;
}

async function extractEngineInfo(page) {
  return page.evaluate(() => {
    const normalize = (value) => String(value || "")
      .replace(/ /g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const cleanValue = (value) => normalize(value)
      .replace(/^[\s:;|/\\-]+/, "")
      .replace(/[\s:;|/\\-]+$/, "");
    const isVisible = (element) => Boolean(element?.offsetWidth || element?.offsetHeight || element?.getClientRects().length);
    const engineTypeLabelPattern = /^(?:rodzaj\s+silnika|typ\s+silnika|kod\s+silnika|тип\s+двигателя|двигатель|engine\s+type|engine\s+code|motor\s+type)$/i;
    const fuelTypeLabelPattern = /^(?:rodzaj\s+paliwa|paliwo|тип\s+топлива|вид\s+топлива|топливо|fuel\s+type|fuel\s+category)$/i;
    const mildHybridLabelPattern = /^(?:mhev|mild[\s-]*hybrid|mi[eę]kk(?:i|a)[\s-]*hybryd(?:a)?|мягк(?:ий|ая)[\s-]*гибрид)$/i;
    const engineVolumeLabelPattern = /^(?:pojemność\s+silnika|pojemnosc\s+silnika|poj\.?\s*silnika|объем\s+двигателя|объём\s+двигателя|рабочий\s+объем|engine\s+capacity|engine\s+displacement|displacement|cubic\s+capacity)$/i;
    const blockedValuePattern = /^(?:vin|data|date|production|marka|model)$/i;

    function directLabelValue(labelPattern) {
      const labelSource = labelPattern.source.replace(/^\^/, "").replace(/\$$/, "");
      const textNodes = [...document.querySelectorAll("td, th, dt, dd, label, span, div, p")]
        .filter(isVisible)
        .map((element) => ({ element, text: normalize(element.innerText || element.textContent || "") }))
        .filter((item) => item.text);

      for (const item of textNodes) {
        const inlineMatch = item.text.match(new RegExp(`^(?:${labelSource})\\s*[:\\-]?\\s+(.{1,40})$`, "i"));
        if (inlineMatch) {
          const value = cleanValue(inlineMatch[1]);
          if (value && !blockedValuePattern.test(value)) return value;
        }

        if (!labelPattern.test(item.text)) continue;

        const siblings = [
          item.element.nextElementSibling,
          item.element.parentElement?.nextElementSibling,
          ...[...(item.element.parentElement?.children || [])].filter((child) => child !== item.element)
        ].filter(Boolean);

        for (const sibling of siblings) {
          if (!isVisible(sibling)) continue;
          const value = cleanValue(sibling.innerText || sibling.textContent || "");
          if (value && value.length <= 40 && !blockedValuePattern.test(value)) return value;
        }
      }

      return "";
    }

    function rowLabelValue(labelPattern) {
      const labelSource = labelPattern.source.replace(/^\^/, "").replace(/\$$/, "");
      const looseLabelPattern = new RegExp(`\\b(?:${labelSource})\\b`, "i");
      const rows = [...document.querySelectorAll("tr, [role='row'], dl, li, section, article, div")]
        .filter(isVisible);
      for (const row of rows) {
        const text = normalize(row.innerText || row.textContent || "");
        if (!text || !looseLabelPattern.test(text)) continue;
        const parts = text.split(/[:\n\r\t]/).map(cleanValue).filter(Boolean);
        if (parts.length >= 2 && labelPattern.test(parts[0])) {
          const value = parts.slice(1).join(" ");
          if (value && value.length <= 40 && !blockedValuePattern.test(value)) return value;
        }
      }
      return "";
    }

    const engineTypeRaw = directLabelValue(engineTypeLabelPattern) || rowLabelValue(engineTypeLabelPattern);
    const fuelTypeRaw = directLabelValue(fuelTypeLabelPattern) || rowLabelValue(fuelTypeLabelPattern);
    const mildHybridRaw = directLabelValue(mildHybridLabelPattern) || rowLabelValue(mildHybridLabelPattern);
    const engineVolumeRaw = directLabelValue(engineVolumeLabelPattern) || rowLabelValue(engineVolumeLabelPattern);
    return {
      engineTypeRaw,
      fuelTypeRaw,
      mildHybridRaw,
      engineVolumeRaw
    };
  }).catch(() => ({ engineTypeRaw: "", fuelTypeRaw: "", mildHybridRaw: "", engineVolumeRaw: "" }));
}

async function extractDamCode(page) {
  return page.evaluate(() => {
    const normalize = (value) => String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const isVisible = (element) => Boolean(element?.offsetWidth || element?.offsetHeight || element?.getClientRects().length);
    const damLabelPattern = /(?:\b(?:DAM|OPR|ORGA)\b|APV\s*\/?\s*PR|N[°ºo]?\s*APV\s*\/?\s*PR|код\s*(?:DAM|OPR)|номер\s*(?:DAM|OPR)|№\s*APV)/i;
    const pickDam = (value) => {
      const candidates = normalize(value).match(/\b\d{5}[A-Z0-9]{0,8}\b/g) || [];
      return candidates
        .map((candidate) => candidate.slice(0, 5))
        .find((candidate) => candidate !== "00000") || "";
    };
    const rowSelectors = "tr, [role='row'], li, dl, div, section, article";

    for (const element of [...document.querySelectorAll(rowSelectors)].filter(isVisible)) {
      const text = normalize(element.innerText || element.textContent || "");
      if (!damLabelPattern.test(text)) continue;
      const afterLabel = text.replace(damLabelPattern, " ");
      const value = pickDam(afterLabel) || pickDam(text);
      if (value) return value;
    }

    const lines = String(document.body?.innerText || "")
      .split(/\r?\n/)
      .map(normalize)
      .filter(Boolean);

    for (let index = 0; index < lines.length; index += 1) {
      if (!damLabelPattern.test(lines[index])) continue;
      const windowText = lines.slice(index, index + 4).join(" ");
      const afterLabel = windowText.replace(damLabelPattern, " ");
      const value = pickDam(afterLabel) || pickDam(windowText);
      if (value) return value;
    }

    return "";
  }).catch(() => "");
}

function formatDamProductionDate(damCode) {
  const dayOffset = Number(String(damCode || "").trim());
  if (!Number.isInteger(dayOffset) || dayOffset < 0 || dayOffset > 99999) return "";
  const baseDate = Date.UTC(1976, 10, 7);
  const date = new Date(baseDate + dayOffset * 24 * 60 * 60 * 1000);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getUTCFullYear()}`;
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
  const centerContent = ["Ford", "Ford Pro", "Hyundai"].includes(options.brand);

  const vehiclePath = join(options.outDir, makePdfName({ ...options, suffix: "vehicle" }));
  await saveTwoFilePanelPdf(page, vehiclePath, "vehicle", { centerContent });

  await openTwoFileEquipmentTab(page);
  const equipmentPath = join(options.outDir, makePdfName({ ...options, suffix: "equipment" }));
  await saveTwoFilePanelPdf(page, equipmentPath, "equipment", { centerContent });

  const mergedPath = join(options.outDir, makePdfName(options));
  await mergePdfFiles([vehiclePath, equipmentPath], mergedPath);
  return [mergedPath];
}

async function openTwoFileEquipmentTab(page) {
  const equipmentTab = page.locator('a, button, [role="tab"]')
    .filter({ hasText: /^\s*(?:Wyposażenie|Wyposazenie|Оснащение|Equipment)\s*$/i })
    .first();
  if (!await equipmentTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    fail("Не удалось найти вкладку оснащения для второго PDF.");
  }

  await clickHuman(equipmentTab);
  await page.waitForFunction(() => {
    const text = document.body?.innerText || "";
    const activeTab = [...document.querySelectorAll('a, button, [role="tab"]')]
      .find((element) => /^(?:Wyposażenie|Wyposazenie|Оснащение|Equipment)$/i.test((element.textContent || "").trim()));
    const isActive = activeTab?.getAttribute("aria-selected") === "true"
      || /(?:^|\s)(?:active|selected|ui-tabs-active)(?:\s|$)/i.test(activeTab?.className || "");
    const hasEquipmentRows = /A\/C Refrigerant|Accessory USB Unit|Adjustable Foot Pedals|Cecha\s+Nazwa|Cechy\s+Nazwa|Характеристи[\s-]*ка\s+Наименование|Attribute\s+(?:Description|Name)|COLOR PACKAGE|BATTERY CAPACITY/i.test(text);
    return Boolean(isActive || hasEquipmentRows) && hasEquipmentRows;
  }, undefined, { timeout: 20000 }).catch(() => fail("Вкладка оснащения не открылась для второго PDF."));
  await humanDelay();
}

async function saveTwoFilePanelPdf(page, target, mode, { centerContent = false } = {}) {
  const marked = await markTwoFilePrintRoot(page, mode, vin, { centerContent });
  if (!marked) fail(`Не удалось подготовить ${mode} к печати.`);

  await savePagePdf(page, target);
  await page.evaluate(() => {
    document.querySelector("[data-autogood-print-container]")?.remove();
    document.querySelector("[data-autogood-print-root]")?.removeAttribute("data-autogood-print-root");
    document.querySelector("[data-autogood-print-style]")?.remove();
  }).catch(() => {});
}

async function markTwoFilePrintRoot(page, mode, expectedVin, { centerContent = false } = {}) {
  return page.evaluate(({ printMode, expectedVinValue, shouldCenterContent }) => {
    document.querySelector("[data-autogood-print-style]")?.remove();
    document.querySelector("[data-autogood-print-container]")?.remove();
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
        [data-autogood-print-content] {
          width: min(100%, var(--autogood-print-content-width)) !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          transform: none !important;
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
    if (!shouldCenterContent) {
      chosen.setAttribute("data-autogood-print-root", "true");
      return true;
    }

    const chosenWidth = Math.ceil(chosen.getBoundingClientRect().width);
    const printContainer = document.createElement("div");
    printContainer.setAttribute("data-autogood-print-root", "true");
    printContainer.setAttribute("data-autogood-print-container", "true");
    printContainer.style.setProperty("--autogood-print-content-width", `${chosenWidth}px`);

    const printContent = chosen.cloneNode(true);
    printContent.setAttribute("data-autogood-print-content", "true");
    printContainer.append(printContent);
    document.body.append(printContainer);
    return true;
  }, { printMode: mode, expectedVinValue: expectedVin, shouldCenterContent: centerContent }).catch(() => false);
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

async function mergePdfFiles(sourcePaths, target) {
  const fs = await import("node:fs/promises");
  const bundledPdfUnite = join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdfunite");
  const commands = [process.env.PARTSLINK24_PDFUNITE_PATH, "pdfunite", bundledPdfUnite].filter(Boolean);
  await fs.rm(target, { force: true }).catch(() => {});

  for (const command of commands) {
    const result = spawnSync(command, [...sourcePaths, target], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024
    });
    if (result.status !== 0 || !existsSync(target)) continue;
    await assertPdfFile(target);
    return;
  }

  fail("Не удалось объединить параметры автомобиля и оснащение в один PDF.");
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

function makePdfName({ brand, vin, language = "", suffix = "" }) {
  const parts = [brand, vin, language, suffix].filter(Boolean);
  return `${parts.join("_")}.pdf`.replace(/[^A-Za-z0-9_.-]/g, "_");
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
  return JSON.parse(readTextFile(path));
}

async function fillHuman(locator, value) {
  await locator.click();
  await humanDelay(160, 400);
  await locator.fill("");
  await locator.pressSequentially(String(value), { delay: randomInt(36, 96) });
}

async function clickHuman(locator) {
  await humanDelay();
  await locator.click();
  await humanDelay();
}

async function humanDelay(min = Number(process.env.PARTSLINK24_DELAY_MIN_MS || 520), max = Number(process.env.PARTSLINK24_DELAY_MAX_MS || 1280)) {
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

function loadLocalEnv(path) {
  if (!existsSync(path)) return;

  let lines;
  try {
    lines = readTextFile(path).split(/\r?\n/);
  } catch (error) {
    const message = `Cannot read ${path}: ${error instanceof Error ? error.message : "Unknown error."}`;
    envLoadWarnings.push(message);
    if (process.env.PARTSLINK24_DEBUG_ERRORS === "1") process.stderr.write(`[partslink24] ${message}\n`);
    return;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function hasPartslinkCredentials() {
  return Boolean(process.env.PARTSLINK24_COMPANY_ID && process.env.PARTSLINK24_USERNAME && process.env.PARTSLINK24_PASSWORD);
}

function readTextFile(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    const fallback = spawnSync("/bin/cat", [path], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024
    });
    if (fallback.status === 0) return fallback.stdout;
    throw error;
  }
}

function printHelp() {
  process.stdout.write(`Usage:
  node tools/partslink24/download-vin-pdf.mjs --brand BMW --vin WBA31AA0905V40977 --language RU
  node tools/partslink24/download-vin-pdf.mjs --brand Audi --vin WAUZZZ4M3RD016484 --language PL --mode production-date

Required environment variables:
  PARTSLINK24_COMPANY_ID
  PARTSLINK24_USERNAME
  PARTSLINK24_PASSWORD
`);
}
