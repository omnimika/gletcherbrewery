import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { MembersLkClient } from "@/components/members-lk/lk-client";
import { SiteShell } from "@/components/site-shell";
import {
  MEMBERS_LK_PATH,
  MEMBERS_LOGIN_PATH,
} from "@/content/members-lk";
import { DEFAULT_LOCALE, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { getDb } from "@/server/db/client";
import { provisionalLevelFromLifetime } from "@/server/loyalty/level";
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

export default async function MembersLkPage({ params }: PageProps) {
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
  try {
    member = await resolveMemberSession(getDb(), token);
    if (member) {
      spendable = await spendableBalanceForMember(getDb(), member.id);
      lifetimeEarn = await lifetimeEarnForMember(getDb(), member.id);
      receipts = await listReceiptsForMember(getDb(), member.id, 30);
    }
  } catch {
    member = null;
  }
  if (!member) redirect(MEMBERS_LOGIN_PATH);

  const level = provisionalLevelFromLifetime(lifetimeEarn);
  const origin = siteOriginFromHeaders(await headers());
  const referralUrl = `${origin}${MEMBERS_LK_PATH}?utm_source=${encodeURIComponent(member.id)}&utm_medium=referral&utm_campaign=friends`;

  return (
    <SiteShell
      hideFooter
      localeHrefs={{
        ru: MEMBERS_LK_PATH,
        en: { fallback: "/" },
      }}
    >
      <main className="mx-auto max-w-[72rem] px-[var(--page-gutter)] py-10 md:py-14">
        <MembersLkClient
          defaultCity={member.city ?? undefined}
          info={{
            email: member.emailNormalized,
            displayName: member.displayName,
            city: member.city,
            spendable,
            lifetimeEarn,
            level: level.level,
            toNextLevel: level.toNextLevel,
            progressPct: level.progressPct,
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
      </main>
    </SiteShell>
  );
}
