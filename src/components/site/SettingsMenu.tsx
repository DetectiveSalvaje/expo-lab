"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "./actions";
import { cn } from "@/lib/utils";

type Props = {
  active?: boolean;
};

/**
 * Botón del gear con dropdown: Ajustes y Cerrar sesión.
 * Se cierra al click fuera o Esc.
 */
export function SettingsMenu({ active }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Ajustes"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-10 select-none items-center justify-center rounded-full transition-colors touch-manipulation",
          "hover:bg-muted-soft active:bg-muted-soft",
          active ? "text-foreground" : "text-muted hover:text-foreground",
        )}
      >
        <GearIcon />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 w-44 overflow-hidden rounded-2xl border border-border bg-background py-1 shadow-lg",
            // En móvil: hacia arriba, alineado a la derecha
            "bottom-full right-0 mb-2",
            // En desktop: hacia la derecha del sidebar, abajo del botón
            "md:bottom-auto md:right-auto md:left-full md:top-0 md:ml-2 md:mb-0",
          )}
        >
          <Link
            href="/settings/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-muted-soft"
          >
            Ajustes
          </Link>
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center px-4 py-2.5 text-left text-sm text-accent transition-colors hover:bg-accent/10"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function GearIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
