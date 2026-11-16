"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CONTACTS_PAGE } from "@/content/contacts";
import { POLICY_PATH } from "@/content/policy";
import {
  CONTACTS_CONSENT_POLICY_VERSION,
  CONTACTS_FORM_ID,
  CONTACTS_SCHEMA_VERSION,
} from "@/content/forms/contacts-contract";

type Status = "idle" | "pending" | "accepted" | "error" | "unavailable";

function ensureIdempotencyKey(storageKey: string): string {
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
    return key;
  } catch {
    return crypto.randomUUID();
  }
}

export function ContactsForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const f = CONTACTS_PAGE.fields;
  const office = CONTACTS_PAGE.phones[0];
  const email = CONTACTS_PAGE.emails[0];
  const formDomId = useId();
  const idempotencyStorageKey = `contacts-idempotency:${formDomId}`;
  const submittingRef = useRef(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (!form.reportValidity()) {
      setStatus("error");
      setErrorMessage(CONTACTS_PAGE.error);
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("pending");
    setErrorMessage(null);

    const data = new FormData(form);
    const fields = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      city: String(data.get("city") ?? ""),
      company: String(data.get("company") ?? ""),
      comment: String(data.get("comment") ?? ""),
    };

    const idempotencyKey = ensureIdempotencyKey(idempotencyStorageKey);

    try {
      const res = await fetch("/api/forms/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaVersion: CONTACTS_SCHEMA_VERSION,
          formId: CONTACTS_FORM_ID,
          locale: "ru",
          sourcePath: "/contacts",
          placement: "contacts_page",
          idempotencyKey,
          fields,
          consent: {
            accepted: true,
            policyVersion: CONTACTS_CONSENT_POLICY_VERSION,
          },
        }),
      });

      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        submissionId?: string;
        code?: string;
        message?: string;
      } | null;

      if (res.status === 202 && json?.ok && json.submissionId) {
        setSubmissionId(json.submissionId);
        setStatus("accepted");
        try {
          sessionStorage.removeItem(idempotencyStorageKey);
        } catch {
          /* ignore */
        }
        return;
      }

      if (res.status === 503) {
        setStatus("unavailable");
        setErrorMessage(json?.message ?? CONTACTS_PAGE.unavailable);
        return;
      }

      setStatus("error");
      setErrorMessage(json?.message ?? CONTACTS_PAGE.error);
    } catch {
      // Network error — keep input, honest failure (not accepted).
      setStatus("unavailable");
      setErrorMessage(CONTACTS_PAGE.networkError);
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <form
      className="space-y-4 border border-gletcher-navy/20 bg-gletcher-white p-5 sm:p-7"
      onSubmit={onSubmit}
      noValidate
      aria-label={CONTACTS_PAGE.formTitle}
      aria-busy={status === "pending"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["name", f.name, "text", true],
            ["email", f.email, "email", true],
            ["phone", f.phone, "tel", true],
            ["city", f.city, "text", false],
            ["company", f.company, "text", false],
          ] as const
        ).map(([name, placeholder, type, required]) => (
          <label key={name} className="block">
            <span className="sr-only">{placeholder}</span>
            <input
              name={name}
              type={type}
              placeholder={placeholder}
              required={required}
              disabled={status === "pending" || status === "accepted"}
              className="w-full rounded-lg border border-gletcher-navy/30 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy disabled:opacity-70"
            />
          </label>
        ))}
      </div>
      <label className="block">
        <span className="sr-only">{f.comment}</span>
        <textarea
          name="comment"
          placeholder={f.comment}
          rows={4}
          disabled={status === "pending" || status === "accepted"}
          className="w-full resize-y rounded-lg border border-gletcher-navy/30 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy disabled:opacity-70"
        />
      </label>
      <p className="text-xs text-gletcher-navy/60">
        Отправляя форму, вы соглашаетесь с{" "}
        <a
          href={POLICY_PATH}
          className="underline decoration-gletcher-red underline-offset-2"
        >
          политикой обработки персональных данных
        </a>
        .
      </p>
      <Button
        type="submit"
        variant="primary"
        className="w-full sm:w-auto"
        disabled={status === "pending" || status === "accepted"}
      >
        {status === "pending" ? CONTACTS_PAGE.pending : CONTACTS_PAGE.submit}
      </Button>
      <p className="text-xs text-gletcher-navy/60">{CONTACTS_PAGE.note}</p>
      {status === "accepted" && submissionId ? (
        <p className="text-sm text-gletcher-navy" role="status">
          {CONTACTS_PAGE.accepted}{" "}
          <span className="font-mono text-xs">{submissionId}</span>
        </p>
      ) : null}
      {status === "unavailable" ? (
        <p className="text-sm text-gletcher-navy" role="status">
          {errorMessage ?? CONTACTS_PAGE.unavailable}{" "}
          <a href={office.href} className="underline underline-offset-2">
            {office.phone}
          </a>
          {" · "}
          <a href={email.href} className="underline underline-offset-2">
            {email.address}
          </a>
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-gletcher-red" role="alert">
          {errorMessage ?? CONTACTS_PAGE.error}
        </p>
      ) : null}
    </form>
  );
}
