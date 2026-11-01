"use client";

import Image from "next/image";
import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { POLICY_PATH } from "@/content/policy";
import type { PublishedLocale } from "@/i18n/locales";

const YANDEX_RATING_HREF =
  "https://yandex.ru/maps/org/1395871323/reviews?utm_source=badge&utm_medium=rating&utm_campaign=v1";
const VK_HREF = "https://vk.com/gletcherbrewery";
const TG_HREF = "https://t.me/gletcherbrewery";
const UNTAPPD_HREF = "https://untappd.com/GletcherBrewery";

/** Footer ZB `740449400` screens — Confirmed, no 1400. */
const FOOTER_SCREENS = [320, 480, 640, 960, 1200] as const;

function matchFooterScreen(width: number): number {
  let matched: number = FOOTER_SCREENS[0];
  for (const screen of FOOTER_SCREENS) {
    if (width >= screen) matched = screen;
  }
  return matched;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

let cachedScale: { screen: number; scale: number } | null = null;
let cachedWidth = -1;

function getFooterScale(): { screen: number; scale: number } {
  const width = window.innerWidth;
  if (cachedScale && cachedWidth === width) return cachedScale;
  cachedWidth = width;
  const screen = matchFooterScreen(width);
  cachedScale = { screen, scale: width / screen };
  return cachedScale;
}

const SERVER_SCALE = { screen: 1200, scale: 1 };

/**
 * Production footer ZB `740449400`: absolute 1200×438 artboard,
 * `ab_upscale: window`, overflow visible, ice watermark at top 250/360.
 */
export function SiteFooter() {
  const t = useTranslations("footer");
  const locale = useLocale() as PublishedLocale;
  const { screen, scale } = useSyncExternalStore(
    subscribe,
    getFooterScale,
    () => SERVER_SCALE,
  );

  const innerRef = useRef<HTMLDivElement>(null);
  const drinkRef = useRef<HTMLParagraphElement>(null);
  const healthRef = useRef<HTMLParagraphElement>(null);
  const [outerHeight, setOuterHeight] = useState<number | undefined>(undefined);
  const [healthScaleX, setHealthScaleX] = useState(1);
  const [drinkWidth, setDrinkWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setOuterHeight(el.offsetHeight * scale);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scale, screen]);

  // Match health-warning width to "18+ ПЕЙТЕ КУЛЬТУРНО!" via scaleX.
  // Constrain wrapper to drink width — scaleX alone does not shrink layout box
  // and was causing page-level horizontal scroll.
  useLayoutEffect(() => {
    const drink = drinkRef.current;
    const health = healthRef.current;
    if (!drink || !health) return;

    const fit = () => {
      const w1 = drink.scrollWidth;
      const w2 = health.scrollWidth;
      setDrinkWidth(w1);
      setHealthScaleX(w2 > 0 ? w1 / w2 : 1);
    };
    fit();

    if (document.fonts?.ready) {
      void document.fonts.ready.then(fit);
    }
  }, [screen, scale, locale]);

  const boardH =
    screen >= 1200
      ? 438
      : screen >= 960
        ? 458
        : screen >= 640
          ? 468
          : screen >= 480
            ? 648
            : 636;

  return (
    <footer className="overflow-x-hidden bg-[#d8e4f7]">
      <div style={{ height: outerHeight, overflow: "hidden" }}>
        <div
          ref={innerRef}
          className="relative overflow-hidden bg-[#d8e4f7]"
          style={{
            width: screen,
            height: boardH,
            marginLeft: "50%",
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {/* Watermark — line 2 scaled to the same width as line 1 */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 z-[1] flex -translate-x-1/2 flex-col items-center overflow-hidden select-none"
            style={{
              top: screen >= 1200 ? 250 : screen >= 960 ? 310 : screen >= 640 ? 358 : screen >= 480 ? 427 : 480,
              width: drinkWidth,
            }}
          >
            <p
              ref={drinkRef}
              className="whitespace-nowrap text-[#e6eefc] uppercase"
              style={{
                fontFamily: "var(--font-display)",
                fontSize:
                  screen >= 1200
                    ? 145
                    : screen >= 960
                      ? 110
                      : screen >= 640
                        ? 76
                        : screen >= 480
                          ? 100
                          : 67,
                lineHeight: 0.75,
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
            >
              {t("drinkResponsibly")}
            </p>
            <p
              ref={healthRef}
              className="origin-center whitespace-nowrap text-[#e6eefc] uppercase"
              style={{
                marginTop:
                  screen >= 1200
                    ? 360 - 250 - 145 * 0.75
                    : screen >= 960
                      ? 400 - 310 - 110 * 0.75
                      : screen >= 640
                        ? 418 - 358 - 76 * 0.75
                        : screen >= 480
                          ? 577 - 427 - 100 * 0.75
                          : 586 - 480 - 67 * 0.75,
                fontFamily: "var(--font-display)",
                fontSize:
                  screen >= 1200
                    ? 71
                    : screen >= 960
                      ? 58
                      : screen >= 640
                        ? 38
                        : screen >= 480
                          ? 46
                          : 32,
                lineHeight: 0.75,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                transform: `scaleX(${healthScaleX})`,
              }}
            >
              {t("healthWarning")}
            </p>
          </div>

          {/* Phone */}
          <a
            href="tel:+74959892414"
            className="absolute z-[8] whitespace-nowrap text-gletcher-navy uppercase transition-opacity hover:opacity-70"
            style={{
              top: screen >= 1200 ? 77 : screen >= 960 ? 173 : screen >= 640 ? 106 : screen >= 480 ? 147 : 202,
              left: screen >= 1200 ? 46 : screen >= 960 ? 46 : screen >= 640 ? 112 : screen >= 480 ? 132 : 10,
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 900,
              lineHeight: 1.8,
              letterSpacing: "-0.02em",
            }}
          >
            +7 (495) 989-24-14
          </a>

          {/* Email */}
          <a
            href="mailto:info@gletcherbrewery.com"
            className="absolute z-[4] whitespace-nowrap text-gletcher-navy uppercase transition-opacity hover:opacity-70"
            style={{
              top: screen >= 1200 ? 77 : screen >= 960 ? 173 : screen >= 640 ? 106 : screen >= 480 ? 197 : 250,
              left: screen >= 1200 ? 213 : screen >= 960 ? 213 : screen >= 640 ? 279 : screen >= 480 ? 120 : 10,
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 900,
              lineHeight: 1.8,
              letterSpacing: "-0.02em",
            }}
          >
            info@gletcherbrewery.com
          </a>

          {/* VK */}
          <a
            href={VK_HREF}
            rel="nofollow noopener noreferrer"
            target="_blank"
            className="absolute z-[12] transition-opacity hover:opacity-70"
            style={{
              top:
                screen >= 1200
                  ? 75
                  : screen >= 960
                    ? 25
                    : screen >= 640
                      ? 55
                      : screen >= 480
                        ? 37
                        : 153,
              left:
                screen >= 1200
                  ? 565
                  : screen >= 960
                    ? 435
                    : screen >= 640
                      ? 275
                      : screen >= 480
                        ? 200
                        : 120,
              width: 30,
              height: 30,
            }}
            aria-label="VK"
          >
            <Image
              src="/home/footer/vk.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px]"
            />
          </a>

          {/* Telegram */}
          <a
            href={TG_HREF}
            rel="nofollow noopener noreferrer"
            target="_blank"
            className="absolute z-[12] transition-opacity hover:opacity-70"
            style={{
              top:
                screen >= 1200
                  ? 75
                  : screen >= 960
                    ? 25
                    : screen >= 640
                      ? 55
                      : screen >= 480
                        ? 37
                        : 153,
              left:
                screen >= 1200
                  ? 605
                  : screen >= 960
                    ? 495
                    : screen >= 640
                      ? 335
                      : screen >= 480
                        ? 250
                        : 170,
              width: 30,
              height: 30,
            }}
            aria-label="Telegram"
          >
            <Image
              src="/home/footer/telegram.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px]"
            />
          </a>

          {/* Yandex rating */}
          <a
            href={YANDEX_RATING_HREF}
            rel="noopener noreferrer"
            target="_blank"
            className="absolute z-[10] flex items-center gap-1.5 rounded-[8px] border border-gletcher-navy bg-white px-2 transition-opacity hover:opacity-80"
            style={{
              top: screen >= 1200 ? 64 : screen >= 960 ? 164 : screen >= 640 ? 167 : screen >= 480 ? 253 : 61,
              left: screen >= 1200 ? 778 : screen >= 960 ? 575 : screen >= 640 ? 132 : screen >= 480 ? 52 : 52,
              width: 147,
              height: 54,
            }}
          >
            <Image
              src="/home/footer/yandex-mark.svg"
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0"
            />
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1 leading-none">
                <span className="text-[14px] text-gletcher-navy">5,0</span>
                <span className="flex gap-px" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 11.4 10.84"
                      className="size-[11px]"
                      fill="#0D0F49"
                    >
                      <path d="M5.7 0 7.47 3.56l3.93.58-2.84 2.78.66 3.92L5.7 9 2.18 10.84l.66-3.92L0 4.14l3.93-.58L5.7 0Z" />
                    </svg>
                  ))}
                </span>
              </span>
              <span className="mt-1.5 text-[8px] leading-none text-gletcher-navy">
                {t("yandexRating")}
              </span>
            </span>
          </a>

          {/* Untappd */}
          <a
            href={UNTAPPD_HREF}
            rel="nofollow noopener noreferrer"
            target="_blank"
            className="absolute z-[10] overflow-hidden rounded-[10px] transition-opacity hover:opacity-70"
            style={{
              top: screen >= 1200 ? 64 : screen >= 960 ? 164 : screen >= 640 ? 167 : screen >= 480 ? 253 : 61,
              left: screen >= 1200 ? 1020 : screen >= 960 ? 896 : screen >= 640 ? 453 : screen >= 480 ? 373 : 214,
              width: 54,
              height: 54,
            }}
            aria-label="Untappd"
          >
            <Image
              src="/home/footer/untappd.png"
              alt=""
              width={54}
              height={54}
              className="size-[54px] object-cover"
            />
          </a>

          {/* Copyright */}
          <p
            className="absolute z-[5] text-gletcher-navy"
            style={{
              top: screen >= 1200 ? 158 : screen >= 960 ? 252 : screen >= 640 ? 306 : screen >= 480 ? 384 : 404,
              left: screen >= 1200 ? 46 : screen >= 960 ? 46 : screen >= 640 ? 125 : screen >= 480 ? 39 : 5,
              fontFamily: "var(--font-brand)",
              fontSize: screen >= 480 ? 14 : 14,
              fontWeight: 400,
              lineHeight: 1.2,
              maxWidth: screen >= 1200 ? 353 : 336,
            }}
          >
            {t("copyright")}
          </p>

          {/* Policy — RU-only page; always route via ru locale. */}
          <Link
            href={POLICY_PATH}
            locale="ru"
            className="absolute z-[6] text-gletcher-navy transition-opacity hover:opacity-70"
            style={{
              top: screen >= 1200 ? 158 : screen >= 960 ? 252 : screen >= 640 ? 254 : screen >= 480 ? 347 : 325,
              left: screen >= 1200 ? 777 : screen >= 960 ? 574 : screen >= 640 ? 131 : screen >= 480 ? 134 : 53,
              fontFamily: "var(--font-brand)",
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            {t("policy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
