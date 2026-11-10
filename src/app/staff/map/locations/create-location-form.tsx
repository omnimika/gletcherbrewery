"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormStatus } from "@/components/ui/feedback";

type ChainOption = { id: string; title: string };

const CUSTOM_VALUE = "__custom__";

function actorHeader(): HeadersInit {
  const actor =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("gletcher_staff_actor") || "staff"
      : "staff";
  return { "content-type": "application/json", "x-staff-actor": actor };
}

export function CreateLocationForm({ chains }: { chains: ChainOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [chainMode, setChainMode] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setWarning(null);
    const fd = new FormData(e.currentTarget);
    const selected = String(fd.get("chainSelect") || "");
    const customTitle = String(fd.get("chainTitle") || "").trim();
    const body =
      selected === CUSTOM_VALUE
        ? {
            chainTitle: customTitle,
            city: String(fd.get("city") || ""),
            adress: String(fd.get("adress") || ""),
            type: String(fd.get("type") || ""),
            longitude: Number(fd.get("longitude")),
            latitude: Number(fd.get("latitude")),
            syncGeoJson: true,
          }
        : {
            chainId: selected,
            city: String(fd.get("city") || ""),
            adress: String(fd.get("adress") || ""),
            type: String(fd.get("type") || ""),
            longitude: Number(fd.get("longitude")),
            latitude: Number(fd.get("latitude")),
            syncGeoJson: true,
          };

    if (selected === CUSTOM_VALUE && !customTitle) {
      setError("Введите название сети");
      setBusy(false);
      return;
    }
    if (!selected) {
      setError("Выберите сеть или своё значение");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/staff/retail/locations", {
        method: "POST",
        headers: actorHeader(),
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        locationId?: string;
        geoJson?: { synced?: boolean; warning?: string };
      };
      if (!res.ok || !json.ok || !json.locationId) {
        setError(json.message || "Не удалось создать");
        return;
      }
      if (json.geoJson?.warning) setWarning(json.geoJson.warning);
      setOpen(false);
      setChainMode("");
      router.push(`/staff/map/locations/${json.locationId}`);
      router.refresh();
    } catch {
      setError("Сеть/сервер недоступны");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="rounded-full border border-gletcher-navy/20 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-gletcher-navy uppercase"
        onClick={() => setOpen(true)}
      >
        + Новая точка
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-xl flex-col gap-2 rounded-xl border border-gletcher-navy/15 bg-white p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-gletcher-navy">Новая точка</p>
        <button
          type="button"
          className="text-xs text-gletcher-navy/60 underline-offset-2 hover:underline"
          onClick={() => {
            setOpen(false);
            setChainMode("");
          }}
        >
          Отмена
        </button>
      </div>

      <label className="flex flex-col gap-1 text-xs font-semibold text-gletcher-navy">
        Сеть
        <select
          name="chainSelect"
          required
          className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
          value={chainMode}
          onChange={(e) => setChainMode(e.target.value)}
        >
          <option value="" disabled>
            Выберите сеть
          </option>
          {chains.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
          <option value={CUSTOM_VALUE}>+ Своя сеть…</option>
        </select>
      </label>

      {chainMode === CUSTOM_VALUE ? (
        <label className="flex flex-col gap-1 text-xs font-semibold text-gletcher-navy">
          Название сети
          <input
            name="chainTitle"
            required
            placeholder="Например: Новая сеть"
            className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
          />
          <span className="font-normal text-gletcher-navy/55">
            Если сети ещё нет — создадим в CRM (без Mapbox-слоя, пока не
            подключите).
          </span>
        </label>
      ) : null}

      <label className="flex flex-col gap-1 text-xs font-semibold text-gletcher-navy">
        Адрес
        <input
          name="adress"
          required
          className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-gletcher-navy">
          Город
          <input
            name="city"
            className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-gletcher-navy">
          Тип
          <input
            name="type"
            placeholder="Магазин"
            className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-gletcher-navy">
          Долгота
          <input
            name="longitude"
            type="number"
            step="any"
            required
            className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-gletcher-navy">
          Широта
          <input
            name="latitude"
            type="number"
            step="any"
            required
            className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
          />
        </label>
      </div>

      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}
      {warning ? (
        <FormStatus tone="info" role="status">
          {warning}
        </FormStatus>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-gletcher-red px-3 py-2 text-xs font-semibold tracking-wide text-white uppercase disabled:opacity-60"
      >
        {busy ? "Создаём…" : "Создать"}
      </button>
      <p className="text-[11px] text-gletcher-navy/60">
        Точка попадёт в CRM и в локальный GeoJSON (если слой geojson). На
        публичную /map — после Product publish.
      </p>
    </form>
  );
}
