# Structural AUTO1 PDF editor

The browser reads page text with PDF.js and rebuilds selected PDF drawing
operations with pdf-lib. It copies the original image streams, fonts and
referenced resources into a new document. It does not render pages to JPEG,
overlay white rectangles, or copy the original annotations and metadata.

`src/auto1-engine.mjs` handles PDF tokenisation, graphics state, clipping and
object copying. `src/auto1-rules.mjs` associates text positions with the report
sections and selects, removes or moves those operations. `src/auto1.js` handles
file selection, progress, the second text verification pass and downloads.

The supported evidence is the supplied English BMW report. The rules locate
the cover fields, location and sections by text and position, rather than
fixed page numbers. Document and damage images on mixed logistics pages are
retained. The video thumbnail is identified by its timer. Only recognised
legal-only pages, the specific Italian-trader notice from the sample, and the
recognised parking-fee continuation are dropped as entire pages.

Unrecognised text around gallery images, missing cover fields, insufficient
cover space, unsupported PDF operations, rotation and unusual CropBoxes stop
processing. The UI then clears the previous download and asks for review.
Support for all AUTO1 variants, other source languages, scans and arbitrary
PDF generators has not been established.

Before offering a download, PDF.js reads the generated file again. It checks
the output page count, required text on its expected page (including repeated
items), and recognised auction text. This is a semantic check, not a substitute
for visual review. Preserving PDF image/text objects does not by itself prove
the behaviour of a particular desktop PDF editor.

Run the focused regression tests with `node --test scripts/auto1.test.mjs`.
They are also included in the normal `test` script. Keep vehicle fixtures and
rendered reports outside the public repository. For a new raw/approved pair,
check all pages visually, original image-stream hashes, required text, page
mapping, repeated processing, and the browser's failure/download behaviour.
