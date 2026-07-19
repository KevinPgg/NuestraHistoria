// Datos de perfil para la sección Pareja / perfiles individuales.
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";

export interface ProfileCard {
  id: string;
  nombre: string;
  rol: "novio" | "novia" | null;
  avatarKey: string | null; // clave relativa en el bucket (o de una foto existente)
  avatarUrl: string | null; // URL firmada para mostrar
}

export interface UserStats {
  posts: number;
  likes: number;
  comments: number;
}

async function signAvatars(keys: string[]): Promise<Record<string, string>> {
  const real = keys.filter((k): k is string => !!k);
  if (real.length === 0) return {};
  return storage.getUrls(real);
}

/** Los dos perfiles (para la landing de Pareja). */
export async function getAllProfiles(): Promise<ProfileCard[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nombre, rol, avatar_url")
    .order("rol");
  const rows = data ?? [];
  const signed = await signAvatars(
    rows.map((r) => r.avatar_url as string | null).filter((k): k is string => !!k)
  );
  return rows.map((r) => {
    const key = (r.avatar_url as string | null) ?? null;
    return {
      id: r.id as string,
      nombre: (r.nombre as string) ?? "—",
      rol: (r.rol as "novio" | "novia" | null) ?? null,
      avatarKey: key,
      avatarUrl: key ? signed[key] ?? null : null,
    };
  });
}

/** Un perfil por id. */
export async function getProfileById(id: string): Promise<ProfileCard | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nombre, rol, avatar_url")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const key = (data.avatar_url as string | null) ?? null;
  const signed = key ? await signAvatars([key]) : {};
  return {
    id: data.id as string,
    nombre: (data.nombre as string) ?? "—",
    rol: (data.rol as "novio" | "novia" | null) ?? null,
    avatarKey: key,
    avatarUrl: key ? signed[key] ?? null : null,
  };
}

/**
 * Contadores del perfil: publicaciones (posts del usuario), y likes/comentarios
 * recibidos sobre esos posts.
 */
export async function getUserStats(ownerId: string): Promise<UserStats> {
  const supabase = createClient();

  const { data: postRows } = await supabase
    .from("posts")
    .select("id")
    .eq("author_id", ownerId);
  const ids = (postRows ?? []).map((p) => p.id as string);

  const posts = ids.length;
  if (posts === 0) return { posts: 0, likes: 0, comments: 0 };

  const [{ count: likes }, { count: comments }] = await Promise.all([
    supabase
      .from("post_reactions")
      .select("id", { count: "exact", head: true })
      .in("post_id", ids),
    supabase
      .from("post_comments")
      .select("id", { count: "exact", head: true })
      .in("post_id", ids),
  ]);

  return { posts, likes: likes ?? 0, comments: comments ?? 0 };
}

/** Id del usuario en sesión (para saber si un perfil es el propio). */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
