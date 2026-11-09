"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
        window.sessionStorage.setItem("gletcher_staff_actor", actor.trim() || "staff");
      }
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-6"
    >
      <h1 className="text-lg font-semibold">Вход в staff CRM</h1>
      <p className="text-sm text-zinc-400">
        Токен из <code className="text-zinc-300">STAFF_API_TOKEN</code> (server-only).
        Правки идут через audited API, не через NocoDB write.
      </p>
      <label className="block space-y-1 text-sm">
        <span className="text-zinc-400">Имя исполнителя (для audit)</span>
        <input
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          autoComplete="username"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-zinc-400">Staff API token</span>
        <input
          type="password"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
      >
        {pending ? "…" : "Войти"}
      </button>
    </form>
  );
}
