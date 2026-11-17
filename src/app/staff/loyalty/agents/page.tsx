import { StaffListToolbar } from "@/components/staff/list-toolbar";
import { Banner } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { getDb } from "@/server/db/client";
import {
  AGENT_APP_STATUS_LABELS_RU,
  isAgentAppStatus,
} from "@/lib/loyalty/agent-application-status";
import { parseStaffEmailFilter } from "@/lib/staff-email-filter";
import { parseStaffSort } from "@/lib/staff-sort";
import {
  listAgentApplicationEvents,
  listAgentApplicationsForStaff,
  STAFF_AGENT_SORT_FIELDS,
} from "@/server/loyalty/agent-applications";
import { LOYALTY_STAFF_ROLES } from "@/server/staff/roles";
import { gateStaffPage } from "@/server/staff/page-gate";
import { StaffLoginForm } from "../../staff-login-form";
import { AgentActions } from "./agent-actions";

export const dynamic = "force-dynamic";

const AGENT_SORT_OPTIONS = [
  { key: "createdAt", label: "Дата" },
  { key: "city", label: "Город" },
] as const;

export default async function StaffLoyaltyAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    page?: string;
    sort?: string;
    dir?: string;
    email?: string;
  }>;
}) {
  const gate = await gateStaffPage(LOYALTY_STAFF_ROLES);
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
        <p className="type-body-small mt-2">Роль {gate.actor.role} не открывает loyalty.</p>
      </Banner>
    );
  }

  const sp = await searchParams;
  const statusFilter =
    sp.status && isAgentAppStatus(sp.status) ? sp.status : null;
  const emailFilter = parseStaffEmailFilter(sp.email);
  const { sort, dir } = parseStaffSort(
    sp,
    STAFF_AGENT_SORT_FIELDS,
    "createdAt",
    "desc",
  );

  let pageResult: Awaited<
    ReturnType<typeof listAgentApplicationsForStaff>
  > | null = null;
  let error: string | null = null;
  try {
    pageResult = await listAgentApplicationsForStaff(getDb(), {
      status: statusFilter,
      email: emailFilter,
      page: sp.page,
      pageSize: 50,
      sort,
      dir,
    });
  } catch {
    error = "База недоступна — проверьте embedded PostgreSQL.";
  }

  const rows = pageResult?.rows ?? [];
  const withEvents = await Promise.all(
    rows.map(async (row) => {
      let events: Awaited<ReturnType<typeof listAgentApplicationEvents>> = [];
      try {
        events = await listAgentApplicationEvents(
          getDb(),
          row.application.id,
          5,
        );
      } catch {
        events = [];
      }
      return { ...row, events };
    }),
  );

  const filterQs = [
    statusFilter ? `status=${statusFilter}` : null,
    emailFilter ? `email=${encodeURIComponent(emailFilter)}` : null,
    `sort=${sort}`,
    `dir=${dir}`,
  ]
    .filter(Boolean)
    .join("&");
  const qsPrefix = filterQs ? `${filterQs}&` : "";
  const statusBaseQs = [
    emailFilter ? `email=${encodeURIComponent(emailFilter)}` : null,
    `sort=${sort}`,
    `dir=${dir}`,
  ]
    .filter(Boolean)
    .join("&");

  return (
    <div className="space-y-[var(--grid-gap)]">
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase">
        Заявки агентов
      </h1>
      <p className="type-body-small max-w-2xl text-gletcher-navy/70">
        Очередь «Стать агентом»: девять статусов Airtable, audit событий. Решение
        не начисляет баллы автоматически. По умолчанию — от новых к старым.
      </p>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          href={`/staff/loyalty/agents?${statusBaseQs}`}
          active={!statusFilter}
        >
          Все
        </FilterChip>
        {(
          [
            "under_review",
            "approved",
            "rejected",
            "active_client",
            "no_contact",
          ] as const
        ).map((s) => (
          <FilterChip
            key={s}
            href={`/staff/loyalty/agents?status=${s}&${statusBaseQs}`}
            active={statusFilter === s}
          >
            {AGENT_APP_STATUS_LABELS_RU[s]}
          </FilterChip>
        ))}
      </div>

      {error ? (
        <Banner tone="frost">
          <p>{error}</p>
        </Banner>
      ) : null}

      {!error && pageResult ? (
        <StaffListToolbar
          options={AGENT_SORT_OPTIONS}
          sort={sort}
          dir={dir}
          buildSortHref={(s, d) =>
            `/staff/loyalty/agents?${[
              statusFilter ? `status=${statusFilter}` : null,
              emailFilter ? `email=${encodeURIComponent(emailFilter)}` : null,
              `sort=${s}`,
              `dir=${d}`,
            ]
              .filter(Boolean)
              .join("&")}`
          }
          page={pageResult.page}
          totalPages={pageResult.totalPages}
          total={pageResult.total}
          pageSize={pageResult.pageSize}
          buildPageHref={(p) => `/staff/loyalty/agents?${qsPrefix}page=${p}`}
          emailFilter={{
            action: "/staff/loyalty/agents",
            email: emailFilter,
            hiddenFields: {
              status: statusFilter,
              sort,
              dir,
            },
          }}
        />
      ) : null}

      {withEvents.length === 0 && !error ? (
        <EmptyState title="Очередь пуста" body="Новых заявок нет." />
      ) : (
        <ul className="grid gap-3">
          {withEvents.map(
            ({ application, email, displayName, statusLabel, events }) => (
              <li
                key={application.id}
                className="rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {displayName ?? email}{" "}
                      <span className="type-caption font-normal text-gletcher-navy/55">
                        {email}
                      </span>
                    </p>
                    <p className="type-caption mt-1 text-gletcher-navy/65">
                      {application.createdAt
                        .toISOString()
                        .replace("T", " ")
                        .slice(0, 16)}{" "}
                      · {application.city} · {application.venueType} ·{" "}
                      {application.phone}
                    </p>
                    <p className="mt-2 text-sm">
                      <strong>{application.venueName}</strong>
                      <span className="text-gletcher-navy/60">
                        {" "}
                        — {application.venueAddress}
                      </span>
                    </p>
                    {application.venueBoss ? (
                      <p className="type-caption mt-1 text-gletcher-navy/65">
                        Контакт: {application.venueBoss}
                      </p>
                    ) : null}
                    {application.comment ? (
                      <p className="type-caption mt-1 text-gletcher-navy/65">
                        Комментарий участника: {application.comment}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm">
                      Статус: <strong>{statusLabel}</strong>
                      {application.reviewedBy ? (
                        <span className="type-caption text-gletcher-navy/55">
                          {" "}
                          · {application.reviewedBy}
                        </span>
                      ) : null}
                    </p>
                    {events.length > 0 ? (
                      <ul className="mt-2 space-y-0.5 border-t border-gletcher-navy/10 pt-2">
                        {events.map((ev) => (
                          <li
                            key={ev.id}
                            className="type-caption text-gletcher-navy/55"
                          >
                            {ev.createdAt.toISOString().slice(0, 16)} ·{" "}
                            {ev.action} · {ev.actor}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <AgentActions
                    applicationId={application.id}
                    currentStatus={application.status}
                    currentPublicNote={application.publicNote}
                  />
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`rounded border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${
        active
          ? "border-gletcher-navy bg-gletcher-navy text-gletcher-white"
          : "border-gletcher-navy/30 text-gletcher-navy/70 hover:border-gletcher-navy/50"
      }`}
    >
      {children}
    </a>
  );
}
