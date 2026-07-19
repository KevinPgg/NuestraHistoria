"use server";
// Acciones a nivel POST: like, comentarios, música y borrado por 2 votos.
// Espejan las de foto pero contra post_likes / post_comments / post_music /
// post_delete_votes. Corren con la sesión del usuario (RLS decide).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DeezerTrack } from "@/lib/deezer";

const MAX_COMENTARIO = 1000;

export async function togglePostLike(postId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_likes").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: user.id });
  }
  revalidatePath(`/post/${postId}`);
}

const REACTION_TIPOS = [
  "encanta",
  "divierte",
  "estremece",
  "enoja",
  "asombra",
  "excelenchi",
];

/** Agrega una reacción al post. Sin límite: cada llamada suma una. */
export async function addReaction(
  postId: string,
  tipo: string
): Promise<void> {
  if (!REACTION_TIPOS.includes(tipo)) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("post_reactions")
    .insert({ post_id: postId, user_id: user.id, tipo });
  revalidatePath(`/post/${postId}`);
}

/** Deshace (borra) mi reacción más reciente en el post. */
export async function undoMyReaction(postId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: last } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (last?.id) {
    await supabase.from("post_reactions").delete().eq("id", last.id);
  }
  revalidatePath(`/post/${postId}`);
}

export async function addPostComment(
  postId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  const texto = String(formData.get("texto") ?? "").trim();
  if (!texto) return { error: "El comentario está vacío." };
  if (texto.length > MAX_COMENTARIO)
    return { error: `Máximo ${MAX_COMENTARIO} caracteres.` };

  const { error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, user_id: user.id, texto });
  if (error) return { error: "No se pudo guardar el comentario." };

  revalidatePath(`/post/${postId}`);
  return {};
}

export async function deletePostComment(
  commentId: string,
  postId: string
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);
  revalidatePath(`/post/${postId}`);
}

/**
 * Borra un post. Es del usuario: solo su autor puede borrarlo (la RLS lo exige
 * también). post_media/likes/comments/music se van por cascade; las FOTOS siguen
 * en el pool. Redirige al perfil del autor.
 */
export async function deletePost(
  postId: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { error: "El post no existe." };
  if ((post.author_id as string | null) !== user.id)
    return { error: "Solo el autor puede borrar su post." };

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) return { error: "No se pudo eliminar el post." };

  revalidatePath(`/perfil/${user.id}`);
  redirect(`/perfil/${user.id}`);
}

/** Cuelga una pista de Deezer al post (una canción por post). */
export async function attachPostTrack(
  postId: string,
  track: DeezerTrack
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

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

  await supabase.from("post_music").delete().eq("post_id", postId);
  const { error: linkErr } = await supabase
    .from("post_music")
    .insert({ post_id: postId, track_id: trackId });
  if (linkErr) return { error: "No se pudo colgar la canción." };

  revalidatePath(`/post/${postId}`);
  return {};
}

export async function detachPostTrack(postId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("post_music").delete().eq("post_id", postId);
  revalidatePath(`/post/${postId}`);
}
