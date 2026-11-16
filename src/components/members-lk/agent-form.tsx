"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/feedback";
import { LK_AGENT_VENUE_TYPES, LK_COPY } from "@/content/members-lk";
import type { LkAgentApplicationRow } from "./types";
import styles from "./agent-form.module.css";

export function LkAgentForm({
  defaultCity,
  defaultPhone,
  pending,
}: {
  defaultCity?: string;
  defaultPhone?: string;
  pending: LkAgentApplicationRow | null;
}) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  if (pending) {
    return (
      <div className={styles.pending}>
        <p>
          {LK_COPY.agentPending
            .replace("{venue}", pending.venueName)
            .replace(
              "{status}",
              pending.statusLabel || pending.status,
            )}
        </p>
        {pending.publicNote ? (
          <p className={styles.note}>
            {LK_COPY.agentPublicNote.replace("{note}", pending.publicNote)}
          </p>
        ) : null}
      </div>
    );
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setMessage(null);
    setOk(false);
    start(async () => {
      const res = await fetch("/api/loyalty/agent-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: String(data.get("phone") || ""),
          city: String(data.get("city") || ""),
          venueName: String(data.get("venueName") || ""),
          venueType: String(data.get("venueType") || ""),
          venueAddress: String(data.get("venueAddress") || ""),
          venueBoss: String(data.get("venueBoss") || ""),
          comment: String(data.get("comment") || ""),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; code?: string };
      if (!res.ok || !json.ok) {
        setMessage(
          json.code === "already_pending"
            ? LK_COPY.agentAlreadyPending
            : (json.code ?? `Ошибка ${res.status}`),
        );
        return;
      }
      setOk(true);
      setMessage(LK_COPY.agentSuccess);
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.grid2}>
        <Field id="ag-phone" label="Телефон">
          <TextInput
            id="ag-phone"
            name="phone"
            type="tel"
            required
            defaultValue={defaultPhone ?? ""}
          />
        </Field>
        <Field id="ag-city" label="Город">
          <TextInput
            id="ag-city"
            name="city"
            required
            defaultValue={defaultCity ?? ""}
          />
        </Field>
      </div>
      <Field id="ag-venue" label="Название заведения">
        <TextInput id="ag-venue" name="venueName" required />
      </Field>
      <div className={styles.grid2}>
        <Field id="ag-type" label="Тип заведения">
          <select
            id="ag-type"
            name="venueType"
            required
            className={styles.select}
            defaultValue=""
          >
            <option value="" disabled>
              Выбрать…
            </option>
            {LK_AGENT_VENUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field id="ag-boss" label="Контакт / босс">
          <TextInput id="ag-boss" name="venueBoss" />
        </Field>
      </div>
      <Field id="ag-address" label="Адрес">
        <TextInput id="ag-address" name="venueAddress" required />
      </Field>
      <Field id="ag-comment" label="Комментарий">
        <TextInput id="ag-comment" name="comment" />
      </Field>
      <Button type="submit" loading={busy}>
        {busy ? "Отправка…" : LK_COPY.agentSubmit}
      </Button>
      {message ? (
        <FormStatus tone={ok ? "info" : "error"}>{message}</FormStatus>
      ) : null}
    </form>
  );
}
