import { cookies } from "next/headers";
import Link from "next/link";
import { getDb } from "@/server/db/client";
import {
  isStaffAuthConfigured,
  STAFF_COOKIE_NAME,
  verifyStaffToken,
} from "@/server/staff/auth";
import {
  WORKFLOW_STATUS_LABELS_RU,
  type WorkflowStatus,
} from "@/server/staff/contracts";
import { listStaffLeads } from "@/server/staff/commands";
import { Banner } from "@/components/ui/card";
import { EmptyState, FormStatus } from "@/components/ui/feedback";
import { StaffLoginForm } from "./staff-login-form";
import { WorkflowBadge } from "./workflow-badge";

export const dynamic = "force-dynamic";

export default async function StaffHomePage({
  searchParams,
}: {
  searchParams: Promise<{ workflowStatus?: string }>;
}) {
  if (!isStaffAuthConfigured()) {
    return (
      <Banner tone="frost" className="border-gletcher-action/40">
        <p className="font-display text-lg uppercase tracking-wide text-gletcher-action">
          STAFF_API_TOKEN не задан
        </p>
        <p className="type-body-small mt-2 text-gletcher-navy/80">
          Добавьте токен ≥ 16 символов в{" "}
          <code className="rounded bg-gletcher-white/80 px-1.5 py-0.5 text-xs">
            .env.local
          </code>{" "}
          и перезапустите Next.js.
        </p>
      </Banner>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  if (!verifyStaffToken(token)) {
    return <StaffLoginForm />;
  }

  const params = await searchParams;
  const workflowStatus =
    params.workflowStatus &&
    ["new", "in_progress", "waiting", "done", "spam"].includes(
      params.workflowStatus,
    )
      ? (params.workflowStatus as WorkflowStatus)
      : undefined;

  let leads: Awaited<ReturnType<typeof listStaffLeads>> = [];
  let error: string | null = null;
  try {
    leads = await listStaffLeads(getDb(), { workflowStatus, limit: 100 });
  } catch {
    error = "База недоступна — проверьте embedded PostgreSQL.";
  }

  return (
    <div className="space-y-[var(--grid-gap)]">
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase">
        Заявки
      </h1>

      <nav
        className="flex flex-wrap gap-2"
        aria-label="Фильтр по статусу workflow"
      >
        <FilterChip href="/staff" active={!workflowStatus} label="Все" />
        {(Object.keys(WORKFLOW_STATUS_LABELS_RU) as WorkflowStatus[]).map(
          (s) => (
            <FilterChip
              key={s}
              href={`/staff?workflowStatus=${s}`}
              active={workflowStatus === s}
              label={WORKFLOW_STATUS_LABELS_RU[s]}
            />
          ),
        )}
      </nav>

      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}

      {!error && leads.length === 0 ? (
        <EmptyState
          title="Нет заявок"
          body="Отправьте тестовую форму на сайте или снимите фильтр статуса."
        />
      ) : null}

      {leads.length > 0 ? (
        <>
          {/* Mobile: stacked cards */}
          <ul className="grid gap-3 md:hidden">
            {leads.map((lead) => (
              <li key={lead.submissionId}>
                <Link
                  href={`/staff/leads/${lead.submissionId}`}
                  className="block rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-white p-4 transition-colors hover:bg-gletcher-frost/50 focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-gletcher-navy"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold tracking-wide uppercase">
                        {lead.formId}
                      </p>
                      <p className="type-caption mt-0.5 text-gletcher-navy/60">
                        {lead.sourcePath}
                      </p>
                    </div>
                    <WorkflowBadge status={lead.workflowStatus} />
                  </div>
                  <p className="mt-3 text-sm">{lead.name ?? "—"}</p>
                  <p className="type-caption text-gletcher-navy/65">
                    {lead.email ?? lead.phone ?? "—"}
                  </p>
                  <div className="type-caption mt-3 flex justify-between gap-2 text-gletcher-navy/55">
                    <span>
                      {lead.createdAt
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}
                    </span>
                    <span>{lead.assignee ?? "без исполнителя"}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: dense table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-white md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gletcher-navy/15 bg-gletcher-frost/60">
                <tr className="type-label text-gletcher-navy/70">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Когда
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Форма
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Контакт
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Статус
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Исполнитель
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.submissionId}
                    className="border-t border-gletcher-navy/10 transition-colors hover:bg-gletcher-frost/40"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gletcher-navy/65">
                      {lead.createdAt
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/staff/leads/${lead.submissionId}`}
                        className="font-semibold text-gletcher-navy underline decoration-gletcher-red/70 underline-offset-2 hover:decoration-gletcher-red focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-gletcher-navy"
                      >
                        {lead.formId}
                      </Link>
                      <div className="type-caption text-gletcher-navy/55">
                        {lead.sourcePath}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{lead.name ?? "—"}</div>
                      <div className="type-caption text-gletcher-navy/55">
                        {lead.email ?? lead.phone ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <WorkflowBadge status={lead.workflowStatus} />
                    </td>
                    <td className="px-4 py-3 text-gletcher-navy/70">
                      {lead.assignee ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors sm:text-sm focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-gletcher-navy ${
        active
          ? "border-gletcher-navy bg-gletcher-navy text-gletcher-white"
          : "border-gletcher-navy/40 bg-gletcher-ice text-gletcher-navy hover:border-gletcher-navy"
      }`}
    >
      {label}
    </Link>
  );
}
