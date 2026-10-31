"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LocaleSwitch } from "@/components/locale-switch";
import { useFocusTrap } from "@/lib/use-focus-trap";

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

  // Focus returns only after inert is cleared (see lock effect below).
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
      // Restore after inert removal so the trigger can receive focus.
      queueMicrotask(() => trigger?.focus());
    };
  }, [open]);

  // `open` becomes true only after client interaction — document is available.
  if (!open || typeof document === "undefined") return null;

  const portalTarget =
    document.getElementById("portal-root") ?? document.body;

  return createPortal(
    <div
      ref={dialogRef}
      id="main-nav-dialog"
      className="animate-menu-fade fixed inset-0 z-[90] flex flex-col overflow-y-auto overscroll-contain bg-gletcher-ice"
      role="dialog"
      aria-modal="true"
      aria-label={tA11y("mainMenu")}
    >
      <div className="flex shrink-0 items-center justify-between px-5 py-5 sm:px-10">
        <LocaleSwitch />
        <button
          type="button"
          onClick={onClose}
          className="font-display text-sm tracking-widest text-gletcher-navy"
          aria-label={tA11y("closeMenu")}
        >
          {t("close")}
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col justify-center px-6 py-6 sm:px-16 lg:px-24">
        <ul className="flex flex-col items-end gap-3 sm:gap-4">
          {NAV_ITEMS.map((item, index) => (
            <li
              key={item.href}
              className="animate-menu-rise"
              style={{ animationDelay: `${80 + index * 60}ms` }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="font-display text-4xl text-gletcher-navy transition-colors hover:text-gletcher-red sm:text-6xl lg:text-7xl"
              >
                {t(item.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex shrink-0 flex-col items-stretch gap-3 px-6 pt-4 pb-10 sm:flex-row sm:items-center sm:justify-end sm:gap-6 sm:px-16 lg:px-24">
        <Link
          href="/members/signup"
          onClick={onClose}
          className="text-center text-xs font-semibold tracking-wide text-gletcher-navy/80 uppercase underline-offset-4 hover:underline sm:text-sm"
        >
          {t("signup")}
        </Link>
        <Link
          href="/members/login"
          onClick={onClose}
          className="bg-gletcher-red px-6 py-3 text-center text-sm font-semibold tracking-wide text-gletcher-white uppercase transition-colors hover:bg-gletcher-deep"
        >
          {t("login")}
        </Link>
      </div>
    </div>,
    portalTarget,
  );
}
