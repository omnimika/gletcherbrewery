import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  CompositionGrid,
  CompositionPanel,
  Container,
  SectionFrame,
} from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { HOME_MENU_CARDS } from "@/content/home-menu";
import { productionHref } from "@/lib/site-links";
import type { PublishedLocale } from "@/i18n/locales";

type HomeMenuGridProps = {
  locale: PublishedLocale;
  labels: Record<string, string>;
};

const cardClassName =
  "group relative flex h-full min-h-0 flex-col rounded-lg border border-gletcher-navy bg-gletcher-ice p-5 outline-offset-4 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-gletcher-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-gletcher-navy sm:p-5 lg:p-[22px]";

/**
 * Production ZB `749502712`: 3×2 section cards on one stretch screen slide.
 * Explicit 1→2→3 columns; two equal rows on wide screens.
 */
export function HomeMenuGrid({ locale, labels }: HomeMenuGridProps) {
  return (
    <SectionFrame
      id="menu"
      mode="screen"
      tone="ice"
      snap
      aria-label={labels.menuAria}
    >
      <Container fill>
        <CompositionGrid preset="full" fill>
          <CompositionPanel className="justify-center">
            <ul className="m-0 grid h-full min-h-0 list-none grid-cols-1 gap-[var(--grid-gap)] p-0 auto-rows-fr sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
              {HOME_MENU_CARDS.map((card) => {
                const title = labels[card.titleKey];
                const body = labels[card.bodyKey];
                const cta = labels[card.ctaKey];

                const inner = (
                  <>
                    <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] leading-[0.85] font-extrabold tracking-wide text-gletcher-navy uppercase">
                      {title}
                    </h2>

                    <div className="mt-3 flex flex-1 items-start justify-between gap-3">
                      <p className="max-w-[14rem] text-[13px] leading-snug text-gletcher-navy lg:text-[14px]">
                        {body}
                      </p>
                      <Image
                        src={card.image}
                        alt=""
                        width={200}
                        height={200}
                        className="mt-1 size-[7.5rem] shrink-0 object-contain sm:size-28 lg:size-[9rem]"
                      />
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <span className="font-display inline-flex h-[41px] min-w-[150px] items-center justify-center border border-gletcher-navy bg-gletcher-ice px-3 text-[12px] font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors duration-300 ease-out group-hover:border-gletcher-red group-hover:bg-gletcher-red group-hover:text-gletcher-ice">
                        {cta}
                      </span>
                      <Image
                        src="/pages/home/menu-arrow.svg"
                        alt=""
                        width={80}
                        height={40}
                        className="h-8 w-auto transition-transform duration-200 group-hover:translate-x-1"
                        style={{ width: "auto" }}
                      />
                    </div>
                  </>
                );

                return (
                  <li key={card.id} className="relative flex min-h-0 min-w-0 flex-col">
                    <Reveal className="flex h-full min-h-0 min-w-0 flex-col">
                      {card.href.kind === "local" ? (
                        <Link href={card.href.path} className={cardClassName}>
                          {inner}
                        </Link>
                      ) : card.href.kind === "absolute" ? (
                        <a href={card.href.path} className={cardClassName}>
                          {inner}
                        </a>
                      ) : (
                        <a
                          href={productionHref(card.href.key, locale)}
                          className={cardClassName}
                        >
                          {inner}
                        </a>
                      )}
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </CompositionPanel>
        </CompositionGrid>
      </Container>
    </SectionFrame>
  );
}
