import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // /staff is a private non-locale admin surface (not next-intl routed).
  matcher: "/((?!api|staff|trpc|_next|_vercel|.*\\..*).*)",
};
