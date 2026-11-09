/** Format Contacts lead for Telegram HTML (no secrets). */

export type ContactLeadFields = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  company?: string | null;
  comment?: string | null;
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

export function formatContactsTelegramHtml(input: {
  submissionId: string;
  sourcePath: string;
  locale: string;
  fields: ContactLeadFields;
}): string {
  const rows = [
    "🍺 <b>Заявка с сайта — Contacts</b>",
    line("ID", input.submissionId),
    line("Источник", input.sourcePath),
    line("Locale", input.locale),
    line("Имя", input.fields.name),
    line("Email", input.fields.email),
    line("Телефон", input.fields.phone),
    line("Город", input.fields.city),
    line("Компания", input.fields.company),
    line("Комментарий", input.fields.comment),
  ].filter(Boolean);

  return rows.join("\n");
}
