"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// =========================================================
// updatePhoto — edita título, descripción y ficha técnica
// =========================================================

export type UpdatePhotoState = {
  error: string | null;
  success: boolean;
};

function asTrimmedOrNull(
  value: FormDataEntryValue | null,
  max: number,
): { ok: true; value: string | null } | { ok: false } {
  const v = String(value ?? "").trim();
  if (!v) return { ok: true, value: null };
  if (v.length > max) return { ok: false };
  return { ok: true, value: v };
}

export async function updatePhoto(
  _prevState: UpdatePhotoState,
  formData: FormData,
): Promise<UpdatePhotoState> {
  const photoId = String(formData.get("photoId") ?? "");
  if (!photoId) return { error: "Foto no encontrada.", success: false };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const mediumRaw = String(formData.get("medium") ?? "").trim();
  const medium =
    mediumRaw === "digital" || mediumRaw === "analog" ? mediumRaw : null;

  const cameraR = asTrimmedOrNull(formData.get("camera"), 100);
  const lensR = asTrimmedOrNull(formData.get("lens"), 100);
  const apertureR = asTrimmedOrNull(formData.get("aperture"), 20);
  const shutterR = asTrimmedOrNull(formData.get("shutter_speed"), 30);

  if (!cameraR.ok) return { error: "Cámara demasiado larga.", success: false };
  if (!lensR.ok) return { error: "Lente demasiado largo.", success: false };
  if (!apertureR.ok) return { error: "Apertura demasiado larga.", success: false };
  if (!shutterR.ok) return { error: "Velocidad demasiado larga.", success: false };

  const isoRaw = String(formData.get("iso") ?? "").trim();
  let iso: number | null = null;
  if (isoRaw) {
    iso = parseInt(isoRaw, 10);
    if (Number.isNaN(iso) || iso < 1 || iso > 1_000_000) {
      return {
        error: `${medium === "analog" ? "ASA" : "ISO"} inválido.`,
        success: false,
      };
    }
  }

  if (title.length > 120) {
    return { error: "Título demasiado largo (máx 120).", success: false };
  }
  if (description.length > 2000) {
    return { error: "Descripción demasiado larga (máx 2000).", success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada.", success: false };

  const techFields = medium
    ? {
        medium,
        camera: cameraR.value,
        lens: lensR.value,
        aperture: apertureR.value,
        iso,
        shutter_speed: shutterR.value,
      }
    : {
        medium: null,
        camera: null,
        lens: null,
        aperture: null,
        iso: null,
        shutter_speed: null,
      };

  const { error } = await supabase
    .from("photos")
    .update({
      title: title || null,
      description: description || null,
      ...techFields,
    })
    .eq("id", photoId);

  if (error) return { error: error.message, success: false };

  revalidatePath("/", "layout");
  redirect(`/p/${photoId}`);
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

  // Verificar dueño
  const { data: photo } = await supabase
    .from("photos")
    .select("user_id")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) return { error: "Foto no encontrada." };
  if (photo.user_id !== user.id) return { error: "No tienes permiso." };

  // Username para redirigir
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Recuperar todos los storage_path de las imágenes
  const { data: images } = await supabase
    .from("photo_images")
    .select("storage_path")
    .eq("photo_id", photoId);

  // 1) Borrar archivos del storage
  if (images && images.length > 0) {
    await supabase.storage
      .from("photos")
      .remove(images.map((i) => i.storage_path));
  }

  // 2) Borrar la fila (cascade borra photo_images, likes, comments)
  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId);

  if (deleteError) return { error: deleteError.message };

  revalidatePath("/", "layout");
  redirect(`/u/${profile?.username ?? ""}`);
}
