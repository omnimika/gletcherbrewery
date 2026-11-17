import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { isStaffAuthConfigured } from "@/server/staff/auth";
import { getStaffPageSession } from "@/server/staff/request-auth";
import { LogoutButton } from "./logout-button";
import { StaffNav } from "./staff-nav";
import "../globals.css";

export const metadata: Metadata = {
  title: "Staff CRM | Gletcher",
  robots: { index: false, follow: false, nocache: true },
};

/** Private staff shell — same brand tokens as public site, noindex. */
export default async function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session =
    isStaffAuthConfigured() ? await getStaffPageSession() : null;

  return (
    <html lang="ru">
      <body className="min-h-svh bg-gletcher-ice text-gletcher-navy antialiased">
        <header className="sticky top-0 z-[var(--z-sticky)] border-b border-gletcher-navy/15 bg-gletcher-ice/95 backdrop-blur-sm">
          <Container className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 py-2 sm:flex-nowrap">
            <Link
              href="/staff"
              className="flex shrink-0 items-center gap-2.5 focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-gletcher-navy"
            >
              <Image
                src="/staff/gletcher-logo-simple.svg"
                alt="Gletcher Brewery"
                width={28}
                height={44}
                className="h-8 w-auto sm:h-9"
                priority
                unoptimized
              />
              <span className="font-display text-sm font-extrabold tracking-[0.12em] text-gletcher-navy uppercase">
                Staff
              </span>
            </Link>
            {session ? (
              <>
                <StaffNav />
                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <p className="type-caption hidden text-gletcher-navy/60 sm:block">
                    {session.email}
                    <span className="mx-1 text-gletcher-navy/30">·</span>
                    {session.role}
                  </p>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <p className="type-caption ml-auto text-gletcher-navy/55">
                CRM · noindex · non-prod
              </p>
            )}
          </Container>
        </header>
        <main className="py-[var(--section-inset-y)]">
          <Container className="max-w-[min(100%,92rem)]">{children}</Container>
        </main>
      </body>
    </html>
  );
}
