"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { HomeWindowStage } from "@/components/home/home-window-stage";
import { productionHref } from "@/lib/site-links";
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
 * crocodile + subscribe form. Submit UI-only until backend exists.
 */
export function HomeNewsletter({
  locale,
  title,
  lead,
  placeholder,
  submit,
  privacy,
  privacyLinkLabel,
  pendingNote,
  invalidNote,
}: HomeNewsletterProps) {
  const [note, setNote] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const policyHref = productionHref("policy", locale);

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
    <section
      aria-label={title.replace(/\n/g, " ")}
      className="bg-gletcher-ice"
    >
      <HomeWindowStage>
        <div className="grid grid-cols-1 items-center gap-6 px-5 py-8 @[480px]:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] @[480px]:gap-4 @[480px]:px-[10px] @[480px]:py-4 @[640px]:gap-6 @[640px]:px-3 @[960px]:gap-8 @[960px]:px-5 @[960px]:py-0 @[1200px]:grid-cols-[550px_minmax(0,1fr)] @[1200px]:gap-10">
          <div className="relative mx-auto w-full max-w-[550px] @[480px]:mx-0 @[480px]:max-w-none">
            <Image
              src="/home/crodile-subscribe.png"
              alt=""
              width={1472}
              height={1481}
              className="h-auto w-full object-contain"
              sizes="(max-width: 480px) 100vw, 45vw"
              loading="lazy"
              fetchPriority="low"
            />
          </div>

          <div className="flex w-full max-w-[460px] flex-col @[480px]:max-w-[300px] @[640px]:max-w-[300px] @[960px]:max-w-[460px] @[1200px]:pl-2">
            <h2 className="font-display text-[51px] leading-[0.85] font-extrabold tracking-wide whitespace-pre-line text-gletcher-navy uppercase @[480px]:text-[30px] @[640px]:text-[40px] @[960px]:text-[56px] @[1200px]:text-[64px]">
              {title}
            </h2>
            <p className="mt-5 text-[16px] leading-[1.2] whitespace-pre-line text-gletcher-navy @[480px]:mt-3 @[480px]:text-[12px] @[640px]:text-[14px] @[960px]:mt-6 @[960px]:text-[18px] @[1200px]:text-[20px]">
              {lead}
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-8 flex w-full max-w-[300px] flex-col gap-5 @[480px]:mt-5 @[960px]:mt-8"
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
                aria-describedby={invalid ? "home-newsletter-error" : undefined}
                onChange={() => {
                  if (invalid) setInvalid(false);
                }}
                className="h-[50px] w-full border border-gletcher-navy bg-transparent px-4 text-base text-gletcher-navy outline-none placeholder:text-gletcher-navy/45 focus-visible:ring-2 focus-visible:ring-gletcher-navy/30 @[480px]:h-10 @[480px]:text-sm @[960px]:h-[50px] @[960px]:text-base"
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
                className="font-display h-[50px] w-full bg-gletcher-navy text-xs font-extrabold tracking-wide text-white uppercase transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99] @[480px]:h-8 @[960px]:h-[50px]"
              >
                {submit}
              </button>
            </form>

            <p className="mt-5 max-w-[362px] text-[10px] leading-[1.2] text-gletcher-navy @[480px]:mt-3 @[480px]:text-[8px] @[960px]:mt-5 @[960px]:text-[10px]">
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
          </div>
        </div>
      </HomeWindowStage>
    </section>
  );
}
