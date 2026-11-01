"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Play once when entering viewport (default). */
  once?: boolean;
};

/**
 * Entrance helper — content is visible by default (SSR/no-JS/error).
 * JS only arms the hidden state after the first observation proves the node
 * is off-screen, then reveals on enter. Already-in-view content never blanks.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      node.dataset.visible = "true";
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.dataset.visible = "true";
            if (once) io.disconnect();
          } else if (!node.dataset.visible) {
            // Arm fade-in only when we know the node starts off-screen.
            node.dataset.ready = "true";
          } else if (!once) {
            delete node.dataset.visible;
            node.dataset.ready = "true";
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag ref={ref} className={`ds-reveal ${className}`}>
      {children}
    </Tag>
  );
}
