import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and files with an extension (e.g. favicon.ico)
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
