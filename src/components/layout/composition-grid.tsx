import type { ReactNode } from "react";

export type CompositionPreset =
  | "full"
  | "halves-x"
  | "halves-y"
  | "quarters-x"
  | "quarters-y"
  | "quad";

type CompositionGridProps = {
  preset?: CompositionPreset;
  children: ReactNode;
  className?: string;
  /** Override default grid gap token. */
  gapClassName?: string;
};

/**
 * 12-col compositional presets. Ratios apply after gap; stacks in DOM order
 * below ~40rem container width.
 */
const presets: Record<CompositionPreset, string> = {
  full: "grid-cols-1",
  "halves-x": "grid-cols-1 @[40rem]:grid-cols-2",
  "halves-y": "grid-cols-1 grid-rows-[auto_auto]",
  "quarters-x":
    "grid-cols-1 @[40rem]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]",
  "quarters-y":
    "grid-cols-1 grid-rows-[auto_auto_auto] @[64rem]:grid-rows-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]",
  quad: "grid-cols-1 @[40rem]:grid-cols-2 @[40rem]:auto-rows-fr",
};

export function CompositionGrid({
  preset = "full",
  children,
  className = "",
  gapClassName = "gap-[var(--grid-gap)]",
}: CompositionGridProps) {
  // Outer establishes containment; inner grid queries the parent width.
  // Same-element @container + @[…] self-query does not apply in Chromium.
  return (
    <div className="@container min-w-0">
      <div
        className={`grid min-w-0 ${presets[preset]} ${gapClassName} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

type CompositionPanelProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function CompositionPanel({
  children,
  className = "",
  id,
}: CompositionPanelProps) {
  return (
    <div
      id={id}
      tabIndex={id ? -1 : undefined}
      className={`min-w-0 min-h-0 ${className}`}
    >
      {children}
    </div>
  );
}
