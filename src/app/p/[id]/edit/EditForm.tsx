"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { updatePhoto, type UpdatePhotoState } from "../actions";

const initialState: UpdatePhotoState = { error: null, success: false };

type Medium = "digital" | "analog" | null;

type Props = {
  photo: {
    id: string;
    title: string | null;
    description: string | null;
    medium: "digital" | "analog" | null;
    camera: string | null;
    lens: string | null;
    aperture: string | null;
    iso: number | null;
    shutter_speed: string | null;
  };
};

export function EditForm({ photo }: Props) {
  const [state, formAction, isPending] = useActionState(updatePhoto, initialState);
  const [medium, setMedium] = useState<Medium>(photo.medium);

  function selectMedium(value: NonNullable<Medium>) {
    setMedium((current) => (current === value ? null : value));
  }

  const isoLabel = medium === "analog" ? "ASA" : "ISO";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="photoId" value={photo.id} />

      <Input
        label="Título"
        name="title"
        defaultValue={photo.title ?? ""}
        placeholder="Opcional"
        maxLength={120}
      />

      <Textarea
        label="Descripción"
        name="description"
        rows={3}
        defaultValue={photo.description ?? ""}
        placeholder="Opcional"
        maxLength={2000}
      />

      {/* Toggle Digital/Análogo */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          Soporte
        </span>
        <div className="flex w-fit gap-1 rounded-full border border-border p-1">
          <MediumPill
            label="Digital"
            active={medium === "digital"}
            onClick={() => selectMedium("digital")}
          />
          <MediumPill
            label="Análogo"
            active={medium === "analog"}
            onClick={() => selectMedium("analog")}
          />
        </div>
        <input type="hidden" name="medium" value={medium ?? ""} />
        <p className="text-xs text-muted">
          Si lo deseleccionas, se borrarán los datos técnicos de esta foto.
        </p>
      </div>

      {medium && (
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Ficha técnica · {medium === "digital" ? "Digital" : "Análogo"}
            </p>
          </div>
          <Input
            label="Cámara"
            name="camera"
            defaultValue={photo.camera ?? ""}
            placeholder={medium === "digital" ? "Sony A7 IV" : "Canon AE-1"}
            maxLength={100}
          />
          <Input
            label="Lente"
            name="lens"
            defaultValue={photo.lens ?? ""}
            placeholder="50mm f/1.4"
            maxLength={100}
          />
          <Input
            label="Apertura"
            name="aperture"
            defaultValue={photo.aperture ?? ""}
            placeholder="f/1.8"
            maxLength={20}
          />
          <Input
            label={isoLabel}
            name="iso"
            type="number"
            min={1}
            max={1000000}
            defaultValue={photo.iso ?? ""}
            placeholder="400"
          />
          <Input
            label="Velocidad"
            name="shutter_speed"
            defaultValue={photo.shutter_speed ?? ""}
            placeholder="1/125"
            maxLength={30}
            className="sm:col-span-2"
          />
        </div>
      )}

      {state.error && (
        <p
          className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="ghost" size="md" href={`/p/${photo.id}`}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isPending}
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function MediumPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted hover:text-foreground",
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
