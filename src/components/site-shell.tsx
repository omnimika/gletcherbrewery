import type { ReactNode } from "react";
import { AgeGate } from "@/components/age-gate";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * `#site-root` holds chrome + page content and can be marked `inert` while
 * overlays are open. Modals (age gate, main nav) render into `#portal-root`
 * so they stay interactive.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-gletcher-ice text-gletcher-navy">
      <div id="site-root" className="flex min-h-svh flex-1 flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
      <div id="portal-root">
        <AgeGate />
      </div>
    </div>
  );
}
