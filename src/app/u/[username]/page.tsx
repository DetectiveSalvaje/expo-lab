import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarMenu } from "@/components/ui/AvatarMenu";
import { FollowButton } from "@/components/profile/FollowButton";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = rawUsername.toLowerCase();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, bio, avatar_url")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return { title: `@${username}` };
  }

  const title = profile.full_name
    ? `${profile.full_name} (@${profile.username})`
    : `@${profile.username}`;
  const description =
    profile.bio ?? `Perfil de @${profile.username} en expo·lab.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      ...(profile.avatar_url
        ? { images: [{ url: profile.avatar_url, alt: title }] }
        : {}),
    },
    twitter: {
      card: profile.avatar_url ? "summary" : "summary_large_image",
      title,
      description,
      ...(profile.avatar_url ? { images: [profile.avatar_url] } : {}),
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username: rawUsername } = await params;
  const username = rawUsername.toLowerCase();

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, bio, avatar_url, avatar_original_url, website, created_at",
    )
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  // Cargar publicaciones del usuario con su primera imagen (portada)
  const { data: photos } = await supabase
    .from("photos")
    .select(
      `
      id, title, created_at,
      images:photo_images ( storage_path, width, height, position )
    `,
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const session = await getCurrentUser();
  const isOwnProfile = session?.profile.id === profile.id;
  const isAuthenticated = Boolean(session);

  // Conteo de seguidores / siguiendo
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", profile.id),
  ]);

  // ¿El usuario actual ya sigue a este perfil?
  let isFollowing = false;
  if (session && !isOwnProfile) {
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", session.user.id)
      .eq("following_id", profile.id)
      .maybeSingle();
    isFollowing = Boolean(data);
  }

  const websiteLabel = profile.website?.replace(/^https?:\/\//, "") ?? null;
  const memberSince = new Date(profile.created_at).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
        {/* Cabecera */}
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
          {isOwnProfile ? (
            <AvatarMenu
              username={profile.username}
              fullName={profile.full_name}
              avatarUrl={profile.avatar_url}
              avatarOriginalUrl={profile.avatar_original_url}
            />
          ) : (
            <Avatar
              username={profile.username}
              fullName={profile.full_name}
              avatarUrl={profile.avatar_url}
              size="xl"
            />
          )}

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

            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wider text-muted sm:justify-start">
              <span>
                <span className="text-foreground">{followersCount ?? 0}</span>{" "}
                seguidor{followersCount === 1 ? "" : "es"}
              </span>
              <span>
                <span className="text-foreground">{followingCount ?? 0}</span>{" "}
                siguiendo
              </span>
            </div>

            {!isOwnProfile && (
              <div className="mt-6 flex justify-center sm:justify-start">
                <FollowButton
                  targetUserId={profile.id}
                  initialFollowing={isFollowing}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            )}

            {isOwnProfile && (
              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link
                  href="/upload"
                  aria-label="Subir nueva foto"
                  title="Subir foto"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-85"
                >
                  <PlusIcon />
                </Link>
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
            <PhotoGrid photos={photos} profileUsername={profile.username} />
          ) : (
            <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
              {isOwnProfile
                ? "Aún no has subido fotos. Comparte tu trabajo desde el botón Subir."
                : "Aún no hay fotos en este perfil."}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="9" y1="3.5" x2="9" y2="14.5" />
      <line x1="3.5" y1="9" x2="14.5" y2="9" />
    </svg>
  );
}

async function PhotoGrid({
  photos,
  profileUsername,
}: {
  photos: Array<{
    id: string;
    title: string | null;
    images: Array<{
      storage_path: string;
      width: number | null;
      height: number | null;
      position: number;
    }>;
  }>;
  profileUsername: string;
}) {
  const supabase = await createClient();

  return (
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
      {photos.map((photo) => {
        const sorted = [...(photo.images ?? [])].sort(
          (a, b) => a.position - b.position,
        );
        const cover = sorted[0];
        if (!cover) return null;
        const { data } = supabase.storage
          .from("photos")
          .getPublicUrl(cover.storage_path);
        const hasMultiple = sorted.length > 1;
        return (
          <Link
            key={photo.id}
            href={`/p/${photo.id}?from=u/${profileUsername}`}
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
            {hasMultiple && (
              <span className="pointer-events-none absolute right-2 top-2 flex items-center justify-center rounded-full bg-black/70 p-1.5 text-white backdrop-blur">
                <StackIcon />
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function StackIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="8" height="8" rx="1.5" />
      <path d="M5.5 1.5h6a1.5 1.5 0 0 1 1.5 1.5v6" />
    </svg>
  );
}
