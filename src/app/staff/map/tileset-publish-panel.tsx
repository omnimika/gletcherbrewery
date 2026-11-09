"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/card";
import { FormStatus } from "@/components/ui/feedback";

type PublishRun = {
  id: string;
  mode: "dry_run" | "live";
  status: string;
  createdAt: string;
  result: Record<string, unknown> | null;
  recipe: {
    patches: Array<{
      chainTitle: string;
      product: string;
      availableSlugs: string[];
    }>;
    blockers: string[];
    livePublishReady: boolean;
  };
};

function actorHeader(): HeadersInit {
  const actor =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("gletcher_staff_actor") || "staff"
      : "staff";
  return { "content-type": "application/json", "x-staff-actor": actor };
}

export function TilesetPublishPanel() {
  const [runs, setRuns] = useState<PublishRun[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [lastRecipe, setLastRecipe] = useState<PublishRun["recipe"] | null>(
    null,
  );

  async function runDry() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/staff/retail/tileset-publish", {
        method: "POST",
        headers: actorHeader(),
        body: JSON.stringify({ mode: "dry_run" }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        run?: PublishRun;
      };
      if (!res.ok || !json.ok || !json.run) {
        setError(json.message ?? "Dry-run не выполнен");
        return;
      }
      setLastRecipe(json.run.recipe);
      setRuns((prev) => [json.run!, ...prev].slice(0, 8));
      const n = json.run.recipe.patches.filter((p) => p.product).length;
      setInfo(
        `Dry-run сохранён: ${n} сетей с Product. Live upload пока не включён.`,
      );
    } catch {
      setError("Сеть недоступна");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Banner tone="frost" className="!px-4 !py-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="type-label text-gletcher-navy/55">Mapbox Product</p>
          <p className="type-body-small text-gletcher-navy/85">
            Собрать строку <code className="text-xs">Product</code> из матрицы
            (dry-run). Публикация tileset — только после подтверждённых ID
            источников.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => void runDry()}
        >
          {busy ? "Считаем…" : "Dry-run Product"}
        </Button>
      </div>

      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}
      {info ? <FormStatus tone="info">{info}</FormStatus> : null}

      {lastRecipe ? (
        <div className="max-h-40 overflow-auto rounded-[var(--radius-control)] border border-gletcher-navy/15 bg-gletcher-white/80 p-2 text-xs">
          <p className="mb-1 font-semibold text-gletcher-navy">
            Последний recipe ({lastRecipe.patches.length} сетей)
          </p>
          <ul className="space-y-1 text-gletcher-navy/80">
            {lastRecipe.patches
              .filter((p) => p.product)
              .slice(0, 12)
              .map((p) => (
                <li key={p.chainTitle}>
                  <span className="font-medium">{p.chainTitle}:</span>{" "}
                  {p.product}
                </li>
              ))}
          </ul>
          {lastRecipe.blockers.length > 0 ? (
            <p className="mt-2 text-gletcher-navy/55">
              Live blockers: {lastRecipe.blockers.join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}

      {runs.length > 0 ? (
        <p className="type-caption text-gletcher-navy/55">
          Журнал:{" "}
          {runs
            .slice(0, 3)
            .map((r) => `${r.mode}/${r.status}`)
            .join(", ")}
        </p>
      ) : null}
    </Banner>
  );
}
