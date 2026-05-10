"use server";

import { createClient } from "@/lib/supabase/server";
import { FEED_PAGE_SIZE } from "@/lib/feed-config";

export type FeedImage = {
  url: string;
  width: number | null;
  height: number | null;
  position: number;
};

export type FeedPhoto = {
  id: string;
  title: string | null;
  description: string | null;
  created_at: string;
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  images: FeedImage[];
};

type LoadOpts = {
  /** ISO date string. Devuelve fotos creadas estrictamente antes de este momento. */
  cursor: string;
  /** Excluir una foto específica (la que se está viendo en el detalle). */
  excludeId?: string;
  /** Filtrar por autor (perfil context). */
  authorId?: string;
};

/**
 * Carga la siguiente tanda de publicaciones del feed.
 *
 * Algoritmo actual: simple cronológico — más reciente primero.
 *
 * TODO (cuando exista likes/comentarios):
 *   ORDER BY (
 *     (likes_count + 2 * comments_count + 1)
 *     / power(extract(epoch from (now() - created_at)) / 3600 + 2, 1.5)
 *   ) DESC
 */
export async function loadMorePhotos(opts: LoadOpts): Promise<FeedPhoto[]> {
  const { cursor, excludeId, authorId } = opts;
  const supabase = await createClient();

  let query = supabase
    .from("photos")
    .select(
      `
      id, title, description, created_at,
      author:profiles!user_id ( id, username, full_name, avatar_url ),
      images:photo_images ( storage_path, width, height, position )
    `,
    )
    .lt("created_at", cursor)
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  if (excludeId) query = query.neq("id", excludeId);
  if (authorId) query = query.eq("user_id", authorId);

  const { data, error } = await query;

  if (error) {
    console.error("[loadMorePhotos]", error.message);
    return [];
  }

  return (data ?? []).map((p) => {
    const author = Array.isArray(p.author) ? p.author[0] : p.author;
    const sorted = [...(p.images ?? [])].sort(
      (a, b) => a.position - b.position,
    );
    const images: FeedImage[] = sorted.map((img) => {
      const { data } = supabase.storage
        .from("photos")
        .getPublicUrl(img.storage_path);
      return {
        url: data.publicUrl,
        width: img.width,
        height: img.height,
        position: img.position,
      };
    });
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      created_at: p.created_at,
      author,
      images,
    };
  });
}

/**
 * Carga la primera tanda. Atajo para evitar pasar un cursor "lejano" desde la página.
 */
export async function loadInitialPhotos(opts: {
  excludeId?: string;
  authorId?: string;
} = {}): Promise<FeedPhoto[]> {
  const farFuture = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return loadMorePhotos({ cursor: farFuture, ...opts });
}
