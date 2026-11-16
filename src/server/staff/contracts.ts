/**
 * Staff CRM triage contracts (B3).
 * Workflow status is separate from intake `form_submissions.status`.
 */

export const WORKFLOW_STATUSES = [
  "new",
  "in_progress",
  "waiting",
  "done",
  "spam",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export const STAFF_ACTIONS = [
  "set_status",
  "assign",
  "note",
] as const;

export type StaffAction = (typeof STAFF_ACTIONS)[number];

/** Delivery jobs that may be manually re-queued. */
export const REPLAYABLE_JOB_STATUSES = [
  "failed",
  "blocked_config",
  "retry",
  "ambiguous",
] as const;

export type ReplayableJobStatus = (typeof REPLAYABLE_JOB_STATUSES)[number];

export function isWorkflowStatus(value: unknown): value is WorkflowStatus {
  return (
    typeof value === "string" &&
    (WORKFLOW_STATUSES as readonly string[]).includes(value)
  );
}

export function isReplayableJobStatus(
  value: unknown,
): value is ReplayableJobStatus {
  return (
    typeof value === "string" &&
    (REPLAYABLE_JOB_STATUSES as readonly string[]).includes(value)
  );
}

export const WORKFLOW_STATUS_LABELS_RU: Record<WorkflowStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  waiting: "Ожидание",
  done: "Закрыта",
  spam: "Спам",
};
