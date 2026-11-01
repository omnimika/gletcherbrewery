import Image from "next/image";
import { HomeWindowStage } from "@/components/home/home-window-stage";
import { productionHref } from "@/lib/site-links";
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
 * brewery tours CTA with crocodile art + three points + book button.
 */
export function HomeToursCta({ locale, labels }: HomeToursCtaProps) {
  const toursHref = productionHref("tours", locale);
  const points = [labels.point1, labels.point2, labels.point3];

  return (
    <section
      id="tours"
      tabIndex={-1}
      aria-label={labels.toursAria}
      className="bg-gletcher-ice"
    >
      <HomeWindowStage>
        <div className="flex flex-col items-center px-5 pb-10 pt-8 @[480px]:px-[10px] @[640px]:px-3 @[640px]:pb-12 @[960px]:px-5 @[960px]:pb-14 @[960px]:pt-10">
          <h2 className="font-display flex flex-col items-center text-center text-[38px] leading-[0.85] tracking-wide text-gletcher-navy uppercase @[480px]:flex-row @[480px]:flex-wrap @[480px]:justify-center @[480px]:gap-x-[0.35em] @[480px]:text-[45px] @[640px]:text-[63px] @[960px]:text-[68px] @[1200px]:text-[84px]">
            <span className="font-black">{labels.titleStrong}</span>
            <span className="font-extralight">{labels.titleRest}</span>
          </h2>

          <ul className="mt-8 grid w-full max-w-[1100px] grid-cols-1 gap-5 @[480px]:mt-10 @[480px]:grid-cols-3 @[480px]:gap-4 @[640px]:gap-6 @[960px]:mt-12 @[960px]:gap-8">
            {points.map((text) => (
              <li
                key={text}
                className="flex items-start gap-3 @[480px]:gap-4"
              >
                <span
                  aria-hidden
                  className="mt-1 h-8 w-px shrink-0 bg-gletcher-navy @[480px]:mt-2 @[480px]:h-10"
                />
                <p className="font-display text-[18px] leading-[0.9] font-extrabold tracking-wide text-gletcher-navy uppercase @[640px]:text-[18px] @[960px]:text-[22px] @[1200px]:text-[24px]">
                  {text}
                </p>
              </li>
            ))}
          </ul>

          <div className="relative mt-6 w-full max-w-[760px] @[480px]:mt-4 @[640px]:mt-2 @[960px]:mt-4 @[960px]:max-w-[960px] @[1200px]:max-w-[760px]">
            <Image
              src="/home/crocodile.png"
              alt=""
              width={1200}
              height={640}
              className="h-auto w-full"
              sizes="(max-width: 960px) 100vw, 760px"
              priority={false}
            />
          </div>

          <a
            href={toursHref}
            className="font-display mt-6 inline-flex h-12 w-full max-w-[400px] items-center justify-center px-4 text-sm font-extrabold tracking-wide text-white uppercase transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98] @[320px]:max-w-[280px] @[480px]:mt-8 @[480px]:max-w-[340px] @[480px]:text-base @[960px]:h-12 @[1200px]:max-w-[400px]"
            style={ctaStyle}
          >
            {labels.cta}
          </a>
        </div>
      </HomeWindowStage>
    </section>
  );
}
