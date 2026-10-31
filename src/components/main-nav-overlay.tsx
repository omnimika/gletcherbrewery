"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LocaleSwitch } from "@/components/locale-switch";
import { useFocusTrap } from "@/lib/use-focus-trap";

/** Order mirrors Tilda overlay ZB `715585432`. */
const NAV_ITEMS = [
  { href: "/beer", labelKey: "products" },
  { href: "/partnership", labelKey: "partners" },
  { href: "/tours", labelKey: "tours" },
  { href: "/map", labelKey: "map" },
  { href: "/blog", labelKey: "blog" },
] as const;

type MainNavOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function MainNavOverlay({ open, onClose }: MainNavOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const t = useTranslations("nav");
  const tA11y = useTranslations("a11y");

  useFocusTrap(dialogRef, open, { restoreFocus: false });

  useEffect(() => {
    if (!open) return;
    triggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = document.getElementById("site-root");
    root?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = previousOverflow;
      root?.removeAttribute("inert");
      const trigger = triggerRef.current;
      triggerRef.current = null;
      queueMicrotask(() => trigger?.focus());
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const portalTarget =
    document.getElementById("portal-root") ?? document.body;

  return createPortal(
    <div
      ref={dialogRef}
      id="main-nav-dialog"
      className="animate-menu-fade fixed inset-0 z-[110] flex min-h-svh flex-col overflow-y-auto overscroll-contain bg-gletcher-ice"
      role="dialog"
      aria-modal="true"
      aria-label={tA11y("mainMenu")}
    >
      <div className="relative flex shrink-0 items-center justify-between px-3 py-3 sm:px-5 sm:py-4">
        <LocaleSwitch variant="header" />
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gletcher-navy text-gletcher-navy sm:h-10 sm:w-10"
          aria-label={tA11y("closeMenu")}
        >
          <span className="text-lg leading-none" aria-hidden>
            ×
          </span>
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6">
        <ul className="flex w-full max-w-[760px] flex-col items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item, index) => (
            <li
              key={item.href}
              className="animate-menu-rise w-full text-center"
              style={{ animationDelay: `${80 + index * 60}ms` }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="font-display block py-1 text-[clamp(2.5rem,8vw,6.5rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors hover:text-gletcher-red"
              >
                {t(item.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto mt-auto flex w-full max-w-[452px] shrink-0 flex-col gap-3 px-6 pt-4 pb-10 sm:pb-12">
        <Link
          href="/members/login"
          onClick={onClose}
          className="px-4 py-3 text-center text-sm font-thin tracking-wide text-gletcher-white uppercase"
          style={{
            background:
              "radial-gradient(circle at center, rgba(253,102,102,0.78) 0%, rgba(229,55,60,1) 64%)",
          }}
        >
          {t("login")}
        </Link>
        <Link
          href="/members/signup"
          onClick={onClose}
          className="border border-gletcher-navy px-4 py-3 text-center text-sm font-semibold tracking-wide text-gletcher-navy uppercase"
        >
          {t("signup")}
        </Link>
      </div>
    </div>,
    portalTarget,
  );
}
