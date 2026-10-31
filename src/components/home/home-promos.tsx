import { productionHref, type ExternalNavKey } from "@/lib/site-links";
import type { PublishedLocale } from "@/i18n/locales";
import { HOME_PROMOS } from "@/content/home";

type HomePromosProps = {
  locale: PublishedLocale;
  labels: Record<string, string>;
};

export function HomePromos({ locale, labels }: HomePromosProps) {
  return (
    <section
      aria-label={labels.promosAria}
      className="border-t border-gletcher-navy/10 bg-gletcher-ice"
    >
      <ul className="mx-auto grid max-w-[1440px] gap-px bg-gletcher-navy/10 sm:grid-cols-3">
        {HOME_PROMOS.map((promo) => (
          <li key={promo.id} className="bg-gletcher-ice">
            <a
              href={productionHref(
                promo.href.key as ExternalNavKey,
                locale,
              )}
              className="flex h-full min-h-[8.5rem] flex-col justify-between gap-6 px-6 py-8 transition-colors hover:bg-gletcher-navy/[0.03] sm:px-8"
            >
              <p className="max-w-sm text-[clamp(0.95rem,1.6vw,1.15rem)] leading-snug text-gletcher-navy/85">
                {labels[promo.bodyKey]}
              </p>
              <span
                aria-hidden
                className="font-display text-sm font-extrabold tracking-wide text-gletcher-red uppercase"
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
