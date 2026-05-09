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

  // Refresca la página de perfil + el header
  revalidatePath("/", "layout");
  return { error: null, success: true, fieldValues };
}

// =========================================================
// uploadAvatar — sube una imagen a Storage y la asocia al perfil
// =========================================================

export type AvatarState = {
  error: string | null;
  success: boolean;
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB (igual que el bucket)

export async function uploadAvatar(
  _prevState: AvatarState,
  formData: FormData,
): Promise<AvatarState> {
  const file = formData.get("avatar") as File | null;

  if (!file || file.size === 0) {
    return { error: "Selecciona una imagen.", success: false };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return {
      error: "Formato no permitido. Usa JPG, PNG, WebP o AVIF.",
      success: false,
    };
  }
  if (file.size > MAX_BYTES) {
    return { error: "La imagen no puede exceder 2 MB.", success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesión expirada.", success: false };
  }

  // Extension a partir del MIME (más fiable que el filename)
  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message, success: false };
  }

  // URL pública del nuevo avatar
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  revalidatePath("/", "layout");
  return { error: null, success: true };
}
