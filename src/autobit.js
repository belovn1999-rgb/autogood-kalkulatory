const input = document.querySelector("#pdfInput");
const dropZone = document.querySelector("#dropZone");
const dropTitle = document.querySelector("#dropTitle");
const fileMeta = document.querySelector("#fileMeta");
const progressBar = document.querySelector("#progressBar");
const statusText = document.querySelector("#statusText");

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setFile(file) {
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    dropTitle.textContent = "Please choose a PDF file";
    fileMeta.textContent = "Only PDF files can be prepared for cleanup.";
    statusText.textContent = "The selected file is not a PDF.";
    progressBar.style.width = "0%";
    return;
  }

  dropTitle.textContent = file.name;
  fileMeta.textContent = `${formatBytes(file.size)} — ready for AutoBit cleanup setup`;
  statusText.textContent = "PDF selected. Cleanup rules will be added next.";
  progressBar.style.width = "100%";
}

input.addEventListener("change", (event) => setFile(event.target.files?.[0]));

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
