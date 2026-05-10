"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";

type Props = {
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  /** URL de la versión original (sin recortar). Si existe, se usa en el lightbox. */
  avatarOriginalUrl?: string | null;
};

/**
 * Avatar interactivo para el dueño del perfil.
 * - Hover: muestra overlay con icono de lápiz.
 * - Click: dropdown con "Ver foto" y "Editar perfil".
 * - "Ver foto" abre un lightbox con la imagen original (no recortada).
 */
export function AvatarMenu({
  username,
  fullName,
  avatarUrl,
  avatarOriginalUrl,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar menú con click fuera o Esc
  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="group relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Opciones de foto de perfil"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Avatar
            username={username}
            fullName={fullName}
            avatarUrl={avatarUrl}
            size="xl"
          />
          {/* Overlay oscuro con lápiz en hover */}
          <span
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-all duration-200 group-hover:bg-black/40 group-hover:text-white"
            aria-hidden="true"
          >
            <PencilIcon />
          </span>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute left-1/2 top-full z-10 mt-2 w-44 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-background py-1 shadow-lg"
          >
            {avatarUrl && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setLightboxOpen(true);
                }}
                className="flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted-soft"
              >
                Ver foto
              </button>
            )}
            <Link
              href="/settings/profile"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-muted-soft"
            >
              Editar perfil
            </Link>
          </div>
        )}
      </div>

      {lightboxOpen && (avatarOriginalUrl || avatarUrl) && (
        <Lightbox
          src={avatarOriginalUrl || avatarUrl!}
          alt={`Foto de @${username}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  // Cerrar con Esc + bloquear scroll del body
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto de perfil"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-full max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={1600}
          sizes="(max-width: 768px) 100vw, 90vw"
          className="block h-auto max-h-[88vh] w-auto max-w-full rounded-2xl object-contain"
          priority
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="4" x2="14" y2="14" />
      <line x1="14" y1="4" x2="4" y2="14" />
    </svg>
  );
}
