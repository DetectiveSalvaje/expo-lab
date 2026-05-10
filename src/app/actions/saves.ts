"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ToggleSaveResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: string };

/**
 * Alterna el "guardado" (favorito privado) del usuario en una foto.
 */
export async function toggleSave(photoId: string): Promise<ToggleSaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión para guardar fotos." };

  const { data: existing } = await supabase
    .from("saves")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("photo_id", photoId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saves")
      .delete()
      .eq("user_id", user.id)
      .eq("photo_id", photoId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true, saved: false };
  } else {
    const { error } = await supabase
      .from("saves")
      .insert({ user_id: user.id, photo_id: photoId });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true, saved: true };
  }
}
