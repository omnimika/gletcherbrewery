"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/feedback";
import { CABINET_BUY_PLACE_OTHER } from "@/content/cabinet";
import { PhotoDropzone } from "./photo-dropzone";
import styles from "./upload-form.module.css";

export function CabinetUploadForm({
  defaultCity,
  buyPlaces,
}: {
  defaultCity?: string;
  buyPlaces: readonly string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [place, setPlace] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const selected = String(data.get("venueNetwork") || "");
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
    if (selected && selected !== CABINET_BUY_PLACE_OTHER) {
      data.set("venueName", selected);
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
      setPlace("");
      setPhotoVersion((v) => v + 1);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Field
        id="cabinet-photo"
        label="Фото чека"
        help="Желательно с читаемым QR — клик или перетащите в область"
      >
        <PhotoDropzone key={photoVersion} name="photo" />
      </Field>
      <Field id="cabinet-sum" label="Сумма только Gletcher, ₽">
        <TextInput
          id="cabinet-sum"
          name="gletcherSumRub"
          type="number"
          min={0}
          step="0.01"
          required
        />
      </Field>
      <div className={styles.grid2}>
        <Field id="cabinet-city" label="Город">
          <TextInput
            id="cabinet-city"
            name="city"
            required
            defaultValue={defaultCity ?? ""}
          />
        </Field>
        <Field id="cabinet-date" label="Дата покупки">
          <TextInput id="cabinet-date" name="purchaseAt" type="date" required />
        </Field>
      </div>
      <Field
        id="cabinet-place"
        label="Сеть / место"
        help="Сети с карты продаж, фирменные магазины или «Другой»"
      >
        <select
          id="cabinet-place"
          name="venueNetwork"
          required
          className={styles.select}
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        >
          <option value="" disabled>
            Выбрать…
          </option>
          {buyPlaces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      {place === CABINET_BUY_PLACE_OTHER ? (
        <Field id="cabinet-venue-other" label="Название места">
          <TextInput id="cabinet-venue-other" name="venueName" required />
        </Field>
      ) : (
        <input type="hidden" name="venueName" value="" />
      )}
      <Field
        id="cabinet-qr"
        label="QR-строка"
        help="Необязательно — с фото попробуем прочитать сами"
      >
        <TextInput
          id="cabinet-qr"
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
