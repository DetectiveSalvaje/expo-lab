"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLike } from "@/app/actions/likes";
import { cn } from "@/lib/utils";

type Props = {
  photoId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
};

type State = { liked: boolean; count: number };

export function LikeButton({
  photoId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [animating, setAnimating] = useState(false);

  const [optimistic, applyOptimistic] = useOptimistic<State, void>(
    { liked: initialLiked, count: initialCount },
    (state) => ({
      liked: !state.liked,
      count: Math.max(0, state.count + (state.liked ? -1 : 1)),
    }),
  );

  function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Animación
    setAnimating(true);
    setTimeout(() => setAnimating(false), 360);

    startTransition(async () => {
      applyOptimistic();
      const result = await toggleLike(photoId);
      if (!result.ok) {
        // Si falló, useOptimistic se revierte automáticamente al terminar la transición.
        console.error("[LikeButton]", result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending && !animating}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors",
        "hover:bg-muted-soft",
        optimistic.liked ? "text-accent" : "text-muted hover:text-foreground",
      )}
      aria-pressed={optimistic.liked}
      aria-label={
        optimistic.liked
          ? "Quitar me gusta"
          : "Dar me gusta"
      }
    >
      <ApertureIcon active={optimistic.liked} animating={animating} />
      <span className="font-mono text-sm tabular-nums">{optimistic.count}</span>
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
