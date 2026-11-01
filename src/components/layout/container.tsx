import type { ElementType, ReactNode } from "react";

type ContainerProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Wide composition uses full available width minus gutter. */
  wide?: boolean;
  /** Stretch inside SectionFrame mode=screen (flex-1 height chain). */
  fill?: boolean;
};

/**
 * Page/section inline container — gutter once, no double padding with SectionFrame.
 */
export function Container({
  as: Tag = "div",
  children,
  className = "",
  wide = false,
  fill = false,
}: ContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full min-w-0 px-[var(--page-gutter)] ${
        wide ? "max-w-none" : "max-w-[var(--content-max)]"
      } ${fill ? "flex min-h-0 flex-1 flex-col" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
