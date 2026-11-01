import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  controlClassName,
  type ControlSize,
  type ControlVariant,
} from "@/components/ui/control-recipe";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ControlVariant;
  size?: ControlSize;
  loading?: boolean;
  children: ReactNode;
};

/**
 * Native `<button>` action. Prefer LinkButton for navigation.
 * `primary` uses accessible action-red; `brand` keeps original brand red.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={controlClassName(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="sr-only">Loading</span> : null}
      {children}
    </button>
  );
}
