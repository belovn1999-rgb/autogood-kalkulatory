# AUTOGOOD Server Deployment

This repo contains one server entrypoint for AUTOGOOD browser workflows:

- `GET /mobilede/import?url=...` - imports data from a mobile.de listing.
- `POST /api/partslink24/check-vin` - logs into PartsLink24 and generates VIN specification PDF files.
- `GET /api/partslink24/pdf/:fileName` - downloads generated PartsLink24 PDFs.
- `GET /health` - confirms the server process is running.
- `GET /version` - reports deployed release and build time.

## Start Command

```bash
pnpm install --frozen-lockfile
pnpm run api
```

Default bind:

```text
HOST=127.0.0.1
PORT=8790
```

For production, serve `partslink24.html` from this same API host through a
Cloudflare Named Tunnel and Cloudflare Access. Keep GitHub Pages as test/source
hosting, not as production authentication.

For systemd, use this template:

```text
deploy/systemd/autogood-api.service.example
```

Server install and rollback sequence:

```text
docs/AUTOGOOD_VIN_SERVER_RUNBOOK.md
```

## Required Server Files

Upload the full repo, excluding ignored local/runtime output. These files are required for the API:

- `server/autogood-api.mjs`
- `server/mobilede-import.mjs`
- `server/partslink24-api.mjs`
- `tools/partslink24/download-vin-pdf.mjs`
- `tools/partslink24/brand-routes.json`
- `package.json`
- `pnpm-lock.yaml`

The static pages can also be served from the same process, but the current public frontend remains GitHub Pages.

## Secrets

Create a real env file on the server from:

```text
server/.env.example
```

Do not commit real PartsLink24 credentials.

Required PartsLink24 variables:

```text
PARTSLINK24_COMPANY_ID
PARTSLINK24_USERNAME
PARTSLINK24_PASSWORD
```

Also set `AUTOGOOD_ALLOWED_ORIGINS` to exact production HTTPS hostname.

## Browser Requirement

PartsLink24 and mobile.de browser fallback need Chrome/Chromium or Playwright browsers available on the server.

Preferred production setup:

```bash
pnpm exec playwright install chromium
```

Alternative:

```text
PARTSLINK24_CHROME_PATH=/path/to/google-chrome
MOBILEDE_CHROME_PATH=/path/to/google-chrome
```

## Health Checks

```bash
curl http://127.0.0.1:8790/health
```

Expected:

```json
{
  "ok": true,
  "service": "autogood-api",
  "mobilede": true,
  "partslink24": true
}
```

PartsLink24 check:

```bash
curl -H 'content-type: application/json' \
  --data '{"brand":"BMW","vin":"WBA11EE0705V88373","language":"PL"}' \
  http://127.0.0.1:8790/api/partslink24/check-vin
```

mobile.de check:

```bash
curl 'http://127.0.0.1:8790/mobilede/import?url=https%3A%2F%2Fsuchen.mobile.de%2Ffahrzeuge%2Fdetails.html%3Fid%3D458107986'
```

## Frontend Connection

For temporary testing from GitHub Pages, use:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/partslink24.html?api=https://YOUR-BACKEND-DOMAIN
```

When served from production API host, page uses same-origin API automatically;
no `?api=` parameter is needed.

For mobile.de, update the API base in `src/main.jsx` and rebuild/copy the same value into `src/main.compiled.js`, or keep the current tunnel during local testing.

## Verified PartsLink24 Route Classes

- `general_vin_search` - example: BMW, one PDF.
- `brand_first_search` - example: Peugeot, select brand logo first, one PDF.
- `two_file_print` - examples: Hyundai and Ford, select brand logo first, two PDF files: `vehicle` and `equipment`.

Current `two_file_print` brands:

- Ford
- Hyundai
- Iveco
- Kia
- Nissan
