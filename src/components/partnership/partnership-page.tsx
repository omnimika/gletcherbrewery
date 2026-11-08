import type { ReactNode } from "react";
import { BottleCarousel3D } from "@/components/collections/bottle-carousel-3d";
import {
  CardGrid,
  CardGridItem,
  CompositionGrid,
  CompositionPanel,
  SectionFrame,
} from "@/components/layout";
import { DocumentProximitySnap } from "@/components/motion/document-proximity-snap";
import { Reveal } from "@/components/motion/reveal";
import { PartnershipForm } from "@/components/partnership/partnership-form";
import { PartnershipMaterialCard } from "@/components/partnership/partnership-material-card";
import { LinkButton } from "@/components/ui/link-button";
import type { PartnershipCopy } from "@/content/partnership";
import {
  PARTNERSHIP_SECTIONS,
  type PartnershipSectionId,
} from "@/content/partnership-sections";
import { CATALOG_PRODUCTS } from "@/content/products";

type PartnershipPageViewProps = {
  copy: PartnershipCopy;
};

function B2bMeasure({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-[var(--page-gutter)]">
      {children}
    </div>
  );
}

function sectionLabel(
  id: PartnershipSectionId,
  isEn: boolean,
): string {
  const def = PARTNERSHIP_SECTIONS.find((s) => s.id === id);
  if (!def) return id;
  return isEn ? def.labelEn : def.labelRu;
}

export function PartnershipPageView({ copy }: PartnershipPageViewProps) {
  const isEn = copy.path.startsWith("/en");
  const hasPillars = copy.pillars.length > 0;
  const hasMaterials = copy.materials.length > 0;

  const navIds: PartnershipSectionId[] = [
    ...(hasPillars ? (["pillars"] as const) : []),
    ...(hasMaterials ? (["materials"] as const) : []),
    "request",
  ];

  const navAria = isEn ? "Page sections" : "Разделы страницы";
  const carouselLabel = isEn
    ? "Gletcher bottle carousel"
    : "Карусель бутылок Gletcher";
  const bottleItems = CATALOG_PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    title: p.title,
    image: p.image,
  }));

  return (
    <div className="bg-gletcher-ice text-gletcher-navy">
      <DocumentProximitySnap />

      <SectionFrame
        id="hero"
        mode="content"
        snap
        aria-labelledby="partnership-hero-title"
      >
        <B2bMeasure>
          <CompositionGrid
            preset="halves-x"
            className="min-h-[min(72svh,36rem)] items-stretch gap-8 lg:gap-10"
          >
            <CompositionPanel className="flex flex-col justify-center">
              <Reveal>
                <h1
                  id="partnership-hero-title"
                  className="font-display text-[clamp(2rem,5.5vw,3.75rem)] leading-[0.95] font-extrabold tracking-wide uppercase"
                >
                  {copy.heroTitle}
                </h1>
                <p className="type-body mt-5 max-w-3xl text-gletcher-navy/80">
                  {copy.lead}
                </p>
                {copy.leadAccent ? (
                  <p className="type-body mt-4 max-w-3xl text-gletcher-navy/80">
                    <span className="text-gletcher-red">{copy.leadAccent}</span>
                  </p>
                ) : null}
                {copy.discount ? (
                  <a
                    href={copy.discount.href}
                    className="mt-6 inline-flex items-center gap-3 border border-gletcher-red px-4 py-2 text-sm font-extrabold tracking-wide text-gletcher-red uppercase transition-colors hover:bg-gletcher-red hover:text-gletcher-white"
                  >
                    {copy.discount.label}
                  </a>
                ) : null}
              </Reveal>
            </CompositionPanel>
            <CompositionPanel className="flex min-h-[min(72svh,34rem)] min-w-0 @[40rem]:min-h-0">
              <BottleCarousel3D
                items={bottleItems}
                label={carouselLabel}
                className="h-full min-h-0 w-full"
              />
            </CompositionPanel>
          </CompositionGrid>
        </B2bMeasure>
      </SectionFrame>

      {hasPillars ? (
        <SectionFrame
          id="pillars"
          mode="content"
          snap
          aria-label={sectionLabel("pillars", isEn)}
        >
          <B2bMeasure>
            <nav aria-label={navAria} className="mb-8 flex flex-wrap gap-2">
              {navIds.map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="type-caption rounded-[var(--radius-pill)] border border-gletcher-navy/25 px-3 py-1.5 hover:border-gletcher-navy"
                >
                  {sectionLabel(id, isEn)}
                </a>
              ))}
            </nav>
            <CardGrid columns={3} minCardWidth="16rem">
              {copy.pillars.map((pillar) => (
                <CardGridItem key={pillar.title}>
                  <Reveal>
                    <h2 className="font-display text-xl font-extrabold tracking-wide text-gletcher-red uppercase sm:text-2xl">
                      {pillar.title}
                    </h2>
                    <p className="type-body-small mt-3 text-gletcher-navy/80">
                      {pillar.body}
                    </p>
                  </Reveal>
                </CardGridItem>
              ))}
            </CardGrid>
          </B2bMeasure>
        </SectionFrame>
      ) : null}

      {hasMaterials ? (
        <SectionFrame
          id="materials"
          mode="content"
          snap
          tone="ice"
          className="border-y border-gletcher-navy/10"
          aria-labelledby="partnership-materials-heading"
        >
          <B2bMeasure>
            {!hasPillars ? (
              <nav aria-label={navAria} className="mb-8 flex flex-wrap gap-2">
                {navIds.map((id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="type-caption rounded-[var(--radius-pill)] border border-gletcher-navy/25 px-3 py-1.5 hover:border-gletcher-navy"
                  >
                    {sectionLabel(id, isEn)}
                  </a>
                ))}
              </nav>
            ) : null}
            <Reveal>
              <p
                id="partnership-materials-heading"
                className="font-display max-w-3xl text-2xl leading-tight font-extrabold tracking-wide uppercase sm:text-3xl"
              >
                {copy.materialsIntro}
              </p>
            </Reveal>
            <CardGrid columns={3} className="mt-8" minCardWidth="16rem">
              {copy.materials.map((item) => (
                <CardGridItem key={item.id}>
                  <PartnershipMaterialCard
                    item={item}
                    downloadLabel={copy.downloadLabel}
                  />
                </CardGridItem>
              ))}
            </CardGrid>
          </B2bMeasure>
        </SectionFrame>
      ) : null}

      <SectionFrame
        id="request"
        mode="content"
        aria-labelledby="partnership-request-heading"
      >
        <B2bMeasure>
          {!hasPillars && !hasMaterials ? (
            <nav aria-label={navAria} className="mb-8 flex flex-wrap gap-2">
              {navIds.map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="type-caption rounded-[var(--radius-pill)] border border-gletcher-navy/25 px-3 py-1.5 hover:border-gletcher-navy"
                >
                  {sectionLabel(id, isEn)}
                </a>
              ))}
            </nav>
          ) : null}
          <CompositionGrid preset="halves-x" className="items-start">
            <CompositionPanel>
              <Reveal>
                <h2
                  id="partnership-request-heading"
                  className="type-display-section text-gletcher-navy"
                >
                  {copy.formTitle}
                </h2>
                <p className="type-body mt-4 text-gletcher-navy/75">
                  {copy.leadAccent ?? copy.lead}
                </p>
                <LinkButton
                  href={copy.catalogHref}
                  variant="outline"
                  size="lg"
                  className="mt-8"
                >
                  {copy.catalogCta}
                </LinkButton>
              </Reveal>
            </CompositionPanel>
            <CompositionPanel>
              <PartnershipForm copy={copy} />
            </CompositionPanel>
          </CompositionGrid>
        </B2bMeasure>
      </SectionFrame>
    </div>
  );
}
