import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HomeWindowStage } from "@/components/home/home-window-stage";
import { HOME_MENU_CARDS } from "@/content/home-menu";
import { productionHref } from "@/lib/site-links";
import type { PublishedLocale } from "@/i18n/locales";

type HomeMenuGridProps = {
  locale: PublishedLocale;
  labels: Record<string, string>;
};

/**
 * Production ZB `749502712`: 3×2 flex/grid of linked section cards
 * (navy border → red on hover), art thumb, CTA + arrow.
 */
export function HomeMenuGrid({ locale, labels }: HomeMenuGridProps) {
  return (
    <section
      id="menu"
      tabIndex={-1}
      aria-label={labels.menuAria}
      className="bg-gletcher-ice"
    >
      <HomeWindowStage>
        <div className="px-5 py-10 @[480px]:px-[10px] @[640px]:px-3 @[960px]:px-5 @[960px]:py-12">
          <ul className="grid grid-cols-1 gap-5 @[640px]:grid-cols-2 @[960px]:grid-cols-3 @[960px]:gap-[25px]">
            {HOME_MENU_CARDS.map((card) => {
              const title = labels[card.titleKey];
              const body = labels[card.bodyKey];
              const cta = labels[card.ctaKey];

              const inner = (
                <div className="flex h-full min-h-[285px] flex-col p-5 @[960px]:p-[22px]">
                  <h2 className="font-display text-[42px] leading-[0.85] font-extrabold tracking-wide text-gletcher-navy uppercase @[640px]:text-[36px] @[960px]:text-[40px] @[1200px]:text-[48px]">
                    {title}
                  </h2>

                  <div className="mt-3 flex flex-1 items-start justify-between gap-3">
                    <p className="max-w-[14rem] text-[13px] leading-snug text-gletcher-navy @[960px]:text-[14px]">
                      {body}
                    </p>
                    <Image
                      src={card.image}
                      alt=""
                      width={200}
                      height={200}
                      className="mt-1 size-[7.5rem] shrink-0 object-contain @[960px]:size-[9rem]"
                    />
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <span className="font-display inline-flex h-[41px] min-w-[150px] items-center justify-center border border-gletcher-navy bg-gletcher-ice px-3 text-[12px] font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors duration-300 ease-out group-hover:border-gletcher-red group-hover:bg-gletcher-red group-hover:text-gletcher-ice">
                      {cta}
                    </span>
                    <Image
                      src="/home/menu-arrow.svg"
                      alt=""
                      width={80}
                      height={40}
                      className="h-8 w-auto transition-transform duration-200 group-hover:translate-x-1"
                      style={{ width: "auto" }}
                    />
                  </div>
                </div>
              );

              const className =
                "group relative block rounded-[8px] border border-gletcher-navy bg-gletcher-ice outline-offset-4 transition-[border-color,transform] duration-300 ease-out hover:border-gletcher-red hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gletcher-navy";

              return (
                <li key={card.id} className="relative">
                  {card.href.kind === "local" ? (
                    <Link href={card.href.path} className={className}>
                      {inner}
                    </Link>
                  ) : (
                    <a
                      href={productionHref(card.href.key, locale)}
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
