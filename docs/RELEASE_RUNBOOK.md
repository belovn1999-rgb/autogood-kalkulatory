# AUTOGOOD release runbook

## Scope

The public frontend is GitHub Pages from the `main` branch. The DOCX-to-PDF converter is a separate Render Docker service. A Pages release is complete only after both public pages and the converter smoke-test pass.

## Pre-release

1. Work from a clean `main` checkout:

   ```bash
   git status --short
   git branch --show-current
   ```

   The output must be empty and the branch must be `main`.
2. Run the verified local checks:

   ```bash
   pnpm install --frozen-lockfile
   pnpm run verify
   pnpm run audit:dependencies
   ```
3. Commit only the reviewed release files. Do not use `git add -A` for a scoped release.

## Publish

```bash
./scripts/publish.sh
```

The helper refuses a dirty checkout, runs `verify`, pushes `main`, waits for Pages, and executes a public smoke test:

- Pages root and `pdf.html` return success;
- the converter accepts the Pages CORS origin;
- the signed template converts to a valid PDF without personal data.

The same smoke test is available in GitHub Actions as **Production release smoke test** for a deliberate re-check or a custom endpoint.

## Render deploy and identity

The Render Blueprint uses `autoDeployTrigger: checksPass`. After the CI check for the release commit is green, verify:

```bash
curl https://autogood-pdf-converter.onrender.com/api/health
```

The response must have `ok: true` and `revision` equal to the deployed commit SHA (from Render's `RENDER_GIT_COMMIT`). If the service is still on an older revision, deploy the exact approved SHA from Render: **Events → Manual Deploy → Deploy a specific commit**.

## Rollback

### GitHub Pages

```bash
git revert --no-edit <bad-release-sha>
git push origin main
./scripts/publish.sh
```

### Render converter

In Render: **Events → select the last successful deploy → Rollback**. Render reuses the earlier build artifact and disables automatic deploys as a safeguard. Re-check `/api/health` and run the smoke test. Re-enable auto-deploy only after the cause is fixed.

Verify what actually answered, not just that something did:

```bash
curl -s https://autogood-pdf-converter.onrender.com/api/health | grep revision
```

A response with no `revision` field means the running build predates the field
and is therefore older than `main` — the deploy did not happen. That is exactly
the drift found on 2026-09-02, and `scripts/release-smoke.mjs` now fails on it
rather than leaving it to be noticed.

### VIN service

Roll back to the previous image tag on the host:

```bash
docker stop autogood-api && docker rm autogood-api
docker run -d --name autogood-api \
  --env-file /etc/autogood/partslink24.env \
  -v autogood-data:/data -p 127.0.0.1:8790:8790 \
  autogood-api:<previous-sha>
curl -s http://127.0.0.1:8790/version
```

The `/data` volume survives the swap, so the PartsLink24 session is not lost and
the service does not have to log in again. Confirm `/version` reports the SHA
you intended before declaring the rollback done.

## Required GitHub settings

An administrator must configure these external settings once:

1. Protect `main`: require pull requests and the `CI / verify` status check; disallow force pushes.
2. In Pages, keep the existing `main` root publication or explicitly migrate to a GitHub Actions deployment workflow. Do not enable both modes without a tested transition.
3. Record the release commit, Pages URL, Render revision, smoke result, and rollback decision in the release note.

## Smoke test environment

`scripts/release-smoke.mjs` reads:

| Variable | Meaning |
| --- | --- |
| `PAGES_URL` | Public Pages base. Defaults to the live site. |
| `CONVERTER_URL` | Converter conversion endpoint. |
| `CONVERTER_HEALTH_URL` | Derived from `CONVERTER_URL` unless set. |
| `VIN_API_URL` | VIN service base. Unset skips that half instead of failing. |
| `EXPECTED_REVISION` | Asserts exactly which build answered. Set it when verifying a specific release. |
