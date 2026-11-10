import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { FormStatus } from "@/components/ui/feedback";
import { SiteShell } from "@/components/site-shell";
import { AGENT_PATH } from "@/content/agent";
import { DEFAULT_LOCALE, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { MagicLinkLoginForm } from "./magic-link-form";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

const LOGIN_ERRORS: Record<string, string> = {
  invalid_token: "Ссылка неполная или неверная. Запросите новую.",
  expired: "Ссылка устарела. Запросите новую.",
  consumed: "Ссылка уже использована. Запросите новую.",
  db_error: "Временная ошибка сервера. Попробуйте ещё раз.",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "Вход — Агент Глетчер" },
    robots: { index: false, follow: false },
  };
}

export default async function AgentLoginPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { error } = await searchParams;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  if (locale !== DEFAULT_LOCALE) notFound();
  setRequestLocale(locale);

  const errorMessage =
    error && LOGIN_ERRORS[error]
      ? LOGIN_ERRORS[error]
      : error
        ? "Не удалось войти. Запросите новую ссылку."
        : null;

  return (
    <SiteShell
      hideFooter
      localeHrefs={{
        ru: `${AGENT_PATH}/login`,
        en: { fallback: "/" },
      }}
    >
      <main className="mx-auto flex min-h-[70vh] max-w-[var(--reading-measure)] flex-col justify-center px-[var(--page-gutter)] py-16">
        <p className="type-caption font-bold tracking-[0.2em] text-gletcher-navy/55 uppercase">
          Агент Глетчер
        </p>
        <h1 className="font-display mt-3 text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase">
          Вход в кабинет
        </h1>
        <p className="type-body-small mt-4 max-w-xl text-gletcher-navy/70">
          Вход без пароля по одноразовой ссылке. Пока Postbox не подключён,
          в локальном debug-режиме ссылка появляется на этой странице.
        </p>
        {errorMessage ? (
          <div className="mt-4">
            <FormStatus tone="error">{errorMessage}</FormStatus>
          </div>
        ) : null}
        <MagicLinkLoginForm />
        <p className="type-caption mt-8 text-gletcher-navy/50">
          <a href={AGENT_PATH} className="underline-offset-2 hover:underline">
            ← На страницу программы
          </a>
        </p>
      </main>
    </SiteShell>
  );
}
