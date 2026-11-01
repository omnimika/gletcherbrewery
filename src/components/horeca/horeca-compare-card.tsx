"use client";

import Image from "next/image";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { HorecaCompareCard } from "@/content/horeca";

type Props = {
  card: HorecaCompareCard;
  switchCta: string;
  findCta: string;
};

/**
 * Source ZB `1701412511`: two stacked faces, 200ms opacity crossfade on hover.
 * Default = import; hover/focus/tap = Gletcher.
 */
export function HorecaCompareCardView({ card, switchCta, findCta }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <li
      className={`group relative aspect-[370/420] min-h-[320px] overflow-hidden rounded-lg border bg-gletcher-ice outline-none transition-[border-color] duration-200 ${
        flipped
          ? "border-gletcher-red"
          : "border-gletcher-navy hover:border-gletcher-red focus-within:border-gletcher-red"
      }`}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onFocusCapture={() => setFlipped(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFlipped(false);
        }
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        if (
          typeof window !== "undefined" &&
          window.matchMedia("(hover: none)").matches
        ) {
          setFlipped((v) => !v);
        }
      }}
    >
      {/* Import face — default */}
      <div
        className={`absolute inset-0 flex flex-col p-4 transition-opacity duration-200 ease-linear motion-reduce:transition-none sm:p-5 ${
          flipped ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={flipped}
      >
        <p className="font-display text-[clamp(1.35rem,4.5vw,2rem)] leading-[0.95] font-extrabold tracking-wide text-gletcher-navy uppercase">
          {card.styleLabel}
        </p>
        <p className="mt-3 max-w-[58%] text-xs leading-snug text-gletcher-navy/80 sm:text-sm">
          {card.importLead}
        </p>
        <ul className="mt-2 max-w-[58%] space-y-0.5 text-xs leading-snug text-gletcher-navy/70 sm:text-sm">
          {card.imports.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <div className="pointer-events-none absolute top-[18%] right-2 bottom-[18%] w-[42%] sm:right-3">
          <Image
            src={card.importImage}
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 640px) 40vw, 160px"
            aria-hidden
          />
        </div>
        <button
          type="button"
          className="font-display relative z-[1] mt-auto inline-flex h-11 w-full max-w-[11.5rem] items-center justify-center rounded-lg bg-[radial-gradient(circle_at_center,#f67074_0%,#fe242a_48%,#df1e23_100%)] px-3 text-[11px] font-extrabold tracking-wide text-white uppercase"
          onClick={() => setFlipped(true)}
        >
          {switchCta}
        </button>
      </div>

      {/* Gletcher face — on hover */}
      <div
        className={`absolute inset-0 flex flex-col overflow-hidden rounded-[7px] transition-opacity duration-200 ease-linear motion-reduce:transition-none ${
          flipped ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!flipped}
      >
        <Image
          src={card.artImage}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 640px) 90vw, 370px"
          aria-hidden
        />
        <div className="relative z-[1] flex h-full flex-col bg-gletcher-ice/55 p-4 backdrop-blur-[1px] sm:p-5">
          <p className="font-display text-[clamp(1.5rem,4.5vw,2.1rem)] leading-[0.95] font-extrabold tracking-wide text-gletcher-navy uppercase">
            {card.name}
          </p>
          <p className="mt-3 max-w-[58%] text-xs leading-snug text-gletcher-navy/85 sm:text-sm">
            {card.taste}
          </p>
          <p className="mt-2 max-w-[58%] text-[11px] tracking-wide text-gletcher-navy/60 uppercase">
            {card.stats}
          </p>
          <div className="pointer-events-none absolute top-[16%] right-1 bottom-[16%] w-[44%] sm:right-2">
            <Image
              src={card.productImage}
              alt={card.name}
              fill
              className="object-contain object-bottom"
              sizes="(max-width: 640px) 42vw, 170px"
            />
          </div>
          <Link
            href={`/beer/${card.slug}`}
            className="font-display relative z-[1] mt-auto inline-flex h-11 w-full max-w-[11.5rem] items-center justify-center rounded-lg bg-[radial-gradient(circle_at_center,#f67074_0%,#fe242a_48%,#df1e23_100%)] px-3 text-[11px] font-extrabold tracking-wide text-white uppercase"
          >
            {findCta}
          </Link>
        </div>
      </div>
    </li>
  );
}
