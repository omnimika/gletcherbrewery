import { createHash, randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, notInArray, sql } from "drizzle-orm";
import {
  agentAppStatusLabel,
  AGENT_APP_CLOSED_STATUSES,
  AGENT_APP_STATUS_LABELS_RU,
  AGENT_APP_STATUSES,
  isAgentAppStatus,
  isActiveAgentStatus,
  isOpenAgentStatus,
  MAX_OPEN_AGENT_APPLICATIONS,
  type AgentAppStatus,
} from "@/lib/loyalty/agent-application-status";
import {
  clampPageParams,
  clampPageToTotal,
  toPageResult,
  type PageResult,
} from "@/lib/pagination";
import { parseStaffSort } from "@/lib/staff-sort";
import type { AppDb } from "@/server/db/client";
import {
  loyaltyAgentApplicationEvents,
  loyaltyAgentApplications,
  loyaltyMembers,
} from "@/server/db/schema";
import { enqueueLoyaltyTelegramJob } from "./notify-outbox";

export {
  AGENT_APP_STATUSES,
  AGENT_APP_STATUS_LABELS_RU,
  AGENT_APP_CLOSED_STATUSES,
  MAX_OPEN_AGENT_APPLICATIONS,
  isAgentAppStatus,
  isActiveAgentStatus,
  isOpenAgentStatus,
  type AgentAppStatus,
};

const OPEN_STATUS_FILTER = notInArray(
  loyaltyAgentApplications.status,
  [...AGENT_APP_CLOSED_STATUSES],
);

/** @deprecated use AGENT_APP_STATUSES / under_review literal */
export const AGENT_APP_STATUS = {
  underReview: "under_review",
  approved: "approved",
  rejected: "rejected",
} as const;

export type CreateAgentApplicationInput = {
  memberId: string;
  phone: string;
  city: string;
  venueName: string;
  venueType: string;
  venueAddress: string;
  venueBoss?: string | null;
  comment?: string | null;
  legacyOrderId?: string | null;
};

export type MemberAgentApplicationView = {
  id: string;
  status: string;
  statusLabel: string;
  venueName: string;
  city: string;
  publicNote: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
};

export type OpenAgentApplication = {
  id: string;
  status: string;
  statusLabel: string;
  venueName: string;
  publicNote: string | null;
  createdAt: Date;
};

export type CreateAgentApplicationResult =
  | {
      ok: true;
      application: OpenAgentApplication;
      replay: boolean;
    }
  | {
      ok: false;
      code: "invalid_agent_application" | "open_limit_reached";
      openCount?: number;
      application?: OpenAgentApplication;
    };

export type SetAgentApplicationStatusResult =
  | {
      ok: true;
      application: typeof loyaltyAgentApplications.$inferSelect;
      already: boolean;
    }
  | {
      ok: false;
      code: "not_found" | "invalid_status" | "invalid_note";
    };

function clean(s: string, max = 200): string {
  return s.trim().replace(/\s+/g, " ").slice(0, max);
}

function toOpenView(
  row: Pick<
    typeof loyaltyAgentApplications.$inferSelect,
    "id" | "status" | "venueName" | "publicNote" | "createdAt"
  >,
): OpenAgentApplication {
  return {
    id: row.id,
    status: row.status,
    statusLabel: agentAppStatusLabel(row.status),
    venueName: row.venueName,
    publicNote: row.publicNote ?? null,
    createdAt: row.createdAt,
  };
}

export function buildAgentApplicationIntentKey(
  memberId: string,
  fields: {
    phone: string;
    city: string;
    venueName: string;
    venueType: string;
    venueAddress: string;
    venueBoss: string | null;
    comment: string | null;
  },
): string {
  const canonical = JSON.stringify({
    phone: fields.phone,
    city: fields.city,
    venueName: fields.venueName,
    venueType: fields.venueType,
    venueAddress: fields.venueAddress,
    venueBoss: fields.venueBoss ?? "",
    comment: fields.comment ?? "",
  });
  return createHash("sha256")
    .update(`${memberId}:${canonical}`)
    .digest("hex")
    .slice(0, 40);
}

function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code =
    "code" in err
      ? String((err as { code?: unknown }).code)
      : "cause" in err &&
          err.cause &&
          typeof err.cause === "object" &&
          "code" in err.cause
        ? String((err.cause as { code?: unknown }).code)
        : "";
  return code === "23505";
}

/**
 * Atomic create: same intent → replay; up to MAX_OPEN open apps (≠ approved/rejected);
 * never auto-earns. Does not accept client status/reviewer.
 */
export async function createAgentApplication(
  db: AppDb,
  input: CreateAgentApplicationInput,
): Promise<CreateAgentApplicationResult> {
  const phone = clean(input.phone, 40);
  const city = clean(input.city, 80);
  const venueName = clean(input.venueName, 120);
  const venueType = clean(input.venueType, 80);
  const venueAddress = clean(input.venueAddress, 200);
  const venueBoss = input.venueBoss ? clean(input.venueBoss, 120) : null;
  const comment = input.comment ? clean(input.comment, 1000) : null;

  if (!phone || !city || !venueName || !venueType || !venueAddress) {
    return { ok: false, code: "invalid_agent_application" };
  }

  const intentKey = buildAgentApplicationIntentKey(input.memberId, {
    phone,
    city,
    venueName,
    venueType,
    venueAddress,
    venueBoss,
    comment,
  });

  return db.transaction(async (tx) => {
    const [sameIntent] = await tx
      .select({
        id: loyaltyAgentApplications.id,
        status: loyaltyAgentApplications.status,
        venueName: loyaltyAgentApplications.venueName,
        publicNote: loyaltyAgentApplications.publicNote,
        createdAt: loyaltyAgentApplications.createdAt,
      })
      .from(loyaltyAgentApplications)
      .where(
        and(
          eq(loyaltyAgentApplications.memberId, input.memberId),
          eq(loyaltyAgentApplications.intentKey, intentKey),
        ),
      )
      .limit(1);

    if (sameIntent) {
      return {
        ok: true as const,
        application: toOpenView(sameIntent),
        replay: true,
      };
    }

    // Lock open rows for this member so concurrent creates respect the cap.
    const openRows = await tx
      .select({
        id: loyaltyAgentApplications.id,
        status: loyaltyAgentApplications.status,
        venueName: loyaltyAgentApplications.venueName,
        publicNote: loyaltyAgentApplications.publicNote,
        createdAt: loyaltyAgentApplications.createdAt,
      })
      .from(loyaltyAgentApplications)
      .where(
        and(
          eq(loyaltyAgentApplications.memberId, input.memberId),
          OPEN_STATUS_FILTER,
        ),
      )
      .orderBy(desc(loyaltyAgentApplications.createdAt))
      .for("update");

    if (openRows.length >= MAX_OPEN_AGENT_APPLICATIONS) {
      return {
        ok: false as const,
        code: "open_limit_reached" as const,
        openCount: openRows.length,
        application: openRows[0] ? toOpenView(openRows[0]) : undefined,
      };
    }

    try {
      const [row] = await tx
        .insert(loyaltyAgentApplications)
        .values({
          memberId: input.memberId,
          status: "under_review",
          phone,
          city,
          venueName,
          venueType,
          venueAddress,
          venueBoss,
          comment,
          intentKey,
          legacyOrderId: input.legacyOrderId ?? null,
        })
        .returning();

      await tx.insert(loyaltyAgentApplicationEvents).values({
        applicationId: row!.id,
        action: "created",
        actor: `member:${input.memberId}`,
        payload: {
          status: row!.status,
          intentKey,
          venueName,
          correlationId: randomUUID(),
        },
      });

      await enqueueLoyaltyTelegramJob(tx, {
        sourceKind: "loyalty_agent_application",
        sourceId: row!.id,
        eventType: "agent_application_submitted",
      });

      return {
        ok: true as const,
        application: toOpenView(row!),
        replay: false,
      };
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;

      const [again] = await tx
        .select({
          id: loyaltyAgentApplications.id,
          status: loyaltyAgentApplications.status,
          venueName: loyaltyAgentApplications.venueName,
          publicNote: loyaltyAgentApplications.publicNote,
          createdAt: loyaltyAgentApplications.createdAt,
        })
        .from(loyaltyAgentApplications)
        .where(
          and(
            eq(loyaltyAgentApplications.memberId, input.memberId),
            eq(loyaltyAgentApplications.intentKey, intentKey),
          ),
        )
        .limit(1);

      if (again) {
        return {
          ok: true as const,
          application: toOpenView(again),
          replay: true,
        };
      }

      return {
        ok: false as const,
        code: "open_limit_reached" as const,
        openCount: openRows.length,
      };
    }
  });
}

export async function listAgentApplicationsForMember(
  db: AppDb,
  memberId: string,
  limit = 20,
): Promise<MemberAgentApplicationView[]> {
  const rows = await db
    .select({
      id: loyaltyAgentApplications.id,
      status: loyaltyAgentApplications.status,
      venueName: loyaltyAgentApplications.venueName,
      city: loyaltyAgentApplications.city,
      publicNote: loyaltyAgentApplications.publicNote,
      createdAt: loyaltyAgentApplications.createdAt,
      reviewedAt: loyaltyAgentApplications.reviewedAt,
    })
    .from(loyaltyAgentApplications)
    .where(eq(loyaltyAgentApplications.memberId, memberId))
    .orderBy(desc(loyaltyAgentApplications.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    statusLabel: agentAppStatusLabel(row.status),
    publicNote: row.publicNote ?? null,
  }));
}

/** Open applications (≠ approved|rejected), newest first. */
export async function listOpenAgentApplications(
  db: AppDb,
  memberId: string,
  limit = MAX_OPEN_AGENT_APPLICATIONS,
): Promise<OpenAgentApplication[]> {
  const rows = await db
    .select({
      id: loyaltyAgentApplications.id,
      status: loyaltyAgentApplications.status,
      venueName: loyaltyAgentApplications.venueName,
      publicNote: loyaltyAgentApplications.publicNote,
      createdAt: loyaltyAgentApplications.createdAt,
    })
    .from(loyaltyAgentApplications)
    .where(
      and(
        eq(loyaltyAgentApplications.memberId, memberId),
        OPEN_STATUS_FILTER,
      ),
    )
    .orderBy(desc(loyaltyAgentApplications.createdAt))
    .limit(limit);
  return rows.map(toOpenView);
}

export async function countOpenAgentApplications(
  db: AppDb,
  memberId: string,
): Promise<number> {
  const rows = await db
    .select({ id: loyaltyAgentApplications.id })
    .from(loyaltyAgentApplications)
    .where(
      and(
        eq(loyaltyAgentApplications.memberId, memberId),
        OPEN_STATUS_FILTER,
      ),
    );
  return rows.length;
}

export async function latestOpenAgentApplication(
  db: AppDb,
  memberId: string,
): Promise<OpenAgentApplication | null> {
  const [row] = await listOpenAgentApplications(db, memberId, 1);
  return row ?? null;
}

export type StaffAgentApplicationListRow = {
  application: typeof loyaltyAgentApplications.$inferSelect;
  email: string;
  displayName: string | null;
  statusLabel: string;
};

export const STAFF_AGENT_SORT_FIELDS = ["createdAt", "city"] as const;
export type StaffAgentSortField = (typeof STAFF_AGENT_SORT_FIELDS)[number];

export async function listAgentApplicationsForStaff(
  db: AppDb,
  opts: {
    status?: string | null;
    page?: number | string;
    pageSize?: number | string;
    limit?: number;
    sort?: string | null;
    dir?: string | null;
  } = {},
): Promise<PageResult<StaffAgentApplicationListRow>> {
  const initial = clampPageParams({
    page: opts.page,
    pageSize: opts.pageSize ?? opts.limit ?? 50,
    defaultPageSize: 50,
    maxPageSize: 100,
  });
  const { sort, dir } = parseStaffSort(
    opts,
    STAFF_AGENT_SORT_FIELDS,
    "createdAt",
    "desc",
  );
  const statusFilter =
    opts.status && isAgentAppStatus(opts.status) ? opts.status : null;
  const where = statusFilter
    ? eq(loyaltyAgentApplications.status, statusFilter)
    : undefined;

  const [totalRow] = await db
    .select({ c: count() })
    .from(loyaltyAgentApplications)
    .where(where);
  const total = Number(totalRow?.c ?? 0);
  const { page, pageSize, offset } = clampPageToTotal(
    initial.page,
    initial.pageSize,
    total,
  );

  const sortCol =
    sort === "city"
      ? loyaltyAgentApplications.city
      : loyaltyAgentApplications.createdAt;
  const order = dir === "asc" ? asc(sortCol) : desc(sortCol);

  const rows = await db
    .select({
      application: loyaltyAgentApplications,
      email: loyaltyMembers.emailNormalized,
      displayName: loyaltyMembers.displayName,
    })
    .from(loyaltyAgentApplications)
    .innerJoin(
      loyaltyMembers,
      eq(loyaltyMembers.id, loyaltyAgentApplications.memberId),
    )
    .where(where)
    .orderBy(order, desc(loyaltyAgentApplications.id))
    .limit(pageSize)
    .offset(offset);

  return toPageResult(
    rows.map(({ application, email, displayName }) => ({
      application,
      email,
      displayName,
      statusLabel: agentAppStatusLabel(application.status),
    })),
    total,
    page,
    pageSize,
  );
}

export async function listAgentApplicationEvents(
  db: AppDb,
  applicationId: string,
  limit = 50,
) {
  return db
    .select({
      id: loyaltyAgentApplicationEvents.id,
      action: loyaltyAgentApplicationEvents.action,
      actor: loyaltyAgentApplicationEvents.actor,
      payload: loyaltyAgentApplicationEvents.payload,
      createdAt: loyaltyAgentApplicationEvents.createdAt,
    })
    .from(loyaltyAgentApplicationEvents)
    .where(eq(loyaltyAgentApplicationEvents.applicationId, applicationId))
    .orderBy(desc(loyaltyAgentApplicationEvents.createdAt))
    .limit(limit);
}

/**
 * Staff status transition under row lock. No ledger / agent_earn.
 */
export async function setAgentApplicationStatus(
  db: AppDb,
  input: {
    applicationId: string;
    status: string;
    actor: string;
    publicNote?: string | null;
    reason?: string | null;
  },
): Promise<SetAgentApplicationStatusResult> {
  if (!isAgentAppStatus(input.status)) {
    return { ok: false, code: "invalid_status" };
  }

  const publicNote =
    input.publicNote === undefined || input.publicNote === null
      ? undefined
      : clean(input.publicNote, 500);
  if (publicNote !== undefined && input.publicNote && !publicNote) {
    return { ok: false, code: "invalid_note" };
  }

  const reason = input.reason ? clean(input.reason, 500) : null;
  const correlationId = randomUUID();

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select 1 from app.loyalty_agent_applications where id = ${input.applicationId} for update`,
    );

    const [current] = await tx
      .select()
      .from(loyaltyAgentApplications)
      .where(eq(loyaltyAgentApplications.id, input.applicationId))
      .limit(1);

    if (!current) {
      return { ok: false as const, code: "not_found" as const };
    }

    const nextNote =
      publicNote === undefined ? current.publicNote : publicNote;
    const unchanged =
      current.status === input.status &&
      (current.publicNote ?? null) === (nextNote ?? null);

    if (unchanged) {
      return {
        ok: true as const,
        application: current,
        already: true,
      };
    }

    const now = new Date();
    const [updated] = await tx
      .update(loyaltyAgentApplications)
      .set({
        status: input.status,
        publicNote: nextNote,
        reviewedBy: input.actor,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(loyaltyAgentApplications.id, input.applicationId))
      .returning();

    await tx.insert(loyaltyAgentApplicationEvents).values({
      applicationId: input.applicationId,
      action: "status_set",
      actor: input.actor,
      payload: {
        correlationId,
        before: {
          status: current.status,
          publicNote: current.publicNote,
        },
        after: {
          status: input.status,
          publicNote: nextNote,
        },
        reason,
      },
    });

    return {
      ok: true as const,
      application: updated!,
      already: false,
    };
  });
}
