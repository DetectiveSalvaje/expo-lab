import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/Button";

export default function PhotoNotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight">
          Foto fuera de cuadro
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Esta foto no existe o fue eliminada.
        </p>
        <Button variant="secondary" className="mt-8" href="/">
          Volver al inicio
        </Button>
      </section>
    </main>
  );
}
