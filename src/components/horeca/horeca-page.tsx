import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HorecaCompareCardView } from "@/components/horeca/horeca-compare-card";
import { HorecaForm } from "@/components/horeca/horeca-form";
import { HorecaSloganSeal } from "@/components/horeca/horeca-slogan-seal";
import { HORECA_PAGE } from "@/content/horeca";

export function HorecaPageView() {
  const p = HORECA_PAGE;

  return (
    <div className="bg-gletcher-ice text-gletcher-navy">
      {/* Full viewport under fixed header; same composition all breakpoints. */}
      <section
        className="relative isolate flex min-h-[100svh] flex-col border-b border-gletcher-navy/10 bg-gletcher-ice"
        style={{ marginTop: "calc(-1 * var(--hh, 84px))" }}
      >
        {/* Frame width matches header chrome: pad-x … (RU/EN left → МЕНЮ right). */}
        <div
          className="flex min-h-[100svh] w-full flex-1 flex-col pb-3 pt-[calc(var(--hh,84px)+0.65rem)] sm:pb-5 sm:pt-[calc(var(--hh,84px)+0.85rem)] lg:pb-4 lg:pt-[calc(var(--hh,84px)+0.5rem)]"
          style={{ paddingInline: "var(--pad-x, 20px)" }}
        >
          {/* Mobile: stacked. Desktop: ~equal columns inside header-aligned frame. */}
          <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg border border-gletcher-navy bg-gletcher-ice lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:grid-rows-[minmax(0,1fr)]">
            <div className="relative z-[1] flex min-h-0 min-w-0 flex-col gap-6 overflow-visible px-2 pt-8 pb-1 sm:gap-7 sm:px-6 sm:pt-9 sm:pb-2 lg:justify-center lg:gap-8 lg:px-8 lg:py-10 xl:px-10">
              {/* Wordmark ~96% width. Badges sit mostly outside letterforms on mobile
                  (above GLETCHER / below HORECA); pt/pb reserve that space. */}
              <div className="relative mx-auto w-[94%] max-w-full [container-type:inline-size] select-none lg:mx-0 lg:w-full">
                {/* pt/pb reserve space for absolute badges (tight leading overflows glyph box). */}
                <div className="relative pt-8 lg:pt-3">
                  {/* Mobile: in pt band above GLETCHER. Desktop: half-overlap on top edge. */}
                  <span className="animate-horeca-fade-left pointer-events-none absolute top-1 left-0 z-[3] lg:top-3">
                    <span className="inline-flex rounded-full border border-gletcher-navy bg-gletcher-ice px-2 py-0.5 text-[clamp(0.4rem,2.4cqi,0.875rem)] leading-none font-extrabold tracking-wide whitespace-nowrap uppercase sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 lg:text-[clamp(0.7rem,2.1cqi,1.05rem)] lg:-translate-y-1/2">
                      {p.badgeQuality}
                    </span>
                  </span>
                  <p
                    data-horeca-gletcher
                    className="font-display animate-horeca-zoomin mt-1 block w-full text-center text-[length:clamp(2.55rem,15.4cqi,6.8rem)] leading-none font-thin tracking-normal whitespace-nowrap uppercase lg:mt-0 lg:text-left lg:text-[length:clamp(5rem,16.2cqi,9.75rem)]"
                  >
                    {p.brandWord}
                  </p>
                  {/* slogan-red — top-right of R, semicircle frame + rotate appear */}
                  <HorecaSloganSeal
                    brandWord={p.brandWord}
                    src={p.sloganImage.src}
                  />
                </div>
                <div className="relative pb-8 lg:pb-5">
                  <span className="animate-horeca-fade-up pointer-events-none absolute top-0 left-1/2 z-[3]">
                    <span className="inline-flex -translate-x-1/2 -translate-y-[72%] rounded-full border border-gletcher-navy bg-gletcher-ice px-2 py-0.5 text-[clamp(0.5rem,2.8cqi,0.875rem)] leading-none font-extrabold tracking-[0.18em] whitespace-nowrap uppercase sm:px-5 sm:py-2 lg:px-6 lg:py-2.5 lg:text-[clamp(0.8rem,2.4cqi,1.1rem)]">
                      {p.badgeFor}
                    </span>
                  </span>
                  <p
                    className="font-display animate-horeca-zoomin block w-full text-center text-[length:clamp(3.3rem,20cqi,8.8rem)] leading-none font-thin tracking-normal whitespace-nowrap uppercase lg:text-left lg:text-[length:clamp(6.5rem,21cqi,12.5rem)]"
                    style={{ animationDelay: "80ms" }}
                  >
                    {p.heroWord}
                  </p>
                  {/* Mobile: in pb band below HORECA. Desktop: slight bottom overlap. */}
                  <span
                    className="animate-horeca-fade-right pointer-events-none absolute right-0 bottom-1 z-[3] lg:bottom-5"
                    style={{ animationDelay: "120ms" }}
                  >
                    <span className="inline-flex rounded-full border border-gletcher-navy bg-gletcher-ice px-2 py-0.5 text-[clamp(0.4rem,2.4cqi,0.875rem)] leading-none font-extrabold tracking-wide whitespace-nowrap uppercase sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 lg:text-[clamp(0.7rem,2.1cqi,1.05rem)] lg:translate-y-[18%]">
                      {p.badgeSave}
                    </span>
                  </span>
                </div>
              </div>

              <div className="animate-horeca-fade-up mx-auto mt-1 w-full max-w-xl shrink-0 px-1 lg:mx-0 lg:mt-0 lg:px-0">
                <h1 className="font-display text-center text-[clamp(1.05rem,3.6vw,1.85rem)] leading-tight font-extrabold tracking-wide text-gletcher-red uppercase lg:text-left">
                  {p.whyTitle}
                </h1>
                {p.whyBody.map((para) => (
                  <p
                    key={para.slice(0, 24)}
                    className="mt-1.5 text-center text-[clamp(0.7rem,1.9vw,1rem)] leading-snug text-gletcher-navy/85 sm:mt-3 sm:leading-relaxed lg:text-left"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Mobile: object-cover in its row. Desktop: large contain, no divider line. */}
            <div className="animate-horeca-fade-up relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden px-0 py-0 lg:overflow-visible lg:px-2 lg:py-4 xl:px-4">
              <video
                className="h-full max-h-full w-full min-h-0 min-w-0 object-cover object-[center_55%] lg:object-contain lg:object-center"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Бутылка Gletcher"
              >
                <source src={p.heroVideo.hevc} type='video/mp4; codecs="hvc1"' />
                <source src={p.heroVideo.webm} type="video/webm" />
              </video>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-10">
        <h2 className="font-display text-2xl font-extrabold tracking-wide uppercase sm:text-3xl">
          {p.compareTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-gletcher-navy/75 sm:text-base">
          {p.compareLead}
        </p>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {p.compare.map((card) => (
            <HorecaCompareCardView
              key={card.slug}
              card={card}
              switchCta={p.switchCta}
              findCta={p.findCta}
            />
          ))}
        </ul>
      </section>

      <section className="border-y border-gletcher-red/30 bg-gletcher-ice">
        <div className="mx-auto grid max-w-[1100px] gap-8 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-wide uppercase sm:text-4xl">
              {p.audienceTitle}
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-gletcher-navy/85">
              {p.audience.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-gletcher-navy"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg border border-gletcher-navy">
            <Image
              src={p.audienceImage.src}
              alt={p.audienceImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-wide text-gletcher-red uppercase sm:text-3xl">
              {p.distributionTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gletcher-navy/80 sm:text-base">
              {p.distributionBody}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gletcher-navy/80 sm:text-base">
              {p.distributionExtra}
            </p>
          </div>
          <div className="relative mx-auto aspect-[5/3] w-full overflow-hidden rounded-lg border border-gletcher-navy bg-[#fff705]">
            <Image
              src={p.distributionMap.src}
              alt={p.distributionMap.alt}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 520px"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-10">
        <p className="max-w-3xl text-lg font-semibold leading-snug sm:text-xl">
          {p.formLead}
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
          <HorecaForm />
          <div className="flex flex-col gap-4">
            <Link
              href={p.catalogHref}
              className="inline-flex border border-gletcher-navy px-5 py-3 text-sm font-extrabold tracking-wide uppercase transition-colors hover:border-gletcher-red hover:bg-gletcher-red hover:text-gletcher-white"
            >
              {p.catalogCta}
            </Link>
            <a
              href={p.wholesaleHref}
              className="inline-flex border border-gletcher-red px-5 py-3 text-sm font-extrabold tracking-wide text-gletcher-red uppercase transition-colors hover:bg-gletcher-red hover:text-gletcher-white"
            >
              {p.wholesaleCta}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
