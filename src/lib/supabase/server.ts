/**
 * Cliente de Supabase para el SERVIDOR.
 *
 * Úsalo en Server Components, Route Handlers y Server Actions.
 * Lee las cookies del request actual para saber si hay un usuario logueado.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamadas desde Server Components no pueden setear cookies.
            // El middleware refresca la sesión por nosotros, así que es seguro ignorar.
          }
        },
      },
    },
  );
}
