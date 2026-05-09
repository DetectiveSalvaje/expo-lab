import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Avatar } from "@/components/ui/Avatar";
import { PhotoMetaButton } from "@/components/ui/PhotoMetaButton";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { PhotoActions } from "./PhotoActions";

type Props = {
  params: Promise<{ id: string }>;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) return { title: "Foto" };

  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("photos")
    .select("title, description")
    .eq("id", id)
    .maybeSingle();

  if (!photo) return { title: "Foto" };

  return {
    title: photo.title || "Foto",
    description: photo.description ?? "Una fotografía publicada en expo·lab.",
  };
}

export default async function PhotoDetailPage({ params }: Props) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) notFound();

  const supabase = await createClient();

  // Foto + autor en una sola consulta.
  // `profiles!user_id` desambigua: "usa la relación FK a través de la columna user_id".
  // El alias `author:` deja el resultado en photo.author en vez de photo.profiles.
  const { data: photo, error } = await supabase
    .from("photos")
    .select(
      `
      id, storage_path, title, description, width, height, created_at,
      medium, camera, lens, aperture, iso, shutter_speed,
      author:profiles!user_id ( id, username, full_name, avatar_url )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[/p/[id]] photo query error:", error.message, error.details);
  }

  if (!photo) notFound();

  const author = Array.isArray(photo.author) ? photo.author[0] : photo.author;
  if (!author) {
    console.error("[/p/[id]] photo without author profile:", photo.id);
    notFound();
  }

  const session = await getCurrentUser();
  const isOwner = session?.profile.id === author.id;

  const { data: imageData } = supabase.storage
    .from("photos")
    .getPublicUrl(photo.storage_path);

  const postedAt = new Date(photo.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-8 sm:py-12">
        {/* Autor */}
        <header className="mb-6 flex items-center gap-3">
          <Link
            href={`/u/${author.username}`}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Avatar
              username={author.username}
              fullName={author.full_name}
              avatarUrl={author.avatar_url}
              size="md"
            />
            <div>
              <p className="text-sm font-medium">
                {author.full_name ?? author.username}
              </p>
              <p className="font-mono text-xs text-muted">@{author.username}</p>
            </div>
          </Link>
          <span className="ml-auto font-mono text-xs uppercase tracking-wider text-muted">
            {postedAt}
          </span>
        </header>

        {/* Imagen */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-muted-soft">
          <Image
            src={imageData.publicUrl}
            alt={photo.title || `Foto de @${author.username}`}
            width={photo.width ?? 1600}
            height={photo.height ?? 1200}
            className="block h-auto w-full"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        {/* Botón "i" + título + descripción */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            {photo.title && (
              <h1 className="text-xl font-semibold tracking-tight">
                {photo.title}
              </h1>
            )}
            {photo.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {photo.description}
              </p>
            )}
          </div>
          <PhotoMetaButton
            medium={photo.medium as "digital" | "analog" | null}
            camera={photo.camera}
            lens={photo.lens}
            aperture={photo.aperture}
            iso={photo.iso}
            shutterSpeed={photo.shutter_speed}
          />
        </div>

        {isOwner && <PhotoActions photoId={photo.id} />}
      </article>
    </main>
  );
}
