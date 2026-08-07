# Contract Layout Bug Reproducer Report

## Evidence Label

FIX_PROVEN

## Scope

Routes checked:

- `pdf.html` - contract 01, Poland
- `umowa-sprzedazy.html` - contract 02, sale
- `pdf.html?variant=export` - contract 03, export

Viewport: `375x667`.

## Reproduced Bug

Before the fix, contract 02 reproduced two failures on the public GitHub Pages site:

- `Rozpoznaj dane` parsed the buyer name as `Zleceniodawca: Jolanta Piasek` instead of `Jolanta Piasek`.
- After `DOCX` and `PDF`, the left `Dane wejściowe` panel overflowed horizontally: `panelScrollWidth 506 > panelClientWidth 341`.

Contracts 01 and 03 did not reproduce the layout failure with the same fixture.

## Root Cause

Contract 02 had its own sale parser and CSS. The parser did not treat `Zleceniodawca` as a buyer label, while contract 01 did. The sale status/download area also lacked the width constraints and wrapping needed for long generated DOCX/PDF filenames.

## Fix

Changed:

- `src/sale-contract.js`
- `src/sale-contract.css`
- `src/pdf.js`
- `src/pdf.css`
- `pdf.html`
- `umowa-sprzedazy.html`

The fix:

- aligns sale-contract recognition for `Zleceniodawca`;
- keeps long DOCX/PDF download links inside the input panel;
- removes the `Eksportuj dane` and `Drukuj` buttons from the sale contract UI;
- moves `PODSUMOWANIE:` under `Dane wejściowe` and above `Historia zmian`;
- opens prepared PDFs in the browser PDF viewer via a `blob:` tab while keeping download links;
- adds the `Polska` badge beside `Umowa` on contract 01.

## Red To Green

Red evidence:

- `outputs/contract-layout-reproducer-public-red.json`
- result: `REPRODUCED` on contract 02

Green evidence:

- `outputs/contract-layout-reproducer-local-green.json`
- result: `NOT_REPRODUCED` on contracts 01, 02, and 03

Post-deploy public green evidence:

- `outputs/contract-layout-reproducer-public-green.json`
- result: `NOT_REPRODUCED` on contracts 01, 02, and 03 after GitHub Pages served `20260807-contract-ui-1`

Harness:

- `outputs/contract-layout-reproducer.mjs`

## Additional Checks

- `node --check src/pdf.js`
- `node --check src/sale-contract.js`
- `git diff --check`
- Browser DOM check confirmed:
  - `Polska` badge on contract 01;
  - export contract keeps `Eksport do Białorusi`;
  - sale contract no longer has `Eksportuj dane` or `Drukuj`;
  - sale `utility-column` order is `Dane wejściowe`, `PODSUMOWANIE:`, `Historia zmian`;
  - PDF opens in a `blob:` browser page.

## Limitations

The local green run stubs the DOCX-to-PDF converter response to avoid dependence on Render availability. The UI path still generates DOCX and reaches the real download/viewer code.
