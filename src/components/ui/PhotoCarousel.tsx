"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type CarouselImage = {
  url: string;
  width: number | null;
  height: number | null;
  alt?: string;
};

type Props = {
  images: CarouselImage[];
  /** Si es la primera carga del documento, prioriza su carga. Default false. */
  priority?: boolean;
  className?: string;
};

/**
 * Carrusel horizontal con scroll-snap nativo.
 * - Touch en mobile y flechas/dots en desktop.
 * - Detecta el slide actual con IntersectionObserver.
 * - Sin bordes redondeados (mantiene aspecto original).
 * - Edge-to-edge en mobile (rompe el padding del padre vía -mx-6).
 */
export function PhotoCarousel({ images, priority, className }: Props) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  const first = images[0];
  const aspectRatio =
    first?.width && first?.height
      ? `${first.width} / ${first.height}`
      : "4 / 3";

  useEffect(() => {
    if (images.length <= 1) return;
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best = { idx: -1, ratio: 0 };
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > best.ratio) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.slideIndex,
            );
            if (!Number.isNaN(idx)) {
              best = { idx, ratio: entry.intersectionRatio };
            }
          }
        }
        if (best.idx >= 0) setCurrent(best.idx);
      },
      {
        root,
        threshold: [0.5, 0.7, 0.9],
      },
    );

    const slides = slideRefs.current.filter(
      (s): s is HTMLDivElement => s !== null,
    );
    slides.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, [images.length]);

  function scrollToIndex(idx: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
  }

  if (images.length === 0) return null;

  // Una sola imagen
  if (images.length === 1) {
    const img = images[0];
    return (
      <div
        className={cn(
          "-mx-6 w-screen overflow-hidden bg-muted-soft sm:mx-0 sm:w-full",
          className,
        )}
      >
        <Image
          src={img.url}
          alt={img.alt ?? ""}
          width={img.width ?? 1600}
          height={img.height ?? 1200}
          className="no-touch-save block h-auto w-full"
          sizes="(max-width: 768px) 100vw, 768px"
          priority={priority}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-6 flex w-screen snap-x snap-mandatory overflow-x-auto bg-muted-soft scroll-smooth sm:mx-0 sm:w-full"
        style={{ aspectRatio }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            ref={(el) => {
              slideRefs.current[idx] = el;
            }}
            data-slide-index={idx}
            className="flex h-full w-full flex-none snap-center items-center justify-center"
          >
            <Image
              src={img.url}
              alt={img.alt ?? ""}
              width={img.width ?? 1600}
              height={img.height ?? 1200}
              className="no-touch-save max-h-full max-w-full object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
              priority={priority && idx === 0}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Flechas (desktop only) */}
      <button
        type="button"
        onClick={() => scrollToIndex(Math.max(0, current - 1))}
        disabled={current === 0}
        className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-opacity hover:bg-black/70 disabled:opacity-0 sm:flex"
        aria-label="Imagen anterior"
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        onClick={() =>
          scrollToIndex(Math.min(images.length - 1, current + 1))
        }
        disabled={current === images.length - 1}
        className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-opacity hover:bg-black/70 disabled:opacity-0 sm:flex"
        aria-label="Imagen siguiente"
      >
        <ChevronRight />
      </button>

      {/* Dots indicador */}
      <div className="mt-3 flex justify-center gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollToIndex(idx)}
            className={cn(
              "h-1.5 rounded-full touch-manipulation",
              "transition-[width,background-color] duration-[420ms]",
              "ease-[cubic-bezier(0.34,1.42,0.64,1)]",
              idx === current ? "w-6 bg-foreground" : "w-1.5 bg-border",
            )}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="10 12 6 8 10 4" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 4 10 8 6 12" />
    </svg>
  );
}
