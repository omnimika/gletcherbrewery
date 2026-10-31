"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-gletcher-navy/10 bg-gletcher-ice">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl text-gletcher-navy">Gletcher</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-gletcher-navy/75">
            {t("tagline")}
          </p>
          <p className="mt-6 text-xs font-semibold tracking-widest text-gletcher-navy uppercase">
            {t("drinkResponsibly")}
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold tracking-wide text-gletcher-navy uppercase">
            {t("contacts")}
          </p>
          <a
            href="mailto:info@gletcherbrewery.com"
            className="block text-gletcher-navy/80 underline-offset-4 hover:underline"
          >
            info@gletcherbrewery.com
          </a>
          <a
            href="tel:+74959892414"
            className="block text-gletcher-navy/80 underline-offset-4 hover:underline"
          >
            +7 (495) 989-24-14
          </a>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold tracking-wide text-gletcher-navy uppercase">
            {t("docs")}
          </p>
          <Link
            href="/policy"
            className="block text-gletcher-navy/80 underline-offset-4 hover:underline"
          >
            {t("policy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
