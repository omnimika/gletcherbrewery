"use client";

import { useRouter } from "next/navigation";
import { AGENT_LOGIN_PATH } from "@/content/cabinet";
import { CabinetShell } from "./cabinet-shell";
import type {
  CabinetAgentApplicationRow,
  CabinetInfoModel,
  CabinetReceiptRow,
} from "./types";

export function CabinetClient(props: {
  info: CabinetInfoModel;
  receipts: CabinetReceiptRow[];
  agentApplications: CabinetAgentApplicationRow[];
  buyPlaces: readonly string[];
  defaultCity?: string;
  defaultPhone?: string;
}) {
  const router = useRouter();
  return (
    <CabinetShell
      {...props}
      onLogout={async () => {
        await fetch("/api/loyalty/auth/logout", { method: "POST" });
        router.replace(AGENT_LOGIN_PATH);
        router.refresh();
      }}
    />
  );
}
