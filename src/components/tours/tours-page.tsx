import Image from "next/image";
import {
  CardGrid,
  CardGridItem,
  Container,
  SectionFrame,
} from "@/components/layout";
import { DocumentProximitySnap } from "@/components/motion/document-proximity-snap";
import { Reveal } from "@/components/motion/reveal";
import { ToursContactSection } from "@/components/tours/tours-contact";
import {
  ToursLegalNotice,
  ToursReviewsSection,
} from "@/components/tours/tours-reviews";
import { YclientsEmbed } from "@/components/tours/yclients-embed";
import {
  TOURS_HERO_IMAGE,
  TOURS_YCLIENTS,
  type ToursCopy,
} from "@/content/tours";

const bookBtnStyle = {
  background:
    "radial-gradient(circle at center, rgba(252,59,64,1) 3%, rgba(254,36,42,1) 46%, rgba(213,16,22,1) 100%)",
} as const;

export function ToursPageView({ copy }: { copy: ToursCopy }) {
  return (
    <div className="bg-gletcher-ice text-gletcher-navy">
      <DocumentProximitySnap />

      {/* Hero — ZB 749542126 title stack */}
      <section
        id="hero"
        tabIndex={-1}
        className="ds-snap-start relative isolate flex min-h-[70svh] flex-col border-b border-gletcher-navy/10 bg-gletcher-ice"
        style={{ marginTop: "calc(-1 * var(--hh, 84px))" }}
        aria-labelledby="tours-hero-title"
      >
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-[var(--page-gutter)] pt-[calc(var(--hh,84px)+2rem)] pb-12">
          <Reveal>
            <p className="font-display text-center text-[clamp(2.4rem,8.5vw,6.5rem)] leading-[0.85] font-thin uppercase">
              {copy.hero.line1}
            </p>
            <p className="font-display mt-[-0.05em] text-center text-[clamp(2.2rem,11vw,8.8rem)] leading-[0.85] font-[300] uppercase">
              {copy.hero.line2}
            </p>
            <h1
              id="tours-hero-title"
              className="font-display mt-[-0.05em] text-center text-[clamp(2.75rem,12vw,9rem)] leading-[0.85] font-black uppercase"
            >
              {copy.hero.line3}
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Intro + pricing */}
      <SectionFrame
        id="about"
        mode="content"
        tone="ice"
        snap
        aria-labelledby="tours-invite"
      >
        <Container wide className="max-w-[1100px] py-10 sm:py-14">
          <Reveal>
            <div className="relative mb-8 aspect-[16/5] w-full overflow-hidden sm:mb-10">
              <Image
                src={TOURS_HERO_IMAGE.src}
                alt={TOURS_HERO_IMAGE.alt}
                fill
                className="object-cover object-[center_52%]"
                sizes="(max-width:1100px) 100vw, 1100px"
                priority
              />
            </div>
            <h2
              id="tours-invite"
              className="font-display max-w-3xl text-[clamp(1.5rem,4vw,3rem)] leading-[0.85] font-light uppercase"
            >
              {copy.invite}
            </h2>
            <ul className="mt-8 max-w-3xl space-y-4">
              {copy.bullets.map((b) => (
                <li key={b.slice(0, 32)} className="flex gap-3 text-sm leading-snug sm:text-base">
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gletcher-navy"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h3 className="font-display mt-14 text-[clamp(1.5rem,4vw,3rem)] leading-[0.85] font-light uppercase">
              {copy.pricingTitle}
            </h3>
          </Reveal>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {copy.facts.map((f) => (
              <Reveal key={f.label}>
                <div className="flex h-full flex-col justify-between rounded-lg border border-gletcher-navy p-3 sm:p-4">
                  <p className="text-[0.7rem] leading-snug sm:text-xs">{f.label}</p>
                  <p className="font-display mt-3 text-sm leading-none font-extrabold uppercase sm:text-lg">
                    {f.value}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <CardGrid minCardWidth="18rem" className="mt-8">
            {copy.cards.map((card) => (
              <CardGridItem key={card.id}>
                <Reveal>
                  <article className="flex h-full flex-col rounded-lg border border-gletcher-navy p-5 sm:p-6">
                    <h4 className="font-display text-lg leading-none font-extrabold uppercase sm:text-xl">
                      {card.title}
                    </h4>
                    <p className="mt-3 flex-1 text-xs leading-relaxed text-gletcher-navy/80 sm:text-sm">
                      {card.detail}
                    </p>
                    <p className="font-display mt-4 text-sm font-extrabold uppercase">
                      {card.price}
                    </p>
                    <a
                      href="#booking"
                      className="mt-5 inline-flex min-h-11 items-center justify-center border border-gletcher-navy px-4 text-xs font-thin tracking-wide text-white uppercase"
                      style={bookBtnStyle}
                    >
                      {copy.bookCta}
                    </a>
                  </article>
                </Reveal>
              </CardGridItem>
            ))}
          </CardGrid>

          {copy.gastroNote ? (
            <Reveal>
              <p className="mt-10 max-w-3xl text-sm leading-relaxed text-gletcher-navy/80">
                {copy.gastroNote}
              </p>
            </Reveal>
          ) : null}
        </Container>
      </SectionFrame>

      {/* YCLIENTS booking */}
      <SectionFrame
        id="booking"
        mode="content"
        tone="ice"
        snap
        aria-labelledby="tours-booking"
        className="border-t border-gletcher-navy/10"
      >
        <Container wide className="max-w-[1100px] py-10 sm:py-14">
          <Reveal>
            <h2
              id="tours-booking"
              className="font-display text-[clamp(1.75rem,5vw,3.5rem)] leading-[0.85] font-light uppercase"
            >
              {copy.bookingTitle}
            </h2>
            <p className="mt-3 max-w-xl text-sm text-gletcher-navy/75">
              {copy.bookingLead}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <YclientsEmbed
              src={TOURS_YCLIENTS.personal}
              title={`${copy.bookingTitle} — personal`}
            />
            <YclientsEmbed
              src={TOURS_YCLIENTS.group}
              title={`${copy.bookingTitle} — group`}
            />
          </div>
        </Container>
      </SectionFrame>

      {/* ZB 750698486 — guide Inna + form + video (before howto in source) */}
      <ToursContactSection copy={copy} />

      {/* How to get — RU Confirmed; EN optional */}
      {copy.howTitle && copy.how ? (
        <SectionFrame
          id="howto"
          mode="content"
          tone="ice"
          snap
          aria-labelledby="tours-howto"
          className="border-t border-gletcher-navy/10"
        >
          <Container wide className="max-w-[1100px] py-10 sm:py-14">
            <Reveal>
              <h2
                id="tours-howto"
                className="font-display text-center text-[clamp(2rem,7vw,5.8rem)] leading-[0.85] font-thin uppercase"
              >
                {copy.howTitle}
              </h2>
            </Reveal>
            <CardGrid minCardWidth="16rem" className="mt-10">
              {copy.how.map((item) => (
                <CardGridItem key={item.title}>
                  <Reveal>
                    <article className="flex h-full flex-col rounded-lg border border-gletcher-navy bg-gletcher-ice p-5">
                      <h3 className="font-display text-[clamp(1.25rem,3vw,2.5rem)] leading-[0.85] font-extrabold uppercase">
                        {item.title}
                      </h3>
                      <p className="mt-4 flex-1 text-sm leading-relaxed">
                        {item.body}
                      </p>
                      {item.links.length > 0 ? (
                        <ul className="mt-4 space-y-2">
                          {item.links.map((l) => (
                            <li key={l.href}>
                              <a
                                href={l.href}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="text-sm font-semibold underline decoration-gletcher-red underline-offset-4"
                              >
                                {l.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  </Reveal>
                </CardGridItem>
              ))}
            </CardGrid>
          </Container>
        </SectionFrame>
      ) : null}

      {/* ZB 750881518 — impressions + parallax stickers */}
      <ToursReviewsSection copy={copy.reviews} />

      {copy.legalNotice ? (
        <ToursLegalNotice notice={copy.legalNotice} />
      ) : null}
    </div>
  );
}
