/** Format lead payloads for Telegram HTML (no secrets). */

export type LeadFields = Record<string, string | null | undefined>;

/** Telegram Bot API sendMessage hard limit. */
export const TELEGRAM_MESSAGE_MAX_CHARS = 4096;

/** Soft cap per field value before assembly (UTF-16 length ≈ chars for RU). */
export const TELEGRAM_FIELD_VALUE_MAX_CHARS = 400;

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

function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  if (max <= 1) return "…";
  return `${value.slice(0, max - 1)}…`;
}

function line(label: string, value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return `<b>${esc(label)}:</b> ${esc(clip(trimmed, TELEGRAM_FIELD_VALUE_MAX_CHARS))}`;
}

function staffOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() ||
    process.env.LOYALTY_PUBLIC_ORIGIN?.trim() ||
    "http://127.0.0.1:3000"
  );
}

/** Private CRM deep-link (no secrets). Kept even when body is truncated. */
export function staffLeadCrmUrl(submissionId: string): string {
  const origin = staffOrigin().replace(/\/$/, "");
  return `${origin}/staff/leads/${submissionId}`;
}

/**
 * Fit HTML under Telegram's 4096 limit while preserving stable ID + CRM link.
 * Drops optional field lines from the end first; then hard-clips the body.
 */
export function fitTelegramHtml(
  parts: {
    header: string;
    identity: string[];
    fields: string[];
    footer: string[];
  },
  maxChars: number = TELEGRAM_MESSAGE_MAX_CHARS,
): string {
  const join = (fields: string[]) =>
    [...[parts.header], ...parts.identity, ...fields, ...parts.footer]
      .filter(Boolean)
      .join("\n");

  let fields = [...parts.fields];
  let text = join(fields);
  while (text.length > maxChars && fields.length > 0) {
    fields = fields.slice(0, -1);
    text = join(fields);
  }

  if (text.length <= maxChars) return text;

  // Extreme case: identity+footer alone overflow — keep suffix with CRM/ID.
  const suffix = ["…", ...parts.identity, ...parts.footer]
    .filter(Boolean)
    .join("\n");
  if (suffix.length >= maxChars) {
    return suffix.slice(suffix.length - maxChars);
  }
  const headBudget = maxChars - suffix.length - 1;
  return `${parts.header.slice(0, Math.max(0, headBudget))}\n${suffix}`;
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
    .filter((v): v is string => Boolean(v));

  const crm = staffLeadCrmUrl(input.submissionId);

  return fitTelegramHtml({
    header: `🍺 <b>Заявка с сайта — ${esc(headlineFor(input.formId, input.sourcePath))}</b>`,
    identity: [
      line("ID", input.submissionId)!,
      line("form_id", input.formId)!,
      line("Locale", input.locale)!,
    ],
    fields: fieldLines,
    footer: [`<b>CRM:</b> ${esc(crm)}`],
  });
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
