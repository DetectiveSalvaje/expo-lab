"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLike } from "@/app/actions/likes";
import { cn } from "@/lib/utils";

type Props = {
  photoId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
};

export function LikeButton({
  photoId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [animating, setAnimating] = useState(false);

  // Estado local: fuente de verdad después del primer render.
  // No depende de las props del padre, así sobrevive a re-renderizados
  // del Client Component contenedor (PhotoFeed) que tiene su propio estado.
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Animación visual
    setAnimating(true);
    setTimeout(() => setAnimating(false), 360);

    // Guardamos previo por si hay que revertir
    const prevLiked = liked;
    const prevCount = count;

    // Optimistic update — instantáneo y persistente
    setLiked(!prevLiked);
    setCount(Math.max(0, prevCount + (prevLiked ? -1 : 1)));

    startTransition(async () => {
      const result = await toggleLike(photoId);
      if (!result.ok) {
        // Revertimos al estado previo
        setLiked(prevLiked);
        setCount(prevCount);
        console.error("[LikeButton]", result.error);
      } else {
        // Sincronizamos con el servidor por si hay desfase
        // (caso raro: doble click muy rápido)
        setLiked(result.liked);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors",
        "hover:bg-muted-soft disabled:opacity-100",
        liked ? "text-accent" : "text-muted hover:text-foreground",
      )}
      aria-pressed={liked}
      aria-label={liked ? "Quitar me gusta" : "Dar me gusta"}
    >
      <ApertureIcon active={liked} animating={animating} />
      <span className="font-mono text-sm tabular-nums">{count}</span>
    </button>
  );
}

function ApertureIcon({
  active,
  animating,
}: {
  active: boolean;
  animating: boolean;
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(animating && "animate-shutter")}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m14.31 8 5.74 9.94" />
      <path d="M9.69 8h11.48" />
      <path d="m7.38 12 5.74-9.94" />
      <path d="M9.69 16 3.95 6.06" />
      <path d="M14.31 16H2.83" />
      <path d="m16.62 12-5.74 9.94" />
    </svg>
  );
}
