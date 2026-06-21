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

const textOnlyMatchers = [
  /save cash/i,
  /export advantage/i,
  /stock number/i,
  /in high demand/i,
  /watchlist/i,
  /merchants?.*interested/i,
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

function shouldDropPage(text) {
  const legalHits = [
    /copyright/i,
    /privacy/i,
    /terms and conditions/i,
    /imprint/i,
  ].filter((pattern) => pattern.test(text)).length;

  return legalHits >= 3;
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

function applyStructuralMasks(ctx, canvas, text, pageNumber) {
  fillRect(ctx, canvas, [584, 12, 594, 832]);
  fillRect(ctx, canvas, pageNumber === 1 ? [552, 150, 594, 832] : [552, 12, 594, 832]);

  if (pageNumber === 1 && /save cash|export advantage|stock number|in high demand|watchlist/i.test(text)) {
    fillRect(ctx, canvas, [246, 8, 584, 59]);
  }

  if (hasVideoOverlay(text)) {
    fillRect(ctx, canvas, [36, 96, 246, 268]);
    fillRect(ctx, canvas, [184, 0, 560, 132]);
  }

  if (hasDeliveryBlock(text)) {
    fillRect(ctx, canvas, [36, 232, 560, 832]);
    fillRect(ctx, canvas, [132, 426, 236, 507]);
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
    applyStructuralMasks(ctx, canvas, text, pageNumber);

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
