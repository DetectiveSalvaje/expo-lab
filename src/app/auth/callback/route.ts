/**
 * Callback de autenticación.
 *
 * Cuando el usuario hace clic en el link de confirmación del email,
 * Supabase lo redirige aquí con un `code` en la URL.
 * Intercambiamos ese code por una sesión y luego redirigimos al usuario.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si algo falló, manda al login con un mensaje
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
