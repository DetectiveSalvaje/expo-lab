/**
 * Pantalla global mientras cargan server components.
 * Next.js la muestra automáticamente entre navegaciones.
 */
export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="flex items-center gap-3">
        <Spinner />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Cargando…
        </span>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin text-muted"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}
