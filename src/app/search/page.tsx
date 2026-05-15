import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site/SiteShell";
import { getCurrentUser } from "@/lib/auth";
import { SearchForm } from "./SearchForm";

export const metadata: Metadata = { title: "Buscar usuarios" };

export default async function SearchPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Descubrir
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Buscar usuarios
          </h1>
          <p className="mt-3 text-sm text-muted">
            Encontrá fotógrafos por su nombre o @usuario.
          </p>
        </header>

        <SearchForm />
      </section>
    </SiteShell>
  );
}
