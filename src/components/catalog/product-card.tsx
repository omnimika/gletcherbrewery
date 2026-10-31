import Image from "next/image";
import type { CatalogProduct } from "@/content/products";

/** Production catalog until Next product routes exist (Codex P2). */
const PRODUCTION_ORIGIN = "https://www.gletcherbrewery.com";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const href = `${PRODUCTION_ORIGIN}/beer/${product.slug}`;
  const badges = product.badges ?? [];

  return (
    <a
      href={href}
      className="group relative block h-full w-full"
      aria-label={product.title}
      rel="noopener noreferrer"
    >
      {badges.includes("new") ? (
        <span className="pointer-events-none absolute top-[4%] right-[10%] z-10 rotate-[-12deg] rounded-sm bg-gletcher-new px-2 py-0.5 text-[10px] font-black tracking-wide text-gletcher-navy uppercase shadow-sm">
          New!
        </span>
      ) : null}
      <div className="relative h-full w-full">
        <Image
          src={product.image}
          alt=""
          fill
          sizes="(min-width:1400px) 20vw, (min-width:960px) 25vw, (min-width:640px) 33vw, (min-width:480px) 50vw, 100vw"
          className="object-contain object-top transition-transform duration-300 group-hover:-translate-y-1"
          priority={product.badges?.includes("new")}
        />
      </div>
      <span className="sr-only">{product.title}</span>
    </a>
  );
}
