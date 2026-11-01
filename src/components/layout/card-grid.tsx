import type { ReactNode } from "react";

type CardGridProps = {
  /** Desired maximum columns — degrades by min card width. */
  columns?: 3 | 4 | 6;
  children: ReactNode;
  className?: string;
  minCardWidth?: string;
};

/**
 * Responsive card collection. `columns` is a max preference, not forced.
 */
export function CardGrid({
  columns = 3,
  children,
  className = "",
  minCardWidth = "15rem",
}: CardGridProps) {
  const maxCols =
    columns === 6 ? 6 : columns === 4 ? 4 : 3;

  return (
    <ul
      className={`m-0 grid list-none grid-cols-1 gap-[var(--grid-gap)] p-0 sm:grid-cols-2 ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minCardWidth}), 1fr))`,
        // Cap at requested columns when space allows via max-width trick on wide screens
        ["--ds-card-cols" as string]: String(maxCols),
      }}
    >
      {children}
    </ul>
  );
}

type CardGridItemProps = {
  children: ReactNode;
  className?: string;
};

export function CardGridItem({ children, className = "" }: CardGridItemProps) {
  return (
    <li className={`flex min-w-0 flex-col ${className}`}>{children}</li>
  );
}
