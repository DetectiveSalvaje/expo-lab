"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddCommentResult =
  | { ok: true; commentId: string }
  | { ok: false; error: string };

export async function addComment(
  photoId: string,
  body: string,
): Promise<AddCommentResult> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "El comentario está vacío." };
  if (trimmed.length > 1000) {
    return { ok: false, error: "Máximo 1000 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión para comentar." };

  const { data, error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, photo_id: photoId, body: trimmed })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Error al comentar." };
  }

  revalidatePath(`/p/${photoId}`);
  return { ok: true, commentId: data.id };
}

export async function deleteComment(
  commentId: string,
  photoId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  // RLS valida que solo el dueño pueda borrar
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) return { error: error.message };

  revalidatePath(`/p/${photoId}`);
  return {};
}
