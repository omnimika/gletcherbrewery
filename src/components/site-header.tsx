"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/components/locale-switch";
import { MainNavOverlay } from "@/components/main-nav-overlay";

/**
 * Chrome bar mirrors Tilda header-new Zero Block `711698335`
 * (docs/discovery/TILDA_BEER_CATALOG.md / project headerpageid 44416371):
 * fixed ice bar, centered logo, red АГЕНТ pill, outlined МЕНЮ + burger.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("nav");
  const tA11y = useTranslations("a11y");

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] isolate">
        {/* Soft ice veil — Tilda headerBlur shape + shadow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[4.75rem] bg-gletcher-ice/90 shadow-[0_15px_15px_15px_#e6eefc] backdrop-blur-[6px] sm:h-[5.25rem]"
        />

        <div className="relative mx-auto grid h-[4.75rem] max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center px-2.5 sm:h-[5.25rem] sm:px-5 lg:px-5">
          <div className="justify-self-start">
            <LocaleSwitch variant="header" />
          </div>

          <Link
            href="/"
            className="justify-self-center"
            aria-label={t("homeAria")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-main.svg"
              alt="Gletcher Brewery since 2011"
              width={108}
              height={52}
              className="h-[38px] w-auto sm:h-11 lg:h-[52px]"
            />
          </Link>

          <div className="flex items-center justify-end gap-2 sm:gap-2.5">
            {/* АГЕНТ — Tilda .red-button radial pill */}
            <Link
              href="/agent"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-thin tracking-wide text-gletcher-white uppercase sm:h-10 sm:w-[90px] sm:text-sm lg:h-8 lg:w-[94px]"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(253,102,102,0.78) 0%, rgba(229,55,60,1) 64%)",
              }}
              aria-label={tA11y("agent")}
            >
              <span className="sm:hidden" aria-hidden>
                {t("agentShort")}
              </span>
              <span className="hidden sm:inline" aria-hidden>
                {t("agent")}
              </span>
            </Link>

            {/* МЕНЮ — outlined pill + burger (circle-only on narrow) */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gletcher-navy text-gletcher-navy sm:h-10 sm:w-[107px] sm:gap-2 sm:px-3 lg:h-8"
              aria-expanded={menuOpen}
              aria-controls="main-nav-dialog"
              aria-label={tA11y("openMenu")}
            >
              <span
                className="hidden text-[17px] font-bold tracking-wide uppercase sm:inline"
                aria-hidden
              >
                {t("menu")}
              </span>
              <MenuBurgerIcon className="h-[11px] w-[14px] shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* Flow spacer — Tilda header is fixed / ab_height 0 */}
      <div className="h-[4.75rem] shrink-0 sm:h-[5.25rem]" aria-hidden />

      <MainNavOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function MenuBurgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M0 1h14M0 5.5h14M0 10h14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
