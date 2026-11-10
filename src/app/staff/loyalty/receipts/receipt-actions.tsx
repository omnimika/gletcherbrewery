"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ReceiptActions({ receiptId }: { receiptId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: "approve" | "reject") {
    setError(null);
    start(async () => {
      const res = await fetch(`/api/staff/loyalty/receipts/${receiptId}/actions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json()) as { ok?: boolean; code?: string };
      if (!res.ok || !json.ok) {
        setError(json.code ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run("approve")}
        className="rounded border border-gletcher-navy bg-gletcher-navy px-3 py-1.5 text-xs font-semibold tracking-wide text-gletcher-white uppercase disabled:opacity-50"
      >
        Одобрить
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run("reject")}
        className="rounded border border-gletcher-navy/40 px-3 py-1.5 text-xs font-semibold tracking-wide text-gletcher-navy uppercase disabled:opacity-50"
      >
        Отклонить
      </button>
      {error ? (
        <span className="type-caption text-gletcher-red">{error}</span>
      ) : null}
    </div>
  );
}
