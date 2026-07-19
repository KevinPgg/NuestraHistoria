// Acceso a datos de media + resolución de URLs firmadas.
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";

export interface MediaRow {
  id: string;
  tipo: "photo" | "video";
  storage_path: string;
  thumb_path: string | null;
  filename_original: string | null;
  descripcion: string | null;
  fecha_mostrada: string | null;
}

export interface MediaWithUrls extends MediaRow {
  thumbUrl: string | null;
}

export interface MediaDetail extends MediaRow {
  /** URL firmada de la imagen a tamaño completo. */
  fullUrl: string | null;
  /** URL firmada de la miniatura (placeholder mientras carga la grande). */
  thumbUrl: string | null;
}

/** Trae una página del feed, ordenada por fecha, con thumbs firmados en lote. */
export async function getFeed(
  limit = 30,
  offset = 0
): Promise<MediaWithUrls[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("media")
    .select(
      "id, tipo, storage_path, thumb_path, filename_original, descripcion, fecha_mostrada"
    )
    .order("fecha_mostrada", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  const rows = (data ?? []) as MediaRow[];

  const thumbKeys = rows
    .map((r) => r.thumb_path)
    .filter((k): k is string => !!k);
  const signed = await storage.getUrls(thumbKeys);

  return rows.map((r) => ({
    ...r,
    thumbUrl: r.thumb_path ? signed[r.thumb_path] ?? null : null,
  }));
}

/** Fotos de un usuario (su feed propio), con thumbs firmados. */
export async function getUserMedia(
  ownerId: string,
  limit = 60
): Promise<MediaWithUrls[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("media")
    .select(
      "id, tipo, storage_path, thumb_path, filename_original, descripcion, fecha_mostrada"
    )
    .eq("owner_id", ownerId)
    .order("fecha_mostrada", { ascending: false })
    .range(0, limit - 1);

  if (error) throw error;
  const rows = (data ?? []) as MediaRow[];
  const thumbKeys = rows
    .map((r) => r.thumb_path)
    .filter((k): k is string => !!k);
  const signed = await storage.getUrls(thumbKeys);
  return rows.map((r) => ({
    ...r,
    thumbUrl: r.thumb_path ? signed[r.thumb_path] ?? null : null,
  }));
}

/** URL firmada de la imagen a tamaño completo (al abrir una foto). */
export async function getFullUrl(storagePath: string): Promise<string> {
  return storage.getUrl(storagePath);
}

/**
 * Thumbs firmados de fotos para el minijuego Memory. Trae un lote y lo baraja,
 * para que cada partida use fotos distintas. Devuelve solo las URLs (barajadas).
 */
export async function getGamePhotos(pool = 40): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("media")
    .select("thumb_path")
    .eq("tipo", "photo")
    .not("thumb_path", "is", null)
    .limit(pool);

  if (error) throw error;
  const keys = (data ?? [])
    .map((r) => (r as { thumb_path: string | null }).thumb_path)
    .filter((k): k is string => !!k);

  const signed = await storage.getUrls(keys);
  const urls = keys
    .map((k) => signed[k])
    .filter((u): u is string => !!u);

  // Barajar (Fisher-Yates) para variar las fotos entre partidas.
  for (let i = urls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [urls[i], urls[j]] = [urls[j], urls[i]];
  }
  return urls;
}

/**
 * Trae una sola foto por id, con la imagen a tamaño completo y la miniatura
 * firmadas. Devuelve null si no existe o RLS no la deja ver (→ el caller hace
 * notFound()). No lanza por "no encontrado": solo por errores reales de red/BD.
 */
export async function getMediaById(id: string): Promise<MediaDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("media")
    .select(
      "id, tipo, storage_path, thumb_path, filename_original, descripcion, fecha_mostrada"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as MediaRow;

  // Firmamos full y thumb en una sola llamada al proveedor.
  const keys = [row.storage_path, row.thumb_path].filter(
    (k): k is string => !!k
  );
  const signed = await storage.getUrls(keys);

  return {
    ...row,
    fullUrl: row.storage_path ? signed[row.storage_path] ?? null : null,
    thumbUrl: row.thumb_path ? signed[row.thumb_path] ?? null : null,
  };
}
