import type { ReactNode } from "react";

type CardShellProps = {
  children: ReactNode;
  className?: string;
  emphasis?: boolean;
  selected?: boolean;
};

export function CardShell({
  children,
  className = "",
  emphasis = false,
  selected = false,
}: CardShellProps) {
  return (
    <article
      className={`flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-card)] border bg-gletcher-ice text-gletcher-navy ${
        emphasis || selected
          ? "border-[length:var(--border-width-emphasis)] border-gletcher-navy"
          : "border-[length:var(--border-width-hairline)] border-gletcher-navy"
      } ${selected ? "ring-2 ring-gletcher-navy/20" : ""} ${className}`}
    >
      {children}
    </article>
  );
}

export function CardMedia({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden border-b border-gletcher-navy/15 bg-gletcher-frost ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeading({
  children,
  className = "",
  as: Tag = "h3",
}: {
  children: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4" | "p";
}) {
  return (
    <Tag className={`type-heading-card px-4 pt-4 ${className}`}>{children}</Tag>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`type-body-small flex-1 px-4 pt-2 text-gletcher-navy/80 ${className}`}>
      {children}
    </div>
  );
}

export function CardActions({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mt-auto flex flex-wrap items-center gap-2 px-4 pt-3 pb-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function Banner({
  children,
  className = "",
  tone = "frost",
}: {
  children: ReactNode;
  className?: string;
  tone?: "frost" | "navy" | "ice";
}) {
  const tones = {
    frost: "bg-gletcher-frost text-gletcher-navy border-gletcher-navy",
    navy: "bg-gletcher-navy text-gletcher-white border-gletcher-navy",
    ice: "bg-gletcher-ice text-gletcher-navy border-gletcher-navy",
  };
  return (
    <aside
      className={`rounded-[var(--radius-card)] border px-5 py-4 sm:px-7 sm:py-5 ${tones[tone]} ${className}`}
    >
      {children}
    </aside>
  );
}
