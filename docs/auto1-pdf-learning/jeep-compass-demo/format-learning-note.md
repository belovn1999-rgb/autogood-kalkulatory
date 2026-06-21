# AUTO1 PDF Formatting Learning Note

Purpose: capture the user's demonstrated manual PDF-cleanup workflow so it can later be turned into a repeatable Codex skill.

Recording source:
- Session: `/Users/nikitq/.codex/record-and-replay-local/sessions/20260621T123113Z-pdf-workflow`
- Summary: `/Users/nikitq/.codex/record-and-replay-local/sessions/20260621T123113Z-pdf-workflow/recording-summary.md`
- Contact sheet: `/Users/nikitq/.codex/record-and-replay-local/sessions/20260621T123113Z-pdf-workflow/contact-sheet.jpg`

Confirmed from the recording:
- The workflow was performed in Acrobat Pro DC.
- The visible PDF/window title was `Jeep Compass 1.3 T-GDi Longitude FWD`.
- The PDF had 13 pages in Acrobat.
- The user worked in `Edit PDF` mode.
- The user edited layout/text/image objects visually, especially on the first pages.
- The recording captured 126 screenshots from the MacBook main display at 2880 x 1800.
- The recording captured 379 events, mostly Acrobat Pro DC context events.

Visible formatting/workflow patterns:
- Start on the first report page.
- Keep a clean client-facing report layout.
- Work with the first-page vehicle identity block, photo grid, and specification table.
- Adjust or clean table/object blocks while preserving readable alignment.
- Review or modify the photo/gallery section.
- Remove or cover video/player-looking overlay elements when visible, such as `0:00` controls.
- Continue through report sections to check consistency and client-facing cleanliness.
- Sections visibly reviewed included:
  - `TEST DRIVE INFORMATION`
  - `DAMAGE SUMMARY`
  - `CAR SERVICE DETAILS`
  - `TECHNICAL INSPECTION`
- Return near the beginning of the document before finishing.

Likely repeatable goal:
- Convert a raw auction PDF report into a clean client-ready PDF.
- Preserve useful vehicle information, photos, technical condition, equipment, service details, and inspection data.
- Remove auction/internal/commercial artifacts that should not be sent to the client.
- Improve visual polish: spacing, alignment, readable tables, consistent blocks, and no obvious editing artifacts.

Not yet confirmed:
- Exact list of all deleted text/objects.
- Exact before-and-after page count.
- Exact coordinates of removed or repositioned blocks.
- Whether prices, stock numbers, delivery blocks, legal footers, gallery counters, or auction-specific banners were present in this Jeep file and removed.
- Whether all changes match the earlier Peugeot/AUTO1 ideal format.

Required next inputs before creating the skill:
- DONE: Original/raw PDF before manual edits:
  `/Users/nikitq/Downloads/Jeep Compass 1.3 T-GDi Longitude FWD.pdf`
- DONE: Final/client-ready PDF after manual edits:
  `/Users/nikitq/Downloads/Jeep Compass 1.3 T-GDi Longitude FWD_.pdf`
- Optional: another ideal reference PDF if different from this final file.

Comparison procedure for the next step:
- Render both PDFs to page images.
- Compare page count and page order.
- Extract text from both versions and list removed, added, and changed text.
- Visually compare pages side by side.
- Identify repeated cleanup rules:
  - remove specific unwanted phrases/blocks
  - remove or cover video overlays
  - remove auction/internal/legal/footer artifacts
  - clean page breaks and blank pages
  - preserve client-relevant report sections
  - preserve and align photo grids
  - standardize title/specification blocks
- Convert confirmed rules into deterministic PDF operations where possible.
- Keep visual-review steps for layout-sensitive edits.

Future skill requirements:
- The skill must use the PDF workflow: render, inspect, edit, re-render, verify.
- It must not guess based only on one recording.
- It must treat source and final PDFs as the authority.
- It must produce a client-ready PDF and a short change report.
- It must fail clearly when a new PDF layout differs too much from the learned structure.

Confirmed comparison:
- Detailed confirmed change log:
  `/Users/nikitq/Documents/OFFER/auto1-pdf-learning/jeep-compass-demo/confirmed-change-log.md`

Skill creation status:
- The recording and the raw/final PDF comparison are now sufficient to draft a reusable AUTO1 client-PDF cleanup skill.
- Before fully trusting automation, forward-test the skill on at least one new AUTO1 PDF and visually compare the output against the learned format.
