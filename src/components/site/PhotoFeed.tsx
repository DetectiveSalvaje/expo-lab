"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadMorePhotos, type FeedPhoto } from "@/app/actions/photos";
import { FEED_PAGE_SIZE } from "@/lib/feed-config";
import { PhotoCard } from "./PhotoCard";

type Props = {
  initialPhotos: FeedPhoto[];
  fromContext?: string | null;
  excludeId?: string;
  authorId?: string;
  isAuthenticated: boolean;
  currentUserId: string | null;
};

export function PhotoFeed({
  initialPhotos,
  fromContext,
  excludeId,
  authorId,
  isAuthenticated,
  currentUserId,
}: Props) {
  const [photos, setPhotos] = useState<FeedPhoto[]>(initialPhotos);
  const [hasMore, setHasMore] = useState(initialPhotos.length === FEED_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadNext = useCallback(async () => {
    if (!hasMore || isLoading || photos.length === 0) return;
    setIsLoading(true);
    const cursor = photos[photos.length - 1].created_at;
    const next = await loadMorePhotos({ cursor, excludeId, authorId });
    if (next.length === 0) {
      setHasMore(false);
    } else {
      setPhotos((prev) => [...prev, ...next]);
      if (next.length < FEED_PAGE_SIZE) setHasMore(false);
    }
    setIsLoading(false);
  }, [hasMore, isLoading, photos, excludeId, authorId]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadNext();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadNext]);

  function buildHref(photoId: string) {
    if (!fromContext) return `/p/${photoId}`;
    return `/p/${photoId}?from=${encodeURIComponent(fromContext)}`;
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Vacío
        </p>
        <p className="mt-3 text-sm text-muted">
          Todavía no hay publicaciones por aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {photos.map((p) => (
        <PhotoCard
          key={p.id}
          photo={p}
          href={buildHref(p.id)}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
        />
      ))}

      {hasMore ? (
        <div
          ref={sentinelRef}
          className="flex justify-center py-8"
          aria-live="polite"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {isLoading ? "Cargando…" : ""}
          </span>
        </div>
      ) : (
        <p className="py-8 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Has visto todo
        </p>
      )}
    </div>
  );
}
