import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { PhotoFeed } from "@/components/site/PhotoFeed";
import { loadInitialPhotos } from "@/app/actions/photos";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Feed",
  description: "Las publicaciones más recientes de la comunidad.",
};

export default async function FeedPage() {
  const [initialPhotos, session] = await Promise.all([
    loadInitialPhotos(),
    getCurrentUser(),
  ]);

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Feed comunitario
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Lo más reciente
          </h1>
          <p className="mt-3 text-sm text-muted">
            Publicaciones de toda la comunidad, en orden de subida.
          </p>
        </header>

        <PhotoFeed
          initialPhotos={initialPhotos}
          fromContext={null}
          isAuthenticated={Boolean(session)}
          currentUserId={session?.user.id ?? null}
        />
      </section>
    </SiteShell>
  );
}
