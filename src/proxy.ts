/**
 * Proxy global de Next.js (antes "middleware" en Next.js 15).
 *
 * Se ejecuta en cada request antes de servir la página.
 * Aquí lo usamos solo para refrescar la sesión de Supabase.
 */

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static (archivos estáticos del build)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - archivos con extensión de imagen (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
