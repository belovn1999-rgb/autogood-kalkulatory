# Design QA

- Source visual truth: `/var/folders/hb/y5vh27kx1z525b158nz553f80000gn/T/codex-clipboard-3a940c21-4f00-42d2-a54a-2aecde5b5096.png`
- Implementation screenshot: `output/playwright/custom-position-block-desktop.png`
- Mobile screenshot: `output/playwright/custom-position-block-mobile.png`
- Comparison screenshot: `output/playwright/custom-position-block-comparison.png`
- Viewports: desktop `1280x720`; mobile `390x844`
- Source pixels: `509x127`
- Implementation pixels: desktop `381x178`; mobile `281x228`
- Component CSS size: desktop `365.61x162.5`; mobile `265x212.5`
- Density: browser default DPR; no density normalization was required for the layout comparison
- State: empty custom-position form; adding `120 EUR` with VAT was tested separately

## Comparison

The implementation preserves the reference hierarchy: a flat section with a top divider, compact blue title, rounded name input, and blue primary action. The amount, currency, and VAT controls form a second row because they are required by the existing calculator workflow. On mobile, the action moves to a full-width third row so controls remain legible and do not overflow.

No P0, P1, or P2 visual issues were found. The component has no image assets. Typography and colors use the existing AUTOGOOD design tokens.

## Verification History

1. Compared the supplied reference and desktop implementation in one `1280x720` comparison image.
2. Verified the component at `390x844`; measured horizontal overflow was `-15px`.
3. Added a custom position with amount, EUR currency, and VAT; confirmed the row appeared and inputs reset.
4. Checked the browser console; no errors were reported.

## Final VAT Drag And Drop

- Added the calculated `VAT 23%` row to the same reorder surface as the active settlement rows.
- Added a blue insertion line, endpoint dot, and subtle target-row tint for before/after placement.
- Verified that seven visible rows expose the same localized drag handle: six active cost rows plus VAT.
- Enabled VAT on the `250 PLN` translation row and confirmed VAT `58 PLN` and total `458 PLN`; calculation behavior is unchanged.
- The VAT position is retained in saved final settlements and used in the print layout.

final result: passed
