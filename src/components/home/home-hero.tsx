import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HomeHeroBottle } from "@/components/home/home-hero-bottle";

type HomeHeroProps = {
  breweryLabel: string;
  brandLabel: string;
  lead: string;
  catalogAria: string;
};

/**
 * Production hero (ZB 749387570): 100svh ice, seal, oversized type with
 * bottle media layered over both lines (same plane, higher z-index).
 */
export function HomeHero({
  breweryLabel,
  brandLabel,
  lead,
  catalogAria,
}: HomeHeroProps) {
  return (
    <section
      className="relative isolate min-h-[100svh] overflow-x-clip overflow-y-visible bg-gletcher-ice"
      style={{ marginTop: "calc(-1 * var(--hh, 84px))" }}
    >
      {/* Type under bottle — pad for fixed header */}
      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center pt-[var(--hh,84px)] pb-[clamp(5.5rem,14svh,8rem)]">
        <div className="flex w-full flex-col items-center">
          <h2 className="font-display w-full text-center text-[clamp(2.75rem,11.4vw,12.75rem)] leading-[0.8] font-extrabold tracking-[-0.045em] text-gletcher-navy uppercase">
            {breweryLabel}
          </h2>
          <h1 className="font-display -mt-[0.18em] w-full text-center text-[clamp(2.5rem,12.2vw,13.5rem)] leading-[0.8] font-black tracking-[-0.04em] text-gletcher-navy uppercase">
            {brandLabel}
          </h1>
        </div>
      </div>

      {/* Seal */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[max(6rem,16svh)] left-[max(0.75rem,calc(50%-min(34vw,9.5rem)-6.75rem))] z-[6] size-[clamp(5rem,10vw,8.25rem)]"
      >
        <Image
          src="/home/slogan-red.png"
          alt=""
          width={164}
          height={164}
          className="h-full w-full origin-center rotate-[18deg] object-contain"
          priority
        />
      </div>

      <HomeHeroBottle />

      {/* Brand lead — fully inside first viewport (ABC Gravity), above bottle canvas. */}
      <p className="font-display pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1.75rem))] z-20 mx-auto max-w-[min(48rem,96vw)] px-5 text-center text-[clamp(0.8rem,1.55vw,1.2rem)] leading-[1.25] font-extrabold tracking-[0.035em] text-gletcher-navy uppercase">
        {lead}
      </p>

      {/* Click target under media so the bottle stays visible above */}
      <Link
        href="/beer"
        className="absolute inset-0 z-[12]"
        aria-label={catalogAria}
      />
    </section>
  );
}
