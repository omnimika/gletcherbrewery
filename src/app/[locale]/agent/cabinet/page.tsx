import { redirect } from "next/navigation";
import { MEMBERS_LK_PATH } from "@/content/members-lk";

/** Legacy spike URL → canonical Tilda-parity path. */
export default function AgentCabinetRedirect() {
  redirect(MEMBERS_LK_PATH);
}
