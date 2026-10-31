"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/components/locale-switch";
import { MainNavOverlay } from "@/components/main-nav-overlay";
import { MenuToggleIcon } from "@/components/menu-toggle-icon";
import { productionHref } from "@/lib/site-links";
import { getHeaderDesign } from "@/lib/tilda-artboard-scale";
import type { PublishedLocale } from "@/i18n/locales";

/**
 * Chrome bar mirrors Tilda header-new Zero Block `711698335`
 * (`ab_upscale: window` — whole chrome scales with window width).
 * Same chrome while menu is open; burger morphs to X in place.
 */
type HeaderChrome = {
  vars: CSSProperties;
  compact: boolean;
};

function subscribeViewport(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

let cachedClientChrome: HeaderChrome | null = null;
let cachedClientWidth = -1;

function headerChromeClient(): HeaderChrome {
  const width = window.innerWidth;
  if (cachedClientChrome && cachedClientWidth === width) {
    return cachedClientChrome;
  }
  const d = getHeaderDesign(width);
  const s = d.scale;
  cachedClientWidth = width;
  cachedClientChrome = {
    compact: d.agentW <= 40,
    vars: {
      ["--hh" as string]: `${d.bar * s}px`,
      ["--hs" as string]: String(s),
      ["--logo-h" as string]: `${d.logoH * s}px`,
      ["--ctrl-h" as string]: `${d.controlH * s}px`,
      ["--agent-w" as string]: `${d.agentW * s}px`,
      ["--menu-w" as string]: `${d.menuW * s}px`,
      ["--pad-x" as string]: `${d.padX * s}px`,
      ["--gap" as string]: `${d.gap * s}px`,
      ["--font" as string]: `${d.fontPx * s}px`,
      ["--burger-w" as string]: `${14 * s}px`,
      ["--burger-h" as string]: `${11 * s}px`,
    },
  };
  return cachedClientChrome;
}

const HEADER_CHROME_SERVER: HeaderChrome = {
  compact: false,
  vars: {
    ["--hh" as string]: "84px",
    ["--hs" as string]: "1",
    ["--logo-h" as string]: "52px",
    ["--ctrl-h" as string]: "40px",
    ["--agent-w" as string]: "90px",
    ["--menu-w" as string]: "107px",
    ["--pad-x" as string]: "20px",
    ["--gap" as string]: "10px",
    ["--font" as string]: "17px",
    ["--burger-w" as string]: "14px",
    ["--burger-h" as string]: "11px",
  },
};

function headerChromeServer(): HeaderChrome {
  return HEADER_CHROME_SERVER;
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const chromeRef = useRef<HTMLElement>(null);
  const locale = useLocale() as PublishedLocale;
  const t = useTranslations("nav");
  const tA11y = useTranslations("a11y");
  const { vars, compact } = useSyncExternalStore(
    subscribeViewport,
    headerChromeClient,
    headerChromeServer,
  );

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Expose chrome height to the document so product heroes can fill 100svh
  // under the fixed header (cancel spacer via negative margin).
  useEffect(() => {
    const hh = vars["--hh" as keyof CSSProperties];
    if (typeof hh === "string") {
      document.documentElement.style.setProperty("--hh", hh);
    }
  }, [vars]);

  return (
    <div style={vars}>
      <header
        ref={chromeRef}
        className={`fixed inset-x-0 top-0 isolate ${
          menuOpen ? "z-[120]" : "z-[100]"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 bg-gletcher-ice/90 shadow-[0_15px_15px_15px_#e6eefc] backdrop-blur-[6px]"
          style={{ height: "var(--hh)" }}
        />

        <div
          className="relative grid grid-cols-[1fr_auto_1fr] items-center"
          style={{
            height: "var(--hh)",
            paddingInline: "var(--pad-x)",
            columnGap: "var(--gap)",
          }}
        >
          <div className="justify-self-start">
            <LocaleSwitch variant="header" scaled />
          </div>

          <Link
            href="/"
            className="justify-self-center"
            aria-label={t("homeAria")}
            onClick={() => setMenuOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-main.svg"
              alt="Gletcher Brewery since 2011"
              width={108}
              height={52}
              style={{ height: "var(--logo-h)", width: "auto" }}
            />
          </Link>

          <div
            className="flex items-center justify-end"
            style={{ gap: "var(--gap)" }}
          >
            <a
              href={productionHref("agent", locale)}
              className="inline-flex items-center justify-center rounded-full font-thin tracking-wide text-gletcher-white uppercase"
              style={{
                height: "var(--ctrl-h)",
                width: "var(--agent-w)",
                fontSize: "var(--font)",
                background:
                  "radial-gradient(circle at center, rgba(253,102,102,0.78) 0%, rgba(229,55,60,1) 64%)",
              }}
              aria-label={tA11y("agent")}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden>{compact ? t("agentShort") : t("agent")}</span>
            </a>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-full border border-gletcher-navy font-bold tracking-wide text-gletcher-navy uppercase transition-[background-color,color,border-color] duration-300 ease-out"
              style={{
                height: "var(--ctrl-h)",
                width: "var(--menu-w)",
                fontSize: "var(--font)",
                gap: `calc(8px * var(--hs))`,
              }}
              aria-expanded={menuOpen}
              aria-controls="main-nav-dialog"
              aria-label={menuOpen ? tA11y("closeMenu") : tA11y("openMenu")}
            >
              {!compact ? (
                <span
                  className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    menuOpen
                      ? "mr-0 max-w-0 opacity-0"
                      : "max-w-[4.5rem] opacity-100"
                  }`}
                  aria-hidden
                >
                  {t("menu")}
                </span>
              ) : null}
              <MenuToggleIcon open={menuOpen} className="shrink-0" />
            </button>
          </div>
        </div>
      </header>

      <div style={{ height: "var(--hh)" }} className="shrink-0" aria-hidden />

      <MainNavOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        triggerRef={menuButtonRef}
        chromeRef={chromeRef}
        chromeVars={vars}
      />
    </div>
  );
}
