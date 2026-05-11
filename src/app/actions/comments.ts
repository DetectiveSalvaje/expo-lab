"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FeedComment = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  author: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type AddCommentResult =
  | { ok: true; comment: FeedComment }
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
    .select(
      `
      id, body, created_at, user_id,
      author:profiles!user_id ( username, full_name, avatar_url )
    `,
    )
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Error al comentar." };
  }

  const author = Array.isArray(data.author) ? data.author[0] : data.author;
  const comment: FeedComment = {
    id: data.id,
    body: data.body,
    created_at: data.created_at,
    user_id: data.user_id,
    author,
  };

  revalidatePath(`/p/${photoId}`);
  return { ok: true, comment };
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

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) return { error: error.message };

  revalidatePath(`/p/${photoId}`);
  return {};
}

/**
 * Carga los comentarios de una foto en orden cronológico inverso (más recientes primero).
 * Usado para expandir comentarios inline en feed cards.
 */
export async function getPhotoComments(
  photoId: string,
): Promise<FeedComment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      id, body, created_at, user_id,
      author:profiles!user_id ( username, full_name, avatar_url )
    `,
    )
    .eq("photo_id", photoId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPhotoComments]", error.message);
    return [];
  }

  return (data ?? []).map((c) => ({
    id: c.id,
    body: c.body,
    created_at: c.created_at,
    user_id: c.user_id,
    author: Array.isArray(c.author) ? c.author[0] : c.author,
  }));
}
