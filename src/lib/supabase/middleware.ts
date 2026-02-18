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
  const isGameRoute = request.nextUrl.pathname.match(/\/game\//);
  if (isGameRoute && !user) {
    const url = request.nextUrl.clone();
    const nextPath = url.pathname;
    const locale = nextPath.split("/")[1];
    
    url.pathname = `/${locale}/login`;
    url.searchParams.set("next", nextPath);
    
    return NextResponse.redirect(url);
  }

  return response;
}
