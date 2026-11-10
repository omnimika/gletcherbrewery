"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CabinetLogoutButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={async () => {
        await fetch("/api/loyalty/auth/logout", { method: "POST" });
        router.replace("/agent/login");
        router.refresh();
      }}
    >
      Выйти
    </Button>
  );
}
