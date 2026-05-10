"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { processImage } from "@/lib/processImage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { createPublication } from "./actions";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_IMAGES = 8;

type Medium = "digital" | "analog" | null;

type LocalImage = {
  id: string; // id local para dnd-kit
  file: File;
  previewUrl: string;
};

type Props = {
  userId: string;
};

export function UploadForm({ userId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<LocalImage[]>([]);
  const [medium, setMedium] = useState<Medium>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  // Limpieza de URLs de blob al desmontar
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function pickFiles() {
    fileInputRef.current?.click();
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setError(null);
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`Máximo ${MAX_IMAGES} imágenes por publicación.`);
      return;
    }
    const accepted = files.slice(0, remaining);
    if (files.length > remaining) {
      setError(
        `Solo agregamos ${remaining}: máximo ${MAX_IMAGES} por publicación.`,
      );
    }

    const newImages: LocalImage[] = [];
    for (const f of accepted) {
      if (!ALLOWED_MIME.includes(f.type)) {
        setError("Hay archivos con formato no permitido. Usa JPG, PNG, WebP o AVIF.");
        continue;
      }
      if (f.size > MAX_INPUT_BYTES) {
        setError("Hay archivos que exceden 25 MB.");
        continue;
      }
      newImages.push({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    // Reset el input para permitir volver a seleccionar el mismo archivo
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const removed = prev.find((i) => i.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setImages((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  function selectMedium(value: NonNullable<Medium>) {
    setMedium((current) => (current === value ? null : value));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!images.length) {
      setError("Sube al menos una imagen.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const camera = (String(formData.get("camera") ?? "").trim() || null);
    const lens = (String(formData.get("lens") ?? "").trim() || null);
    const aperture = (String(formData.get("aperture") ?? "").trim() || null);
    const shutter_speed =
      (String(formData.get("shutter_speed") ?? "").trim() || null);
    const isoRaw = String(formData.get("iso") ?? "").trim();
    const iso = isoRaw ? parseInt(isoRaw, 10) : null;

    if (iso !== null && (Number.isNaN(iso) || iso < 1 || iso > 1_000_000)) {
      setError(`${medium === "analog" ? "ASA" : "ISO"} inválido.`);
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const publicationId = crypto.randomUUID();

        // 1) Procesar y subir cada imagen al storage en paralelo
        setProgress({ done: 0, total: images.length });
        const uploaded = await Promise.all(
          images.map(async (img, idx) => {
            const { blob, width, height } = await processImage(img.file);
            const path = `${userId}/${publicationId}-${idx}.jpg`;
            const { error: uploadError } = await supabase.storage
              .from("photos")
              .upload(path, blob, {
                contentType: "image/jpeg",
                upsert: false,
              });
            if (uploadError) throw new Error(uploadError.message);
            setProgress((p) =>
              p ? { done: p.done + 1, total: p.total } : null,
            );
            return { storage_path: path, width, height };
          }),
        );

        // 2) Crear la publicación + photo_images vía server action
        const result = await createPublication({
          publicationId,
          title,
          description,
          medium,
          camera: medium ? camera : null,
          lens: medium ? lens : null,
          aperture: medium ? aperture : null,
          iso: medium ? iso : null,
          shutter_speed: medium ? shutter_speed : null,
          images: uploaded,
        });

        // En éxito, la action redirige y nunca llegamos aquí
        if (result?.error) {
          setError(result.error);
          // Best-effort: limpiar archivos subidos
          await supabase.storage
            .from("photos")
            .remove(uploaded.map((u) => u.storage_path));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir.");
      } finally {
        setProgress(null);
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
        multiple
        onChange={handleFilesChange}
        className="sr-only"
      />

      {/* Picker / Grid de imágenes */}
      {images.length === 0 ? (
        <button
          type="button"
          onClick={pickFiles}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted-soft text-muted transition-colors hover:bg-border/30"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em]">
            Subir fotos
          </span>
          <span className="text-sm">
            Clic aquí para elegir imágenes
          </span>
          <span className="text-xs">
            JPG, PNG, WebP o AVIF · hasta {MAX_IMAGES} por publicación · máx
            25 MB cada una
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img, idx) => (
                  <SortableImageCard
                    key={img.id}
                    id={img.id}
                    previewUrl={img.previewUrl}
                    position={idx + 1}
                    onRemove={() => removeImage(img.id)}
                  />
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={pickFiles}
                    className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-muted-soft text-muted transition-colors hover:bg-border/30"
                  >
                    <span className="font-mono text-xl">+</span>
                    <span className="text-xs">Añadir</span>
                  </button>
                )}
              </div>
            </SortableContext>
          </DndContext>
          <p className="text-xs text-muted">
            {images.length} de {MAX_IMAGES} · arrastra para reordenar · clic en
            la X para eliminar
          </p>
        </div>
      )}

      <Input label="Título" name="title" placeholder="Opcional" maxLength={120} />

      <Textarea
        label="Descripción"
        name="description"
        rows={3}
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
            placeholder={medium === "digital" ? "Sony A7 IV" : "Canon AE-1"}
            maxLength={100}
          />
          <Input label="Lente" name="lens" placeholder="50mm f/1.4" maxLength={100} />
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

      {progress && (
        <p className="text-sm text-muted">
          Subiendo {progress.done} / {progress.total} imágenes…
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending || images.length === 0}
        >
          {isPending
            ? progress
              ? `Subiendo ${progress.done}/${progress.total}…`
              : "Publicando…"
            : "Publicar"}
        </Button>
      </div>
    </form>
  );
}

function SortableImageCard({
  id,
  previewUrl,
  position,
  onRemove,
}: {
  id: string;
  previewUrl: string;
  position: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square overflow-hidden rounded-2xl bg-muted-soft"
    >
      {/* Imagen + área de drag */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={`Imagen ${position}`}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Etiqueta de posición */}
      <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 font-mono text-xs text-white backdrop-blur">
        {position}
      </span>

      {/* Botón X */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/85"
        aria-label="Eliminar imagen"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="3" y1="3" x2="9" y2="9" />
          <line x1="9" y1="3" x2="3" y2="9" />
        </svg>
      </button>
    </div>
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
