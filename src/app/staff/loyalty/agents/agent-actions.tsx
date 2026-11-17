"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AGENT_APP_STATUSES,
  AGENT_APP_STATUS_LABELS_RU,
} from "@/lib/loyalty/agent-application-status";

export function AgentActions({
  applicationId,
  currentStatus,
  currentPublicNote,
}: {
  applicationId: string;
  currentStatus: string;
  currentPublicNote: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [publicNote, setPublicNote] = useState(currentPublicNote ?? "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    start(async () => {
      const res = await fetch(
        `/api/staff/loyalty/agents/${applicationId}/actions`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "set_status",
            status,
            publicNote: publicNote.trim() || null,
            reason: reason.trim() || null,
          }),
        },
      );
      const json = (await res.json()) as { ok?: boolean; code?: string };
      if (!res.ok || !json.ok) {
        setError(json.code ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <label className="type-caption text-gletcher-navy/70">
        Статус
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={pending}
          className="mt-1 w-full rounded border border-gletcher-navy/30 bg-gletcher-white px-2 py-1.5 text-sm text-gletcher-navy"
        >
          {AGENT_APP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {AGENT_APP_STATUS_LABELS_RU[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="type-caption text-gletcher-navy/70">
        Комментарий участнику
        <input
          value={publicNote}
          onChange={(e) => setPublicNote(e.target.value)}
          disabled={pending}
          maxLength={500}
          className="mt-1 w-full rounded border border-gletcher-navy/30 bg-gletcher-white px-2 py-1.5 text-sm text-gletcher-navy"
          placeholder="Виден в кабинете"
        />
      </label>
      <label className="type-caption text-gletcher-navy/70">
        Внутренняя причина (audit)
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={pending}
          maxLength={500}
          className="mt-1 w-full rounded border border-gletcher-navy/30 bg-gletcher-white px-2 py-1.5 text-sm text-gletcher-navy"
          placeholder="Не показывается участнику"
        />
      </label>
      <button
        type="button"
        disabled={pending}
        onClick={run}
        className="rounded border border-gletcher-navy bg-gletcher-navy px-3 py-1.5 text-xs font-semibold tracking-wide text-gletcher-white uppercase disabled:opacity-50"
      >
        Сохранить
      </button>
      {error ? (
        <span className="type-caption text-gletcher-red">{error}</span>
      ) : null}
    </div>
  );
}
