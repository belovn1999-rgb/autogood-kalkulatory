const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const BASE_WIDTH = 594.96;
const BASE_HEIGHT = 841.92;
const MASK_COLOR = [1, 1, 1];

const input = document.querySelector("#pdfInput");
const dropZone = document.querySelector("#dropZone");
const dropTitle = document.querySelector("#dropTitle");
const fileMeta = document.querySelector("#fileMeta");
const processButton = document.querySelector("#processButton");
const downloadButton = document.querySelector("#downloadButton");
const progressBar = document.querySelector("#progressBar");
const statusText = document.querySelector("#statusText");
const resultMeta = document.querySelector("#resultMeta");
const resultPreview = document.querySelector("#resultPreview");

let selectedFile = null;
let resultUrl = null;
let pdfjsPromise = null;

const cleanupMatchers = [
  /save cash/i,
  /export advantage/i,
  /stock number/i,
  /in high demand/i,
  /watchlist/i,
  /merchants?.*interested/i,
  /delivery to my address/i,
  /delivery to closest pickup/i,
  /pickup at car location/i,
  /self\s*-\s*pickup/i,
  /delivery by truck/i,
  /delivering/i,
  /buy from/i,
  /change address/i,
  /change location/i,
  /logistikzentrum/i,
  /payment of invoices/i,
  /free parking/i,
  /total pictures/i,
  /0:00\s*\/\s*\d+:\d+/i,
];

function setStatus(message, progress = null) {
  statusText.textContent = message;
  if (progress !== null) {
    progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setFile(file) {
  if (!file) return;
  selectedFile = file;
  dropTitle.textContent = file.name;
  fileMeta.textContent = `${formatBytes(file.size)} - gotowy do obrobki`;
  processButton.disabled = false;
  resetResult();
  setStatus("Plik wybrany. Mozesz uruchomic czyszczenie.", 0);
}

function resetResult() {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;
  downloadButton.removeAttribute("href");
  downloadButton.classList.add("isDisabled");
  resultPreview.removeAttribute("src");
  resultMeta.textContent = "Po obrobce pojawi sie tutaj gotowy PDF.";
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

async function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(PDFJS_URL).then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return pdfjsLib;
    });
  }
  return pdfjsPromise;
}

function ensurePdfLib() {
  if (!window.PDFLib?.PDFDocument) {
    throw new Error("Edytor PDF nie zostal zaladowany.");
  }
  return window.PDFLib;
}

function buildText(textContent) {
  return textContent.items.map((item) => normalizeText(item.str)).filter(Boolean).join("\n");
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function hasDeliveryBlock(text) {
  return /delivery to my address|delivery to closest pickup|pickup at car location|self\s*-\s*pickup|delivery by truck|delivering|buy from|change address|change location|logistikzentrum|payment of invoices|free parking/i.test(text);
}

function hasVideoOverlay(text) {
  return /0:00\s*\/\s*\d+:\d+|0:00\s*\//i.test(text);
}

function hasPictureCounter(text) {
  return /total pictures/i.test(text);
}

function isFixedPriceCover(text, pageNumber) {
  return pageNumber === 1 && /€\s*\d|your bid includes a net auction fee|stock number/i.test(text);
}

function isFixedPriceReport(pageTexts) {
  return pageTexts.some((text, index) => isFixedPriceCover(text, index + 1));
}

function isProcessPage(text) {
  return /delivery or pick up process will/i.test(text)
    || (/payment of invoices/i.test(text) && /self\s*-\s*pickup/i.test(text));
}

function shouldDropPage(text) {
  const legalHits = [
    /copyright/i,
    /privacy/i,
    /terms and conditions/i,
    /imprint/i,
  ].filter((pattern) => pattern.test(text)).length;

  return legalHits >= 3 || isProcessPage(text);
}

function pageLines(text) {
  return text.split("\n").map((line) => normalizeText(line)).filter(Boolean);
}

function cleanLabel(value) {
  return normalizeText(value).replace(/:$/, "").toLowerCase();
}

function coverValueFrom(lines, index) {
  let cursor = index + 1;
  while (lines[cursor] === ":") cursor += 1;
  if (!lines[cursor]) return "";

  let value = lines[cursor];
  const next = lines[cursor + 1] || "";
  if (/^\(.+\)$/.test(next)) value = `${value} ${next}`;
  if (/^g\/km$/i.test(next)) value = `${value}${next}`;
  return value;
}

function valueAfter(lines, label) {
  const target = cleanLabel(label);
  const index = lines.findIndex((line) => cleanLabel(line) === target);
  if (index === -1) return "";
  return coverValueFrom(lines, index);
}

function valueAfterSequence(lines, sequence) {
  const target = sequence.map(cleanLabel);
  for (let index = 0; index <= lines.length - sequence.length; index += 1) {
    const matches = target.every((part, offset) => cleanLabel(lines[index + offset]) === part);
    if (matches) return coverValueFrom(lines, index + sequence.length - 1);
  }
  return "";
}

function fixedCoverTitle(lines) {
  const rejected = /€|stock number|your bid includes|vat rate|build year|first registration|odometer|fuel type|horsepower|car location/i;
  return [...lines].reverse().find((line) => line.length > 8 && !rejected.test(line)) || "AUTO1 vehicle report";
}

function fixedCoverFields(text) {
  const lines = pageLines(text);
  const priorDamage = valueAfterSequence(lines, ["Prior damage / Accident", "according to previous", "owner"]);
  const countryLast = valueAfterSequence(lines, ["Country of last", "registration"]);

  return {
    title: fixedCoverTitle(lines),
    fields: [
      { label: ["Build year:"], value: valueAfter(lines, "Build year:") },
      { label: ["First registration:"], value: valueAfter(lines, "First registration:") },
      { label: ["Odometer reading:"], value: valueAfter(lines, "Odometer reading:") },
      { label: ["Fuel type:"], value: valueAfter(lines, "Fuel type:") },
      { label: ["Horsepower:"], value: valueAfter(lines, "Horsepower:") },
      { label: ["Cylinder capacity:"], value: valueAfter(lines, "Cylinder capacity:") },
      { label: ["Gear box:"], value: valueAfter(lines, "Gear box:") },
      { label: ["Inspection expires:"], value: valueAfter(lines, "Inspection expires:") },
      { label: ["Body type:"], value: valueAfter(lines, "Body type:") },
      { label: ["Total number of owners:"], value: valueAfter(lines, "Total number of owners:") },
      { label: ["Keys:"], value: valueAfter(lines, "Keys:") },
      { label: ["Prior damage / Accident", "according to previous", "owner"], value: priorDamage },
      { label: ["Country of origin:"], value: valueAfter(lines, "Country of origin:") },
      { label: ["Country of last", "registration:"], value: countryLast },
      { label: ["Environmental class:"], value: valueAfter(lines, "Environmental class:") },
      { label: ["COC papers:"], value: valueAfter(lines, "COC papers:") },
      { label: ["Seats:"], value: valueAfter(lines, "Seats:") },
      { label: ["Color:"], value: valueAfter(lines, "Color:") },
      { label: ["Upholstery:"], value: valueAfter(lines, "Upholstery:") },
      { label: ["Door count:"], value: valueAfter(lines, "Door count:") },
      { label: ["CO2 Emissions:"], value: valueAfter(lines, "CO2 Emissions:") },
    ].filter((field) => field.value),
    location: valueAfter(lines, "Car location"),
  };
}

function rgb(pdfLib, r, g, b) {
  return pdfLib.rgb(r, g, b);
}

function pageRect(page) {
  return { width: page.getWidth(), height: page.getHeight() };
}

function scaledBox(page, rect) {
  const [x0, y0, x1, y1] = rect;
  const { width, height } = pageRect(page);
  const sx = width / BASE_WIDTH;
  const sy = height / BASE_HEIGHT;

  return {
    x: x0 * sx,
    y: height - y1 * sy,
    width: (x1 - x0) * sx,
    height: (y1 - y0) * sy,
  };
}

function drawMask(pdfLib, page, rect) {
  page.drawRectangle({
    ...scaledBox(page, rect),
    color: rgb(pdfLib, ...MASK_COLOR),
    borderWidth: 0,
  });
}

function drawPageChromeMasks(pdfLib, page, pageNumber) {
  if (pageNumber === 1) return;
  drawMask(pdfLib, page, [0, 0, 28, 832]);
  drawMask(pdfLib, page, [0, 808, 594, 832]);
}

function drawPdfText(pdfLib, page, text, x, topY, options = {}) {
  const { width, height } = pageRect(page);
  const sx = width / BASE_WIDTH;
  const sy = height / BASE_HEIGHT;
  const size = (options.size || 8) * sy;

  page.drawText(text, {
    x: x * sx,
    y: height - topY * sy - size,
    size,
    font: options.font,
    color: options.color || rgb(pdfLib, 0.06, 0.06, 0.06),
  });
}

function drawPdfLine(pdfLib, page, x0, topY0, x1, topY1, color) {
  const { width, height } = pageRect(page);
  const sx = width / BASE_WIDTH;
  const sy = height / BASE_HEIGHT;

  page.drawLine({
    start: { x: x0 * sx, y: height - topY0 * sy },
    end: { x: x1 * sx, y: height - topY1 * sy },
    thickness: Math.max(0.8, 1.2 * sy),
    color,
  });
}

function drawCenteredText(pdfLib, page, text, centerX, topY, options = {}) {
  const font = options.font;
  const { width, height } = pageRect(page);
  const sx = width / BASE_WIDTH;
  const sy = height / BASE_HEIGHT;
  const size = (options.size || 8) * sy;
  const textWidth = font.widthOfTextAtSize(text, size);

  page.drawText(text, {
    x: centerX * sx - textWidth / 2,
    y: height - topY * sy - size,
    size,
    font,
    color: options.color || rgb(pdfLib, 0.06, 0.06, 0.06),
  });
}

function rebuildFixedPriceCover(pdfLib, page, text, fonts) {
  const cover = fixedCoverFields(text);
  drawMask(pdfLib, page, [246, 42, 594, 832]);
  drawMask(pdfLib, page, [452, 0, 594, 74]);
  drawPdfLine(pdfLib, page, 15, 64, 584, 64, rgb(pdfLib, 0.95, 0.42, 0.13));
  drawCenteredText(pdfLib, page, cover.title, 424, 30, { size: 15, font: fonts.bold });
  drawPdfLine(pdfLib, page, 257, 78, 560, 78, rgb(pdfLib, 0.62, 0.76, 0.91));

  let y = 112;
  cover.fields.forEach((field) => {
    field.label.forEach((line, offset) => {
      drawPdfText(pdfLib, page, line, 256, y + offset * 17, { size: 8.7, font: fonts.bold });
    });
    drawPdfText(pdfLib, page, field.value, 416, y, { size: 8.7, font: fonts.regular });
    y += Math.max(field.label.length, 1) * 17 + 8;
  });

  y += 10;
  drawPdfText(pdfLib, page, "Car location", 256, y, { size: 8.7, font: fonts.bold });
  if (cover.location) drawPdfText(pdfLib, page, cover.location, 256, y + 22, { size: 8.7, font: fonts.regular });
}

function drawTextMasks(pdfLib, page, textContent, pageText) {
  const isDeliveryPage = hasDeliveryBlock(pageText);
  const { width, height } = pageRect(page);
  const sx = width / BASE_WIDTH;
  const sy = height / BASE_HEIGHT;

  textContent.items.forEach((item) => {
    const str = normalizeText(item.str);
    const isDeliveryAddressText = isDeliveryPage && /kolejowa|lomianki|łomianki|change|address|location|pl$/i.test(str);
    if (!str || (!hasAny(str, cleanupMatchers) && !isDeliveryAddressText)) return;

    const rawX = item.transform?.[4] ?? 0;
    const rawY = item.transform?.[5] ?? 0;
    const rawWidth = item.width || str.length * 5;
    const rawHeight = Math.max(Math.abs(item.height || 0), 9);
    const pad = 3;
    let extraRight = 0;
    let extraLeft = 0;
    let extraTop = 0;
    let extraBottom = 0;

    if (/stock number/i.test(str)) extraRight = 150;
    if (/save cash|export advantage|in high demand|watchlist/i.test(str)) {
      extraLeft = 10;
      extraRight = 90;
      extraTop = 4;
      extraBottom = 4;
    }

    page.drawRectangle({
      x: (rawX - pad - extraLeft) * sx,
      y: (rawY - pad - extraBottom) * sy,
      width: (rawWidth + pad * 2 + extraLeft + extraRight) * sx,
      height: (rawHeight + pad * 2 + extraTop + extraBottom) * sy,
      color: rgb(pdfLib, ...MASK_COLOR),
      borderWidth: 0,
    });
  });
}

function applyStructuralMasks(pdfLib, page, text, pageNumber, fixedPriceReport) {
  drawPageChromeMasks(pdfLib, page, pageNumber);
  drawMask(pdfLib, page, [584, 12, 594, 832]);
  drawMask(pdfLib, page, pageNumber === 1 ? [552, 150, 594, 832] : [552, 12, 594, 832]);

  if (pageNumber === 1 && /save cash|export advantage|stock number|in high demand|watchlist/i.test(text)) {
    drawMask(pdfLib, page, [246, 8, 584, 59]);
  }

  if (hasVideoOverlay(text)) {
    if (fixedPriceReport && !hasDeliveryBlock(text)) {
      drawMask(pdfLib, page, [132, 258, 138, 286]);
      drawMask(pdfLib, page, [148, 258, 154, 286]);
    } else {
      drawMask(pdfLib, page, [36, 96, 246, 268]);
      drawMask(pdfLib, page, [184, 0, 560, 132]);
    }
  }

  if (hasDeliveryBlock(text)) {
    drawMask(pdfLib, page, fixedPriceReport ? [36, 470, 560, 832] : [36, 232, 560, 832]);
    if (!fixedPriceReport) drawMask(pdfLib, page, [132, 426, 236, 507]);
    if (fixedPriceReport) drawMask(pdfLib, page, [510, 0, 594, 95]);
  }

  if (hasPictureCounter(text)) {
    drawMask(pdfLib, page, [548, 360, 594, 640]);
    drawMask(pdfLib, page, [36, 570, 560, 602]);
  }
}

function outputName(fileName) {
  const stem = fileName.replace(/\.pdf$/i, "").trim() || "auto1-report";
  return `${stem}-client.pdf`;
}

async function readPageData(pdf) {
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    pages.push({
      text: buildText(textContent),
      textContent,
    });
    setStatus(`Czytam raport AUTO1: strona ${pageNumber}/${pdf.numPages}`, (pageNumber / pdf.numPages) * 25);
  }
  return pages;
}

async function processPdf() {
  if (!selectedFile) return;

  resetResult();
  processButton.disabled = true;
  downloadButton.classList.add("isDisabled");
  setStatus("Laduje silnik PDF...", 5);

  const pdfLib = ensurePdfLib();
  const pdfjsLib = await loadPdfJs();
  const bytes = await selectedFile.arrayBuffer();
  const pdfJsData = new Uint8Array(bytes.slice(0));
  const sourcePdf = await pdfjsLib.getDocument({ data: pdfJsData }).promise;
  const pageData = await readPageData(sourcePdf);
  const pageTexts = pageData.map((page) => page.text);
  const fixedPriceReport = isFixedPriceReport(pageTexts);

  setStatus("Edytuje oryginalny PDF...", 35);
  const pdfDoc = await pdfLib.PDFDocument.load(bytes, { ignoreEncryption: true });
  const fonts = {
    regular: await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(pdfLib.StandardFonts.HelveticaBold),
  };
  const pages = pdfDoc.getPages();
  const dropIndexes = [];

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const data = pageData[index];
    if (!data) return;

    if (shouldDropPage(data.text)) {
      dropIndexes.push(index);
      return;
    }

    drawTextMasks(pdfLib, page, data.textContent, data.text);
    applyStructuralMasks(pdfLib, page, data.text, pageNumber, fixedPriceReport);
    if (isFixedPriceCover(data.text, pageNumber)) {
      rebuildFixedPriceCover(pdfLib, page, data.text, fonts);
    }
  });

  [...dropIndexes].reverse().forEach((index) => pdfDoc.removePage(index));

  setStatus("Zapisuje edytowalny PDF...", 90);
  const outputBytes = await pdfDoc.save({ useObjectStreams: false });
  const blob = new Blob([outputBytes], { type: "application/pdf" });
  resultUrl = URL.createObjectURL(blob);
  downloadButton.href = resultUrl;
  downloadButton.download = outputName(selectedFile.name);
  downloadButton.classList.remove("isDisabled");
  resultPreview.src = resultUrl;
  resultMeta.textContent = `${pdfDoc.getPageCount()} stron gotowych, usunieto ${dropIndexes.length} stron.`;
  setStatus("Gotowe. PDF zachowuje oryginalne strony i edytowalne poprawki.", 100);
}

input.addEventListener("change", () => {
  setFile(input.files?.[0]);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("isDragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("isDragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("isDragging");
  const file = [...event.dataTransfer.files].find((item) => item.type === "application/pdf" || /\.pdf$/i.test(item.name));
  if (file) setFile(file);
});

processButton.addEventListener("click", async () => {
  try {
    await processPdf();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Nie udalo sie obrobic PDF.", 0);
  } finally {
    processButton.disabled = !selectedFile;
  }
});
