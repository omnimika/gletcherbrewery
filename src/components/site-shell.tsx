import type { ReactNode } from "react";
import { AgeGate } from "@/components/age-gate";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-gletcher-ice text-gletcher-navy">
      <AgeGate />
      <div id="site-root" className="flex min-h-svh flex-1 flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
