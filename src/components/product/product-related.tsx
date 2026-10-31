import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { CatalogCard } from "@/content/catalog-filter";

type ProductRelatedProps = {
  title: string;
  items: CatalogCard[];
};

export function ProductRelated({ title, items }: ProductRelatedProps) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-gletcher-navy/10 bg-gletcher-ice px-4 py-14 sm:px-8">
      <h2 className="font-display text-center text-3xl tracking-wide text-gletcher-navy uppercase sm:text-4xl">
        {title}
      </h2>
      <ul className="mx-auto mt-10 flex max-w-[1440px] gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li
            key={item.id}
            className="w-[140px] shrink-0 sm:w-[160px]"
          >
            <Link
              href={item.href}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative h-48 w-full sm:h-56">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-contain object-bottom transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="160px"
                  />
                ) : null}
              </div>
              <span className="mt-3 text-xs font-semibold tracking-wide text-gletcher-navy uppercase">
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
