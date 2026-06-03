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

Docker run:

```bash
docker build -f converter/Dockerfile -t autogood-pdf-converter .
docker run --rm -p 8787:8787 autogood-pdf-converter
```
