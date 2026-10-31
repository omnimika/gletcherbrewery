"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LocaleSwitch } from "@/components/locale-switch";
import { MainNavOverlay } from "@/components/main-nav-overlay";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

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
      <header className="relative z-40 w-full bg-gletcher-ice/90 backdrop-blur-sm">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 sm:px-8 sm:py-5">
          <div className="justify-self-start">
            <LocaleSwitch />
          </div>

          <Link
            href="/"
            className="justify-self-center"
            aria-label="Gletcher Brewery — на главную"
          >
            {/* SVG via img: avoids next/image SVG config for brand mark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-main.svg"
              alt="Gletcher Brewery since 2011"
              width={168}
              height={56}
              className="h-10 w-auto sm:h-12"
            />
          </Link>

          <div className="flex items-center justify-end gap-3 sm:gap-5">
            <Link
              href="/agent"
              className="hidden text-sm font-semibold tracking-widest text-gletcher-navy uppercase sm:inline"
            >
              Агент
            </Link>
            <Link
              href="/agent"
              className="inline text-sm font-bold text-gletcher-navy sm:hidden"
              aria-label="Агент Глетчер"
            >
              А
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gletcher-navy text-[10px] font-bold tracking-wide text-gletcher-navy uppercase sm:h-auto sm:w-auto sm:rounded-none sm:border-0 sm:text-sm sm:tracking-widest"
              aria-expanded={menuOpen}
              aria-controls="main-nav"
              aria-label="Открыть меню"
            >
              <span className="sm:hidden" aria-hidden>
                ≡
              </span>
              <span className="hidden sm:inline" aria-hidden>
                Меню
              </span>
            </button>
          </div>
        </div>
      </header>
      <div id="main-nav">
        <MainNavOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </>
  );
}
