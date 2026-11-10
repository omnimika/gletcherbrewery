"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function actorHeader(): HeadersInit {
  const actor =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("gletcher_staff_actor") || "staff"
      : "staff";
  return { "x-staff-actor": actor };
}

export function LocationRowActions({
  locationId,
  label,
}: {
  locationId: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (
      !window.confirm(
        `Удалить точку «${label}» из CRM и локального GeoJSON?`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/staff/retail/locations/${locationId}`, {
        method: "DELETE",
        headers: actorHeader(),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) {
        window.alert(json.message || "Не удалось удалить");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Сеть/сервер недоступны");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/staff/map/locations/${locationId}`}
        title="Редактировать"
        aria-label="Редактировать точку"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gletcher-navy/20 bg-white text-gletcher-navy hover:border-gletcher-navy/40 hover:bg-gletcher-ice"
      >
        <EditIcon />
      </Link>
      <button
        type="button"
        title="Удалить"
        aria-label="Удалить точку"
        disabled={busy}
        onClick={onDelete}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gletcher-red/30 bg-white text-gletcher-red hover:bg-gletcher-red/5 disabled:opacity-50"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
