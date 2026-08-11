import assert from "node:assert/strict";
import test from "node:test";
import { createPartslinkQueue } from "./partslink24-api.mjs";

test("PartsLink queue rejects a request when active and waiting slots are full", async () => {
  let releaseFirstRun;
  const queue = createPartslinkQueue({ maxQueueSize: 1 });
  const first = queue.enqueue(() => new Promise((resolve) => { releaseFirstRun = resolve; }));

  await Promise.resolve();
  const rejected = await queue.enqueue(async () => ({ ok: true }));

  assert.deepEqual(rejected, {
    ok: false,
    statusCode: 429,
    error: "Сервис VIN занят. Подождите завершения текущих проверок и повторите запрос."
  });

  releaseFirstRun({ ok: true });
  assert.deepEqual(await first, { ok: true });
});

test("PartsLink queue waits between completed runs", async () => {
  let currentTime = 0;
  const waits = [];
  const queue = createPartslinkQueue({
    minRunGapMs: 7000,
    maxQueueSize: 2,
    now: () => currentTime,
    sleep: async (milliseconds) => {
      waits.push(milliseconds);
      currentTime += milliseconds;
    }
  });

  await queue.enqueue(async () => ({ ok: true }));
  currentTime += 1200;
  await queue.enqueue(async () => ({ ok: true }));

  assert.deepEqual(waits, [5800]);
});
