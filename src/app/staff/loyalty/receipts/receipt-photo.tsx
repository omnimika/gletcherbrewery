"use client";

import { useState } from "react";

export function ReceiptPhotoPreview({
  receiptId,
  objectKey,
}: {
  receiptId: string;
  objectKey: string;
}) {
  const [open, setOpen] = useState(false);
  const src = `/api/staff/loyalty/receipts/${receiptId}/photo`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 block overflow-hidden rounded-[var(--radius-control)] border border-gletcher-navy/25 bg-gletcher-frost text-left transition hover:border-gletcher-navy"
        aria-label="Открыть фото чека"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- staff auth cookie image */}
        <img
          src={src}
          alt={`Чек ${objectKey}`}
          className="h-28 w-auto max-w-full object-contain"
        />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gletcher-navy/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фото чека"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div
            className="relative max-h-[90vh] max-w-[min(100%,42rem)] overflow-auto rounded-[var(--radius-card)] bg-gletcher-white p-3 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-2 right-2 rounded-[var(--radius-control)] border border-gletcher-navy/20 bg-gletcher-frost px-2 py-1 text-xs font-bold tracking-wide text-gletcher-navy uppercase"
              onClick={() => setOpen(false)}
            >
              Закрыть
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Чек ${objectKey}`}
              className="mt-8 max-h-[80vh] w-full object-contain"
            />
            <p className="type-caption mt-2 break-all text-gletcher-navy/55">
              {objectKey}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
