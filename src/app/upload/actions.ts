"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UploadResult = { error: string };

type ImagePayload = {
  storage_path: string;
  width: number | null;
  height: number | null;
};

type CreatePublicationInput = {
  publicationId: string;
  title: string;
  description: string;
  medium: "digital" | "analog" | null;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  iso: number | null;
  shutter_speed: string | null;
  images: ImagePayload[];
};

const MAX_IMAGES = 8;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Crea la publicación: inserta una fila en `photos` y N filas en `photo_images`.
 * Asume que el cliente ya subió los archivos a Storage en sus paths finales.
 *
 * Si algo falla, hace rollback borrando los archivos del storage y la fila.
 */
export async function createPublication(
  input: CreatePublicationInput,
): Promise<UploadResult> {
  const {
    publicationId,
    title,
    description,
    medium,
    camera,
    lens,
    aperture,
    iso,
    shutter_speed,
    images,
  } = input;

  // Validaciones básicas
  if (!UUID_REGEX.test(publicationId)) {
    return { error: "ID de publicación inválido." };
  }
  if (!Array.isArray(images) || images.length === 0) {
    return { error: "Sube al menos una imagen." };
  }
  if (images.length > MAX_IMAGES) {
    return { error: `Máximo ${MAX_IMAGES} imágenes por publicación.` };
  }
  if (title.length > 120) return { error: "Título demasiado largo (máx 120)." };
  if (description.length > 2000) {
    return { error: "Descripción demasiado larga (máx 2000)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  // Cleanup helper en caso de fallo
  async function cleanupStorage() {
    if (images.length === 0) return;
    await supabase.storage.from("photos").remove(images.map((i) => i.storage_path));
  }

  // 1) Insertar la publicación
  const { error: insertError } = await supabase.from("photos").insert({
    id: publicationId,
    user_id: user.id,
    title: title || null,
    description: description || null,
    medium,
    camera,
    lens,
    aperture,
    iso,
    shutter_speed,
  });

  if (insertError) {
    await cleanupStorage();
    return { error: insertError.message };
  }

  // 2) Insertar las imágenes con su posición
  const imageRows = images.map((img, idx) => ({
    photo_id: publicationId,
    storage_path: img.storage_path,
    width: img.width,
    height: img.height,
    position: idx,
  }));

  const { error: imagesError } = await supabase
    .from("photo_images")
    .insert(imageRows);

  if (imagesError) {
    // Rollback: borrar la publicación (cascade borraría photo_images, pero como aún
    // no se insertaron, solo borramos los archivos)
    await supabase.from("photos").delete().eq("id", publicationId);
    await cleanupStorage();
    return { error: imagesError.message };
  }

  // 3) Username para redirigir
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath("/", "layout");
  redirect(`/u/${profile?.username ?? ""}`);
}
