import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  isMagicLinkDebugEnabled,
  issueMagicLink,
} from "@/server/loyalty/magic-link";
import {
  deliverMagicLinkEmail,
  getMagicLinkDelivery,
} from "@/server/loyalty/mail";
import {
  AUTH_JSON_MAX_BYTES,
  boundaryJsonResponse,
  checkRateLimit,
  clientIpFromRequest,
  MAGIC_LINK_RATE,
  readJsonBody,
} from "@/server/http/public-boundary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Request a P1 magic link for member LK.
 * Local-only debug (R04): verifyUrl in response when isMagicLinkDebugEnabled().
 * Production email = SMTP now / Postbox later — never debug on deployment-like hosts.
 */
export async function POST(request: Request) {
  const limited = checkRateLimit({
    key: `magic-link:${clientIpFromRequest(request)}`,
    ...MAGIC_LINK_RATE,
  });
  if (!limited.ok) return boundaryJsonResponse(limited);

  const parsed = await readJsonBody(request, AUTH_JSON_MAX_BYTES);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, code: parsed.code, message: parsed.message },
      { status: parsed.status },
    );
  }

  const email =
    parsed.value &&
    typeof parsed.value === "object" &&
    "email" in parsed.value
      ? String((parsed.value as { email?: unknown }).email ?? "")
      : "";

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
    const debugOk = isMagicLinkDebugEnabled();
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
      ...(debugOk && deliveryMeta.mode === "debug"
        ? {
            verifyUrl: issued.verifyUrl,
            debug: true,
            message:
              "Письмо не отправляется: локальный debug. Откройте ссылку ниже.",
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
