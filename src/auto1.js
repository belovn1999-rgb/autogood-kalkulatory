const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

const BASE_WIDTH = 594.96;
const BASE_HEIGHT = 841.92;

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
let resultFileName = "";
let pdfjsPromise = null;
let tesseractPromise = null;

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
  /no images were taken/i,
  /minimum severity threshold/i,
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
  resultFileName = "";
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

function scriptPromise(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      if (existing.dataset.loaded === "true") resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadTesseract() {
  if (!tesseractPromise) {
    tesseractPromise = scriptPromise(TESSERACT_URL).then(() => window.Tesseract);
  }
  return tesseractPromise;
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function isVideoControlText(text) {
  return /(?:^|\s)\d+:\d+\s*\/\s*\d+:\d+(?:\s|$)|(?:^|\s)0:00(?:\s|$)/i.test(text);
}

function hasPictureCounter(text) {
  return /total pictures/i.test(text);
}

function hasDamageTable(text) {
  return /damages/i.test(text)
    && /panel/i.test(text)
    && /damage/i.test(text)
    && /severity/i.test(text)
    && /quantity/i.test(text);
}

function normalizedVinCandidates(text) {
  const compact = normalizeText(text).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const candidates = [];
  for (let index = 0; index <= compact.length - 17; index += 1) {
    const candidate = compact.slice(index, index + 17);
    if (isValidVinCandidate(candidate)) {
      candidates.push(candidate);
    }
  }
  return candidates;
}

function isValidVinCandidate(candidate) {
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(candidate)) return false;
  if (!/[A-Z]/.test(candidate) || !/\d/.test(candidate)) return false;
  if (/NUMBER|STOCK|BUILD|YEAR|SPORT|DIESEL|PETROL|WATCH|LINE|THE|PAST|VAT/.test(candidate)) return false;
  return true;
}

function findVinInText(texts) {
  for (const text of texts) {
    const matches = normalizeText(text).toUpperCase().match(/\b[A-HJ-NPR-Z0-9]{17}\b/g) || [];
    const candidate = matches.find(isValidVinCandidate);
    if (candidate) return candidate;
  }
  return "";
}

function findVinInOcrText(text) {
  const normalized = normalizeText(text).toUpperCase();
  if (!/VIN|FIN|IDENTIFICATION|FAHRGESTELL|CHASSIS/.test(normalized)) return "";

  const matches = normalized.match(/\b[A-HJ-NPR-Z0-9]{17}\b/g) || [];
  const direct = matches.find(isValidVinCandidate);
  if (direct) return direct;

  const [candidate] = normalizedVinCandidates(normalized);
  return candidate || "";
}

async function renderPageToCanvas(page, scale = 2) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

function dataUrlBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function canvasJpegBytes(canvas, quality = 0.9) {
  return dataUrlBytes(canvas.toDataURL("image/jpeg", quality));
}

function eraseCanvasPdfRect(canvas, viewport, rect) {
  const [x, y, width, height] = rect;
  const scaleX = canvas.width / viewport.width;
  const scaleY = canvas.height / viewport.height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(
    x * scaleX,
    (viewport.height - y - height) * scaleY,
    width * scaleX,
    height * scaleY,
  );
}

function eraseBlueUiPixels(canvas, viewport) {
  const scaleX = canvas.width / viewport.width;
  const scaleY = canvas.height / viewport.height;
  const context = canvas.getContext("2d");
  const image = context.getImageData(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    const pdfY = viewport.height - y / scaleY;
    if (pdfY < 295 || pdfY > 535) continue;
    for (let x = 0; x < canvas.width; x += 1) {
      const pdfX = x / scaleX;
      if (pdfX < 80 || pdfX > 190) continue;
      const offset = (y * canvas.width + x) * 4;
      const red = image.data[offset];
      const green = image.data[offset + 1];
      const blue = image.data[offset + 2];
      if (blue > 120 && green > 70 && red < 120 && blue - red > 40) {
        image.data[offset] = 255;
        image.data[offset + 1] = 255;
        image.data[offset + 2] = 255;
      }
    }
  }

  context.putImageData(image, 0, 0);
}

function cleanRenderedCanvas(canvas, viewport, textContent, pageText) {
  eraseCanvasPdfRect(canvas, viewport, [552, 0, 43, viewport.height]);
  eraseCanvasPdfRect(canvas, viewport, [0, 0, 24, viewport.height]);
  eraseCanvasPdfRect(canvas, viewport, [126, 322, 12, 92]);
  eraseCanvasPdfRect(canvas, viewport, [125, 295, 10, 45]);
  eraseBlueUiPixels(canvas, viewport);

  textContent.items.forEach((item) => {
    const str = normalizeText(item.str);
    if (!isVideoControlText(str) && !hasAny(str, cleanupMatchers)) return;

    const rawX = item.transform?.[4] ?? 0;
    const rawY = item.transform?.[5] ?? 0;
    const rawWidth = item.width || str.length * 5;
    eraseCanvasPdfRect(canvas, viewport, [rawX - 45, rawY - 42, Math.max(rawWidth + 95, 150), 96]);
  });

  if (/0:00\s*\/\s*\d+:\d+|0:00\s*\//i.test(pageText)) {
    eraseCanvasPdfRect(canvas, viewport, [120, 500, 170, 95]);
  }

  if (hasDamageTable(pageText)) {
    const rowAnchor = textContent.items.find((item) => /warning light|hood|door|rim|bumper|fender|body/i.test(normalizeText(item.str)));
    if (rowAnchor) {
      const rowY = rowAnchor.transform?.[5] ?? 0;
      eraseCanvasPdfRect(canvas, viewport, [36, rowY + 12, 524, 4]);
      eraseCanvasPdfRect(canvas, viewport, [36, rowY - 36, 524, 22]);
      eraseCanvasPdfRect(canvas, viewport, [36, rowY - 50, 524, 14]);
      eraseCanvasPdfRect(canvas, viewport, [36, rowY - 36, 6, 57]);
      eraseCanvasPdfRect(canvas, viewport, [554, rowY - 36, 6, 57]);
    }
  }
}

async function drawRenderedCleanPage(pdfLib, pdfDoc, sourcePage, targetPage, pageData) {
  const viewport = sourcePage.getViewport({ scale: 1 });
  const canvas = await renderPageToCanvas(sourcePage, 1.8);
  cleanRenderedCanvas(canvas, viewport, pageData.textContent, pageData.text);
  const image = await pdfDoc.embedJpg(canvasJpegBytes(canvas, 0.94));
  targetPage.drawImage(image, {
    x: 0,
    y: 0,
    width: targetPage.getWidth(),
    height: targetPage.getHeight(),
  });
}

async function drawCleanCoverMedia(pdfDoc, sourcePage, targetPage, pageData) {
  const renderScale = 1.8;
  const canvas = await renderPageToCanvas(sourcePage, renderScale);

  const cropWidth = Math.ceil(245 * renderScale);
  const cropTop = Math.ceil(72 * renderScale);
  const crop = document.createElement("canvas");
  crop.width = cropWidth;
  crop.height = canvas.height - cropTop;
  crop.getContext("2d").drawImage(canvas, 0, cropTop, cropWidth, crop.height, 0, 0, cropWidth, crop.height);

  const image = await pdfDoc.embedJpg(canvasJpegBytes(crop, 0.94));
  targetPage.drawImage(image, {
    x: 0,
    y: 0,
    width: 245,
    height: targetPage.getHeight() - 72,
  });
}

function vinOcrPageIndexes(pageTexts) {
  const indexes = new Set();
  pageTexts.forEach((text, index) => {
    if (/service images|documentation of prior damage|car service images|registration document|vehicle registration|identification number|vin/i.test(text)) {
      indexes.add(index);
      if (index > 0) indexes.add(index - 1);
    }
  });
  return [...indexes].filter((index) => index >= 0 && index < pageTexts.length).slice(0, 10);
}

async function findVinWithOcr(sourcePdf, pageTexts) {
  const textVin = findVinInText(pageTexts);
  if (textVin) return textVin;

  let tesseract;
  try {
    tesseract = await loadTesseract();
  } catch {
    return "";
  }
  if (!tesseract?.recognize) return "";

  const indexes = vinOcrPageIndexes(pageTexts);
  for (let position = 0; position < indexes.length; position += 1) {
    const pageIndex = indexes[position];
    setStatus(`Szukam VIN OCR: strona ${pageIndex + 1}`, 25 + position);
    try {
      const page = await sourcePdf.getPage(pageIndex + 1);
      const canvas = await renderPageToCanvas(page, 2);
      const result = await tesseract.recognize(canvas, "eng");
      const candidate = findVinInOcrText(result?.data?.text || "");
      if (candidate) return candidate;
    } catch {
      // OCR is best-effort; PDF cleanup must keep working if OCR misses a page.
    }
  }
  return "";
}

function isFixedPriceCover(text, pageNumber) {
  return pageNumber === 1 && /€\s*\d|your bid includes a net auction fee|stock number/i.test(text);
}

function isProcessPage(text) {
  return /delivery or pick up process will/i.test(text)
    || /delivery time is shown in working days/i.test(text)
    || /enjoy free parking/i.test(text)
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
  const brandPattern = /^(abarth|alfa romeo|audi|bmw|chevrolet|citroen|citroën|dacia|fiat|ford|honda|hyundai|jaguar|jeep|kia|land rover|lexus|mazda|mercedes-benz|mercedes|mini|mitsubishi|nissan|opel|peugeot|porsche|renault|seat|skoda|škoda|subaru|suzuki|tesla|toyota|volkswagen|vw|volvo)\b/i;
  const labelPattern = /^(build year|first registration|license plate|odometer reading|fuel type|horsepower|cylinder capacity|gear box|inspection expires|body type|total number of owners|keys|prior damage|according to previous|owner|country of origin|country of last|registration|environmental class|coc papers|seats|color|upholstery|door count|co2 emissions|car location|stock number|your bid includes|vat rate|in high demand|merchants?|minimum bid|purchase now|€)/i;
  const locationPattern = /^[A-Z]{2},\s+/;

  const brandIndex = lines.findIndex((line) => brandPattern.test(line));
  if (brandIndex !== -1) {
    const titleLines = [];
    for (let index = brandIndex; index < Math.min(lines.length, brandIndex + 3); index += 1) {
      const line = normalizeText(lines[index]);
      if (!line || labelPattern.test(line) || locationPattern.test(line) || isVideoControlText(line)) break;
      titleLines.push(line);
    }
    if (titleLines.length) return dedupeRepeatedText(normalizeText(titleLines.join(" ")));
  }

  const rejected = /€|stock number|your bid includes|vat rate|build year|first registration|odometer|fuel type|horsepower|car location|in high demand|merchants?.*watchlist|minimum bid|purchase now/i;
  const fallback = [...lines].reverse().find((line) => line.length > 8 && !rejected.test(line) && !locationPattern.test(line) && !isVideoControlText(line)) || "AUTO1 vehicle report";
  return dedupeRepeatedText(fallback);
}

function dedupeRepeatedText(text) {
  const words = normalizeText(text).split(" ").filter(Boolean);
  for (let size = 1; size <= Math.floor(words.length / 2); size += 1) {
    const first = words.slice(0, size).join(" ");
    const second = words.slice(size, size * 2).join(" ");
    if (first && first === second) return first;
  }
  if (words.length % 2 === 0) {
    const middle = words.length / 2;
    const first = words.slice(0, middle).join(" ");
    const second = words.slice(middle).join(" ");
    if (first === second) return first;
  }
  return normalizeText(text);
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

function wrapTextForWidth(font, text, size, maxWidth) {
  const words = normalizeText(text).split(" ").filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : [normalizeText(text)];
}

function drawCenteredMultilineText(pdfLib, page, text, centerX, topY, options = {}) {
  const font = options.font;
  const { width, height } = pageRect(page);
  const sx = width / BASE_WIDTH;
  const sy = height / BASE_HEIGHT;
  const size = (options.size || 8) * sy;
  const maxWidth = (options.maxWidth || 300) * sx;
  const lineHeight = (options.lineHeight || 20) * sy;
  const lines = wrapTextForWidth(font, text, size, maxWidth);

  lines.forEach((line, index) => {
    const textWidth = font.widthOfTextAtSize(line, size);
    page.drawText(line, {
      x: centerX * sx - textWidth / 2,
      y: height - topY * sy - size - index * lineHeight,
      size,
      font,
      color: options.color || rgb(pdfLib, 0.06, 0.06, 0.06),
    });
  });

  return lines.length;
}

async function drawCleanFixedPriceCover(pdfLib, pdfDoc, targetPage, sourcePage, pageData, fonts, vin = "") {
  const text = pageData.text;
  const cover = fixedCoverFields(text);
  await drawCleanCoverMedia(pdfDoc, sourcePage, targetPage, pageData);

  drawPdfLine(pdfLib, targetPage, 15, 48, 584, 48, rgb(pdfLib, 0.95, 0.42, 0.13));
  const titleLines = drawCenteredMultilineText(pdfLib, targetPage, cover.title, 424, 58, {
    size: 17,
    lineHeight: 25,
    maxWidth: 325,
    font: fonts.bold,
  });
  const blueLineY = 58 + titleLines * 25 + 18;
  drawPdfLine(pdfLib, targetPage, 257, blueLineY, 560, blueLineY, rgb(pdfLib, 0.62, 0.76, 0.91));

  let y = blueLineY + 26;
  drawPdfText(pdfLib, targetPage, "VIN:", 256, y, { size: 8.7, font: fonts.bold });
  if (vin) drawPdfText(pdfLib, targetPage, vin, 416, y, { size: 8.7, font: fonts.regular });
  y += 25;

  cover.fields.forEach((field) => {
    field.label.forEach((line, offset) => {
      drawPdfText(pdfLib, targetPage, line, 256, y + offset * 17, { size: 8.7, font: fonts.bold });
    });
    drawPdfText(pdfLib, targetPage, field.value, 416, y, { size: 8.7, font: fonts.regular });
    y += Math.max(field.label.length, 1) * 17 + 8;
  });

  const locationY = Math.min(Math.max(y + 10, 704), 760);
  drawPdfText(pdfLib, targetPage, "Car location", 256, locationY, { size: 8.7, font: fonts.bold });
  if (cover.location) drawPdfText(pdfLib, targetPage, cover.location, 256, locationY + 22, { size: 8.7, font: fonts.regular });
}

async function buildCleanPdf(pdfLib, pdfjsLib, sourcePdf, pageData, vin) {
  const pdfDoc = await pdfLib.PDFDocument.create();
  const fonts = {
    regular: await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(pdfLib.StandardFonts.HelveticaBold),
  };
  let removedPages = 0;

  for (let index = 0; index < pageData.length; index += 1) {
    const pageNumber = index + 1;
    const data = pageData[index];
    if (shouldDropPage(data.text)) {
      removedPages += 1;
      continue;
    }

    const sourcePage = await sourcePdf.getPage(pageNumber);
    const viewport = sourcePage.getViewport({ scale: 1 });
    const targetPage = pdfDoc.addPage([viewport.width, viewport.height]);

    setStatus(`Buduje czysty PDF: strona ${pageNumber}/${pageData.length}`, 35 + (pageNumber / pageData.length) * 55);

    if (pageNumber === 1 || isFixedPriceCover(data.text, pageNumber)) {
      await drawCleanFixedPriceCover(pdfLib, pdfDoc, targetPage, sourcePage, data, fonts, vin);
    } else {
      await drawRenderedCleanPage(pdfLib, pdfDoc, sourcePage, targetPage, data);
    }
  }

  return { pdfDoc, removedPages };
}

function outputName(fileName) {
  return fileName.replace(/\.pdf$/i, ".pdf").trim() || "auto1-report.pdf";
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
  const vin = await findVinWithOcr(sourcePdf, pageTexts);

  setStatus("Buduje czysty PDF bez maskowania...", 35);
  const { pdfDoc, removedPages } = await buildCleanPdf(pdfLib, pdfjsLib, sourcePdf, pageData, vin);

  setStatus("Zapisuje czysty PDF...", 90);
  const outputBytes = await pdfDoc.save({ useObjectStreams: false });
  const blob = new Blob([outputBytes], { type: "application/pdf" });
  resultUrl = URL.createObjectURL(blob);
  resultFileName = outputName(selectedFile.name);
  downloadButton.href = resultUrl;
  downloadButton.download = resultFileName;
  downloadButton.classList.remove("isDisabled");
  resultPreview.src = resultUrl;
  resultMeta.textContent = `${pdfDoc.getPageCount()} stron gotowych, usunieto ${removedPages} stron.`;
  setStatus("Gotowe. PDF przebudowany bez bialych masek.", 100);
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

downloadButton.addEventListener("click", (event) => {
  if (!resultUrl || downloadButton.classList.contains("isDisabled")) return;
  event.preventDefault();

  const link = document.createElement("a");
  link.href = resultUrl;
  link.download = resultFileName || outputName(selectedFile?.name || "auto1-report.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();
});
