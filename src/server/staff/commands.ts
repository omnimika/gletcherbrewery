import { and, desc, eq, sql } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  deliveryJobs,
  staffContactLeads,
  staffLeadEvents,
} from "@/server/db/schema";
import {
  isReplayableJobStatus,
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

export async function applyStaffCommand(
  db: AppDb,
  submissionId: string,
  actor: StaffActor,
  input: StaffCommandInput,
): Promise<StaffCommandResult> {
  const existing = await db
    .select()
    .from(staffContactLeads)
    .where(eq(staffContactLeads.submissionId, submissionId))
    .limit(1);
  const lead = existing[0];
  if (!lead) {
    return { ok: false, code: "not_found", message: "Lead not found" };
  }

  const now = new Date();
  let nextWorkflow = lead.workflowStatus;
  let nextAssignee = lead.assignee;
  let nextNote = lead.staffNote;
  const action: StaffAction = input.action;
  let eventPayload: Record<string, unknown> = {};

  if (input.action === "set_status") {
    if (!isWorkflowStatus(input.workflowStatus)) {
      return {
        ok: false,
        code: "invalid_status",
        message: "Unknown workflow status",
      };
    }
    nextWorkflow = input.workflowStatus;
    eventPayload = {
      from: lead.workflowStatus,
      to: input.workflowStatus,
    };
  } else if (input.action === "assign") {
    const trimmed =
      input.assignee === null || input.assignee === undefined
        ? null
        : input.assignee.trim().slice(0, 120) || null;
    nextAssignee = trimmed;
    eventPayload = { from: lead.assignee, to: trimmed };
  } else if (input.action === "note") {
    const note = input.note.trim().slice(0, 4000);
    if (!note) {
      return { ok: false, code: "invalid_note", message: "Note is empty" };
    }
    nextNote = note;
    eventPayload = { note };
  } else {
    return { ok: false, code: "invalid_action", message: "Unknown action" };
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(staffContactLeads)
      .set({
        workflowStatus: nextWorkflow,
        assignee: nextAssignee,
        staffNote: nextNote,
        updatedAt: now,
        updatedBy: actor.id,
      })
      .where(eq(staffContactLeads.submissionId, submissionId))
      .returning();

    if (!row) throw new Error("staff lead update returned no row");

    await tx.insert(staffLeadEvents).values({
      submissionId,
      action,
      actor: actor.id,
      payload: eventPayload,
      createdAt: now,
    });

    await syncPublicLead(tx, submissionId, {
      workflowStatus: nextWorkflow,
      assignee: nextAssignee,
      staffNote: nextNote,
      updatedAt: now,
      updatedBy: actor.id,
    });

    return row;
  });

  return { ok: true, lead: updated };
}

export type ReplayResult =
  | { ok: true; jobId: string; previousStatus: string }
  | { ok: false; code: string; message: string };

/**
 * Controlled manual replay: re-queue a terminal/stuck delivery job.
 * Does not touch Sheets (cancelled_policy) or already-delivered jobs.
 */
export async function replayDeliveryJob(
  db: AppDb,
  jobId: string,
  actor: StaffActor,
): Promise<ReplayResult> {
  const rows = await db
    .select()
    .from(deliveryJobs)
    .where(eq(deliveryJobs.id, jobId))
    .limit(1);
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

  if (!isReplayableJobStatus(job.status)) {
    return {
      ok: false,
      code: "not_replayable",
      message: `Job status '${job.status}' cannot be replayed`,
    };
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
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
      .where(eq(deliveryJobs.id, jobId));

    await tx.insert(staffLeadEvents).values({
      submissionId: job.submissionId,
      action: "replay_delivery",
      actor: actor.id,
      payload: {
        jobId,
        destination: job.destination,
        fromStatus: job.status,
        attempts: job.attempts,
      },
      createdAt: now,
    });
  });

  return { ok: true, jobId, previousStatus: job.status };
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
