import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Editar perfil" };

export default async function SettingsProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="mx-auto w-full max-w-xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Configuración
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Editar perfil
          </h1>
          <p className="mt-3 text-sm text-muted">
            Actualiza tu foto, nombre y bio. Los cambios son visibles
            públicamente en tu perfil.
          </p>
        </header>

        <SettingsForm profile={session.profile} />
      </section>
    </main>
  );
}
