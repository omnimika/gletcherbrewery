"use client";

import { useRouter } from "next/navigation";
import { MEMBERS_LOGIN_PATH } from "@/content/members-lk";
import { MembersLkShell } from "./lk-shell";
import type { LkInfoModel } from "./panels/info-panel";
import type { LkReceiptRow } from "./panels/purchases-panel";

export function MembersLkClient(props: {
  info: LkInfoModel;
  receipts: LkReceiptRow[];
  defaultCity?: string;
}) {
  const router = useRouter();
  return (
    <MembersLkShell
      {...props}
      onLogout={async () => {
        await fetch("/api/loyalty/auth/logout", { method: "POST" });
        router.replace(MEMBERS_LOGIN_PATH);
        router.refresh();
      }}
    />
  );
}
