/**
 * cn — pequeña utilidad para combinar clases de Tailwind condicionalmente.
 * Acepta strings, condicionales (false/null/undefined se ignoran)
 * y los une separados por espacio.
 *
 * Ejemplo:
 *   cn("p-4", isActive && "bg-accent", className)
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
