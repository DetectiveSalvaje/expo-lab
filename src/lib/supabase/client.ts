/**
 * Cliente de Supabase para el NAVEGADOR.
 *
 * Úsalo dentro de Client Components (los que llevan "use client").
 * Maneja la sesión del usuario vía cookies del navegador.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
