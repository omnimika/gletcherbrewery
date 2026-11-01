"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import {
  CompositionGrid,
  CompositionPanel,
  Container,
  SectionFrame,
} from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { POLICY_PATH } from "@/content/policy";
import type { PublishedLocale } from "@/i18n/locales";

type HomeNewsletterProps = {
  locale: PublishedLocale;
  title: string;
  lead: string;
  placeholder: string;
  submit: string;
  privacy: string;
  privacyLinkLabel: string;
  pendingNote: string;
  invalidNote: string;
};

/** Minimal client check — not a backend guarantee (H04). */
function looksLikeEmail(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Production ZB `751210003` (footer/library peer; EN `762056776`):
 * crocodile + subscribe form on one stretch screen slide (halves-x).
 * Submit UI-only until backend exists.
 */
export function HomeNewsletter({
  locale: _locale,
  title,
  lead,
  placeholder,
  submit,
  privacy,
  privacyLinkLabel,
  pendingNote,
  invalidNote,
}: HomeNewsletterProps) {
  void _locale;
  const [note, setNote] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const policyHref = POLICY_PATH;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    const value = typeof email === "string" ? email : "";

    if (!looksLikeEmail(value)) {
      setInvalid(true);
      setNote(null);
      return;
    }

    setInvalid(false);
    setNote(pendingNote);
  }

  return (
    <SectionFrame
      id="newsletter"
      mode="screen"
      tone="ice"
      snap
      aria-label={title.replace(/\n/g, " ")}
    >
      <Container fill>
        <CompositionGrid preset="halves-x" fill>
          <CompositionPanel className="items-center justify-center">
            <Reveal className="flex w-full max-w-[min(100%,28rem)] items-center justify-center sm:max-w-none">
              <Image
                src="/home/crodile-subscribe.png"
                alt=""
                width={1472}
                height={1481}
                className="h-auto max-h-[min(55svh,28rem)] w-full object-contain lg:max-h-[min(70svh,36rem)]"
                sizes="(max-width: 640px) 70vw, 45vw"
                loading="lazy"
                fetchPriority="low"
              />
            </Reveal>
          </CompositionPanel>

          <CompositionPanel className="justify-center">
            <Reveal className="flex w-full min-w-0 max-w-[min(100%,28rem)] flex-col lg:max-w-[460px]">
              <h2 className="font-display text-[clamp(1.75rem,5vw,4rem)] leading-[0.9] font-extrabold tracking-normal break-words whitespace-pre-line text-gletcher-navy uppercase">
                {title}
              </h2>
              <p className="mt-4 text-[clamp(0.875rem,1.6vw,1.25rem)] leading-[1.25] break-words whitespace-pre-line text-gletcher-navy sm:mt-3 lg:mt-6">
                {lead}
              </p>

              <form
                onSubmit={onSubmit}
                className="mt-6 flex w-full max-w-[300px] flex-col gap-4 sm:mt-5 sm:gap-5 lg:mt-8"
                noValidate
              >
                <label className="sr-only" htmlFor="home-newsletter-email">
                  {placeholder}
                </label>
                <input
                  id="home-newsletter-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={placeholder}
                  aria-invalid={invalid || undefined}
                  aria-describedby={
                    invalid ? "home-newsletter-error" : undefined
                  }
                  onChange={() => {
                    if (invalid) setInvalid(false);
                  }}
                  className="h-12 w-full min-w-0 border border-gletcher-navy bg-transparent px-4 text-base text-gletcher-navy outline-none placeholder:text-gletcher-navy/45 focus-visible:ring-2 focus-visible:ring-gletcher-navy/30 sm:h-10 sm:text-sm lg:h-[50px] lg:text-base"
                />
                {invalid ? (
                  <p
                    id="home-newsletter-error"
                    className="text-xs text-gletcher-red"
                    role="alert"
                  >
                    {invalidNote}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="font-display h-12 w-full bg-gletcher-navy text-xs font-extrabold tracking-wide text-white uppercase transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99] sm:h-8 lg:h-[50px]"
                >
                  {submit}
                </button>
              </form>

              <p className="mt-5 max-w-full text-[clamp(0.5rem,1vw,0.625rem)] leading-[1.3] break-words text-gletcher-navy sm:mt-3 lg:mt-5 lg:max-w-[362px]">
                {privacy}{" "}
                <a
                  href={policyHref}
                  className="underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  {privacyLinkLabel}
                </a>
              </p>

              {note ? (
                <p className="mt-3 text-xs text-gletcher-navy/60" role="status">
                  {note}
                </p>
              ) : null}
            </Reveal>
          </CompositionPanel>
        </CompositionGrid>
      </Container>
    </SectionFrame>
  );
}
