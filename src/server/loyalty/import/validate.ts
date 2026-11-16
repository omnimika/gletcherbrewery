import { isAgentAppStatus } from "@/lib/loyalty/agent-application-status";
import { normalizeMemberEmail } from "@/server/loyalty/normalize-alias";
import {
  AIRTABLE_LOYALTY_TABLES,
  mapAgentStatusRu,
} from "./tables";
import type { LoyaltyTableFile, StagingRowDraft } from "./types";

function asString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

function asNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function firstLinkId(v: unknown): string | null {
  if (typeof v === "string" && v) return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return null;
}

export function validateLoyaltyFiles(
  files: LoyaltyTableFile[],
): StagingRowDraft[] {
  const drafts: StagingRowDraft[] = [];
  const userIds = new Set<string>();
  const emailToRecord = new Map<string, string>();

  const users = files.find(
    (f) => f.tableId === AIRTABLE_LOYALTY_TABLES.users,
  );
  if (users) {
    for (const rec of users.records) {
      userIds.add(rec.id);
      const emailRaw = asString(rec.fields.email);
      const codes: string[] = [];
      let reason: string | null = null;
      let status: "ok" | "quarantine" = "ok";

      if (!emailRaw || !emailRaw.includes("@")) {
        codes.push("invalid_email");
        reason = "empty_or_invalid_email";
        status = "quarantine";
      } else {
        const norm = normalizeMemberEmail(emailRaw);
        const prev = emailToRecord.get(norm);
        if (prev && prev !== rec.id) {
          codes.push("email_collision");
          reason = `collision_with:${prev}`;
          status = "quarantine";
        } else {
          emailToRecord.set(norm, rec.id);
        }
      }

      drafts.push({
        sourceTableId: users.tableId,
        sourceRecordId: rec.id,
        sourceFile: users.fileName,
        rawJson: { id: rec.id, fields: rec.fields },
        parseStatus: status,
        anomalyCodes: codes,
        quarantineReason: reason,
      });
    }
  }

  for (const file of files) {
    if (file.tableId === AIRTABLE_LOYALTY_TABLES.users) continue;

    for (const rec of file.records) {
      const codes: string[] = [];
      let reason: string | null = null;
      let status: "ok" | "quarantine" = "ok";

      if (file.tableId === AIRTABLE_LOYALTY_TABLES.checks) {
        const buyer = firstLinkId(
          rec.fields.buyer ?? rec.fields.Покупатель,
        );
        if (!buyer) {
          codes.push("orphan_check");
          reason = "missing_buyer";
          status = "quarantine";
        } else if (!userIds.has(buyer)) {
          codes.push("orphan_check");
          reason = `buyer_not_in_batch:${buyer}`;
          status = "quarantine";
        }
        const earn = asNumber(
          rec.fields.earnAmount ?? rec.fields["Биркоины начислить2"],
        );
        if (earn != null && (!Number.isInteger(earn) || earn < 0)) {
          codes.push("invalid_earn");
          reason = reason ?? "earn_not_nonneg_int";
          status = "quarantine";
        }
      }

      if (file.tableId === AIRTABLE_LOYALTY_TABLES.agents) {
        const member = firstLinkId(
          rec.fields.member ?? rec.fields.Агент ?? rec.fields.buyer,
        );
        if (!member || !userIds.has(member)) {
          codes.push("orphan_agent");
          reason = member
            ? `member_not_in_batch:${member}`
            : "missing_member";
          status = "quarantine";
        }
        const statusRaw = asString(
          rec.fields.status ?? rec.fields["Статус заявки"],
        );
        const mapped = mapAgentStatusRu(statusRaw);
        if (!mapped || !isAgentAppStatus(mapped)) {
          codes.push("unknown_agent_status");
          reason = reason ?? `unknown_status:${statusRaw ?? ""}`;
          status = "quarantine";
        }
        const phone = asString(rec.fields.phone ?? rec.fields.Телефон);
        const city = asString(rec.fields.city ?? rec.fields.Город);
        const venueName = asString(
          rec.fields.venueName ?? rec.fields["Название заведения"],
        );
        if (!phone || !city || !venueName) {
          codes.push("incomplete_agent");
          reason = reason ?? "missing_required_agent_fields";
          status = "quarantine";
        }
      }

      if (file.tableId === AIRTABLE_LOYALTY_TABLES.orders) {
        const buyer = firstLinkId(
          rec.fields.buyer ?? rec.fields.Покупатель,
        );
        if (buyer && !userIds.has(buyer)) {
          codes.push("orphan_order");
          reason = `buyer_not_in_batch:${buyer}`;
          status = "quarantine";
        }
      }

      drafts.push({
        sourceTableId: file.tableId,
        sourceRecordId: rec.id,
        sourceFile: file.fileName,
        rawJson: { id: rec.id, fields: rec.fields },
        parseStatus: status,
        anomalyCodes: codes,
        quarantineReason: reason,
      });
    }
  }

  return drafts;
}

export function summarizeByTable(drafts: StagingRowDraft[]) {
  const byTable: Record<
    string,
    { staged: number; ok: number; quarantine: number }
  > = {};
  for (const d of drafts) {
    const slot = byTable[d.sourceTableId] ?? {
      staged: 0,
      ok: 0,
      quarantine: 0,
    };
    slot.staged += 1;
    if (d.parseStatus === "quarantine") slot.quarantine += 1;
    else slot.ok += 1;
    byTable[d.sourceTableId] = slot;
  }
  return byTable;
}
