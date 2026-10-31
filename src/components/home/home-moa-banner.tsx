import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HomeWindowStage } from "@/components/home/home-window-stage";

type HomeMoaBannerProps = {
  ariaLabel: string;
};

/**
 * Production ZB `1060490961`: MOA non-alco promo → product page.
 * Artboard scales with window (`ab_upscale: window`).
 */
export function HomeMoaBanner({ ariaLabel }: HomeMoaBannerProps) {
  return (
    <section aria-label={ariaLabel} className="bg-gletcher-ice">
      <HomeWindowStage>
        <div className="px-5 py-[15px] @[480px]:px-[10px] @[960px]:px-5 @[960px]:py-[15px]">
          <Link
            href="/beer/milk-of-amnesia-non-alco"
            className="group relative block w-full overflow-hidden rounded-[10px] border border-gletcher-red outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gletcher-navy"
          >
            <Image
              src="/home/banner-moa-nonalco.png"
              alt=""
              width={1680}
              height={289}
              className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.015]"
              sizes="100vw"
              priority={false}
            />
            <span className="sr-only">{ariaLabel}</span>
          </Link>
        </div>
      </HomeWindowStage>
    </section>
  );
}
