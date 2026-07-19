// Destacados = "historias destacadas" por usuario. Cada destacado es una fila en
// `momentos` (burbuja con título + portada) y agrupa fotos en `momento_media`.
// Reutiliza el esquema existente; sin tablas nuevas. Ver supabase/destacados-momentos.sql.
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";

export interface HighlightItem {
  mediaId: string;
  orden: number;
  thumbUrl: string | null;
  descripcion: string | null;
}

export interface HighlightSummary {
  id: string;
  ownerId: string;
  titulo: string | null;
  coverMediaId: string | null; // portada explícita (o null → primer item)
  coverUrl: string | null; // thumb firmado de la portada (o del primer item)
  count: number; // cuántas fotos tiene
  items: HighlightItem[]; // fotos del destacado, ordenadas
}

export interface HighlightDetail {
  id: string;
  ownerId: string;
  titulo: string | null;
  coverMediaId: string | null;
  items: HighlightItem[];
}

interface MomentoRow {
  id: string;
  owner_id: string;
  titulo: string | null;
  cover_media_id: string | null;
  orden: number;
  created_at: string;
}

/**
 * Destacados de un usuario (los que la RLS deja ver: propios siempre, del otro
 * si son 'public'). Cada uno con su portada firmada y el número de fotos.
 * Orden: campo `orden` asc, luego más recientes.
 */
export async function getUserHighlights(
  ownerId: string
): Promise<HighlightSummary[]> {
  const supabase = createClient();

  const { data: momentos, error } = await supabase
    .from("momentos")
    .select("id, owner_id, titulo, cover_media_id, orden, created_at")
    .eq("owner_id", ownerId)
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (momentos ?? []) as MomentoRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((m) => m.id);

  // Traigo todos los items de todos los momentos en una sola consulta.
  const { data: itemsData } = await supabase
    .from("momento_media")
    .select("momento_id, media_id, orden")
    .in("momento_id", ids)
    .order("orden", { ascending: true });

  const items = (itemsData ?? []) as {
    momento_id: string;
    media_id: string;
    orden: number;
  }[];

  // Primer media por momento (fallback de portada).
  const firstMediaBy = new Map<string, string>();
  for (const it of items) {
    if (!firstMediaBy.has(it.momento_id))
      firstMediaBy.set(it.momento_id, it.media_id);
  }

  // Firmo thumbs de TODA la media referenciada (items + portadas) en un lote.
  const allMediaIds = new Set<string>(items.map((i) => i.media_id));
  for (const m of rows) if (m.cover_media_id) allMediaIds.add(m.cover_media_id);

  const thumbByMedia = new Map<string, string | null>();
  const descByMedia = new Map<string, string | null>();
  if (allMediaIds.size > 0) {
    const { data: mediaRows } = await supabase
      .from("media")
      .select("id, thumb_path, descripcion")
      .in("id", Array.from(allMediaIds));

    const thumbKeys = (mediaRows ?? [])
      .map((r) => (r as { thumb_path: string | null }).thumb_path)
      .filter((k): k is string => !!k);
    const signed = await storage.getUrls(thumbKeys);

    for (const r of mediaRows ?? []) {
      const row = r as {
        id: string;
        thumb_path: string | null;
        descripcion: string | null;
      };
      thumbByMedia.set(
        row.id,
        row.thumb_path ? signed[row.thumb_path] ?? null : null
      );
      descByMedia.set(row.id, row.descripcion);
    }
  }

  // Items por momento (ya vienen ordenados por `orden` de la consulta).
  const itemsBy = new Map<string, HighlightItem[]>();
  for (const it of items) {
    const list = itemsBy.get(it.momento_id) ?? [];
    list.push({
      mediaId: it.media_id,
      orden: it.orden,
      thumbUrl: thumbByMedia.get(it.media_id) ?? null,
      descripcion: descByMedia.get(it.media_id) ?? null,
    });
    itemsBy.set(it.momento_id, list);
  }

  return rows.map((m) => {
    const coverMediaId = m.cover_media_id ?? firstMediaBy.get(m.id) ?? null;
    const list = itemsBy.get(m.id) ?? [];
    return {
      id: m.id,
      ownerId: m.owner_id,
      titulo: m.titulo,
      coverMediaId: m.cover_media_id,
      coverUrl: coverMediaId ? thumbByMedia.get(coverMediaId) ?? null : null,
      count: list.length,
      items: list,
    };
  });
}

/** Detalle de un destacado con sus fotos (thumbs firmados), ordenadas. */
export async function getHighlightDetail(
  momentoId: string
): Promise<HighlightDetail | null> {
  const supabase = createClient();

  const { data: momento, error } = await supabase
    .from("momentos")
    .select("id, owner_id, titulo, cover_media_id")
    .eq("id", momentoId)
    .maybeSingle();

  if (error) throw error;
  if (!momento) return null;
  const m = momento as {
    id: string;
    owner_id: string;
    titulo: string | null;
    cover_media_id: string | null;
  };

  const { data: itemsData } = await supabase
    .from("momento_media")
    .select("media_id, orden")
    .eq("momento_id", momentoId)
    .order("orden", { ascending: true });

  const links = (itemsData ?? []) as { media_id: string; orden: number }[];
  const ids = links.map((l) => l.media_id);

  const items: HighlightItem[] = [];
  if (ids.length > 0) {
    const { data: mediaRows } = await supabase
      .from("media")
      .select("id, thumb_path, descripcion")
      .in("id", ids);

    const byId = new Map(
      (mediaRows ?? []).map((r) => {
        const row = r as {
          id: string;
          thumb_path: string | null;
          descripcion: string | null;
        };
        return [row.id, row];
      })
    );

    const thumbKeys = (mediaRows ?? [])
      .map((r) => (r as { thumb_path: string | null }).thumb_path)
      .filter((k): k is string => !!k);
    const signed = await storage.getUrls(thumbKeys);

    for (const l of links) {
      const row = byId.get(l.media_id);
      if (!row) continue;
      items.push({
        mediaId: l.media_id,
        orden: l.orden,
        thumbUrl: row.thumb_path ? signed[row.thumb_path] ?? null : null,
        descripcion: row.descripcion,
      });
    }
  }

  return {
    id: m.id,
    ownerId: m.owner_id,
    titulo: m.titulo,
    coverMediaId: m.cover_media_id,
    items,
  };
}
