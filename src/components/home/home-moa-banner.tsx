import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container, SectionFrame } from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";

type HomeMoaBannerProps = {
  ariaLabel: string;
};

/**
 * Production ZB `1060490961`: MOA non-alco promo → product page.
 * DS-3: first home mid-block off HomeWindowStage (fluid banner, no transform scale).
 */
export function HomeMoaBanner({ ariaLabel }: HomeMoaBannerProps) {
  return (
    <SectionFrame
      id="moa"
      mode="banner"
      tone="ice"
      snap
      aria-label={ariaLabel}
      className="!py-[15px] sm:!py-[15px]"
    >
      <Container>
        <Reveal>
          <Link
            href="/beer/milk-of-amnesia-non-alco"
            className="group relative block w-full overflow-hidden rounded-[10px] border border-gletcher-red outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gletcher-navy"
          >
            <Image
              src="/home/banner-moa-nonalco.png"
              alt=""
              width={1680}
              height={289}
              className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="100vw"
              priority={false}
            />
            <span className="sr-only">{ariaLabel}</span>
          </Link>
        </Reveal>
      </Container>
    </SectionFrame>
  );
}
