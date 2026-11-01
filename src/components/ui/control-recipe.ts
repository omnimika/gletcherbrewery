export type ControlVariant =
  | "primary"
  | "brand"
  | "secondary"
  | "ghost"
  | "outline";

export type ControlSize = "sm" | "md" | "lg";

/** Shared visual recipe for Button / LinkButton / IconButton. */
export const controlVariants: Record<ControlVariant, string> = {
  primary:
    "bg-gletcher-action text-gletcher-white border border-gletcher-action hover:bg-gletcher-deep hover:border-gletcher-deep hover:text-gletcher-sky active:brightness-95",
  brand:
    "bg-gletcher-red text-gletcher-white border border-gletcher-red hover:bg-gletcher-deep hover:border-gletcher-deep hover:text-gletcher-sky active:brightness-95",
  secondary:
    "bg-gletcher-navy text-gletcher-white border border-gletcher-navy hover:bg-gletcher-deep active:brightness-95",
  ghost:
    "bg-transparent text-gletcher-navy border border-transparent hover:border-gletcher-navy/25 active:bg-gletcher-frost/60",
  outline:
    "bg-transparent text-gletcher-navy border border-gletcher-navy hover:bg-gletcher-navy hover:text-gletcher-white active:bg-gletcher-deep",
};

export const controlSizes: Record<ControlSize, string> = {
  sm: "min-h-[var(--control-h-sm)] px-3.5 text-xs",
  md: "min-h-[var(--control-h-md)] px-5 text-sm",
  lg: "min-h-[var(--control-h-lg)] px-6 text-base",
};

export const controlBase =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold tracking-wide uppercase transition-[color,background-color,border-color,filter] duration-[var(--motion-feedback)] ease-out focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-busy:cursor-wait";

export function controlClassName(
  variant: ControlVariant = "primary",
  size: ControlSize = "md",
  className = "",
) {
  return `${controlBase} ${controlVariants[variant]} ${controlSizes[size]} ${className}`.trim();
}
