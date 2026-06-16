(function () {
  const rowsNode = document.querySelector("[data-home-rates]");
  const sourceNode = document.querySelector("[data-home-rates-source]");
  if (!rowsNode) return;

  const formatRate = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: number >= 1 ? 2 : 4,
      maximumFractionDigits: 4,
    }).format(number);
  };

  fetch(`./data/exchange-rates.json?date=${new Date().toISOString().slice(0, 10)}`, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Rates file not available");
      return response.json();
    })
    .then((data) => {
      const keys = ["EUR_PLN", "SEK_PLN", "DKK_PLN"];
      rowsNode.innerHTML = keys
        .map((key) => {
          const item = data.rates?.[key];
          if (!item) return "";
          return `<span>${item.label}</span><b>${formatRate(item.value)} ${item.unit}</b>`;
        })
        .join("");

      if (sourceNode) {
        const date = data.effectiveDate ? `, ${data.effectiveDate}` : "";
        sourceNode.textContent = `źródło: ${data.source || "Walutomat"}${date}`;
      }
    })
    .catch(() => {
      if (sourceNode) sourceNode.textContent = "źródło: Walutomat";
    });
})();
