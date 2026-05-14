/**
 * Resuelve la URL base del sitio, en orden de prioridad:
 *  1. NEXT_PUBLIC_SITE_URL — variable explícita (mejor para producción con dominio propio)
 *  2. VERCEL_URL — URL automática de Vercel (preview y prod sin dominio custom)
 *  3. localhost:3000 — fallback para desarrollo
 *
 * Es defensiva con el valor: añade https:// si falta el protocolo, quita trailing slash.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return normalize(explicit);

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}

function normalize(value: string): string {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return "http://localhost:3000";
  // Si no tiene protocolo, asumimos https://
  if (!/^https?:\/\//.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}
