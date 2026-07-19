// Implementación de StorageProvider con Supabase Storage (bucket privado).
import { createClient } from "@/lib/supabase/server";
import { StorageProvider, DEFAULT_EXPIRES } from "./types";

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "media";

export class SupabaseStorageProvider implements StorageProvider {
  async getUrl(key: string, expiresIn = DEFAULT_EXPIRES): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(key, expiresIn);
    if (error || !data) throw error ?? new Error("No se pudo firmar la URL");
    return data.signedUrl;
  }

  async getUrls(
    keys: string[],
    expiresIn = DEFAULT_EXPIRES
  ): Promise<Record<string, string>> {
    if (keys.length === 0) return {};
    const supabase = createClient();
    // createSignedUrls firma muchas claves en una sola llamada.
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(keys, expiresIn);
    if (error || !data) {
      // No reventamos el feed: logueamos el motivo real y seguimos.
      console.error("[storage] createSignedUrls falló:", error?.message ?? error);
      return {};
    }
    const out: Record<string, string> = {};
    for (const item of data) {
      if (item.path && item.signedUrl) {
        out[item.path] = item.signedUrl;
      } else if (item.error) {
        console.warn(`[storage] no se pudo firmar ${item.path}: ${item.error}`);
      }
    }
    return out;
  }

  async upload(
    key: string,
    data: Blob | ArrayBuffer | Uint8Array,
    contentType = "application/octet-stream"
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.storage.from(BUCKET).upload(key, data, {
      contentType,
      upsert: false,
    });
    if (error) throw error;
  }

  async remove(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    const supabase = createClient();
    const { error } = await supabase.storage.from(BUCKET).remove(keys);
    if (error) throw error;
  }
}
