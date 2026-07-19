"use server";
// Acciones del perfil: cambiar la foto de perfil (subiendo una nueva o
// eligiendo una foto ya existente). avatar_url guarda una CLAVE relativa del
// bucket (igual que media), y se firma al mostrar.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";

export async function setAvatarUpload(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  const file = formData.get("avatar");
  if (!(file instanceof File)) return { error: "Falta la imagen." };

  const key = `avatars/${user.id}-${Date.now()}.webp`;
  try {
    await storage.upload(key, file, "image/webp");
  } catch {
    return { error: "No se pudo subir el avatar." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: key })
    .eq("id", user.id);
  if (error) {
    await storage.remove([key]).catch(() => {});
    return { error: "No se pudo guardar el avatar." };
  }

  revalidatePath("/pareja");
  revalidatePath(`/perfil/${user.id}`);
  return {};
}

export async function setAvatarExisting(
  storagePath: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: storagePath })
    .eq("id", user.id);
  if (error) return { error: "No se pudo guardar el avatar." };

  revalidatePath("/pareja");
  revalidatePath(`/perfil/${user.id}`);
  return {};
}
