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
 * - Funciona con touch en móvil sin librerías.
 * - Flechas en desktop, dots e indicador de posición.
 * - Si solo hay 1 imagen, se renderiza como una sola foto sin controles.
 */
export function PhotoCarousel({ images, priority, className }: Props) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Aspect ratio del contenedor: usamos el de la primera imagen
  const first = images[0];
  const aspectRatio =
    first?.width && first?.height
      ? `${first.width} / ${first.height}`
      : "4 / 3";

  // Detectar el slide actual mientras el usuario scrollea
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!el) return;
        const w = el.clientWidth;
        const idx = Math.round(el.scrollLeft / w);
        setCurrent(idx);
      });
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function scrollToIndex(idx: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
  }

  if (images.length === 0) return null;

  // Caso simple: una sola imagen
  if (images.length === 1) {
    const img = images[0];
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-muted-soft",
          className,
        )}
      >
        <Image
          src={img.url}
          alt={img.alt ?? ""}
          width={img.width ?? 1600}
          height={img.height ?? 1200}
          className="block h-auto w-full"
          sizes="(max-width: 768px) 100vw, 768px"
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={scrollRef}
        className="flex w-full snap-x snap-mandatory overflow-x-auto rounded-2xl bg-muted-soft scroll-smooth"
        style={{ aspectRatio }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className="flex h-full w-full flex-none snap-center items-center justify-center"
          >
            <Image
              src={img.url}
              alt={img.alt ?? ""}
              width={img.width ?? 1600}
              height={img.height ?? 1200}
              className="max-h-full max-w-full object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
              priority={priority && idx === 0}
            />
          </div>
        ))}
      </div>

      {/* Contador */}
      <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 font-mono text-xs text-white backdrop-blur">
        {current + 1} / {images.length}
      </div>

      {/* Flechas (desktop) */}
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

      {/* Dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollToIndex(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
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
