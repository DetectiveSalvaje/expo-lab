"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type NotificationItem = {
  id: string;
  type: "like" | "comment" | "follow";
  photo_id: string | null;
  comment_id: string | null;
  read_at: string | null;
  created_at: string;
  actor: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  comment_body: string | null;
  photo_cover_url: string | null;
};

/**
 * Lista de notificaciones del usuario actual (últimas 50).
 * Es defensivo: si la tabla no existe o RLS bloquea, devuelve [].
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Usamos constraint names explícitos para evitar ambigüedad
    // (notifications tiene dos FKs hacia profiles: actor_id y user_id).
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
        id, type, photo_id, comment_id, read_at, created_at,
        actor:profiles!notifications_actor_id_fkey ( username, full_name, avatar_url ),
        comment:comments!notifications_comment_id_fkey ( body ),
        photo:photos!notifications_photo_id_fkey (
          images:photo_images ( storage_path, position )
        )
        `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[getNotifications]", error.message);
      return [];
    }

    return (data ?? []).map((n) => {
      const actor = Array.isArray(n.actor) ? n.actor[0] : n.actor;
      const comment = Array.isArray(n.comment) ? n.comment[0] : n.comment;
      const photo = Array.isArray(n.photo) ? n.photo[0] : n.photo;

      let cover_url: string | null = null;
      if (photo?.images && photo.images.length > 0) {
        const firstImage = [...photo.images].sort(
          (a, b) => a.position - b.position,
        )[0];
        if (firstImage) {
          const { data } = supabase.storage
            .from("photos")
            .getPublicUrl(firstImage.storage_path);
          cover_url = data.publicUrl;
        }
      }

      return {
        id: n.id,
        type: n.type,
        photo_id: n.photo_id,
        comment_id: n.comment_id,
        read_at: n.read_at,
        created_at: n.created_at,
        actor,
        comment_body: comment?.body ?? null,
        photo_cover_url: cover_url,
      };
    });
  } catch (err) {
    console.error("[getNotifications] uncaught:", err);
    return [];
  }
}

/**
 * Conteo de notificaciones sin leer.
 * Defensivo: cualquier error → 0 (la app sigue funcionando).
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("[getUnreadCount]", error.message);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.error("[getUnreadCount] uncaught:", err);
    return 0;
  }
}

export async function markAllAsRead(): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);

    revalidatePath("/", "layout");
  } catch (err) {
    console.error("[markAllAsRead]", err);
  }
}
