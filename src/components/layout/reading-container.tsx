import type { ElementType, ReactNode } from "react";

type ReadingContainerProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

/** Long-form / legal measure — separate from wide media compositions. */
export function ReadingContainer({
  as: Tag = "div",
  children,
  className = "",
}: ReadingContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full min-w-0 max-w-[var(--reading-measure)] px-[var(--page-gutter)] ${className}`}
    >
      {children}
    </Tag>
  );
}
