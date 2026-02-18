
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin-check";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations("admin");

  if (!user || !isAdmin(user.email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center bg-surface-900/50 p-4 rounded-xl border border-white/10">
        <div>
           <h1 className="text-2xl font-bold text-primary-400">{t("dashboard_title")}</h1>
           <p className="text-xs text-slate-400">{t("restricted_area")}</p>
        </div>
        <div className="flex gap-4">
           {/* Add admin nav links here later */}
        </div>
      </div>
      {children}
    </div>
  );
}
