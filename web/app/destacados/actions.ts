"use server";
// Acciones de Destacados (historias destacadas). Un destacado = fila en
// `momentos`; sus fotos = filas en `momento_media`. Corren con la sesión del
// usuario, así que la RLS decide qué se permite (solo el dueño escribe lo suyo).
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";

const MAX_TITULO = 60;

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Confirma que el momento existe y es del usuario en sesión. */
async function ownsMomento(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  momentoId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("momentos")
    .select("id")
    .eq("id", momentoId)
    .eq("owner_id", userId)
    .maybeSingle();
  return !!data;
}

/** Siguiente `orden` disponible para los items de un momento. */
async function nextItemOrden(
  supabase: ReturnType<typeof createClient>,
  momentoId: string
): Promise<number> {
  const { data } = await supabase
    .from("momento_media")
    .select("orden")
    .eq("momento_id", momentoId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  const max = (data?.orden as number | undefined) ?? -1;
  return max + 1;
}

/** Crea un destacado nuevo (opcionalmente con fotos ya existentes). */
export async function createHighlight(
  titulo: string,
  mediaIds: string[] = []
): Promise<{ error?: string; id?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sin sesión." };

  const t = titulo.trim().slice(0, MAX_TITULO);
  if (!t) return { error: "Ponle un título al destacado." };

  // orden del nuevo momento = después del último del usuario.
  const { data: last } = await supabase
    .from("momentos")
    .select("orden")
    .eq("owner_id", user.id)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  const orden = ((last?.orden as number | undefined) ?? -1) + 1;

  const { data: created, error } = await supabase
    .from("momentos")
    .insert({
      owner_id: user.id,
      titulo: t,
      visibilidad: "public", // que la pareja lo vea en el perfil
      orden,
    })
    .select("id")
    .single();

  if (error || !created) return { error: "No se pudo crear el destacado." };

  const momentoId = created.id as string;
  if (mediaIds.length > 0) {
    const res = await addExistingItems(momentoId, mediaIds);
    if (res.error) return { error: res.error, id: momentoId };
  }

  revalidatePath(`/perfil/${user.id}`);
  return { id: momentoId };
}

/** Agrega fotos ya existentes a un destacado. Ignora duplicados. */
export async function addExistingItems(
  momentoId: string,
  mediaIds: string[]
): Promise<{ error?: string; added?: number }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sin sesión." };
  if (!(await ownsMomento(supabase, user.id, momentoId)))
    return { error: "Ese destacado no es tuyo." };
  if (mediaIds.length === 0) return { added: 0 };

  // Cuáles ya están, para no duplicar ni recalcular orden mal.
  const { data: existing } = await supabase
    .from("momento_media")
    .select("media_id")
    .eq("momento_id", momentoId)
    .in("media_id", mediaIds);
  const already = new Set((existing ?? []).map((r) => r.media_id as string));
  const toAdd = mediaIds.filter((id) => !already.has(id));
  if (toAdd.length === 0) return { added: 0 };

  let orden = await nextItemOrden(supabase, momentoId);
  const rows = toAdd.map((media_id) => ({
    momento_id: momentoId,
    media_id,
    orden: orden++,
  }));

  const { error } = await supabase.from("momento_media").insert(rows);
  if (error) return { error: "No se pudieron agregar las fotos." };

  await ensureCover(supabase, momentoId, toAdd[0]);
  revalidatePath(`/perfil/${user.id}`);
  return { added: toAdd.length };
}

/**
 * Sube una foto nueva (WebP ya optimizada en el cliente), la inserta en `media`
 * (por lo que también aparece en el feed) y la agrega al destacado.
 */
export async function uploadItem(
  momentoId: string,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sin sesión." };
  if (!(await ownsMomento(supabase, user.id, momentoId)))
    return { error: "Ese destacado no es tuyo." };

  const full = formData.get("full");
  const thumb = formData.get("thumb");
  if (!(full instanceof File) || !(thumb instanceof File))
    return { error: "Faltan los archivos de imagen." };

  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  const slug = String(formData.get("slug") ?? "foto");
  const fecha = String(formData.get("fecha") ?? "").trim();
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

  const { data: media, error: mediaErr } = await supabase
    .from("media")
    .insert({
      owner_id: user.id,
      tipo: "photo",
      storage_path,
      thumb_path,
      filename_original: slug,
      descripcion,
      fecha_creacion: fechaIso,
      fecha_modificacion: fechaIso,
      fecha_mostrada: fechaIso,
    })
    .select("id")
    .single();

  if (mediaErr || !media) {
    await storage.remove([storage_path, thumb_path]).catch(() => {});
    return { error: "No se pudo guardar la foto." };
  }

  const mediaId = media.id as string;
  const orden = await nextItemOrden(supabase, momentoId);
  const { error: linkErr } = await supabase
    .from("momento_media")
    .insert({ momento_id: momentoId, media_id: mediaId, orden });
  if (linkErr) return { error: "Se subió la foto pero no se agregó al destacado." };

  await ensureCover(supabase, momentoId, mediaId);
  revalidatePath(`/perfil/${user.id}`);
  revalidatePath("/feed");
  return { ok: true };
}

/** Quita una foto del destacado (no borra la foto del feed). */
export async function removeItem(
  momentoId: string,
  mediaId: string
): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sin sesión." };
  if (!(await ownsMomento(supabase, user.id, momentoId)))
    return { error: "Ese destacado no es tuyo." };

  const { error } = await supabase
    .from("momento_media")
    .delete()
    .eq("momento_id", momentoId)
    .eq("media_id", mediaId);
  if (error) return { error: "No se pudo quitar la foto." };

  // Si era la portada, la reasigno al primer item que quede (o null).
  const { data: momento } = await supabase
    .from("momentos")
    .select("cover_media_id")
    .eq("id", momentoId)
    .maybeSingle();
  if ((momento?.cover_media_id as string | undefined) === mediaId) {
    const { data: first } = await supabase
      .from("momento_media")
      .select("media_id")
      .eq("momento_id", momentoId)
      .order("orden", { ascending: true })
      .limit(1)
      .maybeSingle();
    await supabase
      .from("momentos")
      .update({ cover_media_id: (first?.media_id as string) ?? null })
      .eq("id", momentoId);
  }

  revalidatePath(`/perfil/${user.id}`);
  return {};
}

/** Marca una foto del destacado como portada. */
export async function setCover(
  momentoId: string,
  mediaId: string
): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sin sesión." };
  if (!(await ownsMomento(supabase, user.id, momentoId)))
    return { error: "Ese destacado no es tuyo." };

  const { error } = await supabase
    .from("momentos")
    .update({ cover_media_id: mediaId })
    .eq("id", momentoId);
  if (error) return { error: "No se pudo fijar la portada." };
  revalidatePath(`/perfil/${user.id}`);
  return {};
}

/** Renombra el destacado. */
export async function renameHighlight(
  momentoId: string,
  titulo: string
): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sin sesión." };
  if (!(await ownsMomento(supabase, user.id, momentoId)))
    return { error: "Ese destacado no es tuyo." };

  const t = titulo.trim().slice(0, MAX_TITULO);
  if (!t) return { error: "El título no puede quedar vacío." };

  const { error } = await supabase
    .from("momentos")
    .update({ titulo: t })
    .eq("id", momentoId);
  if (error) return { error: "No se pudo renombrar." };
  revalidatePath(`/perfil/${user.id}`);
  return {};
}

/** Borra el destacado completo (las fotos siguen en el feed). */
export async function deleteHighlight(
  momentoId: string
): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sin sesión." };
  if (!(await ownsMomento(supabase, user.id, momentoId)))
    return { error: "Ese destacado no es tuyo." };

  // momento_media se va por ON DELETE CASCADE. media NO se toca.
  const { error } = await supabase
    .from("momentos")
    .delete()
    .eq("id", momentoId);
  if (error) return { error: "No se pudo borrar el destacado." };
  revalidatePath(`/perfil/${user.id}`);
  return {};
}

/** Si el momento no tiene portada, la fija a la media dada. */
async function ensureCover(
  supabase: ReturnType<typeof createClient>,
  momentoId: string,
  mediaId: string
): Promise<void> {
  const { data } = await supabase
    .from("momentos")
    .select("cover_media_id")
    .eq("id", momentoId)
    .maybeSingle();
  if (!data?.cover_media_id) {
    await supabase
      .from("momentos")
      .update({ cover_media_id: mediaId })
      .eq("id", momentoId);
  }
}
