// Punto único de selección de proveedor. El resto de la app importa `storage`.
import { StorageProvider } from "./types";
import { SupabaseStorageProvider } from "./supabase";
import { R2StorageProvider } from "./r2";

function build(): StorageProvider {
  switch (process.env.STORAGE_PROVIDER) {
    case "r2":
      return new R2StorageProvider();
    case "supabase":
    default:
      return new SupabaseStorageProvider();
  }
}

export const storage: StorageProvider = build();
export type { StorageProvider } from "./types";
