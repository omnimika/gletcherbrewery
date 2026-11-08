"use client";

import Image from "next/image";
import { useState } from "react";
import type { SHOP_PAGE } from "@/content/shop";

type Slide = (typeof SHOP_PAGE.gallery)[number];

export function ShopGallery({ slides }: { slides: readonly Slide[] }) {
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];
  if (!current) return null;

  const go = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  };

  return (
    <div className="relative h-full min-h-[14rem] w-full overflow-hidden rounded-[5px] border border-gletcher-navy sm:min-h-[22rem]">
      <Image
        src={current.src}
        alt={current.alt}
        fill
        className="object-cover"
        sizes="(max-width: 960px) 100vw, 50vw"
        priority
      />
      {slides.length > 1 ? (
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Следующее фото"
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-sm bg-gletcher-red text-lg leading-none font-extrabold text-gletcher-white transition-opacity hover:opacity-90"
        >
          ›
        </button>
      ) : null}
    </div>
  );
}
