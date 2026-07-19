// Vista de un post — tema "Golden Hour". Carrusel de fotos + social a nivel post.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostDetail } from "@/lib/posts";
import { getPostSocial } from "@/lib/postSocial";
import { getPostReactions } from "@/lib/reactions";
import { getPostTrack } from "@/lib/postMusic";
import { PostCarousel } from "@/components/PostCarousel";
import { PostMusicBar } from "@/components/PostMusicBar";
import { PostReactions } from "@/components/PostReactions";
import { PostCommentForm } from "@/components/PostCommentForm";
import { PostDeleteButton } from "@/components/PostDeleteButton";
import { deletePostComment } from "./actions";

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

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPostDetail(params.id);
  if (!post) notFound();

  const [social, reactions, track] = await Promise.all([
    getPostSocial(post.id),
    getPostReactions(post.id),
    getPostTrack(post.id),
  ]);
  const isAuthor = !!social.me && social.me === post.authorId;

  const fecha = formatFecha(post.fecha_mostrada);

  return (
    <div className="relative min-h-screen text-stone-800">
      <div className="fixed inset-0 -z-10" style={{ background: GOLDEN }} />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1100px 380px at 80% -12%, rgba(255,205,130,0.55), transparent 60%)",
        }}
      />

      <header className="sticky top-0 z-10 border-b border-white/40 bg-white/30 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href={post.authorId ? `/perfil/${post.authorId}` : "/feed"}
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
        <PostCarousel slides={post.slides} />

        {/* Música del post (solo reproducción; se elige al crear) */}
        <PostMusicBar track={track} />

        {/* Reacciones (sin límite) */}
        <div className="mt-4">
          <PostReactions
            postId={post.id}
            initialCounts={reactions.counts}
            initialMyCount={reactions.myCount}
          />
        </div>

        {/* Descripción + fecha */}
        <div className="mt-4 space-y-2">
          {post.descripcion && (
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-stone-700">
              {post.descripcion}
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
                    <form action={deletePostComment.bind(null, c.id, post.id)}>
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

          <PostCommentForm postId={post.id} />
        </section>

        {isAuthor && (
          <footer className="mt-8 flex justify-end">
            <PostDeleteButton postId={post.id} />
          </footer>
        )}
      </main>
    </div>
  );
}
