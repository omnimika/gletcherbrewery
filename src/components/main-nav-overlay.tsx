"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  productionHref,
  type ExternalNavKey,
} from "@/lib/site-links";
import type { PublishedLocale } from "@/i18n/locales";

/** Order mirrors Tilda overlay ZB `715585432`. */
const NAV_ITEMS: {
  key: ExternalNavKey | "products";
  labelKey: "products" | "partners" | "tours" | "map" | "blog";
  localHref?: "/beer" | "/blog";
}[] = [
  { key: "products", labelKey: "products", localHref: "/beer" },
  { key: "partners", labelKey: "partners" },
  { key: "tours", labelKey: "tours" },
  { key: "map", labelKey: "map" },
  { key: "blog", labelKey: "blog", localHref: "/blog" },
];

type MainNavPanelProps = {
  onClose: () => void;
};

/**
 * Menu body under the live header chrome. Dialog role lives on the SiteHeader
 * shell so locale/close stay inside the modal accessibility subtree (A02).
 */
export function MainNavPanel({ onClose }: MainNavPanelProps) {
  const locale = useLocale() as PublishedLocale;
  const t = useTranslations("nav");

  return (
    <>
      <nav className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain px-4 py-6">
        <ul className="flex w-full max-w-[760px] flex-col items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item, index) => (
            <li
              key={item.key}
              className="animate-menu-rise w-full text-center"
              style={{ animationDelay: `${80 + index * 60}ms` }}
            >
              {item.localHref ? (
                <Link
                  href={item.localHref}
                  onClick={onClose}
                  className="font-display block py-1 text-[clamp(2.5rem,8vw,6.5rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors hover:text-gletcher-red"
                >
                  {t(item.labelKey)}
                </Link>
              ) : (
                <a
                  href={productionHref(item.key as ExternalNavKey, locale)}
                  onClick={onClose}
                  className="font-display block py-1 text-[clamp(2.5rem,8vw,6.5rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors hover:text-gletcher-red"
                >
                  {t(item.labelKey)}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="mx-auto mt-auto flex w-full max-w-[452px] shrink-0 flex-col px-6 pt-4 pb-10 sm:pb-12"
        style={{ gap: "calc(12px * var(--hs, 1))" }}
      >
        <a
          href={productionHref("login", locale)}
          onClick={onClose}
          className="text-center font-thin tracking-wide text-gletcher-white uppercase"
          style={{
            padding: `calc(12px * var(--hs, 1)) calc(16px * var(--hs, 1))`,
            fontSize: `calc(14px * var(--hs, 1))`,
            background:
              "radial-gradient(circle at center, rgba(253,102,102,0.78) 0%, rgba(229,55,60,1) 64%)",
          }}
        >
          {t("login")}
        </a>
        <a
          href={productionHref("signup", locale)}
          onClick={onClose}
          className="border border-gletcher-navy text-center font-semibold tracking-wide text-gletcher-navy uppercase"
          style={{
            padding: `calc(12px * var(--hs, 1)) calc(16px * var(--hs, 1))`,
            fontSize: `calc(14px * var(--hs, 1))`,
          }}
        >
          {t("signup")}
        </a>
      </div>
    </>
  );
}

/** @deprecated Prefer MainNavPanel; kept name for import clarity in reviews. */
export const MainNavOverlay = MainNavPanel;
