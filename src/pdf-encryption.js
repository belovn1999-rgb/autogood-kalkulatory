(() => {
  function encodePassword(password) {
    const bytes = new TextEncoder().encode(password);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function requestPassword() {
    const dialog = document.querySelector("#pdfEncryptionDialog");
    const form = dialog?.querySelector("form");
    const passwordInput = document.querySelector("#pdfPassword");
    const confirmInput = document.querySelector("#pdfPasswordConfirm");
    const error = document.querySelector("#pdfPasswordError");
    if (!dialog || !form || !passwordInput || !confirmInput || !error) {
      return Promise.reject(new Error("Okno hasła nie jest dostępne."));
    }

    passwordInput.value = "";
    confirmInput.value = "";
    error.textContent = "";

    return new Promise((resolve) => {
      let settled = false;

      const finish = (password) => {
        if (settled) return;
        settled = true;
        form.removeEventListener("submit", handleSubmit);
        dialog.removeEventListener("cancel", handleCancel);
        dialog.removeEventListener("close", handleClose);
        dialog.querySelectorAll("[data-password-cancel]").forEach((button) => {
          button.removeEventListener("click", handleCancelClick);
        });
        passwordInput.value = "";
        confirmInput.value = "";
        resolve(password);
      };

      const handleSubmit = (event) => {
        event.preventDefault();
        const password = passwordInput.value;
        if (!password) {
          error.textContent = "Wpisz hasło.";
          passwordInput.focus();
          return;
        }
        if (password !== confirmInput.value) {
          error.textContent = "Hasła nie są takie same.";
          confirmInput.focus();
          return;
        }
        dialog.close("confirm");
        finish(password);
      };

      const handleCancel = (event) => {
        event.preventDefault();
        dialog.close("cancel");
        finish(null);
      };

      const handleCancelClick = () => handleCancel(new Event("cancel", { cancelable: true }));
      const handleClose = () => finish(null);

      form.addEventListener("submit", handleSubmit);
      dialog.addEventListener("cancel", handleCancel);
      dialog.addEventListener("close", handleClose);
      dialog.querySelectorAll("[data-password-cancel]").forEach((button) => {
        button.addEventListener("click", handleCancelClick);
      });
      dialog.showModal();
      passwordInput.focus();
    });
  }

  window.AUTOGOOD_PDF_ENCRYPTION = {
    encodePassword,
    requestPassword,
  };
})();
