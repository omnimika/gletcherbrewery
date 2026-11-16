"use client";

import { useRouter } from "next/navigation";
import { MEMBERS_LOGIN_PATH } from "@/content/members-lk";
import { MembersLkShell } from "./lk-shell";
import type {
  LkAgentApplicationRow,
  LkInfoModel,
  LkReceiptRow,
} from "./types";

export function MembersLkClient(props: {
  info: LkInfoModel;
  receipts: LkReceiptRow[];
  agentApplications: LkAgentApplicationRow[];
  defaultCity?: string;
  defaultPhone?: string;
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
