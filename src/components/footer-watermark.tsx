"use client";

import { useLayoutEffect, useRef, useState } from "react";

type FooterWatermarkProps = {
  drinkResponsibly: string;
  healthWarning: string;
};

/** Both lines ≈ this fraction of window width, equal visual length. */
const WIDTH_RATIO = 0.96;
/** Production display ratio health/drink (~71/145). */
const HEALTH_SIZE_RATIO = 71 / 145;
/**
 * Weight 800 = ExtraCondensed in Gratimo-ABCGravity width slots.
 * Weight 900 (Wide) is too wide → font shrinks to fit vw and Й breve vanishes.
 */
const WATERMARK_WEIGHT = 800;
/** Production ice watermark on frost board — not white. */
const WATERMARK_COLOR = "#e6eefc";
/** Cap so contacts + watermark stay within half the viewport. */
const FOOTER_MAX_VH = 0.5;
/** Rough height reserved for contacts / copyright row (px). */
const CONTACTS_RESERVE_PX = 130;
/** Production display: ~83px lh on 110px font. */
const LINE_HEIGHT = 0.75;

/**
 * Decorative frost watermark — both lines nowrap, matched width via scaleX,
 * nearly full viewport width, stacked flush (production ZB `740449400`).
 *
 * No negative margins: they shrink footer height and let page ice show as a
 * light strip under the frost board; they also stack glyphs when overdone.
 */
export function FooterWatermark({
  drinkResponsibly,
  healthWarning,
}: FooterWatermarkProps) {
  const drinkRef = useRef<HTMLParagraphElement>(null);
  const healthRef = useRef<HTMLParagraphElement>(null);
  const [drinkFontPx, setDrinkFontPx] = useState(64);
  const [healthFontPx, setHealthFontPx] = useState(32);
  const [healthScaleX, setHealthScaleX] = useState(1);
  const [bandWidth, setBandWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const drink = drinkRef.current;
    const health = healthRef.current;
    if (!drink || !health) return;

    const fit = () => {
      const targetW = Math.max(240, window.innerWidth * WIDTH_RATIO);
      const maxFooter = window.innerHeight * FOOTER_MAX_VH;
      const maxDrinkFromH =
        (maxFooter - CONTACTS_RESERVE_PX) /
        (LINE_HEIGHT + 0.1 + HEALTH_SIZE_RATIO * LINE_HEIGHT);

      drink.style.fontSize = "100px";
      health.style.fontSize = "100px";
      health.style.transform = "none";

      const drinkNat = Math.max(drink.scrollWidth, 1);
      const drinkFromW = (targetW / drinkNat) * 100;
      const drinkPx = Math.min(drinkFromW, maxDrinkFromH);
      const healthPx = drinkPx * HEALTH_SIZE_RATIO;

      drink.style.fontSize = `${drinkPx}px`;
      health.style.fontSize = `${healthPx}px`;

      const drinkW = Math.max(drink.scrollWidth, 1);
      const healthW = Math.max(health.scrollWidth, 1);
      const scale = drinkW / healthW;
      health.style.transform = `scaleX(${scale})`;

      setDrinkFontPx(drinkPx);
      setHealthFontPx(healthPx);
      setHealthScaleX(scale);
      setBandWidth(drinkW);
    };

    fit();
    window.addEventListener("resize", fit);
    void document.fonts?.ready.then(fit);
    return () => window.removeEventListener("resize", fit);
  }, [drinkResponsibly, healthWarning]);

  const lineStyle = {
    display: "block",
    fontWeight: WATERMARK_WEIGHT,
    lineHeight: LINE_HEIGHT,
    letterSpacing: "-0.02em",
    color: WATERMARK_COLOR,
    margin: 0,
    padding: 0,
  } as const;

  return (
    <div
      aria-hidden
      className="pointer-events-none relative z-[1] flex w-full select-none flex-col items-center"
      // Bottom pad keeps ExtraCondensed ink inside the frost footer board
      // (glyphs can paint slightly past the CSS line box).
      style={{ paddingBottom: drinkFontPx ? drinkFontPx * 0.12 : 12 }}
    >
      <p
        ref={drinkRef}
        className="font-display w-max text-center tracking-tight whitespace-nowrap"
        style={{
          ...lineStyle,
          fontSize: drinkFontPx,
          // Room for Й breve only — no bottom pad (reads as inter-line gap).
          paddingTop: "0.08em",
        }}
      >
        {drinkResponsibly.toLocaleUpperCase("ru-RU")}
      </p>

      <div
        className="w-full overflow-x-clip"
        style={{ width: bandWidth ?? "100%" }}
      >
        <p
          ref={healthRef}
          className="font-display w-max origin-left text-center tracking-tight whitespace-nowrap"
          style={{
            ...lineStyle,
            fontSize: healthFontPx,
            transform: `scaleX(${healthScaleX})`,
          }}
        >
          {healthWarning.toLocaleUpperCase("ru-RU")}
        </p>
      </div>
    </div>
  );
}
