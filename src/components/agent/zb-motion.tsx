"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import "./zb-motion.css";

/** Tilda Zero Block appear styles (animstyle). */
export type ZbAppearStyle =
  | "zoomin"
  | "fadein"
  | "fadeinup"
  | "fadeindown"
  | "fadeinleft"
  | "fadeinright";

/** One SBS step — mirrors sbsopts fields. */
export type ZbSbsStep = {
  mx?: number;
  my?: number;
  sx?: number;
  sy?: number;
  op?: number;
  ro?: number;
  /** Duration into this step, ms */
  ti?: number;
  /** Delay before this step, ms */
  dt?: number;
  /** Tilda easing name */
  ea?: string;
};

type TriggerLine = 0 | 0.5 | 1;

type ViewOpts = {
  /** intoview = element; blockintoview = nearest section */
  trigger?: "self" | "block";
  /** 0 top / 0.5 center / 1 bottom — sbstrg */
  triggerLine?: TriggerLine;
  /** animtriggeroffset / sbstrgofst (px, + = start earlier) */
  triggerOffset?: number;
  /** animmobile: y → play below 1200px */
  mobile?: boolean;
  once?: boolean;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function desktopOnlyBlocked(mobile: boolean) {
  return !mobile && window.matchMedia("(max-width: 1199px)").matches;
}

function rootMarginFor(line: TriggerLine, offsetPx: number) {
  const early = Math.max(0, offsetPx);
  if (line <= 0) return `${early}px 0px -95% 0px`;
  if (line <= 0.5) return `${early}px 0px -45% 0px`;
  return `${early}px 0px 0px 0px`;
}

function mapEasing(ea: string | undefined): string {
  switch (ea) {
    case "easeIn":
      return "ease-in";
    case "easeOut":
      return "ease-out";
    case "easeInOut":
      return "ease-in-out";
    case "bounceFin":
      return "cubic-bezier(0.34, 1.56, 0.64, 1)";
    case "0":
    case "":
    case undefined:
      return "linear";
    default:
      return ea.startsWith("cubic-bezier") ? ea : "ease-out";
  }
}

function stepTransform(step: ZbSbsStep, baseRotate = 0): string {
  const mx = step.mx ?? 0;
  const my = step.my ?? 0;
  const sx = step.sx ?? 1;
  const sy = step.sy ?? 1;
  const ro = (step.ro ?? 0) + baseRotate;
  return `translate(${mx}px, ${my}px) scale(${sx}, ${sy}) rotate(${ro}deg)`;
}

function applyStep(el: HTMLElement, step: ZbSbsStep, baseRotate = 0) {
  el.style.opacity = String(step.op ?? 1);
  el.style.transform = stepTransform(step, baseRotate);
}

function useZbView(
  nodeRef: React.RefObject<HTMLElement | null>,
  opts: ViewOpts,
  onPlayRef: React.MutableRefObject<() => void>,
) {
  const {
    trigger = "self",
    triggerLine = 1,
    triggerOffset = 0,
    mobile = true,
    once = true,
  } = opts;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    if (prefersReducedMotion() || desktopOnlyBlocked(mobile)) {
      onPlayRef.current();
      return;
    }

    const target =
      trigger === "block"
        ? (node.closest("section") as HTMLElement | null) ?? node
        : node;

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      onPlayRef.current();
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            play();
            if (once) io.disconnect();
          } else if (!played) {
            node.dataset.zbArmed = "true";
          }
        }
      },
      {
        root: null,
        rootMargin: rootMarginFor(triggerLine, triggerOffset),
        threshold: 0.01,
      },
    );

    io.observe(target);

    requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight;
      const lineY =
        triggerLine <= 0 ? 0 : triggerLine <= 0.5 ? vh * 0.5 : vh;
      if (rect.top < lineY + triggerOffset && rect.bottom > 0) {
        play();
        if (once) io.disconnect();
      } else {
        node.dataset.zbArmed = "true";
      }
    });

    return () => io.disconnect();
  }, [nodeRef, trigger, triggerLine, triggerOffset, mobile, once, onPlayRef]);
}

/* ——— Appear (animstyle) ——— */

type ZbAppearProps = ViewOpts & {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  /** animstyle */
  anim: ZbAppearStyle;
  /** seconds */
  duration?: number;
  /** seconds */
  delay?: number;
  /** px — fadein* only */
  distance?: number;
  /** starting scale — zoomin only */
  scale?: number;
};

export function ZbAppear({
  as: Tag = "div",
  children,
  className = "",
  style,
  id,
  anim,
  duration = 1,
  delay = 0,
  distance = 100,
  scale = 0.9,
  trigger = "self",
  triggerLine = 1,
  triggerOffset = 0,
  mobile = true,
  once = true,
}: ZbAppearProps) {
  const ref = useRef<HTMLElement | null>(null);
  const onPlayRef = useRef(() => {
    const node = ref.current;
    if (!node) return;
    node.dataset.zbPlay = "true";
  });

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion() || desktopOnlyBlocked(mobile)) {
      node.dataset.zbPlay = "true";
      return;
    }
    // Hide before paint so in-view appear doesn't flash final state.
    node.dataset.zbArmed = "true";
  }, [mobile]);

  useZbView(
    ref,
    { trigger, triggerLine, triggerOffset, mobile, once },
    onPlayRef,
  );

  const cssVars = {
    "--zb-duration": `${duration}s`,
    "--zb-delay": `${delay}s`,
    "--zb-distance": `${distance}px`,
    "--zb-scale": String(scale),
  } as CSSProperties;

  return (
    <Tag
      ref={ref}
      id={id}
      className={`zb-appear zb-appear--${anim} ${className}`}
      style={{ ...cssVars, ...style }}
      data-zb-anim={anim}
    >
      {children}
    </Tag>
  );
}

/* ——— Step-by-step (sbsevent) ——— */

type ZbSbsProps = ViewOpts & {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  "aria-hidden"?: boolean | "true" | "false";
  steps: ZbSbsStep[];
  /** Element `rotate` from ZB (degrees) */
  baseRotate?: number;
};

export function ZbSbs({
  as: Tag = "div",
  children,
  className = "",
  style,
  id,
  "aria-hidden": ariaHidden,
  steps,
  baseRotate = 0,
  trigger = "block",
  triggerLine = 0.5,
  triggerOffset = 0,
  mobile = true,
  once = true,
}: ZbSbsProps) {
  const ref = useRef<HTMLElement | null>(null);
  const stepsRef = useRef(steps);
  const baseRef = useRef(baseRotate);
  stepsRef.current = steps;
  baseRef.current = baseRotate;

  useEffect(() => {
    const node = ref.current;
    if (!node || steps.length < 2) return;
    if (prefersReducedMotion()) {
      applyStep(node, steps[steps.length - 1]!, baseRotate);
      return;
    }
    applyStep(node, steps[1]!, baseRotate);
  }, [steps, baseRotate]);

  const onPlayRef = useRef(() => {
    const node = ref.current;
    if (!node) return;
    const seq = stepsRef.current;
    const base = baseRef.current;
    if (seq.length < 2) {
      node.dataset.zbPlay = "true";
      return;
    }

    if (prefersReducedMotion()) {
      applyStep(node, seq[seq.length - 1]!, base);
      node.dataset.zbPlay = "true";
      return;
    }

    // Identity at [0]; from-state at [1] (usually ti:0); rest animate with dt/ti.
    const from = seq[1]!;
    const rest = seq.slice(2);
    applyStep(node, from, base);

    type Point = { time: number; step: ZbSbsStep; easeToNext: string };
    const points: Point[] = [
      { time: 0, step: from, easeToNext: "linear" },
    ];
    let time = 0;
    for (const s of rest) {
      const dt = s.dt ?? 0;
      const ti = s.ti ?? 0;
      if (dt > 0) {
        time += dt;
        points.push({
          time,
          step: points[points.length - 1]!.step,
          easeToNext: mapEasing(s.ea),
        });
      } else {
        points[points.length - 1]!.easeToNext = mapEasing(s.ea);
      }
      time += Math.max(ti, 1);
      points.push({ time, step: s, easeToNext: "linear" });
    }

    const total = Math.max(time, 1);
    const framed: Keyframe[] = points.map((p, i) => ({
      opacity: p.step.op ?? 1,
      transform: stepTransform(p.step, base),
      offset: p.time / total,
      easing: i < points.length - 1 ? p.easeToNext : undefined,
    }));

    const anim = node.animate(framed, {
      duration: total,
      fill: "forwards",
      easing: "linear",
    });
    anim.finished
      .then(() => {
        applyStep(node, seq[seq.length - 1]!, base);
        node.dataset.zbPlay = "true";
      })
      .catch(() => {
        applyStep(node, seq[seq.length - 1]!, base);
        node.dataset.zbPlay = "true";
      });
  });

  useZbView(
    ref,
    { trigger, triggerLine, triggerOffset, mobile, once },
    onPlayRef,
  );

  return (
    <Tag
      ref={ref}
      id={id}
      aria-hidden={ariaHidden}
      className={`zb-sbs ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}

/* ——— Scroll parallax (animprx: scroll) ——— */

type ZbScrollParallaxProps = {
  children: ReactNode;
  className?: string;
  /** animprxs — 100 = none */
  speed?: number;
};

export function ZbScrollParallax({
  children,
  className = "",
  speed = 120,
}: ZbScrollParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;
    const factor = (speed - 100) / 100;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
      node.style.transform = `translate3d(0, ${mid * factor * -0.15}px, 0)`;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

/* ——— Mouse parallax (animprx: mouse) ——— */

type ZbMouseParallaxProps = {
  children: ReactNode;
  className?: string;
  dx?: number;
  dy?: number;
};

export function ZbMouseParallax({
  children,
  className = "",
  dx = 40,
  dy = 40,
}: ZbMouseParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      node.style.transform = `translate3d(${-nx * dx}px, ${-ny * dy}px, 0)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [dx, dy]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
