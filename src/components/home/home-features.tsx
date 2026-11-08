import { Link } from "@/i18n/navigation";
import { HomeWindowStage } from "@/components/home/home-window-stage";
import { HOME_FEATURES } from "@/content/home";
import { productionHref } from "@/lib/site-links";
import type { PublishedLocale } from "@/i18n/locales";

type HomeFeaturesProps = {
  locale: PublishedLocale;
  labels: Record<string, string>;
};

export function HomeFeatures({ locale, labels }: HomeFeaturesProps) {
  return (
    <section aria-label={labels.featuresAria} className="bg-gletcher-ice">
      <HomeWindowStage>
        <div className="px-5 py-14 @[640px]:px-8 @[960px]:py-16 @[1200px]:px-10 @[1200px]:py-20">
          <ul className="grid grid-cols-1 gap-10 @[640px]:grid-cols-2 @[960px]:grid-cols-3 @[960px]:gap-12">
            {HOME_FEATURES.map((feature) => {
              const title = labels[feature.titleKey];
              const body = labels[feature.bodyKey];
              const cta = labels[feature.ctaKey];
              const className =
                "group flex h-full flex-col gap-4 border-t border-gletcher-navy/20 pt-6";

              const inner = (
                <>
                  <h2 className="font-display text-[24px] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase @[960px]:text-[30px] @[1200px]:text-[36px]">
                    {title}
                  </h2>
                  <p className="flex-1 text-sm leading-relaxed text-gletcher-navy/75 @[1200px]:text-base">
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
                  ) : feature.href.kind === "absolute" ? (
                    <a href={feature.href.path} className={className}>
                      {inner}
                    </a>
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
        </div>
      </HomeWindowStage>
    </section>
  );
}
