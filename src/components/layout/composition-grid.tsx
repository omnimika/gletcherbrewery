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
  /**
   * Fill parent block size with fr row/track ratios (screen slides).
   * Overflow still grows the section — minmax(0,1fr) + min-content children.
   */
  fill?: boolean;
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

/** Screen-fill row tracks — proportional division of available height. */
const fillPresets: Partial<Record<CompositionPreset, string>> = {
  full: "grid-cols-1 grid-rows-[minmax(0,1fr)] h-full",
  "halves-x":
    "grid-cols-1 grid-rows-[minmax(0,1fr)] h-full @[40rem]:grid-cols-2",
  "halves-y":
    "grid-cols-1 h-full grid-rows-[minmax(0,1fr)_minmax(0,1fr)]",
  "quarters-x":
    "grid-cols-1 grid-rows-[minmax(0,1fr)] h-full @[40rem]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]",
  "quarters-y":
    "grid-cols-1 h-full grid-rows-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]",
  quad: "grid-cols-1 h-full @[40rem]:grid-cols-2 @[40rem]:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]",
};

export function CompositionGrid({
  preset = "full",
  children,
  className = "",
  gapClassName = "gap-[var(--grid-gap)]",
  fill = false,
}: CompositionGridProps) {
  // Outer establishes containment; inner grid queries the parent width.
  // Same-element @container + @[…] self-query does not apply in Chromium.
  const tracks = fill ? (fillPresets[preset] ?? presets[preset]) : presets[preset];

  return (
    <div
      className={`@container min-w-0 ${fill ? "flex h-full min-h-0 flex-1 flex-col" : ""}`}
    >
      <div
        className={`grid min-w-0 ${fill ? "min-h-0 flex-1" : ""} ${tracks} ${gapClassName} ${className}`}
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
      className={`flex min-h-0 min-w-0 flex-col ${className}`}
    >
      {children}
    </div>
  );
}
