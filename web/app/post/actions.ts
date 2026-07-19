"use server";
// Crear un post (álbum) a partir de fotos ya existentes en el pool. Las fotos
// nuevas se suben aparte (uploadPhoto) y quedan disponibles en el pool para
// incluirlas aquí.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DeezerTrack } from "@/lib/deezer";

export async function createPost(
  mediaIds: string[],
  descripcion: string,
  fecha: string,
  track?: DeezerTrack | null
): Promise<{ error?: string; id?: string; musicSaved?: boolean; musicError?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  if (mediaIds.length === 0)
    return { error: "Elige al menos una foto para el post." };

  const fechaIso = fecha
    ? new Date(`${fecha}T12:00:00Z`).toISOString()
    : new Date().toISOString();

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      descripcion: descripcion.trim() || null,
      fecha_mostrada: fechaIso,
    })
    .select("id")
    .single();
  if (error || !post) return { error: "No se pudo crear el post." };

  const postId = post.id as string;
  const rows = mediaIds.map((media_id, i) => ({
    post_id: postId,
    media_id,
    orden: i,
  }));
  const { error: pmErr } = await supabase.from("post_media").insert(rows);
  if (pmErr) {
    await supabase.from("posts").delete().eq("id", postId);
    return { error: "No se pudieron agregar las fotos al post." };
  }

  // Música opcional del post (Deezer). Cachea el track y lo cuelga al post.
  // Reporta si se guardó (sin tragar errores) para que la UI pueda avisar.
  let musicSaved = false;
  let musicError: string | undefined;
  if (track) {
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
      if (insErr) musicError = insErr.message;
      trackId = inserted?.id as string | undefined;
    }
    if (trackId) {
      const { error: linkErr } = await supabase
        .from("post_music")
        .insert({ post_id: postId, track_id: trackId });
      if (linkErr) musicError = linkErr.message;
      else musicSaved = true;
    } else if (!musicError) {
      musicError = "No se pudo guardar la pista.";
    }
  }

  revalidatePath("/feed");
  if (user?.id) revalidatePath(`/perfil/${user.id}`);
  return { id: postId, musicSaved, musicError };
}
