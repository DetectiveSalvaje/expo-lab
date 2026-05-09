"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const searchParams = useSearchParams();

  // Mensaje de error si el callback de email falló
  const callbackError = searchParams.get("error");
  const showCallbackError =
    !state.error && callbackError === "auth_callback_failed";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-muted">
          Bienvenido de vuelta.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.fieldValues?.email}
          placeholder="tu@email.com"
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {state.error && (
          <p
            className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent"
            role="alert"
          >
            {state.error}
          </p>
        )}

        {showCallbackError && (
          <p
            className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent"
            role="alert"
          >
            No pudimos confirmar tu sesión. Intenta iniciar sesión de nuevo.
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-2 w-full"
          disabled={isPending}
        >
          {isPending ? "Entrando…" : "Iniciar sesión"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground hover:underline underline-offset-4"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
