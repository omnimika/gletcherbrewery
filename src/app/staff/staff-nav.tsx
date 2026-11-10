"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/staff",
    label: "Заявки",
    match: (path: string) =>
      path === "/staff" || path.startsWith("/staff/leads"),
  },
  {
    href: "/staff/map",
    label: "Карта продаж",
    match: (path: string) => path.startsWith("/staff/map"),
  },
  {
    href: "/staff/loyalty/receipts",
    label: "Чеки",
    match: (path: string) => path.startsWith("/staff/loyalty"),
  },
] as const;

/** Primary staff CRM sections — lives in the sticky header. */
export function StaffNav() {
  const pathname = usePathname() || "/staff";

  return (
    <nav
      className="flex min-w-0 flex-1 items-center gap-0.5 sm:gap-1"
      aria-label="Разделы staff CRM"
    >
      {LINKS.map((link) => {
        const isActive = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 border-b-2 px-2.5 py-2 text-xs font-semibold tracking-wider uppercase transition-colors sm:px-3 sm:text-sm focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-gletcher-navy ${
              isActive
                ? "border-gletcher-red text-gletcher-navy"
                : "border-transparent text-gletcher-navy/55 hover:border-gletcher-navy/25 hover:text-gletcher-navy"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
