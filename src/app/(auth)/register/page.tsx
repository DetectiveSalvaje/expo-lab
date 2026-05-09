"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { register, type RegisterState } from "./actions";

const initialState: RegisterState = { error: null };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="mt-2 text-sm text-muted">
          Únete a expo·lab. Empieza a compartir tu trabajo.
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
          label="Nombre de usuario"
          name="username"
          required
          autoComplete="username"
          defaultValue={state.fieldValues?.username}
          placeholder="bipbop"
          hint="Solo minúsculas, números y guion bajo. 3-30 caracteres."
        />
        <Input
          label="Nombre (opcional)"
          name="fullName"
          autoComplete="name"
          defaultValue={state.fieldValues?.fullName}
          placeholder="Tu nombre"
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          hint="Al menos 8 caracteres."
        />

        {state.error && (
          <p
            className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent"
            role="alert"
          >
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-2 w-full"
          disabled={isPending}
        >
          {isPending ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline underline-offset-4"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
