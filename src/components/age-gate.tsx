"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { persistAgeGatePassed, readAgeGatePassed } from "@/lib/age-gate";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/lib/use-focus-trap";

export function AgeGate() {
  const [open, setOpen] = useState<boolean | null>(null);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("ageGate");

  useFocusTrap(dialogRef, open === true);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setOpen(!readAgeGatePassed());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (open !== true) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = document.getElementById("site-root");
    root?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = previous;
      root?.removeAttribute("inert");
    };
  }, [open]);

  if (open !== true) return null;

  return (
    <div
      ref={dialogRef}
      className="animate-menu-fade fixed inset-0 z-[100] flex items-center justify-center bg-gletcher-navy/80 p-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="animate-gate-in w-full max-w-md border border-gletcher-red/40 bg-gletcher-white p-8 text-center shadow-soft sm:p-10">
        <p
          id={titleId}
          className="font-display text-2xl text-gletcher-navy sm:text-3xl"
        >
          {t("title")}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gletcher-navy/80">
          {t("body")}
        </p>
        <Button
          variant="outline"
          className="mt-8 w-full border-gletcher-red text-gletcher-navy sm:w-auto"
          onClick={() => {
            persistAgeGatePassed();
            setOpen(false);
          }}
        >
          {t("confirm")}
        </Button>
      </div>
    </div>
  );
}
