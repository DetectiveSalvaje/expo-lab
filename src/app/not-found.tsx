import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "No encontrado" };

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-center px-6 py-8">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-foreground"
        >
          expo<span className="text-muted">·</span>lab
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight">
          Sin negativo
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Esta página no existe o fue movida. Quizá te equivocaste al
          escribir la URL.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="md" href="/">
            Volver al inicio
          </Button>
          <Button variant="secondary" size="md" href="/feed">
            Ver el feed
          </Button>
        </div>
      </section>
    </main>
  );
}
