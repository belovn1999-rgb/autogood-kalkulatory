const storageKey = "autogoodDealDesk.v1";
const form = document.querySelector("#dealForm");
const saveButton = document.querySelector("#saveDeal");
const exportButton = document.querySelector("#exportDeal");
const printButton = document.querySelector("#printDeal");
const taskInputs = [...document.querySelectorAll("input[name='task']")];

const fields = [
  ...form.querySelectorAll("input, select, textarea"),
];

function numberValue(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function collectDeal() {
  const deal = {};
  fields.forEach((field) => {
    deal[field.name] = field.value;
  });
  deal.tasks = taskInputs
    .filter((input) => input.checked)
    .map((input) => input.value);
  deal.updatedAt = new Date().toISOString();
  return deal;
}

function applyDeal(deal) {
  fields.forEach((field) => {
    if (deal[field.name] !== undefined) field.value = deal[field.name];
  });
  taskInputs.forEach((input) => {
    input.checked = Array.isArray(deal.tasks) && deal.tasks.includes(input.value);
  });
  updateSummary();
}

function calculate(deal) {
  const eurRate = numberValue(deal.eurRate) || 4.26;
  const carCost = numberValue(deal.carPriceEur) * eurRate;
  const transport = numberValue(deal.transportPln);
  const costs = numberValue(deal.costsPln);
  const commission = numberValue(deal.commissionPln);
  const salePrice = numberValue(deal.salePricePln) || numberValue(deal.targetPrice);
  const totalCost = carCost + transport + costs + commission;
  const margin = salePrice ? salePrice - totalCost : 0;
  return { totalCost, margin };
}

function updateSummary() {
  const deal = collectDeal();
  const { totalCost, margin } = calculate(deal);
  document.querySelector("#summaryStatus").textContent = deal.status || "Новый запрос";
  document.querySelector("#summaryCar").textContent = deal.carModel || "Не указано";
  document.querySelector("#summaryClient").textContent = deal.clientName || "Не указано";
  document.querySelector("#summaryCost").textContent = money(totalCost);
  document.querySelector("#summaryMargin").textContent = money(margin);
  document.querySelector("#summaryMargin").classList.toggle("isNegative", margin < 0);
}

function saveDeal() {
  localStorage.setItem(storageKey, JSON.stringify(collectDeal(), null, 2));
  saveButton.textContent = "Сохранено";
  window.setTimeout(() => {
    saveButton.textContent = "Сохранить";
  }, 1200);
}

function exportDeal() {
  const deal = collectDeal();
  const blob = new Blob([JSON.stringify(deal, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filenameSeed = deal.vin || deal.carModel || deal.clientName || "autogood-deal";
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenameSeed.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function loadSavedDeal() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;
  try {
    applyDeal(JSON.parse(saved));
  } catch {
    localStorage.removeItem(storageKey);
  }
}

fields.forEach((field) => {
  field.addEventListener("input", updateSummary);
  field.addEventListener("change", updateSummary);
});

taskInputs.forEach((input) => {
  input.addEventListener("change", saveDeal);
});

saveButton.addEventListener("click", saveDeal);
exportButton.addEventListener("click", exportDeal);
printButton.addEventListener("click", () => window.print());

loadSavedDeal();
updateSummary();
