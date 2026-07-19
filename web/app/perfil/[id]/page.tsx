// Perfil individual: avatar, contadores y feed propio del usuario.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileById, getUserStats, getCurrentUserId } from "@/lib/profiles";
import { getUserMedia } from "@/lib/media";
import { AvatarEditor } from "@/components/AvatarEditor";
import { UploadButton } from "@/components/UploadButton";
import { TabBar } from "@/components/TabBar";

export const dynamic = "force-dynamic";

const GOLDEN =
  "linear-gradient(180deg,#ffe7c6 0%,#ffd8c6 10%,#fccdd2 32%,#f8c2d5 60%,#f3acce 100%)";

const RING: Record<string, string> = {
  novio: "ring-sky-400",
  novia: "ring-rose-400",
};

export default async function PerfilPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await getProfileById(params.id);
  if (!profile) notFound();

  const [stats, media, meId] = await Promise.all([
    getUserStats(profile.id),
    getUserMedia(profile.id),
    getCurrentUserId(),
  ]);
  const isSelf = meId === profile.id;
  const ring = profile.rol ? RING[profile.rol] : "ring-white/60";

  const pickPhotos = media.map((m) => ({
    id: m.id,
    storagePath: m.storage_path,
    thumbUrl: m.thumbUrl,
  }));

  return (
    <div className="relative min-h-screen pb-24 text-stone-800">
      <div className="fixed inset-0 -z-10" style={{ background: GOLDEN }} />

      <header className="sticky top-0 z-10 border-b border-white/40 bg-white/30 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/pareja" className="text-sm font-medium text-stone-700">
            ← Pareja
          </Link>
          <span className="text-sm font-semibold text-stone-700/90">Perfil</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <section className="flex flex-col items-center text-center">
          <span
            className={`h-28 w-28 overflow-hidden rounded-full bg-white/60 ring-4 ${ring} ring-offset-2 ring-offset-transparent`}
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-stone-400">
                {(profile.nombre[0] ?? "?").toUpperCase()}
              </span>
            )}
          </span>

          <h1 className="mt-3 text-xl font-semibold text-stone-800">
            {profile.nombre}
          </h1>
          {profile.rol && (
            <p className="text-sm capitalize text-stone-500">{profile.rol}</p>
          )}

          {isSelf && (
            <div className="mt-3 flex items-center gap-2">
              <AvatarEditor photos={pickPhotos} />
              <UploadButton />
            </div>
          )}
        </section>

        {/* Contadores */}
        <section className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/50 bg-white/45 p-4 text-center backdrop-blur">
          <Stat n={stats.posts} label="Publicaciones" />
          <Stat n={stats.likes} label="Me encanta" />
          <Stat n={stats.comments} label="Comentarios" />
        </section>

        {/* Feed propio */}
        <section className="mt-6">
          {media.length === 0 ? (
            <p className="text-center text-sm text-stone-500">
              Todavía no hay publicaciones.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {media.map((m) => (
                <Link
                  key={m.id}
                  href={`/foto/${m.id}`}
                  className="relative aspect-square overflow-hidden rounded-lg bg-white/40"
                >
                  {m.thumbUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.thumbUrl}
                      alt={m.descripcion ?? ""}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <TabBar />
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="text-xl font-bold text-rose-500">{n}</p>
      <p className="text-[11px] text-stone-500">{label}</p>
    </div>
  );
}
