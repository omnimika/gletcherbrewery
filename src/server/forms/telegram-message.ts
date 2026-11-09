/** Format lead payloads for Telegram HTML (no secrets). */

export type LeadFields = Record<string, string | null | undefined>;

const FORM_TITLES: Record<string, string> = {
  contacts: "Контакты",
  partnership: "Партнёрство / опт",
  horeca: "HoReCa",
  catalog_lead: "Каталог",
  tours_request: "Экскурсия (заявка)",
  newsletter: "Newsletter",
};

/** Prefer page path in the headline so /partnership ≠ Contacts. */
function headlineFor(formId: string, sourcePath: string): string {
  const kind = FORM_TITLES[formId] ?? formId;
  const path = sourcePath.trim() || "/";
  // Wholesale landing uses the same partnership form_id.
  if (formId === "partnership" && path.includes("russian-craft-beer")) {
    return `Опт / russian-craft-beer · ${path}`;
  }
  return `${kind} · ${path}`;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Имя",
  email: "Email",
  phone: "Телефон",
  city: "Город",
  company: "Компания",
  comment: "Комментарий",
  type: "Тип",
  inn: "ИНН",
  date: "Дата",
  guests: "Гостей",
  wishes: "Пожелания",
};

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function line(label: string, value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return `<b>${esc(label)}:</b> ${esc(trimmed)}`;
}

export function formatLeadTelegramHtml(input: {
  formId: string;
  submissionId: string;
  sourcePath: string;
  locale: string;
  fields: LeadFields;
}): string {
  const fieldLines = Object.entries(input.fields)
    .map(([key, value]) => line(FIELD_LABELS[key] ?? key, value))
    .filter(Boolean);

  return [
    `🍺 <b>Заявка с сайта — ${esc(headlineFor(input.formId, input.sourcePath))}</b>`,
    line("ID", input.submissionId),
    line("form_id", input.formId),
    line("Locale", input.locale),
    ...fieldLines,
  ]
    .filter(Boolean)
    .join("\n");
}

/** @deprecated use formatLeadTelegramHtml */
export const formatContactsTelegramHtml = (input: {
  submissionId: string;
  sourcePath: string;
  locale: string;
  fields: LeadFields;
}) =>
  formatLeadTelegramHtml({
    formId: "contacts",
    ...input,
  });
