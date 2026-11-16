"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CardActions,
  CardBody,
  CardHeading,
  CardShell,
} from "@/components/ui/card";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { Badge, FormStatus } from "@/components/ui/feedback";
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

const selectClass =
  "data-control w-full rounded-[var(--radius-control)] border border-gletcher-navy/40 bg-gletcher-white px-3 py-2.5 text-sm text-gletcher-navy outline-none transition-colors focus-visible:border-gletcher-navy disabled:cursor-not-allowed disabled:opacity-70";

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
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function postAction(body: Record<string, unknown>) {
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/staff/leads/${submissionId}/actions`, {
        method: "POST",
        headers: actorHeader(),
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Ошибка");
        return;
      }
      setMessage("Сохранено");
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  async function replay(jobId: string) {
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/staff/delivery-jobs/${jobId}/replay`, {
        method: "POST",
        headers: actorHeader(),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Replay failed");
        return;
      }
      setMessage("Job снова в очереди (pending)");
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-[var(--grid-gap)]">
      <CardShell className="bg-gletcher-white">
        <CardHeading as="h2">Triage</CardHeading>
        <CardBody className="space-y-5 !text-gletcher-navy">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field id="workflow-status" label="Статус">
              <select
                id="workflow-status"
                className={selectClass}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={pending}
              >
                {WORKFLOW_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {WORKFLOW_STATUS_LABELS_RU[s as WorkflowStatus]}
                  </option>
                ))}
              </select>
            </Field>
            <Button
              type="button"
              variant="secondary"
              size="md"
              loading={pending}
              disabled={pending}
              onClick={() =>
                postAction({ action: "set_status", workflowStatus: status })
              }
            >
              Обновить статус
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field id="assignee" label="Исполнитель">
              <TextInput
                id="assignee"
                value={assigneeValue}
                onChange={(e) => setAssigneeValue(e.target.value)}
                disabled={pending}
              />
            </Field>
            <Button
              type="button"
              variant="outline"
              size="md"
              loading={pending}
              disabled={pending}
              onClick={() =>
                postAction({
                  action: "assign",
                  assignee: assigneeValue.trim() || null,
                })
              }
            >
              Назначить
            </Button>
          </div>

          <Field id="staff-note" label="Заметка">
            <TextArea
              id="staff-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={pending}
            />
          </Field>
        </CardBody>
        <CardActions>
          <Button
            type="button"
            variant="outline"
            size="md"
            loading={pending}
            disabled={pending}
            onClick={() => postAction({ action: "note", note })}
          >
            Сохранить заметку
          </Button>
        </CardActions>
      </CardShell>

      <CardShell className="bg-gletcher-white">
        <CardHeading as="h2">Delivery</CardHeading>
        <CardBody className="!text-gletcher-navy">
          <ul className="space-y-3">
            {jobs.map((job) => {
              const canReplay = [
                "failed",
                "blocked_config",
                "retry",
                "ambiguous",
              ].includes(job.status);
              return (
                <li
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-gletcher-navy/15 bg-gletcher-frost/40 px-3 py-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold uppercase tracking-wide">
                        {job.destination}
                      </span>
                      <Badge tone={canReplay ? "red" : "muted"}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="type-caption text-gletcher-navy/65">
                      attempts={job.attempts}
                      {job.lastError ? ` · ${job.lastError}` : ""}
                    </p>
                  </div>
                  {canReplay ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={pending}
                      disabled={pending}
                      onClick={() => replay(job.id)}
                    >
                      Replay
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </CardBody>
      </CardShell>

      {message ? <FormStatus tone="info">{message}</FormStatus> : null}
      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}
    </div>
  );
}
