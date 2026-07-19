"use client";
// Feed del propio perfil (selección del pool). Permite agregar (del pool o
// subiendo) y quitar fotos. Para el perfil de la pareja se usa el grid de solo
// lectura del server component.
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PickPhoto } from "@/components/HighlightEditor";
import { ProfileFeedEditor } from "@/components/ProfileFeedEditor";
import { removeFromProfile } from "@/app/perfil/actions";

interface ProfilePhoto {
  id: string;
  thumbUrl: string | null;
  descripcion: string | null;
}

export function ProfileFeed({
  media,
  poolPhotos,
  alreadyInIds,
}: {
  media: ProfilePhoto[];
  poolPhotos: PickPhoto[];
  alreadyInIds: string[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove(mediaId: string) {
    startTransition(async () => {
      await removeFromProfile(mediaId);
      router.refresh();
    });
  }

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-600">Mi feed</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-3 py-1 text-xs font-medium text-white"
          >
            + Agregar fotos
          </button>
          {media.length > 0 && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-full border border-stone-300 bg-white/60 px-3 py-1 text-xs text-stone-600"
            >
              {editing ? "Listo" : "Editar"}
            </button>
          )}
        </div>
      </div>

      {media.length === 0 ? (
        <p className="rounded-2xl border border-white/50 bg-white/50 p-6 text-center text-sm text-stone-600 backdrop-blur">
          Tu perfil está vacío. Toca <span className="font-medium">+ Agregar
          fotos</span> para elegir del pool compartido o subir nuevas.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {media.map((m) => (
            <div
              key={m.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-white/40"
            >
              {editing ? (
                <>
                  {m.thumbUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.thumbUrl}
                      alt={m.descripcion ?? ""}
                      className="h-full w-full object-cover opacity-80"
                      loading="lazy"
                    />
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(m.id)}
                    aria-label="Quitar del perfil"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white shadow disabled:opacity-50"
                  >
                    ×
                  </button>
                </>
              ) : (
                <Link href={`/foto/${m.id}`}>
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
              )}
            </div>
          ))}
        </div>
      )}

      <ProfileFeedEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        poolPhotos={poolPhotos}
        alreadyInIds={alreadyInIds}
      />
    </section>
  );
}
