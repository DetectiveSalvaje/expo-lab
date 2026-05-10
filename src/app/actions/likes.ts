"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ToggleLikeResult =
  | { ok: true; liked: boolean }
  | { ok: false; error: string };

/**
 * Alterna el like del usuario actual en una foto.
 * Si ya tenía like, lo quita. Si no, lo añade.
 */
export async function toggleLike(photoId: string): Promise<ToggleLikeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión para dar me gusta." };

  // ¿Ya existe el like?
  const { data: existing } = await supabase
    .from("likes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("photo_id", photoId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("photo_id", photoId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true, liked: false };
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: user.id, photo_id: photoId });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true, liked: true };
  }
}
