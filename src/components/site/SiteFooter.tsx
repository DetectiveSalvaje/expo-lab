import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-muted sm:flex-row sm:px-10">
        <span>© {new Date().getFullYear()} expo·lab</span>
        <nav className="flex items-center gap-5">
          <Link
            href="/legal/privacy"
            className="transition-colors hover:text-foreground"
          >
            Privacidad
          </Link>
          <Link
            href="/legal/terms"
            className="transition-colors hover:text-foreground"
          >
            Términos
          </Link>
          <span className="font-mono">v0.1</span>
        </nav>
      </div>
    </footer>
  );
}
