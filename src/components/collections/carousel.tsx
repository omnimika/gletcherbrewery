"use client";

import {
  useCallback,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { IconButton } from "@/components/ui/icon-button";

type CarouselProps = {
  children: ReactNode;
  label: string;
  className?: string;
};

/**
 * Native horizontal scroll carousel — autoplay off by default.
 * One accessible copy; keyboard via scroll container + prev/next.
 */
export function Carousel({ children, label, className = "" }: CarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const scrollByPage = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.85, 200);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }, []);

  return (
    <div className={`relative min-w-0 ${className}`} aria-labelledby={labelId}>
      <p id={labelId} className="type-label mb-3 text-gletcher-navy">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <IconButton
          label="Previous"
          variant="outline"
          size="sm"
          onClick={() => scrollByPage(-1)}
        >
          <span aria-hidden>←</span>
        </IconButton>
        <div
          ref={scrollerRef}
          tabIndex={0}
          className="flex min-w-0 flex-1 snap-x snap-mandatory gap-[var(--grid-gap)] overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gletcher-navy [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        <IconButton
          label="Next"
          variant="outline"
          size="sm"
          onClick={() => scrollByPage(1)}
        >
          <span aria-hidden>→</span>
        </IconButton>
      </div>
    </div>
  );
}

export function CarouselSlide({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-[min(100%,18rem)] shrink-0 snap-start ${className}`}
      role="group"
    >
      {children}
    </div>
  );
}
