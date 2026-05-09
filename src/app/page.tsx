import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Header minimalista */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-foreground"
        >
          expo<span className="text-muted">·</span>lab
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" href="/login">
            Iniciar sesión
          </Button>
          <Button variant="secondary" size="sm" href="/register">
            Crear cuenta
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center sm:px-10">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Una comunidad para fotógrafos
        </p>
        <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          <span className="block sm:whitespace-nowrap">Sube tu trabajo.</span>
          <span className="block sm:whitespace-nowrap">Descubre a otros.</span>
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

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-border px-6 py-5 text-xs text-muted sm:px-10">
        <span>© {new Date().getFullYear()} expo·lab</span>
        <span className="font-mono">v0.1 · en construcción</span>
      </footer>
    </main>
  );
}
