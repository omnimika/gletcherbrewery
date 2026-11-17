/** Nine Airtable «Агенты» statuses — shared client/server labels. */
export const AGENT_APP_STATUSES = [
  "under_review",
  "approved",
  "rejected",
  "negotiations_done",
  "sales_rep_visited",
  "first_shipment",
  "active_client",
  "egais_required",
  "no_contact",
] as const;

export type AgentAppStatus = (typeof AGENT_APP_STATUSES)[number];

export const AGENT_APP_STATUS_LABELS_RU: Record<AgentAppStatus, string> = {
  under_review: "На рассмотрении",
  approved: "Одобрена",
  rejected: "Отказано",
  negotiations_done: "Провели переговоры",
  sales_rep_visited: "Выехал торговый представитель",
  first_shipment: "Осуществлена первая отгрузка",
  active_client: "Действующий клиент",
  egais_required: "Требуется ЕГАИС",
  no_contact: "Нет контакта",
};

/** Closed for the open-slot counter (owner: cabinet multi-submit). */
export const AGENT_APP_CLOSED_STATUSES = ["approved", "rejected"] as const;

/** Max simultaneous open applications per member. */
export const MAX_OPEN_AGENT_APPLICATIONS = 10;

export function isAgentAppStatus(value: string): value is AgentAppStatus {
  return (AGENT_APP_STATUSES as readonly string[]).includes(value);
}

/**
 * Open slot = counts toward the 10-cap and stays visible as in-flight.
 * Closed: Одобрена | Отказано.
 */
export function isOpenAgentStatus(status: string): boolean {
  return status !== "approved" && status !== "rejected";
}

/** @deprecated use isOpenAgentStatus */
export function isActiveAgentStatus(status: string): boolean {
  return isOpenAgentStatus(status);
}

export function agentAppStatusLabel(status: string): string {
  return isAgentAppStatus(status)
    ? AGENT_APP_STATUS_LABELS_RU[status]
    : status;
}
