"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { PartnershipCopy } from "@/content/partnership";
import { POLICY_PATH } from "@/content/policy";

type PartnershipFormProps = {
  copy: PartnershipCopy;
};

type Status = "idle" | "unavailable" | "error";

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
  const policyHref = POLICY_PATH;

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

  return (
    <form
      className="space-y-5 border border-gletcher-navy/20 bg-gletcher-white/70 p-5 sm:p-7"
      onSubmit={onSubmit}
      noValidate
      aria-label={copy.formTitle}
    >
      <fieldset className="space-y-3">
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
            className="w-full border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
          />
        </label>
      ))}

      <label className="block">
        <span className="sr-only">{copy.fields.comment}</span>
        <textarea
          name="comment"
          placeholder={copy.fields.comment}
          rows={3}
          className="w-full resize-y border border-gletcher-navy/25 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
        />
      </label>

      {copy.policyHtml ? (
        <label className="flex items-start gap-3 text-sm leading-snug text-gletcher-navy">
          <input
            type="checkbox"
            name="policy"
            required
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

      <Button type="submit" variant="primary" className="w-full sm:w-auto">
        {copy.submit}
      </Button>
      <p className="text-xs text-gletcher-navy/60">{copy.note}</p>
      {status === "unavailable" ? (
        <p className="text-sm text-gletcher-navy" role="status">
          {copy.unavailable}{" "}
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
          {copy.error}
        </p>
      ) : null}
    </form>
  );
}
