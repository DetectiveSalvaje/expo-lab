import { createClient } from "@supabase/supabase-js";

/**
 * Cliente admin de Supabase con la service_role key.
 *
 * ⚠️ SOLO usar en server actions / route handlers que corren en el servidor.
 * NUNCA importar desde código que pueda llegar al cliente.
 *
 * Bypasa RLS — usar solo para operaciones que requieren privilegio admin:
 *   - supabase.auth.admin.deleteUser()
 *   - supabase.auth.admin.listUsers()
 *   - operaciones de storage sin auth de usuario
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "createAdminClient: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
