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

Configuration:

```text
HOST=0.0.0.0
PORT=8787
ALLOWED_ORIGINS=https://belovn1999-rgb.github.io
MAX_UPLOAD_BYTES=15728640
CONVERSION_TIMEOUT_SECONDS=120
SOFFICE_PATH=/custom/path/to/soffice
```

`SOFFICE_PATH` is optional. Use it only when LibreOffice is installed outside
the default system path.

Render deployment:

1. Create a new Blueprint from this repository.
2. Use `render.yaml` from the repository root.
3. Wait until `/api/health` returns `ok: true`.
4. Open the deployed service URL, for example:

```text
https://YOUR-RENDER-SERVICE.onrender.com/pdf.html
```

This is the simplest production mode because the page and the converter API use
the same domain.

GitHub Pages frontend with separate converter:

- deploy the Docker service from this repository;
- keep `HOST=0.0.0.0`;
- set `ALLOWED_ORIGINS=https://belovn1999-rgb.github.io`;
- set `window.AUTOGOOD_PDF_CONVERTER_URL` in `src/pdf-config.js` to:

```js
window.AUTOGOOD_PDF_CONVERTER_URL = "https://YOUR-CONVERTER-DOMAIN/api/convert-docx-to-pdf";
```
