"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Refresca el cache para que el header note que ya no hay sesión
  revalidatePath("/", "layout");
  redirect("/");
}
