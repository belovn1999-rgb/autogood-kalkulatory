import { buildAuto1Pdf, validateOutputText } from "./auto1-rules.mjs?v=20260922-table-borders";

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
const historyList = document.querySelector("#historyList");
const historyCount = document.querySelector("#historyCount");

const HISTORY_DB_NAME = "autogood-auto1-results";
const HISTORY_DB_VERSION = 1;
const HISTORY_LIMIT = 10;
const HISTORY_ENTRY_STORE = "entries";
const HISTORY_FILE_STORE = "files";

let selectedFile = null;
let resultUrl = null;
let resultFileName = "";
let pdfjsPromise = null;
let historyDbPromise = null;
let processing = false;

function t(key, values) {
  return window.AUTOGOOD_AUCTION_LANGUAGE.translate(key, values);
}

function setStatus(message, progress = null) {
  statusText.textContent = message;
  if (progress !== null) progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function historyRequest(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result), { once: true });
    request.addEventListener("error", () => reject(request.error), { once: true });
  });
}

function historyTransaction(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve(), { once: true });
    transaction.addEventListener("abort", () => reject(transaction.error), { once: true });
    transaction.addEventListener("error", () => reject(transaction.error), { once: true });
  });
}

function openHistoryDb() {
  if (!historyDbPromise) {
    historyDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(HISTORY_DB_NAME, HISTORY_DB_VERSION);
      request.addEventListener("upgradeneeded", () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(HISTORY_ENTRY_STORE)) {
          db.createObjectStore(HISTORY_ENTRY_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(HISTORY_FILE_STORE)) {
          db.createObjectStore(HISTORY_FILE_STORE, { keyPath: "id" });
        }
      });
      request.addEventListener("success", () => resolve(request.result), { once: true });
      request.addEventListener("error", () => reject(request.error), { once: true });
      request.addEventListener("blocked", () => reject(new Error(t("auto1.historyUnavailable"))), { once: true });
    });
  }
  return historyDbPromise;
}

async function readHistoryEntries() {
  const db = await openHistoryDb();
  const transaction = db.transaction(HISTORY_ENTRY_STORE, "readonly");
  const entries = await historyRequest(transaction.objectStore(HISTORY_ENTRY_STORE).getAll());
  await historyTransaction(transaction);
  return entries.sort((left, right) => right.createdAt - left.createdAt).slice(0, HISTORY_LIMIT);
}

function historyDate(value) {
  const language = window.AUTOGOOD_AUCTION_LANGUAGE.currentLanguage();
  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function downloadHistoryFile(entry) {
  const db = await openHistoryDb();
  const transaction = db.transaction(HISTORY_FILE_STORE, "readonly");
  const storedFile = await historyRequest(transaction.objectStore(HISTORY_FILE_STORE).get(entry.id));
  await historyTransaction(transaction);
  if (!storedFile?.blob) throw new Error(t("auto1.historyDownloadError"));

  const url = URL.createObjectURL(storedFile.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = entry.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderHistoryEntries(entries) {
  historyList.replaceChildren();
  historyCount.textContent = `${entries.length}/${HISTORY_LIMIT}`;

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "auto1HistoryEmpty";
    empty.textContent = t("auto1.historyEmpty");
    historyList.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "auto1HistoryItem";

    const info = document.createElement("div");
    info.className = "auto1HistoryInfo";
    const name = document.createElement("strong");
    name.textContent = entry.name;
    name.title = entry.name;
    const meta = document.createElement("span");
    meta.textContent = t("auto1.historyMeta", {
      date: historyDate(entry.createdAt),
      pages: entry.pageCount,
      size: formatBytes(entry.size),
    });
    info.append(name, meta);

    const download = document.createElement("button");
    download.className = "auto1HistoryDownload";
    download.type = "button";
    download.textContent = t("auto1.historyDownload");
    download.setAttribute("aria-label", t("auto1.historyDownloadLabel", { name: entry.name }));
    download.addEventListener("click", async () => {
      download.disabled = true;
      try {
        await downloadHistoryFile(entry);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : t("auto1.historyDownloadError"));
      } finally {
        download.disabled = false;
      }
    });

    item.append(info, download);
    historyList.appendChild(item);
  });
}

async function renderHistory() {
  try {
    renderHistoryEntries(await readHistoryEntries());
  } catch (error) {
    historyCount.textContent = "—";
    const empty = document.createElement("p");
    empty.className = "auto1HistoryEmpty";
    empty.textContent = t("auto1.historyUnavailable");
    historyList.replaceChildren(empty);
  }
}

async function saveHistoryFile(blob, name, pageCount) {
  const db = await openHistoryDb();
  const existing = await readHistoryEntries();
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const entry = { id, name, pageCount, size: blob.size, createdAt: Date.now() };
  const removeEntries = existing.slice(HISTORY_LIMIT - 1);
  const transaction = db.transaction([HISTORY_ENTRY_STORE, HISTORY_FILE_STORE], "readwrite");
  const entriesStore = transaction.objectStore(HISTORY_ENTRY_STORE);
  const filesStore = transaction.objectStore(HISTORY_FILE_STORE);

  removeEntries.forEach((oldEntry) => {
    entriesStore.delete(oldEntry.id);
    filesStore.delete(oldEntry.id);
  });
  entriesStore.put(entry);
  filesStore.put({ id, blob });
  await historyTransaction(transaction);
  await renderHistory();
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
  const size = formatBytes(file.size);
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
    const outputBlob = new Blob([result.outputBytes], { type: "application/pdf" });
    resultUrl = URL.createObjectURL(outputBlob);
    resultFileName = file.name;
    downloadButton.href = resultUrl;
    downloadButton.download = resultFileName;
    downloadButton.classList.remove("isDisabled");
    resultPreview.src = resultUrl;
    resultMeta.textContent = t("auto1.resultMeta", { pages: result.pdfDoc.getPageCount(), removedPages: result.report.removedPages });
    const review = [...new Set([...result.report.review.map((entry) => entry.page), ...result.check.auction])].sort((a, b) => a - b);
    if (review.length) console.warn("AUTO1 pages to review", review, result.report.review, result.report.coverNote);
    let historySaved = true;
    try {
      await saveHistoryFile(outputBlob, resultFileName, result.pdfDoc.getPageCount());
    } catch (error) {
      historySaved = false;
      console.warn("AUTO1 result history could not be saved", error);
    }
    const done = review.length ? t("auto1.doneReview", { pages: review.join(", ") }) : t("auto1.done");
    setStatus(historySaved ? done : `${done} ${t("auto1.historySaveFailed")}`, 100);
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

window.addEventListener("auctionlanguagechange", renderHistory);
renderHistory();
