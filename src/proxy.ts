import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - /api routes
  // - /_next (Next.js internals)
  // - /auth (Supabase auth callback — no locale prefix)
  // - static files (images, fonts, etc.)
  matcher: [
    String.raw`/((?!api|_next|auth|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)).*)`,
  ],
};
