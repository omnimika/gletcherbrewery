"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  isLocaleFallback,
  LOCALE_LABEL,
  PUBLISHED_LOCALES,
  type LocaleHrefs,
  type LocaleHrefTarget,
  type PublishedLocale,
} from "@/i18n/locales";

type LocaleSwitchProps = {
  /**
   * Optional per-locale destinations for the same entity or an explicit fallback.
   * When omitted, keeps the current pathname under each published locale.
   */
  localeHrefs?: LocaleHrefs;
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

/**
 * Resolve switcher href. Fragments transfer only onto published peers,
 * never onto unrelated fallback destinations.
 */
export function resolveLocaleSwitchHref(
  pathname: string,
  target: LocaleHrefTarget | undefined,
  hash: string,
): string | null {
  if (target === null) return null;
  if (isLocaleFallback(target)) return target.fallback;

  const base = target ?? pathname;
  if (!hash) return base;
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
          const href = resolveLocaleSwitchHref(
            pathname,
            localeHrefs?.[code],
            hash,
          );
          if (href === null) return null;
          return (
            <Link
              key={code}
              href={href}
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
        const href = resolveLocaleSwitchHref(
          pathname,
          localeHrefs?.[code],
          hash,
        );
        if (href === null) return null;
        return (
          <Link
            key={code}
            href={href}
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
