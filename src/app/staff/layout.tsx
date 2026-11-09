import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "../globals.css";

export const metadata: Metadata = {
  title: "Staff CRM | Gletcher",
  robots: { index: false, follow: false, nocache: true },
};

/** Private staff shell — outside [locale], noindex. */
export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <header className="border-b border-zinc-800 px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <Link href="/staff" className="text-sm font-medium tracking-wide">
              Gletcher Staff CRM
            </Link>
            <span className="text-xs text-zinc-500">noindex · non-prod</span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
