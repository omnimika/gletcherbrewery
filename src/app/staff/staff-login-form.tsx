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
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
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
        body: JSON.stringify({ email, token }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Ошибка входа");
        return;
      }
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("gletcher_staff_actor");
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
          Email из staff allowlist + bootstrap{" "}
          <code className="rounded bg-gletcher-frost px-1.5 py-0.5 text-xs">
            STAFF_API_TOKEN
          </code>
          . Сессия серверная; audit пишет ваш email, не произвольное имя.
        </p>
        <form id="staff-login" onSubmit={onSubmit} className="space-y-4">
          <Field id="staff-email" label="Email" help="Должен быть в staff_users">
            <TextInput
              id="staff-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
