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

/**
 * Agrega fotos del pool compartido al perfil del usuario en sesión. Ignora las
 * que ya estén. No mueve ni copia archivos: solo referencia media existente.
 */
export async function addToProfile(
  mediaIds: string[]
): Promise<{ error?: string; added?: number }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };
  if (mediaIds.length === 0) return { added: 0 };

  const { data: existing } = await supabase
    .from("profile_media")
    .select("media_id")
    .eq("user_id", user.id)
    .in("media_id", mediaIds);
  const already = new Set((existing ?? []).map((r) => r.media_id as string));
  const toAdd = mediaIds.filter((id) => !already.has(id));
  if (toAdd.length === 0) return { added: 0 };

  // orden después del último que ya tenga el usuario.
  const { data: last } = await supabase
    .from("profile_media")
    .select("orden")
    .eq("user_id", user.id)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  let orden = ((last?.orden as number | undefined) ?? -1) + 1;

  const rows = toAdd.map((media_id) => ({
    user_id: user.id,
    media_id,
    orden: orden++,
  }));

  const { error } = await supabase.from("profile_media").insert(rows);
  if (error) return { error: "No se pudieron agregar las fotos al perfil." };

  revalidatePath(`/perfil/${user.id}`);
  return { added: toAdd.length };
}

/** Quita una foto del perfil (no la borra del pool). */
export async function removeFromProfile(
  mediaId: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  const { error } = await supabase
    .from("profile_media")
    .delete()
    .eq("user_id", user.id)
    .eq("media_id", mediaId);
  if (error) return { error: "No se pudo quitar la foto del perfil." };

  revalidatePath(`/perfil/${user.id}`);
  return {};
}
