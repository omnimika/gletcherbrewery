"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { HomeHeroBottle } from "@/components/home/home-hero-bottle";

type HomeHeroProps = {
  breweryLabel: string;
  brandLabel: string;
  lead: string;
  catalogAria: string;
};

/**
 * Production hero ZB `749387570`:
 * - Large line (Пивоварня / Gletcher): Gratimo-ABCGravity 200 → XCompressed
 * - Small line (gletcher / Brewery): weight 900 → Wide
 * - Lead: weight 300 → Compressed
 * - slogan-red: on first glyph; pre-anim 30° → rest −90° (−120° CCW); mobile 120° → 0°
 * - Subtle scroll parallax (animprx), respects reduced motion
 */
export function HomeHero({
  breweryLabel,
  brandLabel,
  lead,
  catalogAria,
}: HomeHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const largeRef = useRef<HTMLHeadingElement>(null);
  const smallRef = useRef<HTMLHeadingElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const bottleParallaxRef = useRef<HTMLDivElement>(null);

  // Pin slogan-red to the first letter of the large line (locale-safe).
  // Prod ZB 1724679998595: seal center ≈ (firstGlyph.left, heading.top).
  useLayoutEffect(() => {
    const root = rootRef.current;
    const heading = largeRef.current;
    const seal = sealRef.current;
    if (!root || !heading || !seal) return;

    let raf = 0;
    const place = () => {
      raf = 0;
      const textNode = [...heading.childNodes].find(
        (n): n is Text =>
          n.nodeType === Node.TEXT_NODE && Boolean(n.textContent?.trim()),
      );
      if (!textNode?.textContent) return;

      const start = textNode.textContent.search(/\S/);
      if (start < 0) return;

      // Measure without scroll parallax transform on the heading
      const prevTransform = heading.style.transform;
      heading.style.transform = "none";

      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, start + 1);
      const glyph = range.getBoundingClientRect();
      const rootBox = root.getBoundingClientRect();
      const headingBox = heading.getBoundingClientRect();
      heading.style.transform = prevTransform;

      if (glyph.width < 1) return;

      const size = seal.offsetWidth;
      // Prod: seal center ≈ (firstGlyph.left, heading.top) — wraps cap of П / G / …
      const left = glyph.left - size / 2 - rootBox.left;
      const top = headingBox.top - size / 2 - rootBox.top;
      seal.style.left = `${left}px`;
      seal.style.top = `${top}px`;
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(place);
    };

    const run = async () => {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      place();
    };
    void run();

    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    ro.observe(heading);
    window.addEventListener("resize", schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [breweryLabel]);

  // Seal SBS (ZB 1724679998595): delay 1s, 500ms.
  // Pre-anim pose rotate(30°) desktop; spin −120° CCW → rest −90° (mobile: 120° → 0°).
  useEffect(() => {
    const host = sealRef.current;
    if (!host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 479px)").matches;
    const fromDeg = mobile ? 120 : 30;
    const restDeg = mobile ? 0 : -90;

    host.style.transform = `rotate(${fromDeg}deg)`;

    if (reduce) {
      host.style.opacity = "1";
      host.style.transform = `rotate(${restDeg}deg)`;
      return;
    }

    const anim = host.animate(
      [
        { opacity: 0, transform: `rotate(${fromDeg}deg)` },
        { opacity: 1, transform: `rotate(${restDeg}deg)` },
      ],
      {
        duration: 500,
        delay: 1000,
        easing: "ease-out",
        fill: "forwards",
      },
    );
    return () => anim.cancel();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      // Tilda animprxs ~160 / 140 / 120 / 110 — gentle fraction of scroll
      if (largeRef.current) {
        largeRef.current.style.transform = `translate3d(0, ${y * 0.14}px, 0)`;
      }
      if (smallRef.current) {
        smallRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
      }
      if (sealRef.current) {
        sealRef.current.style.translate = `0 ${y * 0.1}px`;
      }
      if (leadRef.current) {
        leadRef.current.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
      }
      if (bottleParallaxRef.current) {
        bottleParallaxRef.current.style.transform = `translate3d(0, ${y * 0.11}px, 0)`;
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={rootRef}
      tabIndex={-1}
      aria-label="Hero"
      className="relative isolate min-h-[100svh] overflow-x-clip overflow-y-visible bg-gletcher-ice"
      style={{
        marginTop: "calc(-1 * var(--header-height, var(--hh, 84px)))",
      }}
    >
      {/* Type under bottle — ZB 749387570 discrete sizes (not fluid vw) */}
      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center pt-[var(--hh,84px)] pb-[clamp(5.5rem,14svh,8rem)]">
        <div className="flex w-full flex-col items-center will-change-transform">
          <h2
            ref={largeRef}
            className="w-full max-w-[307px] text-center text-[106px] text-gletcher-navy uppercase will-change-transform min-[480px]:max-w-[460px] min-[480px]:text-[153px] min-[640px]:max-w-[620px] min-[640px]:text-[213px] min-[960px]:max-w-[940px] min-[960px]:text-[284px] min-[1200px]:max-w-[957px] min-[1200px]:text-[330px]"
            style={{
              /* Prod: weight 200 → XCompressed, letter-spacing normal */
              fontFamily: "var(--font-display)",
              fontWeight: 200,
              lineHeight: 0.85,
              letterSpacing: "normal",
            }}
          >
            {breweryLabel}
          </h2>
          <h1
            ref={smallRef}
            className="-mt-[0.12em] w-full max-w-[306px] text-center text-[37px] text-gletcher-navy uppercase will-change-transform min-[480px]:max-w-[462px] min-[480px]:text-[54px] min-[640px]:max-w-[620px] min-[640px]:text-[75px] min-[960px]:max-w-[940px] min-[960px]:text-[100px] min-[1200px]:max-w-[960px] min-[1200px]:text-[116px]"
            style={{
              /* Prod: weight 900 → Wide, letter-spacing normal */
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              lineHeight: 0.85,
              letterSpacing: "normal",
            }}
          >
            {brandLabel}
          </h1>
        </div>
      </div>

      {/* slogan-red — anchored to first glyph of large line; size from ZB 1724679998595 */}
      <div
        ref={sealRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-[6] size-[88px] origin-center will-change-transform min-[480px]:size-[100px] min-[640px]:size-[110px] min-[960px]:size-[120px] min-[1200px]:size-[164px] min-[1920px]:size-[120px]"
        style={{ opacity: 0, transform: "rotate(30deg)" }}
      >
        <Image
          src="/home/slogan-red.png"
          alt=""
          width={164}
          height={164}
          className="h-full w-full object-contain"
          priority
        />
      </div>

      <div
        ref={bottleParallaxRef}
        className="pointer-events-none absolute inset-0 z-[15] will-change-transform"
      >
        <HomeHeroBottle />
      </div>

      <p
        ref={leadRef}
        className="pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] z-20 mx-auto w-full max-w-[320px] px-5 text-center text-[21px] leading-[0.85] text-gletcher-navy uppercase will-change-transform min-[480px]:max-w-[460px] min-[480px]:text-[34px] min-[640px]:max-w-[620px] min-[640px]:text-[43px] min-[960px]:max-w-[460px] min-[960px]:text-[30px] min-[1200px]:max-w-[578px] min-[1200px]:text-[40px] min-[1920px]:max-w-[601px] min-[1920px]:text-[43px]"
        style={{
          /* Visible prod lead 1715873568020: weight 300 → Compressed */
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          letterSpacing: "normal",
        }}
      >
        {lead}
      </p>

      <Link
        href="/beer"
        className="absolute inset-0 z-[12]"
        aria-label={catalogAria}
      />
    </section>
  );
}
