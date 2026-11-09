import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
      <button
        type="submit"
        className="text-xs text-zinc-500 underline hover:text-zinc-300"
      >
        Выйти
      </button>
    </form>
  );
}
