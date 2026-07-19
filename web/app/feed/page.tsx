// Inicio = el POOL compartido: todas las fotos sueltas de los dos. Aquí se sube
// al pool; los posts (carruseles) se arman desde el perfil eligiendo de aquí.
import Link from "next/link";
import { getFeed } from "@/lib/media";
import { Header } from "@/components/Header";
import { UploadButton } from "@/components/UploadButton";
import { TabBar } from "@/components/TabBar";

export const dynamic = "force-dynamic"; // URLs firmadas no se cachean

export default async function FeedPage() {
  const items = await getFeed(500, 0);

  return (
    <>
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
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-white/90">
              Pool compartido
            </h1>
            <p className="text-xs text-white/40">
              Todas nuestras fotos. Sube aquí; arma tus posts desde tu perfil.
            </p>
          </div>
          <UploadButton label="Subir foto" />
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-white/50">
            No hay fotos todavía. Sube la primera.
          </p>
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
