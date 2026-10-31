"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HOME_BOTTLE_VIDEO } from "@/content/home";

/** Transparent PNG while media loads / if playback fails. */
const FALLBACK_BOTTLE =
  "/catalog/bottles/CATALOGUE__0014_Bowler-IPA---bottle.png";

/** Near-black candidates for matte; only border-connected regions are cut. */
const MATTE_THRESHOLD = 28;
/** Morphological close on FG — seal thin leaks; keep silhouette curved. */
const MATTE_CLOSE_RADIUS = 5;
/** Soft anti-aliased rim (px) so the cut follows glass, not a hard bitmap edge. */
const MATTE_SOFT = 1;

type VideoSource = { src: string; type: string; alpha?: boolean };

type VideoPlan = {
  allowVideo: boolean;
  preload: "metadata" | "auto";
  /** True when the preferred source already has a contour alpha channel. */
  hasAlpha: boolean;
  sources: VideoSource[];
};

type NetInfo = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

function getConnection(): NetInfo | undefined {
  const nav = navigator as Navigator & {
    connection?: NetInfo;
    mozConnection?: NetInfo;
    webkitConnection?: NetInfo;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

function planKey(plan: VideoPlan) {
  return `${plan.allowVideo}|${plan.hasAlpha}|${plan.preload}|${plan.sources.map((s) => s.src).join(",")}`;
}

let cachedPlan: VideoPlan | null = null;
let cachedPlanKey = "";

/**
 * Opaque masters (black matte). Contour cut happens on canvas via flood-fill
 * from borders — dark glass inside the bottle stays opaque.
 * Prefer contour-cut alpha WebM/WebP when the CDN serves true alpha later.
 */
function computePlan(): VideoPlan {
  const net = getConnection() ?? {};
  const slow =
    net.saveData === true ||
    net.effectiveType === "slow-2g" ||
    net.effectiveType === "2g";
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let next: VideoPlan;

  if (slow || reduceMotion) {
    next = {
      allowVideo: false,
      hasAlpha: false,
      preload: "metadata",
      sources: [],
    };
  } else {
    const narrow = window.innerWidth < 768;
    const alphaOk =
      document.createElement("video").canPlayType('video/webm; codecs="vp9"') !==
      "";
    // Prefer contour-cut VP9+alpha; opaque webm/mp4 → runtime contour cut.
    const sources: VideoSource[] = [];
    if (alphaOk) {
      sources.push({
        src: HOME_BOTTLE_VIDEO.webmAlpha,
        type: 'video/webm; codecs="vp9"',
        alpha: true,
      });
    }
    sources.push(
      { src: HOME_BOTTLE_VIDEO.webm, type: "video/webm" },
      {
        src: HOME_BOTTLE_VIDEO.mp4,
        type: 'video/mp4; codecs="avc1.4d401e"',
      },
    );
    next = {
      allowVideo: true,
      hasAlpha: alphaOk,
      preload: narrow ? "metadata" : "auto",
      sources,
    };
  }

  const key = planKey(next);
  if (cachedPlan && cachedPlanKey === key) return cachedPlan;
  cachedPlan = next;
  cachedPlanKey = key;
  return next;
}

function subscribePlan(onChange: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onResize = () => onChange();
  motion.addEventListener("change", onChange);
  window.addEventListener("resize", onResize);
  const conn = getConnection();
  conn?.addEventListener?.("change", onChange);
  return () => {
    motion.removeEventListener("change", onChange);
    window.removeEventListener("resize", onResize);
    conn?.removeEventListener?.("change", onChange);
  };
}

const SERVER_PLAN: VideoPlan = {
  allowVideo: true,
  hasAlpha: false,
  preload: "metadata",
  sources: [
    { src: HOME_BOTTLE_VIDEO.webm, type: "video/webm" },
    {
      src: HOME_BOTTLE_VIDEO.mp4,
      type: 'video/mp4; codecs="avc1.4d401e"',
    },
  ],
};

function getServerPlan() {
  return SERVER_PLAN;
}

/**
 * Morphological dilate on a 0/1 mask (1 = set). Square kernel, radius r.
 */
function dilateMask(
  src: Uint8Array,
  width: number,
  height: number,
  radius: number,
) {
  const out = new Uint8Array(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let on = 0;
      for (let dy = -radius; dy <= radius && !on; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          if (src[yy * width + xx]) {
            on = 1;
            break;
          }
        }
      }
      out[y * width + x] = on;
    }
  }
  return out;
}

function erodeMask(
  src: Uint8Array,
  width: number,
  height: number,
  radius: number,
) {
  const out = new Uint8Array(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let on = 1;
      for (let dy = -radius; dy <= radius && on; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) {
          on = 0;
          break;
        }
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= width || !src[yy * width + xx]) {
            on = 0;
            break;
          }
        }
      }
      out[y * width + x] = on;
    }
  }
  return out;
}

/**
 * Contour cut matching `scripts/herobottle-contour-alpha.py`:
 * border flood-fill → morphological close → fill only interior holes → soft rim.
 * Does not reshape the silhouette (no span/slab fills).
 */
function knockOutMatteByContour(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
  closeRadius: number,
  soft = MATTE_SOFT,
) {
  const n = width * height;
  const bg = new Uint8Array(n);
  const q = new Int32Array(n);
  let qh = 0;
  let qt = 0;

  const trySeed = (i: number) => {
    const o = i * 4;
    if (
      data[o]! <= threshold &&
      data[o + 1]! <= threshold &&
      data[o + 2]! <= threshold &&
      !bg[i]
    ) {
      bg[i] = 1;
      q[qt++] = i;
    }
  };

  for (let x = 0; x < width; x++) {
    trySeed(x);
    trySeed((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    trySeed(y * width);
    trySeed(y * width + (width - 1));
  }

  while (qh < qt) {
    const i = q[qh++]!;
    const x = i % width;
    const y = (i / width) | 0;
    if (x > 0) trySeed(i - 1);
    if (x + 1 < width) trySeed(i + 1);
    if (y > 0) trySeed(i - width);
    if (y + 1 < height) trySeed(i + width);
  }

  const fg = new Uint8Array(n);
  for (let i = 0; i < n; i++) fg[i] = bg[i] ? 0 : 1;
  const closed =
    closeRadius > 0
      ? erodeMask(
          dilateMask(fg, width, height, closeRadius),
          width,
          height,
          closeRadius,
        )
      : fg;

  // Interior holes only (transparent islands not reachable from the frame border).
  const sealed = closed.slice();
  const exterior = new Uint8Array(n);
  qh = 0;
  qt = 0;
  const seedExterior = (i: number) => {
    if (sealed[i] || exterior[i]) return;
    exterior[i] = 1;
    q[qt++] = i;
  };
  for (let x = 0; x < width; x++) {
    seedExterior(x);
    seedExterior((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    seedExterior(y * width);
    seedExterior(y * width + (width - 1));
  }
  while (qh < qt) {
    const i = q[qh++]!;
    const x = i % width;
    const y = (i / width) | 0;
    if (x > 0) seedExterior(i - 1);
    if (x + 1 < width) seedExterior(i + 1);
    if (y > 0) seedExterior(i - width);
    if (y + 1 < height) seedExterior(i + width);
  }
  for (let i = 0; i < n; i++) {
    if (!sealed[i] && !exterior[i]) sealed[i] = 1;
  }

  // Vertical gaps only — restores punt leaks without left/right slab fills
  // that flatten the bottle base into an angular block.
  for (let x = 0; x < width; x++) {
    let first = -1;
    let last = -1;
    for (let y = 0; y < height; y++) {
      if (!sealed[y * width + x]) continue;
      if (first < 0) first = y;
      last = y;
    }
    if (first < 0 || last <= first) continue;
    for (let y = first; y <= last; y++) sealed[y * width + x] = 1;
  }

  // Soft rim: erode FG by `soft` px → half-alpha ring (matches Python soft_edge).
  let core = sealed;
  if (soft > 0) {
    for (let s = 0; s < soft; s++) {
      core = erodeMask(core, width, height, 1);
    }
  }

  for (let i = 0; i < n; i++) {
    if (!sealed[i]) {
      data[i * 4 + 3] = 0;
    } else if (soft > 0 && !core[i]) {
      data[i * 4 + 3] = 128;
    } else {
      data[i * 4 + 3] = 255;
    }
  }
}

function BottleVideo({
  sources,
  preload,
  hasAlpha,
}: {
  sources: VideoSource[];
  preload: "metadata" | "auto";
  hasAlpha: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** True only after a successful canvas frame (H02). */
  const [frameOk, setFrameOk] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!root || !video || !canvas) return;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: !hasAlpha,
      alpha: true,
    });
    if (!ctx) return;

    let cancelled = false;
    let raf = 0;
    let lastDraw = -1;
    let inView = true;
    let pageVisible = document.visibilityState === "visible";

    const fail = () => {
      if (!cancelled) setFrameOk(false);
    };

    const tryPlay = () => {
      if (!inView || !pageVisible || cancelled) return;
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          /* keep PNG until a frame paints */
        });
      }
    };

    const stopLoop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const paint = () => {
      if (cancelled) return;
      raf = 0;
      if (!inView || !pageVisible) return;

      if (
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        !video.paused &&
        video.currentTime !== lastDraw
      ) {
        try {
          lastDraw = video.currentTime;
          if (
            canvas.width !== video.videoWidth ||
            canvas.height !== video.videoHeight
          ) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0);
          // Knock out only when the active source is opaque black-matte.
          const usingAlpha =
            hasAlpha && video.currentSrc.includes("bottle-alpha");
          if (!usingAlpha) {
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            knockOutMatteByContour(
              frame.data,
              canvas.width,
              canvas.height,
              MATTE_THRESHOLD,
              MATTE_CLOSE_RADIUS,
            );
            ctx.putImageData(frame, 0, 0);
          }
          if (!cancelled) setFrameOk(true);
        } catch {
          fail();
          video.pause();
          return;
        }
      }

      raf = requestAnimationFrame(paint);
    };

    const startLoop = () => {
      if (cancelled || raf || !inView || !pageVisible) return;
      raf = requestAnimationFrame(paint);
    };

    const syncActive = () => {
      if (cancelled) return;
      if (inView && pageVisible) {
        tryPlay();
        startLoop();
      } else {
        stopLoop();
        video.pause();
      }
    };

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      syncActive();
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        syncActive();
      },
      { root: null, threshold: 0.05 },
    );
    io.observe(root);

    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("error", fail);
    document.addEventListener("visibilitychange", onVisibility);
    video.load();
    syncActive();

    return () => {
      cancelled = true;
      stopLoop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("error", fail);
      video.pause();
    };
  }, [sources, preload, hasAlpha]);

  return (
    <div ref={rootRef} className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FALLBACK_BOTTLE}
        alt=""
        className={`absolute inset-0 m-auto h-full w-full object-contain transition-opacity duration-300 ${
          frameOk ? "opacity-0" : "opacity-100"
        }`}
        draggable={false}
      />
      <video
        ref={videoRef}
        className="pointer-events-none absolute h-px w-px opacity-0"
        poster={FALLBACK_BOTTLE}
        muted
        loop
        playsInline
        autoPlay
        preload={preload}
        aria-hidden
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 motion-reduce:hidden ${
          frameOk ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

/**
 * Hero bottle — ZB 749387570 html `1710519761468`:
 * ~37%×66% @1200, wider on small screens. Matte via contour flood-fill.
 * `HOME_BOTTLE_VIDEO` can later point at CDN / Object Storage.
 */
export function HomeHeroBottle() {
  const plan = useSyncExternalStore(subscribePlan, computePlan, getServerPlan);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[46%] left-1/2 z-[15] h-[min(66svh,42rem)] w-[86vw] -translate-x-1/2 -translate-y-1/2 sm:h-[66svh] sm:w-[55vw] md:w-[34vw] lg:w-[37vw] xl:w-[30vw]"
    >
      {plan.allowVideo && plan.sources.length > 0 ? (
        <BottleVideo
          key={planKey(plan)}
          sources={plan.sources}
          preload={plan.preload}
          hasAlpha={plan.hasAlpha}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={FALLBACK_BOTTLE}
          alt=""
          className="absolute inset-0 m-auto h-full w-full object-contain"
          draggable={false}
        />
      )}
    </div>
  );
}
