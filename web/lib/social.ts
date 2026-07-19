// Capa de datos para likes y comentarios de una foto.
// Lectura: ambos ven todo (RLS: SELECT para autenticados).
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

export interface PhotoSocial {
  me: string | null;
  likers: Liker[];
  likedByMe: boolean;
  comments: CommentView[];
}

/**
 * Trae el estado social de una foto: quién dio like, si yo di like, y los
 * comentarios con su autor. Sólo somos 2 usuarios, así que resolvemos los
 * perfiles con un mapa en memoria en vez de embeddings frágiles de PostgREST.
 */
export async function getPhotoSocial(mediaId: string): Promise<PhotoSocial> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const me = user?.id ?? null;

  const [{ data: profiles }, { data: likes }, { data: comments }] =
    await Promise.all([
      supabase.from("profiles").select("id, nombre, rol"),
      supabase.from("likes").select("user_id").eq("media_id", mediaId),
      supabase
        .from("comments")
        .select("id, user_id, texto, created_at")
        .eq("media_id", mediaId)
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
