import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  controlClassName,
  type ControlSize,
  type ControlVariant,
} from "@/components/ui/control-recipe";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ControlVariant;
  size?: ControlSize;
  /** Required accessible name — never decorative-only. */
  label: string;
  children: ReactNode;
};

export function IconButton({
  variant = "outline",
  size = "md",
  label,
  className = "",
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  const box =
    size === "sm"
      ? "size-11 p-0"
      : size === "lg"
        ? "size-12 p-0"
        : "size-11 p-0";

  return (
    <button
      type={type}
      aria-label={label}
      className={controlClassName(variant, size, `${box} ${className}`)}
      {...props}
    >
      {children}
    </button>
  );
}
