import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
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
      `
      id, user_id, title, description, medium, camera, lens, aperture, iso, shutter_speed,
      images:photo_images ( id, storage_path, width, height, position )
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (!photo) notFound();
  if (photo.user_id !== session.profile.id) {
    redirect(`/p/${id}`);
  }

  const sortedImages = [...(photo.images ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  const imagesWithUrls = sortedImages.map((img) => {
    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(img.storage_path);
    return {
      id: img.id,
      storage_path: img.storage_path,
      url: data.publicUrl,
      width: img.width,
      height: img.height,
    };
  });

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Editar publicación
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Ajusta tus imágenes y datos
          </h1>
          <p className="mt-3 text-sm text-muted">
            Podés añadir, eliminar y reordenar imágenes (mínimo 1, máximo 8) y
            actualizar la metadata. Las imágenes nuevas se procesan y suben al
            confirmar.
          </p>
        </header>

        <EditForm
          photo={{
            id: photo.id,
            userId: photo.user_id,
            title: photo.title,
            description: photo.description,
            medium: photo.medium as "digital" | "analog" | null,
            camera: photo.camera,
            lens: photo.lens,
            aperture: photo.aperture,
            iso: photo.iso,
            shutter_speed: photo.shutter_speed,
          }}
          initialImages={imagesWithUrls}
        />
      </section>
    </SiteShell>
  );
}
