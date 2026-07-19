// Social a nivel POST: likes, comentarios y votos de borrado. Espeja lib/social
// (que era por foto) pero contra post_likes / post_comments / post_delete_votes.
import { createClient } from "@/lib/supabase/server";

export interface Liker {
  user_id: string;
  nombre: string;
  rol: "novio" | "novia" | null;
}

export interface CommentView {
  id: string;
  texto: string;
  created_at: string | null;
  autorNombre: string;
  autorRol: "novio" | "novia" | null;
  mine: boolean;
}

export interface PostSocial {
  me: string | null;
  likers: Liker[];
  likedByMe: boolean;
  comments: CommentView[];
}

export interface DeleteVotesState {
  votedByMe: boolean;
  partnerName: string | null; // nombre de la pareja si ya votó, si no null
}

export async function getPostSocial(postId: string): Promise<PostSocial> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const me = user?.id ?? null;

  const [{ data: profiles }, { data: likes }, { data: comments }] =
    await Promise.all([
      supabase.from("profiles").select("id, nombre, rol"),
      supabase.from("post_likes").select("user_id").eq("post_id", postId),
      supabase
        .from("post_comments")
        .select("id, user_id, texto, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true }),
    ]);

  const perfil = new Map<
    string,
    { nombre: string; rol: "novio" | "novia" | null }
  >();
  for (const p of profiles ?? []) {
    perfil.set(p.id as string, {
      nombre: (p.nombre as string) ?? "Alguien",
      rol: (p.rol as "novio" | "novia" | null) ?? null,
    });
  }

  const likers: Liker[] = (likes ?? []).map((l) => {
    const uid = l.user_id as string;
    const p = perfil.get(uid);
    return { user_id: uid, nombre: p?.nombre ?? "Alguien", rol: p?.rol ?? null };
  });

  const commentsView: CommentView[] = (comments ?? []).map((c) => {
    const uid = c.user_id as string | null;
    const p = uid ? perfil.get(uid) : undefined;
    return {
      id: c.id as string,
      texto: c.texto as string,
      created_at: (c.created_at as string | null) ?? null,
      autorNombre: p?.nombre ?? "Alguien",
      autorRol: p?.rol ?? null,
      mine: !!me && uid === me,
    };
  });

  return {
    me,
    likers,
    likedByMe: !!me && likers.some((l) => l.user_id === me),
    comments: commentsView,
  };
}

/** Estado de votos de borrado del post para el usuario en sesión. */
export async function getPostDeleteVotes(
  postId: string
): Promise<DeleteVotesState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const me = user?.id ?? null;

  const { data: votes } = await supabase
    .from("post_delete_votes")
    .select("user_id")
    .eq("post_id", postId);

  const rows = (votes ?? []) as { user_id: string }[];
  const votedByMe = !!me && rows.some((v) => v.user_id === me);
  const partnerVote = rows.find((v) => v.user_id !== me);

  let partnerName: string | null = null;
  if (partnerVote) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", partnerVote.user_id)
      .maybeSingle();
    partnerName = (prof?.nombre as string) ?? "Tu pareja";
  }

  return { votedByMe, partnerName };
}
