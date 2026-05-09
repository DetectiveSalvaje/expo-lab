"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { processImage } from "@/lib/processImage";
import { cn } from "@/lib/utils";
import { uploadPhoto } from "./actions";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

type Medium = "digital" | "analog" | null;

export function UploadForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [medium, setMedium] = useState<Medium>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function pickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setError(null);
    if (!ALLOWED_MIME.includes(f.type)) {
      setError("Formato no permitido. Usa JPG, PNG, WebP o AVIF.");
      return;
    }
    if (f.size > MAX_INPUT_BYTES) {
      setError("La imagen no puede exceder 25 MB.");
      return;
    }

    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function selectMedium(value: NonNullable<Medium>) {
    // Click en la pill activa la deselecciona
    setMedium((current) => (current === value ? null : value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("Selecciona una imagen primero.");
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const { blob, width, height } = await processImage(file);
        formData.set("photo", blob, "photo.jpg");
        formData.set("width", String(width));
        formData.set("height", String(height));

        const result = await uploadPhoto(formData);
        if (result?.error) setError(result.error);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al procesar la imagen.",
        );
      }
    });
  }

  const isoLabel = medium === "analog" ? "ASA" : "ISO";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* Preview / Picker */}
      {previewUrl ? (
        <div>
          <div className="relative w-full overflow-hidden rounded-2xl bg-muted-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Vista previa"
              className="block h-auto w-full"
            />
          </div>
          <button
            type="button"
            onClick={pickFile}
            className="mt-3 text-xs text-muted underline-offset-4 hover:underline"
          >
            Cambiar imagen
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pickFile}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted-soft text-muted transition-colors hover:bg-border/30"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em]">
            Subir foto
          </span>
          <span className="text-sm">Clic aquí o arrastra una imagen</span>
          <span className="text-xs">JPG, PNG, WebP o AVIF · hasta 25 MB</span>
        </button>
      )}

      <Input label="Título" name="title" placeholder="Opcional" maxLength={120} />

      <Textarea
        label="Descripción"
        name="description"
        rows={3}
        placeholder="Opcional. Cuéntanos sobre la foto, el contexto, la técnica."
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
          Opcional. Si lo seleccionas, podrás añadir ficha técnica de la cámara.
          Vuelve a hacer clic en la pill para deseleccionar.
        </p>
      </div>

      {/* Ficha técnica condicional */}
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
            placeholder={
              medium === "digital" ? "Sony A7 IV" : "Canon AE-1"
            }
            maxLength={100}
          />
          <Input
            label="Lente"
            name="lens"
            placeholder="50mm f/1.4"
            maxLength={100}
          />
          <Input
            label="Apertura"
            name="aperture"
            placeholder="f/1.8"
            maxLength={20}
          />
          <Input
            label={isoLabel}
            name="iso"
            type="number"
            min={1}
            max={1000000}
            placeholder="400"
          />
          <Input
            label="Velocidad"
            name="shutter_speed"
            placeholder="1/125"
            maxLength={30}
            className="sm:col-span-2"
          />
        </div>
      )}

      {error && (
        <p
          className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending || !file}
        >
          {isPending ? "Subiendo…" : "Publicar"}
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
