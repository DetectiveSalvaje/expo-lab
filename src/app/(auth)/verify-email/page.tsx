import Link from "next/link";

export const metadata = { title: "Revisa tu correo" };

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        Casi listo
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Revisa tu correo
      </h1>
      <p className="max-w-xs text-sm leading-relaxed text-muted">
        Te enviamos un enlace de confirmación. Ábrelo desde tu bandeja de
        entrada para activar tu cuenta y empezar a usar expo·lab.
      </p>
      <p className="max-w-xs text-xs leading-relaxed text-muted">
        ¿No lo encuentras? Mira en spam. Si pasaron varios minutos sin recibirlo,
        intenta registrarte de nuevo o contáctanos.
      </p>
      <Link
        href="/login"
        className="text-sm font-medium text-foreground hover:underline underline-offset-4"
      >
        Volver al inicio de sesión
      </Link>
    </div>
  );
}
