"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/feedback";
import { LK_BUY_PLACES } from "@/content/members-lk";
import { PhotoDropzone } from "./photo-dropzone";
import styles from "./upload-form.module.css";

export function LkUploadForm({ defaultCity }: { defaultCity?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const place = String(data.get("venueNetwork") || "");
    const other = String(data.get("venueName") || "").trim();
    const photo = data.get("photo");
    const hasPhoto =
      photo != null &&
      typeof photo !== "string" &&
      "size" in photo &&
      (photo as File).size > 0;
    if (!hasPhoto) {
      setMessage("Добавьте фото чека (клик или drag-and-drop)");
      setOk(false);
      return;
    }
    if (place && place !== "Другой") {
      data.set("venueName", place);
    } else if (!other) {
      setMessage("Укажите название места для «Другой»");
      setOk(false);
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
        `Отправлено на проверку` +
          (json.receipt?.proposedEarn != null
            ? ` · ориентир ${json.receipt.proposedEarn} ₿`
            : ""),
      );
      form.reset();
      setPhotoVersion((v) => v + 1);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Field
        id="lk-photo"
        label="Фото чека"
        help="Желательно с читаемым QR — клик или перетащите в область"
      >
        <PhotoDropzone key={photoVersion} name="photo" />
      </Field>
      <Field id="lk-sum" label="Сумма только Gletcher, ₽">
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
        <Field id="lk-city" label="Город">
          <TextInput
            id="lk-city"
            name="city"
            required
            defaultValue={defaultCity ?? ""}
          />
        </Field>
        <Field id="lk-date" label="Дата покупки">
          <TextInput id="lk-date" name="purchaseAt" type="date" required />
        </Field>
      </div>
      <Field id="lk-place" label="Сеть / место">
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
      <Field id="lk-venue-other" label="Если «Другой» — название">
        <TextInput id="lk-venue-other" name="venueName" />
      </Field>
      <Field
        id="lk-qr"
        label="QR-строка"
        help="Необязательно — с фото попробуем прочитать сами"
      >
        <TextInput
          id="lk-qr"
          name="qrPayload"
          className="font-mono text-xs"
          placeholder="t=…&fn=…&i=…&fp=…"
        />
      </Field>
      <Button type="submit" loading={pending}>
        {pending ? "Отправка…" : "Отправить на проверку"}
      </Button>
      {message ? (
        <FormStatus tone={ok ? "info" : "error"}>{message}</FormStatus>
      ) : null}
    </form>
  );
}
