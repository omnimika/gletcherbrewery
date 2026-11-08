import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  CompositionGrid,
  CompositionPanel,
  Container,
  SectionFrame,
} from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";

type HomeMoaBannerProps = {
  ariaLabel: string;
};

/**
 * Production ZB `1060490961`: MOA non-alco promo → product page.
 * Stretch screen slide — full preset, media fills available height.
 */
export function HomeMoaBanner({ ariaLabel }: HomeMoaBannerProps) {
  return (
    <SectionFrame
      id="moa"
      mode="screen"
      tone="ice"
      snap
      aria-label={ariaLabel}
    >
      <Container fill>
        <CompositionGrid preset="full" fill>
          <CompositionPanel className="justify-center">
            <Reveal className="w-full">
              <Link
                href="/beer/milk-of-amnesia-non-alco"
                className="group relative mx-auto flex max-h-full w-full max-w-[min(100%,90rem)] items-center justify-center overflow-hidden rounded-[10px] border border-gletcher-red outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gletcher-navy"
              >
                <Image
                  src="/pages/home/banner-moa-nonalco.png"
                  alt=""
                  width={1680}
                  height={289}
                  className="h-auto max-h-[min(70svh,calc(var(--section-available-min)-2*var(--section-inset-y)))] w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  sizes="100vw"
                  priority={false}
                />
                <span className="sr-only">{ariaLabel}</span>
              </Link>
            </Reveal>
          </CompositionPanel>
        </CompositionGrid>
      </Container>
    </SectionFrame>
  );
}
