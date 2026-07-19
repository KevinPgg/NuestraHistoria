// Lectura de la canción colgada a una foto.
import { createClient } from "@/lib/supabase/server";
import { resolvePreview } from "@/lib/deezer";

export interface AttachedTrack {
  title: string;
  artist: string;
  cover: string;
  preview: string;
}

/**
 * Devuelve la pista asociada a una foto, o null si no tiene.
 * Re-resuelve el preview por deezer_id (las URLs de Deezer caducan), y cae a la
 * cacheada si Deezer no responde.
 */
export async function getPhotoTrack(
  mediaId: string
): Promise<AttachedTrack | null> {
  const supabase = createClient();

  const { data: link } = await supabase
    .from("media_music")
    .select("track_id")
    .eq("media_id", mediaId)
    .maybeSingle();
  if (!link?.track_id) return null;

  const { data: track } = await supabase
    .from("music_tracks")
    .select("deezer_id, title, artist, cover_url, preview_url")
    .eq("id", link.track_id)
    .maybeSingle();
  if (!track) return null;

  const cached = (track.preview_url as string) ?? "";
  const deezerId = track.deezer_id as number | null;
  const fresh = deezerId ? await resolvePreview(deezerId) : null;

  return {
    title: (track.title as string) ?? "",
    artist: (track.artist as string) ?? "",
    cover: (track.cover_url as string) ?? "",
    preview: fresh ?? cached,
  };
}
