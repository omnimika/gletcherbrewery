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

export function isAgentAppStatus(value: string): value is AgentAppStatus {
  return (AGENT_APP_STATUSES as readonly string[]).includes(value);
}

/** Active = blocks a new application (any status except rejected). */
export function isActiveAgentStatus(status: string): boolean {
  return status !== "rejected";
}

export function agentAppStatusLabel(status: string): string {
  return isAgentAppStatus(status)
    ? AGENT_APP_STATUS_LABELS_RU[status]
    : status;
}
