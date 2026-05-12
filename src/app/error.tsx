"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log para debugging — útil cuando despleguemos
    console.error("[GlobalError]", error);
  }, [error]);

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
          Error
        </p>
        <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight">
          Algo se desencuadró
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Pasó algo inesperado de nuestro lado. Probá de nuevo, y si persiste,
          volvé al inicio.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted">
            Código: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => reset()}>
            Reintentar
          </Button>
          <Button variant="secondary" size="md" href="/">
            Volver al inicio
          </Button>
        </div>
      </section>
    </main>
  );
}
