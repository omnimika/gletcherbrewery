import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getWorkerDatabaseUrl } from "./client";

describe("getWorkerDatabaseUrl", () => {
  it("requires WORKER_DATABASE_URL and does not fall back to DATABASE_URL", () => {
    const prevWorker = process.env.WORKER_DATABASE_URL;
    const prevApp = process.env.DATABASE_URL;
    try {
      process.env.DATABASE_URL = "postgres://gletcher_app@localhost/db";
      delete process.env.WORKER_DATABASE_URL;
      assert.throws(() => getWorkerDatabaseUrl(), /WORKER_DATABASE_URL/);
    } finally {
      if (prevWorker === undefined) delete process.env.WORKER_DATABASE_URL;
      else process.env.WORKER_DATABASE_URL = prevWorker;
      if (prevApp === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = prevApp;
    }
  });
});
