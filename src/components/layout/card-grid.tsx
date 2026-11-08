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
 * Lower bound of each track is max(minCardWidth, 100%/columns) so auto-fit
 * never exceeds the requested column count on wide containers.
 */
export function CardGrid({
  columns = 3,
  children,
  className = "",
  minCardWidth = "15rem",
}: CardGridProps) {
  const maxCols = columns === 6 ? 6 : columns === 4 ? 4 : 3;

  return (
    <ul
      className={`m-0 grid list-none gap-[var(--grid-gap)] p-0 ${className}`}
      style={{
        ["--ds-card-cols" as string]: String(maxCols),
        ["--ds-card-min" as string]: minCardWidth,
        gridTemplateColumns: `repeat(
          auto-fit,
          minmax(
            min(
              100%,
              max(
                var(--ds-card-min),
                calc(
                  (100% - (var(--ds-card-cols) - 1) * var(--grid-gap, 1.5rem)) /
                    var(--ds-card-cols)
                )
              )
            ),
            1fr
          )
        )`,
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
