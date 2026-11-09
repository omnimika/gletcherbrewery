"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FormStatus } from "@/components/ui/feedback";
import {
  chainLogoSrc,
  productBierdeckelSrc,
} from "@/server/retail/matrix-media";

type Column = {
  productSlug: string;
  catalogName: string;
  outOfStock: boolean;
};
type ChainRow = {
  id: string;
  slug: string;
  title: string;
  legalName: string | null;
  mapUrl: string | null;
  products: Record<string, boolean>;
};

function actorHeader(): HeadersInit {
  const actor =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("gletcher_staff_actor") || "staff"
      : "staff";
  return { "content-type": "application/json", "x-staff-actor": actor };
}

export function AssortmentMatrix({
  columns,
  chains: initialChains,
}: {
  columns: Column[];
  chains: ChainRow[];
}) {
  const [chains, setChains] = useState(initialChains);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const columnMedia = useMemo(
    () =>
      columns.map((c) => ({
        ...c,
        deckel: productBierdeckelSrc(c.productSlug),
      })),
    [columns],
  );

  async function toggle(
    chainId: string,
    productSlug: string,
    next: boolean,
    outOfStock: boolean,
  ) {
    if (outOfStock) return;
    const key = `${chainId}:${productSlug}`;
    setPendingKey(key);
    setError(null);
    setSaved(null);

    const prev = chains;
    setChains((rows) =>
      rows.map((row) =>
        row.id === chainId
          ? {
              ...row,
              products: { ...row.products, [productSlug]: next },
            }
          : row,
      ),
    );

    try {
      const res = await fetch("/api/staff/retail/assortment", {
        method: "PATCH",
        headers: actorHeader(),
        body: JSON.stringify({ chainId, productSlug, available: next }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setChains(prev);
        setError(json.message ?? "Не удалось сохранить");
        return;
      }
      setSaved("Сохранено в PostgreSQL (tileset пока не публикуется)");
    } catch {
      setChains(prev);
      setError("Сеть недоступна");
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}
      {saved ? <FormStatus tone="info">{saved}</FormStatus> : null}

      {/* Vertical scroll only on desktop; columns share width so no horizontal bar */}
      <div className="h-[calc(100svh-11.5rem)] min-h-80 overflow-y-auto overflow-x-auto rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-white lg:overflow-x-hidden">
        <table className="w-full min-w-[42rem] table-fixed border-collapse text-left text-xs lg:min-w-0">
          <thead className="sticky top-0 z-30 bg-gletcher-frost/95 shadow-[0_1px_0_0_rgb(13_15_73/0.2)] backdrop-blur-sm">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-40 w-[10.5rem] border-b border-r border-gletcher-navy/20 bg-gletcher-frost px-2 py-2.5 text-left font-semibold uppercase tracking-wide text-gletcher-navy sm:w-44 sm:px-3 lg:w-48"
              >
                Сеть
              </th>
              {columnMedia.map((col) => (
                <th
                  key={col.productSlug}
                  scope="col"
                  title={
                    col.outOfStock
                      ? `${col.catalogName} — OUT OF STOCK`
                      : col.catalogName
                  }
                  className={`border-b border-gletcher-navy/20 bg-gletcher-frost/95 px-0.5 py-2 text-center align-bottom font-semibold text-gletcher-navy sm:px-1 ${
                    col.outOfStock ? "opacity-45" : ""
                  }`}
                >
                  <div className="mx-auto aspect-square w-[min(100%,4.75rem)]">
                    {col.deckel ? (
                      <Image
                        src={col.deckel}
                        alt=""
                        width={80}
                        height={80}
                        className={`aspect-square size-full rounded-full object-cover shadow-sm ring-1 ring-gletcher-navy/15 ${
                          col.outOfStock ? "grayscale" : ""
                        }`}
                        unoptimized
                      />
                    ) : (
                      <span className="flex aspect-square size-full items-center justify-center rounded-full bg-gletcher-ice text-[clamp(0.45rem,1.1vw,0.7rem)] leading-tight text-gletcher-navy/70">
                        {col.catalogName.slice(0, 6)}
                      </span>
                    )}
                    <span className="sr-only">
                      {col.catalogName}
                      {col.outOfStock ? " (OUT OF STOCK)" : ""}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chains.map((chain) => {
              const logo = chainLogoSrc(chain.title);
              return (
                <tr
                  key={chain.id}
                  className="border-t border-gletcher-navy/10 hover:bg-gletcher-frost/40"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-[1] border-r border-gletcher-navy/15 bg-gletcher-white px-2 py-2 text-left font-medium text-gletcher-navy sm:px-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] border border-gletcher-navy/15 bg-gletcher-ice p-0.5 sm:size-8">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- mixed SVG/PNG partner logos
                          <img
                            src={logo}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[0.55rem] font-bold tracking-wide text-gletcher-navy/50">
                            {chain.title.slice(0, 3)}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate">{chain.title}</span>
                        {chain.legalName ? (
                          <span className="type-caption block truncate font-normal text-gletcher-navy/55">
                            {chain.legalName}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </th>
                  {columns.map((col) => {
                    const locked = col.outOfStock;
                    const checked = locked
                      ? false
                      : Boolean(chain.products[col.productSlug]);
                    const key = `${chain.id}:${col.productSlug}`;
                    const busy = pendingKey === key;
                    return (
                      <td
                        key={col.productSlug}
                        className={`px-0.5 py-1.5 text-center sm:px-1 ${
                          locked ? "bg-gletcher-navy/[0.03]" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="size-3.5 accent-gletcher-red disabled:cursor-not-allowed disabled:opacity-35 sm:size-4 lg:size-[1.05rem]"
                          checked={checked}
                          disabled={busy || locked}
                          aria-disabled={locked || undefined}
                          aria-label={
                            locked
                              ? `${chain.title} — ${col.catalogName} (OUT OF STOCK)`
                              : `${chain.title} — ${col.catalogName}`
                          }
                          title={
                            locked ? "OUT OF STOCK — недоступно" : undefined
                          }
                          onChange={(e) =>
                            void toggle(
                              chain.id,
                              col.productSlug,
                              e.target.checked,
                              locked,
                            )
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="type-caption text-gletcher-navy/60">
        Сорта OUT OF STOCK — только просмотр, чекбокс заблокирован. Tileset
        publish не включён.
      </p>
    </div>
  );
}
