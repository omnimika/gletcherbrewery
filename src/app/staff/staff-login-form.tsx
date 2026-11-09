"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CardActions,
  CardBody,
  CardHeading,
  CardShell,
} from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/feedback";

export function StaffLoginForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [actor, setActor] = useState("staff");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/staff/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Ошибка входа");
        return;
      }
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "gletcher_staff_actor",
          actor.trim() || "staff",
        );
      }
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  return (
    <CardShell className="mx-auto max-w-md bg-gletcher-white" emphasis>
      <CardHeading as="h2" className="font-display text-2xl uppercase tracking-wide">
        Вход в Staff CRM
      </CardHeading>
      <CardBody className="space-y-4 !text-gletcher-navy">
        <p>
          Токен из{" "}
          <code className="rounded bg-gletcher-frost px-1.5 py-0.5 text-xs">
            STAFF_API_TOKEN
          </code>
          . Правки заявок идут через audited API, NocoDB остаётся только для
          просмотра.
        </p>
        <form id="staff-login" onSubmit={onSubmit} className="space-y-4">
          <Field
            id="staff-actor"
            label="Имя исполнителя"
            help="Попадёт в audit-события"
          >
            <TextInput
              id="staff-actor"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              autoComplete="username"
              required
            />
          </Field>
          <Field id="staff-token" label="Staff API token" error={error ?? undefined}>
            <TextInput
              id="staff-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="current-password"
              required
              invalid={Boolean(error)}
            />
          </Field>
        </form>
        {error ? (
          <FormStatus tone="error" role="alert">
            {error}
          </FormStatus>
        ) : null}
      </CardBody>
      <CardActions>
        <Button
          type="submit"
          form="staff-login"
          variant="secondary"
          loading={pending}
          disabled={pending}
        >
          Войти
        </Button>
      </CardActions>
    </CardShell>
  );
}
