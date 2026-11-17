import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HEARTBEAT_PATH = path.join(
  process.cwd(),
  ".tmp",
  "delivery-worker.heartbeat",
);

/** Default: worker is stale if no tick for 30s (poll interval 2s). */
export const WORKER_HEARTBEAT_STALE_MS = 30_000;

export type WorkerHeartbeatStatus = {
  path: string;
  at: string | null;
  ageSec: number | null;
  stale: boolean;
  present: boolean;
};

export async function touchWorkerHeartbeat(
  at: Date = new Date(),
): Promise<void> {
  await mkdir(path.dirname(HEARTBEAT_PATH), { recursive: true });
  await writeFile(
    HEARTBEAT_PATH,
    JSON.stringify({ at: at.toISOString(), pid: process.pid }) + "\n",
    "utf8",
  );
}

export async function readWorkerHeartbeat(
  now: Date = new Date(),
  staleMs: number = WORKER_HEARTBEAT_STALE_MS,
): Promise<WorkerHeartbeatStatus> {
  try {
    const raw = await readFile(HEARTBEAT_PATH, "utf8");
    const parsed = JSON.parse(raw) as { at?: string };
    const at = parsed.at ? new Date(parsed.at) : null;
    if (!at || Number.isNaN(at.getTime())) {
      return {
        path: HEARTBEAT_PATH,
        at: null,
        ageSec: null,
        stale: true,
        present: true,
      };
    }
    const ageMs = Math.max(0, now.getTime() - at.getTime());
    return {
      path: HEARTBEAT_PATH,
      at: at.toISOString(),
      ageSec: Math.floor(ageMs / 1000),
      stale: ageMs > staleMs,
      present: true,
    };
  } catch {
    return {
      path: HEARTBEAT_PATH,
      at: null,
      ageSec: null,
      stale: true,
      present: false,
    };
  }
}
