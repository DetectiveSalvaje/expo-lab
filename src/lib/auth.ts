/**
 * Helpers de autenticación que se usan desde Server Components y Server Actions.
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el usuario actual + su perfil, o null si no hay sesión.
 * Si hay sesión pero no perfil (raro, pero posible si falló el trigger),
 * también devuelve null para evitar UIs rotas.
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio, website")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { user, profile };
}

/**
 * Útil para páginas que requieren login. Si no hay usuario, lo devolvemos null
 * para que el caller decida (redirect, mostrar mensaje, etc).
 */
export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
