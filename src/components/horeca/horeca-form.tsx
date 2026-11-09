"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { HORECA_PAGE } from "@/content/horeca";
import { POLICY_PATH } from "@/content/policy";
import { HORECA_FORM_ID, POLICY_SITE_VERSION } from "@/content/forms/form-ids";
import {
  clearIdempotencyKey,
  ensureIdempotencyKey,
  postFormSubmission,
} from "@/lib/forms/client-submit";

type Status = "idle" | "pending" | "accepted" | "unavailable" | "error";

const CONTACT_EMAIL = {
  address: "info@gletcherbrewery.com",
  href: "mailto:info@gletcherbrewery.com",
} as const;

const CONTACT_PHONE = {
  label: "+7 (495) 989-24-14",
  href: "tel:+74959892414",
} as const;

export function HorecaForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formDomId = useId();
  const storageKey = `horeca-idempotency:${formDomId}`;
  const submittingRef = useRef(false);
  const policyHref = POLICY_PATH;
  const f = HORECA_PAGE.fields;

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
      city: String(data.get("city") ?? ""),
      company: String(data.get("company") ?? ""),
      name: String(data.get("name") ?? ""),
      inn: String(data.get("inn") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      comment: String(data.get("comment") ?? ""),
    };
    const idempotencyKey = ensureIdempotencyKey(storageKey);

    try {
      const result = await postFormSubmission({
        schemaVersion: "horeca-ru-v1",
        formId: HORECA_FORM_ID,
        locale: "ru",
        sourcePath: "/horeca",
        placement: "horeca_page",
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
        setErrorMessage(result.message ?? HORECA_PAGE.unavailable);
        return;
      }
      setStatus("error");
      setErrorMessage(result.message ?? HORECA_PAGE.error);
    } finally {
      submittingRef.current = false;
    }
  };

  const locked = status === "pending" || status === "accepted";

  return (
    <form
      className="space-y-4 border border-gletcher-red/40 bg-gletcher-white p-5 sm:p-7"
      onSubmit={onSubmit}
      noValidate
      aria-label={HORECA_PAGE.formTitle}
      aria-busy={status === "pending"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["city", f.city],
            ["company", f.company],
            ["name", f.name],
            ["inn", f.inn],
            ["email", f.email],
            ["phone", f.phone],
          ] as const
        ).map(([name, placeholder]) => (
          <label key={name} className="block sm:[&:nth-child(5)]:col-span-1">
            <span className="sr-only">{placeholder}</span>
            <input
              name={name}
              type={
                name === "email" ? "email" : name === "phone" ? "tel" : "text"
              }
              placeholder={placeholder}
              required
              disabled={locked}
              className="w-full rounded-lg border border-gletcher-red/50 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy disabled:opacity-70"
            />
          </label>
        ))}
      </div>
      <label className="block">
        <span className="sr-only">{f.comment}</span>
        <textarea
          name="comment"
          placeholder={f.comment}
          rows={3}
          required
          disabled={locked}
          className="w-full resize-y rounded-lg border border-gletcher-red/50 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy disabled:opacity-70"
        />
      </label>
      <label className="flex items-start gap-3 text-sm text-gletcher-navy">
        <input
          type="checkbox"
          name="policy"
          required
          disabled={locked}
          className="mt-1 size-4 accent-gletcher-red"
        />
        <span>
          {HORECA_PAGE.policyLabel}{" "}
          <a
            href={policyHref}
            className="underline decoration-gletcher-red underline-offset-2"
          >
            (политика)
          </a>
        </span>
      </label>
      <Button
        type="submit"
        variant="primary"
        className="w-full sm:w-auto"
        disabled={locked}
      >
        {status === "pending" ? "…" : HORECA_PAGE.submit}
      </Button>
      <p className="text-xs text-gletcher-navy/60">{HORECA_PAGE.note}</p>
      {status === "accepted" && submissionId ? (
        <p className="text-sm text-gletcher-navy" role="status">
          OK · <span className="font-mono text-xs">{submissionId}</span>
        </p>
      ) : null}
      {status === "unavailable" ? (
        <p className="text-sm text-gletcher-navy" role="status">
          {errorMessage ?? HORECA_PAGE.unavailable}{" "}
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
          {errorMessage ?? HORECA_PAGE.error}
        </p>
      ) : null}
    </form>
  );
}
