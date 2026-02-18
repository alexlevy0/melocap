"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/admin-check";
import { ThemeStatus } from "@/types/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTheme(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user || !isAdmin(user.email)) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const weekNumber = parseInt(formData.get("week_number") as string);
  const year = parseInt(formData.get("year") as string);

  if (!title || !weekNumber || !year) {
    throw new Error("Missing required fields");
  }

  const adminSupabase = createAdminClient();
  
  // Check for existing theme with same week/year
  const { data: existing } = await adminSupabase
    .from("weekly_themes")
    .select("id")
    .eq("week_number", weekNumber)
    .eq("year", year)
    .single();

  if (existing) {
    throw new Error(`Theme for Week ${weekNumber}/${year} already exists.`);
  }

  const { error } = await adminSupabase
    .from("weekly_themes")
    .insert({
      title,
      description: description || null,
      week_number: weekNumber,
      year,
      status: "upcoming",
    });

  if (error) {
    console.error("Error creating theme:", error);
    throw new Error(`Failed to create theme: ${error.message} (${error.code})`);
  }

  revalidatePath("/admin/themes");
  redirect("/admin/themes");
}

export async function getThemes() {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user || !isAdmin(user.email)) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await (await supabase)
    .from("weekly_themes")
    .select("*")
    .order("year", { ascending: false })
    .order("week_number", { ascending: false });

  if (error) {
    console.error("Error fetching themes:", error);
    return [];
  }

  return data;
}

export async function updateThemeStatus(id: string, status: ThemeStatus) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user || !isAdmin(user.email)) {
    throw new Error("Unauthorized");
  }

  const adminSupabase = createAdminClient();
  
  const updateData: any = { status };
  
  // Set timestamps based on status transition
  const now = new Date().toISOString();
  if (status === "open") updateData.opened_at = now;
  if (status === "locked") updateData.locked_at = now;
  if (status === "resolving") updateData.resolved_at = now; // Actually resolved_at creates conflicts with finished? No, resolving is before finished.

  const { error } = await adminSupabase
    .from("weekly_themes")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating theme status:", error);
    throw new Error("Failed to update status");
  }

  revalidatePath("/admin/themes");
}
