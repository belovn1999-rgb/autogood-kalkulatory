# Codex Instructions

This project is the live AUTOGOOD Tools site.

## Public App

Public URL:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/
```

Calculators URL:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/calculators.html
```

GitHub repository:

```text
https://github.com/belovn1999-rgb/autogood-kalkulatory
```

GitHub Pages is configured from the `main` branch, root folder (`/`).
Every pushed change to `main` becomes visible on the public URL after GitHub Pages refreshes.

## Required Workflow For Every Future Change

When the user asks to change the AUTOGOOD Tools site or calculators app:

1. Edit the local project files in this folder.
2. Verify the app locally at `http://127.0.0.1:4173/`.
3. Commit the change with a clear message.
4. Push to `origin main`.
5. Open the public GitHub Pages URL and verify the change is visible.
6. Tell the user the public URL and what changed.

Do not leave finished changes only on the local computer.
Finished app changes must be pushed to GitHub unless the user explicitly says not to publish.

## Local Run

Run from this folder:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/
```

## Publish Helper

After making and checking changes, use:

```bash
./scripts/publish.sh "Short commit message"
```

The helper commits, pushes, and checks the public URL.
