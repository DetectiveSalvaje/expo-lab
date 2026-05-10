"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { deletePhoto } from "./actions";

type Props = { photoId: string };

export function PhotoActions({ photoId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar con click fuera o Esc
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function handleDelete() {
    setOpen(false);
    const ok = window.confirm(
      "¿Seguro que quieres eliminar esta foto? Esta acción no se puede deshacer.",
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deletePhoto(photoId);
      if (result?.error) window.alert(result.error);
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted-soft hover:text-foreground"
        aria-label="Más opciones"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={isPending}
      >
        <DotsIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-2xl border border-border bg-background py-1 shadow-lg"
        >
          <Link
            href={`/p/${photoId}/edit`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-muted-soft"
          >
            Editar
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleDelete}
            disabled={isPending}
            className="flex w-full items-center px-4 py-2 text-left text-sm text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      )}
    </div>
  );
}

function DotsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}
