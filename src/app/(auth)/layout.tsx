import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-center px-6 py-8">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-foreground"
        >
          expo<span className="text-muted">·</span>lab
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 pb-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
