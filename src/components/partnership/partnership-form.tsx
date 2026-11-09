"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { PartnershipCopy } from "@/content/partnership";
import { POLICY_PATH } from "@/content/policy";
import {
  PARTNERSHIP_FORM_ID,
  POLICY_SITE_VERSION,
} from "@/content/forms/form-ids";
import {
  clearIdempotencyKey,
  ensureIdempotencyKey,
  postFormSubmission,
} from "@/lib/forms/client-submit";

type PartnershipFormProps = {
  copy: PartnershipCopy;
};

type Status = "idle" | "pending" | "accepted" | "unavailable" | "error";

const CONTACT_EMAIL = {
  address: "info@gletcherbrewery.com",
  href: "mailto:info@gletcherbrewery.com",
} as const;

const CONTACT_PHONE = {
  label: "+7 (495) 989-24-14",
  href: "tel:+74959892414",
} as const;

export function PartnershipForm({ copy }: PartnershipFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const locale = useLocale();
  const pathname = usePathname();
  const formDomId = useId();
  const storageKey = `partnership-idempotency:${formDomId}`;
  const submittingRef = useRef(false);
  const policyHref = POLICY_PATH;

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
    setErrorMessage(null);

    const data = new FormData(form);
    const fields = {
      type: String(data.get("type") ?? ""),
      company: String(data.get("company") ?? ""),
      city: String(data.get("city") ?? ""),
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      comment: String(data.get("comment") ?? ""),
    };
    const idempotencyKey = ensureIdempotencyKey(storageKey);

    try {
      const result = await postFormSubmission({
        schemaVersion: "partnership-v1",
        formId: PARTNERSHIP_FORM_ID,
        locale,
        sourcePath: pathname || "/partnership",
        placement: "partnership_page",
        idempotencyKey,
        fields,
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
        setErrorMessage(result.message ?? copy.unavailable);
        return;
      }
      setStatus("error");
      setErrorMessage(result.message ?? copy.error);
    } finally {
      submittingRef.current = false;
    }
  };

  const locked = status === "pending" || status === "accepted";

  return (
    <form
      className="space-y-5 border border-gletcher-navy/20 bg-gletcher-white/70 p-5 sm:p-7"
      onSubmit={onSubmit}
      noValidate
      aria-label={copy.formTitle}
      aria-busy={status === "pending"}
    >
      <fieldset className="space-y-3" disabled={locked}>
        <legend className="sr-only">{copy.formTitle}</legend>
        <div className="flex flex-wrap gap-4">
          {copy.partnerTypes.map((opt) => (
            <label
              key={opt.value}
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-gletcher-navy"
            >
              <input
                type="radio"
                name="type"
                value={opt.value}
                required
                className="size-4 accent-gletcher-red"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {(
        [
          ["company", copy.fields.company, "organization"],
          ["city", copy.fields.city, "address-level2"],
          ["name", copy.fields.name, "name"],
          ["email", copy.fields.email, "email"],
          ["phone", copy.fields.phone, "tel"],
        ] as const
      ).map(([name, placeholder, autoComplete]) => (
        <label key={name} className="block">
          <span className="sr-only">{placeholder}</span>
          <input
            name={name}
            type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required
            disabled={locked}
            className="w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy disabled:opacity-70"
          />
        </label>
      ))}

      <label className="block">
        <span className="sr-only">{copy.fields.comment}</span>
        <textarea
          name="comment"
          placeholder={copy.fields.comment}
          rows={3}
          disabled={locked}
          className="w-full resize-y border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy disabled:opacity-70"
        />
      </label>

      {copy.policyHtml ? (
        <label className="flex items-start gap-3 text-sm leading-snug text-gletcher-navy">
          <input
            type="checkbox"
            name="policy"
            required
            disabled={locked}
            className="mt-1 size-4 shrink-0 accent-gletcher-red"
          />
          <span>
            {copy.policyBefore}
            <a
              href={policyHref}
              className="underline decoration-gletcher-red underline-offset-2"
            >
              {copy.policyLink}
            </a>
            {copy.policyAfter}
          </span>
        </label>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        className="w-full sm:w-auto"
        disabled={locked}
      >
        {status === "pending" ? "…" : copy.submit}
      </Button>
      <p className="text-xs text-gletcher-navy/60">{copy.note}</p>
      {status === "accepted" && submissionId ? (
        <p className="text-sm text-gletcher-navy" role="status">
          OK · <span className="font-mono text-xs">{submissionId}</span>
        </p>
      ) : null}
      {status === "unavailable" ? (
        <p className="text-sm text-gletcher-navy" role="status">
          {errorMessage ?? copy.unavailable}{" "}
          <a href={CONTACT_PHONE.href} className="underline underline-offset-2">
            {CONTACT_PHONE.label}
          </a>
          {" · "}
          <a href={CONTACT_EMAIL.href} className="underline underline-offset-2">
            {CONTACT_EMAIL.address}
          </a>
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-gletcher-red" role="alert">
          {errorMessage ?? copy.error}
        </p>
      ) : null}
    </form>
  );
}
