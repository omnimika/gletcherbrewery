import { BottleWithGlass } from "@/components/product/bottle-with-glass";
import { ProductSpecsPanel } from "@/components/product/product-specs";
import { splitPairingTags } from "@/lib/format-spec";
import type { PublishedLocale } from "@/i18n/locales";

type ProductDetailProps = {
  locale: PublishedLocale;
  title: string;
  taste: string;
  about: string;
  foodPairing: string;
  fermentation: string;
  bottleSrc?: string;
  glassSrc?: string;
  specs: {
    abv: string;
    og: string;
    ibu: string;
    style: string;
    malts: string;
    hops: string;
    bottleVol?: string;
    kegVol?: string;
  };
  labels: {
    expect: string;
    aboutTaste: string;
    pairing: string;
    strength: string;
    gravity: string;
    bitterness: string;
    malts: string;
    hops: string;
    bottle: string;
    keg: string;
  };
};

/**
 * `#about` variety block: at least one screen on tablet/desktop (100svh − header)
 * when content fits; grows with copy on short windows / zoom / long text.
 * Media + copy fill the width; type/spacing scale with viewport.
 */
export function ProductDetail({
  locale,
  title,
  taste,
  about,
  foodPairing,
  fermentation,
  bottleSrc,
  glassSrc,
  specs,
  labels,
}: ProductDetailProps) {
  const tags = splitPairingTags(foodPairing);

  return (
    <section
      id="about"
      className="relative z-10 scroll-mt-[var(--hh,84px)] bg-gletcher-ice md:min-h-[calc(100svh-var(--hh,84px))]"
    >
      <div className="box-border flex w-full flex-col gap-6 px-[clamp(1rem,2.5vw,2rem)] py-8 md:grid md:min-h-[calc(100svh-var(--hh,84px))] md:grid-cols-[minmax(17rem,0.44fr)_minmax(0,1fr)] md:items-stretch md:gap-[clamp(1.25rem,3vw,2.75rem)] md:px-[clamp(1.25rem,3.5vw,3rem)] md:py-[clamp(0.85rem,2.2svh,1.65rem)] md:pb-[clamp(1rem,2.8svh,1.85rem)]">
        {/* Left: G + bottle/glass — fully visible, no crop */}
        <div className="relative mx-auto aspect-[3/5] w-full max-w-[24rem] md:mx-0 md:aspect-auto md:min-h-0 md:max-w-none md:self-stretch">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.42]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-simple-ice.svg"
              alt=""
              className="h-full w-full object-contain object-center"
            />
          </div>

          {bottleSrc ? (
            <div className="absolute inset-y-[1%] inset-x-[6%] z-[1] md:inset-y-[2%] md:inset-x-[8%]">
              <BottleWithGlass
                title={title}
                bottleSrc={bottleSrc}
                glassSrc={glassSrc}
              />
            </div>
          ) : null}
        </div>

        {/* Right: continuous stack — no clip; grows with content */}
        <div className="flex min-w-0 flex-col justify-center gap-[clamp(1rem,2.8svh,1.85rem)]">
          <div className="min-w-0">
            <p className="text-[clamp(0.68rem,1.4svh,0.75rem)] font-semibold tracking-[0.2em] text-gletcher-navy/55 uppercase">
              {labels.expect}
            </p>
            <h2 className="font-display mt-[0.35em] text-[clamp(1.35rem,calc(4.4svh+0.85vw),3.35rem)] leading-[1.05] font-extrabold tracking-wide text-gletcher-navy uppercase xl:text-[clamp(1.5rem,calc(4.8svh+1vw),3.75rem)]">
              {taste}
            </h2>
          </div>

          <div className="grid min-w-0 gap-[clamp(0.75rem,2svh,1.35rem)] sm:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
            <div className="min-w-0">
              <p className="text-[clamp(0.68rem,1.4svh,0.75rem)] font-semibold tracking-[0.18em] text-gletcher-navy/60 uppercase">
                {labels.aboutTaste}
              </p>
              <p className="mt-[0.45em] text-[clamp(0.85rem,1.85svh,1.05rem)] leading-relaxed text-gletcher-navy/85">
                {about}
              </p>
            </div>

            {tags.length > 0 ? (
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[clamp(0.68rem,1.4svh,0.75rem)] font-semibold tracking-[0.18em] text-gletcher-navy/60 uppercase">
                  {labels.pairing}
                  <span aria-hidden className="text-[1.1em] leading-none">
                    →
                  </span>
                </p>
                <ul className="mt-[0.5em] flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li key={tag}>
                      <span className="inline-flex rounded-full border border-gletcher-navy px-[0.9em] py-[0.45em] text-[clamp(0.65rem,1.3svh,0.75rem)] font-semibold tracking-wide text-gletcher-navy uppercase">
                        {tag}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <ProductSpecsPanel
            locale={locale}
            abv={specs.abv}
            og={specs.og}
            ibu={specs.ibu}
            style={specs.style}
            fermentation={fermentation}
            malts={specs.malts}
            hops={specs.hops}
            bottleVol={specs.bottleVol}
            kegVol={specs.kegVol}
            labels={{
              strength: labels.strength,
              gravity: labels.gravity,
              bitterness: labels.bitterness,
              malts: labels.malts,
              hops: labels.hops,
              bottle: labels.bottle,
              keg: labels.keg,
            }}
          />
        </div>
      </div>
    </section>
  );
}
