import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
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
import { getStaffLeadDetail } from "@/server/staff/commands";
import { LeadActions } from "../../lead-actions";

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
      <p className="text-sm text-red-400">
        База недоступна — проверьте embedded PostgreSQL.
      </p>
    );
  }
  if (!detail) notFound();

  const { lead, jobs, events } = detail;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/staff" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← К списку
        </Link>
        <h1 className="mt-2 text-xl font-semibold">
          {lead.formId}{" "}
          <span className="text-sm font-normal text-zinc-500">
            {lead.sourcePath}
          </span>
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">{lead.submissionId}</p>
      </div>

      <dl className="grid gap-3 rounded-lg border border-zinc-800 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Контакт</dt>
          <dd>{lead.name ?? "—"}</dd>
          <dd className="text-zinc-400">{lead.email ?? "—"}</dd>
          <dd className="text-zinc-400">{lead.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Компания / город</dt>
          <dd>{lead.company ?? "—"}</dd>
          <dd className="text-zinc-400">{lead.city ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-zinc-500">Комментарий</dt>
          <dd className="whitespace-pre-wrap">{lead.comment ?? "—"}</dd>
        </div>
        {(lead.partnerType || lead.inn || lead.tourDate || lead.guests || lead.wishes) && (
          <div className="sm:col-span-2 space-y-1">
            <dt className="text-zinc-500">Доп. поля</dt>
            {lead.partnerType ? <dd>type: {lead.partnerType}</dd> : null}
            {lead.inn ? <dd>INN: {lead.inn}</dd> : null}
            {lead.tourDate ? <dd>date: {lead.tourDate}</dd> : null}
            {lead.guests ? <dd>guests: {lead.guests}</dd> : null}
            {lead.wishes ? <dd>wishes: {lead.wishes}</dd> : null}
          </div>
        )}
        <div>
          <dt className="text-zinc-500">Workflow</dt>
          <dd>
            {WORKFLOW_STATUS_LABELS_RU[lead.workflowStatus as WorkflowStatus] ??
              lead.workflowStatus}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Intake status</dt>
          <dd>{lead.status}</dd>
        </div>
      </dl>

      <LeadActions
        submissionId={lead.submissionId}
        workflowStatus={lead.workflowStatus}
        assignee={lead.assignee}
        staffNote={lead.staffNote}
        jobs={jobs}
      />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Audit
        </h2>
        <ul className="space-y-2 text-sm">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="rounded border border-zinc-800 px-3 py-2 text-zinc-300"
            >
              <div className="flex flex-wrap justify-between gap-2 text-xs text-zinc-500">
                <span>
                  {ev.createdAt.toISOString().replace("T", " ").slice(0, 19)} ·{" "}
                  {ev.actor}
                </span>
                <span className="font-mono">{ev.action}</span>
              </div>
              <pre className="mt-1 overflow-x-auto text-xs text-zinc-400">
                {JSON.stringify(ev.payload, null, 2)}
              </pre>
            </li>
          ))}
          {events.length === 0 ? (
            <li className="text-zinc-500">Пока нет событий</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
