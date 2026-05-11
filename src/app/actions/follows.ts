"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ToggleFollowResult =
  | { ok: true; following: boolean }
  | { ok: false; error: string };

export async function toggleFollow(
  targetUserId: string,
): Promise<ToggleFollowResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión para seguir." };
  if (user.id === targetUserId) {
    return { ok: false, error: "No puedes seguirte a ti mismo." };
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true, following: false };
  } else {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: targetUserId });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true, following: true };
  }
}
