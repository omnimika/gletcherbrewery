import Image from "next/image";
import {
  CompositionGrid,
  CompositionPanel,
  Container,
  SectionFrame,
} from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { RUSSIAN_CRAFT_BEER_PATH } from "@/content/russian-craft-beer";
import { productionHref } from "@/lib/site-links";
import type { PublishedLocale } from "@/i18n/locales";

type HomePromosProps = {
  locale: PublishedLocale;
  labels: {
    promosAria: string;
    b2bTitle: string;
    b2bBullet1: string;
    b2bBullet2: string;
    b2bBullet3: string;
    b2bCta: string;
    mapTitleLine1: string;
    mapTitleLine2: string;
    mapBody: string;
    mapCta: string;
  };
};

const ctaClassName =
  "font-display mt-auto inline-flex h-11 min-w-[140px] items-center justify-center self-start px-4 text-xs font-extrabold tracking-wide text-white uppercase transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98] sm:h-[50px]";

const ctaStyle = {
  background:
    "radial-gradient(circle at center, rgba(246,112,116,1) 0%, rgba(254,36,42,1) 48%, rgba(223,30,35,1) 100%)",
} as const;

const cardClassName =
  "group relative flex h-full min-h-0 flex-col gap-6 rounded-lg border border-gletcher-navy bg-gletcher-ice p-5 outline-offset-4 transition-colors hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gletcher-navy sm:gap-7 sm:p-6 lg:p-8";

/**
 * Production ZB `749421571` (RU) / `762053147` (EN): B2B + sales-map.
 * Stretch screen slide — halves-x (two blocks, one slide).
 */
export function HomePromos({ locale, labels }: HomePromosProps) {
  // RU-only B2B landing; EN home also targets this path (production parity).
  const b2bHref = RUSSIAN_CRAFT_BEER_PATH;
  const mapHref = productionHref("map", locale);
  const bullets = [labels.b2bBullet1, labels.b2bBullet2, labels.b2bBullet3];

  return (
    <SectionFrame
      id="promos"
      mode="screen"
      tone="ice"
      snap
      aria-label={labels.promosAria}
    >
      <Container fill>
        <CompositionGrid preset="halves-x" fill>
          <CompositionPanel>
            <Reveal className="flex h-full min-h-0 min-w-0 flex-col">
              <a href={b2bHref} className={cardClassName}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display max-w-[13ch] text-[clamp(1.5rem,4vw,3rem)] leading-[0.9] font-extrabold tracking-wide text-gletcher-navy uppercase">
                    {labels.b2bTitle}
                  </h2>
                  <Image
                    src="/home/partnership-icon.png"
                    alt=""
                    width={128}
                    height={128}
                    className="size-20 shrink-0 rounded-full border border-gletcher-navy object-contain p-2 sm:size-[104px] lg:size-[128px]"
                  />
                </div>

                <ul className="flex flex-col gap-3 sm:gap-3.5">
                  {bullets.map((text) => (
                    <li
                      key={text}
                      className="flex items-start gap-3 text-[13px] leading-snug text-gletcher-navy sm:text-[12px] lg:text-[14px]"
                    >
                      <span
                        aria-hidden
                        className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-gletcher-navy"
                      />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>

                <span className={ctaClassName} style={ctaStyle}>
                  {labels.b2bCta}
                </span>
              </a>
            </Reveal>
          </CompositionPanel>

          <CompositionPanel>
            <Reveal className="flex h-full min-h-0 min-w-0 flex-col">
              <a href={mapHref} className={cardClassName}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display flex min-w-0 flex-col text-gletcher-navy uppercase">
                    <span className="text-[clamp(1.75rem,5vw,3.3rem)] leading-[0.85] font-thin tracking-wide">
                      {labels.mapTitleLine1}
                    </span>
                    <span className="text-[clamp(2.5rem,8vw,5.375rem)] leading-[0.85] font-light tracking-wide">
                      {labels.mapTitleLine2}
                    </span>
                  </h2>
                  <Image
                    src="/home/map-pin.svg"
                    alt=""
                    width={120}
                    height={140}
                    className="mt-1 h-[88px] w-auto shrink-0 sm:h-[126px] lg:h-[149px] xl:h-[170px]"
                  />
                </div>

                <p className="max-w-[28ch] text-[13px] leading-snug whitespace-pre-line text-gletcher-navy sm:text-[12px] lg:text-[14px]">
                  {labels.mapBody}
                </p>

                <span className={ctaClassName} style={ctaStyle}>
                  {labels.mapCta}
                </span>
              </a>
            </Reveal>
          </CompositionPanel>
        </CompositionGrid>
      </Container>
    </SectionFrame>
  );
}
