import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { STAFF_COOKIE_NAME } from "@/server/staff/auth";

async function logoutAction() {
  "use server";
  const store = await cookies();
  store.set(STAFF_COOKIE_NAME, "", { path: "/", maxAge: 0 });
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
