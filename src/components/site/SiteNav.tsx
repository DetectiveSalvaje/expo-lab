"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { SettingsMenu } from "./SettingsMenu";

type SessionData = {
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
};

type Props = {
  session: SessionData;
  vertical?: boolean;
};

export function SiteNav({ session, vertical = false }: Props) {
  const pathname = usePathname();

  const isProfileActive = pathname === `/u/${session.username}`;
  const profilePath = `/u/${session.username}`;

  return (
    <div
      className={cn(
        "flex items-center",
        vertical
          ? "flex-col gap-5"
          : "h-16 w-full flex-row justify-around px-2",
      )}
    >
      <NavLink
        href="/notifications"
        label="Notificaciones"
        active={pathname === "/notifications"}
      >
        <EyeIcon />
      </NavLink>

      <Link
        href={profilePath}
        aria-label="Mi perfil"
        title="Mi perfil"
        className="flex h-10 w-10 select-none items-center justify-center rounded-full transition-colors touch-manipulation hover:bg-muted-soft active:bg-muted-soft"
      >
        <Avatar
          username={session.username}
          fullName={session.fullName}
          avatarUrl={session.avatarUrl}
          size="sm"
          className={cn(
            "h-8 w-8 transition-shadow",
            isProfileActive &&
              "ring-2 ring-foreground ring-offset-2 ring-offset-background",
          )}
        />
      </Link>

      <Link
        href="/upload"
        aria-label="Subir nueva foto"
        title="Subir"
        className={cn(
          "flex h-10 w-10 select-none items-center justify-center rounded-full bg-foreground text-background transition-opacity touch-manipulation",
          "hover:opacity-85 active:opacity-85",
        )}
      >
        <PlusIcon />
      </Link>

      <NavLink href="/saved" label="Guardados" active={pathname === "/saved"}>
        <FloppyIcon />
      </NavLink>

      <SettingsMenu active={pathname.startsWith("/settings")} />
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-10 w-10 select-none items-center justify-center rounded-full transition-colors touch-manipulation",
        "hover:bg-muted-soft active:bg-muted-soft",
        active ? "text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

/* === Icons === */

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
