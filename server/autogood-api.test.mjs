import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createAutogoodServer } from "./autogood-api.mjs";

test("AUTOGOOD API serves health, version and VIN validation without PartsLink login", async () => {
  const server = createAutogoodServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).service, "autogood-api");

    const version = await fetch(`${baseUrl}/version`);
    assert.equal(version.status, 200);
    assert.equal((await version.json()).release, "dev");

    const validation = await fetch(`${baseUrl}/api/partslink24/production-date`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ brand: "BMW", language: "PL", vin: "TEST" })
    });
    assert.equal(validation.status, 400);
    assert.match((await validation.json()).error, /VIN должен содержать 17 символов/);
  } finally {
    server.close();
    await once(server, "close");
  }
});
