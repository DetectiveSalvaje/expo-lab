"use client";

import { useEffect } from "react";

/**
 * Listener global que bloquea el menú contextual (click derecho)
 * sobre cualquier <img> o elemento con la clase `.no-touch-save`.
 *
 * Se monta una vez en el layout. Maneja la prevención de descarga
 * sin tener que poner onContextMenu en cada Image — lo que rompía
 * los Server Components.
 */
export function ImageProtection() {
  useEffect(() => {
    function onContext(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.tagName === "IMG" ||
        target.closest(".no-touch-save")
      ) {
        e.preventDefault();
      }
    }
    document.addEventListener("contextmenu", onContext);
    return () => document.removeEventListener("contextmenu", onContext);
  }, []);

  return null;
}
