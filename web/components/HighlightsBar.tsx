"use client";
// Slider de "destacados" (burbujas) del perfil. Cada burbuja abre el visor del
// grupo. Si es tu propio perfil, la primera burbuja "+" crea uno nuevo.
import { useState } from "react";
import type { HighlightSummary } from "@/lib/highlights";
import { HighlightEditor, type PickPhoto } from "@/components/HighlightEditor";
import { HighlightViewer } from "@/components/HighlightViewer";

export function HighlightsBar({
  highlights,
  isSelf,
  pickPhotos,
}: {
  highlights: HighlightSummary[];
  isSelf: boolean;
  pickPhotos: PickPhoto[];
}) {
  const [viewingId, setViewingId] = useState<string | null>(null);
  // editor: null cerrado | {} crear | {momentoId} agregar
  const [editor, setEditor] = useState<null | { momentoId?: string }>(null);

  const viewing = highlights.find((h) => h.id === viewingId) ?? null;

  if (!isSelf && highlights.length === 0) return null;

  return (
    <section className="mt-5">
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isSelf && (
          <button
            type="button"
            onClick={() => setEditor({})}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-rose-300 bg-white/50 text-2xl text-rose-400">
              +
            </span>
            <span className="w-16 truncate text-center text-[11px] text-stone-500">
              Nuevo
            </span>
          </button>
        )}

        {highlights.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setViewingId(h.id)}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <span className="h-16 w-16 overflow-hidden rounded-full bg-white/60 p-[2px] ring-2 ring-rose-300">
              {h.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={h.coverUrl}
                  alt={h.titulo ?? ""}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-rose-100 text-lg text-rose-300">
                  ★
                </span>
              )}
            </span>
            <span className="w-16 truncate text-center text-[11px] text-stone-600">
              {h.titulo ?? "Destacado"}
            </span>
          </button>
        ))}
      </div>

      {viewing && (
        <HighlightViewer
          highlight={viewing}
          isSelf={isSelf}
          onClose={() => setViewingId(null)}
          onAddPhotos={() => setEditor({ momentoId: viewing.id })}
        />
      )}

      {editor && (
        <HighlightEditor
          open
          momentoId={editor.momentoId}
          pickPhotos={pickPhotos}
          onClose={() => setEditor(null)}
        />
      )}
    </section>
  );
}
