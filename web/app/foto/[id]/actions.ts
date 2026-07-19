"use server";
// Server Actions de la foto individual. Corren con la sesión del usuario, así que
// la RLS de Supabase decide qué se permite (escritura sólo de lo propio).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";

const MAX_COMENTARIO = 1000;

/** Alterna mi like sobre una foto (insert si no existe, delete si existe). */
export async function toggleLike(mediaId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("media_id", mediaId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("likes")
      .insert({ media_id: mediaId, user_id: user.id });
  }

  revalidatePath(`/foto/${mediaId}`);
}

/** Agrega un comentario. Devuelve un error legible si el texto es inválido. */
export async function addComment(
  mediaId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  const texto = String(formData.get("texto") ?? "").trim();
  if (!texto) return { error: "El comentario está vacío." };
  if (texto.length > MAX_COMENTARIO) {
    return { error: `Máximo ${MAX_COMENTARIO} caracteres.` };
  }

  const { error } = await supabase
    .from("comments")
    .insert({ media_id: mediaId, user_id: user.id, texto });
  if (error) return { error: "No se pudo guardar el comentario." };

  revalidatePath(`/foto/${mediaId}`);
  return {};
}

/** Borra un comentario propio (la RLS impide borrar el del otro). */
export async function deleteComment(
  commentId: string,
  mediaId: string
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath(`/foto/${mediaId}`);
}

/**
 * Borra una foto: elimina la fila de `media` (los likes/comentarios se van por
 * ON DELETE CASCADE) y luego los objetos del bucket. Ambos pueden borrar (es
 * material compartido; útil para limpiar repetidas). Redirige al feed.
 */
export async function deletePhoto(mediaId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: row } = await supabase
    .from("media")
    .select("storage_path, thumb_path")
    .eq("id", mediaId)
    .maybeSingle();

  const { error } = await supabase.from("media").delete().eq("id", mediaId);
  if (error) return; // si RLS lo impide, no seguimos

  if (row) {
    const keys = [row.storage_path, row.thumb_path].filter(
      (k): k is string => !!k
    );
    await storage.remove(keys).catch(() => {});
  }

  revalidatePath("/feed");
  redirect("/feed");
}
