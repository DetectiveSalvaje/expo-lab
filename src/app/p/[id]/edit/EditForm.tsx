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
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { processImage } from "@/lib/processImage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { updatePhoto } from "../actions";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_IMAGES = 8;

type Medium = "digital" | "analog" | null;

type ExistingImage = {
  id: string; // photo_images.id (también sirve de id local para dnd-kit)
  kind: "existing";
  storage_path: string;
  url: string;
  width: number | null;
  height: number | null;
};

type NewImage = {
  id: string; // uuid generado en cliente
  kind: "new";
  file: File;
  previewUrl: string;
};

type ImageItem = ExistingImage | NewImage;

type Props = {
  photo: {
    id: string;
    userId: string;
    title: string | null;
    description: string | null;
    medium: "digital" | "analog" | null;
    camera: string | null;
    lens: string | null;
    aperture: string | null;
    iso: number | null;
    shutter_speed: string | null;
  };
  initialImages: Array<{
    id: string;
    storage_path: string;
    url: string;
    width: number | null;
    height: number | null;
  }>;
};

export function EditForm({ photo, initialImages }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<ImageItem[]>(
    initialImages.map((img) => ({
      id: img.id,
      kind: "existing",
      storage_path: img.storage_path,
      url: img.url,
      width: img.width,
      height: img.height,
    })),
  );
  const [medium, setMedium] = useState<Medium>(photo.medium);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  // Cleanup blob URLs al desmontar
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.kind === "new") URL.revokeObjectURL(img.previewUrl);
      });
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

    const newItems: NewImage[] = [];
    for (const f of accepted) {
      if (!ALLOWED_MIME.includes(f.type)) {
        setError("Formato no permitido. Usa JPG, PNG, WebP o AVIF.");
        continue;
      }
      if (f.size > MAX_INPUT_BYTES) {
        setError("Algún archivo excede 25 MB.");
        continue;
      }
      newItems.push({
        id: crypto.randomUUID(),
        kind: "new",
        file: f,
        previewUrl: URL.createObjectURL(f),
      });
    }

    setImages((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(id: string) {
    if (images.length <= 1) {
      setError("La publicación debe tener al menos una imagen.");
      return;
    }
    setError(null);
    setImages((prev) => {
      const removed = prev.find((i) => i.id === id);
      if (removed && removed.kind === "new") {
        URL.revokeObjectURL(removed.previewUrl);
      }
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
    if (images.length === 0) {
      setError("La publicación debe tener al menos una imagen.");
      return;
    }
    if (images.length > MAX_IMAGES) {
      setError(`Máximo ${MAX_IMAGES} imágenes por publicación.`);
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
        const newImages = images.filter(
          (i): i is NewImage => i.kind === "new",
        );

        // 1) Procesar y subir las nuevas al Storage
        const uploaded: Map<string, {
          storage_path: string;
          width: number;
          height: number;
        }> = new Map();

        setProgress({ done: 0, total: newImages.length });

        for (const img of newImages) {
          const { blob, width, height } = await processImage(img.file);
          const path = `${photo.userId}/${photo.id}-${img.id}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from("photos")
            .upload(path, blob, {
              contentType: "image/jpeg",
              upsert: false,
            });
          if (uploadError) throw new Error(uploadError.message);
          uploaded.set(img.id, {
            storage_path: path,
            width,
            height,
          });
          setProgress((p) =>
            p ? { done: p.done + 1, total: p.total } : null,
          );
        }

        // 2) Construir lista final en el orden actual
        const finalImages = images.map((img) => {
          if (img.kind === "existing") {
            return {
              storage_path: img.storage_path,
              width: img.width,
              height: img.height,
            };
          }
          const u = uploaded.get(img.id);
          if (!u) throw new Error("Upload missing for new image");
          return {
            storage_path: u.storage_path,
            width: u.width,
            height: u.height,
          };
        });

        // 3) Llamar a la action
        const result = await updatePhoto({
          photoId: photo.id,
          title,
          description,
          medium,
          camera: medium ? camera : null,
          lens: medium ? lens : null,
          aperture: medium ? aperture : null,
          iso: medium ? iso : null,
          shutter_speed: medium ? shutter_speed : null,
          images: finalImages,
        });

        if ("error" in result) {
          setError(result.error);
          return;
        }

        // 4) Navegar al detalle
        router.push(`/p/${photo.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar.");
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

      {/* Gestor de imágenes */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Imágenes
        </p>
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
                  previewUrl={img.kind === "existing" ? img.url : img.previewUrl}
                  position={idx + 1}
                  isNew={img.kind === "new"}
                  canRemove={images.length > 1}
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
          {images.length} de {MAX_IMAGES} · arrastra para reordenar · la X
          quita una imagen (mín 1)
        </p>
      </div>

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
        <p className="text-xs text-muted">
          Si lo deseleccionas, se borran los datos técnicos de esta foto.
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

      {error && (
        <p
          className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent"
          role="alert"
        >
          {error}
        </p>
      )}

      {progress && progress.total > 0 && (
        <p className="text-sm text-muted">
          Subiendo {progress.done} / {progress.total} imágenes nuevas…
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
          disabled={isPending || images.length === 0}
        >
          {isPending
            ? progress && progress.total > 0
              ? `Subiendo ${progress.done}/${progress.total}…`
              : "Guardando…"
            : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function SortableImageCard({
  id,
  previewUrl,
  position,
  isNew,
  canRemove,
  onRemove,
}: {
  id: string;
  previewUrl: string;
  position: number;
  isNew: boolean;
  canRemove: boolean;
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

      <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 font-mono text-xs text-white backdrop-blur">
        {position}
      </span>

      {isNew && (
        <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-foreground">
          nueva
        </span>
      )}

      {canRemove && (
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
      )}
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
