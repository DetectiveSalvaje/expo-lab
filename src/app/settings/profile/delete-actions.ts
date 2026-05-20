"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type DeleteAccountResult = { error: string } | { ok: true };

/**
 * Elimina la cuenta del usuario actual de forma permanente.
 *
 * Pasos:
 * 1. Verifica que el usuario esté logueado.
 * 2. Verifica que haya escrito su username exacto para confirmar.
 * 3. Borra todos los archivos del usuario en Storage (avatars + photos).
 * 4. Borra el usuario de auth.users con cliente admin.
 *    Los cascades on delete encadenan: profile → photos → photo_images → likes
 *    → follows → comments → saves → notifications. Todo se va.
 * 5. Cierra sesión y redirige al inicio.
 */
export async function deleteAccount(
  confirmedUsername: string,
): Promise<DeleteAccountResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  // 1. Validar que tipeó el username correctamente
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Perfil no encontrado." };
  }

  const typed = confirmedUsername.trim().toLowerCase();
  if (typed !== profile.username) {
    return {
      error: `Para confirmar escribe tu nombre de usuario exacto: ${profile.username}`,
    };
  }

  // 2. Admin client para operaciones privilegiadas
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[deleteAccount] admin client failed:", err);
    return {
      error: "Configuración del servidor incompleta. Contacta al admin.",
    };
  }

  // 3. Borrar archivos de Storage
  await cleanupBucket(admin, "avatars", user.id);
  await cleanupBucket(admin, "photos", user.id);

  // 4. Borrar usuario de auth.users (cascade hace el resto)
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    console.error("[deleteAccount] deleteUser failed:", deleteUserError);
    return { error: deleteUserError.message };
  }

  // 5. Cerrar sesión local (limpia cookies)
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Lista y borra todos los archivos del usuario en un bucket.
 * Silencia errores individuales — la prioridad es completar el delete.
 */
async function cleanupBucket(
  admin: ReturnType<typeof createAdminClient>,
  bucket: "avatars" | "photos",
  userId: string,
) {
  try {
    const { data: files, error } = await admin.storage
      .from(bucket)
      .list(userId);

    if (error) {
      console.error(`[deleteAccount] list ${bucket} failed:`, error.message);
      return;
    }
    if (!files || files.length === 0) return;

    const paths = files.map((f) => `${userId}/${f.name}`);
    const { error: removeError } = await admin.storage
      .from(bucket)
      .remove(paths);

    if (removeError) {
      console.error(
        `[deleteAccount] remove ${bucket} failed:`,
        removeError.message,
      );
    }
  } catch (err) {
    console.error(`[deleteAccount] cleanup ${bucket} threw:`, err);
  }
}
