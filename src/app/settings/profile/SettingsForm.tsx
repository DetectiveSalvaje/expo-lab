"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { AvatarUploader } from "./AvatarUploader";
import { updateProfile, type ProfileState } from "./actions";

const initialProfileState: ProfileState = { error: null, success: false };

type Props = {
  profile: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
  };
};

export function SettingsForm({ profile }: Props) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    initialProfileState,
  );

  return (
    <div className="space-y-12">
      {/* Avatar con editor de recorte */}
      <AvatarUploader
        username={profile.username}
        fullName={profile.full_name}
        avatarUrl={profile.avatar_url}
      />

      {/* Información del perfil */}
      <section className="border-t border-border pt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Información
        </h2>
        <form action={profileAction} className="mt-6 flex flex-col gap-4">
          {/* Username (solo lectura) */}
          <div className="flex w-full flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Usuario
            </span>
            <p className="px-5 py-3 font-mono text-sm">@{profile.username}</p>
            <p className="text-xs text-muted">
              El nombre de usuario no se puede cambiar.
            </p>
          </div>

          <Input
            label="Nombre completo"
            name="fullName"
            defaultValue={
              profileState.fieldValues?.fullName ?? profile.full_name ?? ""
            }
            placeholder="Tu nombre"
          />

          <Textarea
            label="Bio"
            name="bio"
            rows={3}
            defaultValue={profileState.fieldValues?.bio ?? profile.bio ?? ""}
            placeholder="Cuéntanos brevemente sobre ti, tu enfoque, tu trabajo."
            hint="Máximo 280 caracteres."
          />

          <Input
            label="Sitio web"
            name="website"
            type="url"
            defaultValue={
              profileState.fieldValues?.website ?? profile.website ?? ""
            }
            placeholder="https://"
          />

          {profileState.error && (
            <p
              className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent"
              role="alert"
            >
              {profileState.error}
            </p>
          )}
          {profileState.success && (
            <p
              className="rounded-xl border border-foreground/20 bg-foreground/5 px-4 py-3 text-sm text-foreground"
              role="status"
            >
              Perfil actualizado.
            </p>
          )}

          <div className="mt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={profilePending}
            >
              {profilePending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
