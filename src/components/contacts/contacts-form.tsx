"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CONTACTS_PAGE } from "@/content/contacts";
import { POLICY_PATH } from "@/content/policy";

type Status = "idle" | "unavailable" | "error";

export function ContactsForm() {
  const [status, setStatus] = useState<Status>("idle");
  const f = CONTACTS_PAGE.fields;
  const office = CONTACTS_PAGE.phones[0];
  const email = CONTACTS_PAGE.emails[0];

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
      className="space-y-4 border border-gletcher-navy/20 bg-gletcher-white p-5 sm:p-7"
      onSubmit={onSubmit}
      noValidate
      aria-label={CONTACTS_PAGE.formTitle}
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
              className="w-full rounded-lg border border-gletcher-navy/30 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
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
          className="w-full resize-y rounded-lg border border-gletcher-navy/30 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
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
      <Button type="submit" variant="primary" className="w-full sm:w-auto">
        {CONTACTS_PAGE.submit}
      </Button>
      <p className="text-xs text-gletcher-navy/60">{CONTACTS_PAGE.note}</p>
      {status === "unavailable" ? (
        <p className="text-sm text-gletcher-navy" role="status">
          {CONTACTS_PAGE.unavailable}{" "}
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
          {CONTACTS_PAGE.error}
        </p>
      ) : null}
    </form>
  );
}
