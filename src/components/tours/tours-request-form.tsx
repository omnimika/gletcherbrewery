"use client";

import { useState, type FormEvent } from "react";
import type { ToursCopy } from "@/content/tours";

type Status = "idle" | "ok" | "error";

/**
 * Tours request form — stub submit until booking backend (Stage 8).
 * Fields mirror production popup/form labels; no invented validation rules.
 */
export function ToursRequestForm({ fields }: { fields: ToursCopy["requestFields"] }) {
  const [status, setStatus] = useState<Status>("idle");

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

  const inputClass =
    "w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm text-gletcher-navy outline-none focus:border-gletcher-navy";

  return (
    <form className="space-y-3" onSubmit={onSubmit} noValidate>
      <label className="block">
        <span className="sr-only">{fields.name}</span>
        <input
          name="name"
          placeholder={fields.name}
          autoComplete="name"
          className={inputClass}
          required
        />
      </label>
      <label className="block">
        <span className="sr-only">{fields.phone}</span>
        <input
          name="phone"
          type="tel"
          placeholder={fields.phone}
          autoComplete="tel"
          className={inputClass}
          required
        />
      </label>
      <label className="block">
        <span className="sr-only">{fields.date}</span>
        <input name="date" type="date" className={inputClass} required />
      </label>
      <label className="block">
        <span className="sr-only">{fields.guests}</span>
        <input
          name="guests"
          type="number"
          min={1}
          placeholder={fields.guests}
          className={inputClass}
          required
        />
      </label>
      <label className="block">
        <span className="sr-only">{fields.email}</span>
        <input
          name="email"
          type="email"
          placeholder={fields.email}
          autoComplete="email"
          className={inputClass}
          required
        />
      </label>
      <label className="block">
        <span className="sr-only">{fields.wishes}</span>
        <textarea
          name="wishes"
          rows={4}
          placeholder={fields.wishes}
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center border border-gletcher-navy px-4 text-sm font-thin tracking-wide text-white uppercase"
        style={{
          background:
            "radial-gradient(circle at center, rgba(252,59,64,1) 3%, rgba(254,36,42,1) 46%, rgba(213,16,22,1) 100%)",
        }}
      >
        {fields.submit}
      </button>
      {status === "ok" ? (
        <p className="text-sm text-gletcher-navy/80" role="status">
          {fields.ok}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-gletcher-red" role="alert">
          *
        </p>
      ) : null}
    </form>
  );
}
