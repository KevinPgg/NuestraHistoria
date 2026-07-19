// Sección "Pareja": nosotros dos. Contador de días juntos + acceso al perfil
// (feed propio) de cada uno.
import Link from "next/link";
import { START_DATE } from "@/lib/milestones";
import { getAllProfiles } from "@/lib/profiles";
import { TabBar } from "@/components/TabBar";

export const dynamic = "force-dynamic";

const GOLDEN =
  "linear-gradient(180deg,#ffe7c6 0%,#ffd8c6 10%,#fccdd2 32%,#f8c2d5 60%,#f3acce 100%)";

const RING: Record<string, string> = {
  novio: "ring-sky-400",
  novia: "ring-rose-400",
};

export default async function ParejaPage() {
  const perfiles = await getAllProfiles();
  const dias = Math.floor((Date.now() - START_DATE.getTime()) / 86_400_000);

  return (
    <div className="relative min-h-screen pb-24 text-stone-800">
      <div className="fixed inset-0 -z-10" style={{ background: GOLDEN }} />

      <header className="sticky top-0 z-10 border-b border-white/40 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <h1 className="text-lg font-semibold text-stone-800">Pareja</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <section className="mb-6 rounded-3xl border border-white/50 bg-white/50 p-6 text-center shadow-[0_10px_30px_-12px_rgba(244,114,182,0.4)] backdrop-blur">
          <p className="text-sm uppercase tracking-wide text-stone-500">
            Llevamos juntos
          </p>
          <p className="my-1 text-5xl font-bold text-rose-500">{dias}</p>
          <p className="text-sm text-stone-600">días 💖</p>
          <p className="mt-2 text-xs text-stone-500">desde el 30 de mayo de 2025</p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          {perfiles.map((p) => {
            const ring = p.rol ? RING[p.rol] : "ring-white/60";
            return (
              <Link
                key={p.id}
                href={`/perfil/${p.id}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/70"
              >
                <span
                  className={`h-20 w-20 overflow-hidden rounded-full bg-white/60 ring-2 ${ring}`}
                >
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatarUrl}
                      alt={p.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-stone-400">
                      {(p.nombre[0] ?? "?").toUpperCase()}
                    </span>
                  )}
                </span>
                <p className="font-medium text-stone-800">{p.nombre}</p>
                {p.rol && (
                  <p className="text-xs capitalize text-stone-500">{p.rol}</p>
                )}
                <span className="text-[11px] text-rose-500">Ver perfil →</span>
              </Link>
            );
          })}
        </div>
      </main>

      <TabBar />
    </div>
  );
}
