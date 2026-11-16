"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/feedback";
import { LK_AGENT_VENUE_TYPES, LK_COPY } from "@/content/members-lk";
import { MAX_OPEN_AGENT_APPLICATIONS } from "@/lib/loyalty/agent-application-status";
import type { LkAgentApplicationRow } from "./types";
import styles from "./agent-form.module.css";

export function LkAgentForm({
  defaultCity,
  defaultPhone,
  applications,
}: {
  defaultCity?: string;
  defaultPhone?: string;
  applications: LkAgentApplicationRow[];
}) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const openCount = applications.filter(
    (a) => a.status !== "approved" && a.status !== "rejected",
  ).length;
  const canSubmit = openCount < MAX_OPEN_AGENT_APPLICATIONS;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
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
          json.code === "open_limit_reached"
            ? LK_COPY.agentOpenLimit
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
    <div className={styles.wrap}>
      {applications.length > 0 ? (
        <div className={styles.listBlock}>
          <h3 className={styles.listTitle}>{LK_COPY.agentListTitle}</h3>
          <ul className={styles.list}>
            {applications.map((app) => (
              <li key={app.id} className={styles.listItem}>
                <p>
                  {LK_COPY.agentPending
                    .replace("{venue}", app.venueName)
                    .replace("{status}", app.statusLabel || app.status)}
                </p>
                {app.publicNote ? (
                  <p className={styles.note}>
                    {LK_COPY.agentPublicNote.replace("{note}", app.publicNote)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.listEmpty}>{LK_COPY.agentListEmpty}</p>
      )}

      {canSubmit ? (
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
      ) : (
        <p className={styles.pending}>{LK_COPY.agentOpenLimit}</p>
      )}
    </div>
  );
}
