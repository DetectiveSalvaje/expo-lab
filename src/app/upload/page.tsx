import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { UploadForm } from "./UploadForm";

export const metadata: Metadata = { title: "Subir foto" };

export default async function UploadPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Nueva publicación
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Comparte tu trabajo
          </h1>
          <p className="mt-3 text-sm text-muted">
            Sube hasta 8 imágenes en una misma publicación. Arrástralas para
            reordenarlas. La primera imagen es la portada que se ve en tu
            galería y en el feed.
          </p>
        </header>

        <UploadForm userId={session.profile.id} />
      </section>
    </main>
  );
}
