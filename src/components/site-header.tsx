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
import { MainNavPanel } from "@/components/main-nav-overlay";
import { MenuToggleIcon } from "@/components/menu-toggle-icon";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { productionHref } from "@/lib/site-links";
import { getHeaderDesign } from "@/lib/tilda-artboard-scale";
import type { PublishedLocale } from "@/i18n/locales";

/**
 * Chrome bar mirrors Tilda header-new Zero Block `711698335`
 * (`ab_upscale: window` — whole chrome scales with window width).
 * Same chrome while menu is open; burger morphs to X in place.
 * When open, header + panel share one `role=dialog` shell (A02).
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

type SiteHeaderProps = {
  /** Peer pathnames for LocaleSwitch (product pages with different RU/EN slugs). */
  localeHrefs?: Partial<Record<PublishedLocale, string>>;
};

export function SiteHeader({ localeHrefs }: SiteHeaderProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const locale = useLocale() as PublishedLocale;
  const t = useTranslations("nav");
  const tA11y = useTranslations("a11y");
  const { vars, compact } = useSyncExternalStore(
    subscribeViewport,
    headerChromeClient,
    headerChromeServer,
  );
  /** Solid bar after scroll / with menu — never frost or soft glow over covers. */
  const solidChrome = scrolled || menuOpen;

  useFocusTrap(dialogRef, menuOpen, {
    restoreFocus: false,
    initialFocusWithin: "nav",
  });

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const trigger = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const content = document.getElementById("site-content");
    content?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = previousOverflow;
      content?.removeAttribute("inert");
      queueMicrotask(() => trigger?.focus());
    };
  }, [menuOpen]);

  useEffect(() => {
    const readY = () =>
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const onScroll = () => setScrolled(readY() > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Expose chrome height to the document so product heroes can fill 100svh
  // under the fixed header (cancel spacer via negative margin).
  useEffect(() => {
    const hh = vars["--hh" as keyof CSSProperties];
    if (typeof hh === "string") {
      document.documentElement.style.setProperty("--hh", hh);
    }
  }, [vars]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div style={vars}>
      <div
        ref={dialogRef}
        id={menuOpen ? "main-nav-dialog" : undefined}
        role={menuOpen ? "dialog" : undefined}
        aria-modal={menuOpen ? true : undefined}
        aria-label={menuOpen ? tA11y("mainMenu") : undefined}
        className={
          menuOpen
            ? "animate-menu-fade fixed inset-0 z-[120] flex flex-col bg-gletcher-ice"
            : undefined
        }
      >
        <header
          className={
            menuOpen
              ? "relative isolate z-[1] shrink-0"
              : "fixed inset-x-0 top-0 isolate z-[100]"
          }
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 top-0 border-b transition-[background-color,border-color] duration-300 ease-out ${
              solidChrome
                ? "border-gletcher-navy/10 bg-gletcher-ice"
                : "border-transparent bg-transparent"
            }`}
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
              <LocaleSwitch
                variant="header"
                scaled
                localeHrefs={localeHrefs}
              />
            </div>

            <Link
              href="/"
              className="justify-self-center"
              aria-label={t("homeAria")}
              onClick={closeMenu}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-main.svg"
                alt="Gletcher Brewery since 2011"
                width={108}
                height={52}
                className={
                  solidChrome
                    ? undefined
                    : "drop-shadow-[0_0_10px_rgba(230,238,252,0.95)]"
                }
                style={{ height: "var(--logo-h)", width: "auto" }}
              />
            </Link>

            <div
              className="flex items-center justify-end"
              style={{ gap: "var(--gap)" }}
            >
              <a
                href={productionHref("agent", locale)}
                className="font-display inline-flex items-center justify-center rounded-full font-extrabold tracking-wide text-gletcher-white uppercase"
                style={{
                  height: "var(--ctrl-h)",
                  width: "var(--agent-w)",
                  fontSize: "calc(var(--font) * 1.12)",
                  background:
                    "radial-gradient(circle at center, rgba(253,102,102,0.78) 0%, rgba(229,55,60,1) 64%)",
                }}
                aria-label={tA11y("agent")}
                onClick={closeMenu}
              >
                {/* Display face sits optically high — nudge down to button center */}
                <span aria-hidden className="translate-y-[0.08em] leading-none">
                  {compact ? t("agentShort") : t("agent")}
                </span>
              </a>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className={`font-display inline-flex items-center justify-center rounded-full border border-gletcher-navy font-extrabold tracking-wide text-gletcher-navy uppercase transition-[background-color,color,border-color] duration-300 ease-out ${
                  solidChrome ? "" : "bg-gletcher-ice/85"
                }`}
                style={{
                  height: "var(--ctrl-h)",
                  width: "var(--menu-w)",
                  fontSize: "calc(var(--font) * 1.12)",
                  gap: `calc(8px * var(--hs))`,
                }}
                aria-expanded={menuOpen}
                aria-controls="main-nav-dialog"
                aria-label={menuOpen ? tA11y("closeMenu") : tA11y("openMenu")}
              >
                {!compact ? (
                  <span
                    className={`translate-y-[0.08em] leading-none overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      menuOpen
                        ? "mr-0 max-w-0 opacity-0"
                        : "max-w-[5rem] opacity-100"
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

        {menuOpen ? <MainNavPanel onClose={closeMenu} /> : null}
      </div>

      <div style={{ height: "var(--hh)" }} className="shrink-0" aria-hidden />
    </div>
  );
}
