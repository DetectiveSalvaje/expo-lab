"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
  fieldValues?: { email: string };
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldValues = { email };

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios.", fieldValues };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Mensajes más amables según el tipo de error de Supabase
    const message =
      error.message === "Invalid login credentials"
        ? "Email o contraseña incorrectos."
        : error.message === "Email not confirmed"
          ? "Tu cuenta aún no está confirmada. Revisa tu correo."
          : error.message;
    return { error: message, fieldValues };
  }

  // Refresca el cache del layout para que el header detecte la nueva sesión
  revalidatePath("/", "layout");
  redirect("/");
}
