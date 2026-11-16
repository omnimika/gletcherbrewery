/**
 * Transactional mail for loyalty (magic link, later certificates).
 *
 * Env (server-only):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *   LOYALTY_MAGIC_LINK_DEBUG=1 → no send; return link in API for local spike
 *
 * Yandex Postbox typical: host postbox.cloud.yandex.net, port 465.
 */

import nodemailer from "nodemailer";

export type MagicLinkDelivery =
  | { mode: "debug" }
  | { mode: "smtp"; from: string }
  | { mode: "none"; reason: "smtp_unconfigured" };

/** Strip accidental wrapping quotes from .env values. */
function envVal(key: string): string {
  const raw = process.env[key]?.trim() ?? "";
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1).trim();
  }
  return raw;
}

export function getMagicLinkDelivery(): MagicLinkDelivery {
  if (envVal("LOYALTY_MAGIC_LINK_DEBUG") === "1") {
    return { mode: "debug" };
  }
  const host = envVal("SMTP_HOST");
  const user = envVal("SMTP_USER");
  const pass = envVal("SMTP_PASS");
  const from = envVal("SMTP_FROM");
  if (host && user && pass && from) {
    return { mode: "smtp", from };
  }
  return { mode: "none", reason: "smtp_unconfigured" };
}

function smtpPort(): number {
  const n = Number(envVal("SMTP_PORT") || "465");
  return Number.isFinite(n) && n > 0 ? n : 465;
}

export async function deliverMagicLinkEmail(input: {
  to: string;
  verifyUrl: string;
  expiresAt: Date;
}): Promise<
  | { ok: true; mode: "debug" | "smtp" | "none" }
  | { ok: false; mode: "smtp"; error: string }
> {
  const delivery = getMagicLinkDelivery();

  if (delivery.mode === "debug") {
    console.info(
      "[loyalty/mail] debug delivery — link not emailed:",
      input.verifyUrl,
    );
    return { ok: true, mode: "debug" };
  }

  if (delivery.mode === "none") {
    console.warn(
      "[loyalty/mail] magic link issued but SMTP not configured; email not sent",
      { to: input.to, expiresAt: input.expiresAt.toISOString() },
    );
    return { ok: true, mode: "none" };
  }

  try {
    const host = envVal("SMTP_HOST");
    const user = envVal("SMTP_USER");
    const pass = envVal("SMTP_PASS");
    const transporter = nodemailer.createTransport({
      host,
      port: smtpPort(),
      secure: smtpPort() === 465,
      auth: { user, pass },
    });

    const expiresLocal = input.expiresAt.toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
    });

    await transporter.sendMail({
      from: delivery.from,
      to: input.to,
      subject: "Вход в «Агент Глетчер»",
      text: [
        "Ссылка для входа в кабинет «Агент Глетчер»:",
        input.verifyUrl,
        "",
        `Действует до ${expiresLocal} (МСК). Если вы не запрашивали вход — проигнорируйте письмо.`,
      ].join("\n"),
      html: `<p>Ссылка для входа в кабинет «Агент Глетчер»:</p>
<p><a href="${input.verifyUrl}">${input.verifyUrl}</a></p>
<p style="color:#666;font-size:12px">Действует до ${expiresLocal} (МСК). Если вы не запрашивали вход — проигнорируйте письмо.</p>`,
    });

    return { ok: true, mode: "smtp" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "smtp_error";
    console.error("[loyalty/mail] send failed", message);
    return { ok: false, mode: "smtp", error: message };
  }
}
