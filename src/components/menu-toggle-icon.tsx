"use client";

import type { CSSProperties } from "react";

type MenuToggleIconProps = {
  open: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Three-line burger ↔ X. Size via CSS vars `--burger-w` / `--burger-h`
 * (defaults 14×11, matching header artboard).
 */
export function MenuToggleIcon({
  open,
  className = "",
  style,
}: MenuToggleIconProps) {
  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        width: "var(--burger-w, 14px)",
        height: "var(--burger-h, 11px)",
        ...style,
      }}
      aria-hidden
    >
      <span
        className={`absolute left-0 block h-[1.5px] w-full origin-center rounded-full bg-current transition-[transform,opacity,top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute top-1/2 left-0 block h-[1.5px] w-full -translate-y-1/2 rounded-full bg-current transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${
          open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 block h-[1.5px] w-full origin-center rounded-full bg-current transition-[transform,opacity,top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0 top-auto"
        }`}
      />
    </span>
  );
}
