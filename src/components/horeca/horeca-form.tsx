"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { HORECA_PAGE } from "@/content/horeca";
import { POLICY_PATH } from "@/content/policy";

type Status = "idle" | "ok" | "error";

export function HorecaForm() {
  const [status, setStatus] = useState<Status>("idle");
  const policyHref = POLICY_PATH;
  const f = HORECA_PAGE.fields;

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

  return (
    <form
      className="space-y-4 border border-gletcher-red/40 bg-gletcher-white p-5 sm:p-7"
      onSubmit={onSubmit}
      noValidate
      aria-label={HORECA_PAGE.formTitle}
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
              className="w-full rounded-lg border border-gletcher-red/50 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
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
          className="w-full resize-y rounded-lg border border-gletcher-red/50 bg-gletcher-white px-4 py-3 text-sm outline-none focus:border-gletcher-navy"
        />
      </label>
      <label className="flex items-start gap-3 text-sm text-gletcher-navy">
        <input
          type="checkbox"
          name="policy"
          required
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
      <Button type="submit" variant="primary" className="w-full sm:w-auto">
        {HORECA_PAGE.submit}
      </Button>
      <p className="text-xs text-gletcher-navy/60">{HORECA_PAGE.note}</p>
      {status === "ok" ? (
        <p className="text-sm text-gletcher-navy" role="status">
          {HORECA_PAGE.success}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-gletcher-red" role="alert">
          {HORECA_PAGE.error}
        </p>
      ) : null}
    </form>
  );
}
