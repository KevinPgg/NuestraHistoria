// Destacados = favoritas top N por usuario. Cada quien (novio/novia) tiene su
// propia selección. Usa las tablas existentes `favorites` y `user_settings`
// (favoritas_count), sin esquema nuevo.
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";
import type { MediaRow, MediaWithUrls } from "@/lib/media";

const DEFAULT_LIMIT = 10;

export interface FavoritesInfo {
  isFavorite: boolean;
  count: number; // cuántas destacadas tengo ahora
  limit: number; // mi tope (favoritas_count)
}

/** Tope de destacadas del usuario en sesión (default 10). */
export async function getFavoritesLimit(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_LIMIT;

  const { data } = await supabase
    .from("user_settings")
    .select("favoritas_count")
    .eq("user_id", user.id)
    .maybeSingle();

  return (data?.favoritas_count as number | undefined) ?? DEFAULT_LIMIT;
}

/** Estado de destacado de una foto para el usuario en sesión. */
export async function getFavoritesInfo(mediaId: string): Promise<FavoritesInfo> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isFavorite: false, count: 0, limit: DEFAULT_LIMIT };

  const [{ data: mine }, { count }, limit] = await Promise.all([
    supabase
      .from("favorites")
      .select("media_id")
      .eq("user_id", user.id)
      .eq("media_id", mediaId)
      .maybeSingle(),
    supabase
      .from("favorites")
      .select("media_id", { count: "exact", head: true })
      .eq("user_id", user.id),
    getFavoritesLimit(),
  ]);

  return {
    isFavorite: !!mine,
    count: count ?? 0,
    limit,
  };
}

/** Mis destacadas, con thumbs firmados, ordenadas por rank y luego recientes. */
export async function getMyFavorites(): Promise<MediaWithUrls[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: favs } = await supabase
    .from("favorites")
    .select("media_id, rank")
    .eq("user_id", user.id);

  const ids = (favs ?? []).map((f) => f.media_id as string);
  if (ids.length === 0) return [];

  const rankOf = new Map<string, number | null>();
  for (const f of favs ?? []) {
    rankOf.set(f.media_id as string, (f.rank as number | null) ?? null);
  }

  const { data: rows } = await supabase
    .from("media")
    .select(
      "id, tipo, storage_path, thumb_path, filename_original, descripcion, fecha_mostrada"
    )
    .in("id", ids);

  const media = (rows ?? []) as MediaRow[];

  // Orden: rank asc (nulls al final), luego por fecha desc.
  media.sort((a, b) => {
    const ra = rankOf.get(a.id);
    const rb = rankOf.get(b.id);
    if (ra != null && rb != null && ra !== rb) return ra - rb;
    if (ra != null && rb == null) return -1;
    if (ra == null && rb != null) return 1;
    return (b.fecha_mostrada ?? "").localeCompare(a.fecha_mostrada ?? "");
  });

  const thumbKeys = media
    .map((r) => r.thumb_path)
    .filter((k): k is string => !!k);
  const signed = await storage.getUrls(thumbKeys);

  return media.map((r) => ({
    ...r,
    thumbUrl: r.thumb_path ? signed[r.thumb_path] ?? null : null,
  }));
}
