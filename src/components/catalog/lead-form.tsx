"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  CompositionGrid,
  CompositionPanel,
  Container,
  SectionFrame,
} from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

type Status = "idle" | "ok" | "error";

/**
 * Catalog lead form — DS-3 halves-x content section (stub submit until stage 4+).
 */
export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const t = useTranslations("leadForm");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      event.preventDefault();
      setStatus("error");
      return;
    }
    event.preventDefault();
    setStatus("ok");
    form.reset();
  };

  return (
    <SectionFrame
      id="lead"
      mode="content"
      tone="ice"
      snap
      aria-labelledby="lead-title"
      className="border-t border-gletcher-navy/10"
    >
      <Container wide className="max-w-[1100px]">
        <CompositionGrid preset="halves-x">
          <CompositionPanel>
            <Reveal>
              <p className="text-sm font-semibold tracking-[0.2em] text-gletcher-navy/70 uppercase">
                {t("eyebrow")}
              </p>
              <h2
                id="lead-title"
                className="font-display mt-3 text-4xl text-gletcher-navy sm:text-5xl"
              >
                {t("title")}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-gletcher-navy/75 sm:text-base">
                {t("lead")}
              </p>
            </Reveal>
          </CompositionPanel>

          <CompositionPanel>
            <Reveal>
              <form className="space-y-4" onSubmit={onSubmit} noValidate>
                <label className="block">
                  <span className="sr-only">{t("name")}</span>
                  <input
                    name="name"
                    placeholder={t("name")}
                    autoComplete="name"
                    className="w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
                    required
                  />
                </label>
                <label className="block">
                  <span className="sr-only">{t("email")}</span>
                  <input
                    name="email"
                    type="email"
                    placeholder={t("email")}
                    autoComplete="email"
                    className="w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
                    required
                  />
                </label>
                <label className="block">
                  <span className="sr-only">{t("comment")}</span>
                  <textarea
                    name="comment"
                    placeholder={t("comment")}
                    rows={4}
                    className="w-full resize-y border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
                  />
                </label>
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {t("submit")}
                </Button>
                <p className="text-xs text-gletcher-navy/60">{t("note")}</p>
                {status === "ok" ? (
                  <p className="text-sm text-gletcher-navy" role="status">
                    {t("success")}
                  </p>
                ) : null}
                {status === "error" ? (
                  <p className="text-sm text-gletcher-red" role="alert">
                    {t("error")}
                  </p>
                ) : null}
              </form>
            </Reveal>
          </CompositionPanel>
        </CompositionGrid>
      </Container>
    </SectionFrame>
  );
}
