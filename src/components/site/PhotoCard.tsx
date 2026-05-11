"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { PhotoMetaButton } from "@/components/ui/PhotoMetaButton";
import { PhotoActionBar } from "@/components/photo/PhotoActionBar";
import { CommentForm } from "@/components/photo/CommentForm";
import { CommentItem } from "@/components/photo/CommentItem";
import { getPhotoComments, type FeedComment } from "@/app/actions/comments";
import type { FeedPhoto } from "@/app/actions/photos";

type Props = {
  photo: FeedPhoto;
  href: string;
  isAuthenticated: boolean;
  currentUserId: string | null;
};

const PREVIEW_COUNT = 3;

export function PhotoCard({ photo, href, isAuthenticated, currentUserId }: Props) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<FeedComment[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [commentsCount, setCommentsCount] = useState(photo.comments_count);
  const [isLoadingComments, startLoadComments] = useTransition();

  function handleCommentClick() {
    setOpen(true);
    // Cargar comentarios la primera vez
    if (comments === null && photo.comments_count > 0) {
      startLoadComments(async () => {
        const fetched = await getPhotoComments(photo.id);
        setComments(fetched);
      });
    }
  }

  function handleCommentAdded(comment: FeedComment) {
    setCommentsCount((c) => c + 1);
    // Newest first → insertar al inicio
    setComments((prev) => (prev ? [comment, ...prev] : [comment]));
  }

  function handleCommentDeleted(commentId: string) {
    setCommentsCount((c) => Math.max(0, c - 1));
    setComments((prev) =>
      prev ? prev.filter((c) => c.id !== commentId) : prev,
    );
  }

  const visibleComments = comments
    ? expanded
      ? comments
      : comments.slice(0, PREVIEW_COUNT)
    : [];
  const hiddenCount = comments ? comments.length - visibleComments.length : 0;

  const postedAt = new Date(photo.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article>
      <header className="mb-4 flex items-center gap-3">
        <Link
          href={`/u/${photo.author.username}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Avatar
            username={photo.author.username}
            fullName={photo.author.full_name}
            avatarUrl={photo.author.avatar_url}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium leading-tight">
              {photo.author.full_name ?? photo.author.username}
            </p>
            <p className="font-mono text-xs leading-tight text-muted">
              @{photo.author.username}
            </p>
          </div>
        </Link>
        <span className="ml-auto font-mono text-xs uppercase tracking-wider text-muted">
          {postedAt}
        </span>
      </header>

      <PhotoCarousel
        images={photo.images.map((img) => ({
          url: img.url,
          width: img.width,
          height: img.height,
          alt: photo.title ?? `Foto de @${photo.author.username}`,
        }))}
      />

      <div className="mt-3">
        <PhotoActionBar
          photoId={photo.id}
          likesCount={photo.likes_count}
          commentsCount={commentsCount}
          hasLiked={photo.has_liked}
          hasSaved={photo.has_saved}
          isAuthenticated={isAuthenticated}
          onCommentClick={handleCommentClick}
        />
      </div>

      {(photo.title || photo.description) && (
        <div className="mt-2 flex items-start justify-between gap-4">
          <div className="flex-1">
            {photo.title && (
              <h2 className="text-base font-semibold tracking-tight">
                <Link
                  href={href}
                  className="underline-offset-4 hover:underline"
                >
                  {photo.title}
                </Link>
              </h2>
            )}
            {photo.description && (
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">
                {photo.description}
              </p>
            )}
          </div>
          <PhotoMetaButton
            medium={photo.medium}
            camera={photo.camera}
            lens={photo.lens}
            aperture={photo.aperture}
            iso={photo.iso}
            shutterSpeed={photo.shutter_speed}
          />
        </div>
      )}

      {/* Form + comentarios — todo se despliega al clicar 💬 */}
      {open && (
        <div className="mt-4 space-y-4">
          {isAuthenticated ? (
            <CommentForm
              photoId={photo.id}
              autoFocus
              onAdded={handleCommentAdded}
            />
          ) : (
            <p className="rounded-2xl border border-border bg-muted-soft px-4 py-3 text-sm text-muted">
              <Link
                href="/login"
                className="text-foreground underline underline-offset-4"
              >
                Inicia sesión
              </Link>{" "}
              para comentar.
            </p>
          )}

          {isLoadingComments && comments === null && (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Cargando…
            </p>
          )}

          {visibleComments.length > 0 && (
            <ul className="flex flex-col gap-4">
              {visibleComments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  photoId={photo.id}
                  currentUserId={currentUserId}
                  onDeleted={handleCommentDeleted}
                />
              ))}
            </ul>
          )}

          {!expanded && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-xs text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Ver los {commentsCount} comentarios
            </button>
          )}
        </div>
      )}
    </article>
  );
}
