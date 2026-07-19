// Tipos y mapeo de la API pública de Deezer.
// La búsqueda se hace SIEMPRE desde el servidor (Deezer no envía CORS).
// El preview es un .mp3 de 30s del CDN de Deezer, reproducible en un <audio>.

export interface DeezerTrack {
  deezerId: number;
  title: string;
  artist: string;
  cover: string; // portada del álbum
  preview: string; // .mp3 30s (puede venir vacío → se filtra)
}

// Forma cruda de cada item que devuelve /search (subconjunto que usamos).
interface RawDeezerItem {
  id: number;
  title: string;
  preview: string;
  artist?: { name?: string };
  album?: { cover_medium?: string; cover_small?: string };
}

/**
 * Re-resuelve el preview (.mp3 30s) de una pista por su id de Deezer. Las URLs
 * de preview llevan un token que caduca, así que la cacheada puede dejar de
 * sonar; esto trae una fresca en el momento de abrir la foto.
 */
export async function resolvePreview(deezerId: number): Promise<string | null> {
  try {
    const res = await fetch(`https://api.deezer.com/track/${deezerId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { preview?: string };
    return json.preview || null;
  } catch {
    return null;
  }
}

/** Busca en Deezer y devuelve sólo pistas con preview reproducible. */
export async function searchDeezer(query: string): Promise<DeezerTrack[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=12`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Deezer respondió ${res.status}`);
  const json = (await res.json()) as { data?: RawDeezerItem[] };
  return (json.data ?? [])
    .filter((it) => !!it.preview)
    .map((it) => ({
      deezerId: it.id,
      title: it.title,
      artist: it.artist?.name ?? "Desconocido",
      cover: it.album?.cover_medium ?? it.album?.cover_small ?? "",
      preview: it.preview,
    }));
}
