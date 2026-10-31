"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LocaleSwitch } from "@/components/locale-switch";
import { useFocusTrap } from "@/lib/use-focus-trap";

const NAV_ITEMS = [
  { href: "/beer", label: "Продукция" },
  { href: "/partnership", label: "Партнёрам" },
  { href: "/tours", label: "Экскурсии" },
  { href: "/map", label: "Карта продаж" },
  { href: "/blog", label: "Блог" },
] as const;

type MainNavOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function MainNavOverlay({ open, onClose }: MainNavOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = document.getElementById("site-root");
    root?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = previous;
      root?.removeAttribute("inert");
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      className="animate-menu-fade fixed inset-0 z-[90] flex flex-col overflow-y-auto overscroll-contain bg-gletcher-ice"
      role="dialog"
      aria-modal="true"
      aria-label="Главное меню"
    >
      <div className="flex shrink-0 items-center justify-between px-5 py-5 sm:px-10">
        <LocaleSwitch />
        <button
          type="button"
          onClick={onClose}
          className="font-display text-sm tracking-widest text-gletcher-navy"
          aria-label="Закрыть меню"
        >
          Закрыть
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col justify-center px-6 py-6 sm:px-16 lg:px-24">
        <ul className="flex flex-col items-end gap-3 sm:gap-4">
          {NAV_ITEMS.map((item, index) => (
            <li
              key={item.href}
              className="animate-menu-rise"
              style={{ animationDelay: `${80 + index * 60}ms` }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="font-display text-4xl text-gletcher-navy transition-colors hover:text-gletcher-red sm:text-6xl lg:text-7xl"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex shrink-0 flex-col items-stretch gap-3 px-6 pt-4 pb-10 sm:flex-row sm:items-center sm:justify-end sm:gap-6 sm:px-16 lg:px-24">
        <Link
          href="/members/signup"
          onClick={onClose}
          className="text-center text-xs font-semibold tracking-wide text-gletcher-navy/80 uppercase underline-offset-4 hover:underline sm:text-sm"
        >
          Нет аккаунта? Зарегистрироваться
        </Link>
        <Link
          href="/members/login"
          onClick={onClose}
          className="bg-gletcher-red px-6 py-3 text-center text-sm font-semibold tracking-wide text-gletcher-white uppercase transition-colors hover:bg-gletcher-deep"
        >
          Войти в личный кабинет
        </Link>
      </div>
    </div>
  );
}
