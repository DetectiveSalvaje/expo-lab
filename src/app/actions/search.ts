"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
};

/**
 * Busca usuarios por nombre completo o username.
 *
 * Intencionalmente NO busca por email: exponerlo permitiría enumeration
 * attacks (testear si un email está registrado). Si necesitamos invitar
 * por email en el futuro, lo hacemos como flujo separado con consentimiento.
 */
export async function searchUsers(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // Sanitizar: solo caracteres seguros para ILIKE
  const safe = trimmed.replace(/[%_\\]/g, "\\$&");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .or(`username.ilike.%${safe}%,full_name.ilike.%${safe}%`)
    .order("username", { ascending: true })
    .limit(20);

  if (error) {
    console.error("[searchUsers]", error.message);
    return [];
  }

  return data ?? [];
}
