import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CardGrid,
  CardGridItem,
  CompositionGrid,
  CompositionPanel,
  Container,
  ReadingContainer,
  SectionFrame,
} from "@/components/layout";
import {
  Banner,
  CardActions,
  CardBody,
  CardHeading,
  CardMedia,
  CardShell,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { IconButton } from "@/components/ui/icon-button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import {
  Badge,
  EmptyState,
  FormStatus,
  InlineError,
  LoadingState,
} from "@/components/ui/feedback";
import { Reveal } from "@/components/motion/reveal";
import { DocumentProximitySnap } from "@/components/motion/document-proximity-snap";
import { Carousel, CarouselSlide } from "@/components/collections/carousel";
import { CompareFaceDemo } from "@/components/design-system/compare-face-demo";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Design system showcase",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const showcaseEnabled =
  process.env.NODE_ENV !== "production" ||
  process.env.ENABLE_DESIGN_SHOWCASE === "1";

const LONG_RU =
  "Длинная русская строка для проверки переноса: качественное крафтовое пиво для баров, ресторанов, магазинов и дистрибьюторов по всей территории Российской Федерации без потери читаемости.";
const LONG_EN =
  "Long English reflow sample for future locales: premium craft beer assortment for bars, restaurants, retail and distributors without shrinking the whole UI to force a single viewport height.";
const LONG_DE_PSEUDO =
  "Pseudo-DE length check: Hochwertiges Craftbier für Gastronomie, Einzelhandel und Distributoren — Typografie und Layout müssen umbrechen, statt die ganze Seite zu skalieren.";

function PanelBox({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="flex h-full min-h-24 flex-col justify-center rounded-[var(--radius-card)] border border-gletcher-navy/40 bg-gletcher-frost/50 p-4">
      <p className="type-heading-card">{title}</p>
      {note ? (
        <p className="type-caption mt-1 text-gletcher-navy/65">{note}</p>
      ) : null}
    </div>
  );
}

function SampleCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <CardShell className="h-full">
      <CardMedia>
        <div className="flex h-full items-center justify-center type-caption text-gletcher-navy/50">
          Media / missing
        </div>
      </CardMedia>
      <CardHeading>{title}</CardHeading>
      <CardBody>{body}</CardBody>
      <CardActions>
        <Button type="button" size="sm" variant="outline">
          Action
        </Button>
      </CardActions>
    </CardShell>
  );
}

export default async function DesignSystemShowcasePage() {
  if (!showcaseEnabled) notFound();

  return (
    <SiteShell>
      <DocumentProximitySnap />
      <div className="border-b border-gletcher-navy/10 bg-gletcher-ice">
        <Container className="py-8">
          <p className="type-label text-gletcher-action">DS-1 · Dev only</p>
          <h1 className="type-display-section mt-2 text-gletcher-navy">
            Design system showcase
          </h1>
          <p className="type-body mt-3 max-w-3xl text-gletcher-navy/80">
            Tokens, layout presets, control/card/field states, banner, carousel,
            reveal, and CompareCard focus contract. Soft proximity snap is opt-in
            on this page only — not a global site default.
          </p>
          <nav
            aria-label="Showcase sections"
            className="mt-5 flex flex-wrap gap-2"
          >
            {[
              ["tokens", "Tokens"],
              ["type", "Type"],
              ["actions", "Actions"],
              ["fields", "Fields"],
              ["layouts", "Layouts"],
              ["cards", "Cards"],
              ["banner", "Banner"],
              ["carousel", "Carousel"],
              ["reveal", "Reveal"],
              ["compare-focus", "Compare focus"],
              ["reading", "Reading"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="type-caption rounded-[var(--radius-pill)] border border-gletcher-navy/30 px-3 py-1.5 hover:border-gletcher-navy"
              >
                {label}
              </a>
            ))}
          </nav>
        </Container>

        <SectionFrame id="tokens" mode="content" snap aria-labelledby="tokens-h">
          <Container>
            <h2 id="tokens-h" className="type-display-section">
              Tokens
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {[
                ["ice", "bg-gletcher-ice border"],
                ["frost", "bg-gletcher-frost"],
                ["navy", "bg-gletcher-navy"],
                ["red", "bg-gletcher-red"],
                ["action", "bg-gletcher-action"],
                ["sky", "bg-gletcher-sky"],
                ["deep", "bg-gletcher-deep"],
                ["new", "bg-gletcher-new"],
              ].map(([name, cls]) => (
                <li key={name} className="min-w-0">
                  <div
                    className={`aspect-square rounded-[var(--radius-control)] border border-gletcher-navy/20 ${cls}`}
                  />
                  <p className="type-caption mt-1">{name}</p>
                </li>
              ))}
            </ul>
            <p className="type-body-small mt-4 text-gletcher-navy/70">
              Space scale 4–96px · gutter clamp · gap clamp · radius
              control/card/pill · focus 2px/2px · layers base→toast · motion
              feedback/reveal/overlay.
            </p>
          </Container>
        </SectionFrame>

        <SectionFrame id="type" mode="content" snap aria-labelledby="type-h">
          <Container>
            <h2 id="type-h" className="type-display-section">
              Type roles
            </h2>
            <div className="mt-6 space-y-3">
              <p className="type-display-hero">Display hero</p>
              <p className="type-display-section">Display section</p>
              <p className="type-heading-card">Heading card</p>
              <p className="type-heading-prose">Heading prose</p>
              <p className="type-body">{LONG_RU}</p>
              <p className="type-body">{LONG_EN}</p>
              <p className="type-body-small">{LONG_DE_PSEUDO}</p>
              <p className="type-label">Label uppercase</p>
              <p className="type-caption">Caption / meta</p>
            </div>
          </Container>
        </SectionFrame>

        <SectionFrame id="actions" mode="content" snap aria-labelledby="actions-h">
          <Container>
            <h2 id="actions-h" className="type-display-section">
              Actions
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button type="button" variant="primary">
                Primary action
              </Button>
              <Button type="button" variant="brand">
                Brand red
              </Button>
              <Button type="button" variant="secondary">
                Secondary
              </Button>
              <Button type="button" variant="outline">
                Outline
              </Button>
              <Button type="button" variant="ghost">
                Ghost
              </Button>
              <Button type="button" variant="primary" disabled>
                Disabled
              </Button>
              <Button type="button" variant="primary" loading>
                Saving…
              </Button>
              <LinkButton href="/beer" variant="outline">
                Link button
              </LinkButton>
              <IconButton label="Close sample" variant="outline">
                <span aria-hidden>×</span>
              </IconButton>
            </div>
            <p className="type-caption mt-3 text-gletcher-navy/60">
              Hover / focus-visible / pressed via CSS. Primary uses action-red
              (#c82731) for contrast; brand keeps #e5373c.
            </p>
          </Container>
        </SectionFrame>

        <SectionFrame id="fields" mode="content" snap aria-labelledby="fields-h">
          <Container>
            <h2 id="fields-h" className="type-display-section">
              Fields & feedback
            </h2>
            <div className="mt-6 grid max-w-xl gap-4">
              <Field id="ds-name" label="Name" help="Visible help text">
                <TextInput id="ds-name" name="name" placeholder="Name" />
              </Field>
              <Field id="ds-err" label="Email" error="Enter a valid email">
                <TextInput
                  id="ds-err"
                  name="email"
                  type="email"
                  invalid
                  defaultValue="bad@"
                />
              </Field>
              <Field id="ds-ro" label="Readonly">
                <TextInput id="ds-ro" name="ro" readOnly defaultValue="Locked" />
              </Field>
              <Field id="ds-dis" label="Disabled">
                <TextInput id="ds-dis" name="dis" disabled defaultValue="N/A" />
              </Field>
              <Field id="ds-area" label="Comment">
                <TextArea id="ds-area" name="comment" rows={3} />
              </Field>
              <FormStatus tone="neutral">
                Stub form — no success claim without a real submit.
              </FormStatus>
              <FormStatus tone="error" role="alert">
                Error status example
              </FormStatus>
              <InlineError>Inline error</InlineError>
              <div className="flex flex-wrap gap-2">
                <Badge tone="navy">Navy</Badge>
                <Badge tone="red">Red</Badge>
                <Badge tone="new">New</Badge>
                <Badge>Muted</Badge>
              </div>
              <LoadingState label="Loading sample" />
              <EmptyState
                title="Nothing here"
                body="Empty / missing media fallback surface."
              />
            </div>
          </Container>
        </SectionFrame>

        <SectionFrame
          id="layouts"
          mode="screen"
          tone="ice"
          snap
          aria-labelledby="layouts-h"
        >
          <Container wide>
            <h2 id="layouts-h" className="type-display-section">
              Compositions
            </h2>
            <div className="mt-6 space-y-8">
              {(
                [
                  ["full", "full"],
                  ["halves-x", "halves-x · 50/50"],
                  ["halves-y", "halves-y"],
                  ["quarters-x", "quarters-x · 25/50/25"],
                  ["quarters-y", "quarters-y"],
                  ["quad", "quad · 2×2"],
                ] as const
              ).map(([preset, label]) => (
                <div key={preset}>
                  <p className="type-label mb-2">{label}</p>
                  <CompositionGrid
                    preset={preset}
                    className={
                      preset.includes("y") || preset === "quad"
                        ? "min-h-[16rem]"
                        : ""
                    }
                  >
                    {preset === "full" ? (
                      <CompositionPanel>
                        <PanelBox title="Full width panel" />
                      </CompositionPanel>
                    ) : null}
                    {preset === "halves-x" || preset === "halves-y" ? (
                      <>
                        <CompositionPanel>
                          <PanelBox title="A" />
                        </CompositionPanel>
                        <CompositionPanel>
                          <PanelBox title="B" />
                        </CompositionPanel>
                      </>
                    ) : null}
                    {preset === "quarters-x" || preset === "quarters-y" ? (
                      <>
                        <CompositionPanel>
                          <PanelBox title="Context" />
                        </CompositionPanel>
                        <CompositionPanel>
                          <PanelBox title="Accent" note="2fr" />
                        </CompositionPanel>
                        <CompositionPanel>
                          <PanelBox title="CTA" />
                        </CompositionPanel>
                      </>
                    ) : null}
                    {preset === "quad" ? (
                      <>
                        <CompositionPanel>
                          <PanelBox title="1" />
                        </CompositionPanel>
                        <CompositionPanel>
                          <PanelBox title="2" />
                        </CompositionPanel>
                        <CompositionPanel>
                          <PanelBox title="3" />
                        </CompositionPanel>
                        <CompositionPanel>
                          <PanelBox title="4" />
                        </CompositionPanel>
                      </>
                    ) : null}
                  </CompositionGrid>
                </div>
              ))}
            </div>
          </Container>
        </SectionFrame>

        <SectionFrame
          id="screen-halves-x"
          mode="screen"
          tone="frost"
          snap
          aria-labelledby="screen-halves-x-h"
        >
          <Container fill wide>
            <h2 id="screen-halves-x-h" className="type-label shrink-0">
              Screen fill · halves-x
            </h2>
            <CompositionGrid preset="halves-x" fill className="mt-4">
              <CompositionPanel>
                <PanelBox title="Left 50%" note="stretch" />
              </CompositionPanel>
              <CompositionPanel>
                <PanelBox title="Right 50%" note="stretch" />
              </CompositionPanel>
            </CompositionGrid>
          </Container>
        </SectionFrame>

        <SectionFrame
          id="screen-quarters-y"
          mode="screen"
          tone="ice"
          snap
          aria-labelledby="screen-quarters-y-h"
        >
          <Container fill wide>
            <h2 id="screen-quarters-y-h" className="type-label shrink-0">
              Screen fill · quarters-y
            </h2>
            <CompositionGrid preset="quarters-y" fill className="mt-4">
              <CompositionPanel>
                <PanelBox title="Top 1fr" />
              </CompositionPanel>
              <CompositionPanel>
                <PanelBox title="Middle 2fr" note="accent" />
              </CompositionPanel>
              <CompositionPanel>
                <PanelBox title="Bottom 1fr" />
              </CompositionPanel>
            </CompositionGrid>
          </Container>
        </SectionFrame>

        <SectionFrame id="cards" mode="content" snap aria-labelledby="cards-h">
          <Container>
            <h2 id="cards-h" className="type-display-section">
              Card grids 3 / 4 / 6
            </h2>
            {([3, 4, 6] as const).map((n) => (
              <div key={n} className="mt-8">
                <p className="type-label mb-3">{n} cards</p>
                <CardGrid columns={n}>
                  {Array.from({ length: n }, (_, i) => (
                    <CardGridItem key={i}>
                      <SampleCard
                        title={`Card ${i + 1}`}
                        body={
                          i === 0
                            ? LONG_RU
                            : "Equal stretch actions; long titles wrap without clipping CTAs."
                        }
                      />
                    </CardGridItem>
                  ))}
                </CardGrid>
              </div>
            ))}
            <div className="mt-8">
              <p className="type-label mb-3">
                columns=3 with 8 cards (max columns must hold)
              </p>
              <CardGrid columns={3} minCardWidth="12rem">
                {Array.from({ length: 8 }, (_, i) => (
                  <CardGridItem key={i}>
                    <SampleCard
                      title={`Overflow ${i + 1}`}
                      body="Wide container + 8 items must not exceed 3 columns."
                    />
                  </CardGridItem>
                ))}
              </CardGrid>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <CardShell selected>
                <CardHeading>Selected / emphasis</CardHeading>
                <CardBody>focus-within and selected ring.</CardBody>
                <CardActions>
                  <Button type="button" size="sm">
                    Choose
                  </Button>
                </CardActions>
              </CardShell>
              <CardShell>
                <CardMedia>
                  <div className="flex h-full items-center justify-center type-caption text-gletcher-action">
                    Media error / missing fallback
                  </div>
                </CardMedia>
                <CardHeading>Missing media</CardHeading>
                <CardBody>Stable surface without broken image layout shift.</CardBody>
              </CardShell>
            </div>
          </Container>
        </SectionFrame>

        <SectionFrame id="banner" mode="banner" snap aria-labelledby="banner-h">
          <Container>
            <h2 id="banner-h" className="sr-only">
              Banner
            </h2>
            <Banner tone="navy">
              <p className="type-heading-card text-gletcher-white">Banner recipe</p>
              <p className="type-body-small mt-2 max-w-2xl text-gletcher-white/85">
                Compact accent band — height from content, not forced viewport.
              </p>
            </Banner>
          </Container>
        </SectionFrame>

        <SectionFrame
          id="carousel"
          mode="content"
          snap
          aria-labelledby="carousel-h"
        >
          <Container>
            <h2 id="carousel-h" className="sr-only">
              Carousel
            </h2>
            <Carousel label="Carousel recipe (autoplay off)">
              {[1, 2, 3, 4].map((n) => (
                <CarouselSlide key={n}>
                  <SampleCard title={`Slide ${n}`} body="One accessible copy." />
                </CarouselSlide>
              ))}
            </Carousel>
          </Container>
        </SectionFrame>

        <SectionFrame id="reveal" mode="content" snap aria-labelledby="reveal-h">
          <Container>
            <h2 id="reveal-h" className="type-display-section">
              Reveal
            </h2>
            <Reveal className="mt-6 rounded-[var(--radius-card)] border border-gletcher-navy/30 bg-gletcher-frost/40 p-5">
              <p className="type-body">
                Reveal is visible without JS. With JS it fades once on enter;
                reduced-motion keeps it static.
              </p>
            </Reveal>
          </Container>
        </SectionFrame>

        <SectionFrame
          id="compare-focus"
          mode="content"
          snap
          aria-labelledby="compare-h"
        >
          <Container>
            <h2 id="compare-h" className="type-display-section">
              Compare focus contract
            </h2>
            <p className="type-body-small mt-2 max-w-2xl text-gletcher-navy/75">
              Hidden face uses hidden + inert + aria-hidden + tabIndex=-1 so
              controls leave the tab order (DS-B).
            </p>
            <div className="mt-5 max-w-md">
              <CompareFaceDemo />
            </div>
          </Container>
        </SectionFrame>

        <SectionFrame id="reading" mode="content" aria-labelledby="reading-h">
          <ReadingContainer>
            <h2 id="reading-h" className="type-heading-prose">
              Reading container
            </h2>
            <p className="type-body mt-3">{LONG_RU}</p>
            <p className="type-body mt-3">{LONG_EN}</p>
            <p className="type-body-small mt-6 text-gletcher-navy/60">
              Measure ~68ch. Articles/legal stay in content mode — not fullscreen
              slides.
            </p>
          </ReadingContainer>
        </SectionFrame>
      </div>
    </SiteShell>
  );
}
