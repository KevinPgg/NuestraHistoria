// Reacciones de post (ilimitadas). Tipos y lectura de conteos.
import { createClient } from "@/lib/supabase/server";

export const REACTION_TIPOS = [
  "encanta",
  "divierte",
  "estremece",
  "enoja",
  "asombra",
  "excelenchi",
] as const;

export type ReactionTipo = (typeof REACTION_TIPOS)[number];

export interface PostReactions {
  counts: Record<string, number>; // tipo → total
  total: number;
  myCount: number; // cuántas puse yo (para permitir deshacer)
}

export async function getPostReactions(postId: string): Promise<PostReactions> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const me = user?.id ?? null;

  const { data } = await supabase
    .from("post_reactions")
    .select("tipo, user_id")
    .eq("post_id", postId);

  const rows = (data ?? []) as { tipo: string; user_id: string }[];
  const counts: Record<string, number> = {};
  let myCount = 0;
  for (const r of rows) {
    counts[r.tipo] = (counts[r.tipo] ?? 0) + 1;
    if (me && r.user_id === me) myCount++;
  }
  return { counts, total: rows.length, myCount };
}
