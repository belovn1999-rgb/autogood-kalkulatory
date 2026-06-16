# AUTOGOOD DOCX to PDF converter

This service serves the static AUTOGOOD Tools files and exposes:

```text
POST /api/convert-docx-to-pdf
```

Request body: raw DOCX bytes.

Response: generated PDF bytes.

Local run on macOS with LibreOffice installed:

```bash
python3 converter/server.py
```

Then open:

```text
http://127.0.0.1:8787/pdf.html
```

Health check:

```text
http://127.0.0.1:8787/api/health
```

Docker run:

```bash
docker build -f converter/Dockerfile -t autogood-pdf-converter .
docker run --rm -p 8787:8787 autogood-pdf-converter
```

Production:

- deploy the Docker service from this repository;
- keep `HOST=0.0.0.0`;
- set `ALLOWED_ORIGINS=https://belovn1999-rgb.github.io`;
- the app can be opened directly on the deployed service URL, where `/api/convert-docx-to-pdf` works on the same origin;
- if using GitHub Pages as the frontend, set `window.AUTOGOOD_PDF_CONVERTER_URL` in `src/pdf-config.js` to:

```js
window.AUTOGOOD_PDF_CONVERTER_URL = "https://YOUR-CONVERTER-DOMAIN/api/convert-docx-to-pdf";
```
