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

      <nav className="flex items-center gap-1 text-sm">
        <IconLink href="/feed" label="Feed">
          <EyeIcon />
        </IconLink>

        {session ? (
          <>
            <IconLink href="/saved" label="Guardados">
              <FloppyIcon />
            </IconLink>

            {/* Subir — acción primaria, filled */}
            <Link
              href="/upload"
              aria-label="Subir nueva foto"
              title="Subir"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-85"
            >
              <PlusIcon />
            </Link>

            <Link
              href={`/u/${session.profile.username}`}
              className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-muted-soft hover:text-foreground"
            >
              @{session.profile.username}
            </Link>

            <form action={logout}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                title="Salir"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted-soft hover:text-foreground"
              >
                <LogOutIcon />
              </button>
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

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted-soft hover:text-foreground"
    >
      {children}
    </Link>
  );
}

/* ============== Icons (SVG) ============== */

function EyeIcon() {
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function FloppyIcon() {
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
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

function LogOutIcon() {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
