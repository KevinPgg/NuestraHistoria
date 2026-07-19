"use client";
// Visor de un destacado: muestra sus fotos. Si es del usuario en sesión, permite
// gestionarlo (agregar fotos, fijar portada, quitar fotos, renombrar, borrar).
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HighlightSummary } from "@/lib/highlights";
import {
  removeItem,
  setCover,
  renameHighlight,
  deleteHighlight,
} from "@/app/destacados/actions";

export function HighlightViewer({
  highlight,
  isSelf,
  onClose,
  onAddPhotos,
}: {
  highlight: HighlightSummary;
  isSelf: boolean;
  onClose: () => void;
  onAddPhotos: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [titulo, setTitulo] = useState(highlight.titulo ?? "");
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const coverId = highlight.coverMediaId ?? highlight.items[0]?.mediaId ?? null;

  function act(fn: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-stone-900/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-md flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <header className="flex items-center gap-2 px-4 py-3 text-white">
          {editing ? (
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={60}
              className="flex-1 rounded-lg bg-white/15 px-2 py-1 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="Título"
            />
          ) : (
            <h2 className="flex-1 truncate text-base font-semibold">
              {highlight.titulo ?? "Destacado"}
              <span className="ml-2 text-xs font-normal text-white/60">
                {highlight.count}
              </span>
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/15 px-3 py-1 text-sm"
          >
            Cerrar
          </button>
        </header>

        {isSelf && (
          <div className="flex flex-wrap gap-2 px-4 pb-2 text-sm">
            <button
              type="button"
              onClick={onAddPhotos}
              className="rounded-full bg-white/15 px-3 py-1 text-white"
            >
              + Agregar fotos
            </button>
            {editing ? (
              <>
                <button
                  type="button"
                  disabled={pending || !titulo.trim()}
                  onClick={() => act(() => renameHighlight(highlight.id, titulo))}
                  className="rounded-full bg-rose-400 px-3 py-1 text-white disabled:opacity-50"
                >
                  Guardar título
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full bg-white/15 px-3 py-1 text-white"
                >
                  Listo
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full bg-white/15 px-3 py-1 text-white"
              >
                Editar
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="px-4 pb-1 text-sm text-rose-300">{error}</p>
        )}

        {/* Fotos */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {highlight.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/60">
              Este destacado no tiene fotos todavía.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {highlight.items.map((it) => (
                <div
                  key={it.mediaId}
                  className="relative aspect-square overflow-hidden rounded-lg bg-white/10"
                >
                  <Link href={`/foto/${it.mediaId}`}>
                    {it.thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.thumbUrl}
                        alt={it.descripcion ?? ""}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-white/40">
                        sin imagen
                      </div>
                    )}
                  </Link>

                  {coverId === it.mediaId && (
                    <span className="absolute left-1 top-1 rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                      portada
                    </span>
                  )}

                  {isSelf && editing && (
                    <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-black/50 p-1 text-[10px]">
                      <button
                        type="button"
                        disabled={pending || coverId === it.mediaId}
                        onClick={() => act(() => setCover(highlight.id, it.mediaId))}
                        className="rounded bg-white/20 px-1.5 py-0.5 text-white disabled:opacity-40"
                      >
                        Portada
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => act(() => removeItem(highlight.id, it.mediaId))}
                        className="rounded bg-rose-500/80 px-1.5 py-0.5 text-white disabled:opacity-40"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Borrar destacado */}
          {isSelf && editing && (
            <div className="mt-4">
              {confirmDel ? (
                <div className="flex items-center gap-2 text-sm text-white">
                  <span className="text-white/80">¿Borrar este destacado?</span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await deleteHighlight(highlight.id);
                        if (res?.error) setError(res.error);
                        else {
                          onClose();
                          router.refresh();
                        }
                      })
                    }
                    className="rounded-full bg-rose-500 px-3 py-1 disabled:opacity-50"
                  >
                    Sí, borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDel(false)}
                    className="rounded-full bg-white/15 px-3 py-1"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDel(true)}
                  className="text-sm text-rose-300 underline"
                >
                  Borrar destacado
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
