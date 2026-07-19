// Posts = unidad del feed. Un post es un álbum ordenado de 1..N fotos del pool
// (post_media → media). Reemplaza al feed de fotos sueltas. Ver
// supabase/posts-multifoto.sql.
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";
import type { MediaRow } from "@/lib/media";

export interface FeedPost {
  id: string;
  coverThumbUrl: string | null;
  mediaCount: number; // >1 → mostrar ícono de álbum
  descripcion: string | null;
}

export interface PostSlide {
  mediaId: string;
  tipo: "photo" | "video";
  fullUrl: string | null;
  thumbUrl: string | null;
  descripcion: string | null;
}

export interface PostDetail {
  id: string;
  authorId: string | null;
  descripcion: string | null;
  fecha_mostrada: string | null;
  slides: PostSlide[];
}

/** Feed: posts ordenados por fecha, con portada firmada y número de fotos. */
export async function getFeedPosts(limit = 500): Promise<FeedPost[]> {
  const supabase = createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, descripcion, fecha_mostrada")
    .order("fecha_mostrada", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const rows = (posts ?? []) as {
    id: string;
    descripcion: string | null;
    fecha_mostrada: string | null;
  }[];
  if (rows.length === 0) return [];

  const ids = rows.map((p) => p.id);

  const { data: pm } = await supabase
    .from("post_media")
    .select("post_id, media_id, orden")
    .in("post_id", ids)
    .order("orden", { ascending: true });

  const links = (pm ?? []) as {
    post_id: string;
    media_id: string;
    orden: number;
  }[];

  const countBy = new Map<string, number>();
  const coverMediaBy = new Map<string, string>();
  for (const l of links) {
    countBy.set(l.post_id, (countBy.get(l.post_id) ?? 0) + 1);
    if (!coverMediaBy.has(l.post_id)) coverMediaBy.set(l.post_id, l.media_id);
  }

  const coverIds = Array.from(new Set(coverMediaBy.values()));
  const thumbByMedia = new Map<string, string | null>();
  if (coverIds.length > 0) {
    const { data: mediaRows } = await supabase
      .from("media")
      .select("id, thumb_path")
      .in("id", coverIds);
    const keys = (mediaRows ?? [])
      .map((r) => (r as { thumb_path: string | null }).thumb_path)
      .filter((k): k is string => !!k);
    const signed = await storage.getUrls(keys);
    for (const r of mediaRows ?? []) {
      const row = r as { id: string; thumb_path: string | null };
      thumbByMedia.set(
        row.id,
        row.thumb_path ? signed[row.thumb_path] ?? null : null
      );
    }
  }

  return rows.map((p) => {
    const coverId = coverMediaBy.get(p.id);
    return {
      id: p.id,
      descripcion: p.descripcion,
      mediaCount: countBy.get(p.id) ?? 0,
      coverThumbUrl: coverId ? thumbByMedia.get(coverId) ?? null : null,
    };
  });
}

/** Posts de un usuario (su "Mi feed" del perfil), portada + nº de fotos. */
export async function getUserPosts(authorId: string): Promise<FeedPost[]> {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, descripcion, fecha_mostrada")
    .eq("author_id", authorId)
    .order("fecha_mostrada", { ascending: false });

  const rows = (posts ?? []) as {
    id: string;
    descripcion: string | null;
    fecha_mostrada: string | null;
  }[];
  if (rows.length === 0) return [];

  const ids = rows.map((p) => p.id);
  const { data: pm } = await supabase
    .from("post_media")
    .select("post_id, media_id, orden")
    .in("post_id", ids)
    .order("orden", { ascending: true });
  const links = (pm ?? []) as {
    post_id: string;
    media_id: string;
    orden: number;
  }[];

  const countBy = new Map<string, number>();
  const coverMediaBy = new Map<string, string>();
  for (const l of links) {
    countBy.set(l.post_id, (countBy.get(l.post_id) ?? 0) + 1);
    if (!coverMediaBy.has(l.post_id)) coverMediaBy.set(l.post_id, l.media_id);
  }

  const coverIds = Array.from(new Set(coverMediaBy.values()));
  const thumbByMedia = new Map<string, string | null>();
  if (coverIds.length > 0) {
    const { data: mediaRows } = await supabase
      .from("media")
      .select("id, thumb_path")
      .in("id", coverIds);
    const keys = (mediaRows ?? [])
      .map((r) => (r as { thumb_path: string | null }).thumb_path)
      .filter((k): k is string => !!k);
    const signed = await storage.getUrls(keys);
    for (const r of mediaRows ?? []) {
      const row = r as { id: string; thumb_path: string | null };
      thumbByMedia.set(
        row.id,
        row.thumb_path ? signed[row.thumb_path] ?? null : null
      );
    }
  }

  return rows.map((p) => {
    const coverId = coverMediaBy.get(p.id);
    return {
      id: p.id,
      descripcion: p.descripcion,
      mediaCount: countBy.get(p.id) ?? 0,
      coverThumbUrl: coverId ? thumbByMedia.get(coverId) ?? null : null,
    };
  });
}

/** Detalle de un post: sus fotos ordenadas, con full + thumb firmados. */
export async function getPostDetail(postId: string): Promise<PostDetail | null> {
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, author_id, descripcion, fecha_mostrada")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return null;
  const p = post as {
    id: string;
    author_id: string | null;
    descripcion: string | null;
    fecha_mostrada: string | null;
  };

  const { data: pm } = await supabase
    .from("post_media")
    .select("media_id, orden")
    .eq("post_id", postId)
    .order("orden", { ascending: true });
  const links = (pm ?? []) as { media_id: string; orden: number }[];
  const ids = links.map((l) => l.media_id);

  const slides: PostSlide[] = [];
  if (ids.length > 0) {
    const { data: mediaRows } = await supabase
      .from("media")
      .select("id, tipo, storage_path, thumb_path, descripcion")
      .in("id", ids);
    const byId = new Map(
      ((mediaRows ?? []) as (MediaRow & { tipo: "photo" | "video" })[]).map(
        (m) => [m.id, m]
      )
    );

    const keys: string[] = [];
    for (const m of mediaRows ?? []) {
      const row = m as MediaRow;
      if (row.storage_path) keys.push(row.storage_path);
      if (row.thumb_path) keys.push(row.thumb_path);
    }
    const signed = await storage.getUrls(keys);

    for (const l of links) {
      const m = byId.get(l.media_id);
      if (!m) continue;
      slides.push({
        mediaId: m.id,
        tipo: (m.tipo as "photo" | "video") ?? "photo",
        fullUrl: m.storage_path ? signed[m.storage_path] ?? null : null,
        thumbUrl: m.thumb_path ? signed[m.thumb_path] ?? null : null,
        descripcion: m.descripcion,
      });
    }
  }

  return {
    id: p.id,
    authorId: p.author_id,
    descripcion: p.descripcion,
    fecha_mostrada: p.fecha_mostrada,
    slides,
  };
}
