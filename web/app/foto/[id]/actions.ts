"use server";
// Server Actions de la foto individual. Corren con la sesión del usuario, así que
// la RLS de Supabase decide qué se permite (escritura sólo de lo propio).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";
import type { DeezerTrack } from "@/lib/deezer";

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
 * Voto para eliminar una foto. La foto se borra SOLO cuando novio y novia han
 * votado (2 votos distintos); la política RLS "media delete con 2 votos" lo
 * exige también en la BD. Si falto yo o mi pareja, queda "pendiente".
 */
export async function voteToDelete(
  mediaId: string
): Promise<{ pending?: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  // Registrar mi voto (idempotente por PK media_id+user_id).
  await supabase
    .from("media_delete_votes")
    .upsert(
      { media_id: mediaId, user_id: user.id },
      { onConflict: "media_id,user_id" }
    );

  // ¿Ya votaron los dos?
  const { data: votes } = await supabase
    .from("media_delete_votes")
    .select("user_id")
    .eq("media_id", mediaId);
  const distintos = new Set((votes ?? []).map((v) => v.user_id as string));

  if (distintos.size < 2) {
    revalidatePath(`/foto/${mediaId}`);
    return { pending: true };
  }

  // Ambos de acuerdo → borrar de verdad (fila + objetos del bucket; likes y
  // comentarios se van por ON DELETE CASCADE).
  const { data: row } = await supabase
    .from("media")
    .select("storage_path, thumb_path")
    .eq("id", mediaId)
    .maybeSingle();

  const { error } = await supabase.from("media").delete().eq("id", mediaId);
  if (error) return { error: "No se pudo eliminar la foto." };

  if (row) {
    const keys = [row.storage_path, row.thumb_path].filter(
      (k): k is string => !!k
    );
    await storage.remove(keys).catch(() => {});
  }

  revalidatePath("/feed");
  redirect("/feed");
}

/** Retira mi voto de borrado (mientras la foto siga existiendo). */
export async function cancelDeleteVote(mediaId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("media_delete_votes")
    .delete()
    .eq("media_id", mediaId)
    .eq("user_id", user.id);

  revalidatePath(`/foto/${mediaId}`);
}

/**
 * Cuelga una pista de Deezer a una foto. Cachea el track en `music_tracks`
 * (reusa si ya existe por deezer_id) y reemplaza la canción anterior de la foto
 * (una canción por foto).
 */
export async function attachTrack(
  mediaId: string,
  track: DeezerTrack
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  // 1. Buscar o crear el track cacheado.
  let trackId: string | undefined;
  const { data: existing } = await supabase
    .from("music_tracks")
    .select("id")
    .eq("deezer_id", track.deezerId)
    .maybeSingle();

  if (existing?.id) {
    trackId = existing.id as string;
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from("music_tracks")
      .insert({
        deezer_id: track.deezerId,
        title: track.title,
        artist: track.artist,
        cover_url: track.cover,
        preview_url: track.preview,
      })
      .select("id")
      .single();
    if (insErr || !inserted) return { error: "No se pudo guardar la pista." };
    trackId = inserted.id as string;
  }

  // 2. Reemplazar la canción de la foto.
  await supabase.from("media_music").delete().eq("media_id", mediaId);
  const { error: linkErr } = await supabase
    .from("media_music")
    .insert({ media_id: mediaId, track_id: trackId });
  if (linkErr) return { error: "No se pudo colgar la canción." };

  revalidatePath(`/foto/${mediaId}`);
  return {};
}

/** Quita la canción colgada a una foto. */
export async function detachTrack(mediaId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("media_music").delete().eq("media_id", mediaId);
  revalidatePath(`/foto/${mediaId}`);
}
