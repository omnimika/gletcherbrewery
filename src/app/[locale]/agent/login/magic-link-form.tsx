"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/control-recipe";
import { Field, TextInput } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/feedback";

export function MagicLinkLoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [debugUrl, setDebugUrl] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [sendFailed, setSendFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    setDebugUrl(null);
    setDelivery(null);
    setInfo(null);
    setSendFailed(false);
    try {
      const res = await fetch("/api/loyalty/auth/request-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        code?: string;
        verifyUrl?: string;
        delivery?: string;
        message?: string;
        sendError?: boolean;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(
          data.code === "invalid_email"
            ? "Проверьте формат email"
            : "Не удалось создать ссылку. Попробуйте позже.",
        );
        return;
      }
      setStatus("sent");
      setDelivery(data.delivery ?? null);
      setInfo(data.message ?? null);
      setSendFailed(Boolean(data.sendError));
      if (data.verifyUrl) setDebugUrl(data.verifyUrl);
    } catch {
      setStatus("error");
      setError("Сеть недоступна. Попробуйте позже.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <Field id="member-email" label="Email">
        <TextInput
          id="member-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Button type="submit" loading={status === "loading"} className="w-full">
        {status === "loading" ? "Создаём ссылку…" : "Получить ссылку"}
      </Button>
      {status === "sent" && delivery === "debug" ? (
        <div className="space-y-3 rounded-[var(--radius-card)] border border-gletcher-navy/25 bg-gletcher-frost p-4">
          <p className="type-body-small text-gletcher-navy">
            Локальный debug: письмо не отправляется. Откройте ссылку ниже
            (действует ~20 минут).
          </p>
          {debugUrl ? (
            <a
              href={debugUrl}
              className={controlClassName("brand", "md", "w-full sm:w-auto")}
            >
              Войти по ссылке
            </a>
          ) : null}
          {debugUrl ? (
            <p className="type-caption break-all text-gletcher-navy/60">
              {debugUrl}
            </p>
          ) : null}
        </div>
      ) : null}
      {status === "sent" && delivery === "none" ? (
        <FormStatus tone="info">
          {info ??
            "Ссылка создана, но SMTP/Postbox ещё не настроен — письмо не уйдёт."}
        </FormStatus>
      ) : null}
      {status === "sent" && delivery === "smtp" ? (
        <FormStatus tone={sendFailed ? "error" : "info"}>
          {info ?? "Если email верный, проверьте почту (и спам)."}
        </FormStatus>
      ) : null}
      {error ? <FormStatus tone="error">{error}</FormStatus> : null}
    </form>
  );
}
