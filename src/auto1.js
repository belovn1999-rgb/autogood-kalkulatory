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
const HISTORY_LIMIT = 20;
const HISTORY_ENTRY_STORE = "entries";
const HISTORY_FILE_STORE = "files";

const PDF_PICKER_TYPE = { description: "PDF", accept: { "application/pdf": [".pdf"] } };

let selectedFile = null;
// Set only when the browser gave us a handle to the chosen file, which is what
// lets the cleaned report replace the original instead of landing beside it.
let sourceHandle = null;
let resultBlob = null;
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

async function readAllHistoryEntries() {
  const db = await openHistoryDb();
  const transaction = db.transaction(HISTORY_ENTRY_STORE, "readonly");
  const entries = await historyRequest(transaction.objectStore(HISTORY_ENTRY_STORE).getAll());
  await historyTransaction(transaction);
  return entries;
}

function trimHistoryEntries(entries) {
  const sorted = [...entries].sort((left, right) => {
    if (Boolean(left.pinned) !== Boolean(right.pinned)) return left.pinned ? -1 : 1;
    return right.createdAt - left.createdAt;
  });
  const pinned = sorted.filter((entry) => entry.pinned);
  return [...pinned, ...sorted.filter((entry) => !entry.pinned).slice(0, HISTORY_LIMIT)];
}

async function readHistoryEntries() {
  return trimHistoryEntries(await readAllHistoryEntries());
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
  const pinnedCount = entries.filter((entry) => entry.pinned).length;
  const recentCount = entries.length - pinnedCount;
  historyCount.textContent = pinnedCount ? `★ ${pinnedCount} · ${recentCount}/${HISTORY_LIMIT}` : `${recentCount}/${HISTORY_LIMIT}`;

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

    const actions = document.createElement("div");
    actions.className = "auto1HistoryActions";

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

    const favorite = document.createElement("button");
    favorite.className = `auto1HistoryIconButton${entry.pinned ? " isPinned" : ""}`;
    favorite.type = "button";
    favorite.textContent = entry.pinned ? "★" : "☆";
    favorite.title = t(entry.pinned ? "auto1.historyUnfavorite" : "auto1.historyFavorite");
    favorite.setAttribute("aria-label", favorite.title);
    favorite.addEventListener("click", async () => {
      try {
        await setHistoryFavorite(entry.id, !entry.pinned);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : t("auto1.historyUnavailable"));
      }
    });

    const remove = document.createElement("button");
    remove.className = "auto1HistoryIconButton isDelete";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = t("auto1.historyDelete");
    remove.setAttribute("aria-label", t("auto1.historyDelete"));
    remove.addEventListener("click", async () => {
      try {
        await deleteHistoryEntry(entry.id);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : t("auto1.historyUnavailable"));
      }
    });

    actions.append(download, favorite, remove);
    item.append(info, actions);
    historyList.appendChild(item);
  });
}

async function setHistoryFavorite(id, pinned) {
  const db = await openHistoryDb();
  const transaction = db.transaction(HISTORY_ENTRY_STORE, "readwrite");
  const store = transaction.objectStore(HISTORY_ENTRY_STORE);
  const entry = await historyRequest(store.get(id));
  if (entry) store.put({ ...entry, pinned });
  await historyTransaction(transaction);
  await renderHistory();
}

async function deleteHistoryEntry(id) {
  const db = await openHistoryDb();
  const transaction = db.transaction([HISTORY_ENTRY_STORE, HISTORY_FILE_STORE], "readwrite");
  transaction.objectStore(HISTORY_ENTRY_STORE).delete(id);
  transaction.objectStore(HISTORY_FILE_STORE).delete(id);
  await historyTransaction(transaction);
  await renderHistory();
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
  const existing = await readAllHistoryEntries();
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const entry = { id, name, pageCount, size: blob.size, createdAt: Date.now(), pinned: false };
  const keptEntries = trimHistoryEntries([entry, ...existing]);
  const keptIds = new Set(keptEntries.map((item) => item.id));
  const removeEntries = existing.filter((oldEntry) => !keptIds.has(oldEntry.id));
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
  resultBlob = null;
  resultFileName = "";
  downloadButton.removeAttribute("href");
  downloadButton.classList.add("isDisabled");
  resultPreview.removeAttribute("src");
  resultMeta.textContent = t("auto1.previewEmpty");
}

function isPdf(file) {
  return Boolean(file) && (file.type === "application/pdf" || /\.pdf$/i.test(file.name));
}

function setFile(file, handle = null) {
  if (!file || processing) return;
  resetResult();
  sourceHandle = handle;
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
    resultBlob = outputBlob;
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
// Picking through the handle API keeps a writable reference to the very file
// the operator chose, so the result can take its place on disk.
dropZone.addEventListener("click", async (event) => {
  if (!window.showOpenFilePicker || processing) return;
  event.preventDefault();
  try {
    const [handle] = await window.showOpenFilePicker({ multiple: false, types: [PDF_PICKER_TYPE] });
    setFile(await handle.getFile(), handle);
  } catch (error) {
    if (error?.name === "AbortError") return;
    console.warn("AUTO1 file picker unavailable", error);
    input.click();
  }
});
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  if (!processing) dropZone.classList.add("isDragging");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("isDragging"));
dropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  dropZone.classList.remove("isDragging");
  // dataTransfer is emptied once we await, so read both views up front.
  const dropped = [...event.dataTransfer.files];
  const item = [...(event.dataTransfer.items || [])].find((entry) => entry.kind === "file");
  if (item?.getAsFileSystemHandle) {
    try {
      const handle = await item.getAsFileSystemHandle();
      const file = handle?.kind === "file" ? await handle.getFile() : null;
      if (isPdf(file)) {
        setFile(file, handle);
        return;
      }
    } catch (error) {
      console.warn("AUTO1 dropped file handle unavailable", error);
    }
  }
  setFile(dropped.find(isPdf));
});
processButton.addEventListener("click", processPdf);

async function writeTo(handle) {
  const writable = await handle.createWritable();
  await writable.write(resultBlob);
  await writable.close();
  setStatus(t("auto1.savedOver", { name: handle.name }), 100);
}

async function allowed(handle) {
  const options = { mode: "readwrite" };
  return (await handle.queryPermission(options)) === "granted" || (await handle.requestPermission(options)) === "granted";
}

downloadButton.addEventListener("click", async (event) => {
  event.preventDefault();
  if (!resultBlob) return;
  // Replace the report the operator started from, so one file is left behind.
  if (sourceHandle?.createWritable) {
    try {
      if (await allowed(sourceHandle)) return await writeTo(sourceHandle);
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.warn("AUTO1 could not replace the original file", error);
    }
  }
  if (window.showSaveFilePicker) {
    try {
      return await writeTo(await window.showSaveFilePicker({ suggestedName: resultFileName, types: [PDF_PICKER_TYPE] }));
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.warn("AUTO1 save dialog unavailable", error);
    }
  }
  const link = document.createElement("a");
  link.href = resultUrl;
  link.download = resultFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setStatus(t("auto1.savedCopy"), 100);
});

window.addEventListener("auctionlanguagechange", renderHistory);
renderHistory();
