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

const REFERENCE_WIDTH = 595.92;
const REFERENCE_HEIGHT = 841.92;

const CLEANUP_AREAS = {
  logo: { x: 500, y: 782, width: 84, height: 48 },
  footer: { x: 27.25, y: 10, width: 422, height: 27 },
  startingPrice: { x: 27, y: 152, width: 338, height: 20 },
};

const FOOTER_FRAME = {
  x: 26.25,
  y: 11.67,
  width: 543.75,
  height: 26.25,
};

let selectedFile = null;
let resultUrl = null;

function t(key, values) {
  return window.AUTOGOOD_AUCTION_LANGUAGE.translate(key, values);
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setFile(file) {
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    dropTitle.textContent = t("autobid.wrongFile");
    fileMeta.textContent = t("autobid.onlyPdf");
    statusText.textContent = t("autobid.notPdf");
    progressBar.style.width = "0%";
    processButton.disabled = true;
    return;
  }

  selectedFile = file;
  dropTitle.textContent = file.name;
  fileMeta.textContent = t("autobid.fileReady", { size: formatBytes(file.size) });
  processButton.disabled = false;
  resetResult();
  statusText.textContent = t("autobid.selected");
  progressBar.style.width = "0%";
}

function resetResult() {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;
  downloadButton.removeAttribute("href");
  downloadButton.classList.add("isDisabled");
  resultPreview.removeAttribute("src");
  resultMeta.textContent = t("autobid.previewEmpty");
}

function setStatus(message, progress) {
  statusText.textContent = message;
  if (progress !== undefined) progressBar.style.width = `${progress}%`;
}

function scaledArea(page, area) {
  const scaleX = page.getWidth() / REFERENCE_WIDTH;
  const scaleY = page.getHeight() / REFERENCE_HEIGHT;
  return {
    x: area.x * scaleX,
    y: area.y * scaleY,
    width: area.width * scaleX,
    height: area.height * scaleY,
  };
}

function coverArea(page, area) {
  page.drawRectangle({
    ...scaledArea(page, area),
    color: window.PDFLib.rgb(1, 1, 1),
  });
}

function restoreFooterFrame(page) {
  const frame = scaledArea(page, FOOTER_FRAME);
  const color = window.PDFLib.rgb(0.8588, 0.8784, 0.898);
  const thickness = 0.75 * (page.getHeight() / REFERENCE_HEIGHT);

  page.drawLine({
    start: { x: frame.x, y: frame.y },
    end: { x: frame.x + frame.width, y: frame.y },
    color,
    thickness,
  });
  page.drawLine({
    start: { x: frame.x, y: frame.y + frame.height },
    end: { x: frame.x + frame.width, y: frame.y + frame.height },
    color,
    thickness,
  });
  page.drawLine({
    start: { x: frame.x, y: frame.y },
    end: { x: frame.x, y: frame.y + frame.height },
    color,
    thickness,
  });
  page.drawLine({
    start: { x: frame.x + frame.width, y: frame.y },
    end: { x: frame.x + frame.width, y: frame.y + frame.height },
    color,
    thickness,
  });
}

function cleanedFileName(name) {
  const baseName = name.replace(/\.pdf$/i, "");
  return `${baseName}-cleaned.pdf`;
}

async function cleanPdf() {
  if (!selectedFile) return;
  if (!window.PDFLib?.PDFDocument) {
    setStatus(t("autobid.editorMissing"), 0);
    return;
  }

  processButton.disabled = true;
  setStatus(t("autobid.opening"), 10);

  try {
    const bytes = await selectedFile.arrayBuffer();
    const pdf = await window.PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = pdf.getPages();

    pages.forEach((page, index) => {
      coverArea(page, CLEANUP_AREAS.logo);
      coverArea(page, CLEANUP_AREAS.footer);
      restoreFooterFrame(page);
      if (index === 0) coverArea(page, CLEANUP_AREAS.startingPrice);
    });

    setStatus(t("autobid.cleaning", { pages: pages.length, pagesLabel: t("autobid.pageLabel") }), 70);
    const cleanedBytes = await pdf.save();
    const blob = new Blob([cleanedBytes], { type: "application/pdf" });
    resultUrl = URL.createObjectURL(blob);
    const fileName = cleanedFileName(selectedFile.name);

    downloadButton.href = resultUrl;
    downloadButton.download = fileName;
    downloadButton.classList.remove("isDisabled");
    resultPreview.src = resultUrl;
    resultMeta.textContent = `${fileName} — ${pages.length} ${t("autobid.pageLabel")}`;
    setStatus(t("autobid.done"), 100);
  } catch (error) {
    console.error(error);
    resetResult();
    setStatus(t("autobid.processingError"), 0);
  } finally {
    processButton.disabled = false;
  }
}

input.addEventListener("change", (event) => setFile(event.target.files?.[0]));
processButton.addEventListener("click", cleanPdf);

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("isDragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("isDragging");
  });
});

dropZone.addEventListener("drop", (event) => setFile(event.dataTransfer?.files?.[0]));
