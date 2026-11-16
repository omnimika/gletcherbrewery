/** Telegram HTML for loyalty cabinet events (receipts / agent apps). */

import {
  fitTelegramHtml,
  TELEGRAM_FIELD_VALUE_MAX_CHARS,
} from "@/server/forms/telegram-message";

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function clip(value: string, max = TELEGRAM_FIELD_VALUE_MAX_CHARS): string {
  if (value.length <= max) return value;
  if (max <= 1) return "…";
  return `${value.slice(0, max - 1)}…`;
}

function line(label: string, value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return `<b>${esc(label)}:</b> ${esc(clip(trimmed))}`;
}

function staffOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() ||
    process.env.LOYALTY_PUBLIC_ORIGIN?.trim() ||
    "http://127.0.0.1:3000"
  );
}

export function staffReceiptsCrmUrl(): string {
  return `${staffOrigin().replace(/\/$/, "")}/staff/loyalty/receipts`;
}

export function staffAgentsCrmUrl(): string {
  return `${staffOrigin().replace(/\/$/, "")}/staff/loyalty/agents`;
}

export function formatReceiptTelegramHtml(input: {
  receiptId: string;
  email: string;
  displayName: string | null;
  city: string | null;
  venue: string | null;
  gletcherSumRub: string | null;
  proposedEarn: number | null;
  source: string;
  purchaseAt: string | null;
}): string {
  const name = input.displayName?.trim() || null;
  return fitTelegramHtml({
    header: "🧾 <b>Чек из кабинета Агент</b>",
    identity: [line("ID", input.receiptId)!],
    fields: [
      line("Участник", name),
      line("Email", input.email),
      line("Город", input.city),
      line("Точка", input.venue),
      line("Дата", input.purchaseAt),
      line("Gletcher ₽", input.gletcherSumRub),
      line(
        "Предложено ₿",
        input.proposedEarn != null ? String(input.proposedEarn) : null,
      ),
      line("Источник", input.source),
    ].filter((v): v is string => Boolean(v)),
    footer: [`<b>CRM:</b> ${esc(staffReceiptsCrmUrl())}`],
  });
}

export function formatAgentApplicationTelegramHtml(input: {
  applicationId: string;
  email: string;
  displayName: string | null;
  phone: string;
  city: string;
  venueName: string;
  venueType: string;
  venueAddress: string;
  venueBoss: string | null;
  comment: string | null;
}): string {
  const name = input.displayName?.trim() || null;
  return fitTelegramHtml({
    header: "🏪 <b>Заявка «Стать агентом»</b>",
    identity: [line("ID", input.applicationId)!],
    fields: [
      line("Участник", name),
      line("Email", input.email),
      line("Телефон", input.phone),
      line("Город", input.city),
      line("Заведение", input.venueName),
      line("Тип", input.venueType),
      line("Адрес", input.venueAddress),
      line("Контакт", input.venueBoss),
      line("Комментарий", input.comment),
    ].filter((v): v is string => Boolean(v)),
    footer: [`<b>CRM:</b> ${esc(staffAgentsCrmUrl())}`],
  });
}
