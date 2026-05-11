"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "@/app/actions/follows";
import { cn } from "@/lib/utils";

type Props = {
  targetUserId: string;
  initialFollowing: boolean;
  isAuthenticated: boolean;
};

export function FollowButton({
  targetUserId,
  initialFollowing,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useState(initialFollowing);

  function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const prev = following;
    setFollowing(!prev);

    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if (!result.ok) {
        setFollowing(prev);
        console.error("[FollowButton]", result.error);
      } else {
        setFollowing(result.following);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={following}
      className={cn(
        "group inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:opacity-50 disabled:pointer-events-none",
        following
          ? "border border-border bg-transparent text-foreground hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
          : "bg-foreground text-background hover:opacity-85",
      )}
    >
      {following ? (
        <>
          <span className="group-hover:hidden">Siguiendo</span>
          <span className="hidden group-hover:inline">Dejar de seguir</span>
        </>
      ) : (
        <span>Seguir</span>
      )}
    </button>
  );
}
