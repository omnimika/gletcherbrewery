import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-gletcher-red text-gletcher-white border border-gletcher-red hover:bg-gletcher-deep hover:border-gletcher-deep hover:text-gletcher-sky",
  secondary:
    "bg-gletcher-navy text-gletcher-white border border-gletcher-navy hover:bg-gletcher-deep",
  ghost:
    "bg-transparent text-gletcher-navy border border-transparent hover:border-gletcher-navy/20",
  outline:
    "bg-transparent text-gletcher-navy border border-gletcher-navy hover:bg-gletcher-navy hover:text-gletcher-white",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-wide uppercase transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
