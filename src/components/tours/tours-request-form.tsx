"use client";

import { useState, type FormEvent } from "react";
import type { ToursCopy } from "@/content/tours";
import { TOURS_YCLIENTS } from "@/content/tours";

type Status = "idle" | "unavailable" | "error";

/**
 * Tours request form — online submit unavailable until booking backend (Stage 8).
 * Keeps input; shows phone + YCLIENTS paths. `contact` mirrors ZB `750698486`.
 */
export function ToursRequestForm({
  fields,
  phone,
  variant = "default",
}: {
  fields: ToursCopy["requestFields"];
  phone: ToursCopy["phone"];
  variant?: "default" | "contact";
}) {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      event.preventDefault();
      setStatus("error");
      return;
    }
    event.preventDefault();
    // No delivery yet — keep values, do not pretend success.
    setStatus("unavailable");
  };

  const contact = variant === "contact";
  const inputClass = contact
    ? "w-full rounded-[10px] border border-gletcher-navy bg-white px-3 py-2.5 text-sm font-medium text-gletcher-navy outline-none focus:border-gletcher-red"
    : "w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm text-gletcher-navy outline-none focus:border-gletcher-navy";
  const labelClass = contact
    ? "mb-1 block text-[0.5625rem] font-black uppercase tracking-wide text-gletcher-navy"
    : "sr-only";

  return (
    <form
      className={contact ? "grid gap-2.5 sm:grid-cols-2" : "space-y-3"}
      onSubmit={onSubmit}
      noValidate
    >
      <label className="block">
        <span className={labelClass}>{fields.name}</span>
        <input
          name="name"
          placeholder={contact ? undefined : fields.name}
          autoComplete="name"
          className={inputClass}
          required
        />
      </label>
      <label className="block">
        <span className={labelClass}>{fields.phone}</span>
        <input
          name="phone"
          type="tel"
          placeholder={contact ? undefined : fields.phone}
          autoComplete="tel"
          className={inputClass}
          required
        />
      </label>
      <label className="block">
        <span className={labelClass}>{fields.date}</span>
        <input name="date" type="date" className={inputClass} required />
      </label>
      <label className="block">
        <span className={labelClass}>{fields.guests}</span>
        <input
          name="guests"
          type="number"
          min={1}
          placeholder={contact ? undefined : fields.guests}
          className={inputClass}
          required
        />
      </label>
      <label className="block sm:col-span-2">
        <span className={labelClass}>{fields.email}</span>
        <input
          name="email"
          type="email"
          placeholder={contact ? undefined : fields.email}
          autoComplete="email"
          className={inputClass}
          required
        />
      </label>
      <label className="block sm:col-span-2">
        <span className={labelClass}>{fields.wishes}</span>
        <textarea
          name="wishes"
          rows={2}
          placeholder={contact ? undefined : fields.wishes}
          className={inputClass}
        />
      </label>
      <div className={contact ? "sm:col-span-2" : undefined}>
        <button
          type="submit"
          className={
            contact
              ? "mx-auto flex min-h-11 w-full max-w-[18.75rem] items-center justify-center bg-gletcher-navy text-base font-semibold tracking-wide text-white uppercase shadow-[0_3px_0_0_rgba(13,15,73,0.25)]"
              : "inline-flex min-h-12 w-full items-center justify-center border border-gletcher-navy px-4 text-sm font-thin tracking-wide text-white uppercase"
          }
          style={
            contact
              ? undefined
              : {
                  background:
                    "radial-gradient(circle at center, rgba(252,59,64,1) 3%, rgba(254,36,42,1) 46%, rgba(213,16,22,1) 100%)",
                }
          }
        >
          {fields.submit}
        </button>
      </div>
      {status === "unavailable" ? (
        <p
          className={`text-sm sm:col-span-2 ${contact ? "font-semibold text-[#a7e663]" : "text-gletcher-navy/80"}`}
          role="status"
        >
          {fields.unavailable}{" "}
          <a href={phone.href} className="underline underline-offset-2">
            {phone.label}
          </a>
          {" · "}
          <a
            href={TOURS_YCLIENTS.group}
            className="underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            {fields.bookingLinkLabel}
          </a>
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-gletcher-red sm:col-span-2" role="alert">
          *
        </p>
      ) : null}
    </form>
  );
}
