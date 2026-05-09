import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { EditForm } from "./EditForm";

type Props = {
  params: Promise<{ id: string }>;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata: Metadata = { title: "Editar foto" };

export default async function EditPhotoPage({ params }: Props) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) notFound();

  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("photos")
    .select(
      "id, user_id, title, description, medium, camera, lens, aperture, iso, shutter_speed",
    )
    .eq("id", id)
    .maybeSingle();

  if (!photo) notFound();
  if (photo.user_id !== session.profile.id) {
    // No es el dueño — mandamos a la vista de detalle
    redirect(`/p/${id}`);
  }

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="mx-auto w-full max-w-xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Editar foto
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Ajusta los datos
          </h1>
          <p className="mt-3 text-sm text-muted">
            Puedes cambiar el título, la descripción y la ficha técnica. La
            imagen no se puede sustituir desde aquí — para reemplazarla,
            elimina la foto y sube una nueva.
          </p>
        </header>

        <EditForm
          photo={{
            id: photo.id,
            title: photo.title,
            description: photo.description,
            medium: photo.medium as "digital" | "analog" | null,
            camera: photo.camera,
            lens: photo.lens,
            aperture: photo.aperture,
            iso: photo.iso,
            shutter_speed: photo.shutter_speed,
          }}
        />
      </section>
    </main>
  );
}
