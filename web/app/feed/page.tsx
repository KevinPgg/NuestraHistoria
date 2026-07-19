// Feed inicial: lee la BD y muestra las fotos con miniaturas firmadas.
// Server Component: la resolución de URLs firmadas ocurre en el servidor.
import { getFeed } from "@/lib/media";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic"; // URLs firmadas no se cachean

export default async function FeedPage() {
  const items = await getFeed(30, 0);
  const conImagen = items.filter((m) => m.thumbUrl).length;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {items.length === 0 ? (
          <p className="text-sm text-white/50">
            No hay fotos todavía. Corre el seed en Supabase.
          </p>
        ) : conImagen === 0 ? (
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            Hay {items.length} fotos en la base, pero ninguna miniatura se pudo
            cargar. Falta subir los archivos al bucket <code>media</code> en la
            carpeta <code>thumbs/</code>, o aplicar <code>storage.sql</code>.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {items.map((m) => (
              <figure
                key={m.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-white/5"
              >
                {m.thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.thumbUrl}
                    alt={m.descripcion ?? m.filename_original ?? ""}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-white/30">
                    sin imagen
                  </div>
                )}
              </figure>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
