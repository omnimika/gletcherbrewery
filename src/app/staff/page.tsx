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
import { LogoutButton } from "./logout-button";
import { StaffLoginForm } from "./staff-login-form";

export const dynamic = "force-dynamic";

export default async function StaffHomePage({
  searchParams,
}: {
  searchParams: Promise<{ workflowStatus?: string }>;
}) {
  if (!isStaffAuthConfigured()) {
    return (
      <div className="rounded-lg border border-amber-800/60 bg-amber-950/30 p-6 text-sm">
        <p className="font-medium text-amber-200">STAFF_API_TOKEN не задан</p>
        <p className="mt-2 text-zinc-400">
          Добавьте в <code>.env.local</code> токен ≥ 16 символов и перезапустите
          Next.js.
        </p>
      </div>
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Заявки</h1>
        <LogoutButton />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
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
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Когда</th>
              <th className="px-3 py-2">Форма</th>
              <th className="px-3 py-2">Контакт</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Исполнитель</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.submissionId}
                className="border-t border-zinc-800 hover:bg-zinc-900/50"
              >
                <td className="px-3 py-2 whitespace-nowrap text-zinc-400">
                  {lead.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/staff/leads/${lead.submissionId}`}
                    className="text-amber-300 hover:underline"
                  >
                    {lead.formId}
                  </Link>
                  <div className="text-xs text-zinc-500">{lead.sourcePath}</div>
                </td>
                <td className="px-3 py-2">
                  <div>{lead.name ?? "—"}</div>
                  <div className="text-xs text-zinc-500">
                    {lead.email ?? lead.phone ?? "—"}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {WORKFLOW_STATUS_LABELS_RU[
                    lead.workflowStatus as WorkflowStatus
                  ] ?? lead.workflowStatus}
                </td>
                <td className="px-3 py-2 text-zinc-400">
                  {lead.assignee ?? "—"}
                </td>
              </tr>
            ))}
            {leads.length === 0 && !error ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-zinc-500"
                >
                  Нет заявок
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
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
      className={
        active
          ? "rounded-full bg-amber-600 px-3 py-1 text-zinc-950"
          : "rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 hover:border-zinc-500"
      }
    >
      {label}
    </Link>
  );
}
