import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import {
  controlClassName,
  type ControlSize,
  type ControlVariant,
} from "@/components/ui/control-recipe";

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ControlVariant;
  size?: ControlSize;
  className?: string;
  children: ReactNode;
};

/** Real Next/intl Link styled as a control — never a button pretending to navigate. */
export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={controlClassName(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
