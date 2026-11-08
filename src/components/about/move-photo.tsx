"use client";

/**
 * Port of Tilda Zero Block custom class `.movePhoto` (about ZB 1150024191).
 * Source: docs/discovery/_raw/page__about.html — drag via left/top px,
 * raise z-index, scale 0.9 while dragging; touch + scroll lock &lt; 1200px.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import styles from "./move-photo.module.css";

let zIndexCounter = 40;

type MovePhotoProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

type DragState = {
  pointerId: number;
  originX: number;
  originY: number;
};

export function MovePhoto({ children, className = "", style }: MovePhotoProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [dragging, setDragging] = useState(false);

  const endDrag = useCallback((e?: PointerEvent | ReactPointerEvent) => {
    const node = ref.current;
    const drag = dragRef.current;
    if (!node || !drag) return;
    if (e && "pointerId" in e) {
      try {
        node.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
    dragRef.current = null;
    setDragging(false);
    if (window.innerWidth < 1200) {
      document.body.style.overflow = "";
    }
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const node = ref.current;
      const drag = dragRef.current;
      if (!node || !drag || e.pointerId !== drag.pointerId) return;
      e.preventDefault();
      setPos({
        left: e.clientX - drag.originX,
        top: e.clientY - drag.originY,
      });
    };
    const onUp = (e: PointerEvent) => endDrag(e);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [endDrag]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const node = ref.current;
    if (!node) return;
    e.preventDefault();
    e.stopPropagation();

    const left = node.offsetLeft;
    const top = node.offsetTop;
    setPos({ left, top });
    zIndexCounter += 1;
    setZIndex(zIndexCounter);
    dragRef.current = {
      pointerId: e.pointerId,
      originX: e.clientX - left,
      originY: e.clientY - top,
    };
    setDragging(true);
    node.setPointerCapture(e.pointerId);
    if (window.innerWidth < 1200) {
      document.body.style.overflow = "hidden";
    }
  };

  const mergedStyle: CSSProperties = {
    ...style,
    ...(pos
      ? { left: `${pos.left}px`, top: `${pos.top}px` }
      : null),
    ...(zIndex !== undefined ? { zIndex } : null),
  };

  return (
    <div
      ref={ref}
      className={`${styles.movePhoto} ${dragging ? styles.dragging : ""} ${className}`.trim()}
      style={mergedStyle}
      onPointerDown={onPointerDown}
      role="presentation"
    >
      {children}
    </div>
  );
}
