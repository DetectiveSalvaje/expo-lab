import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "./actions";

export async function SiteHeader() {
  const session = await getCurrentUser();

  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-10">
      <Link
        href="/"
        className="font-mono text-sm tracking-tight text-foreground"
      >
        expo<span className="text-muted">·</span>lab
      </Link>

      <nav className="flex items-center gap-2 text-sm">
        {session ? (
          <>
            <Button variant="primary" size="sm" href="/upload">
              Subir
            </Button>
            <Link
              href={`/u/${session.profile.username}`}
              className="rounded-full px-4 py-1.5 text-muted transition-colors hover:bg-muted-soft hover:text-foreground"
            >
              @{session.profile.username}
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Salir
              </Button>
            </form>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" href="/login">
              Iniciar sesión
            </Button>
            <Button variant="secondary" size="sm" href="/register">
              Crear cuenta
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
