"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link } from "@/i18n/navigation";
import { IconButton } from "@/components/ui/icon-button";

export type BottleCarouselItem = {
  slug: string;
  name: string;
  title: string;
  image: string;
};

type BottleCarousel3DProps = {
  items: readonly BottleCarouselItem[];
  /** Accessible name for the gallery. */
  label: string;
  className?: string;
  /** Bottles advancing per second while idle. */
  autoplaySpeed?: number;
};

/**
 * Cover-flow conveyor inspired by https://codepen.io/tommyho/pen/emOyRNw
 * (GSAP seamless loop → local scrub, no page pin / no new deps).
 * Floating transparent bottle PNGs — no frames or card chrome.
 * Center bottle is `h-full` of the stage (object-contain, no aspect stretch).
 */
export function BottleCarousel3D({
  items,
  label,
  className = "",
  autoplaySpeed = 0.35,
}: BottleCarousel3DProps) {
  const n = items.length;
  const labelId = useId();
  const reduceRef = useRef(false);
  const pausedRef = useRef(false);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startProgress: number;
  } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceRef.current = mq.matches;
    const onChange = () => {
      reduceRef.current = mq.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (n < 2) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (
        !reduceRef.current &&
        !pausedRef.current &&
        !dragRef.current?.active
      ) {
        progressRef.current += dt * autoplaySpeed;
        setProgress(progressRef.current);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n, autoplaySpeed]);

  const step = useCallback(
    (dir: -1 | 1) => {
      if (n < 2) return;
      progressRef.current += dir;
      setProgress(progressRef.current);
    },
    [n],
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el || n < 2) return;
    const onWheelNative = (e: WheelEvent) => {
      if (reduceRef.current) return;
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 1) return;
      e.preventDefault();
      progressRef.current += delta * 0.004;
      setProgress(progressRef.current);
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, [n]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (n < 2) return;
      pausedRef.current = true;
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startProgress: progressRef.current,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [n],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag?.active || n < 2) return;
      const dx = e.clientX - drag.startX;
      progressRef.current = drag.startProgress - dx / 110;
      setProgress(progressRef.current);
    },
    [n],
  );

  const endDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.active) {
      dragRef.current.active = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
    pausedRef.current = false;
  }, []);

  if (n === 0) return null;

  return (
    <div
      className={`relative flex h-full min-h-[min(72svh,34rem)] w-full flex-col ${className}`}
      aria-labelledby={labelId}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        if (!dragRef.current?.active) pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          pausedRef.current = false;
        }
      }}
    >
      <p id={labelId} className="sr-only">
        {label}
      </p>

      <div
        ref={stageRef}
        className="relative min-h-0 w-full flex-1 overflow-visible touch-pan-y select-none [perspective:1100px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="group"
        aria-roledescription="carousel"
      >
        <ul className="absolute inset-0 m-0 list-none p-0">
          {items.map((item, i) => {
            let d = i - (((progress % n) + n) % n);
            if (d > n / 2) d -= n;
            if (d < -n / 2) d += n;

            const abs = Math.abs(d);
            const visible = abs < 3.2;
            // Plateau near center at ~full stage height; slight overscale
            // eats transparent PNG padding so the silhouette fills the block.
            const scale =
              abs < 0.4
                ? 1.08
                : Math.max(0.3, 1.08 - (abs - 0.4) * 0.3);
            const opacity = abs < 0.4 ? 1 : Math.max(0, 1 - (abs - 0.4) * 0.45);
            const xPercent = d * 68;
            const rotateY = d * -14;
            const z = Math.round(40 - abs * 12);

            return (
              <li
                key={item.slug}
                className="absolute inset-y-0 left-1/2 m-0 h-full w-auto list-none p-0"
                style={{
                  transform: `translateX(-50%) translateX(${xPercent}%) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity: visible ? opacity : 0,
                  zIndex: z,
                  pointerEvents: abs < 0.55 ? "auto" : "none",
                  visibility: visible ? "visible" : "hidden",
                  transformOrigin: "center center",
                }}
              >
                <Link
                  href={`/beer/${item.slug}`}
                  className="relative block h-full w-auto focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
                  tabIndex={abs < 0.55 ? 0 : -1}
                  aria-hidden={abs >= 0.55}
                  aria-label={item.title}
                  draggable={false}
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={640}
                    height={1280}
                    draggable={false}
                    className="!relative h-full w-auto max-h-full object-contain [filter:drop-shadow(0_22px_32px_rgba(13,15,73,0.2))]"
                    style={{ width: "auto", height: "100%" }}
                    sizes="(max-width: 768px) 70vw, min(36vw, 360px)"
                    priority={i < 3}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[50] flex justify-center gap-2 pb-1">
          <IconButton
            label="Previous"
            variant="outline"
            size="sm"
            className="pointer-events-auto bg-gletcher-ice/80 backdrop-blur-[2px]"
            onClick={() => step(-1)}
          >
            <span aria-hidden>←</span>
          </IconButton>
          <IconButton
            label="Next"
            variant="outline"
            size="sm"
            className="pointer-events-auto bg-gletcher-ice/80 backdrop-blur-[2px]"
            onClick={() => step(1)}
          >
            <span aria-hidden>→</span>
          </IconButton>
        </div>
      </div>
    </div>
  );
}
