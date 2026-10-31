"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CatalogCard } from "@/content/catalog-filter";
import type { ProductBadge } from "@/content/products";

type ProductCardProps = {
  product: CatalogCard;
  /** LCP/first-viewport hint — independent of marketing badges. */
  priority?: boolean;
};

const BADGE_CLASS: Record<ProductBadge, string> = {
  new: "bg-gletcher-new text-gletcher-navy",
  alcofree: "bg-gletcher-sky text-gletcher-navy",
  discontinued: "bg-gletcher-red text-gletcher-white",
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const badges = product.badges ?? [];
  const t = useTranslations("badges");

  return (
    <Link
      href={product.href}
      className="group relative block h-full w-full"
      aria-label={product.title}
    >
      {badges.length > 0 ? (
        <div className="pointer-events-none absolute top-[3%] right-[6%] z-10 flex max-w-[46%] flex-col items-end gap-1">
          {badges.map((badge) => (
            <span
              key={badge}
              className={`rotate-[-12deg] rounded-sm px-2 py-0.5 text-[10px] font-black tracking-wide uppercase shadow-sm ${BADGE_CLASS[badge]}`}
            >
              {t(badge)}
            </span>
          ))}
        </div>
      ) : null}
      {/*
        Height-fill the slot; crop artboard sides (OK up to ~30% width) so the
        bottle reaches the category tabs instead of letterboxing empty PNG pad.
      */}
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={product.image}
          alt=""
          fill
          sizes="(min-width:1400px) 20vw, (min-width:960px) 25vw, (min-width:640px) 33vw, (min-width:480px) 50vw, 100vw"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.04] group-hover:origin-top"
          priority={priority}
        />
      </div>
      <span className="sr-only">{product.title}</span>
    </Link>
  );
}
