"use client";
// Marca/desmarca una foto como destacada (favorita) del usuario en sesión.
// Optimista en el ícono; si el server rechaza (tope lleno), revierte y avisa.
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/foto/[id]/actions";

export function FavoriteButton({
  mediaId,
  initialFavorite,
  limit,
}: {
  mediaId: string;
  initialFavorite: boolean;
  limit: number;
}) {
  const [fav, setFav] = useState(initialFavorite);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setError(null);
    const prev = fav;
    setFav(!prev); // optimista
    startTransition(async () => {
      const res = await toggleFavorite(mediaId);
      if (res?.error) {
        setFav(prev); // revertir
        setError(res.error);
      } else if (typeof res?.isFavorite === "boolean") {
        setFav(res.isFavorite);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={fav}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition disabled:opacity-50 ${
          fav
            ? "border-amber-300 bg-amber-100 text-amber-700"
            : "border-white/60 bg-white/50 text-stone-600 hover:bg-white/70"
        }`}
      >
        <span aria-hidden>{fav ? "★" : "☆"}</span>
        {fav ? "Destacada" : "Destacar"}
      </button>
      {error && <span className="text-xs text-rose-500">{error}</span>}
      <span className="text-[11px] text-stone-400">Tope: {limit}</span>
    </div>
  );
}
