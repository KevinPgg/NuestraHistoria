// Destacados: mis fotos favoritas (top N). Selección propia de cada quien.
// Tema Golden Hour, con barra inferior de navegación.
import Link from "next/link";
import { getMyFavorites, getFavoritesLimit } from "@/lib/favorites";
import { TabBar } from "@/components/TabBar";

export const dynamic = "force-dynamic";

const GOLDEN =
  "linear-gradient(180deg,#ffe7c6 0%,#ffd8c6 10%,#fccdd2 32%,#f8c2d5 60%,#f3acce 100%)";

export default async function DestacadosPage() {
  const [favoritas, limit] = await Promise.all([
    getMyFavorites(),
    getFavoritesLimit(),
  ]);

  return (
    <div className="relative min-h-screen pb-24 text-stone-800">
      <div className="fixed inset-0 -z-10" style={{ background: GOLDEN }} />

      <header className="sticky top-0 z-10 border-b border-white/40 bg-white/30 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-stone-800">Destacados</h1>
          <span className="text-xs text-stone-500">
            {favoritas.length} / {limit}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {favoritas.length === 0 ? (
          <div className="rounded-2xl border border-white/50 bg-white/50 p-6 text-center backdrop-blur">
            <p className="text-sm text-stone-600">
              Aún no tienes destacadas. Abre una foto y toca{" "}
              <span className="font-medium text-amber-700">☆ Destacar</span> para
              guardarla aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {favoritas.map((m) => (
              <Link
                key={m.id}
                href={`/foto/${m.id}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-white/40 focus:outline-none focus:ring-2 focus:ring-rose-300"
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
                  <div className="flex h-full items-center justify-center text-[10px] text-stone-400">
                    sin imagen
                  </div>
                )}
                <span className="absolute right-1 top-1 text-sm text-amber-300 drop-shadow">
                  ★
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <TabBar />
    </div>
  );
}
