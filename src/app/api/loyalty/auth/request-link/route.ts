import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { issueMagicLink } from "@/server/loyalty/magic-link";
import {
  deliverMagicLinkEmail,
  getMagicLinkDelivery,
} from "@/server/loyalty/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Request a P1 magic link for member LK.
 * Local spike: LOYALTY_MAGIC_LINK_DEBUG=1 returns verifyUrl (no email).
 * Production email = Yandex Postbox/SMTP — not wired until credentials Confirmed.
 */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = String(body.email ?? "");
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_body" },
      { status: 400 },
    );
  }

  try {
    const issued = await issueMagicLink(getDb(), {
      email,
      requestIp: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    if (!issued.ok) {
      return NextResponse.json(
        { ok: false, code: "invalid_email" },
        { status: 400 },
      );
    }

    const deliveryMeta = getMagicLinkDelivery();
    const delivered = await deliverMagicLinkEmail({
      to: issued.emailNormalized,
      verifyUrl: issued.verifyUrl,
      expiresAt: issued.expiresAt,
    });

    return NextResponse.json({
      ok: true,
      delivery: deliveryMeta.mode,
      emailSent: delivered.ok && delivered.mode === "smtp",
      expiresAt: issued.expiresAt.toISOString(),
      ...(deliveryMeta.mode === "debug"
        ? {
            verifyUrl: issued.verifyUrl,
            debug: true,
            message:
              "Письмо не отправляется: включён LOYALTY_MAGIC_LINK_DEBUG. Откройте ссылку ниже.",
          }
        : deliveryMeta.mode === "none"
          ? {
              message:
                "Ссылка создана, но SMTP/Postbox ещё не настроен — письмо не уйдёт.",
            }
          : delivered.ok
          ? {
              message: "Если email верный, проверьте почту.",
            }
          : {
              message: "Не удалось отправить письмо. Попробуйте позже.",
              sendError: true,
            }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[loyalty/auth/request-link]", message);
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}
