"use client";

import { useRef, useState, useTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { processImage } from "@/lib/processImage";
import { uploadAvatar } from "./actions";
import { getCroppedBlob } from "./cropImage";

type Props = {
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export function AvatarUploader({ username, fullName, avatarUrl }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    if (!ALLOWED_MIME.includes(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG, WebP o AVIF.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("La imagen no puede exceder 10 MB.");
      return;
    }

    setSourceFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  }

  function handleCancel() {
    setImageSrc(null);
    setSourceFile(null);
    setPixelCrop(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleConfirm() {
    if (!imageSrc || !pixelCrop || !sourceFile) return;

    startTransition(async () => {
      try {
        // 1) Recortado 512×512 para el avatar de siempre
        const croppedBlob = await getCroppedBlob(imageSrc, pixelCrop);

        // 2) Original procesado (resize a 1600px max + JPEG 88%) para "Ver foto"
        const { blob: fullBlob } = await processImage(sourceFile, {
          maxDimension: 1600,
          quality: 0.88,
        });

        const formData = new FormData();
        formData.append("avatar", croppedBlob, "avatar.jpg");
        formData.append("avatar_full", fullBlob, "avatar-full.jpg");

        const result = await uploadAvatar(
          { error: null, success: false },
          formData,
        );

        if (result.error) {
          setError(result.error);
          return;
        }

        setImageSrc(null);
        setSourceFile(null);
        setPixelCrop(null);
        setSuccess(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al procesar la imagen.",
        );
      }
    });
  }

  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        Foto de perfil
      </h2>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="sr-only"
      />

      {imageSrc ? (
        <div className="mt-6 flex flex-col items-center gap-5">
          <div className="relative h-72 w-72 overflow-hidden rounded-2xl bg-muted-soft sm:h-80 sm:w-80">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              minZoom={1}
              maxZoom={3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, area) => setPixelCrop(area)}
            />
          </div>

          <div className="flex w-72 items-center gap-3 sm:w-80">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Zoom
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-accent"
              aria-label="Nivel de zoom"
            />
          </div>

          <p className="text-center text-xs text-muted">
            Arrastra para reposicionar. Usa el slider para acercar o alejar.
            <br />
            Guardamos también la imagen original para que se pueda ver entera.
          </p>

          {error && (
            <p className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-2 text-xs text-accent">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              disabled={isPending || !pixelCrop}
            >
              {isPending ? "Subiendo…" : "Confirmar"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-6">
          <Avatar
            username={username}
            fullName={fullName}
            avatarUrl={avatarUrl}
            size="lg"
          />
          <div className="flex-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePickFile}
            >
              Cambiar foto
            </Button>
            <p className="mt-2 text-xs text-muted">
              JPG, PNG, WebP o AVIF. Hasta 10 MB. Guardamos versión recortada
              y original.
            </p>
            {error && (
              <p className="mt-2 text-xs text-accent" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-2 text-xs text-foreground" role="status">
                Avatar actualizado.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
