import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  deliveryJobs,
  staffContactLeads,
  staffLeadEvents,
} from "@/server/db/schema";
import {
  isReplayableJobStatus,
  REPLAYABLE_JOB_STATUSES,
  isWorkflowStatus,
  type StaffAction,
  type WorkflowStatus,
} from "./contracts";

export type StaffActor = {
  /** Stable label for audit (token holder id / display name). */
  id: string;
};

export type LeadListFilter = {
  workflowStatus?: WorkflowStatus;
  formId?: string;
  limit?: number;
  offset?: number;
};

export type StaffCommandInput =
  | { action: "set_status"; workflowStatus: WorkflowStatus }
  | { action: "assign"; assignee: string | null }
  | { action: "note"; note: string };

type SqlExecutor = {
  execute: AppDb["execute"];
};

async function syncPublicLead(
  executor: SqlExecutor,
  submissionId: string,
  patch: {
    workflowStatus: string;
    assignee: string | null;
    staffNote: string | null;
    updatedAt: Date;
    updatedBy: string;
  },
): Promise<void> {
  const updatedAtIso = patch.updatedAt.toISOString();
  await executor.execute(sql`
    UPDATE public.staff_contact_leads
    SET
      workflow_status = ${patch.workflowStatus},
      assignee = ${patch.assignee},
      staff_note = ${patch.staffNote},
      updated_at = ${updatedAtIso}::timestamptz,
      updated_by = ${patch.updatedBy}
    WHERE submission_id = ${submissionId}::uuid
  `);
}

export async function listStaffLeads(db: AppDb, filter: LeadListFilter = {}) {
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  const offset = Math.max(filter.offset ?? 0, 0);

  const conditions = [];
  if (filter.workflowStatus) {
    conditions.push(eq(staffContactLeads.workflowStatus, filter.workflowStatus));
  }
  if (filter.formId) {
    conditions.push(eq(staffContactLeads.formId, filter.formId));
  }

  const where =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

  const rows = await db
    .select({
      submissionId: staffContactLeads.submissionId,
      formId: staffContactLeads.formId,
      locale: staffContactLeads.locale,
      sourcePath: staffContactLeads.sourcePath,
      intakeStatus: staffContactLeads.status,
      workflowStatus: staffContactLeads.workflowStatus,
      createdAt: staffContactLeads.createdAt,
      name: staffContactLeads.name,
      email: staffContactLeads.email,
      phone: staffContactLeads.phone,
      company: staffContactLeads.company,
      city: staffContactLeads.city,
      assignee: staffContactLeads.assignee,
      staffNote: staffContactLeads.staffNote,
      updatedAt: staffContactLeads.updatedAt,
      updatedBy: staffContactLeads.updatedBy,
    })
    .from(staffContactLeads)
    .where(where)
    .orderBy(desc(staffContactLeads.createdAt))
    .limit(limit)
    .offset(offset);

  return rows;
}

export async function getStaffLeadDetail(db: AppDb, submissionId: string) {
  const leads = await db
    .select()
    .from(staffContactLeads)
    .where(eq(staffContactLeads.submissionId, submissionId))
    .limit(1);
  const lead = leads[0];
  if (!lead) return null;

  const jobs = await db
    .select({
      id: deliveryJobs.id,
      destination: deliveryJobs.destination,
      status: deliveryJobs.status,
      attempts: deliveryJobs.attempts,
      lastError: deliveryJobs.lastError,
      remoteReference: deliveryJobs.remoteReference,
      nextAttemptAt: deliveryJobs.nextAttemptAt,
      updatedAt: deliveryJobs.updatedAt,
    })
    .from(deliveryJobs)
    .where(eq(deliveryJobs.submissionId, submissionId))
    .orderBy(deliveryJobs.destination);

  const events = await db
    .select({
      id: staffLeadEvents.id,
      action: staffLeadEvents.action,
      actor: staffLeadEvents.actor,
      payload: staffLeadEvents.payload,
      createdAt: staffLeadEvents.createdAt,
    })
    .from(staffLeadEvents)
    .where(eq(staffLeadEvents.submissionId, submissionId))
    .orderBy(desc(staffLeadEvents.createdAt))
    .limit(50);

  return { lead, jobs, events };
}

export type StaffCommandResult =
  | { ok: true; lead: typeof staffContactLeads.$inferSelect }
  | { ok: false; code: string; message: string };

/**
 * R06: row lock + patch only the commanded field so parallel status/assign/note
 * do not overwrite each other. Audit payload uses locked before/after values.
 */
export async function applyStaffCommand(
  db: AppDb,
  submissionId: string,
  actor: StaffActor,
  input: StaffCommandInput,
): Promise<StaffCommandResult> {
  // Validate shape before taking a lock.
  if (input.action === "set_status" && !isWorkflowStatus(input.workflowStatus)) {
    return {
      ok: false,
      code: "invalid_status",
      message: "Unknown workflow status",
    };
  }
  if (input.action === "note") {
    const note = input.note.trim().slice(0, 4000);
    if (!note) {
      return { ok: false, code: "invalid_note", message: "Note is empty" };
    }
  }
  if (
    input.action !== "set_status" &&
    input.action !== "assign" &&
    input.action !== "note"
  ) {
    return { ok: false, code: "invalid_action", message: "Unknown action" };
  }

  const now = new Date();
  const action: StaffAction = input.action;

  return db.transaction(async (tx) => {
    const locked = await tx
      .select()
      .from(staffContactLeads)
      .where(eq(staffContactLeads.submissionId, submissionId))
      .limit(1)
      .for("update");
    const lead = locked[0];
    if (!lead) {
      return { ok: false, code: "not_found", message: "Lead not found" };
    }

    const patch: {
      workflowStatus?: string;
      assignee?: string | null;
      staffNote?: string | null;
      updatedAt: Date;
      updatedBy: string;
    } = {
      updatedAt: now,
      updatedBy: actor.id,
    };
    let eventPayload: Record<string, unknown> = {};

    if (input.action === "set_status") {
      patch.workflowStatus = input.workflowStatus;
      eventPayload = {
        from: lead.workflowStatus,
        to: input.workflowStatus,
      };
    } else if (input.action === "assign") {
      const trimmed =
        input.assignee === null || input.assignee === undefined
          ? null
          : input.assignee.trim().slice(0, 120) || null;
      patch.assignee = trimmed;
      eventPayload = { from: lead.assignee, to: trimmed };
    } else {
      const note = input.note.trim().slice(0, 4000);
      patch.staffNote = note;
      eventPayload = { from: lead.staffNote, to: note };
    }

    const [row] = await tx
      .update(staffContactLeads)
      .set(patch)
      .where(eq(staffContactLeads.submissionId, submissionId))
      .returning();

    if (!row) {
      return {
        ok: false,
        code: "conflict",
        message: "Lead disappeared during update",
      };
    }

    await tx.insert(staffLeadEvents).values({
      submissionId,
      action,
      actor: actor.id,
      payload: eventPayload,
      createdAt: now,
    });

    // Public mirror follows the merged row after the field-only patch.
    await syncPublicLead(tx, submissionId, {
      workflowStatus: row.workflowStatus,
      assignee: row.assignee,
      staffNote: row.staffNote,
      updatedAt: now,
      updatedBy: actor.id,
    });

    return { ok: true, lead: row };
  });
}

export type ReplayResult =
  | { ok: true; jobId: string; previousStatus: string }
  | { ok: false; code: string; message: string };

/**
 * Controlled manual replay: re-queue a terminal/stuck delivery job.
 * Does not touch Sheets (cancelled_policy) or already-delivered jobs.
 * R06: conditional UPDATE — active lease / delivered cannot be reset by race.
 */
export async function replayDeliveryJob(
  db: AppDb,
  jobId: string,
  actor: StaffActor,
): Promise<ReplayResult> {
  const now = new Date();
  const nowIso = now.toISOString();

  return db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(deliveryJobs)
      .where(eq(deliveryJobs.id, jobId))
      .limit(1)
      .for("update");
    const job = rows[0];
    if (!job) {
      return { ok: false, code: "not_found", message: "Delivery job not found" };
    }

    if (job.destination === "sheets" || job.status === "cancelled_policy") {
      return {
        ok: false,
        code: "not_replayable",
        message: "Sheets destination is cancelled (152-FZ)",
      };
    }

    if (job.status === "delivered") {
      return {
        ok: false,
        code: "not_replayable",
        message: "Job status 'delivered' cannot be replayed",
      };
    }

    const leaseActive =
      job.status === "leased" &&
      job.leaseExpiresAt != null &&
      job.leaseExpiresAt.getTime() > now.getTime();
    if (leaseActive) {
      return {
        ok: false,
        code: "active_lease",
        message: "Job has an active worker lease; wait for expiry or completion",
      };
    }

    const expiredLeased =
      job.status === "leased" &&
      job.leaseExpiresAt != null &&
      job.leaseExpiresAt.getTime() <= now.getTime();

    if (!isReplayableJobStatus(job.status) && !expiredLeased) {
      return {
        ok: false,
        code: "not_replayable",
        message: `Job status '${job.status}' cannot be replayed`,
      };
    }

    const previousStatus = job.status;

    // Atomic fence: status must still be replayable (or expired leased).
    const updated = await tx
      .update(deliveryJobs)
      .set({
        status: "pending",
        nextAttemptAt: now,
        leaseOwner: null,
        leaseToken: null,
        leaseExpiresAt: null,
        lastError: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(deliveryJobs.id, jobId),
          or(
            inArray(deliveryJobs.status, [...REPLAYABLE_JOB_STATUSES]),
            and(
              eq(deliveryJobs.status, "leased"),
              sql`${deliveryJobs.leaseExpiresAt} IS NOT NULL`,
              sql`${deliveryJobs.leaseExpiresAt} <= ${nowIso}::timestamptz`,
            ),
          ),
        ),
      )
      .returning();

    if (!updated[0]) {
      return {
        ok: false,
        code: "conflict",
        message: "Job changed concurrently; refresh and retry",
      };
    }

    await tx.insert(staffLeadEvents).values({
      submissionId: job.submissionId,
      action: "replay_delivery",
      actor: actor.id,
      payload: {
        jobId,
        destination: job.destination,
        fromStatus: previousStatus,
        attempts: job.attempts,
      },
      createdAt: now,
    });

    return { ok: true, jobId, previousStatus };
  });
}

export function parseStaffCommandBody(
  raw: unknown,
):
  | { ok: true; input: StaffCommandInput }
  | { ok: false; code: string; message: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, code: "invalid_json", message: "Expected object body" };
  }
  const body = raw as Record<string, unknown>;
  const action = body.action;

  if (action === "set_status") {
    if (!isWorkflowStatus(body.workflowStatus)) {
      return {
        ok: false,
        code: "invalid_status",
        message: "workflowStatus required",
      };
    }
    return {
      ok: true,
      input: { action: "set_status", workflowStatus: body.workflowStatus },
    };
  }

  if (action === "assign") {
    if (body.assignee !== null && typeof body.assignee !== "string") {
      return {
        ok: false,
        code: "invalid_assignee",
        message: "assignee must be string or null",
      };
    }
    return {
      ok: true,
      input: {
        action: "assign",
        assignee: (body.assignee as string | null) ?? null,
      },
    };
  }

  if (action === "note") {
    if (typeof body.note !== "string") {
      return { ok: false, code: "invalid_note", message: "note required" };
    }
    return { ok: true, input: { action: "note", note: body.note } };
  }

  return { ok: false, code: "invalid_action", message: "Unknown action" };
}
