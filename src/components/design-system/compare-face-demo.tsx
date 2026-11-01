"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

/**
 * Demonstrates the CompareCard focus contract: inactive face controls are
 * removed from the accessibility tree (inert + hidden + tabIndex), not only opacity.
 */
export function CompareFaceDemo() {
  const [face, setFace] = useState<"import" | "gletcher">("import");
  const importId = useId();
  const gletcherId = useId();

  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-ice">
      <div
        id={importId}
        hidden={face !== "import"}
        className={`absolute inset-0 flex flex-col gap-3 p-5 transition-opacity duration-200 ${
          face === "import" ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={face !== "import"}
        inert={face !== "import" ? true : undefined}
      >
        <p className="type-heading-card">Import face</p>
        <p className="type-body-small text-gletcher-navy/75">
          Controls here must leave the tab order when this face is hidden.
        </p>
        <div className="mt-auto flex flex-wrap gap-2">
          <Button
            type="button"
            variant="brand"
            tabIndex={face === "import" ? 0 : -1}
            onClick={() => setFace("gletcher")}
          >
            Switch to Gletcher
          </Button>
          <LinkButton
            href="/beer"
            variant="outline"
            tabIndex={face === "import" ? 0 : -1}
          >
            Catalog
          </LinkButton>
        </div>
      </div>

      <div
        id={gletcherId}
        hidden={face !== "gletcher"}
        className={`absolute inset-0 flex flex-col gap-3 p-5 transition-opacity duration-200 ${
          face === "gletcher" ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={face !== "gletcher"}
        inert={face !== "gletcher" ? true : undefined}
      >
        <p className="type-heading-card">Gletcher face</p>
        <p className="type-body-small text-gletcher-navy/75">
          Only this face stays in the accessibility tree while visible.
        </p>
        <div className="mt-auto flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            tabIndex={face === "gletcher" ? 0 : -1}
            onClick={() => setFace("import")}
          >
            Back to import
          </Button>
          <LinkButton
            href="/beer/friday"
            variant="primary"
            tabIndex={face === "gletcher" ? 0 : -1}
          >
            Find
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
