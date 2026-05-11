import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { CommentItem } from "./CommentItem";

type Props = { photoId: string };

/**
 * Lista de comentarios de una foto. Server Component — query corre en servidor.
 * Cada comentario se renderiza con CommentItem (Client Component) que tiene
 * el botón de borrar interactivo.
 */
export async function CommentsList({ photoId }: Props) {
  const supabase = await createClient();
  const session = await getCurrentUser();

  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      id, body, created_at, user_id,
      author:profiles!user_id ( username, full_name, avatar_url )
    `,
    )
    .eq("photo_id", photoId)
    .order("created_at", { ascending: false });

  const items = (comments ?? []).map((c) => ({
    id: c.id,
    body: c.body,
    created_at: c.created_at,
    user_id: c.user_id,
    author: Array.isArray(c.author) ? c.author[0] : c.author,
  }));

  if (items.length === 0) {
    return <p className="text-sm text-muted">Sé el primero en comentar.</p>;
  }

  return (
    <ul className="flex flex-col gap-5">
      {items.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          photoId={photoId}
          currentUserId={session?.user.id ?? null}
        />
      ))}
    </ul>
  );
}
