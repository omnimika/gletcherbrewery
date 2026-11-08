"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useWindowArtboardScale } from "@/lib/use-window-artboard-scale";

type HomeWindowStageProps = {
  children: ReactNode;
  className?: string;
  /** Extra outer styles (e.g. section padding that should also scale). */
  style?: CSSProperties;
};

/**
 * Tilda `ab_upscale: window` stage for home mid-blocks.
 * Children lay out at the matched artboard screen width; the stage
 * scales to the real window so composition grows/shrinks with viewport.
 */
export function HomeWindowStage({
  children,
  className,
  style,
}: HomeWindowStageProps) {
  const { screen, scale } = useWindowArtboardScale();
  const innerRef = useRef<HTMLDivElement>(null);
  const [outerHeight, setOuterHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => {
      setOuterHeight(el.offsetHeight * scale);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scale, screen]);

  return (
    <div
      className={className}
      style={{
        ...style,
        height: outerHeight,
        overflow: "hidden",
      }}
    >
      <div
        ref={innerRef}
        className="@container relative"
        style={{
          width: screen,
          marginLeft: "50%",
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
