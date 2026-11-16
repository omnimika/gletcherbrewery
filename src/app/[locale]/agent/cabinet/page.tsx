import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { MembersLkClient } from "@/components/members-lk/lk-client";
import { SiteShell } from "@/components/site-shell";
import type { LkAgentApplicationRow } from "@/components/members-lk/types";
import {
  AGENT_CABINET_PATH,
  MEMBERS_LOGIN_PATH,
} from "@/content/members-lk";
import { DEFAULT_LOCALE, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { getDb } from "@/server/db/client";
import { latestOpenAgentApplication } from "@/server/loyalty/agent-applications";
import { loyaltyProgressFromLifetime } from "@/server/loyalty/level";
import {
  MEMBER_SESSION_COOKIE,
  resolveMemberSession,
} from "@/server/loyalty/magic-link";
import { listReceiptsForMember } from "@/server/loyalty/receipts";
import {
  lifetimeEarnForMember,
  spendableBalanceForMember,
} from "@/server/loyalty/spendable";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "Личный кабинет | Агент Глетчер" },
    robots: { index: false, follow: false },
  };
}

function siteOriginFromHeaders(h: Headers): string {
  const host = h.get("x-forwarded-host")?.split(",")[0]?.trim() || h.get("host");
  if (host && !host.startsWith("0.0.0.0")) {
    const proto =
      h.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() ||
    "https://www.gletcherbrewery.com"
  );
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
  let spendable = 0;
  let lifetimeEarn = 0;
  let receipts: Awaited<ReturnType<typeof listReceiptsForMember>> = [];
  let pendingAgent: LkAgentApplicationRow | null = null;
  try {
    member = await resolveMemberSession(getDb(), token);
    if (member) {
      spendable = await spendableBalanceForMember(getDb(), member.id);
      lifetimeEarn = await lifetimeEarnForMember(getDb(), member.id);
      receipts = await listReceiptsForMember(getDb(), member.id, 30);
      pendingAgent = await latestOpenAgentApplication(getDb(), member.id);
    }
  } catch {
    member = null;
  }
  if (!member) redirect(MEMBERS_LOGIN_PATH);

  const progress = loyaltyProgressFromLifetime(lifetimeEarn);
  const origin = siteOriginFromHeaders(await headers());
  const referralUrl = `${origin}${AGENT_CABINET_PATH}?utm_source=${encodeURIComponent(member.id)}&utm_medium=referral&utm_campaign=friends`;

  return (
    <SiteShell
      hideFooter
      localeHrefs={{
        ru: AGENT_CABINET_PATH,
        en: { fallback: "/" },
      }}
    >
      <div className="px-[var(--page-gutter)] pt-3 pb-8 md:pt-6 md:pb-12">
        <MembersLkClient
          defaultCity={member.city ?? undefined}
          defaultPhone={member.phone ?? undefined}
          pendingAgent={pendingAgent}
          info={{
            email: member.emailNormalized,
            displayName: member.displayName,
            city: member.city,
            spendable,
            lifetimeEarn,
            level: progress.level,
            toNextLevel: progress.toNextLevel,
            progressPct: progress.progressPct,
            status: progress.status,
            prize: progress.prize,
            referralUrl,
          }}
          receipts={receipts.map((r) => ({
            id: r.id,
            purchaseAt: r.purchaseAt,
            city: r.city,
            venue: r.venueNetwork || r.venueName,
            sum: r.gletcherSumRub,
            proposedEarn: r.proposedEarn,
            status: r.status,
          }))}
        />
      </div>
    </SiteShell>
  );
}
