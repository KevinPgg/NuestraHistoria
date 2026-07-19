// Contrato ÚNICO del almacenamiento. Los componentes solo conocen esto.
// Cambiar de Supabase a R2 = escribir otra implementación de esta interfaz.
export interface StorageProvider {
  /** URL firmada temporal para una sola clave (ej. 'fotos/ale.webp'). */
  getUrl(key: string, expiresIn?: number): Promise<string>;

  /** Firma en lote (para el feed). Devuelve { clave: url }. */
  getUrls(keys: string[], expiresIn?: number): Promise<Record<string, string>>;

  /** Sube un objeto a una clave (ej. 'fotos/x.webp'). Lanza si falla. */
  upload(
    key: string,
    data: Blob | ArrayBuffer | Uint8Array,
    contentType?: string
  ): Promise<void>;

  /** Borra una o varias claves. No falla si alguna no existe. */
  remove(keys: string[]): Promise<void>;
}

export const DEFAULT_EXPIRES = 60 * 60; // 1 hora
