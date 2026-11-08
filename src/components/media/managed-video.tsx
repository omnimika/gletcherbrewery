"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type VideoHTMLAttributes,
} from "react";

type ManagedVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "autoPlay" | "children"
> & {
  /** Sources / tracks as children. */
  children?: ReactNode;
  /** Static fallback when reduced-motion, load error, or autoplay blocked. */
  fallback?: ReactNode;
  className?: string;
};

/**
 * Looping ambient video with a shared media policy:
 * prefers-reduced-motion → static fallback (no autoplay);
 * offscreen / document hidden → pause;
 * error → static fallback.
 * ZbAppear/ZbSbs wrappers do not replace this policy.
 */
export function ManagedVideo({
  children,
  fallback = null,
  className,
  muted = true,
  loop = true,
  playsInline = true,
  preload = "metadata",
  ...rest
}: ManagedVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [reduce, setReduce] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduce, failed]);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduce || failed) return;

    const syncPlayback = () => {
      if (document.hidden || !inView) {
        node.pause();
        return;
      }
      void node.play().catch(() => {
        setFailed(true);
      });
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [reduce, failed, inView]);

  if (reduce || failed) {
    return (
      <div className={className} aria-hidden={rest["aria-hidden"]}>
        {fallback}
      </div>
    );
  }

  return (
    <video
      ref={ref}
      className={className}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      onError={() => setFailed(true)}
      {...rest}
    >
      {children}
    </video>
  );
}
