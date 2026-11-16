"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormStatus } from "@/components/ui/feedback";
import { LocationRowActions } from "./location-row-actions";

type ChainOption = { id: string; title: string };

export type BulkLocationRow = {
  id: string;
  chainTitle: string | null;
  sourceTitle: string;
  city: string | null;
  adress: string | null;
  assortmentMode: string;
  mapLayerId: string | null;
  status: string;
  latitude: number;
  longitude: number;
};

const CUSTOM_VALUE = "__custom__";

function actorHeader(): HeadersInit {
  const actor =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("gletcher_staff_actor") || "staff"
      : "staff";
  return { "content-type": "application/json", "x-staff-actor": actor };
}

type Panel = null | "chain" | "city";

export function LocationsBulkTable({
  items,
  chains,
}: {
  items: BulkLocationRow[];
  chains: ChainOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [chainMode, setChainMode] = useState("");
  const [customChain, setCustomChain] = useState("");
  const [cityValue, setCityValue] = useState("");

  const pageIds = useMemo(() => items.map((r) => r.id), [items]);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = pageIds.some((id) => selected.has(id));
  const selectedCount = selected.size;

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setPanel(null);
    setError(null);
    setInfo(null);
  }

  async function runBulk(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/staff/retail/locations/bulk", {
        method: "POST",
        headers: actorHeader(),
        body: JSON.stringify({
          ...body,
          locationIds: [...selected],
          syncGeoJson: true,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        processed?: number;
        failed?: number;
        results?: Array<{ ok: boolean; geoJsonWarning?: string; message?: string }>;
      };
      if (!res.ok || !json.ok) {
        setError(json.message || "Не удалось выполнить действие");
        return;
      }
      const warnings = (json.results || [])
        .map((r) => r.geoJsonWarning)
        .filter(Boolean);
      const failMsg = (json.results || [])
        .filter((r) => !r.ok)
        .map((r) => r.message)
        .filter(Boolean)[0];
      const parts = [
        `Готово: ${json.processed ?? 0}`,
        json.failed ? `ошибок: ${json.failed}` : null,
        failMsg ? `(${failMsg})` : null,
      ].filter(Boolean);
      setInfo(parts.join(" · "));
      if (warnings.length) {
        setInfo((prev) => `${prev} · GeoJSON: ${warnings[0]}`);
      }
      setPanel(null);
      setSelected(new Set());
      router.refresh();
    } catch {
      setError("Сеть/сервер недоступны");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (
      !window.confirm(
        `Удалить ${selectedCount} точек из CRM и локального GeoJSON?`,
      )
    ) {
      return;
    }
    await runBulk({ action: "delete" });
  }

  async function onSetChain(e: React.FormEvent) {
    e.preventDefault();
    if (!chainMode) {
      setError("Выберите сеть");
      return;
    }
    if (chainMode === CUSTOM_VALUE) {
      if (!customChain.trim()) {
        setError("Введите название сети");
        return;
      }
      await runBulk({ action: "set_chain", chainTitle: customChain.trim() });
      return;
    }
    await runBulk({ action: "set_chain", chainId: chainMode });
  }

  async function onSetCity(e: React.FormEvent) {
    e.preventDefault();
    await runBulk({ action: "set_city", city: cityValue });
  }

  return (
    <div className="overflow-auto bg-white">
      {selectedCount > 0 ? (
        <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-gletcher-navy/10 bg-gletcher-ice/95 px-3 py-2 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gletcher-navy">
              Выбрано: {selectedCount}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setPanel(panel === "chain" ? null : "chain");
                setError(null);
              }}
              className="rounded-full border border-gletcher-navy/20 bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-gletcher-navy uppercase disabled:opacity-50"
            >
              Сеть
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setPanel(panel === "city" ? null : "city");
                setError(null);
              }}
              className="rounded-full border border-gletcher-navy/20 bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-gletcher-navy uppercase disabled:opacity-50"
            >
              Город
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="rounded-full border border-gletcher-red/40 bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-gletcher-red uppercase disabled:opacity-50"
            >
              Удалить
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={clearSelection}
              className="text-[11px] text-gletcher-navy/60 underline-offset-2 hover:underline"
            >
              Снять выбор
            </button>
          </div>

          {panel === "chain" ? (
            <form
              onSubmit={onSetChain}
              className="flex flex-wrap items-end gap-2 rounded-lg border border-gletcher-navy/10 bg-white p-2"
            >
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-[11px] font-semibold text-gletcher-navy">
                Новая сеть
                <select
                  className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
                  value={chainMode}
                  onChange={(e) => setChainMode(e.target.value)}
                  required
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
                <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-[11px] font-semibold text-gletcher-navy">
                  Название
                  <input
                    value={customChain}
                    onChange={(e) => setCustomChain(e.target.value)}
                    className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
                    placeholder="Новая сеть"
                    required
                  />
                </label>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-gletcher-red px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white uppercase disabled:opacity-60"
              >
                {busy ? "…" : "Применить"}
              </button>
            </form>
          ) : null}

          {panel === "city" ? (
            <form
              onSubmit={onSetCity}
              className="flex flex-wrap items-end gap-2 rounded-lg border border-gletcher-navy/10 bg-white p-2"
            >
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-[11px] font-semibold text-gletcher-navy">
                Город для выбранных
                <input
                  value={cityValue}
                  onChange={(e) => setCityValue(e.target.value)}
                  className="rounded-lg border border-gletcher-navy/20 px-2 py-1.5 font-normal"
                  placeholder="Москва (пусто — очистить)"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-gletcher-red px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white uppercase disabled:opacity-60"
              >
                {busy ? "…" : "Применить"}
              </button>
            </form>
          ) : null}

          {error ? (
            <FormStatus tone="error" role="alert">
              {error}
            </FormStatus>
          ) : null}
          {info ? (
            <FormStatus tone="info" role="status">
              {info}
            </FormStatus>
          ) : null}
        </div>
      ) : null}

      <table className="min-w-full text-left text-xs text-gletcher-navy">
        <thead className="bg-gletcher-ice/80 text-[10px] tracking-wider uppercase">
          <tr>
            <th className="w-8 px-2 py-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={toggleAll}
                aria-label="Выбрать все на странице"
                className="accent-gletcher-red"
              />
            </th>
            <th className="px-3 py-2 font-bold">Сеть</th>
            <th className="px-3 py-2 font-bold">Город</th>
            <th className="px-3 py-2 font-bold">Адрес</th>
            <th className="px-3 py-2 font-bold">SKU</th>
            <th className="px-3 py-2 font-bold">Слой</th>
            <th className="px-3 py-2 font-bold">Статус</th>
            <th className="px-3 py-2 font-bold">Координаты</th>
            <th className="px-3 py-2 font-bold text-right"> </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const checked = selected.has(row.id);
            return (
              <tr
                key={row.id}
                className={`border-t border-gletcher-navy/10 align-middle ${
                  checked ? "bg-gletcher-red/5" : ""
                }`}
              >
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOne(row.id)}
                    aria-label={`Выбрать ${row.adress || row.sourceTitle}`}
                    className="accent-gletcher-red"
                  />
                </td>
                <td className="px-3 py-2 font-semibold">
                  {row.chainTitle || row.sourceTitle}
                </td>
                <td className="px-3 py-2">{row.city || "—"}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/staff/map/locations/${row.id}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {row.adress || "—"}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {row.assortmentMode === "override" ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                      override
                    </span>
                  ) : (
                    <span className="text-gletcher-navy/50">inherit</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-[10px]">
                  {row.mapLayerId || "—"}
                </td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2 font-mono text-[10px]">
                  {row.latitude.toFixed(5)}, {row.longitude.toFixed(5)}
                </td>
                <td className="px-2 py-1.5">
                  <LocationRowActions
                    locationId={row.id}
                    label={row.adress || row.sourceTitle}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
