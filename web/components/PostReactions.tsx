"use client";
// Panel de reacciones del post. SIN límite: cada toque suma una reacción (de
// cualquiera de los 6 tipos). Muestra los conteos y una burbuja para reaccionar.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addReaction, undoMyReaction } from "@/app/post/[id]/actions";

const REACTIONS: { tipo: string; emoji: string; label: string }[] = [
  { tipo: "encanta", emoji: "❤️", label: "Me encanta" },
  { tipo: "divierte", emoji: "😂", label: "Me divierte" },
  { tipo: "estremece", emoji: "😏", label: "Me estremece" },
  { tipo: "enoja", emoji: "😠", label: "Me enoja" },
  { tipo: "asombra", emoji: "😮", label: "Me asombra" },
  { tipo: "excelenchi", emoji: "👌", label: "Excelenchi" },
];

export function PostReactions({
  postId,
  initialCounts,
  initialMyCount,
}: {
  postId: string;
  initialCounts: Record<string, number>;
  initialMyCount: number;
}) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [myCount, setMyCount] = useState(initialMyCount);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function react(tipo: string) {
    setCounts((c) => ({ ...c, [tipo]: (c[tipo] ?? 0) + 1 })); // optimista
    setMyCount((m) => m + 1);
    startTransition(async () => {
      await addReaction(postId, tipo);
      router.refresh();
    });
  }

  function undo() {
    if (myCount <= 0) return;
    setMyCount((m) => Math.max(0, m - 1)); // optimista (el tipo lo corrige el refresh)
    startTransition(async () => {
      await undoMyReaction(postId);
      router.refresh();
    });
  }

  const conAlgo = REACTIONS.filter((r) => (counts[r.tipo] ?? 0) > 0);

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        {/* Resumen de conteos */}
        {conAlgo.map((r) => (
          <span
            key={r.tipo}
            className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-1 text-sm text-stone-700 backdrop-blur"
            title={r.label}
          >
            <span aria-hidden>{r.emoji}</span>
            <span className="text-xs font-medium">{counts[r.tipo]}</span>
          </span>
        ))}

        {/* Botón para abrir la burbuja */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white/60 px-3 py-1 text-sm text-stone-700 backdrop-blur transition hover:bg-white/80"
        >
          <span aria-hidden>🙂</span> Reaccionar
        </button>

        {myCount > 0 && (
          <button
            type="button"
            onClick={undo}
            className="text-xs text-stone-400 underline transition hover:text-stone-600"
          >
            deshacer
          </button>
        )}
      </div>

      {/* Burbuja de reacciones */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-full border border-white/60 bg-white/90 p-1.5 shadow-lg backdrop-blur">
            {REACTIONS.map((r) => (
              <button
                key={r.tipo}
                type="button"
                onClick={() => react(r.tipo)}
                title={r.label}
                aria-label={r.label}
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition hover:scale-125 hover:bg-rose-50 active:scale-95"
              >
                {r.emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
