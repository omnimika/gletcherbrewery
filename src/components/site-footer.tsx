import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout";
import { FooterWatermark } from "@/components/footer-watermark";
import { POLICY_PATH } from "@/content/policy";

const YANDEX_RATING_HREF =
  "https://yandex.ru/maps/org/1395871323/reviews?utm_source=badge&utm_medium=rating&utm_campaign=v1";
const VK_HREF = "https://vk.com/gletcherbrewery";
const TG_HREF = "https://t.me/gletcherbrewery";
const UNTAPPD_HREF = "https://untappd.com/GletcherBrewery";

const contactLinkClass =
  "font-display text-[clamp(0.95rem,1.4vw,1.25rem)] font-black leading-tight tracking-tight text-gletcher-navy uppercase transition-opacity hover:opacity-70";

/**
 * Production footer ZB `740449400` — stretch flex/grid, ice watermark.
 * Whole footer capped at ~50vh (watermark font scales down if needed).
 */
export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="relative bg-gletcher-frost pb-2">
      <Container className="relative z-[2] py-5 sm:py-6">
        {/* Row 1 — contacts · socials · badges */}
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3 lg:gap-8">
          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
            <a href="tel:+74959892414" className={contactLinkClass}>
              +7 (495) 989-24-14
            </a>
            <a
              href="mailto:info@gletcherbrewery.com"
              className={`${contactLinkClass} break-all sm:break-normal`}
            >
              info@gletcherbrewery.com
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href={VK_HREF}
              rel="nofollow noopener noreferrer"
              target="_blank"
              className="inline-flex size-[30px] shrink-0 items-center justify-center transition-opacity hover:opacity-70"
              aria-label="VK"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local SVG; Next/Image crops odd viewBoxes */}
              <img
                src="/pages/home/footer/vk-svg.svg"
                alt=""
                width={30}
                height={30}
                className="size-[30px] object-contain"
              />
            </a>
            <a
              href={TG_HREF}
              rel="nofollow noopener noreferrer"
              target="_blank"
              className="inline-flex size-[30px] shrink-0 items-center justify-center transition-opacity hover:opacity-70"
              aria-label="Telegram"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local SVG; keep 1:1 with asset */}
              <img
                src="/pages/home/footer/telegram.svg"
                alt=""
                width={30}
                height={30}
                className="size-[30px] object-contain"
              />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:justify-end">
            <a
              href={YANDEX_RATING_HREF}
              rel="noopener noreferrer"
              target="_blank"
              className="flex h-[54px] w-[147px] shrink-0 items-center gap-1.5 rounded-lg border border-gletcher-navy bg-white px-2 transition-opacity hover:opacity-80"
            >
              <Image
                src="/pages/home/footer/yandex-mark.svg"
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

            <a
              href={UNTAPPD_HREF}
              rel="nofollow noopener noreferrer"
              target="_blank"
              className="size-[54px] shrink-0 overflow-hidden rounded-[10px] transition-opacity hover:opacity-70"
              aria-label="Untappd"
            >
              <Image
                src="/pages/home/footer/untappd.png"
                alt=""
                width={54}
                height={54}
                className="size-[54px] object-cover"
              />
            </a>
          </div>
        </div>

        {/* Row 2 — copyright · policy */}
        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <p className="max-w-[22rem] text-sm leading-snug text-gletcher-navy">
            {t("copyright")}
          </p>
          <Link
            href={POLICY_PATH}
            locale="ru"
            className="shrink-0 text-sm leading-snug text-gletcher-navy transition-opacity hover:opacity-70 sm:text-right"
          >
            {t("policy")}
          </Link>
        </div>
      </Container>

      <FooterWatermark
        drinkResponsibly={t("drinkResponsibly")}
        healthWarning={t("healthWarning")}
      />
    </footer>
  );
}
