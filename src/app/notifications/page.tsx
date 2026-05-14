import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site/SiteShell";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Notificaciones" };

export default async function NotificationsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Actividad
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Notificaciones
          </h1>
          <p className="mt-3 text-sm text-muted">
            Los likes, comentarios y nuevos seguidores aparecerán aquí pronto.
          </p>
        </header>

        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Próximamente
          </p>
          <p className="mt-3 text-sm text-muted">
            El sistema de notificaciones está en construcción.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
