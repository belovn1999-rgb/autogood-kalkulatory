import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const routes = JSON.parse(readFileSync(join(testDir, "brand-routes.json"), "utf8"));
const pageSource = readFileSync(join(testDir, "../..", "partslink24.html"), "utf8");

test("Fiat passenger cars and Fiat Vans use their distinct start-page tiles", () => {
  assert.equal(routes.brands.Fiat.route, "brand_first_search");
  assert.equal(routes.brands.Fiat.brandTile, "Fiat");
  assert.equal(routes.brands["Fiat Professional"].route, "brand_first_search");
  assert.equal(routes.brands["Fiat Professional"].brandTile, "Fiat Professional");
  assert.notEqual(routes.brands.Fiat.brandTile, routes.brands["Fiat Professional"].brandTile);
});

test("the second Fiat catalogue is labelled Fiat Vans in the public picker", () => {
  assert.match(pageSource, /"Fiat Professional":\s*"Fiat Vans"/);
});
