"use server";
// Subida de una foto: recibe las dos WebP ya optimizadas en el cliente (full +
// thumb), las sube por el adaptador de storage e inserta la fila en `media`.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";

export async function uploadPhoto(
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sin sesión." };

  const full = formData.get("full");
  const thumb = formData.get("thumb");
  if (!(full instanceof File) || !(thumb instanceof File)) {
    return { error: "Faltan los archivos de imagen." };
  }

  const descripcion =
    String(formData.get("descripcion") ?? "").trim() || null;
  const slug = String(formData.get("slug") ?? "foto");
  const fecha = String(formData.get("fecha") ?? "").trim(); // yyyy-mm-dd

  // Fecha real la pone el usuario (la metadata de WhatsApp miente). Mediodía UTC
  // para evitar corrimientos de día por zona horaria. Las tres fechas iguales →
  // pickOldestDate muestra exactamente esta.
  const fechaIso = fecha
    ? new Date(`${fecha}T12:00:00Z`).toISOString()
    : new Date().toISOString();

  const base = `${Date.now()}-${slug}`;
  const storage_path = `fotos/${base}.webp`;
  const thumb_path = `thumbs/${base}.webp`;

  try {
    await storage.upload(storage_path, full, "image/webp");
    await storage.upload(thumb_path, thumb, "image/webp");
  } catch {
    return { error: "No se pudo subir la imagen al almacenamiento." };
  }

  const { error } = await supabase.from("media").insert({
    owner_id: user.id,
    tipo: "photo",
    storage_path,
    thumb_path,
    filename_original: slug,
    descripcion,
    fecha_creacion: fechaIso,
    fecha_modificacion: fechaIso,
    fecha_mostrada: fechaIso,
  });

  if (error) {
    // Rollback: si la fila no se guardó, no dejamos archivos huérfanos.
    await storage.remove([storage_path, thumb_path]).catch(() => {});
    return { error: "No se pudo guardar la foto en la base." };
  }

  revalidatePath("/feed");
  return { ok: true };
}
