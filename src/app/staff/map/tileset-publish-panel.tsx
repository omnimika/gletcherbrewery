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
  const [busy, setBusy] = useState<"dry" | "live" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [lastRecipe, setLastRecipe] = useState<PublishRun["recipe"] | null>(
    null,
  );

  async function runPublish(mode: "dry_run" | "live") {
    setBusy(mode === "live" ? "live" : "dry");
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/staff/retail/tileset-publish", {
        method: "POST",
        headers: actorHeader(),
        body: JSON.stringify({ mode }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        run?: PublishRun;
      };
      if (!json.run && (!res.ok || !json.ok)) {
        setError(json.message ?? "Запрос не выполнен");
        return;
      }
      if (json.run) {
        setLastRecipe(json.run.recipe);
        setRuns((prev) => [json.run!, ...prev].slice(0, 8));
      }
      if (mode === "dry_run") {
        if (!res.ok || !json.ok || !json.run) {
          setError(json.message ?? "Dry-run не выполнен");
          return;
        }
        const n = json.run.recipe.patches.filter((p) => p.product).length;
        setInfo(
          `Dry-run: recipe для ${n} сетей сохранён в PG. Карта /map НЕ меняется — нужен «Опубликовать в Mapbox».`,
        );
        return;
      }
      // live may return partial/failed with run payload
      const uploads =
        (json.run?.result?.uploads as Array<{ ok?: boolean }> | undefined) ??
        [];
      const okCount = uploads.filter((u) => u.ok).length;
      if (!res.ok || !json.ok) {
        setError(
          json.message ??
            `Live: частично/ошибка (${okCount}/${uploads.length || "?"}).`,
        );
        return;
      }
      setInfo(
        `Live publish: ${okCount}/${uploads.length} слоёв отправлены в Mapbox. Тайлы могут обновиться с задержкой 1–5 мин — обновите /map с cache-bypass.`,
      );
    } catch {
      setError("Сеть недоступна");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Banner tone="frost" className="!px-4 !py-3 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="type-label text-gletcher-navy/55">Mapbox Product</p>
          <p className="type-body-small text-gletcher-navy/85">
            Чекбоксы → PostgreSQL сразу.{" "}
            <strong className="font-semibold">Dry-run</strong> только собирает
            строки <code className="text-xs">Product</code> (превью).{" "}
            <strong className="font-semibold">Опубликовать</strong> патчит
            источники и заливает tileset — без этого{" "}
            <code className="text-xs">/map</code> не изменится.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy !== null}
            onClick={() => void runPublish("dry_run")}
          >
            {busy === "dry" ? "Считаем…" : "Dry-run"}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={busy !== null}
            onClick={() => {
              if (
                !window.confirm(
                  "Опубликовать Product в Mapbox tileset?\nЭто меняет боевую карту /map.",
                )
              ) {
                return;
              }
              void runPublish("live");
            }}
          >
            {busy === "live" ? "Публикуем…" : "Опубликовать в Mapbox"}
          </Button>
        </div>
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
