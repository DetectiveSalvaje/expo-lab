"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deletePhoto } from "./actions";

type Props = { photoId: string };

export function PhotoActions({ photoId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const ok = window.confirm(
      "¿Seguro que quieres eliminar esta foto? Esta acción no se puede deshacer.",
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deletePhoto(photoId);
      if (result?.error) {
        window.alert(result.error);
      }
      // Si tiene éxito, la action ya redirige al perfil
    });
  }

  return (
    <div className="mt-6 flex items-center gap-2 border-t border-border pt-6">
      <Button variant="secondary" size="sm" href={`/p/${photoId}/edit`}>
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="text-accent hover:bg-accent/10"
      >
        {isPending ? "Eliminando…" : "Eliminar"}
      </Button>
    </div>
  );
}
