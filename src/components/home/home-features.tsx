import { Link } from "@/i18n/navigation";
import { HOME_FEATURES } from "@/content/home";
import { productionHref } from "@/lib/site-links";
import type { PublishedLocale } from "@/i18n/locales";

type HomeFeaturesProps = {
  locale: PublishedLocale;
  labels: Record<string, string>;
};

export function HomeFeatures({ locale, labels }: HomeFeaturesProps) {
  return (
    <section
      aria-label={labels.featuresAria}
      className="bg-gletcher-ice px-4 py-16 sm:px-8 sm:py-20"
    >
      <ul className="mx-auto grid max-w-[1440px] gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {HOME_FEATURES.map((feature) => {
          const title = labels[feature.titleKey];
          const body = labels[feature.bodyKey];
          const cta = labels[feature.ctaKey];
          const className =
            "group flex h-full flex-col gap-4 border-t border-gletcher-navy/20 pt-6";

          const inner = (
            <>
              <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase">
                {title}
              </h2>
              <p className="flex-1 text-sm leading-relaxed text-gletcher-navy/75 sm:text-base">
                {body}
              </p>
              <span className="font-display text-sm font-extrabold tracking-wide text-gletcher-red uppercase transition-colors group-hover:text-gletcher-deep">
                {cta} →
              </span>
            </>
          );

          return (
            <li key={feature.id}>
              {feature.href.kind === "local" ? (
                <Link href={feature.href.path} className={className}>
                  {inner}
                </Link>
              ) : (
                <a
                  href={productionHref(feature.href.key, locale)}
                  className={className}
                >
                  {inner}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
