"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormStatus } from "@/components/ui/feedback";

function actorHeader(): HeadersInit {
  const actor =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("gletcher_staff_actor") || "staff"
      : "staff";
  return { "x-staff-actor": actor };
}

export function DeleteLocationButton({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (
      !window.confirm(
        "Удалить точку из CRM и локального GeoJSON? На /map исчезнет после следующего publish.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/retail/locations/${locationId}`, {
        method: "DELETE",
        headers: actorHeader(),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message || "Не удалось удалить");
        return;
      }
      router.push("/staff/map/locations");
      router.refresh();
    } catch {
      setError("Сеть/сервер недоступны");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={onDelete}
        className="rounded-full border border-gletcher-red/40 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-gletcher-red uppercase disabled:opacity-60"
      >
        {busy ? "Удаляем…" : "Удалить точку"}
      </button>
      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}
    </div>
  );
}
