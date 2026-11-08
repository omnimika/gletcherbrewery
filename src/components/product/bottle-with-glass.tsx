"use client";

import Image from "next/image";

type BottleWithGlassProps = {
  title: string;
  bottleSrc: string;
  glassSrc?: string;
  className?: string;
};

/**
 * Bottle ↔ glass on hover/focus. Parent sets the frame; both images fill it
 * with object-contain so they stay centered on each other.
 */
export function BottleWithGlass({
  title,
  bottleSrc,
  glassSrc,
  className = "",
}: BottleWithGlassProps) {
  return (
    <div
      className={`group relative h-full w-full outline-none ${className}`.trim()}
      {...(glassSrc ? { tabIndex: 0 as const } : {})}
    >
      <Image
        src={bottleSrc}
        alt={title}
        fill
        className={`object-contain object-center transition-opacity duration-[400ms] ease-[cubic-bezier(0.45,0,0.55,1)] motion-reduce:transition-none ${
          glassSrc
            ? "opacity-100 group-hover:opacity-0 group-focus-within:opacity-0"
            : "opacity-100"
        }`}
        sizes="(min-width:1024px) 38vw, (min-width:768px) 42vw, 70vw"
      />
      {glassSrc ? (
        <Image
          src={glassSrc}
          alt=""
          fill
          aria-hidden
          className="object-contain object-center opacity-0 transition-opacity duration-[400ms] ease-[cubic-bezier(0.45,0,0.55,1)] group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
          sizes="(min-width:1024px) 38vw, (min-width:768px) 42vw, 70vw"
        />
      ) : null}
    </div>
  );
}
