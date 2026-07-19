// El feed de perfil = selección curada del pool (tabla profile_media). Cada quien
// arma su perfil eligiendo fotos del pool compartido y/o subiendo nuevas.
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";
import type { MediaRow, MediaWithUrls } from "@/lib/media";

/** Fotos del perfil de un usuario (su selección), con thumbs firmados. */
export async function getProfileMedia(
  userId: string
): Promise<MediaWithUrls[]> {
  const supabase = createClient();

  const { data: links } = await supabase
    .from("profile_media")
    .select("media_id, orden, created_at")
    .eq("user_id", userId)
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  const rows = (links ?? []) as {
    media_id: string;
    orden: number;
    created_at: string;
  }[];
  const ids = rows.map((r) => r.media_id);
  if (ids.length === 0) return [];

  const { data: mediaData } = await supabase
    .from("media")
    .select(
      "id, tipo, storage_path, thumb_path, filename_original, descripcion, fecha_mostrada"
    )
    .in("id", ids);

  const byId = new Map(
    ((mediaData ?? []) as MediaRow[]).map((m) => [m.id, m])
  );

  // Respetar el orden de profile_media (orden asc, luego recientes).
  const media = rows
    .map((r) => byId.get(r.media_id))
    .filter((m): m is MediaRow => !!m);

  const thumbKeys = media
    .map((r) => r.thumb_path)
    .filter((k): k is string => !!k);
  const signed = await storage.getUrls(thumbKeys);

  return media.map((r) => ({
    ...r,
    thumbUrl: r.thumb_path ? signed[r.thumb_path] ?? null : null,
  }));
}

/** Ids de las fotos que ya están en el perfil (para marcar en el selector). */
export async function getProfileMediaIds(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profile_media")
    .select("media_id")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.media_id as string);
}
