import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getDb } from "@/server/db/client";
import { STAFF_COOKIE_NAME } from "@/server/staff/auth";
import { revokeStaffSession } from "@/server/staff/sessions";

async function logoutAction() {
  "use server";
  const store = await cookies();
  const raw = store.get(STAFF_COOKIE_NAME)?.value ?? null;
  try {
    await revokeStaffSession(getDb(), raw);
  } catch {
    /* clear cookie anyway */
  }
  store.set(STAFF_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
  redirect("/staff");
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm">
        Выйти
      </Button>
    </form>
  );
}
