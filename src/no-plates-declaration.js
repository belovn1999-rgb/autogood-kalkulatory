const declarationForm = document.querySelector("#declarationForm");
const toastEl = document.querySelector("#declarationToast");
const historyList = document.querySelector("#declarationHistoryList");
const genderChoice = document.querySelector("#clientGenderChoice");
const autogoodFields = document.querySelector("#autogoodFields");
const directFields = document.querySelector("#directFields");
const hintEl = document.querySelector("#declarationHint");
const previewCard = document.querySelector("#declarationPreviewCard");
const previewFrame = document.querySelector("#declarationPreview");
const resetButton = document.querySelector("#resetDeclaration");
const resetDialog = document.querySelector("#resetDeclarationDialog");
const saveDataButton = document.querySelector("#saveDeclarationData");
const printButton = document.querySelector("#printDeclaration");
const downloadButton = document.querySelector("#downloadDeclarationPdf");

const historyKey = "autogood-no-plates-declaration-history:v1";
const draftKey = "autogood-no-plates-declaration-draft:v1";
const historyLimit = 5;
const templateUrls = {
  autogood: "./assets/oswiadczenie-brak-tablic-autogood.pdf",
  man: "./assets/oswiadczenie-brak-tablic-klient-pan.pdf",
  woman: "./assets/oswiadczenie-brak-tablic-klient-pani.pdf",
};

/* The generator only ever touches these AcroForm fields. If a template is
   re-exported and a field is renamed, we want a named error up front instead
   of a silently half-filled declaration. */
const templateFields = {
  autogood: ["Data", "Marka i Model", "VIN"],
  client: [
    "Miasto",
    "Data",
    "Imię i Nazwisko",
    "Dokument tożsamości",
    "Numer dokumentu",
    "Marka i Model",
    "VIN",
    "Kraj",
  ],
};

/* Both client templates carry one "Data" field with two widgets — the header
   line and the body line — so the header has to be repainted by hand to hold
   a different date. Coordinates are in PDF points from the bottom-left. */
const clientTopDatePatch = {
  cover: { x: 500, y: 758, width: 55, height: 19 },
  rule: { x: 500.205, y: 759.101, width: 52.765, thickness: 0.65 },
  text: { y: 763, size: 10 },
};

/* The template reads "sprowadzony z <Kraj> do Polski"; AUTOGOOD issues it
   without naming the country, so the sentence is repainted in one piece. */
const clientCountryPatch = {
  cover: { x: 168, y: 401, width: 296, height: 29 },
  text: { x: 168.73, y: 414.4, size: 12, value: "do Polski bez tablic rejestracyjnych." },
};

const preferredFontSizes = {
  autogoodDate: 11,
  autogoodMakeModel: 12,
  autogoodVin: 11,
  city: 10,
  clientName: 12,
  identityDocument: 10,
  identityNumber: 12,
  makeModel: 12,
  vin: 12,
  importDate: 12,
};

const fieldTextPadding = 2;
const minFieldFontSize = 6;
const fontSizeStep = 0.25;
/* Below this the value still fits, but it is small enough on paper to be worth
   telling the user about. */
const tightFontSize = 8;

const requiredFields = {
  autogood: [
    ["autogoodDate", "Data oświadczenia"],
    ["vehicleMakeModel", "Marka i model"],
    ["vehicleVin", "VIN"],
  ],
  direct: [
    ["city", "Miejscowość"],
    ["documentDate", "Data oświadczenia"],
    ["clientName", "Imię i nazwisko"],
    ["identityDocument", "Dokument tożsamości"],
    ["identityNumber", "Numer dokumentu"],
    ["vehicleMakeModel", "Marka i model"],
    ["vehicleVin", "VIN"],
    ["importDate", "Data sprowadzenia pojazdu"],
  ],
};

/* Values the two purchase variants have in common, carried across when the
   user switches so nothing has to be typed twice. */
const sharedFieldNames = ["vehicleMakeModel", "vehicleVin"];

let declarationFontBytesPromise;
const templateBytesPromises = new Map();
let previewUrl = "";
let previewTimer;
let previewRequestId = 0;
let toastTimer;
let engineReady = false;

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* Nothing to clean up when storage is unavailable. */
  }
}

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function visibleField(name) {
  const fields = [...declarationForm.querySelectorAll(`[name="${name}"]`)];
  return fields.find((field) => !field.closest("[hidden]")) || fields[0] || null;
}

function formValue(name) {
  return visibleField(name)?.value?.trim() || "";
}

function formatPolishDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

function todayValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function declarationType(data = collectData()) {
  if (data.purchaseMode === "autogood") return "AUTOGOOD";
  return data.clientGender === "woman" ? "Klient - Pani" : "Klient - Pan";
}

function carrySharedValues() {
  sharedFieldNames.forEach((name) => {
    const source = [...declarationForm.querySelectorAll(`[name="${name}"]`)].find(
      (field) => field.closest("[hidden]") && field.value.trim(),
    );
    const target = visibleField(name);
    if (source && target && !target.value.trim()) target.value = source.value;
  });
}

function updateVariant() {
  const direct = selectedValue("purchaseMode") === "direct";
  genderChoice.hidden = !direct;
  autogoodFields.hidden = direct;
  directFields.hidden = !direct;
  carrySharedValues();

  hintEl.textContent = direct
    ? "Wybierz Pan albo Pani i uzupełnij dane właściciela pojazdu."
    : "Wypełnij dane do oświadczenia AUTOGOOD.";

  clearValidation();
  schedulePreview();
}

function collectData() {
  return {
    purchaseMode: selectedValue("purchaseMode") || "autogood",
    clientGender: selectedValue("clientGender") || "man",
    autogoodDate: formValue("autogoodDate"),
    city: formValue("city"),
    documentDate: formValue("documentDate"),
    clientName: formValue("clientName"),
    identityDocument: formValue("identityDocument"),
    identityNumber: formValue("identityNumber"),
    vehicleMakeModel: formValue("vehicleMakeModel"),
    vehicleVin: formValue("vehicleVin"),
    importDate: formValue("importDate"),
  };
}

function applyData(data) {
  const mode = data.purchaseMode === "direct" ? "direct" : "autogood";
  const gender = data.clientGender === "woman" ? "woman" : "man";
  document.querySelector(`input[name="purchaseMode"][value="${mode}"]`).checked = true;
  document.querySelector(`input[name="clientGender"][value="${gender}"]`).checked = true;
  Object.entries(data).forEach(([name, value]) => {
    if (name === "purchaseMode" || name === "clientGender") return;
    declarationForm.querySelectorAll(`[name="${name}"]`).forEach((field) => {
      field.value = value || "";
    });
  });
  updateVariant();
}

/* --- VIN --------------------------------------------------------------- */

function normalizeVin(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function vinWarning(vin) {
  if (!vin) return "";
  if (/[IOQ]/.test(vin)) return "VIN zwykle nie zawiera liter I, O ani Q — sprawdź numer.";
  if (vin.length !== 17) return `VIN ma ${vin.length} znaków zamiast 17 — sprawdź numer.`;
  return "";
}

/* --- Field notes and validation ---------------------------------------- */

function fieldNote(input, className) {
  const wrapper = input?.closest(".field");
  if (!wrapper) return null;
  let note = wrapper.querySelector(`.${className}`);
  if (!note) {
    note = document.createElement("span");
    note.className = className;
    wrapper.append(note);
  }
  return note;
}

function setFieldNote(name, className, message) {
  const note = fieldNote(visibleField(name), className);
  if (!note) return;
  note.textContent = message;
  note.hidden = !message;
}

function clearValidation() {
  declarationForm.querySelectorAll(".field--invalid").forEach((field) => {
    field.classList.remove("field--invalid");
  });
  declarationForm.querySelectorAll(".field-error").forEach((note) => {
    note.textContent = "";
    note.hidden = true;
  });
}

function markMissing(names) {
  clearValidation();
  names.forEach((name) => {
    const input = visibleField(name);
    input?.closest(".field")?.classList.add("field--invalid");
    setFieldNote(name, "field-error", "To pole jest wymagane.");
  });
}

function missingRequired(data) {
  const mode = data.purchaseMode === "direct" ? "direct" : "autogood";
  return requiredFields[mode].filter(([name]) => !data[name]);
}

function ensureComplete(data) {
  const missing = missingRequired(data);
  if (!missing.length) {
    clearValidation();
    return true;
  }
  markMissing(missing.map(([name]) => name));
  const labels = missing.map(([, label]) => label).join(", ");
  setStatus(`Uzupełnij wymagane pola: ${labels}.`, "error");
  visibleField(missing[0][0])?.focus();
  return false;
}

/* --- PDF --------------------------------------------------------------- */

function textWidth(font, text, size) {
  try {
    return font.widthOfTextAtSize(text, size);
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function widgetWidth(field) {
  const widths = field.acroField.getWidgets().map((widget) => widget.getRectangle().width);
  return widths.length ? Math.min(...widths) : 0;
}

/* AcroForm widgets clip whatever does not fit, which silently truncated long
   model names on both ends. Shrink until the string fits the narrowest widget. */
function fitFontSize(font, text, maxWidth, preferred) {
  const available = maxWidth - fieldTextPadding * 2;
  if (!text || available <= 0) return preferred;
  let steps = 0;
  const maxSteps = Math.ceil((preferred - minFieldFontSize) / fontSizeStep);
  while (steps < maxSteps && textWidth(font, text, preferred - steps * fontSizeStep) > available) {
    steps += 1;
  }
  return Math.max(minFieldFontSize, preferred - steps * fontSizeStep);
}

function setPdfField(context, pdfName, value, preferred, noteKey) {
  const field = context.form.getTextField(pdfName);
  const text = value || "";
  const size = fitFontSize(context.font, text, widgetWidth(field), preferred);
  field.setText(text);
  field.setFontSize(size);
  /* A quarter-point nudge happens on ordinary values (a 17-character VIN, for
     one) and is not worth a note; only a real shrink is reported to the form. */
  if (noteKey && size <= preferred - 1) context.shrunk[noteKey] = size;
}

function assertTemplateFields(form, expected, templateUrl) {
  const present = new Set(form.getFields().map((field) => field.getName()));
  const missing = expected.filter((name) => !present.has(name));
  if (missing.length) {
    throw new Error(`Szablon ${templateUrl} nie ma pól: ${missing.join(", ")}.`);
  }
}

async function declarationFontBytes() {
  if (!declarationFontBytesPromise) {
    declarationFontBytesPromise = fetch("./assets/Tinos-Regular.ttf")
      .then((response) => {
        if (!response.ok) throw new Error("Nie udało się załadować kroju pisma do PDF.");
        return response.arrayBuffer();
      })
      .catch((error) => {
        declarationFontBytesPromise = undefined;
        throw error;
      });
  }
  return declarationFontBytesPromise;
}

/* Templates are ~600 kB each and the preview rebuilds on every keystroke, so
   the bytes are kept in memory and only the copy handed to pdf-lib is fresh. */
async function templateBytes(url) {
  if (!templateBytesPromises.has(url)) {
    const promise = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Nie udało się załadować szablonu PDF.");
        return response.arrayBuffer();
      })
      .catch((error) => {
        templateBytesPromises.delete(url);
        throw error;
      });
    templateBytesPromises.set(url, promise);
  }
  return (await templateBytesPromises.get(url)).slice(0);
}

function drawPatchedText(page, text, { x, y, size, font }) {
  if (!text) return;
  page.drawText(text, { x, y, size, font, color: window.PDFLib.rgb(0, 0, 0) });
}

function replaceClientTopDate(page, date, font) {
  const { cover, rule, text } = clientTopDatePatch;
  page.drawRectangle({ ...cover, color: window.PDFLib.rgb(1, 1, 1) });
  page.drawLine({
    start: { x: rule.x, y: rule.y },
    end: { x: rule.x + rule.width, y: rule.y },
    thickness: rule.thickness,
    color: window.PDFLib.rgb(0, 0, 0),
  });
  if (!date) return;
  const centeredX = rule.x + Math.max(0, (rule.width - textWidth(font, date, text.size)) / 2);
  drawPatchedText(page, date, { x: centeredX, y: text.y, size: text.size, font });
}

function removeCountryStatement(page, font) {
  const { cover, text } = clientCountryPatch;
  page.drawRectangle({ ...cover, color: window.PDFLib.rgb(1, 1, 1) });
  drawPatchedText(page, text.value, { x: text.x, y: text.y, size: text.size, font });
}

async function buildPdf(data) {
  if (!window.PDFLib?.PDFDocument || !window.fontkit) {
    throw new Error("Silnik przygotowania PDF nie został załadowany.");
  }

  const variant = data.purchaseMode === "autogood" ? "autogood" : data.clientGender;
  const templateUrl = templateUrls[variant];
  const [bytes, fontBytes] = await Promise.all([templateBytes(templateUrl), declarationFontBytes()]);

  const { PDFDocument } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(bytes);
  pdfDoc.registerFontkit(window.fontkit);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  const form = pdfDoc.getForm();
  const page = pdfDoc.getPages()[0];
  const context = { form, font, shrunk: {} };

  if (variant === "autogood") {
    assertTemplateFields(form, templateFields.autogood, templateUrl);
    setPdfField(context, "Data", formatPolishDate(data.autogoodDate), preferredFontSizes.autogoodDate);
    setPdfField(context, "Marka i Model", data.vehicleMakeModel, preferredFontSizes.autogoodMakeModel, "vehicleMakeModel");
    setPdfField(context, "VIN", data.vehicleVin, preferredFontSizes.autogoodVin, "vehicleVin");
    form.updateFieldAppearances(font);
    form.flatten();
  } else {
    assertTemplateFields(form, templateFields.client, templateUrl);
    setPdfField(context, "Miasto", data.city, preferredFontSizes.city);
    setPdfField(context, "Imię i Nazwisko", data.clientName, preferredFontSizes.clientName, "clientName");
    setPdfField(context, "Dokument tożsamości", data.identityDocument, preferredFontSizes.identityDocument);
    setPdfField(context, "Numer dokumentu", data.identityNumber, preferredFontSizes.identityNumber);
    setPdfField(context, "Marka i Model", data.vehicleMakeModel, preferredFontSizes.makeModel, "vehicleMakeModel");
    setPdfField(context, "VIN", data.vehicleVin, preferredFontSizes.vin, "vehicleVin");
    setPdfField(context, "Data", formatPolishDate(data.importDate), preferredFontSizes.importDate);
    setPdfField(context, "Kraj", "", preferredFontSizes.importDate);
    form.updateFieldAppearances(font);
    form.flatten();
    replaceClientTopDate(page, formatPolishDate(data.documentDate), font);
    removeCountryStatement(page, font);
  }

  return {
    blob: new Blob([await pdfDoc.save()], { type: "application/pdf" }),
    shrunk: context.shrunk,
  };
}

/* --- Preview ------------------------------------------------------------ */

function renderShrinkNotes(shrunk) {
  ["clientName", "vehicleMakeModel", "vehicleVin"].forEach((name) => {
    const note = fieldNote(visibleField(name), "field-hint-note");
    if (!note) return;
    const size = shrunk[name];
    if (!size) {
      note.textContent = "";
      note.hidden = true;
      delete note.dataset.tone;
      return;
    }
    const pretty = String(size).replace(".", ",");
    const tight = size <= tightFontSize;
    note.textContent = tight
      ? `Tekst zmniejszony do ${pretty} pt — na wydruku będzie bardzo drobny, rozważ krótszy zapis.`
      : `Tekst zmniejszony do ${pretty} pt, żeby zmieścił się w formularzu.`;
    note.dataset.tone = tight ? "warn" : "";
    note.hidden = false;
  });
}

function schedulePreview() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(updatePreview, 250);
}

async function updatePreview() {
  if (!engineReady) return;
  const requestId = ++previewRequestId;
  previewCard.dataset.loading = "true";
  try {
    const { blob, shrunk } = await buildPdf(collectData());
    const nextUrl = URL.createObjectURL(blob);
    if (requestId !== previewRequestId) {
      URL.revokeObjectURL(nextUrl);
      return;
    }
    const previousUrl = previewUrl;
    previewUrl = nextUrl;
    /* Without the viewer parameters Chrome restores its own zoom and opens the
       thumbnail rail, which left the preview at 14% and unreadable. */
    previewFrame.src = `${nextUrl}#toolbar=0&navpanes=0&view=Fit`;
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    renderShrinkNotes(shrunk);
  } catch (error) {
    if (requestId === previewRequestId) {
      setStatus(`Nie udało się odświeżyć podglądu: ${error.message || error}`, "error");
    }
  } finally {
    if (requestId === previewRequestId) delete previewCard.dataset.loading;
  }
}

/* --- History and draft -------------------------------------------------- */

function readHistory() {
  try {
    const entries = JSON.parse(storageGet(historyKey) || "[]");
    return Array.isArray(entries) ? entries.slice(0, historyLimit) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  return storageSet(historyKey, JSON.stringify(entries.slice(0, historyLimit)));
}

function historyTitle(entry) {
  const data = entry.data || {};
  return `${declarationType(data)} · ${data.vehicleMakeModel || data.vehicleVin || "AUTO"}`;
}

function dataDate(data = {}) {
  return formatPolishDate(data.purchaseMode === "autogood" ? data.autogoodDate : data.documentDate) || "bez daty";
}

function historyMeta(entry) {
  const savedAt = new Date(entry.savedAt);
  const saved = Number.isNaN(savedAt.getTime()) ? "" : savedAt.toLocaleDateString("pl-PL");
  return `${dataDate(entry.data)}${saved ? ` · zapisano ${saved}` : ""}`;
}

function renderHistory() {
  historyList.innerHTML = "";
  const entries = readHistory();
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "Tutaj pojawi się 5 ostatnich zapisów.";
    historyList.append(empty);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement("div");
    item.className = "history-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-restore";
    const title = document.createElement("strong");
    title.textContent = historyTitle(entry);
    const meta = document.createElement("span");
    meta.textContent = historyMeta(entry);
    button.append(title, meta);
    button.addEventListener("click", () => {
      applyData(entry.data || {});
      saveDraft();
      setStatus("Dane z historii zostały wczytane.", "ok");
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "history-delete";
    remove.setAttribute("aria-label", "Usuń zapis z historii");
    remove.title = "Usuń z historii";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      const kept = entries.filter((candidate, candidateIndex) =>
        entry.id ? candidate.id !== entry.id : candidateIndex !== index,
      );
      if (writeHistory(kept)) {
        renderHistory();
        setStatus("Zapis usunięty z historii.", "ok");
      } else {
        setStatus(storageErrorMessage, "error");
      }
    });

    item.append(button, remove);
    historyList.append(item);
  });
}

const storageErrorMessage =
  "Przeglądarka zablokowała zapis danych (tryb prywatny lub brak miejsca). Pobierz PDF, żeby nic nie stracić.";

function saveToHistory(data) {
  const signature = JSON.stringify(data);
  const entries = readHistory().filter((entry) => JSON.stringify(entry.data) !== signature);
  entries.unshift({ id: String(Date.now()), savedAt: new Date().toISOString(), data });
  if (!writeHistory(entries)) return false;
  renderHistory();
  return true;
}

function saveDraft() {
  storageSet(draftKey, JSON.stringify(collectData()));
}

function readDraft() {
  try {
    const draft = JSON.parse(storageGet(draftKey) || "null");
    return draft && typeof draft === "object" ? draft : null;
  } catch {
    return null;
  }
}

/* --- Status ------------------------------------------------------------- */

function setStatus(message, tone = "") {
  window.clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.dataset.tone = tone;
  toastEl.hidden = !message;
  if (!message) return;
  toastTimer = window.setTimeout(
    () => {
      toastEl.hidden = true;
    },
    tone === "error" ? 12_000 : 6_000,
  );
}

function setBusy(busy) {
  [resetButton, saveDataButton, printButton, downloadButton].forEach((button) => {
    button.disabled = busy;
  });
}

/* --- Actions ------------------------------------------------------------ */

function safeFilePart(value) {
  return (
    String(value || "AUTO")
      .replace(/[\\/:*?"<>|]+/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 70) || "AUTO"
  );
}

function pdfFileName(data) {
  const type = declarationType(data).replace(/\s+-\s+/g, "_").replace(/\s+/g, "_");
  return `Oswiadczenie_brak_tablic_${type}_${safeFilePart(data.vehicleVin || data.vehicleMakeModel)}.pdf`;
}

function saveData() {
  const data = collectData();
  if (!ensureComplete(data)) return;
  if (saveToHistory(data)) setStatus("Dane zostały zapisane w historii.", "ok");
  else setStatus(storageErrorMessage, "error");
}

function resetData() {
  declarationForm.reset();
  clearValidation();
  renderShrinkNotes({});
  setFieldNote("vehicleVin", "field-warning-note", "");
  storageRemove(draftKey);
  applyDefaultDates();
  updateVariant();
  setStatus("Bieżące dane zostały wyzerowane.", "ok");
}

function requestReset() {
  if (typeof resetDialog?.showModal !== "function") {
    resetData();
    return;
  }
  resetDialog.returnValue = "";
  resetDialog.showModal();
}

async function downloadPdf() {
  const data = collectData();
  if (!ensureComplete(data)) return;
  setBusy(true);
  try {
    setStatus("Przygotowuję PDF...");
    const { blob } = await buildPdf(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = pdfFileName(data);
    document.body.append(link);
    link.click();
    link.remove();
    setStatus("PDF został pobrany.", "ok");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    setStatus(`Nie udało się pobrać PDF: ${error.message || error}`, "error");
  } finally {
    setBusy(false);
  }
}

/* Firefox and Safari routinely ignore print() on a hidden blob iframe, so they
   get the PDF in a real tab instead of a dialog that never opens. */
function usesHiddenFramePrint() {
  const ua = navigator.userAgent;
  const isFirefox = /firefox|fxios/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/chrome|chromium|crios|edg|opr/i.test(ua);
  return !isFirefox && !isSafari;
}

function printInNewTab(url) {
  const opened = window.open(url, "_blank", "noopener");
  if (opened) {
    setStatus("PDF otworzył się w nowej karcie — wydrukuj go skrótem Ctrl/⌘ + P.", "ok");
  } else {
    setStatus("Przeglądarka zablokowała nowe okno. Użyj przycisku „Pobierz PDF” i wydrukuj plik.", "error");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function printInHiddenFrame(url) {
  const frame = document.createElement("iframe");
  Object.assign(frame.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
  });

  let settled = false;
  const fallbackTimer = window.setTimeout(() => {
    if (settled) return;
    settled = true;
    frame.remove();
    printInNewTab(url);
  }, 5000);

  frame.onload = () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(fallbackTimer);
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setStatus("Otworzyłem okno drukowania.", "ok");
    } catch {
      frame.remove();
      printInNewTab(url);
      return;
    }
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      frame.remove();
    }, 60_000);
  };

  document.body.append(frame);
  frame.src = url;
}

async function printPdf() {
  const data = collectData();
  if (!ensureComplete(data)) return;
  setBusy(true);
  try {
    setStatus("Przygotowuję PDF do druku...");
    const { blob } = await buildPdf(data);
    const url = URL.createObjectURL(blob);
    if (usesHiddenFramePrint()) printInHiddenFrame(url);
    else printInNewTab(url);
  } catch (error) {
    setStatus(`Nie udało się przygotować druku: ${error.message || error}`, "error");
  } finally {
    setBusy(false);
  }
}

/* --- Wiring ------------------------------------------------------------- */

function applyDefaultDates() {
  const today = todayValue();
  ["autogoodDate", "documentDate"].forEach((name) => {
    declarationForm.querySelectorAll(`[name="${name}"]`).forEach((field) => {
      if (!field.value) field.value = today;
    });
  });
}

function handleVinBlur(input) {
  const normalized = normalizeVin(input.value);
  if (normalized !== input.value) {
    input.value = normalized;
    schedulePreview();
    saveDraft();
  }
  setFieldNote("vehicleVin", "field-warning-note", vinWarning(normalized));
}

/* A form with no submit button still submits on Enter in Firefox, which would
   reload the page and drop everything typed so far. */
declarationForm.addEventListener("submit", (event) => event.preventDefault());

document.querySelectorAll('input[name="purchaseMode"], input[name="clientGender"]').forEach((input) => {
  input.addEventListener("change", updateVariant);
});

declarationForm.addEventListener("input", (event) => {
  event.target.closest(".field")?.classList.remove("field--invalid");
  const note = event.target.closest(".field")?.querySelector(".field-error");
  if (note) {
    note.textContent = "";
    note.hidden = true;
  }
  schedulePreview();
  saveDraft();
});

declarationForm.addEventListener("change", () => {
  schedulePreview();
  saveDraft();
});

declarationForm.addEventListener(
  "blur",
  (event) => {
    if (event.target.name === "vehicleVin") handleVinBlur(event.target);
  },
  true,
);

resetButton.addEventListener("click", requestReset);
resetDialog?.addEventListener("close", () => {
  if (resetDialog.returnValue === "reset") resetData();
});
resetDialog?.querySelectorAll("[data-reset-cancel]").forEach((button) => {
  button.addEventListener("click", () => resetDialog.close(""));
});
saveDataButton.addEventListener("click", saveData);
downloadButton.addEventListener("click", downloadPdf);
printButton.addEventListener("click", printPdf);

function init() {
  const draft = readDraft();
  if (draft) applyData(draft);
  applyDefaultDates();
  updateVariant();
  renderHistory();
  setFieldNote("vehicleVin", "field-warning-note", vinWarning(formValue("vehicleVin")));

  if (!window.PDFLib?.PDFDocument || !window.fontkit) {
    setBusy(true);
    previewCard.dataset.engine = "missing";
    setStatus("Nie udało się wczytać silnika PDF. Odśwież stronę — bez niego podgląd i pobieranie nie zadziałają.", "error");
    return;
  }

  engineReady = true;
  schedulePreview();
}

init();
