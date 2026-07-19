// Feed inicial: lee la BD y muestra las fotos con miniaturas firmadas.
// Server Component: la resolución de URLs firmadas ocurre en el servidor.
import Link from "next/link";
import { getFeed } from "@/lib/media";
import { Header } from "@/components/Header";
import { TabBar } from "@/components/TabBar";

export const dynamic = "force-dynamic"; // URLs firmadas no se cachean

export default async function FeedPage() {
  // A esta escala (122) cargamos todo de una con lazy load nativo en las <img>.
  // Cuando el acervo crezca a varios cientos, migrar a paginación por cursor.
  const items = await getFeed(500, 0);
  const conImagen = items.filter((m) => m.thumbUrl).length;

  return (
    <>
      {/* Lavado cálido sutil: el mismo sol de Pareja y Cartas, filtrándose sobre
          el fondo oscuro sin robarle protagonismo a las fotos. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 380px at 50% -8%, rgba(255,183,120,0.16), transparent 62%), radial-gradient(760px 520px at 108% 112%, rgba(244,114,182,0.12), transparent 60%)",
        }}
      />
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
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
              <Link
                key={m.id}
                href={`/foto/${m.id}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/40"
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
              </Link>
            ))}
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
