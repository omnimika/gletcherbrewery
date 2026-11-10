"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/feedback";
import { LK_BUY_PLACES, LK_INFO_COPY } from "@/content/members-lk";
import styles from "./panel.module.css";

export function LkCheckPanel({ defaultCity }: { defaultCity?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const place = String(data.get("venueNetwork") || "");
    const other = String(data.get("venueName") || "").trim();
    if (place && place !== "Другой") {
      data.set("venueName", place);
    } else if (!other) {
      setMessage("Укажите название места для «Другой»");
      return;
    }
    setMessage(null);
    setOk(false);
    start(async () => {
      const res = await fetch("/api/loyalty/receipts", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        code?: string;
        receipt?: { proposedEarn?: number };
      };
      if (!res.ok || !json.ok) {
        setMessage(
          json.code === "duplicate_receipt"
            ? "Этот чек уже загружен"
            : json.code === "invalid_sum"
              ? "Укажите сумму только по продукции Gletcher"
              : (json.code ?? `Ошибка ${res.status}`),
        );
        return;
      }
      setOk(true);
      setMessage(
        `Спасибо! Баллы будут начислены после проверки` +
          (json.receipt?.proposedEarn != null
            ? ` · ориентир ${json.receipt.proposedEarn} ₿`
            : ""),
      );
      form.reset();
      router.refresh();
    });
  }

  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <h2 className={styles.h2}>{LK_INFO_COPY.checkTitle}</h2>
        <p className={styles.body}>{LK_INFO_COPY.checkBody}</p>

        <form onSubmit={onSubmit} className={styles.form}>
          <Field id="lk-photo" label="Приложить фото чека">
            <input
              id="lk-photo"
              name="photo"
              type="file"
              accept="image/*"
              capture="environment"
              className={styles.file}
            />
          </Field>
          <Field
            id="lk-sum"
            label="Сумма покупки (только Gletcher), ₽"
          >
            <TextInput
              id="lk-sum"
              name="gletcherSumRub"
              type="number"
              min={0}
              step="0.01"
              required
            />
          </Field>
          <div className={styles.grid2}>
            <Field id="lk-city" label="Город покупки">
              <TextInput
                id="lk-city"
                name="city"
                required
                defaultValue={defaultCity ?? ""}
                placeholder="Москва"
              />
            </Field>
            <Field id="lk-date" label="Дата покупки">
              <TextInput id="lk-date" name="purchaseAt" type="date" required />
            </Field>
          </div>
          <Field id="lk-place" label="Место покупки">
            <select
              id="lk-place"
              name="venueNetwork"
              required
              className={styles.select}
              defaultValue=""
            >
              <option value="" disabled>
                Выбрать…
              </option>
              {LK_BUY_PLACES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="lk-venue-other"
            label="Если «Другой» — название места"
          >
            <TextInput id="lk-venue-other" name="venueName" />
          </Field>
          <Field
            id="lk-qr"
            label="QR-строка (необязательно)"
            help="Если фото есть — попробуем прочитать сами"
          >
            <TextInput
              id="lk-qr"
              name="qrPayload"
              className="font-mono text-xs"
              placeholder="t=…&s=…&fn=…&i=…&fp=…&n=1"
            />
          </Field>
          <Button type="submit" loading={pending} className="w-full sm:w-auto">
            {pending ? "Отправка…" : "Зарегистрировать покупку"}
          </Button>
          {message ? (
            <FormStatus tone={ok ? "info" : "error"}>{message}</FormStatus>
          ) : null}
        </form>
      </section>
    </div>
  );
}
