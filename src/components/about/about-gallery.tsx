"use client";

/**
 * About ZB gallery — loop, autoplay ~5s.
 * Default: column-filling frame + object-fit cover (Tilda slds_stretch:cover /
 * shop gallery pattern). Bottle variant: tall portrait frame for product PNGs.
 */
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type CSSProperties,
} from "react";
import styles from "./about-gallery.module.css";

export type AboutGallerySlide = {
  src: string;
  alt?: string;
  /** Optional product / deep link (beer category bottle galleries). */
  href?: string;
};

type AboutGalleryProps = {
  slides: readonly AboutGallerySlide[];
  label: string;
  /** Arrow / border accent — Tilda slds_arrowcolor / bordercolor */
  accent?: "red" | "black" | "white";
  className?: string;
  /** Autoplay interval ms; 0 = off. Source default 5s. */
  autoplayMs?: number;
  /**
   * Fixed CSS aspect-ratio for the viewport (e.g. "444 / 250").
   * Width-bound frame; height follows ratio. Omit to fill parent height.
   */
  aspectRatio?: string;
  /** Tall product bottle frame (ZB beer columns ~100×360). */
  variant?: "default" | "bottle";
  /** Arrow placement — Tilda slds_arrowcontrols in | under | none */
  arrows?: "in" | "under" | "none";
};

export function AboutGallery({
  slides,
  label,
  accent = "red",
  className = "",
  autoplayMs = 5000,
  aspectRatio,
  variant = "default",
  arrows = "in",
}: AboutGalleryProps) {
  const labelId = useId();
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const current = slides[index] ?? slides[0];
  const isBottle = variant === "bottle";
  const showArrows = arrows !== "none" && count > 1;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count < 2) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (autoplayMs <= 0 || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => go(1), autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, count, go, index]);

  if (!current) return null;

  const accentClass =
    accent === "black"
      ? styles.accentBlack
      : accent === "white"
        ? styles.accentWhite
        : styles.accentRed;

  const image = (
    <Image
      key={current.src}
      src={current.src}
      alt={current.alt ?? ""}
      fill
      className={isBottle ? styles.imageBottle : styles.imageCover}
      sizes={
        isBottle
          ? "(max-width: 860px) 30vw, 8vw"
          : "(max-width: 860px) 100vw, 45vw"
      }
      priority={index === 0}
    />
  );

  const media = current.href ? (
    <Link
      href={current.href}
      className={styles.slideLinkFill}
      aria-label={current.alt || label}
    >
      {image}
    </Link>
  ) : (
    image
  );

  const controls = showArrows ? (
    <div
      className={`${styles.controls} ${arrows === "under" ? styles.controlsUnder : ""}`.trim()}
    >
      <button
        type="button"
        className={styles.arrow}
        aria-label="Предыдущее"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          go(-1);
        }}
      >
        ‹
      </button>
      <button
        type="button"
        className={styles.arrow}
        aria-label="Следующее"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          go(1);
        }}
      >
        ›
      </button>
    </div>
  ) : null;

  return (
    <figure
      className={`${styles.root} ${accentClass} ${isBottle ? styles.rootBottle : ""} ${className}`.trim()}
      aria-labelledby={labelId}
      data-no-slide-advance=""
      style={
        aspectRatio && !isBottle
          ? ({ ["--gallery-ratio" as string]: aspectRatio } as CSSProperties)
          : undefined
      }
    >
      <p id={labelId} className="sr-only">
        {label}
      </p>
      <div
        className={`${styles.viewport} ${aspectRatio && !isBottle ? styles.viewportRatio : ""} ${isBottle ? styles.viewportBottle : ""}`.trim()}
      >
        {media}
        {arrows === "in" ? controls : null}
      </div>
      {arrows === "under" ? controls : null}
    </figure>
  );
}
