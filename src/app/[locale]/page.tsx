import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/site-shell";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("home");

  return (
    <SiteShell>
      <section className="relative mx-auto flex min-h-[70svh] w-full max-w-[1440px] flex-col justify-center px-6 py-20 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 70% 20%, rgb(147 204 230 / 0.45), transparent 60%), radial-gradient(ellipse 60% 40% at 20% 80%, rgb(229 55 60 / 0.12), transparent 55%)",
          }}
          aria-hidden
        />
        <p className="animate-hero-rise relative text-xs font-semibold tracking-[0.25em] text-gletcher-navy/70 uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-display animate-hero-rise relative mt-4 max-w-4xl text-[clamp(3rem,12vw,8rem)] text-gletcher-navy">
          {t("title")}
        </h1>
        <p className="animate-hero-rise relative mt-6 max-w-lg text-base leading-relaxed text-gletcher-navy/80 sm:text-lg">
          {t("lead")}
        </p>
        <div className="animate-hero-rise relative mt-10 flex flex-wrap gap-4">
          <Link
            href="/beer"
            className="bg-gletcher-red px-6 py-3 text-sm font-semibold tracking-wide text-gletcher-white uppercase transition-colors hover:bg-gletcher-deep"
          >
            {t("ctaCatalog")}
          </Link>
          <Link
            href="/agent"
            className="border border-gletcher-navy px-6 py-3 text-sm font-semibold tracking-wide text-gletcher-navy uppercase transition-colors hover:bg-gletcher-navy hover:text-gletcher-white"
          >
            {t("ctaAgent")}
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
