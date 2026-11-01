"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";

type HorecaSloganSealProps = {
  /** Brand line text — seal pins to its last letter (R in GLETCHER). */
  brandWord: string;
  src: string;
};

/**
 * slogan-red on the top-right of the last glyph in the brand wordmark.
 * Appear: fade + rotate (Tilda SBS on ZB 1702039591 / home seal pattern).
 */
export function HorecaSloganSeal({ brandWord, src }: HorecaSloganSealProps) {
  const wordRef = useRef<HTMLElement | null>(null);
  const sealRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const seal = sealRef.current;
    if (!seal) return;

    const findWord = () =>
      document.querySelector<HTMLElement>("[data-horeca-gletcher]");

    let raf = 0;
    const place = () => {
      raf = 0;
      const word = findWord();
      wordRef.current = word;
      if (!word || !seal) return;

      const textNode = [...word.childNodes].find(
        (n): n is Text =>
          n.nodeType === Node.TEXT_NODE && Boolean(n.textContent?.trim()),
      );
      if (!textNode?.textContent) return;

      const raw = textNode.textContent;
      let end = raw.length;
      while (end > 0 && /\s/.test(raw[end - 1]!)) end -= 1;
      if (end < 1) return;
      const start = end - 1;

      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      const glyph = range.getBoundingClientRect();
      const host = seal.parentElement;
      if (!host) return;
      const hostBox = host.getBoundingClientRect();
      if (glyph.width < 1) return;

      const size = seal.offsetWidth;
      // Center on the top-right corner of R so the ring frames the glyph.
      const left = glyph.right - size * 0.42 - hostBox.left;
      const top = glyph.top - size * 0.48 - hostBox.top;
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
    const word = findWord();
    if (word) ro.observe(word);
    ro.observe(seal);
    window.addEventListener("resize", schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [brandWord]);

  useEffect(() => {
    const host = sealRef.current;
    if (!host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fromDeg = 10;
    const restDeg = -17;

    host.style.transform = `rotate(${fromDeg}deg)`;
    host.style.opacity = "0";

    if (reduce) {
      host.style.opacity = "1";
      host.style.transform = `rotate(${restDeg}deg)`;
      return;
    }

    const anim = host.animate(
      [
        { opacity: 0, transform: `rotate(${fromDeg}deg) scale(0.85)` },
        { opacity: 1, transform: `rotate(${restDeg}deg) scale(1)` },
      ],
      {
        duration: 700,
        delay: 450,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );
    return () => anim.cancel();
  }, []);

  return (
    <div
      ref={sealRef}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-[4] size-[clamp(2.75rem,24cqi,7.25rem)] origin-center will-change-transform lg:size-[clamp(4.5rem,26cqi,9.5rem)]"
      style={{ opacity: 0 }}
    >
      <Image
        src={src}
        alt=""
        width={164}
        height={164}
        className="h-full w-full object-contain"
        priority
      />
    </div>
  );
}
