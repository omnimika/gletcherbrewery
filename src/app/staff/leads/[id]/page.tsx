import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDb } from "@/server/db/client";
import {
  isStaffAuthConfigured,
  STAFF_COOKIE_NAME,
  verifyStaffToken,
} from "@/server/staff/auth";
import { getStaffLeadDetail } from "@/server/staff/commands";
import {
  CardBody,
  CardHeading,
  CardShell,
} from "@/components/ui/card";
import { FormStatus } from "@/components/ui/feedback";
import { LeadActions } from "../../lead-actions";
import { WorkflowBadge } from "../../workflow-badge";

export const dynamic = "force-dynamic";

export default async function StaffLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isStaffAuthConfigured()) {
    redirect("/staff");
  }

  const cookieStore = await cookies();
  if (!verifyStaffToken(cookieStore.get(STAFF_COOKIE_NAME)?.value)) {
    redirect("/staff");
  }

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  let detail: Awaited<ReturnType<typeof getStaffLeadDetail>>;
  try {
    detail = await getStaffLeadDetail(getDb(), id);
  } catch {
    return (
      <FormStatus tone="error" role="alert">
        База недоступна — проверьте embedded PostgreSQL.
      </FormStatus>
    );
  }
  if (!detail) notFound();

  const { lead, jobs, events } = detail;

  return (
    <div className="space-y-[var(--grid-gap)]">
      <div>
        <Link
          href="/staff"
          className="type-label text-gletcher-navy/60 underline decoration-gletcher-navy/30 underline-offset-2 hover:text-gletcher-navy hover:decoration-gletcher-red focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-gletcher-navy"
        >
          ← К списку заявок
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase">
              {lead.formId}
            </h1>
            <p className="type-caption mt-2 text-gletcher-navy/60">
              {lead.sourcePath} · {lead.locale}
            </p>
            <p className="mt-1 font-mono text-[0.6875rem] break-all text-gletcher-navy/45">
              {lead.submissionId}
            </p>
          </div>
          <WorkflowBadge status={lead.workflowStatus} />
        </div>
      </div>

      <CardShell className="bg-gletcher-white">
        <CardHeading as="h2">Карточка заявки</CardHeading>
        <CardBody className="!text-gletcher-navy">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="type-label text-gletcher-navy/55">Контакт</dt>
              <dd className="mt-1 font-medium">{lead.name ?? "—"}</dd>
              <dd className="type-body-small text-gletcher-navy/75">
                {lead.email ?? "—"}
              </dd>
              <dd className="type-body-small text-gletcher-navy/75">
                {lead.phone ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="type-label text-gletcher-navy/55">Компания / город</dt>
              <dd className="mt-1 font-medium">{lead.company ?? "—"}</dd>
              <dd className="type-body-small text-gletcher-navy/75">
                {lead.city ?? "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="type-label text-gletcher-navy/55">Комментарий</dt>
              <dd className="mt-1 whitespace-pre-wrap">
                {lead.comment ?? "—"}
              </dd>
            </div>
            {(lead.partnerType ||
              lead.inn ||
              lead.tourDate ||
              lead.guests ||
              lead.wishes) && (
              <div className="sm:col-span-2 space-y-1 border-t border-gletcher-navy/10 pt-4">
                <dt className="type-label text-gletcher-navy/55">Доп. поля</dt>
                {lead.partnerType ? <dd>type: {lead.partnerType}</dd> : null}
                {lead.inn ? <dd>INN: {lead.inn}</dd> : null}
                {lead.tourDate ? <dd>date: {lead.tourDate}</dd> : null}
                {lead.guests ? <dd>guests: {lead.guests}</dd> : null}
                {lead.wishes ? <dd>wishes: {lead.wishes}</dd> : null}
              </div>
            )}
            <div>
              <dt className="type-label text-gletcher-navy/55">Intake</dt>
              <dd className="mt-1">{lead.status}</dd>
            </div>
            <div>
              <dt className="type-label text-gletcher-navy/55">Создано</dt>
              <dd className="mt-1">
                {lead.createdAt.toISOString().replace("T", " ").slice(0, 19)}
              </dd>
            </div>
          </dl>
        </CardBody>
      </CardShell>

      <LeadActions
        submissionId={lead.submissionId}
        workflowStatus={lead.workflowStatus}
        assignee={lead.assignee}
        staffNote={lead.staffNote}
        jobs={jobs}
      />

      <CardShell className="bg-gletcher-frost/50">
        <CardHeading as="h2">Audit</CardHeading>
        <CardBody className="!text-gletcher-navy">
          {events.length === 0 ? (
            <p className="type-body-small text-gletcher-navy/65">
              Пока нет событий — смена статуса, назначение и replay появятся
              здесь.
            </p>
          ) : (
            <ol className="space-y-3">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-[var(--radius-control)] border border-gletcher-navy/15 bg-gletcher-white px-3 py-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="type-caption text-gletcher-navy/55">
                      {ev.createdAt.toISOString().replace("T", " ").slice(0, 19)}{" "}
                      · {ev.actor}
                    </p>
                    <p className="font-mono text-xs font-semibold tracking-wide uppercase text-gletcher-navy">
                      {ev.action}
                    </p>
                  </div>
                  <pre className="type-caption mt-2 overflow-x-auto text-gletcher-navy/70">
                    {JSON.stringify(ev.payload, null, 2)}
                  </pre>
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </CardShell>
    </div>
  );
}
