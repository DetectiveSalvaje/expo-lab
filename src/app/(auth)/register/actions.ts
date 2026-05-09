"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = {
  error: string | null;
  fieldValues?: {
    email: string;
    username: string;
    fullName: string;
  };
};

const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();

  const fieldValues = { email, username, fullName };

  // Validaciones básicas
  if (!email || !password || !username) {
    return { error: "Email, usuario y contraseña son obligatorios.", fieldValues };
  }
  if (password.length < 8) {
    return {
      error: "La contraseña debe tener al menos 8 caracteres.",
      fieldValues,
    };
  }
  if (!USERNAME_REGEX.test(username)) {
    return {
      error:
        "Usuario inválido. Solo letras minúsculas, números y guion bajo. Entre 3 y 30 caracteres.",
      fieldValues,
    };
  }

  const supabase = await createClient();

  // Comprobar disponibilidad del username (evita errores silenciosos en el trigger)
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existingProfile) {
    return { error: "Ese nombre de usuario ya está en uso.", fieldValues };
  }

  // Construir la URL absoluta para el callback de email
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName || null,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message, fieldValues };
  }

  redirect("/verify-email");
}
