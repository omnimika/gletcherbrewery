import Link from "next/link";
import { Banner } from "@/components/ui/card";
import { getDb } from "@/server/db/client";
import { getQueueSnapshot } from "@/server/ops/queue-snapshot";
import { readWorkerHeartbeat } from "@/server/ops/worker-heartbeat";
import { gateStaffPage } from "@/server/staff/page-gate";
import { LEADS_STAFF_ROLES } from "@/server/staff/roles";
import { StaffLoginForm } from "../staff-login-form";

export const dynamic = "force-dynamic";

function ageLabel(sec: number | null): string {
  if (sec == null) return "—";
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  return `${Math.floor(sec / 3600)}h`;
}

export default async function StaffOpsQueuePage() {
  const gate = await gateStaffPage(LEADS_STAFF_ROLES);
  if (gate.status === "unconfigured") {
    return (
      <Banner tone="frost">
        <p className="font-display text-lg uppercase">STAFF_API_TOKEN не задан</p>
      </Banner>
    );
  }
  if (gate.status === "login") {
    return <StaffLoginForm />;
  }
  if (gate.status === "forbidden") {
    return (
      <Banner tone="frost">
        <p className="font-display text-lg uppercase">Недостаточно прав</p>
        <p className="type-body-small mt-2">
          Нужны admin или loyalty_manager.
        </p>
      </Banner>
    );
  }

  let error: string | null = null;
  let snapshot: Awaited<ReturnType<typeof getQueueSnapshot>> | null = null;
  let worker: Awaited<ReturnType<typeof readWorkerHeartbeat>> | null = null;
  try {
    const at = new Date();
    snapshot = await getQueueSnapshot(getDb(), at);
    worker = await readWorkerHeartbeat(at);
  } catch {
    error = "База недоступна — проверьте embedded PostgreSQL.";
  }

  const byStatus = snapshot?.byStatus ?? {};

  return (
    <div className="space-y-[var(--grid-gap)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase">
            Очередь доставки
          </h1>
          <p className="type-body-small mt-2 max-w-2xl text-gletcher-navy/70">
            Outbox Telegram / telegram_agent. Replay failed jobs — на карточке
            заявки. Runbook:{" "}
            <code className="text-xs">docs/backend/DELIVERY_QUEUE_RUNBOOK.md</code>
          </p>
        </div>
        <Link
          href="/api/health"
          className="type-caption text-gletcher-navy/60 underline-offset-2 hover:underline"
        >
          /api/health
        </Link>
      </div>

      {error ? (
        <Banner tone="frost">
          <p className="type-body-small">{error}</p>
        </Banner>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Worker"
          value={
            !worker?.present
              ? "нет heartbeat"
              : worker.stale
                ? `stale ${ageLabel(worker.ageSec)}`
                : `up ${ageLabel(worker.ageSec)}`
          }
          warn={!worker?.present || Boolean(worker?.stale)}
        />
        <Stat label="Pending" value={String(byStatus.pending ?? 0)} />
        <Stat label="Failed" value={String(byStatus.failed ?? 0)} warn={(byStatus.failed ?? 0) > 0} />
        <Stat
          label="Ambiguous"
          value={String(byStatus.ambiguous ?? 0)}
          warn={(byStatus.ambiguous ?? 0) > 0}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Due сейчас"
          value={String(snapshot?.pendingDueCount ?? 0)}
          warn={(snapshot?.pendingDueCount ?? 0) > 0}
        />
        <Stat
          label="Expired leases"
          value={String(snapshot?.expiredLeaseCount ?? 0)}
          warn={(snapshot?.expiredLeaseCount ?? 0) > 0}
        />
        <Stat
          label="Oldest pending"
          value={ageLabel(snapshot?.oldestPendingAgeSec ?? null)}
        />
        <Stat
          label="Oldest failed"
          value={ageLabel(snapshot?.oldestFailedAgeSec ?? null)}
        />
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-gletcher-navy/20 bg-gletcher-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-gletcher-navy/15 type-caption uppercase tracking-wide text-gletcher-navy/55">
            <tr>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Destination</th>
              <th className="px-3 py-2 font-semibold">Source</th>
              <th className="px-3 py-2 font-semibold">Count</th>
              <th className="px-3 py-2 font-semibold">Oldest</th>
            </tr>
          </thead>
          <tbody>
            {(snapshot?.buckets ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-gletcher-navy/55">
                  Очередь пуста
                </td>
              </tr>
            ) : (
              (snapshot?.buckets ?? []).map((b) => (
                <tr
                  key={`${b.status}:${b.destination}:${b.sourceKind}`}
                  className="border-b border-gletcher-navy/10"
                >
                  <td className="px-3 py-2 font-mono text-xs">{b.status}</td>
                  <td className="px-3 py-2">{b.destination}</td>
                  <td className="px-3 py-2 font-mono text-xs">{b.sourceKind}</td>
                  <td className="px-3 py-2">{b.count}</td>
                  <td className="px-3 py-2 type-caption text-gletcher-navy/60">
                    {b.oldestCreatedAt
                      ? new Date(b.oldestCreatedAt).toLocaleString("ru-RU")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border px-4 py-3 ${
        warn
          ? "border-gletcher-action/50 bg-gletcher-white"
          : "border-gletcher-navy/15 bg-gletcher-white"
      }`}
    >
      <p className="type-caption uppercase tracking-wide text-gletcher-navy/55">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-xl font-extrabold tracking-wide ${
          warn ? "text-gletcher-action" : "text-gletcher-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
