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

## Required GitHub settings

An administrator must configure these external settings once:

1. Protect `main`: require pull requests and the `CI / verify` status check; disallow force pushes.
2. In Pages, keep the existing `main` root publication or explicitly migrate to a GitHub Actions deployment workflow. Do not enable both modes without a tested transition.
3. Record the release commit, Pages URL, Render revision, smoke result, and rollback decision in the release note.
