const declarationForm = document.querySelector("#declarationForm");
const statusEl = document.querySelector("#declarationStatus");
const historyList = document.querySelector("#declarationHistoryList");
const genderChoice = document.querySelector("#clientGenderChoice");
const autogoodFields = document.querySelector("#autogoodFields");
const directFields = document.querySelector("#directFields");
const hintEl = document.querySelector("#declarationHint");
const previewFrame = document.querySelector("#declarationPreview");
const printButton = document.querySelector("#printDeclaration");
const saveButton = document.querySelector("#saveDeclarationPdf");

const historyKey = "autogood-no-plates-declaration-history:v1";
const historyLimit = 5;
const templateUrls = {
  autogood: "./assets/oswiadczenie-brak-tablic-autogood.pdf",
  man: "./assets/oswiadczenie-brak-tablic-klient-pan.pdf",
  woman: "./assets/oswiadczenie-brak-tablic-klient-pani.pdf",
};

let declarationFontBytesPromise;
let previewUrl = "";
let previewTimer;
let previewRequestId = 0;

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function formValue(name) {
  const fields = [...declarationForm.querySelectorAll(`[name="${name}"]`)];
  const visibleField = fields.find((field) => !field.closest("[hidden]")) || fields[0];
  return visibleField?.value?.trim() || "";
}

function formatPolishDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

function declarationType(data = collectData()) {
  if (data.purchaseMode === "autogood") return "AUTOGOOD";
  return data.clientGender === "woman" ? "Klient - Pani" : "Klient - Pan";
}

function updateVariant() {
  const direct = selectedValue("purchaseMode") === "direct";
  genderChoice.hidden = !direct;
  autogoodFields.hidden = direct;
  directFields.hidden = !direct;

  if (!direct) {
    hintEl.textContent = "Wypełnij dane do oświadczenia AUTOGOOD.";
  } else {
    hintEl.textContent = "Wybierz Pan albo Pani i uzupełnij dane właściciela pojazdu.";
  }

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

function readHistory() {
  try {
    const entries = JSON.parse(localStorage.getItem(historyKey) || "[]");
    return Array.isArray(entries) ? entries.slice(0, historyLimit) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  localStorage.setItem(historyKey, JSON.stringify(entries.slice(0, historyLimit)));
}

function historyTitle(entry) {
  const data = entry.data || {};
  return `${declarationType(data)} · ${data.vehicleMakeModel || data.vehicleVin || "AUTO"}`;
}

function historyMeta(entry) {
  const savedAt = new Date(entry.savedAt);
  const saved = Number.isNaN(savedAt.getTime()) ? "" : savedAt.toLocaleDateString("pl-PL");
  return `${dataDate(entry.data)}${saved ? ` · zapisano ${saved}` : ""}`;
}

function dataDate(data = {}) {
  return formatPolishDate(data.purchaseMode === "autogood" ? data.autogoodDate : data.documentDate) || "bez daty";
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

  entries.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    const title = document.createElement("strong");
    title.textContent = historyTitle(entry);
    const meta = document.createElement("span");
    meta.textContent = historyMeta(entry);
    button.append(title, meta);
    button.addEventListener("click", () => {
      applyData(entry.data || {});
      setStatus("Dane z historii zostały wczytane.");
    });
    historyList.append(button);
  });
}

function saveToHistory(data) {
  const signature = JSON.stringify(data);
  const entries = readHistory().filter((entry) => JSON.stringify(entry.data) !== signature);
  entries.unshift({ id: String(Date.now()), savedAt: new Date().toISOString(), data });
  writeHistory(entries);
  renderHistory();
}

function setStatus(message) {
  statusEl.textContent = message;
}

function setBusy(busy) {
  printButton.disabled = busy;
  saveButton.disabled = busy;
}

async function declarationFontBytes() {
  if (!declarationFontBytesPromise) {
    declarationFontBytesPromise = fetch("./assets/Tinos-Regular.ttf").then((response) => {
      if (!response.ok) throw new Error("Nie udało się załadować kroju pisma do PDF.");
      return response.arrayBuffer();
    });
  }
  return declarationFontBytesPromise;
}

function setPdfField(form, name, value, fontSize) {
  const field = form.getTextField(name);
  field.setText(value || "");
  if (fontSize) field.setFontSize(fontSize);
}

function drawTopDate(page, date, { x, y, size, font }) {
  if (!date) return;
  page.drawText(date, { x, y, size, font, color: window.PDFLib.rgb(0, 0, 0) });
}

function replaceClientTopDate(page, date, font) {
  page.drawRectangle({ x: 500, y: 760, width: 55, height: 15, color: window.PDFLib.rgb(1, 1, 1) });
  drawTopDate(page, date, { x: 501, y: 760, size: 10, font });
}

function removeCountryStatement(page, font) {
  page.drawRectangle({ x: 168, y: 401, width: 296, height: 29, color: window.PDFLib.rgb(1, 1, 1) });
  page.drawText("do Polski bez tablic rejestracyjnych.", {
    x: 168.73,
    y: 414.4,
    size: 12,
    font,
    color: window.PDFLib.rgb(0, 0, 0),
  });
}

async function buildPdf(data) {
  if (!window.PDFLib?.PDFDocument || !window.fontkit) {
    throw new Error("Silnik przygotowania PDF nie został załadowany.");
  }

  const type = data.purchaseMode === "autogood" ? "autogood" : data.clientGender;
  const [templateResponse, fontBytes] = await Promise.all([fetch(templateUrls[type]), declarationFontBytes()]);
  if (!templateResponse.ok) throw new Error("Nie udało się załadować szablonu PDF.");

  const { PDFDocument } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(await templateResponse.arrayBuffer());
  pdfDoc.registerFontkit(window.fontkit);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  const form = pdfDoc.getForm();
  const page = pdfDoc.getPages()[0];

  if (type === "autogood") {
    const date = formatPolishDate(data.autogoodDate);
    setPdfField(form, "Data", date, 11);
    setPdfField(form, "Marka i Model", data.vehicleMakeModel, 12);
    setPdfField(form, "VIN", data.vehicleVin, 11);
    form.updateFieldAppearances(font);
    form.flatten();
  } else {
    setPdfField(form, "Miasto", data.city, 10);
    setPdfField(form, "Imię i Nazwisko", data.clientName, 12);
    setPdfField(form, "Dokument tożsamości", data.identityDocument, 10);
    setPdfField(form, "Numer dokumentu", data.identityNumber, 12);
    setPdfField(form, "Marka i Model", data.vehicleMakeModel, 12);
    setPdfField(form, "VIN", data.vehicleVin, 12);
    setPdfField(form, "Data", formatPolishDate(data.importDate), 12);
    setPdfField(form, "Kraj", "", 12);
    form.updateFieldAppearances(font);
    form.flatten();
    replaceClientTopDate(page, formatPolishDate(data.documentDate), font);
    removeCountryStatement(page, font);
  }

  return new Blob([await pdfDoc.save()], { type: "application/pdf" });
}

function schedulePreview() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(updatePreview, 250);
}

async function updatePreview() {
  const requestId = ++previewRequestId;
  try {
    const nextUrl = URL.createObjectURL(await buildPdf(collectData()));
    if (requestId !== previewRequestId) {
      URL.revokeObjectURL(nextUrl);
      return;
    }
    const previousUrl = previewUrl;
    previewUrl = nextUrl;
    previewFrame.src = nextUrl;
    if (previousUrl) URL.revokeObjectURL(previousUrl);
  } catch (error) {
    if (requestId === previewRequestId) {
      setStatus(`Nie udało się odświeżyć podglądu: ${error.message || error}`);
    }
  }
}

function safeFilePart(value) {
  return String(value || "AUTO")
    .replace(/[\\/:*?"<>|]+/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 70) || "AUTO";
}

function pdfFileName(data) {
  const type = declarationType(data).replace(/\s+-\s+/g, "_").replace(/\s+/g, "_");
  return `Oswiadczenie_brak_tablic_${type}_${safeFilePart(data.vehicleVin || data.vehicleMakeModel)}.pdf`;
}

async function savePdf() {
  setBusy(true);
  try {
    setStatus("Przygotowuję PDF...");
    const data = collectData();
    const blob = await buildPdf(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = pdfFileName(data);
    document.body.append(link);
    link.click();
    link.remove();
    saveToHistory(data);
    setStatus("PDF zostało zapisane.");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    setStatus(`Nie udało się zapisać PDF: ${error.message || error}`);
  } finally {
    setBusy(false);
  }
}

async function printPdf() {
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
  document.body.append(frame);
  setBusy(true);
  try {
    setStatus("Przygotowuję PDF do druku...");
    const data = collectData();
    const blob = await buildPdf(data);
    const url = URL.createObjectURL(blob);
    frame.onload = () => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        frame.remove();
      }, 60_000);
    };
    frame.src = url;
    saveToHistory(data);
    setStatus("PDF jest gotowy do druku.");
  } catch (error) {
    frame.remove();
    setStatus(`Nie udało się przygotować druku: ${error.message || error}`);
  } finally {
    setBusy(false);
  }
}

document.querySelectorAll('input[name="purchaseMode"], input[name="clientGender"]').forEach((input) => {
  input.addEventListener("change", updateVariant);
});
declarationForm.addEventListener("input", schedulePreview);
declarationForm.addEventListener("change", schedulePreview);
saveButton.addEventListener("click", savePdf);
printButton.addEventListener("click", printPdf);

updateVariant();
renderHistory();
