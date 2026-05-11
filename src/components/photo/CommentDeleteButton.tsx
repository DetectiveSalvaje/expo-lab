"use client";

import { useTransition } from "react";
import { deleteComment } from "@/app/actions/comments";

type Props = { commentId: string; photoId: string };

export function CommentDeleteButton({ commentId, photoId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("¿Eliminar este comentario? No se puede deshacer.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteComment(commentId, photoId);
      if (result?.error) window.alert(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-muted underline-offset-4 transition-colors hover:text-accent hover:underline disabled:opacity-50"
    >
      {isPending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
