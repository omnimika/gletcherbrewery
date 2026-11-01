import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogVacancies } from "@/components/blog/blog-vacancies";
import { SiteShell } from "@/components/site-shell";
import { blogListingHref } from "@/content/blog";
import { VACANCIES_PAGE } from "@/content/blog/vacancies";
import { DEFAULT_LOCALE, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type VacanciesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: VacanciesPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale) || locale !== DEFAULT_LOCALE) return {};
  return {
    title: { absolute: "Вакансии | Пивоварня Глетчер" },
    description: VACANCIES_PAGE.description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: VACANCIES_PAGE.path,
      languages: {
        ru: VACANCIES_PAGE.path,
        "x-default": VACANCIES_PAGE.path,
      },
    },
  };
}

export default async function VacanciesPage({ params }: VacanciesPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);
  const t = await getTranslations("blog");

  return (
    <SiteShell
      localeHrefs={{
        ru: VACANCIES_PAGE.path,
        en: blogListingHref(),
      }}
    >
      <BlogVacancies backLabel={t("backToBlog")} />
    </SiteShell>
  );
}
