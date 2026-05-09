"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UploadResult = { error: string };

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

function asTrimmedOrNull(value: FormDataEntryValue | null, max: number): string | null {
  const v = String(value ?? "").trim();
  if (!v) return null;
  if (v.length > max) return null; // se valida arriba; null indica "ignorar"
  return v;
}

export async function uploadPhoto(formData: FormData): Promise<UploadResult> {
  const file = formData.get("photo") as File | null;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const width = parseInt(String(formData.get("width") ?? ""), 10) || null;
  const height = parseInt(String(formData.get("height") ?? ""), 10) || null;

  // Ficha técnica
  const mediumRaw = String(formData.get("medium") ?? "").trim();
  const medium =
    mediumRaw === "digital" || mediumRaw === "analog" ? mediumRaw : null;

  const camera = asTrimmedOrNull(formData.get("camera"), 100);
  const lens = asTrimmedOrNull(formData.get("lens"), 100);
  const aperture = asTrimmedOrNull(formData.get("aperture"), 20);
  const shutterSpeed = asTrimmedOrNull(formData.get("shutter_speed"), 30);
  const isoRaw = String(formData.get("iso") ?? "").trim();
  const iso = isoRaw ? parseInt(isoRaw, 10) : null;

  // Validaciones de imagen
  if (!file || file.size === 0) return { error: "Selecciona una imagen." };
  if (!ALLOWED_MIME.includes(file.type)) {
    return { error: "Formato no permitido. Usa JPG, PNG o WebP." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "La imagen procesada excede 10 MB." };
  }
  if (title.length > 120) return { error: "El título no puede exceder 120 caracteres." };
  if (description.length > 2000) {
    return { error: "La descripción no puede exceder 2000 caracteres." };
  }

  // Validaciones técnicas
  if (camera && camera.length > 100) return { error: "Cámara demasiado larga." };
  if (lens && lens.length > 100) return { error: "Lente demasiado largo." };
  if (aperture && aperture.length > 20) return { error: "Apertura demasiado larga." };
  if (shutterSpeed && shutterSpeed.length > 30) {
    return { error: "Velocidad demasiado larga." };
  }
  if (iso !== null) {
    if (Number.isNaN(iso) || iso < 1 || iso > 1_000_000) {
      return { error: `${medium === "analog" ? "ASA" : "ISO"} inválido.` };
    }
  }

  // Si no se eligió medium, los campos técnicos se descartan
  // (igual los guardaríamos pero por consistencia los limpiamos)
  const techFields = medium
    ? { medium, camera, lens, aperture, iso, shutter_speed: shutterSpeed }
    : {
        medium: null,
        camera: null,
        lens: null,
        aperture: null,
        iso: null,
        shutter_speed: null,
      };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const photoId = crypto.randomUUID();
  const path = `${user.id}/${photoId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("photos").insert({
    id: photoId,
    user_id: user.id,
    storage_path: path,
    title: title || null,
    description: description || null,
    width,
    height,
    ...techFields,
  });

  if (insertError) {
    await supabase.storage.from("photos").remove([path]);
    return { error: insertError.message };
  }

  revalidatePath("/", "layout");
  redirect(`/u/${profile?.username ?? ""}`);
}
