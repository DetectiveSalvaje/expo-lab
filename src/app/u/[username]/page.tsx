import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Perfil de @${username} en expo·lab.`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username: rawUsername } = await params;
  const username = rawUsername.toLowerCase();

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, bio, avatar_url, website, created_at")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  // Cargar fotos del usuario
  const { data: photos } = await supabase
    .from("photos")
    .select("id, storage_path, title, width, height, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const session = await getCurrentUser();
  const isOwnProfile = session?.profile.id === profile.id;

  const websiteLabel = profile.website?.replace(/^https?:\/\//, "") ?? null;
  const memberSince = new Date(profile.created_at).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
        {/* Cabecera */}
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
          <Avatar
            username={profile.username}
            fullName={profile.full_name}
            avatarUrl={profile.avatar_url}
            size="xl"
          />

          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.full_name ?? profile.username}
            </h1>
            <p className="mt-1 font-mono text-sm text-muted">
              @{profile.username}
            </p>

            {profile.bio && (
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                {profile.bio}
              </p>
            )}

            {websiteLabel && profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-accent underline-offset-4 hover:underline"
              >
                {websiteLabel}
              </a>
            )}

            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted">
              Miembro desde {memberSince} · {photos?.length ?? 0} foto
              {photos && photos.length === 1 ? "" : "s"}
            </p>

            {isOwnProfile && (
              <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button
                  variant="secondary"
                  size="sm"
                  href="/settings/profile"
                >
                  Editar perfil
                </Button>
                <Button variant="primary" size="sm" href="/upload">
                  Subir foto
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Galería */}
        <div className="mt-16 border-t border-border pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Fotos
          </h2>

          {photos && photos.length > 0 ? (
            <PhotoGrid photos={photos} />
          ) : (
            <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
              {isOwnProfile
                ? "Aún no has subido fotos. Comparte tu trabajo desde el botón Subir."
                : "Aún no hay fotos en este perfil."}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

async function PhotoGrid({
  photos,
}: {
  photos: Array<{
    id: string;
    storage_path: string;
    title: string | null;
    width: number | null;
    height: number | null;
  }>;
}) {
  const supabase = await createClient();

  return (
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
      {photos.map((photo) => {
        const { data } = supabase.storage
          .from("photos")
          .getPublicUrl(photo.storage_path);
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
              className="object-cover transition-opacity group-hover:opacity-90"
            />
          </Link>
        );
      })}
    </div>
  );
}
