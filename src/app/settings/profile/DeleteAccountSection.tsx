"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { deleteAccount } from "./delete-actions";

type Props = {
  username: string;
};

export function DeleteAccountSection({ username }: Props) {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"initial" | "confirm">("initial");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    if (confirmText.trim().toLowerCase() !== username.toLowerCase()) {
      setError(`Tipeá exactamente tu nombre de usuario: ${username}`);
      return;
    }

    // Confirmación final del navegador para evitar accidentes
    const ok = window.confirm(
      `¿Eliminar la cuenta @${username} permanentemente? Esta acción NO se puede deshacer.`,
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteAccount(confirmText);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      // En éxito, la action redirige a "/". No deberíamos llegar acá.
    });
  }

  return (
    <section className="mt-12 border-t border-accent/40 pt-10">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Eliminar cuenta
      </h2>

      <div className="mt-5 space-y-3 text-sm leading-relaxed text-accent">
        <p>
          Esta acción es <strong>permanente e irreversible</strong>. Al
          eliminar tu cuenta:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Se borran todas tus fotografías y los archivos originales.</li>
          <li>
            Se eliminan tus comentarios, likes y guardados en toda la
            comunidad.
          </li>
          <li>Dejás de seguir y sos dejado de seguir por todos.</li>
          <li>Se borran tus notificaciones y las que generaste.</li>
          <li>
            Tu nombre de usuario <strong>@{username}</strong> queda disponible
            para que otra persona lo tome.
          </li>
          <li>No vas a poder recuperar ninguno de estos datos.</li>
        </ul>
      </div>

      {step === "initial" ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setStep("confirm")}
            className="inline-flex h-9 select-none items-center justify-center rounded-full border border-accent/40 px-5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Quiero eliminar mi cuenta
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-accent">
              Para confirmar, escribí tu nombre de usuario
            </label>
            <p className="mt-1 font-mono text-xs text-muted">
              Esperado: <strong>{username}</strong>
            </p>
          </div>
          <Input
            name="confirm_username"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={username}
            autoComplete="off"
            disabled={isPending}
          />

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("initial");
                setConfirmText("");
                setError(null);
              }}
              disabled={isPending}
              className="inline-flex h-9 select-none items-center justify-center rounded-full px-5 text-sm font-medium text-muted transition-colors hover:bg-muted-soft hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={
                isPending ||
                confirmText.trim().toLowerCase() !== username.toLowerCase()
              }
              className="inline-flex h-9 select-none items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Eliminando…" : "Eliminar cuenta permanentemente"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
