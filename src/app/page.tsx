import { Button } from "@/components/ui/Button";
import { SiteShell } from "@/components/site/SiteShell";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function Home() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10 sm:py-24">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Una comunidad para fotógrafos
        </p>
        <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          <span className="block sm:whitespace-nowrap">Conecta.</span>
          <span className="block sm:whitespace-nowrap">Comparte.</span>
          <span className="block sm:whitespace-nowrap text-muted">
            Construye tu archivo visual.
          </span>
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          expo·lab es un espacio cuidado para mostrar tus fotografías,
          encontrar miradas afines y conversar sobre la imagen.
        </p>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button variant="primary" size="lg" href="/register">
            Crear mi cuenta
          </Button>
          <Button variant="secondary" size="lg" href="/feed">
            Ver el feed
          </Button>
        </div>
      </section>

      <SiteFooter />
    </SiteShell>
  );
}
