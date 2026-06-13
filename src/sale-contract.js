const saleStorageKey = "autogoodSaleContract.v1";

const form = document.querySelector("#saleContractForm");
const fields = [...form.querySelectorAll("input[name], select[name], textarea[name]")];
const saveButton = document.querySelector("#saveSaleContract");
const exportButton = document.querySelector("#exportSaleContract");
const generateButton = document.querySelector("#generateSaleDocx");

function collectSaleContract() {
  const data = {};
  fields.forEach((field) => {
    data[field.name] = field.value;
  });
  data.updatedAt = new Date().toISOString();
  return data;
}

function applySaleContract(data) {
  fields.forEach((field) => {
    if (data[field.name] !== undefined) field.value = data[field.name];
  });
  updateSummary();
}

function valueOrFallback(value) {
  return String(value || "").trim() || "Nie wskazano";
}

function updateSummary() {
  const data = collectSaleContract();
  document.querySelector("#saleSummaryBuyer").textContent = valueOrFallback(data.buyerName);
  document.querySelector("#saleSummaryVehicle").textContent = valueOrFallback(data.vehicleMakeModel);
  document.querySelector("#saleSummaryVin").textContent = valueOrFallback(data.vehicleVin);
  const price = [data.salePrice, data.saleCurrency].filter(Boolean).join(" ");
  document.querySelector("#saleSummaryPrice").textContent = valueOrFallback(price);
}

function saveSaleContract() {
  localStorage.setItem(saleStorageKey, JSON.stringify(collectSaleContract(), null, 2));
  saveButton.textContent = "Сохранено";
  window.setTimeout(() => {
    saveButton.textContent = "Сохранить";
  }, 1200);
}

function exportSaleContract() {
  const data = collectSaleContract();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filenameSeed = data.vehicleVin || data.vehicleMakeModel || data.buyerName || "umowa-sprzedazy";
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenameSeed.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function loadSavedSaleContract() {
  const saved = localStorage.getItem(saleStorageKey);
  if (!saved) return;
  try {
    applySaleContract(JSON.parse(saved));
  } catch {
    localStorage.removeItem(saleStorageKey);
  }
}

fields.forEach((field) => {
  field.addEventListener("input", updateSummary);
  field.addEventListener("change", updateSummary);
});

saveButton.addEventListener("click", saveSaleContract);
exportButton.addEventListener("click", exportSaleContract);
generateButton.addEventListener("click", () => {
  window.alert("DOCX będzie dostępny po dodaniu pustego szablonu Word dla umowy sprzedaży.");
});

loadSavedSaleContract();
updateSummary();
