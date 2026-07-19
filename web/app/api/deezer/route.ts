// Proxy de búsqueda de Deezer. Existe porque api.deezer.com no manda CORS:
// el navegador no puede llamarla directo. Sólo para usuarios con sesión.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchDeezer } from "@/lib/deezer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "no-auth" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ tracks: [] });

  try {
    const tracks = await searchDeezer(q);
    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json(
      { error: "deezer-fail", tracks: [] },
      { status: 502 }
    );
  }
}
