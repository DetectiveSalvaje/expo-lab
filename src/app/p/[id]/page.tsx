import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Avatar } from "@/components/ui/Avatar";
import { PhotoCarousel, type CarouselImage } from "@/components/ui/PhotoCarousel";
import { PhotoMetaButton } from "@/components/ui/PhotoMetaButton";
import { PhotoFeed } from "@/components/site/PhotoFeed";
import { loadInitialPhotos } from "@/app/actions/photos";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { PhotoActions } from "./PhotoActions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
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

export default async function PhotoDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) notFound();

  const sp = await searchParams;
  const fromValue = sp.from ?? null;
  const isFromAuthor = fromValue?.startsWith("u/") ?? false;

  const supabase = await createClient();

  const { data: photo, error } = await supabase
    .from("photos")
    .select(
      `
      id, title, description, created_at,
      medium, camera, lens, aperture, iso, shutter_speed,
      author:profiles!user_id ( id, username, full_name, avatar_url ),
      images:photo_images ( storage_path, width, height, position )
    `,
    )
    .eq("id", id)
    .order("position", { foreignTable: "photo_images", ascending: true })
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

  // Imágenes del carrusel
  const sortedImages = [...(photo.images ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  const carouselImages: CarouselImage[] = sortedImages.map((img) => {
    const { data } = supabase.storage.from("photos").getPublicUrl(img.storage_path);
    return {
      url: data.publicUrl,
      width: img.width,
      height: img.height,
      alt: photo.title || `Foto de @${author.username}`,
    };
  });

  if (carouselImages.length === 0) {
    console.error("[/p/[id]] photo without images:", photo.id);
    notFound();
  }

  // Cargar cascada inicial según contexto
  const cascadePhotos = await loadInitialPhotos({
    excludeId: photo.id,
    authorId: isFromAuthor ? author.id : undefined,
  });
  const cascadeContext = isFromAuthor ? `u/${author.username}` : null;

  const postedAt = new Date(photo.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-8 sm:py-12">
        {/* Autor + acciones */}
        <header className="mb-6 flex items-start gap-3">
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
          <div className="ml-auto flex flex-col items-end gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              {postedAt}
            </span>
            {isOwner && <PhotoActions photoId={photo.id} />}
          </div>
        </header>

        <PhotoCarousel images={carouselImages} priority />

        <div className="mt-6 flex items-start justify-between gap-4">
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
      </article>

      {/* Cascada */}
      <section className="mx-auto w-full max-w-2xl border-t border-border px-6 py-12 sm:py-16">
        <h2 className="mb-10 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          {isFromAuthor
            ? `Más de @${author.username}`
            : "Sigue descubriendo"}
        </h2>
        <PhotoFeed
          initialPhotos={cascadePhotos}
          fromContext={cascadeContext}
          excludeId={photo.id}
          authorId={isFromAuthor ? author.id : undefined}
        />
      </section>
    </main>
  );
}
