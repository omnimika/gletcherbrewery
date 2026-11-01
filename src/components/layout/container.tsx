import type { ElementType, ReactNode } from "react";

type ContainerProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Wide composition uses full available width minus gutter. */
  wide?: boolean;
};

/**
 * Page/section inline container — gutter once, no double padding with SectionFrame.
 */
export function Container({
  as: Tag = "div",
  children,
  className = "",
  wide = false,
}: ContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full min-w-0 px-[var(--page-gutter)] ${
        wide ? "max-w-none" : "max-w-[var(--content-max)]"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
