import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest, response: NextResponse) {
  // Use the passed response instead of creating a new one
  // let supabaseResponse = NextResponse.next({ request }); <--- Removed

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Apply to the passed response
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  console.log("Middleware: User status", { 
      hasUser: !!user, 
      path: request.nextUrl.pathname,
      error: error?.message 
  });

  // Protect /game/* routes — redirect to login if not authenticated
  const isGameRoute = /\/game\//.test(request.nextUrl.pathname);
  const locale = request.nextUrl.pathname.split("/")[1];

  if (isGameRoute) {
     // 1. Auth Check
     if (!user) {
        const url = request.nextUrl.clone();
        const nextPath = url.pathname;
        
        url.pathname = `/${locale}/login`;
        url.searchParams.set("next", nextPath);
        
        return NextResponse.redirect(url);
     }

     // 2. Weekend Check (S2-05)
     // Dynamically import to ensure fresh evaluation or just use the utility
     // Note: In middleware we might face issues with environment variables if not bundled correctly, 
     // but utility functions are standard.
     const { isWeekendActive } = await import("@/lib/utils/weekend");
     
     if (!isWeekendActive()) {
         // Redirect to home with a query param or just home
         const url = request.nextUrl.clone();
         url.pathname = `/${locale}`;
         // Optional: Add a query param to show a toast "come back later"
         // url.searchParams.set("error", "weekend_only");
         return NextResponse.redirect(url);
     }
  }

  return response;
}
