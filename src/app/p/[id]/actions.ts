"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// =========================================================
// updatePhoto — edita metadata + lista de imágenes (1-8)
// =========================================================

export type UpdatePhotoState = {
  error: string | null;
  success: boolean;
};

export type UpdatePhotoInput = {
  photoId: string;
  title: string;
  description: string;
  medium: "digital" | "analog" | null;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  iso: number | null;
  shutter_speed: string | null;
  images: Array<{
    storage_path: string;
    width: number | null;
    height: number | null;
  }>;
};

function clean(v: string | null, max: number): string | null {
  if (!v) return null;
  const t = v.trim();
  if (!t) return null;
  if (t.length > max) return t.slice(0, max);
  return t;
}

export async function updatePhoto(
  input: UpdatePhotoInput,
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  // 1. Verificar dueño
  const { data: photo } = await supabase
    .from("photos")
    .select("user_id")
    .eq("id", input.photoId)
    .maybeSingle();
  if (!photo) return { error: "Publicación no encontrada." };
  if (photo.user_id !== user.id) return { error: "No tienes permiso." };

  // 2. Validaciones
  if (!Array.isArray(input.images) || input.images.length === 0) {
    return { error: "La publicación debe tener al menos una imagen." };
  }
  if (input.images.length > 8) {
    return { error: "Máximo 8 imágenes por publicación." };
  }

  const title = clean(input.title, 120);
  const description = clean(input.description, 2000);
  const camera = clean(input.camera, 100);
  const lens = clean(input.lens, 100);
  const aperture = clean(input.aperture, 20);
  const shutter_speed = clean(input.shutter_speed, 30);
  let iso = input.iso;
  if (iso !== null && (Number.isNaN(iso) || iso < 1 || iso > 1_000_000)) {
    return { error: `${input.medium === "analog" ? "ASA" : "ISO"} inválido.` };
  }

  const techFields = input.medium
    ? {
        medium: input.medium,
        camera,
        lens,
        aperture,
        iso,
        shutter_speed,
      }
    : {
        medium: null,
        camera: null,
        lens: null,
        aperture: null,
        iso: null,
        shutter_speed: null,
      };

  // 3. Actualizar metadata
  const { error: updateError } = await supabase
    .from("photos")
    .update({
      title,
      description,
      ...techFields,
    })
    .eq("id", input.photoId);

  if (updateError) return { error: updateError.message };

  // 4. Diff de imágenes
  const { data: currentImages } = await supabase
    .from("photo_images")
    .select("storage_path")
    .eq("photo_id", input.photoId);

  const currentPaths = new Set(
    (currentImages ?? []).map((i) => i.storage_path),
  );
  const newPaths = new Set(input.images.map((i) => i.storage_path));
  const removedPaths = [...currentPaths].filter((p) => !newPaths.has(p));

  // 5. Borrar todas las filas de photo_images y reinsertar con posiciones nuevas
  //    (más simple que UPDATE-en-lote con conflicts por unique constraint)
  const { error: deleteError } = await supabase
    .from("photo_images")
    .delete()
    .eq("photo_id", input.photoId);

  if (deleteError) return { error: deleteError.message };

  const newRows = input.images.map((img, idx) => ({
    photo_id: input.photoId,
    storage_path: img.storage_path,
    width: img.width,
    height: img.height,
    position: idx,
  }));

  const { error: insertError } = await supabase
    .from("photo_images")
    .insert(newRows);

  if (insertError) return { error: insertError.message };

  // 6. Borrar archivos sobrantes del Storage (best effort)
  if (removedPaths.length > 0) {
    await supabase.storage.from("photos").remove(removedPaths);
  }

  revalidatePath(`/p/${input.photoId}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

// =========================================================
// deletePhoto — borra la publicación: archivos + filas
// =========================================================

export async function deletePhoto(
  photoId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  const { data: photo } = await supabase
    .from("photos")
    .select("user_id")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) return { error: "Foto no encontrada." };
  if (photo.user_id !== user.id) return { error: "No tienes permiso." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: images } = await supabase
    .from("photo_images")
    .select("storage_path")
    .eq("photo_id", photoId);

  if (images && images.length > 0) {
    await supabase.storage
      .from("photos")
      .remove(images.map((i) => i.storage_path));
  }

  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId);

  if (deleteError) return { error: deleteError.message };

  revalidatePath("/", "layout");
  redirect(`/u/${profile?.username ?? ""}`);
}
