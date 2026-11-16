import { cookies } from "next/headers";
import { getDb } from "@/server/db/client";
import {
  MEMBER_SESSION_COOKIE,
  resolveMemberSession,
} from "./magic-link";

export async function requireMemberSession(): Promise<
  | {
      ok: true;
      member: NonNullable<Awaited<ReturnType<typeof resolveMemberSession>>>;
    }
  | { ok: false; response: Response }
> {
  const token = (await cookies()).get(MEMBER_SESSION_COOKIE)?.value ?? null;
  try {
    const member = await resolveMemberSession(getDb(), token);
    if (!member) {
      return {
        ok: false,
        response: Response.json(
          { ok: false, code: "unauthorized" },
          { status: 401 },
        ),
      };
    }
    return { ok: true, member };
  } catch (err) {
    console.error(
      "[loyalty/member-auth]",
      err instanceof Error ? err.message : err,
    );
    return {
      ok: false,
      response: Response.json(
        { ok: false, code: "db_error" },
        { status: 503 },
      ),
    };
  }
}
