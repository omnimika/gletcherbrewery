"use client";

import { useState } from "react";
import { FormStatus } from "@/components/ui/feedback";
import type { LocationAssortmentDetail } from "@/server/retail/location-assortment";

function actorHeader(): HeadersInit {
  const actor =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("gletcher_staff_actor") || "staff"
      : "staff";
  return { "content-type": "application/json", "x-staff-actor": actor };
}

export function LocationAssortmentEditor({
  initial,
}: {
  initial: LocationAssortmentDetail;
}) {
  const [detail, setDetail] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setOkMsg(null);
    try {
      const res = await fetch(
        `/api/staff/retail/locations/${detail.id}/assortment`,
        {
          method: "PATCH",
          headers: actorHeader(),
          body: JSON.stringify(body),
        },
      );
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        location?: LocationAssortmentDetail;
      };
      if (!res.ok || !json.ok || !json.location) {
        setError(json.message || "Не удалось сохранить");
        return;
      }
      setDetail(json.location);
      setOkMsg("Сохранено");
    } catch {
      setError("Сеть/сервер недоступны");
    } finally {
      setBusy(false);
    }
  }

  const override = detail.assortmentMode === "override";

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-gletcher-navy/15 bg-white p-4">
        <p className="text-sm font-bold text-gletcher-navy">
          {detail.sourceTitle}
        </p>
        <p className="mt-1 text-xs text-gletcher-navy/70">
          {[detail.city, detail.adress].filter(Boolean).join(" · ") || "—"}
        </p>
        <p className="mt-2 font-mono text-[10px] text-gletcher-navy/50">
          {detail.mapLayerId || "no-layer"} · {detail.sourceKey.slice(0, 48)}…
        </p>
        <p className="mt-2 text-xs text-gletcher-navy/80">
          Product:{" "}
          <span className="font-semibold">
            {detail.effectiveProduct || "(пусто)"}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy || !override}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase ${
            !override
              ? "border-gletcher-red bg-gletcher-red text-white"
              : "border-gletcher-navy/20 bg-white text-gletcher-navy"
          }`}
          onClick={() => patch({ mode: "inherit" })}
        >
          Наследовать сеть
        </button>
        <button
          type="button"
          disabled={busy || override || !detail.chainId}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase ${
            override
              ? "border-gletcher-red bg-gletcher-red text-white"
              : "border-gletcher-navy/20 bg-white text-gletcher-navy"
          }`}
          onClick={() => patch({ mode: "override" })}
        >
          Персональный ассортимент
        </button>
      </div>

      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}
      {okMsg ? (
        <FormStatus tone="info" role="status">
          {okMsg}
        </FormStatus>
      ) : null}

      <div className="overflow-auto rounded-xl border border-gletcher-navy/15 bg-white">
        <table className="min-w-full text-left text-xs text-gletcher-navy">
          <thead className="bg-gletcher-ice/80 text-[10px] tracking-wider uppercase">
            <tr>
              <th className="px-3 py-2 font-bold">Сорт</th>
              <th className="px-3 py-2 font-bold">Сеть</th>
              <th className="px-3 py-2 font-bold">Точка</th>
            </tr>
          </thead>
          <tbody>
            {detail.columns.map((col) => {
              const chainOn = Boolean(detail.chainProducts[col.productSlug]);
              const locOn = Boolean(detail.products[col.productSlug]);
              const differs = override && chainOn !== locOn;
              return (
                <tr
                  key={col.productSlug}
                  className={`border-t border-gletcher-navy/10 ${
                    differs ? "bg-amber-50/80" : ""
                  }`}
                >
                  <td className="px-3 py-2 font-semibold">
                    {col.catalogName}
                    {col.outOfStock ? (
                      <span className="ml-2 text-[10px] text-gletcher-red">
                        OOS
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{chainOn ? "✓" : "—"}</td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-gletcher-red"
                      checked={locOn}
                      disabled={busy || !override || col.outOfStock}
                      onChange={(e) =>
                        patch({
                          productSlug: col.productSlug,
                          available: e.target.checked,
                        })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
