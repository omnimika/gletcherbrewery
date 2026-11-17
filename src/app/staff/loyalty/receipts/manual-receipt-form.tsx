"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { CABINET_BUY_PLACE_OTHER } from "@/content/cabinet";

export function ManualReceiptForm({
  buyPlaces,
}: {
  buyPlaces: readonly string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [place, setPlace] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setMessage(null);
    start(async () => {
      const res = await fetch("/api/staff/loyalty/receipts", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        code?: string;
        receipt?: { proposedEarn?: number };
      };
      if (!res.ok || !json.ok) {
        setMessage(json.code ?? `Ошибка ${res.status}`);
        return;
      }
      setMessage(
        `Создано · pending_staff · earn ${json.receipt?.proposedEarn ?? "?"}₿`,
      );
      form.reset();
      setPlace("");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-white p-4 md:grid-cols-2"
    >
      <h2 className="font-display text-lg font-extrabold tracking-wide uppercase md:col-span-2">
        Ручной чек (fallback)
      </h2>
      <label className="grid gap-1 text-sm">
        Email участника
        <input
          required
          name="email"
          type="email"
          className="rounded border border-gletcher-navy/30 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Сумма Gletcher (₽)
        <input
          required
          name="gletcherSumRub"
          type="number"
          min={0}
          step="0.01"
          className="rounded border border-gletcher-navy/30 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Город
        <input
          required
          name="city"
          className="rounded border border-gletcher-navy/30 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Дата покупки
        <input
          required
          name="purchaseAt"
          type="date"
          className="rounded border border-gletcher-navy/30 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm md:col-span-2">
        Сеть
        <select
          required
          name="venueNetwork"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          className="rounded border border-gletcher-navy/30 px-3 py-2"
        >
          <option value="" disabled>
            Выбрать… (как на карте / в кабинете)
          </option>
          {buyPlaces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      {place === CABINET_BUY_PLACE_OTHER ? (
        <label className="grid gap-1 text-sm md:col-span-2">
          Название места
          <input
            required
            name="venueName"
            placeholder="Свободный ввод"
            className="rounded border border-gletcher-navy/30 px-3 py-2"
          />
        </label>
      ) : (
        <input type="hidden" name="venueName" value="" />
      )}
      <label className="grid gap-1 text-sm md:col-span-2">
        QR payload (опционально)
        <input
          name="qrPayload"
          placeholder="t=…&s=…&fn=…&i=…&fp=…&n=1"
          className="rounded border border-gletcher-navy/30 px-3 py-2 font-mono text-xs"
        />
      </label>
      <label className="grid gap-1 text-sm md:col-span-2">
        Фото чека
        <input name="photo" type="file" accept="image/*" />
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-gletcher-navy bg-gletcher-navy px-4 py-2 text-sm font-semibold tracking-wide text-gletcher-white uppercase disabled:opacity-50"
        >
          Создать в очередь
        </button>
        {message ? (
          <span className="type-caption text-gletcher-navy/70">{message}</span>
        ) : null}
      </div>
      <p className="type-caption text-gletcher-navy/55 md:col-span-2">
        Список сетей = карта + фирменные точки + «Другой». После одобрения — 5%
        в ledger (Оплачено=ДА / verified).
      </p>
    </form>
  );
}
