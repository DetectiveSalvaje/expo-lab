"use client";

import Link from "next/link";
import { useState } from "react";
import { PhotoActionBar } from "./PhotoActionBar";
import { PhotoMetaButton } from "@/components/ui/PhotoMetaButton";
import { CommentForm } from "./CommentForm";
import type { FeedComment } from "@/app/actions/comments";

type Props = {
  photoId: string;
  title: string | null;
  description: string | null;
  medium: "digital" | "analog" | null;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  iso: number | null;
  shutterSpeed: string | null;
  likesCount: number;
  hasLiked: boolean;
  hasSaved: boolean;
  commentsCount: number;
  isAuthenticated: boolean;
  /** El listado de comentarios server-rendered. */
  children?: React.ReactNode;
};

export function PhotoEngagement({
  photoId,
  title,
  description,
  medium,
  camera,
  lens,
  aperture,
  iso,
  shutterSpeed,
  likesCount,
  hasLiked,
  hasSaved,
  commentsCount: initialCount,
  isAuthenticated,
  children,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  // Estado local del contador para feedback instantáneo al añadir/borrar
  const [commentsCount, setCommentsCount] = useState(initialCount);

  function handleCommentClick() {
    setFormOpen(true);
    setTimeout(() => {
      const el = document.getElementById("comment-form-anchor");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector("textarea")?.focus();
    }, 50);
  }

  function handleCommentAdded(_: FeedComment) {
    setCommentsCount((c) => c + 1);
    // El router.refresh dentro de CommentForm hará que CommentsList se re-renderice
  }

  return (
    <>
      <div className="mt-3">
        <PhotoActionBar
          photoId={photoId}
          likesCount={likesCount}
          commentsCount={commentsCount}
          hasLiked={hasLiked}
          hasSaved={hasSaved}
          isAuthenticated={isAuthenticated}
          onCommentClick={handleCommentClick}
        />
      </div>

      {(title || description) && (
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {description}
              </p>
            )}
          </div>
          <PhotoMetaButton
            medium={medium}
            camera={camera}
            lens={lens}
            aperture={aperture}
            iso={iso}
            shutterSpeed={shutterSpeed}
          />
        </div>
      )}

      <section className="mt-6 border-t border-border pt-5">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Comentarios{commentsCount > 0 && ` · ${commentsCount}`}
        </h2>

        {formOpen && isAuthenticated && (
          <div id="comment-form-anchor" className="mb-6">
            <CommentForm
              photoId={photoId}
              autoFocus
              onAdded={handleCommentAdded}
            />
          </div>
        )}

        {!isAuthenticated && (
          <p className="mb-6 rounded-2xl border border-border bg-muted-soft px-4 py-3 text-sm text-muted">
            <Link
              href="/login"
              className="text-foreground underline underline-offset-4"
            >
              Inicia sesión
            </Link>{" "}
            para dejar un comentario.
          </p>
        )}

        {children}
      </section>
    </>
  );
}
