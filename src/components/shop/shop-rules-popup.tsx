"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { SHOP_PAGE } from "@/content/shop";

const HASH = "#popup:shopping-rules";
const COOKIE = "gletcher-shop-rules-seen";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

function writeCookie(name: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=1; expires=${expires}; path=/`;
}

/**
 * Production T390 popup `#popup:shopping-rules` + T354 auto-open on scroll.
 * Backdrop rgba(33,53,97,0.90). Cookie mirrors source (~3 days).
 */
export function ShopRulesPopup() {
  const p = SHOP_PAGE.rules;
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    writeCookie(COOKIE, 3);
    if (window.location.hash === HASH) {
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const openPopup = useCallback(() => {
    setOpen(true);
    const node = dialogRef.current;
    if (node && !node.open) node.showModal();
  }, []);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === HASH) openPopup();
    };

    const boot = window.setTimeout(onHash, 0);
    window.addEventListener("hashchange", onHash);

    let onScroll: (() => void) | undefined;
    if (!readCookie(COOKIE) && window.location.hash !== HASH) {
      onScroll = () => {
        if (window.scrollY > window.innerHeight * 0.35) {
          openPopup();
          if (onScroll) window.removeEventListener("scroll", onScroll);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      window.clearTimeout(boot);
      window.removeEventListener("hashchange", onHash);
      if (onScroll) window.removeEventListener("scroll", onScroll);
    };
  }, [openPopup]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 z-[80] m-0 h-full max-h-none w-full max-w-none border-0 bg-[rgba(33,53,97,0.9)] p-4 open:flex open:items-center open:justify-center sm:p-8"
      onClose={() => {
        setOpen(false);
        writeCookie(COOKIE, 3);
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
    >
      {open ? (
        <div className="relative w-full max-w-[36rem] bg-gletcher-white px-6 py-8 text-gletcher-navy shadow-xl sm:px-10 sm:py-12">
          <button
            type="button"
            onClick={close}
            aria-label={p.closeLabel}
            className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center text-gletcher-sky transition-colors hover:text-gletcher-red"
          >
            <span aria-hidden className="text-2xl leading-none">
              ×
            </span>
          </button>

          <h2
            id={titleId}
            className="font-display pr-8 text-[clamp(1.5rem,3vw,2rem)] leading-none font-extrabold tracking-wide"
          >
            {p.title}
          </h2>
          <p className="mt-5 text-sm leading-relaxed font-semibold sm:text-[0.95rem]">
            {p.body}
          </p>
          <p className="mt-4 text-sm sm:text-[0.95rem]">
            {p.moreBefore}{" "}
            <Link
              href={p.moreHref}
              className="font-extrabold text-gletcher-red underline-offset-4 hover:underline"
              onClick={close}
            >
              {p.moreLinkLabel}
            </Link>
            .
          </p>
        </div>
      ) : null}
    </dialog>
  );
}
