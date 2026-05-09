/**
 * Helper para refrescar la sesión de Supabase en cada request.
 *
 * Llamado desde src/middleware.ts.
 * Sin esto, los tokens de auth caducan y el usuario aparece deslogueado
 * aleatoriamente.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: no eliminar getUser(). Es lo que dispara la rotación
  // del token y mantiene la sesión viva.
  await supabase.auth.getUser();

  return supabaseResponse;
}
