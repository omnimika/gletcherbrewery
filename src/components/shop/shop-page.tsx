import { Link } from "@/i18n/navigation";
import { Container, SectionFrame } from "@/components/layout";
import { DocumentProximitySnap } from "@/components/motion/document-proximity-snap";
import { Reveal } from "@/components/motion/reveal";
import { ShopGallery } from "@/components/shop/shop-gallery";
import { ShopRulesPopup } from "@/components/shop/shop-rules-popup";
import { SHOP_PAGE, shopMapWidgetSrc } from "@/content/shop";

/**
 * Firm store — hours ZB, rules popup, address + dark Yandex map.
 * Catalog/cart deferred (source store off).
 */
export function ShopPageView() {
  const p = SHOP_PAGE;
  const mapSrc = shopMapWidgetSrc();

  return (
    <div className="bg-gletcher-ice text-gletcher-navy">
      <DocumentProximitySnap />
      <ShopRulesPopup />

      <SectionFrame
        id="hours"
        mode="content"
        snap
        aria-labelledby="shop-hours-heading"
        className="!py-6 sm:!py-10"
      >
        <Container>
          <Reveal>
            {/* Production frame: 1px #0d0f49, radius 5, bg #e6eefc, ~1160×575 */}
            <div className="@container overflow-hidden rounded-[5px] border border-gletcher-navy bg-gletcher-ice">
              <div className="grid grid-cols-1 items-stretch @[48rem]:grid-cols-2">
                <div className="relative flex flex-col justify-center gap-5 px-5 py-8 sm:gap-6 sm:px-8 sm:py-10 lg:px-10">
                  <h1
                    id="shop-hours-heading"
                    className="font-display text-[clamp(1.75rem,5vw,3.875rem)] leading-none font-black tracking-wide text-gletcher-navy uppercase"
                  >
                    {p.hours.title}
                  </h1>

                  {/* Production left column is text-align:right toward the gallery */}
                  <div className="space-y-2 text-left @[48rem]:max-w-[28rem] @[48rem]:self-end @[48rem]:text-right">
                    <p className="font-display text-[clamp(0.8rem,2vw,1.875rem)] leading-none font-semibold tracking-[0.2em] text-[#aac3ff] uppercase">
                      {p.hours.label}
                    </p>
                    <p className="font-display text-[clamp(1.35rem,3.5vw,3.25rem)] leading-none font-extrabold tracking-wide uppercase">
                      <span>{p.hours.scheduleBefore}</span>
                      <span className="text-gletcher-red">
                        {p.hours.scheduleSunday}
                      </span>
                      <span>{p.hours.scheduleAfter} </span>
                      <em className="not-italic sm:italic">
                        {p.hours.scheduleTime}
                      </em>
                    </p>
                  </div>

                  <div className="space-y-2 text-left @[48rem]:max-w-[28rem] @[48rem]:self-end @[48rem]:text-right">
                    <p className="font-display text-[clamp(0.8rem,2vw,1.875rem)] leading-none font-semibold tracking-[0.2em] text-[#aac3ff] uppercase">
                      {p.hours.callLabel}
                    </p>
                    <a
                      href={p.hours.phoneHref}
                      className="font-display block text-[clamp(1.75rem,5vw,5rem)] leading-none font-light tracking-wide text-gletcher-red uppercase transition-opacity hover:opacity-80"
                    >
                      {p.hours.phoneDisplay}
                    </a>
                  </div>

                  <div className="pt-2 text-left @[48rem]:text-right">
                    <Link
                      href={p.hours.partnershipHref}
                      className="type-caption inline-flex font-semibold tracking-wide text-gletcher-navy uppercase underline-offset-4 hover:underline"
                    >
                      {p.hours.partnershipLabel}
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[16rem] p-4 sm:min-h-[22rem] sm:p-6 lg:p-8">
                  <ShopGallery slides={p.gallery} />
                </div>
              </div>
            </div>
          </Reveal>

          <p className="type-caption mt-4 text-center text-gletcher-navy/50">
            <a
              href="#popup:shopping-rules"
              className="underline-offset-4 hover:text-gletcher-navy hover:underline"
            >
              {p.rules.title}
            </a>
          </p>
        </Container>
      </SectionFrame>

      <SectionFrame
        id="address"
        mode="screen"
        snap
        aria-labelledby="shop-address-heading"
        className="!py-0"
      >
        {/* Production T554: map ~800px, card bg #E6EEFC border #E5373C 1px r5 pad 60 */}
        <div className="relative min-h-[min(80vh,50rem)] w-full overflow-hidden bg-[#111]">
          {/* Extra height clips Yandex Direct strip under the frame (Observed on widget). */}
          <iframe
            title={p.address.map.title}
            src={mapSrc}
            className="absolute inset-x-0 top-0 h-[calc(100%+5.5rem)] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div className="pointer-events-none absolute inset-0 z-[1] flex items-start justify-start p-4 sm:p-8 lg:px-[max(1.5rem,calc((100%-72.5rem)/2))] lg:pt-12">
            <Reveal className="pointer-events-auto w-full max-w-[36rem]">
              <div className="rounded-[5px] border border-gletcher-red bg-gletcher-ice p-6 shadow-[0_8px_32px_rgb(0_0_0_/_0.35)] sm:p-10 lg:p-[3.75rem]">
                <p
                  id="shop-address-heading"
                  className="font-display text-[clamp(1.5rem,3vw,2.625rem)] leading-tight font-light tracking-wide text-gletcher-red uppercase"
                >
                  {p.address.eyebrow}
                </p>
                <p className="font-display mt-5 text-[clamp(1.25rem,2.5vw,2rem)] leading-snug font-medium">
                  {p.address.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                <p className="mt-5 text-sm text-gletcher-navy sm:text-base">
                  {p.address.travelLead}
                </p>
                <ul className="mt-3 space-y-2">
                  {p.address.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-bold text-gletcher-navy underline decoration-gletcher-red underline-offset-4 hover:text-gletcher-red"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-0.5 text-sm text-gletcher-navy/75">
                  {p.address.legal.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </SectionFrame>
    </div>
  );
}
