"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LocaleSwitch } from "@/components/locale-switch";
import { useFocusTrap } from "@/lib/use-focus-trap";

const NAV_HREFS = [
  "/beer",
  "/partnership",
  "/tours",
  "/map",
  "/blog",
] as const;

type MainNavOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function MainNavOverlay({ open, onClose }: MainNavOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("nav");
  const tA11y = useTranslations("a11y");
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = document.getElementById("site-root");
    root?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = previous;
      root?.removeAttribute("inert");
    };
  }, [open]);

  if (!open || !mounted) return null;

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
          {NAV_HREFS.map((href, index) => (
            <li
              key={href}
              className="animate-menu-rise"
              style={{ animationDelay: `${80 + index * 60}ms` }}
            >
              <Link
                href={href}
                onClick={onClose}
                className="font-display text-4xl text-gletcher-navy transition-colors hover:text-gletcher-red sm:text-6xl lg:text-7xl"
              >
                {t(
                  href === "/beer"
                    ? "products"
                    : href === "/partnership"
                      ? "partners"
                      : href === "/tours"
                        ? "tours"
                        : href === "/map"
                          ? "map"
                          : "blog",
                )}
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
