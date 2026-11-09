import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import "../globals.css";

export const metadata: Metadata = {
  title: "Staff CRM | Gletcher",
  robots: { index: false, follow: false, nocache: true },
};

/** Private staff shell — same brand tokens as public site, noindex. */
export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-svh bg-gletcher-ice text-gletcher-navy antialiased">
        <header className="sticky top-0 z-[var(--z-sticky)] border-b border-gletcher-navy/15 bg-gletcher-ice/95 backdrop-blur-sm">
          <Container className="flex min-h-14 items-center justify-between gap-4 py-3">
            <Link
              href="/staff"
              className="font-display text-sm font-extrabold tracking-[0.12em] text-gletcher-navy uppercase focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-gletcher-navy"
            >
              Gletcher · Staff
            </Link>
            <p className="type-caption text-gletcher-navy/55">
              CRM · noindex · non-prod
            </p>
          </Container>
        </header>
        <main className="py-[var(--section-inset-y)]">
          <Container className="max-w-[68rem]">{children}</Container>
        </main>
      </body>
    </html>
  );
}
