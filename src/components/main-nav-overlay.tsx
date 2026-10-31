"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFocusTrap } from "@/lib/use-focus-trap";
import {
  productionHref,
  type ExternalNavKey,
} from "@/lib/site-links";
import type { PublishedLocale } from "@/i18n/locales";

/** Order mirrors Tilda overlay ZB `715585432`. */
const NAV_ITEMS: {
  key: ExternalNavKey | "products";
  labelKey: "products" | "partners" | "tours" | "map" | "blog";
  localHref?: "/beer";
}[] = [
  { key: "products", labelKey: "products", localHref: "/beer" },
  { key: "partners", labelKey: "partners" },
  { key: "tours", labelKey: "tours" },
  { key: "map", labelKey: "map" },
  { key: "blog", labelKey: "blog" },
];

type MainNavOverlayProps = {
  open: boolean;
  onClose: () => void;
  /** Menu toggle in the fixed header — restored on close. */
  triggerRef: RefObject<HTMLElement | null>;
  /**
   * Live header chrome (locale + close/X). Included in the modal Tab cycle
   * so visible controls stay reachable (T02).
   */
  chromeRef: RefObject<HTMLElement | null>;
  /** Same window-upscale CSS vars as the header (portal is outside that tree). */
  chromeVars: CSSProperties;
};

/**
 * Full-screen nav under the live header chrome (no duplicate locale/close).
 * Header keeps window-upscale controls; burger morphs to X in place.
 */
export function MainNavOverlay({
  open,
  onClose,
  triggerRef,
  chromeRef,
  chromeVars,
}: MainNavOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const locale = useLocale() as PublishedLocale;
  const t = useTranslations("nav");
  const tA11y = useTranslations("a11y");

  useFocusTrap(dialogRef, open, {
    restoreFocus: false,
    additionalRefs: [chromeRef],
  });

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Keep header interactive (same chrome / toggle); inert only page content.
    const content = document.getElementById("site-content");
    content?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = previousOverflow;
      content?.removeAttribute("inert");
      queueMicrotask(() => trigger?.focus());
    };
  }, [open, triggerRef]);

  if (!open || typeof document === "undefined") return null;

  const portalTarget =
    document.getElementById("portal-root") ?? document.body;

  return createPortal(
    <div
      ref={dialogRef}
      id="main-nav-dialog"
      className="animate-menu-fade fixed inset-x-0 bottom-0 z-[110] flex flex-col overflow-y-auto overscroll-contain bg-gletcher-ice"
      style={{ ...chromeVars, top: "var(--hh)" }}
      role="dialog"
      aria-modal="true"
      aria-label={tA11y("mainMenu")}
    >
      <nav className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6">
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
    </div>,
    portalTarget,
  );
}
