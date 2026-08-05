# AUTOGOOD VIN: server runbook

This runbook deploys VIN to PDF separately from CRM. Do not change CRM files,
database, containers, ports, or services.

## Target layout

```text
Browser -> Cloudflare Access -> Named Tunnel -> 127.0.0.1:8790 AUTOGOOD VIN API
```

```text
/opt/autogood-vin/app       exact Git release
/opt/autogood-vin/output    generated PDF files
/opt/autogood-vin/profiles  Playwright profiles
/etc/autogood-vin/          secrets and tunnel token
```

## Before maintenance window

1. Record CRM service status and listen ports.
2. Confirm Linux server has 2 CPU, 4 GB RAM, 20 GB free disk, outbound TCP 443
   and outbound TCP/UDP 7844 for Cloudflare Tunnel.
3. Create DNS hostname, for example `vin.example.com`, in Cloudflare.
4. Create Cloudflare Zero Trust Access application for this hostname. Allow only
   approved staff email addresses. Do not expose VIN API anonymously.
5. Create Named Tunnel in Cloudflare dashboard. Configure public hostname to
   forward to `http://127.0.0.1:8790`. Copy token only into server secret file.
6. Pick release commit or Git tag. Do not deploy an uncommitted working tree.

## Installation window

Run as server administrator. Commands change only `/opt/autogood-vin`,
`/etc/autogood-vin`, and two new systemd units.

```bash
sudo useradd --system --create-home --home-dir /opt/autogood-vin --shell /usr/sbin/nologin autogood-vin
sudo install -d -o autogood-vin -g autogood-vin -m 750 /opt/autogood-vin/output /opt/autogood-vin/profiles
sudo install -d -o root -g autogood-vin -m 750 /etc/autogood-vin
sudo -u autogood-vin git clone https://github.com/belovn1999-rgb/autogood-kalkulatory.git /opt/autogood-vin/app
sudo -u autogood-vin git -C /opt/autogood-vin/app checkout <RELEASE_TAG_OR_COMMIT>
```

Install Node.js 22 and `pnpm` 11.9.0 using server-approved package source. Then:

```bash
sudo -u autogood-vin sh -lc 'cd /opt/autogood-vin/app && pnpm install --frozen-lockfile'
sudo -u autogood-vin sh -lc 'cd /opt/autogood-vin/app && pnpm exec playwright install chromium'
```

Create secrets from templates. Real PartsLink credentials and tunnel token stay
on server; do not put them in GitHub, terminal history, screenshots, or chat.

```bash
sudo install -o root -g autogood-vin -m 640 /opt/autogood-vin/app/server/.env.example /etc/autogood-vin/autogood-vin.env
sudo install -o root -g autogood-vin -m 640 /opt/autogood-vin/app/deploy/cloudflared/cloudflared.env.example /etc/autogood-vin/cloudflared.env
sudoedit /etc/autogood-vin/autogood-vin.env
sudoedit /etc/autogood-vin/cloudflared.env
```

Required `autogood-vin.env` values:

```text
HOST=127.0.0.1
PORT=8790
PARTSLINK24_OUTPUT_DIR=/opt/autogood-vin/output
PARTSLINK24_PROFILE_DIR=/opt/autogood-vin/profiles
PARTSLINK24_MAX_QUEUE_SIZE=4
PARTSLINK24_MIN_RUN_GAP_MS=7000
PARTSLINK24_RUN_TIMEOUT_MS=240000
AUTOGOOD_ALLOWED_ORIGINS=https://vin.example.com
AUTOGOOD_RELEASE=<release-tag-or-commit>
AUTOGOOD_BUILD_TIME=<ISO-8601-time>
```

Install unit files, then start API before tunnel:

```bash
sudo install -m 644 /opt/autogood-vin/app/deploy/systemd/autogood-vin-api.service.example /etc/systemd/system/autogood-vin-api.service
sudo install -m 644 /opt/autogood-vin/app/deploy/systemd/cloudflared-autogood-vin.service.example /etc/systemd/system/cloudflared-autogood-vin.service
sudo systemctl daemon-reload
sudo systemctl enable --now autogood-vin-api
curl --fail http://127.0.0.1:8790/health
curl --fail http://127.0.0.1:8790/version
sudo systemctl enable --now cloudflared-autogood-vin
```

Validate tunnel after start:

```bash
sudo journalctl -u cloudflared-autogood-vin -n 100 --no-pager
cloudflared tunnel info <TUNNEL_NAME>
```

## Smoke test after deploy

Run slowly, one request at a time. Wait for each PDF before next request.

1. BMW RU: `WBA31AA0905V40977`.
2. Mercedes-Benz PL: `WDD2120481A322032`.
3. Ford ENG: `WF0MXXGBWMEL10535`; confirm vehicle and equipment PDFs.
4. Download files through public hostname. Confirm every file starts with `%PDF-`.
5. Confirm `/health` and `/version` show intended release.

## Rollback

If any smoke test fails, do not touch CRM. Stop only new VIN services:

```bash
sudo systemctl stop cloudflared-autogood-vin autogood-vin-api
sudo systemctl disable cloudflared-autogood-vin autogood-vin-api
```

Keep failed release folder. Restore prior release by checking out prior Git tag,
running `pnpm install --frozen-lockfile`, updating `AUTOGOOD_RELEASE`, and
starting API plus tunnel again. Test `/health` before restoring public hostname.
