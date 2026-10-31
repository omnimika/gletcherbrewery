"use client";

import { useState, type FormEvent } from "react";

type HomeNewsletterProps = {
  title: string;
  lead: string;
  placeholder: string;
  submit: string;
  pendingNote: string;
};

/**
 * Visual newsletter matching production home. Submit is UI-only until
 * a server handler exists (Open in HOME_PAGE_BASELINE).
 */
export function HomeNewsletter({
  title,
  lead,
  placeholder,
  submit,
  pendingNote,
}: HomeNewsletterProps) {
  const [note, setNote] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNote(pendingNote);
  }

  return (
    <section className="border-t border-gletcher-navy/10 bg-gletcher-ice px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto flex max-w-xl flex-col gap-4 text-center">
        <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold tracking-wide text-gletcher-navy uppercase">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-gletcher-navy/70 sm:text-base">
          {lead}
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
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
            className="min-w-0 flex-1 border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm text-gletcher-navy outline-none focus-visible:border-gletcher-navy"
          />
          <button
            type="submit"
            className="bg-gletcher-red px-6 py-3 text-sm font-semibold tracking-wide text-gletcher-white uppercase transition-colors hover:bg-gletcher-deep"
          >
            {submit}
          </button>
        </form>
        {note ? (
          <p className="text-xs text-gletcher-navy/60" role="status">
            {note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
