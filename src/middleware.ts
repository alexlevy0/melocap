import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase session (also protects /game/* routes)
  const supabaseResponse = await updateSession(request);

  // If Supabase middleware returned a redirect, honour it
  if (supabaseResponse.status !== 200) {
    return supabaseResponse;
  }

  // 2. Apply next-intl locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|auth|.*\\..*).*)",
  ],
};
