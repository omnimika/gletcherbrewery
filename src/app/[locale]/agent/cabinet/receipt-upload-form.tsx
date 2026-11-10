"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/feedback";

export function ReceiptUploadForm({ defaultCity }: { defaultCity?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
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
        receipt?: { proposedEarn?: number; status?: string };
        ocr?: { eligibleSum?: number | null } | null;
      };
      if (!res.ok || !json.ok) {
        setMessage(
          json.code === "duplicate_receipt"
            ? "Этот чек уже загружен"
            : json.code === "invalid_sum"
              ? "Укажите сумму Gletcher или загрузите фото с читаемыми строками"
              : json.code === "invalid_venue"
                ? "Укажите сеть или место покупки"
                : (json.code ?? `Ошибка ${res.status}`),
        );
        return;
      }
      setOk(true);
      setMessage(
        `Чек отправлен на проверку` +
          (json.receipt?.proposedEarn != null
            ? ` · ориентир ${json.receipt.proposedEarn} ₿`
            : "") +
          (json.ocr?.eligibleSum
            ? ` · OCR ${json.ocr.eligibleSum} ₽`
            : ""),
      );
      form.reset();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 space-y-4 rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-white p-5"
    >
      <div>
        <h2 className="font-display text-lg font-extrabold tracking-wide text-gletcher-navy uppercase">
          Загрузить чек
        </h2>
        <p className="type-caption mt-2 text-gletcher-navy/65">
          Фото чека (желательно), сумма только по товарам Gletcher, город, дата и
          место. Биркоины начислятся после проверки.
        </p>
      </div>

      <Field
        id="photo"
        label="Фото чека"
        help="С телефона удобнее снимать сразу в форму"
      >
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          capture="environment"
          className="block w-full text-sm text-gletcher-navy file:mr-3 file:rounded-[var(--radius-control)] file:border file:border-gletcher-navy file:bg-gletcher-frost file:px-3 file:py-1.5"
        />
      </Field>

      <Field
        id="gletcherSumRub"
        label="Сумма только Gletcher (₽)"
        help="Если авто-разбор не сработает — укажите вручную"
      >
        <TextInput
          id="gletcherSumRub"
          name="gletcherSumRub"
          type="number"
          min={0}
          step="0.01"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="city" label="Город">
          <TextInput
            id="city"
            name="city"
            required
            defaultValue={defaultCity ?? ""}
          />
        </Field>
        <Field id="purchaseAt" label="Дата покупки">
          <TextInput id="purchaseAt" name="purchaseAt" type="date" required />
        </Field>
        <Field id="venueNetwork" label="Сеть">
          <TextInput
            id="venueNetwork"
            name="venueNetwork"
            placeholder="Лента / …"
          />
        </Field>
        <Field id="venueName" label="Магазин / бар">
          <TextInput id="venueName" name="venueName" required />
        </Field>
      </div>

      <Field
        id="qrPayload"
        label="QR-строка (если уже считали)"
        help="Необязательно — с фото попробуем прочитать сами"
      >
        <TextInput
          id="qrPayload"
          name="qrPayload"
          placeholder="t=…&s=…&fn=…&i=…&fp=…&n=1"
          className="font-mono text-xs"
        />
      </Field>

      <Button type="submit" loading={pending} className="w-full sm:w-auto">
        {pending ? "Отправка…" : "Отправить на проверку"}
      </Button>
      {message ? (
        <FormStatus tone={ok ? "info" : "error"}>{message}</FormStatus>
      ) : null}
    </form>
  );
}
