// Canción colgada a un POST (post_music). Espeja lib/music (que era por foto).
import { createClient } from "@/lib/supabase/server";
import { resolvePreview } from "@/lib/deezer";
import type { AttachedTrack } from "@/lib/music";

export async function getPostTrack(postId: string): Promise<AttachedTrack | null> {
  const supabase = createClient();

  const { data: link } = await supabase
    .from("post_music")
    .select("track_id")
    .eq("post_id", postId)
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
