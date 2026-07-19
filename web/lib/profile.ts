// Perfil del usuario en sesión (identidad diferenciada novio/novia).
import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  email: string;
  nombre: string | null;
  rol: "novio" | "novia" | null;
  avatar_url: string | null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, nombre, rol, avatar_url")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}
