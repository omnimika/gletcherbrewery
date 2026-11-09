"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  WORKFLOW_STATUSES,
  WORKFLOW_STATUS_LABELS_RU,
  type WorkflowStatus,
} from "@/server/staff/contracts";

function actorHeader(): HeadersInit {
  const actor =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("gletcher_staff_actor") || "staff"
      : "staff";
  return { "content-type": "application/json", "x-staff-actor": actor };
}

export function LeadActions({
  submissionId,
  workflowStatus,
  assignee,
  staffNote,
  jobs,
}: {
  submissionId: string;
  workflowStatus: string;
  assignee: string | null;
  staffNote: string | null;
  jobs: Array<{
    id: string;
    destination: string;
    status: string;
    attempts: number;
    lastError: string | null;
  }>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(workflowStatus);
  const [assigneeValue, setAssigneeValue] = useState(assignee ?? "");
  const [note, setNote] = useState(staffNote ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function postAction(body: Record<string, unknown>) {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/staff/leads/${submissionId}/actions`, {
        method: "POST",
        headers: actorHeader(),
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setMessage(json.message ?? "Ошибка");
        return;
      }
      setMessage("Сохранено");
      router.refresh();
    } catch {
      setMessage("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  async function replay(jobId: string) {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/staff/delivery-jobs/${jobId}/replay`, {
        method: "POST",
        headers: actorHeader(),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setMessage(json.message ?? "Replay failed");
        return;
      }
      setMessage("Job re-queued → pending");
      router.refresh();
    } catch {
      setMessage("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Triage
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-zinc-500">Статус</span>
            <select
              className="block rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {WORKFLOW_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {WORKFLOW_STATUS_LABELS_RU[s as WorkflowStatus]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={pending}
            className="rounded bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
            onClick={() =>
              postAction({ action: "set_status", workflowStatus: status })
            }
          >
            Обновить статус
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-zinc-500">Исполнитель</span>
            <input
              className="block w-56 rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
              value={assigneeValue}
              onChange={(e) => setAssigneeValue(e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={pending}
            className="rounded border border-zinc-600 px-3 py-2 text-sm disabled:opacity-50"
            onClick={() =>
              postAction({
                action: "assign",
                assignee: assigneeValue.trim() || null,
              })
            }
          >
            Назначить
          </button>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-zinc-500">Заметка</span>
          <textarea
            className="min-h-24 w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={pending}
          className="rounded border border-zinc-600 px-3 py-2 text-sm disabled:opacity-50"
          onClick={() => postAction({ action: "note", note })}
        >
          Сохранить заметку
        </button>
      </section>

      <section className="space-y-3 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Delivery
        </h2>
        <ul className="space-y-2 text-sm">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 px-3 py-2"
            >
              <div>
                <div className="font-medium">
                  {job.destination} · {job.status}
                </div>
                <div className="text-xs text-zinc-500">
                  attempts={job.attempts}
                  {job.lastError ? ` · ${job.lastError}` : ""}
                </div>
              </div>
              {["failed", "blocked_config", "retry", "ambiguous"].includes(
                job.status,
              ) ? (
                <button
                  type="button"
                  disabled={pending}
                  className="rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-zinc-950 disabled:opacity-50"
                  onClick={() => replay(job.id)}
                >
                  Replay
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {message ? <p className="text-sm text-amber-300">{message}</p> : null}
    </div>
  );
}
