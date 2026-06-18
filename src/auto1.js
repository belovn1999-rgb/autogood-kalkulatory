const BASE_WIDTH = 594.96;
const BASE_HEIGHT = 841.92;
const RENDER_SCALE = 2;

const state = {
  file: null,
  outputUrl: null,
};

const els = {
  file: document.querySelector("#auto1File"),
  run: document.querySelector("#auto1Run"),
  download: document.querySelector("#auto1Download"),
  status: document.querySelector("#auto1Status"),
  progress: document.querySelector("#auto1Progress"),
  fileName: document.querySelector("#auto1FileName"),
  summary: document.querySelector("#auto1Summary"),
};

const removedMarkers = [
  "Save cash!",
  "Export advantage",
  "Stock number:",
  "In high demand!",
  "watchlist",
  "0:00 / 0:16",
  "Delivery to my address",
  "Delivery to closest pickup location",
  "Pickup at car location",
  "Delivery or pick up process will",
  "Total Pictures:",
  "Copyright © 2026 Auto1.com",
];

const requiredMarkers = [
  "VEHICLE CONDITION",
  "DAMAGE SUMMARY",
  "CAR EQUIPMENT",
  "CAR SERVICE DETAILS",
  "CAR DATA ACCORDING TO IDENTIFICATION NUMBER",
];

function setStatus(message, tone = "idle") {
  els.status.textContent = message;
  els.status.dataset.tone = tone;
}

function setProgress(current, total) {
  els.progress.textContent = total ? `${current}/${total}` : "0/0";
}

function scaleRect(pageWidth, pageHeight, rect) {
  const sx = pageWidth / BASE_WIDTH;
  const sy = pageHeight / BASE_HEIGHT;
  return {
    x: rect.x * sx,
    y: rect.y * sy,
    w: rect.w * sx,
    h: rect.h * sy,
  };
}

function fillRect(ctx, pageWidth, pageHeight, rect) {
  const scaled = scaleRect(pageWidth, pageHeight, rect);
  ctx.fillStyle = "#fff";
  ctx.fillRect(
    scaled.x * RENDER_SCALE,
    scaled.y * RENDER_SCALE,
    scaled.w * RENDER_SCALE,
    scaled.h * RENDER_SCALE,
  );
}

function drawClip(targetCtx, sourceCanvas, pageWidth, pageHeight, sourceRect, targetRect = sourceRect) {
  const src = scaleRect(pageWidth, pageHeight, sourceRect);
  const dst = scaleRect(pageWidth, pageHeight, targetRect);
  targetCtx.drawImage(
    sourceCanvas,
    src.x * RENDER_SCALE,
    src.y * RENDER_SCALE,
    src.w * RENDER_SCALE,
    src.h * RENDER_SCALE,
    dst.x * RENDER_SCALE,
    dst.y * RENDER_SCALE,
    dst.w * RENDER_SCALE,
    dst.h * RENDER_SCALE,
  );
}

function drawCenteredText(ctx, pageWidth, text) {
  ctx.fillStyle = "#102033";
  ctx.font = `${11 * RENDER_SCALE}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(text, pageWidth * RENDER_SCALE * 0.68, 89 * RENDER_SCALE);
}

function normalizeText(text) {
  return text.replace(/\u00a0/g, " ");
}

async function getPageText(page) {
  const content = await page.getTextContent();
  return normalizeText(content.items.map((item) => item.str).join("\n"));
}

function shouldDropPage(text) {
  const deliveryProcess =
    text.includes("Delivery or pick up process will") ||
    text.includes("Payment of invoices for the car and") ||
    text.includes("Enjoy free parking for up to");

  const legalFooter =
    text.includes("Copyright © 2026 Auto1.com") &&
    text.includes("Privacy") &&
    text.includes("Terms and Conditions");

  return deliveryProcess || legalFooter;
}

async function renderPage(page) {
  const viewport = page.getViewport({ scale: RENDER_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { canvas, ctx, width: viewport.width / RENDER_SCALE, height: viewport.height / RENDER_SCALE };
}

async function getSparePhoto(pdf) {
  if (pdf.numPages < 3) return null;
  const page = await pdf.getPage(3);
  const text = await getPageText(page);
  if (!text.includes("Delivery to my address")) return null;
  const rendered = await renderPage(page);
  return {
    canvas: rendered.canvas,
    width: rendered.width,
    height: rendered.height,
    rect: { x: 134.25, y: 429, w: 99, h: 74.25 },
  };
}

function buildCoverFromCanvas(rendered, fileName) {
  const canvas = document.createElement("canvas");
  canvas.width = rendered.canvas.width;
  canvas.height = rendered.canvas.height;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawClip(ctx, rendered.canvas, rendered.width, rendered.height, { x: 0, y: 0, w: 245, h: 58 });
  drawClip(ctx, rendered.canvas, rendered.width, rendered.height, { x: 20, y: 110, w: 220, h: 665 });
  drawClip(
    ctx,
    rendered.canvas,
    rendered.width,
    rendered.height,
    { x: 255, y: 245, w: 300, h: 441 },
    { x: 255, y: 155, w: 300, h: 441 },
  );
  drawClip(
    ctx,
    rendered.canvas,
    rendered.width,
    rendered.height,
    { x: 255, y: 790, w: 95, h: 42 },
    { x: 255, y: 730, w: 95, h: 42 },
  );

  const title = fileName.replace(/\.pdf$/i, "").replace(/^1\s+/, "");
  drawCenteredText(ctx, rendered.width, title || "AUTO1 vehicle report");
  return { canvas, width: rendered.width, height: rendered.height };
}

function cleanStandardCanvas(rendered, text, sparePhoto) {
  const { canvas, ctx, width, height } = rendered;

  fillRect(ctx, width, height, { x: 568, y: 12, w: 16, h: 820 });

  if (text.includes("0:00 / 0:16") || text.includes("0:00/")) {
    fillRect(ctx, width, height, { x: 132, y: 12, w: 104, h: 79 });
    if (sparePhoto) {
      drawClip(
        ctx,
        sparePhoto.canvas,
        sparePhoto.width,
        sparePhoto.height,
        sparePhoto.rect,
        { x: 134.25, y: 14.25, w: 99, h: 74.25 },
      );
    }
  }

  if (
    text.includes("Delivery to my address") ||
    text.includes("Delivery to closest pickup location") ||
    text.includes("Pickup at car location")
  ) {
    fillRect(ctx, width, height, { x: 36, y: 520, w: 524, h: 312 });
    if (sparePhoto) {
      fillRect(ctx, width, height, { x: 132, y: 426, w: 104, h: 81 });
    }
  }

  if (text.includes("Total Pictures:")) {
    fillRect(ctx, width, height, { x: 36, y: 443, w: 524, h: 18 });
    fillRect(ctx, width, height, { x: 36, y: 360, w: 150, h: 34 });
  }

  return { canvas, width, height };
}

function addCanvasToPdf(doc, pageImage, isFirstPage) {
  const orientation = pageImage.width > pageImage.height ? "landscape" : "portrait";
  if (!isFirstPage) {
    doc.addPage([pageImage.width, pageImage.height], orientation);
  }
  const jpeg = pageImage.canvas.toDataURL("image/jpeg", 0.92);
  doc.addImage(jpeg, "JPEG", 0, 0, pageImage.width, pageImage.height);
}

function buildOutputName(fileName) {
  return fileName.replace(/\.pdf$/i, "") + "-client.pdf";
}

function summarize(sourcePages, outputPages, textByPage) {
  const allText = textByPage.join("\n");
  const removedCount = removedMarkers.filter((marker) => !allText.includes(marker)).length;
  const requiredCount = requiredMarkers.filter((marker) => allText.includes(marker)).length;
  els.summary.innerHTML = `
    <div><strong>${sourcePages}</strong><span>stron wejściowych</span></div>
    <div><strong>${outputPages}</strong><span>stron klienta</span></div>
    <div><strong>${removedCount}/${removedMarkers.length}</strong><span>kontroli usunięcia</span></div>
    <div><strong>${requiredCount}/${requiredMarkers.length}</strong><span>sekcji zachowanych</span></div>
  `;
}

async function processPdf() {
  if (!state.file) return;
  if (!window.pdfjsLib || !window.jspdf) {
    setStatus("Brakuje biblioteki PDF. Odśwież stronę i spróbuj ponownie.", "error");
    return;
  }

  URL.revokeObjectURL(state.outputUrl);
  state.outputUrl = null;
  els.download.hidden = true;
  els.run.disabled = true;
  setStatus("Czytam PDF...", "busy");
  setProgress(0, 0);

  try {
    const data = await state.file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data }).promise;
    const sparePhoto = await getSparePhoto(pdf);
    const { jsPDF } = window.jspdf;
    let doc = null;
    let outputPages = 0;
    const keptText = [];

    setProgress(0, pdf.numPages);
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const text = await getPageText(page);
      setStatus(`Przetwarzam stronę ${pageNumber} z ${pdf.numPages}...`, "busy");
      setProgress(pageNumber, pdf.numPages);

      if (shouldDropPage(text)) {
        continue;
      }

      const rendered = await renderPage(page);
      const pageImage =
        pageNumber === 1
          ? buildCoverFromCanvas(rendered, state.file.name)
          : cleanStandardCanvas(rendered, text, sparePhoto);

      if (!doc) {
        const orientation = pageImage.width > pageImage.height ? "landscape" : "portrait";
        doc = new jsPDF({ orientation, unit: "pt", format: [pageImage.width, pageImage.height], compress: true });
      }

      addCanvasToPdf(doc, pageImage, outputPages === 0);
      keptText.push(text);
      outputPages += 1;
    }

    if (!doc || outputPages === 0) {
      throw new Error("Nie udało się zbudować PDF. Sprawdź, czy plik pochodzi z AUTO1.");
    }

    const blob = doc.output("blob");
    state.outputUrl = URL.createObjectURL(blob);
    els.download.href = state.outputUrl;
    els.download.download = buildOutputName(state.file.name);
    els.download.hidden = false;
    summarize(pdf.numPages, outputPages, keptText);
    setStatus("Gotowe. Pobierz PDF i sprawdź wizualnie przed wysyłką do klienta.", "success");
  } catch (error) {
    setStatus(error.message || "Nie udało się przetworzyć PDF.", "error");
  } finally {
    els.run.disabled = !state.file;
  }
}

function bindEvents() {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  els.file.addEventListener("change", () => {
    state.file = els.file.files?.[0] || null;
    URL.revokeObjectURL(state.outputUrl);
    state.outputUrl = null;
    els.download.hidden = true;
    els.run.disabled = !state.file;
    els.fileName.textContent = state.file ? state.file.name : "Nie wybrano pliku";
    els.summary.innerHTML = "";
    setProgress(0, 0);
    setStatus(
      state.file ? "Plik wybrany. Uruchom przygotowanie raportu." : "Wybierz raport AUTO1 w PDF.",
      state.file ? "idle" : "idle",
    );
  });

  els.run.addEventListener("click", processPdf);
}

bindEvents();

