import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { CommentForm } from "./CommentForm";
import { CommentDeleteButton } from "./CommentDeleteButton";

type Props = { photoId: string };

export async function CommentsSection({ photoId }: Props) {
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
    .order("created_at", { ascending: true });

  const items = (comments ?? []).map((c) => ({
    ...c,
    author: Array.isArray(c.author) ? c.author[0] : c.author,
  }));

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        Comentarios {items.length > 0 && `· ${items.length}`}
      </h2>

      {session ? (
        <CommentForm photoId={photoId} />
      ) : (
        <p className="rounded-2xl border border-border bg-muted-soft px-4 py-3 text-sm text-muted">
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4"
          >
            Inicia sesión
          </Link>{" "}
          para dejar un comentario.
        </p>
      )}

      {items.length > 0 ? (
        <ul className="mt-8 flex flex-col gap-6">
          {items.map((c) => {
            const isOwn = session?.user.id === c.user_id;
            const postedAt = new Date(c.created_at).toLocaleDateString(
              "es-ES",
              { day: "numeric", month: "short", year: "numeric" },
            );
            return (
              <li key={c.id} className="flex gap-3">
                <Link
                  href={`/u/${c.author.username}`}
                  className="shrink-0 transition-opacity hover:opacity-80"
                >
                  <Avatar
                    username={c.author.username}
                    fullName={c.author.full_name}
                    avatarUrl={c.author.avatar_url}
                    size="sm"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <Link
                      href={`/u/${c.author.username}`}
                      className="text-sm font-medium hover:underline underline-offset-4"
                    >
                      {c.author.full_name ?? c.author.username}
                    </Link>
                    <span className="font-mono text-xs text-muted">
                      @{c.author.username}
                    </span>
                    <span className="ml-auto font-mono text-xs uppercase tracking-wider text-muted">
                      {postedAt}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {c.body}
                  </p>
                  {isOwn && (
                    <div className="mt-2">
                      <CommentDeleteButton commentId={c.id} photoId={photoId} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-muted">Sé el primero en comentar.</p>
      )}
    </section>
  );
}
