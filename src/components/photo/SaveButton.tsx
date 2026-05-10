"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSave } from "@/app/actions/saves";
import { cn } from "@/lib/utils";

type Props = {
  photoId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
};

export function SaveButton({
  photoId,
  initialSaved,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticSaved, applyOptimistic] = useOptimistic<boolean, void>(
    initialSaved,
    (saved) => !saved,
  );

  function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      applyOptimistic();
      const result = await toggleSave(photoId);
      if (!result.ok) {
        console.error("[SaveButton]", result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center justify-center rounded-full p-2 transition-colors",
        "hover:bg-muted-soft",
        optimisticSaved ? "text-accent" : "text-muted hover:text-foreground",
      )}
      aria-pressed={optimisticSaved}
      aria-label={optimisticSaved ? "Quitar de favoritos" : "Guardar en favoritos"}
    >
      <BookmarkIcon filled={optimisticSaved} />
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 1.5 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
