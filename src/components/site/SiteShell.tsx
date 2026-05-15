import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SiteNav } from "./SiteNav";

type Props = {
  children: React.ReactNode;
};

/**
 * Shell global:
 *  - Logged out  → top header simple con wordmark + CTAs.
 *  - Logged in:
 *      • Móvil  → wordmark arriba + bottom nav fija.
 *      • Desktop → sidebar angosta con logo "E" arriba + iconos centrados verticalmente.
 */
export async function SiteShell({ children }: Props) {
  const session = await getCurrentUser();

  // === Logged out ===
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-5 sm:px-10">
          <Link href="/" aria-label="Inicio">
            <span className="font-display text-base font-black uppercase tracking-tight">
              Expo Lab
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 text-muted transition-colors hover:bg-muted-soft hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-border px-4 py-1.5 text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Crear cuenta
            </Link>
          </nav>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    );
  }

  // === Logged in ===
  const navSession = {
    username: session.profile.username,
    fullName: session.profile.full_name,
    avatarUrl: session.profile.avatar_url,
  };

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row">
      {/* Desktop sidebar — angosta, logo arriba, iconos al centro */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:bottom-0 md:z-30 md:flex md:w-20 md:flex-col md:items-center md:border-r md:border-border md:bg-background md:py-6">
        <Link
          href="/feed"
          aria-label="Ir al feed"
          title="Expo Lab"
          className="flex h-10 w-10 select-none items-center justify-center rounded-full transition-colors hover:bg-muted-soft active:bg-muted-soft"
        >
          <span className="font-display text-xl font-black uppercase leading-none tracking-tight">
            E
          </span>
        </Link>

        {/* Iconos centrados verticalmente en el espacio restante */}
        <div className="flex flex-1 items-center">
          <SiteNav session={navSession} vertical />
        </div>
      </aside>

      {/* Móvil: header arriba con wordmark */}
      <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4 md:hidden">
        <Link href="/feed" aria-label="Ir al feed">
          <span className="font-display text-base font-black uppercase tracking-tight">
            Expo Lab
          </span>
        </Link>
      </header>

      {/* Contenido principal */}
      <main className="flex flex-1 flex-col pb-20 md:ml-20 md:pb-0">
        {children}
      </main>

      {/* Móvil: bottom nav fija */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background md:hidden">
        <SiteNav session={navSession} />
      </nav>
    </div>
  );
}
