import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadCount } from "@/app/actions/notifications";
import { SiteNav } from "./SiteNav";

type Props = {
  children: React.ReactNode;
};

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
    id: session.user.id,
    username: session.profile.username,
    fullName: session.profile.full_name,
    avatarUrl: session.profile.avatar_url,
  };
  const unread = await getUnreadCount();
  const initialUnread = unread > 0;

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:bottom-0 md:z-30 md:flex md:w-20 md:flex-col md:items-center md:border-r md:border-border md:bg-background md:py-6">
        <Link
          href="/feed"
          aria-label="Ir al feed"
          title="Expo Lab"
          className="flex h-10 w-10 select-none items-center justify-center rounded-full transition-colors hover:bg-muted-soft active:bg-muted-soft"
        >
          <span className="font-display text-2xl font-black uppercase leading-none tracking-tight">
            E
          </span>
        </Link>

        <div className="flex flex-1 items-center">
          <SiteNav
            session={navSession}
            vertical
            withSearch
            initialUnread={initialUnread}
          />
        </div>
      </aside>

      {/* Móvil: header */}
      <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4 md:hidden">
        <Link href="/feed" aria-label="Ir al feed">
          <span className="font-display text-base font-black uppercase tracking-tight">
            Expo Lab
          </span>
        </Link>
        <Link
          href="/search"
          aria-label="Buscar usuarios"
          title="Buscar"
          className="flex h-10 w-10 select-none items-center justify-center rounded-full text-muted transition-colors hover:bg-muted-soft hover:text-foreground active:bg-muted-soft"
        >
          <SearchIcon />
        </Link>
      </header>

      {/* Contenido principal */}
      <main className="flex flex-1 flex-col pb-20 md:ml-20 md:pb-0">
        {children}
      </main>

      {/* Móvil: bottom nav fija */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background md:hidden">
        <SiteNav session={navSession} initialUnread={initialUnread} />
      </nav>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
