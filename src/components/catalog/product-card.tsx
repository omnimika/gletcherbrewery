import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { CatalogCard } from "@/content/catalog";

type ProductCardProps = {
  product: CatalogCard;
};

export function ProductCard({ product }: ProductCardProps) {
  const badges = product.badges ?? [];

  return (
    <Link
      href={product.href}
      className="group relative block h-full w-full"
      aria-label={product.title}
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
    </Link>
  );
}
