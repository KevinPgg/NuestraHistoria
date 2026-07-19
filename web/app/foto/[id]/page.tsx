// Vista de foto individual: imagen, descripción, fecha, likes y comentarios.
// Server Component: firma y lectura respetan RLS. Ruta enlazable (/foto/<id>).
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMediaById } from "@/lib/media";
import { getPhotoSocial } from "@/lib/social";
import { Header } from "@/components/Header";
import { LikeButton } from "@/components/LikeButton";
import { CommentForm } from "@/components/CommentForm";
import { DeletePhotoButton } from "@/components/DeletePhotoButton";
import { deleteComment } from "./actions";

export const dynamic = "force-dynamic"; // URLs firmadas + datos frescos

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
  novio: "text-sky-300",
  novia: "text-pink-300",
};

export default async function FotoPage({
  params,
}: {
  params: { id: string };
}) {
  const media = await getMediaById(params.id);
  if (!media) notFound();

  const social = await getPhotoSocial(media.id);
  const fecha = formatFecha(media.fecha_mostrada);
  const alt = media.descripcion ?? media.filename_original ?? "Foto";
  const otherLikers = social.likers
    .filter((l) => l.user_id !== social.me)
    .map((l) => l.nombre);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href="/feed"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition hover:text-white/80"
        >
          <span aria-hidden>←</span> Volver al feed
        </Link>

        <figure className="overflow-hidden rounded-2xl bg-white/5">
          {media.fullUrl ? (
            media.tipo === "video" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={media.fullUrl}
                controls
                className="max-h-[70vh] w-full bg-black object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.fullUrl}
                alt={alt}
                className="max-h-[70vh] w-full object-contain"
              />
            )
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-white/30">
              No se pudo cargar la imagen
            </div>
          )}
        </figure>

        {/* Likes */}
        <div className="mt-4">
          <LikeButton
            mediaId={media.id}
            likedByMe={social.likedByMe}
            otherLikers={otherLikers}
          />
        </div>

        {/* Descripción + fecha */}
        <div className="mt-3 space-y-2">
          {media.descripcion && (
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-white/90">
              {media.descripcion}
            </p>
          )}
          {fecha && (
            <p className="text-xs uppercase tracking-wide text-white/40">
              {fecha}
            </p>
          )}
        </div>

        {/* Comentarios */}
        <section className="mt-6 border-t border-white/10 pt-4">
          <h2 className="mb-3 text-sm font-semibold text-white/70">
            Comentarios{" "}
            {social.comments.length > 0 && (
              <span className="text-white/40">({social.comments.length})</span>
            )}
          </h2>

          {social.comments.length === 0 ? (
            <p className="text-sm text-white/40">
              Todavía no hay comentarios. Escribe el primero.
            </p>
          ) : (
            <ul className="space-y-3">
              {social.comments.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span
                        className={`font-medium ${
                          c.autorRol ? ROL_COLOR[c.autorRol] : "text-white/80"
                        }`}
                      >
                        {c.autorNombre}
                      </span>{" "}
                      <span className="whitespace-pre-line text-white/90">
                        {c.texto}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/30">
                      {formatFechaHora(c.created_at)}
                    </p>
                  </div>
                  {c.mine && (
                    <form action={deleteComment.bind(null, c.id, media.id)}>
                      <button
                        type="submit"
                        className="shrink-0 text-[11px] text-white/30 transition hover:text-rose-400"
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

        <footer className="mt-8 flex justify-end border-t border-white/5 pt-4">
          <DeletePhotoButton mediaId={media.id} />
        </footer>
      </main>
    </>
  );
}
