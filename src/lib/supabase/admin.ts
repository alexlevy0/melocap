import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Admin client using the service_role key.
 * ONLY use in Edge Functions / server-side CRON jobs.
 * NEVER expose this client to the browser.
 * Bypasses RLS — use with extreme caution.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. This client is only for server-side use."
    );
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
