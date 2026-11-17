import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { unlink } from "node:fs/promises";
import path from "node:path";
import {
  readWorkerHeartbeat,
  touchWorkerHeartbeat,
  WORKER_HEARTBEAT_STALE_MS,
} from "./worker-heartbeat";

describe("worker-heartbeat", () => {
  const hb = path.join(process.cwd(), ".tmp", "delivery-worker.heartbeat");

  after(async () => {
    try {
      await unlink(hb);
    } catch {
      /* ok */
    }
  });

  it("touch then read as fresh", async () => {
    const at = new Date();
    await touchWorkerHeartbeat(at);
    const status = await readWorkerHeartbeat(at, WORKER_HEARTBEAT_STALE_MS);
    assert.equal(status.present, true);
    assert.equal(status.stale, false);
    assert.equal(status.ageSec, 0);
  });

  it("marks stale when age exceeds threshold", async () => {
    const past = new Date(Date.now() - WORKER_HEARTBEAT_STALE_MS - 5_000);
    await touchWorkerHeartbeat(past);
    const status = await readWorkerHeartbeat(new Date(), WORKER_HEARTBEAT_STALE_MS);
    assert.equal(status.stale, true);
    assert.ok((status.ageSec ?? 0) >= 30);
  });
});
