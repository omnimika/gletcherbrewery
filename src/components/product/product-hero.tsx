import Image from "next/image";

type ProductHeroProps = {
  title: string;
  coverSrc?: string;
  logoSrc?: string;
  bottleSrc?: string;
  /** Cover PNG already includes the product wordmark — do not overlay logo. */
  coverHasWordmark?: boolean;
};

/**
 * Full-viewport cover (100svh × 100vw), pulled under the fixed header
 * like Tilda product heroes. Cover/logo click scrolls to `#about`.
 * Always exposes a single H1 (sr-only when a visual wordmark is present).
 * DS-3: stable `#hero` + soft snap (custom full-bleed frame, not SectionFrame).
 */
export function ProductHero({
  title,
  coverSrc,
  logoSrc,
  bottleSrc,
  coverHasWordmark = false,
}: ProductHeroProps) {
  const showLogoOverlay = Boolean(logoSrc) && !coverHasWordmark;
  const showTextTitle = !showLogoOverlay && !coverHasWordmark;

  return (
    <section
      id="hero"
      tabIndex={-1}
      aria-label={title}
      className="ds-snap-start relative isolate h-svh w-full overflow-hidden bg-gletcher-ice"
      /* Cancel SiteHeader spacer so cover fills the viewport under fixed chrome. */
      style={{ marginTop: "calc(-1 * var(--hh, 84px))" }}
    >
      <h1 className="sr-only">{title}</h1>

      {coverSrc ? (
        <a
          href="#about"
          className="absolute inset-0 block"
          aria-label={title}
        >
          <Image
            src={coverSrc}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </a>
      ) : bottleSrc ? (
        <a
          href="#about"
          className="absolute inset-0 flex items-end justify-center pb-[12vh]"
          aria-label={title}
        >
          <div className="relative h-[55svh] w-[min(40vw,220px)]">
            <Image
              src={bottleSrc}
              alt=""
              fill
              priority
              className="object-contain object-bottom"
              sizes="220px"
            />
          </div>
        </a>
      ) : (
        <div className="absolute inset-0 bg-gletcher-navy/10" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex justify-center px-[4vw] pb-[3.5vh] pt-6">
        {showLogoOverlay ? (
          <a
            href="#about"
            className="pointer-events-auto"
            aria-hidden
            tabIndex={-1}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt=""
              className="h-auto max-h-[min(36vh,300px)] w-auto max-w-[min(94vw,56rem)] object-contain object-bottom drop-shadow-sm"
            />
          </a>
        ) : showTextTitle ? (
          <a
            href="#about"
            className="pointer-events-auto"
            aria-hidden
            tabIndex={-1}
          >
            <span className="font-display block text-center text-4xl tracking-wide text-gletcher-navy uppercase sm:text-6xl">
              {title}
            </span>
          </a>
        ) : coverHasWordmark ? (
          <a
            href="#about"
            className="pointer-events-auto absolute inset-x-0 bottom-0 h-[28vh]"
            aria-hidden
            tabIndex={-1}
          />
        ) : null}
      </div>
    </section>
  );
}
