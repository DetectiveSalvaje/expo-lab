"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { addComment, type FeedComment } from "@/app/actions/comments";

type Props = {
  photoId: string;
  /** Si está true al renderizar, hace autofocus en el textarea. */
  autoFocus?: boolean;
  /** Callback opcional al añadir un comentario (para actualizar estado del padre). */
  onAdded?: (comment: FeedComment) => void;
};

export function CommentForm({ photoId, autoFocus, onAdded }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    if (trimmed.length > 1000) {
      setError("Máximo 1000 caracteres.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await addComment(photoId, trimmed);
      if (result.ok) {
        setBody("");
        onAdded?.(result.comment);
        // Refresca Server Components (ej: CommentsList en /p/[id])
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        ref={textareaRef}
        name="body"
        rows={3}
        placeholder="Escribe tu comentario…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={1000}
        disabled={isPending}
      />
      {error && (
        <p className="text-xs text-accent" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">
          {body.length} / 1000
        </span>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isPending || !body.trim()}
        >
          {isPending ? "Comentando…" : "Comentar"}
        </Button>
      </div>
    </form>
  );
}
