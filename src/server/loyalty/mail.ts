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

export function getMagicLinkDelivery(): MagicLinkDelivery {
  if ((process.env.LOYALTY_MAGIC_LINK_DEBUG || "").trim() === "1") {
    return { mode: "debug" };
  }
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim();
  if (host && user && pass && from) {
    return { mode: "smtp", from };
  }
  return { mode: "none", reason: "smtp_unconfigured" };
}

function smtpPort(): number {
  const n = Number(process.env.SMTP_PORT || "465");
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
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!.trim(),
      port: smtpPort(),
      secure: smtpPort() === 465,
      auth: {
        user: process.env.SMTP_USER!.trim(),
        pass: process.env.SMTP_PASS!.trim(),
      },
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
