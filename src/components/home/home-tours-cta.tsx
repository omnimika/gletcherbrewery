import Image from "next/image";
import {
  CompositionGrid,
  CompositionPanel,
  Container,
  SectionFrame,
} from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { Link } from "@/i18n/navigation";
import type { PublishedLocale } from "@/i18n/locales";

type HomeToursCtaProps = {
  locale: PublishedLocale;
  labels: {
    toursAria: string;
    titleStrong: string;
    titleRest: string;
    point1: string;
    point2: string;
    point3: string;
    cta: string;
  };
};

const ctaStyle = {
  background:
    "radial-gradient(circle at center, rgba(246,112,116,1) 0%, rgba(254,36,42,1) 48%, rgba(223,30,35,1) 100%)",
} as const;

/**
 * Production ZB `749426691` (RU) / `762053148` (EN):
 * brewery tours CTA — stretch screen slide, quarters-y
 * (title+points / art / CTA).
 */
export function HomeToursCta({ locale, labels }: HomeToursCtaProps) {
  const points = [labels.point1, labels.point2, labels.point3];

  return (
    <SectionFrame
      id="tours"
      mode="screen"
      tone="ice"
      snap
      aria-label={labels.toursAria}
    >
      <Container fill>
        <CompositionGrid preset="quarters-y" fill>
          <CompositionPanel className="justify-end gap-6 sm:gap-8">
            <Reveal>
              <h2 className="font-display flex flex-col items-center text-center text-[clamp(2rem,7vw,5.25rem)] leading-[0.85] tracking-wide text-gletcher-navy uppercase sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-[0.35em]">
                <span className="font-black">{labels.titleStrong}</span>
                <span className="font-extralight">{labels.titleRest}</span>
              </h2>
            </Reveal>
            <Reveal>
              <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4 md:gap-6 lg:gap-8">
                {points.map((text) => (
                  <li
                    key={text}
                    className="flex min-w-0 items-start gap-3 sm:gap-4"
                  >
                    <span
                      aria-hidden
                      className="mt-1 h-8 w-px shrink-0 bg-gletcher-navy sm:mt-2 sm:h-10"
                    />
                    <p className="font-display text-[clamp(1rem,2.2vw,1.5rem)] leading-[0.95] font-extrabold tracking-wide text-gletcher-navy uppercase">
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </CompositionPanel>

          <CompositionPanel className="items-center justify-center">
            <Reveal className="flex h-full max-h-full w-full max-w-[760px] items-center justify-center lg:max-w-[960px] xl:max-w-[760px]">
              <Image
                src="/pages/home/crocodile.png"
                alt=""
                width={1200}
                height={640}
                className="h-auto max-h-full w-full object-contain"
                sizes="(max-width: 960px) 100vw, 760px"
                priority={false}
              />
            </Reveal>
          </CompositionPanel>

          <CompositionPanel className="justify-start pt-2 sm:pt-4">
            <Reveal className="flex w-full justify-center">
              <Link
                href="/tours"
                locale={locale}
                className="font-display inline-flex h-12 w-full max-w-[400px] items-center justify-center px-4 text-sm font-extrabold tracking-wide text-white uppercase transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98] sm:max-w-[340px] sm:text-base lg:max-w-[400px]"
                style={ctaStyle}
              >
                {labels.cta}
              </Link>
            </Reveal>
          </CompositionPanel>
        </CompositionGrid>
      </Container>
    </SectionFrame>
  );
}
