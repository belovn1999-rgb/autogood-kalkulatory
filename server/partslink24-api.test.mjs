import test from "node:test";
import assert from "node:assert/strict";

import { makeVinPdfDownloadName, normalizeDownloadFileName } from "./partslink24-api.mjs";

test("VIN PDF download names never include the report language", () => {
  assert.equal(makeVinPdfDownloadName("Citroen", "VF7PNCFB4CR507136"), "Citroen_VF7PNCFB4CR507136.pdf");
  assert.equal(normalizeDownloadFileName("Citroen_VF7PNCFB4CR507136_RU.pdf"), "Citroen_VF7PNCFB4CR507136.pdf");
  assert.equal(normalizeDownloadFileName("Citroen_VF7PNCFB4CR507136_PL.pdf"), "Citroen_VF7PNCFB4CR507136.pdf");
  assert.equal(normalizeDownloadFileName("Citroen_VF7PNCFB4CR507136_ENG.pdf"), "Citroen_VF7PNCFB4CR507136.pdf");
});

test("old cached download names are corrected by the server", () => {
  assert.equal(normalizeDownloadFileName("Alfa_Romeo_ZAR94000007103616_PL.pdf"), "Alfa_Romeo_ZAR94000007103616.pdf");
  assert.equal(normalizeDownloadFileName("Ford_WF0PXXGCHPPE76303_RU_vehicle.pdf"), "Ford_WF0PXXGCHPPE76303_vehicle.pdf");
});
