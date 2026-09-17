import { buildAuto1Pdf, validateOutputText } from "./auto1-rules.mjs?v=20260917-content-rules";

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
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
let processing = false;

function t(key, values) {
  return window.AUTOGOOD_AUCTION_LANGUAGE.translate(key, values);
}

function setStatus(message, progress = null) {
  statusText.textContent = message;
  if (progress !== null) progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
}

function resetResult() {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;
  resultFileName = "";
  downloadButton.removeAttribute("href");
  downloadButton.classList.add("isDisabled");
  resultPreview.removeAttribute("src");
  resultMeta.textContent = t("auto1.previewEmpty");
}

function setFile(file) {
  if (!file || processing) return;
  resetResult();
  selectedFile = file;
  dropTitle.textContent = file.name;
  const size = file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  fileMeta.textContent = t("auto1.fileReady", { size });
  processButton.disabled = false;
  setStatus(t("auto1.fileSelected"), 0);
}

async function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(PDFJS_URL).then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return lib;
    }).catch((error) => {
      pdfjsPromise = null;
      throw error;
    });
  }
  return pdfjsPromise;
}

async function readPageData(pdf, notify = true) {
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    pages.push({ text: textContent.items.map((item) => item.str).join("\n"), textContent });
    if (notify) setStatus(t("auto1.readingPage", { page: pageNumber, total: pdf.numPages }), pageNumber / pdf.numPages * 25);
    page.cleanup();
  }
  return pages;
}

async function processPdf() {
  if (!selectedFile || processing) return;
  const file = selectedFile;
  processing = true;
  input.disabled = true;
  processButton.disabled = true;
  resetResult();
  let sourcePdf = null;
  try {
    setStatus(t("auto1.loadingEngine"), 5);
    const pdfLib = window.PDFLib;
    if (!pdfLib?.PDFDocument) throw new Error("PDF editor did not load");
    const pdfjs = await loadPdfJs();
    const bytes = await file.arrayBuffer();
    sourcePdf = await pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise;
    const source = await pdfLib.PDFDocument.load(bytes);
    const pageData = await readPageData(sourcePdf);
    const build = async (keepOriginal) => {
      const { pdfDoc, report } = await buildAuto1Pdf(pdfLib, source, pageData, (page, total) => {
        setStatus(t("auto1.buildingPage", { page, total }), 30 + page / total * 50);
      }, keepOriginal);
      setStatus(t("auto1.saving"), 85);
      const outputBytes = await pdfDoc.save();
      setStatus(t("auto1.verifying"), 92);
      const checkedPdf = await pdfjs.getDocument({ data: outputBytes.slice() }).promise;
      const checkedData = await readPageData(checkedPdf, false);
      const check = validateOutputText(checkedData.map((page) => page.text), report);
      await checkedPdf.destroy();
      return { pdfDoc, report, outputBytes, check };
    };
    let result = await build(new Set());
    // A page that lost data is not a reason to withhold the file: rebuild it
    // straight from the original and keep the rest of the cleaning.
    if (result.check.lost.length) result = await build(new Set(result.check.lost.map((page) => page - 1)));
    resultUrl = URL.createObjectURL(new Blob([result.outputBytes], { type: "application/pdf" }));
    resultFileName = file.name;
    downloadButton.href = resultUrl;
    downloadButton.download = resultFileName;
    downloadButton.classList.remove("isDisabled");
    resultPreview.src = resultUrl;
    resultMeta.textContent = t("auto1.resultMeta", { pages: result.pdfDoc.getPageCount(), removedPages: result.report.removedPages });
    const review = [...new Set([...result.report.review.map((entry) => entry.page), ...result.check.auction])].sort((a, b) => a - b);
    if (review.length) console.warn("AUTO1 pages to review", review, result.report.review, result.report.coverNote);
    setStatus(review.length ? t("auto1.doneReview", { pages: review.join(", ") }) : t("auto1.done"), 100);
  } catch (error) {
    console.warn("AUTO1 PDF could not be processed", error);
    resetResult();
    setStatus(t("auto1.reviewNeeded"), 0);
  } finally {
    await Promise.allSettled([sourcePdf?.destroy()]);
    processing = false;
    input.disabled = false;
    processButton.disabled = !selectedFile;
  }
}

input.addEventListener("change", () => setFile(input.files?.[0]));
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  if (!processing) dropZone.classList.add("isDragging");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("isDragging"));
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("isDragging");
  setFile([...event.dataTransfer.files].find((file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name)));
});
processButton.addEventListener("click", processPdf);
downloadButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (!resultUrl) return;
  const link = document.createElement("a");
  link.href = resultUrl;
  link.download = resultFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
});
