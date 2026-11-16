"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import type { ToursCopy } from "@/content/tours";
import { TOURS_YCLIENTS } from "@/content/tours";
import {
  POLICY_SITE_VERSION,
  TOURS_REQUEST_FORM_ID,
} from "@/content/forms/form-ids";
import {
  clearIdempotencyKey,
  ensureIdempotencyKey,
  postFormSubmission,
} from "@/lib/forms/client-submit";

type Status = "idle" | "pending" | "accepted" | "unavailable" | "error";

/**
 * Tours request form — lead intake only (not booked/paid; YCLIENTS remains).
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
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const locale = useLocale();
  const pathname = usePathname();
  const formDomId = useId();
  const storageKey = `tours-request-idempotency:${formDomId}`;
  const submittingRef = useRef(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (!form.reportValidity()) {
      setStatus("error");
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("pending");

    const data = new FormData(form);
    const fieldsPayload = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      date: String(data.get("date") ?? ""),
      guests: String(data.get("guests") ?? ""),
      email: String(data.get("email") ?? ""),
      wishes: String(data.get("wishes") ?? ""),
    };
    const idempotencyKey = ensureIdempotencyKey(storageKey);

    try {
      const result = await postFormSubmission({
        schemaVersion: "tours-request-v1",
        formId: TOURS_REQUEST_FORM_ID,
        locale,
        sourcePath: pathname || "/tours",
        placement: variant === "contact" ? "tours_contact" : "tours_request",
        idempotencyKey,
        fields: fieldsPayload,
        consent: { accepted: true, policyVersion: POLICY_SITE_VERSION },
      });

      if (result.ok) {
        setSubmissionId(result.submissionId);
        setStatus("accepted");
        clearIdempotencyKey(storageKey);
        return;
      }
      if (result.status === 503 || result.status === 0) {
        setStatus("unavailable");
        return;
      }
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  };

  const contact = variant === "contact";
  const locked = status === "pending" || status === "accepted";
  const inputClass = contact
    ? "w-full rounded-[10px] border border-gletcher-navy bg-white px-3 py-2.5 text-sm font-medium text-gletcher-navy outline-none focus:border-gletcher-red disabled:opacity-70"
    : "w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm text-gletcher-navy outline-none focus:border-gletcher-navy disabled:opacity-70";
  const labelClass = contact
    ? "mb-1 block text-[0.5625rem] font-black uppercase tracking-wide text-gletcher-navy"
    : "sr-only";

  return (
    <form
      className={contact ? "grid gap-2.5 sm:grid-cols-2" : "space-y-3"}
      onSubmit={onSubmit}
      noValidate
      aria-busy={status === "pending"}
    >
      <label className="block">
        <span className={labelClass}>{fields.name}</span>
        <input
          name="name"
          placeholder={contact ? undefined : fields.name}
          autoComplete="name"
          className={inputClass}
          required
          disabled={locked}
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
          disabled={locked}
        />
      </label>
      <label className="block">
        <span className={labelClass}>{fields.date}</span>
        <input
          name="date"
          type="date"
          className={inputClass}
          required
          disabled={locked}
        />
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
          disabled={locked}
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
          disabled={locked}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className={labelClass}>{fields.wishes}</span>
        <textarea
          name="wishes"
          rows={2}
          placeholder={contact ? undefined : fields.wishes}
          className={inputClass}
          disabled={locked}
        />
      </label>
      <div className={contact ? "sm:col-span-2" : undefined}>
        <button
          type="submit"
          disabled={locked}
          className={
            contact
              ? "mx-auto flex min-h-11 w-full max-w-[18.75rem] items-center justify-center bg-gletcher-navy text-base font-semibold tracking-wide text-white uppercase shadow-[0_3px_0_0_rgba(13,15,73,0.25)] disabled:opacity-70"
              : "inline-flex min-h-12 w-full items-center justify-center border border-gletcher-navy px-4 text-sm font-thin tracking-wide text-white uppercase disabled:opacity-70"
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
          {status === "pending" ? "…" : fields.submit}
        </button>
      </div>
      {status === "accepted" && submissionId ? (
        <p
          className={`text-sm sm:col-span-2 ${contact ? "font-semibold text-[#a7e663]" : "text-gletcher-navy/80"}`}
          role="status"
        >
          OK · <span className="font-mono text-xs">{submissionId}</span>
        </p>
      ) : null}
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
