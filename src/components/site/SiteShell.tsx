import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SiteNav } from "./SiteNav";

type Props = {
  children: React.ReactNode;
};

/**
 * Shell global de la app:
 * - Móvil: wordmark arriba + bottom nav fija.
 * - Desktop: sidebar izquierda con wordmark + iconos verticales.
 */
export async function SiteShell({ children }: Props) {
  const session = await getCurrentUser();

  const navSession = session
    ? {
        username: session.profile.username,
        fullName: session.profile.full_name,
        avatarUrl: session.profile.avatar_url,
      }
    : null;

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row">
      {/* Desktop sidebar (oculta en móvil) */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:bottom-0 md:z-30 md:flex md:w-24 md:flex-col md:items-center md:border-r md:border-border md:bg-background md:py-6">
        <Link
          href="/feed"
          aria-label="Ir al feed"
          className="block px-3 text-center leading-none"
        >
          <span className="font-display text-sm font-black uppercase tracking-tight">
            Expo
            <br />
            Lab
          </span>
        </Link>
        <div className="mt-12">
          <SiteNav session={navSession} vertical />
        </div>
      </aside>

      {/* Móvil: header arriba con el wordmark */}
      <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4 md:hidden">
        <Link href="/feed" aria-label="Ir al feed">
          <span className="font-display text-base font-black uppercase tracking-tight">
            Expo Lab
          </span>
        </Link>
      </header>

      {/* Contenido principal */}
      <main className="flex flex-1 flex-col pb-20 md:ml-24 md:pb-0">
        {children}
      </main>

      {/* Móvil: bottom nav fija */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background md:hidden">
        <SiteNav session={navSession} />
      </nav>
    </div>
  );
}
