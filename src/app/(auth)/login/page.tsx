import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-muted">Bienvenido de vuelta.</p>
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted-soft" />
    </div>
  );
}
