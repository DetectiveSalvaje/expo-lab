"use client";

import { useEffect, useRef, useState } from "react";

type PhotoMeta = {
  medium: "digital" | "analog" | null;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  iso: number | null;
  shutterSpeed: string | null;
};

/**
 * Botón circular con "i" que despliega la ficha técnica.
 * Se abre con click; se cierra con click fuera o Esc.
 * En desktop también muestra hover state visual.
 */
export function PhotoMetaButton(props: PhotoMeta) {
  const { medium, camera, lens, aperture, iso, shutterSpeed } = props;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
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

  // Si no hay ningún campo técnico, no renderizamos nada
  const hasAnyMeta =
    medium || camera || lens || aperture || iso !== null || shutterSpeed;
  if (!hasAnyMeta) return null;

  const isoLabel = medium === "analog" ? "ASA" : "ISO";

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background font-mono text-sm italic text-muted transition-colors hover:bg-muted-soft hover:text-foreground"
        aria-label="Ficha técnica"
        aria-expanded={open}
      >
        i
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-0 top-full z-10 mt-2 w-72 rounded-2xl border border-border bg-background p-5 shadow-lg"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Ficha técnica
          </p>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            {medium && (
              <Row
                label="Soporte"
                value={medium === "digital" ? "Digital" : "Análogo"}
              />
            )}
            {camera && <Row label="Cámara" value={camera} />}
            {lens && <Row label="Lente" value={lens} />}
            {aperture && <Row label="Apertura" value={aperture} />}
            {iso !== null && <Row label={isoLabel} value={String(iso)} />}
            {shutterSpeed && <Row label="Velocidad" value={shutterSpeed} />}
          </dl>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="font-mono text-xs uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
