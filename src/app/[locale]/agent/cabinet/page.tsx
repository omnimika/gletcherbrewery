import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/feedback";
import { SiteShell } from "@/components/site-shell";
import { AGENT_PATH } from "@/content/agent";
import { DEFAULT_LOCALE, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { getDb } from "@/server/db/client";
import {
  MEMBER_SESSION_COOKIE,
  resolveMemberSession,
} from "@/server/loyalty/magic-link";
import { listReceiptsForMember } from "@/server/loyalty/receipts";
import { spendableBalanceForMember } from "@/server/loyalty/spendable";
import { CabinetLogoutButton } from "./logout-button";
import { ReceiptUploadForm } from "./receipt-upload-form";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const STATUS_LABEL: Record<string, string> = {
  pending_staff: "На проверке",
  pending_upload: "Черновик",
  verified: "Начислено",
  rejected: "Отклонён",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "Кабинет — Агент Глетчер" },
    robots: { index: false, follow: false },
  };
}

export default async function AgentCabinetPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  if (locale !== DEFAULT_LOCALE) notFound();
  setRequestLocale(locale);

  const token = (await cookies()).get(MEMBER_SESSION_COOKIE)?.value;
  let member = null;
  let balance = 0;
  let receipts: Awaited<ReturnType<typeof listReceiptsForMember>> = [];
  try {
    member = await resolveMemberSession(getDb(), token);
    if (member) {
      balance = await spendableBalanceForMember(getDb(), member.id);
      receipts = await listReceiptsForMember(getDb(), member.id, 20);
    }
  } catch {
    member = null;
  }
  if (!member) redirect("/agent/login");

  return (
    <SiteShell
      hideFooter
      localeHrefs={{
        ru: `${AGENT_PATH}/cabinet`,
        en: { fallback: "/" },
      }}
    >
      <main className="mx-auto max-w-[var(--reading-measure)] px-[var(--page-gutter)] py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="type-caption font-bold tracking-[0.2em] text-gletcher-navy/55 uppercase">
              Агент Глетчер
            </p>
            <h1 className="font-display mt-3 text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase">
              Кабинет
            </h1>
          </div>
          <CabinetLogoutButton />
        </div>

        <section className="mt-10 grid gap-4 rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-white p-5 sm:grid-cols-2">
          <div>
            <p className="type-caption text-gletcher-navy/55">Email</p>
            <p className="mt-1 text-sm text-gletcher-navy">
              {member.emailNormalized}
            </p>
          </div>
          <div>
            <p className="type-caption text-gletcher-navy/55">
              Баланс (можно тратить)
            </p>
            <p className="font-display mt-1 text-3xl font-extrabold tracking-wide text-gletcher-navy">
              {balance}{" "}
              <span className="text-lg font-bold text-gletcher-red">₿</span>
            </p>
          </div>
        </section>

        <ReceiptUploadForm defaultCity={member.city ?? undefined} />

        <section className="mt-10">
          <h2 className="font-display text-lg font-extrabold tracking-wide text-gletcher-navy uppercase">
            Мои чеки
          </h2>
          {receipts.length === 0 ? (
            <p className="type-body-small mt-3 text-gletcher-navy/60">
              Пока нет загрузок — прикрепите фото чека выше.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {receipts.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-gletcher-navy/20 bg-gletcher-white px-4 py-3"
                >
                  <div className="text-sm text-gletcher-navy">
                    <p>
                      {r.purchaseAt ?? "—"} · {r.city ?? "—"}
                    </p>
                    <p className="type-caption mt-0.5 text-gletcher-navy/60">
                      {r.venueNetwork || r.venueName || "—"} ·{" "}
                      {r.gletcherSumRub ?? "?"} ₽
                      {r.proposedEarn != null
                        ? ` · ~${r.proposedEarn} ₿`
                        : ""}
                    </p>
                  </div>
                  <Badge
                    tone={
                      r.status === "verified"
                        ? "new"
                        : r.status === "rejected"
                          ? "red"
                          : "muted"
                    }
                  >
                    {STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </SiteShell>
  );
}
