import type { ReactNode } from "react";
import { AgeGate } from "@/components/age-gate";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { PublishedLocale } from "@/i18n/locales";

/**
 * Header stays interactive while the main nav is open (same chrome, burger→X).
 * `#site-content` is marked `inert` by the menu overlay.
 * Age gate still inerts `#site-root` (header + content) from `#portal-root`.
 */
export function SiteShell({
  children,
  localeHrefs,
}: {
  children: ReactNode;
  /** Peer pathnames for LocaleSwitch (e.g. product RU/EN slug pairs). */
  localeHrefs?: Partial<Record<PublishedLocale, string>>;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-gletcher-ice text-gletcher-navy">
      <div id="site-root" className="flex min-h-svh flex-1 flex-col">
        <SiteHeader localeHrefs={localeHrefs} />
        <div id="site-content" className="flex min-h-0 flex-1 flex-col">
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </div>
      <div id="portal-root">
        <AgeGate />
      </div>
    </div>
  );
}
