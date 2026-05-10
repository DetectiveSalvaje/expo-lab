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
  likes_count: number;
  has_liked: boolean;
  has_saved: boolean;
};

type LoadOpts = {
  cursor: string;
  excludeId?: string;
  authorId?: string;
};

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

  const photos = data ?? [];
  if (photos.length === 0) return [];

  const photoIds = photos.map((p) => p.id);

  // Conteo de likes por foto
  const { data: likesData } = await supabase
    .from("likes")
    .select("photo_id")
    .in("photo_id", photoIds);

  const likesCountMap = new Map<string, number>();
  for (const row of likesData ?? []) {
    likesCountMap.set(row.photo_id, (likesCountMap.get(row.photo_id) ?? 0) + 1);
  }

  // Estado del usuario actual (si está logueado)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userLiked = new Set<string>();
  let userSaved = new Set<string>();

  if (user) {
    const [likedRes, savedRes] = await Promise.all([
      supabase
        .from("likes")
        .select("photo_id")
        .eq("user_id", user.id)
        .in("photo_id", photoIds),
      supabase
        .from("saves")
        .select("photo_id")
        .eq("user_id", user.id)
        .in("photo_id", photoIds),
    ]);

    userLiked = new Set((likedRes.data ?? []).map((r) => r.photo_id));
    userSaved = new Set((savedRes.data ?? []).map((r) => r.photo_id));
  }

  return photos.map((p) => {
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
      likes_count: likesCountMap.get(p.id) ?? 0,
      has_liked: userLiked.has(p.id),
      has_saved: userSaved.has(p.id),
    };
  });
}

export async function loadInitialPhotos(
  opts: { excludeId?: string; authorId?: string } = {},
): Promise<FeedPhoto[]> {
  const farFuture = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return loadMorePhotos({ cursor: farFuture, ...opts });
}
