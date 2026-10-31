import Image from "next/image";
import { HomeWindowStage } from "@/components/home/home-window-stage";
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
  "font-display mt-auto inline-flex h-[50px] min-w-[140px] items-center justify-center self-start px-4 text-xs font-extrabold tracking-wide text-white uppercase transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98]";

const ctaStyle = {
  background:
    "radial-gradient(circle at center, rgba(246,112,116,1) 0%, rgba(254,36,42,1) 48%, rgba(223,30,35,1) 100%)",
} as const;

/**
 * Production ZB `749421571` (RU) / `762053147` (EN): B2B + sales-map cards.
 * Window-upscaled artboard (same mode as Tilda).
 */
export function HomePromos({ locale, labels }: HomePromosProps) {
  const b2bHref = productionHref("b2b", locale);
  const mapHref = productionHref("map", locale);
  const bullets = [labels.b2bBullet1, labels.b2bBullet2, labels.b2bBullet3];

  return (
    <section aria-label={labels.promosAria} className="bg-gletcher-ice">
      <HomeWindowStage>
        <div className="px-5 pb-8 @[480px]:px-[10px] @[640px]:px-3 @[960px]:px-5 @[960px]:pb-10">
          <div className="grid grid-cols-1 gap-4 @[640px]:grid-cols-2 @[640px]:gap-5">
            <a
              href={b2bHref}
              className="group relative flex min-h-[340px] flex-col gap-7 rounded-lg border border-gletcher-navy bg-gletcher-ice p-6 outline-offset-4 transition-colors hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gletcher-navy @[480px]:min-h-[230px] @[640px]:min-h-[440px] @[960px]:min-h-[340px] @[960px]:p-8"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display max-w-[13ch] text-[30px] leading-[0.9] font-extrabold tracking-wide text-gletcher-navy uppercase @[480px]:text-[30px] @[960px]:text-[40px] @[1200px]:text-[48px]">
                  {labels.b2bTitle}
                </h2>
                <Image
                  src="/home/partnership-icon.png"
                  alt=""
                  width={128}
                  height={128}
                  className="size-[104px] shrink-0 rounded-full border border-gletcher-navy object-contain p-2 @[960px]:size-[128px]"
                />
              </div>

              <ul className="flex flex-col gap-3.5">
                {bullets.map((text) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 text-[12px] leading-snug text-gletcher-navy @[480px]:text-[10px] @[960px]:text-[14px]"
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

            <a
              href={mapHref}
              className="group relative flex min-h-[340px] flex-col gap-7 rounded-lg border border-gletcher-navy bg-gletcher-ice p-6 outline-offset-4 transition-colors hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gletcher-navy @[480px]:min-h-[230px] @[640px]:min-h-[440px] @[960px]:min-h-[340px] @[960px]:p-8"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display flex flex-col text-gletcher-navy uppercase">
                  <span className="text-[43px] leading-[0.85] font-thin tracking-wide @[960px]:text-[46px] @[1200px]:text-[53px]">
                    {labels.mapTitleLine1}
                  </span>
                  <span className="text-[70px] leading-[0.85] font-light tracking-wide @[960px]:text-[75px] @[1200px]:text-[86px]">
                    {labels.mapTitleLine2}
                  </span>
                </h2>
                <Image
                  src="/home/map-pin.svg"
                  alt=""
                  width={120}
                  height={140}
                  className="mt-1 h-[126px] shrink-0 @[960px]:h-[149px] @[1200px]:h-[170px]"
                  style={{ width: "auto" }}
                />
              </div>

              <p className="max-w-[28ch] text-[12px] leading-snug whitespace-pre-line text-gletcher-navy @[480px]:text-[10px] @[960px]:text-[14px]">
                {labels.mapBody}
              </p>

              <span className={ctaClassName} style={ctaStyle}>
                {labels.mapCta}
              </span>
            </a>
          </div>
        </div>
      </HomeWindowStage>
    </section>
  );
}
