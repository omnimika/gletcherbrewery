import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { DEFAULT_LOCALE, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "Подтверждение входа — Агент Глетчер" },
    robots: { index: false, follow: false },
  };
}

/**
 * Pretty URL `/agent/auth/verify?token=` → server redirect to API GET
 * that sets the session cookie (no client hydration required).
 */
export default async function AgentVerifyPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { token } = await searchParams;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  if (locale !== DEFAULT_LOCALE) notFound();
  setRequestLocale(locale);

  if (token?.trim()) {
    redirect(
      `/api/loyalty/auth/verify?token=${encodeURIComponent(token.trim())}`,
    );
  }

  redirect("/agent/login?error=invalid_token");
}
