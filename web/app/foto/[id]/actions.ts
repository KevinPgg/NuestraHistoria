"use server";
// Server Actions de la foto individual. Corren con la sesión del usuario, así que
// la RLS de Supabase decide qué se permite (escritura sólo de lo propio).
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
