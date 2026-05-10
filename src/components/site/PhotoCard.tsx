import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { FeedPhoto } from "@/app/actions/photos";

type Props = {
  photo: FeedPhoto;
  href: string;
};

/**
 * Tarjeta de publicación para feeds (general o de autor).
 * Muestra la primera imagen como portada.
 */
export function PhotoCard({ photo, href }: Props) {
  const cover = photo.images[0];
  if (!cover) return null;
  const hasMultiple = photo.images.length > 1;
  const postedAt = new Date(photo.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article>
      {/* Cabecera del autor */}
      <header className="mb-4 flex items-center gap-3">
        <Link
          href={`/u/${photo.author.username}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Avatar
            username={photo.author.username}
            fullName={photo.author.full_name}
            avatarUrl={photo.author.avatar_url}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium leading-tight">
              {photo.author.full_name ?? photo.author.username}
            </p>
            <p className="font-mono text-xs leading-tight text-muted">
              @{photo.author.username}
            </p>
          </div>
        </Link>
        <span className="ml-auto font-mono text-xs uppercase tracking-wider text-muted">
          {postedAt}
        </span>
      </header>

      {/* Imagen (portada) */}
      <Link
        href={href}
        className="relative block w-full overflow-hidden rounded-2xl bg-muted-soft transition-opacity hover:opacity-95"
      >
        <Image
          src={cover.url}
          alt={photo.title ?? `Foto de @${photo.author.username}`}
          width={cover.width ?? 1600}
          height={cover.height ?? 1200}
          className="block h-auto w-full"
          sizes="(max-width: 768px) 100vw, 768px"
        />
        {hasMultiple && (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 font-mono text-xs text-white backdrop-blur">
            {photo.images.length}
          </span>
        )}
      </Link>

      {/* Título + descripción */}
      {(photo.title || photo.description) && (
        <div className="mt-4">
          {photo.title && (
            <h2 className="text-base font-semibold tracking-tight">
              <Link
                href={href}
                className="underline-offset-4 hover:underline"
              >
                {photo.title}
              </Link>
            </h2>
          )}
          {photo.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
              {photo.description}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
