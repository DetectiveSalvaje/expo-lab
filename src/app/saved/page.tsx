import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Guardados",
  description: "Tu colección personal de favoritos.",
};

export default async function SavedPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  // Cargar los saves del usuario, con la foto y su primera imagen
  const { data: saved } = await supabase
    .from("saves")
    .select(
      `
      created_at,
      photo:photos!photo_id (
        id, title, created_at,
        author:profiles!user_id ( username ),
        images:photo_images ( storage_path, position )
      )
    `,
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // Normalizar (PostgREST puede devolver array u objeto en joins)
  const items = (saved ?? [])
    .map((row) => {
      const photo = Array.isArray(row.photo) ? row.photo[0] : row.photo;
      if (!photo) return null;
      const author = Array.isArray(photo.author)
        ? photo.author[0]
        : photo.author;
      const images = [...(photo.images ?? [])].sort(
        (a, b) => a.position - b.position,
      );
      return {
        savedAt: row.created_at,
        photo: {
          id: photo.id,
          title: photo.title,
          author,
          cover: images[0],
          imageCount: images.length,
        },
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Privado
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Guardados
          </h1>
          <p className="mt-3 text-sm text-muted">
            Tu colección personal. Solo tú puedes verla.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Sin favoritos
            </p>
            <p className="mt-3 text-sm text-muted">
              Cuando guardes una foto, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {items.map(({ photo }) => {
              if (!photo.cover) return null;
              const { data } = supabase.storage
                .from("photos")
                .getPublicUrl(photo.cover.storage_path);
              return (
                <Link
                  key={photo.id}
                  href={`/p/${photo.id}`}
                  className="group relative block aspect-square overflow-hidden rounded-xl bg-muted-soft"
                >
                  <Image
                    src={data.publicUrl}
                    alt={photo.title || ""}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="no-touch-save object-cover transition-opacity group-hover:opacity-90"
                    draggable={false}
                  />
                  {photo.imageCount > 1 && (
                    <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 font-mono text-xs text-white backdrop-blur">
                      {photo.imageCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
