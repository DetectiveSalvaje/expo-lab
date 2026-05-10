"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// =========================================================
// updateProfile — actualiza nombre, bio y web
// =========================================================

export type ProfileState = {
  error: string | null;
  success: boolean;
  fieldValues?: { fullName: string; bio: string; website: string };
};

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  const fieldValues = { fullName, bio, website };

  if (fullName.length > 60) {
    return {
      error: "El nombre no puede exceder 60 caracteres.",
      success: false,
      fieldValues,
    };
  }
  if (bio.length > 280) {
    return {
      error: "La bio no puede exceder 280 caracteres.",
      success: false,
      fieldValues,
    };
  }
  if (website && !/^https?:\/\//.test(website)) {
    return {
      error: "La web debe empezar por http:// o https://",
      success: false,
      fieldValues,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesión expirada.", success: false, fieldValues };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      bio: bio || null,
      website: website || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message, success: false, fieldValues };
  }

  revalidatePath("/", "layout");
  return { error: null, success: true, fieldValues };
}

// =========================================================
// uploadAvatar — sube DOS versiones: recortado + original procesado
// =========================================================

export type AvatarState = {
  error: string | null;
  success: boolean;
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES_CROPPED = 2 * 1024 * 1024; // 2 MB para el avatar recortado
const MAX_BYTES_ORIGINAL = 4 * 1024 * 1024; // 4 MB para la versión original procesada

export async function uploadAvatar(
  _prevState: AvatarState,
  formData: FormData,
): Promise<AvatarState> {
  const cropped = formData.get("avatar") as File | null;
  const fullSize = formData.get("avatar_full") as File | null;

  if (!cropped || cropped.size === 0) {
    return { error: "Selecciona una imagen.", success: false };
  }
  if (!ALLOWED_MIME.includes(cropped.type)) {
    return {
      error: "Formato del recorte no permitido.",
      success: false,
    };
  }
  if (cropped.size > MAX_BYTES_CROPPED) {
    return { error: "El recorte excede 2 MB.", success: false };
  }
  if (fullSize && fullSize.size > MAX_BYTES_ORIGINAL) {
    return { error: "La versión original excede 4 MB.", success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesión expirada.", success: false };
  }

  const timestamp = Date.now();
  const ext = cropped.type.split("/")[1] === "jpeg" ? "jpg" : cropped.type.split("/")[1];

  // Subir el recortado (avatar visible en todos lados)
  const croppedPath = `${user.id}/avatar-${timestamp}.${ext}`;
  const { error: croppedError } = await supabase.storage
    .from("avatars")
    .upload(croppedPath, cropped, {
      contentType: cropped.type,
      upsert: false,
    });
  if (croppedError) {
    return { error: croppedError.message, success: false };
  }

  // Subir la versión original (para "Ver foto")
  let originalUrl: string | null = null;
  if (fullSize && fullSize.size > 0) {
    const fullExt = fullSize.type.split("/")[1] === "jpeg" ? "jpg" : fullSize.type.split("/")[1];
    const originalPath = `${user.id}/avatar-full-${timestamp}.${fullExt}`;
    const { error: fullError } = await supabase.storage
      .from("avatars")
      .upload(originalPath, fullSize, {
        contentType: fullSize.type,
        upsert: false,
      });
    if (!fullError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(originalPath);
      originalUrl = publicUrl;
    }
    // Si falló subir la original, igual seguimos con el recortado
  }

  const {
    data: { publicUrl: croppedUrl },
  } = supabase.storage.from("avatars").getPublicUrl(croppedPath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: croppedUrl,
      avatar_original_url: originalUrl,
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  revalidatePath("/", "layout");
  return { error: null, success: true };
}
