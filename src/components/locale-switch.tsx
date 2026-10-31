"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  LOCALE_LABEL,
  PUBLISHED_LOCALES,
  type PublishedLocale,
} from "@/i18n/locales";

type LocaleSwitchProps = {
  /**
   * Optional per-locale hrefs for the same entity (e.g. product with different slugs).
   * When omitted, keeps the current pathname under each published locale.
   */
  localeHrefs?: Partial<Record<PublishedLocale, string>>;
  className?: string;
  /**
   * `header` — filled pills; with `scaled` height follows `--ctrl-h`
   * (same as Агент / Меню under Tilda window-upscale).
   */
  variant?: "default" | "header";
  /** Use CSS vars from SiteHeader (`--ctrl-h`, `--font`, `--hs`). */
  scaled?: boolean;
};

function useLocationHash(pathname: string) {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    // Native hashchange misses History API navigations (Next Link).
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  return hash;
}

function localeHref(
  pathname: string,
  customHref: string | undefined,
  hash: string,
) {
  const base = customHref ?? pathname;
  if (!hash) return base;
  // Avoid doubling hash if a custom href already includes one.
  return base.includes("#") ? base : `${base}${hash}`;
}

export function LocaleSwitch({
  localeHrefs,
  className = "",
  variant = "default",
  scaled = false,
}: LocaleSwitchProps) {
  const locale = useLocale() as PublishedLocale;
  const pathname = usePathname();
  const hash = useLocationHash(pathname);
  const t = useTranslations("a11y");

  if (variant === "header") {
    return (
      <div
        className={`inline-flex items-center rounded-full border border-gletcher-navy/25 bg-gletcher-white/70 font-semibold tracking-wide ${
          scaled ? "" : "h-8 p-0.5 text-xs sm:h-10 lg:h-8"
        } ${className}`}
        style={
          scaled
            ? {
                height: "var(--ctrl-h)",
                padding: `calc(2px * var(--hs))`,
                fontSize: `calc(12px * var(--hs))`,
              }
            : undefined
        }
        role="group"
        aria-label={t("locale")}
      >
        {PUBLISHED_LOCALES.map((code) => {
          const active = locale === code;
          const customHref = localeHrefs?.[code];
          if (customHref === null) return null;
          return (
            <Link
              key={code}
              href={localeHref(pathname, customHref, hash)}
              locale={code}
              scroll={false}
              className={`inline-flex h-full items-center rounded-full uppercase transition-colors ${
                active
                  ? "bg-gletcher-navy text-gletcher-white"
                  : "text-gletcher-navy/70 hover:text-gletcher-navy"
              }`}
              style={
                scaled
                  ? { paddingInline: `calc(10px * var(--hs))` }
                  : { paddingInline: "0.625rem" }
              }
              aria-current={active ? "page" : undefined}
            >
              {LOCALE_LABEL[code]}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-gletcher-navy/25 bg-gletcher-white/70 p-0.5 text-xs font-semibold tracking-wide ${className}`}
      role="group"
      aria-label={t("locale")}
    >
      {PUBLISHED_LOCALES.map((code) => {
        const active = locale === code;
        const customHref = localeHrefs?.[code];
        if (customHref === null) return null;
        return (
          <Link
            key={code}
            href={localeHref(pathname, customHref, hash)}
            locale={code}
            scroll={false}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              active
                ? "bg-gletcher-navy text-gletcher-white"
                : "text-gletcher-navy/70 hover:text-gletcher-navy"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {LOCALE_LABEL[code]}
          </Link>
        );
      })}
    </div>
  );
}
