// Optimización de imagen en el navegador: del archivo original genera una WebP
// grande (para ver) y una miniatura (para el feed). Se ejecuta SOLO en cliente.

export interface ProcessedImage {
  full: Blob;
  thumb: Blob;
}

const FULL_MAX = 2000; // lado mayor de la versión completa
const THUMB_MAX = 400; // lado mayor de la miniatura
const FULL_Q = 0.82;
const THUMB_Q = 0.7;

/** Convierte un File de imagen en { full, thumb } WebP. */
export async function processImage(file: File): Promise<ProcessedImage> {
  const bitmap = await createImageBitmap(file);
  try {
    const full = await toWebp(bitmap, FULL_MAX, FULL_Q);
    const thumb = await toWebp(bitmap, THUMB_MAX, THUMB_Q);
    return { full, thumb };
  } finally {
    bitmap.close();
  }
}

async function toWebp(
  bitmap: ImageBitmap,
  maxSide: number,
  quality: number
): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto de canvas.");
  ctx.drawImage(bitmap, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", quality)
  );
  if (!blob) throw new Error("No se pudo convertir la imagen a WebP.");
  return blob;
}

/** slug simple para nombrar archivos: minúsculas, sin acentos, guiones. */
export function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "") // quita extensión
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "foto";
}
