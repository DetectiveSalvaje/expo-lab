/**
 * Formatea una fecha como tiempo relativo en español.
 *  - <60s   → "hace un momento"
 *  - <60min → "hace X min"
 *  - <24h   → "hace X h"
 *  - <7d    → "hace X días"
 *  - resto  → "13 may"
 */
export function relativeTime(date: Date | string): string {
  const then = new Date(date).getTime();
  const diffSec = (Date.now() - then) / 1000;

  if (diffSec < 60) return "hace un momento";
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `hace ${m} min`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return `hace ${h} h`;
  }
  if (diffSec < 604800) {
    const d = Math.floor(diffSec / 86400);
    return `hace ${d} ${d === 1 ? "día" : "días"}`;
  }
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}
