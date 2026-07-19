// Vista de foto individual — tema "Golden Hour" (cálido), autocontenida.
// No usa el Header global oscuro: trae su propia barra cálida para no chocar con
// el fondo. Server Component: firma y lectura respetan RLS.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMediaById } from "@/lib/media";
import { getPhotoSocial, getDeleteVotes } from "@/lib/social";
import { getFavoritesInfo } from "@/lib/favorites";
import { getPhotoTrack } from "@/lib/music";
import { LikeButton } from "@/components/LikeButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CommentForm } from "@/components/CommentForm";
import { DeletePhotoButton } from "@/components/DeletePhotoButton";
import { PhotoMusic } from "@/components/PhotoMusic";
import { PhotoViewer } from "@/components/PhotoViewer";
import { deleteComment } from "./actions";

export const dynamic = "force-dynamic";

const GOLDEN =
  "linear-gradient(180deg,#ffe7c6 0%,#ffd8c6 10%,#fccdd2 32%,#f8c2d5 60%,#f3acce 100%)";

function formatFecha(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function formatFechaHora(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const ROL_COLOR: Record<string, string> = {
  novio: "text-sky-600",
  novia: "text-rose-500",
};

export default async function FotoPage({
  params,
}: {
  params: { id: string };
}) {
  const media = await getMediaById(params.id);
  if (!media) notFound();

  const social = await getPhotoSocial(media.id);
  const deleteVotes = await getDeleteVotes(media.id);
  const favInfo = await getFavoritesInfo(media.id);
  const track = await getPhotoTrack(media.id);
  const fecha = formatFecha(media.fecha_mostrada);
  const alt = media.descripcion ?? media.filename_original ?? "Foto";
  const otherLikers = social.likers
    .filter((l) => l.user_id !== social.me)
    .map((l) => l.nombre);

  return (
    <div className="relative min-h-screen text-stone-800">
      {/* Fondo Golden Hour + brillo cálido */}
      <div className="fixed inset-0 -z-10" style={{ background: GOLDEN }} />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1100px 380px at 80% -12%, rgba(255,205,130,0.55), transparent 60%)",
        }}
      />

      {/* Barra cálida propia */}
      <header className="sticky top-0 z-10 border-b border-white/40 bg-white/30 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/feed"
            className="inline-flex items-center gap-1 text-sm font-medium text-stone-700 transition hover:text-stone-900"
          >
            <span aria-hidden>←</span> Volver
          </Link>
          <span className="text-sm font-semibold text-stone-700/90">
            Nuestra Historia
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Foto */}
        <figure className="overflow-hidden rounded-3xl bg-white/60 p-1.5 shadow-[0_18px_50px_-12px_rgba(244,114,182,0.45)] ring-1 ring-white/50">
          <div className="relative overflow-hidden rounded-2xl">
          {media.fullUrl ? (
            media.tipo === "video" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={media.fullUrl}
                controls
                className="max-h-[70vh] w-full rounded-2xl bg-black object-contain"
              />
            ) : (
              <PhotoViewer src={media.fullUrl} alt={alt} />
            )
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl text-sm text-stone-500">
              No se pudo cargar la imagen
            </div>
          )}
            <PhotoMusic mediaId={media.id} track={track} />
          </div>
        </figure>

        {/* Likes + destacar */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <LikeButton
            mediaId={media.id}
            likedByMe={social.likedByMe}
            otherLikers={otherLikers}
          />
          <FavoriteButton
            mediaId={media.id}
            initialFavorite={favInfo.isFavorite}
            limit={favInfo.limit}
          />
        </div>

        {/* Descripción + fecha */}
        <div className="mt-4 space-y-2">
          {media.descripcion && (
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-stone-700">
              {media.descripcion}
            </p>
          )}
          {fecha && (
            <p className="text-xs uppercase tracking-wide text-stone-500">
              {fecha}
            </p>
          )}
        </div>

        {/* Comentarios */}
        <section className="mt-6 rounded-2xl border border-white/50 bg-white/45 p-4 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">
            Comentarios{" "}
            {social.comments.length > 0 && (
              <span className="text-stone-400">({social.comments.length})</span>
            )}
          </h2>

          {social.comments.length === 0 ? (
            <p className="text-sm text-stone-500">
              Todavía no hay comentarios. Escribe el primero.
            </p>
          ) : (
            <ul className="space-y-3">
              {social.comments.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span
                        className={`font-semibold ${
                          c.autorRol ? ROL_COLOR[c.autorRol] : "text-stone-700"
                        }`}
                      >
                        {c.autorNombre}
                      </span>{" "}
                      <span className="whitespace-pre-line text-stone-700">
                        {c.texto}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-stone-400">
                      {formatFechaHora(c.created_at)}
                    </p>
                  </div>
                  {c.mine && (
                    <form action={deleteComment.bind(null, c.id, media.id)}>
                      <button
                        type="submit"
                        className="shrink-0 text-[11px] text-stone-400 transition hover:text-rose-500"
                        aria-label="Eliminar comentario"
                      >
                        Eliminar
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}

          <CommentForm mediaId={media.id} />
        </section>

        <footer className="mt-8 flex justify-end">
          <DeletePhotoButton mediaId={media.id} votes={deleteVotes} />
        </footer>
      </main>
    </div>
  );
}
