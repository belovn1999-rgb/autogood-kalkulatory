const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const BASE_WIDTH = 594.96;
const BASE_HEIGHT = 841.92;
const RENDER_SCALE = 2.25;

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

function rectToCanvas(rect, canvas) {
  const [x0, y0, x1, y1] = rect;
  return {
    x: (x0 / BASE_WIDTH) * canvas.width,
    y: (y0 / BASE_HEIGHT) * canvas.height,
    w: ((x1 - x0) / BASE_WIDTH) * canvas.width,
    h: ((y1 - y0) / BASE_HEIGHT) * canvas.height,
  };
}

function fillRect(ctx, canvas, rect, color = "#fff") {
  const box = rectToCanvas(rect, canvas);
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.restore();
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

function drawBaseText(ctx, canvas, text, x, y, options = {}) {
  const sx = canvas.width / BASE_WIDTH;
  const sy = canvas.height / BASE_HEIGHT;
  const size = (options.size || 8) * sy;
  const weight = options.bold ? "700" : "400";

  ctx.save();
  ctx.fillStyle = options.color || "#111";
  ctx.font = `${weight} ${size}px Arial, sans-serif`;
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = "top";
  ctx.fillText(text, x * sx, y * sy);
  ctx.restore();
}

function drawBaseLine(ctx, canvas, x0, y0, x1, y1, color) {
  const sx = canvas.width / BASE_WIDTH;
  const sy = canvas.height / BASE_HEIGHT;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, 1.2 * sy);
  ctx.beginPath();
  ctx.moveTo(x0 * sx, y0 * sy);
  ctx.lineTo(x1 * sx, y1 * sy);
  ctx.stroke();
  ctx.restore();
}

function scrubBlueUiPixels(ctx, canvas, rect) {
  const box = rectToCanvas(rect, canvas);
  const x = Math.max(0, Math.floor(box.x));
  const y = Math.max(0, Math.floor(box.y));
  const w = Math.min(canvas.width - x, Math.ceil(box.w));
  const h = Math.min(canvas.height - y, Math.ceil(box.h));
  if (w <= 0 || h <= 0) return;

  const image = ctx.getImageData(x, y, w, h);
  const data = image.data;
  for (let index = 0; index < data.length; index += 4) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    if (b > 145 && g > 80 && r < 130 && b > r + 45) {
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
    }
  }
  ctx.putImageData(image, x, y);
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

function rebuildFixedPriceCover(ctx, canvas, text) {
  const cover = fixedCoverFields(text);
  fillRect(ctx, canvas, [246, 42, 594, 832]);
  fillRect(ctx, canvas, [452, 0, 594, 74]);
  drawBaseLine(ctx, canvas, 15, 64, 584, 64, "#f26b21");
  drawBaseText(ctx, canvas, cover.title, 424, 70, { size: 15, bold: true, align: "center" });
  drawBaseLine(ctx, canvas, 257, 126, 560, 126, "#9fc1e8");

  const yPositions = [
    161,
    184,
    207,
    230,
    253,
    276,
    299,
    322,
    345,
    368,
    391,
    414,
    498,
    521,
    566,
    589,
    612,
    635,
    658,
    681,
    704,
  ];

  cover.fields.forEach((field, index) => {
    const y = yPositions[index];
    if (y === undefined) return;
    field.label.forEach((line, offset) => {
      drawBaseText(ctx, canvas, line, 256, y + offset * 17, { size: 8.7, bold: true });
    });
    drawBaseText(ctx, canvas, field.value, 416, y, { size: 8.7 });
  });

  drawBaseText(ctx, canvas, "Car location", 256, 746, { size: 8.7, bold: true });
  if (cover.location) drawBaseText(ctx, canvas, cover.location, 256, 768, { size: 8.7 });
}

function maskTextItems(pdfjsLib, ctx, viewport, textContent, pageText) {
  const util = pdfjsLib.Util;
  const isDeliveryPage = hasDeliveryBlock(pageText);

  textContent.items.forEach((item) => {
    const str = normalizeText(item.str);
    const isDeliveryAddressText = isDeliveryPage && /kolejowa|lomianki|łomianki|change|address|location|pl$/i.test(str);
    if (!str || (!hasAny(str, cleanupMatchers) && !isDeliveryAddressText)) return;

    const matrix = util.transform(viewport.transform, item.transform);
    const fontHeight = Math.max(
      Math.abs(matrix[3]),
      Math.abs(item.height || 0) * RENDER_SCALE,
      9 * RENDER_SCALE,
    );
    const width = Math.max((item.width || str.length * 5) * RENDER_SCALE, 20 * RENDER_SCALE);
    const pad = 3 * RENDER_SCALE;
    let extraRight = 0;
    let extraLeft = 0;
    let extraTop = 0;
    let extraBottom = 0;

    if (/stock number/i.test(str)) extraRight = 150 * RENDER_SCALE;
    if (/save cash|export advantage|in high demand|watchlist/i.test(str)) {
      extraLeft = 10 * RENDER_SCALE;
      extraRight = 90 * RENDER_SCALE;
      extraTop = 4 * RENDER_SCALE;
      extraBottom = 4 * RENDER_SCALE;
    }

    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.fillRect(
      matrix[4] - pad - extraLeft,
      matrix[5] - fontHeight - pad - extraTop,
      width + pad * 2 + extraLeft + extraRight,
      fontHeight + pad * 2 + extraTop + extraBottom,
    );
    ctx.restore();
  });
}

function applyStructuralMasks(ctx, canvas, text, pageNumber, fixedPriceReport) {
  fillRect(ctx, canvas, [584, 12, 594, 832]);
  fillRect(ctx, canvas, pageNumber === 1 ? [552, 150, 594, 832] : [552, 12, 594, 832]);

  if (pageNumber === 1 && /save cash|export advantage|stock number|in high demand|watchlist/i.test(text)) {
    fillRect(ctx, canvas, [246, 8, 584, 59]);
  }

  if (hasVideoOverlay(text)) {
    if (fixedPriceReport && !hasDeliveryBlock(text)) {
      fillRect(ctx, canvas, [20, 8, 170, 100]);
      scrubBlueUiPixels(ctx, canvas, [100, 232, 250, 286]);
    } else {
      fillRect(ctx, canvas, [36, 96, 246, 268]);
      fillRect(ctx, canvas, [184, 0, 560, 132]);
    }
  }

  if (hasDeliveryBlock(text)) {
    fillRect(ctx, canvas, fixedPriceReport ? [36, 470, 560, 832] : [36, 232, 560, 832]);
    if (!fixedPriceReport) fillRect(ctx, canvas, [132, 426, 236, 507]);
    if (fixedPriceReport) fillRect(ctx, canvas, [510, 0, 594, 95]);
  }

  if (hasPictureCounter(text)) {
    fillRect(ctx, canvas, [36, 440, 560, 464]);
  }
}

function outputName(fileName) {
  const stem = fileName.replace(/\.pdf$/i, "").trim() || "auto1-report";
  return `${stem}-client.pdf`;
}

async function readPageTexts(pdf) {
  const texts = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    texts.push(buildText(textContent));
    setStatus(`Czytam raport AUTO1: strona ${pageNumber}/${pdf.numPages}`, (pageNumber / pdf.numPages) * 20);
  }
  return texts;
}

async function processPdf() {
  if (!selectedFile) return;
  if (!window.jspdf?.jsPDF) {
    throw new Error("Generator PDF nie zostal zaladowany.");
  }

  resetResult();
  processButton.disabled = true;
  downloadButton.classList.add("isDisabled");
  setStatus("Laduje silnik PDF...", 5);

  const pdfjsLib = await loadPdfJs();
  const data = new Uint8Array(await selectedFile.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pageTexts = await readPageTexts(pdf);
  const fixedPriceReport = isFixedPriceReport(pageTexts);
  const { jsPDF } = window.jspdf;

  let output = null;
  let outputPages = 0;
  let droppedPages = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const text = pageTexts[pageNumber - 1];
    if (shouldDropPage(text)) {
      droppedPages += 1;
      setStatus(`Usuwam strone prawna AUTO1: ${pageNumber}/${pdf.numPages}`, 20 + (pageNumber / pdf.numPages) * 65);
      continue;
    }

    const page = await pdf.getPage(pageNumber);
    const pageBox = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    const textContent = await page.getTextContent();
    maskTextItems(pdfjsLib, ctx, viewport, textContent, text);
    applyStructuralMasks(ctx, canvas, text, pageNumber, fixedPriceReport);
    if (isFixedPriceCover(text, pageNumber)) {
      rebuildFixedPriceCover(ctx, canvas, text);
    }

    const width = pageBox.width;
    const height = pageBox.height;
    const orientation = width > height ? "l" : "p";
    const image = canvas.toDataURL("image/jpeg", 0.93);

    if (!output) {
      output = new jsPDF({ unit: "pt", format: [width, height], orientation, compress: true });
    } else {
      output.addPage([width, height], orientation);
    }
    output.addImage(image, "JPEG", 0, 0, width, height, undefined, "FAST");
    outputPages += 1;
    setStatus(`Czyszcze i skladam PDF: strona ${pageNumber}/${pdf.numPages}`, 20 + (pageNumber / pdf.numPages) * 65);
  }

  if (!output || outputPages === 0) {
    throw new Error("Nie udalo sie zbudowac PDF. Wszystkie strony zostaly odrzucone.");
  }

  setStatus("Tworze plik do pobrania...", 92);
  const blob = output.output("blob");
  resultUrl = URL.createObjectURL(blob);
  downloadButton.href = resultUrl;
  downloadButton.download = outputName(selectedFile.name);
  downloadButton.classList.remove("isDisabled");
  resultPreview.src = resultUrl;
  resultMeta.textContent = `${outputPages} stron gotowych, usunieto ${droppedPages} stron.`;
  setStatus("Gotowe. Pobierz klientowski PDF i sprawdz wizualnie przed wysylka.", 100);
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
