// Los destacados ahora viven en el perfil (burbujas tipo "historias destacadas").
// Esta ruta se conserva por la barra inferior: redirige a tu propio perfil.
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/profiles";

export const dynamic = "force-dynamic";

export default async function DestacadosPage() {
  const meId = await getCurrentUserId();
  if (!meId) redirect("/login");
  redirect(`/perfil/${meId}`);
}
