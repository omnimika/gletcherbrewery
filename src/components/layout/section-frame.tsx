import type { ReactNode } from "react";

export type SectionMode = "screen" | "content" | "banner";
export type SectionTone = "ice" | "frost" | "navy" | "deep" | "transparent";

type SectionFrameProps = {
  id?: string;
  mode?: SectionMode;
  tone?: SectionTone;
  /** Opt-in soft snap target — never global default. */
  snap?: boolean;
  className?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

const tones: Record<SectionTone, string> = {
  ice: "bg-gletcher-ice text-gletcher-navy",
  frost: "bg-gletcher-frost text-gletcher-navy",
  navy: "bg-gletcher-navy text-gletcher-white",
  deep: "bg-gletcher-deep text-gletcher-white",
  transparent: "bg-transparent",
};

const modes: Record<SectionMode, string> = {
  // Stretch slide: min available viewport; flex column so children can fill.
  // Grows past min when content overflows (no max-height clip).
  screen:
    "flex min-h-[var(--section-available-min)] flex-col py-[var(--section-inset-y)]",
  content: "py-[var(--spacing-ds-6)] sm:py-[var(--spacing-ds-7)]",
  banner: "py-[var(--spacing-ds-5)] sm:py-[var(--spacing-ds-6)]",
};

/**
 * Semantic page section — stable id, height mode, tone. Grows with content.
 * Screen mode is a stretch slide: put a flex-1 / h-full child (Container +
 * CompositionGrid fill) to proportionally divide the available height.
 */
export function SectionFrame({
  id,
  mode = "content",
  tone = "transparent",
  snap = false,
  className = "",
  children,
  ...a11y
}: SectionFrameProps) {
  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      className={`relative min-w-0 ${modes[mode]} ${tones[tone]} ${
        snap ? "ds-snap-start" : ""
      } ${className}`}
      {...a11y}
    >
      {children}
    </section>
  );
}
