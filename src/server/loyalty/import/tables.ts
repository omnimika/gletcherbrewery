/** Airtable loyalty table IDs (Confirmed M2-0). */

export const AIRTABLE_LOYALTY_TABLES = {
  users: "tblCN54pm2SwmTlsv",
  checks: "tblymazDxC3rJeect",
  agents: "tblBBDgXoGBspoIQE",
  orders: "tblVEEISkwlXY6o3u",
  purchases: "tbl0PtMPIwBTmPjG5",
  products: "tbltQbwlpvGbLvF1t",
  promos: "tblTQUAXmJnGDkXx9",
} as const;

export type AirtableLoyaltyTableKey = keyof typeof AIRTABLE_LOYALTY_TABLES;

export const AIRTABLE_LOYALTY_TABLE_IDS = Object.values(
  AIRTABLE_LOYALTY_TABLES,
) as readonly string[];

export const LOYALTY_IMPORT_MAPPING_VERSION = "m24-foundation-2026-11-16" as const;
export const LOYALTY_IMPORT_SOURCE_SYSTEM = "airtable" as const;

export const AGENT_STATUS_RU_TO_SNAKE: Record<string, string> = {
  "На рассмотрении": "under_review",
  Одобрена: "approved",
  Отказано: "rejected",
  "Провели переговоры": "negotiations_done",
  "Выехал торговый представитель": "sales_rep_visited",
  "Осуществлена первая отгрузка": "first_shipment",
  "Действующий клиент": "active_client",
  "Требуется ЕГАИС": "egais_required",
  "Нет контакта": "no_contact",
  "Нет контакта / Не отвечают": "no_contact",
};

export function mapAgentStatusRu(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (AGENT_STATUS_RU_TO_SNAKE[trimmed]) return AGENT_STATUS_RU_TO_SNAKE[trimmed];
  // already snake_case in synthetic fixtures
  return trimmed;
}
