
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin-check";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user || !isAdmin(user.email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center bg-surface-900/50 p-4 rounded-xl border border-white/10">
        <div>
           <h1 className="text-2xl font-bold text-primary-400">Admin Dashboard</h1>
           <p className="text-xs text-slate-400">Restricted Area</p>
        </div>
        <div className="flex gap-4">
           {/* Add admin nav links here later */}
        </div>
      </div>
      {children}
    </div>
  );
}
