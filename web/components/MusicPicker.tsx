"use client";
// Selector de canción (Deezer) para un post. Busca vía /api/deezer, deja
// escuchar el preview de 30s y elegir una pista. Devuelve el DeezerTrack elegido.
import { useEffect, useRef, useState } from "react";
import type { DeezerTrack } from "@/lib/deezer";

export function MusicPicker({
  value,
  onChange,
}: {
  value: DeezerTrack | null;
  onChange: (t: DeezerTrack | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DeezerTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/deezer?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setResults(json.tracks ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  function preview(t: DeezerTrack) {
    const a = audioRef.current;
    if (!a) return;
    if (playingId === t.deezerId) {
      a.pause();
      setPlayingId(null);
      return;
    }
    a.src = t.preview;
    a.play().catch(() => {});
    setPlayingId(t.deezerId);
    a.onended = () => setPlayingId(null);
  }

  function choose(t: DeezerTrack) {
    audioRef.current?.pause();
    setPlayingId(null);
    onChange(t);
    setQuery("");
    setResults([]);
  }

  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="none" />

      {value ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-white/70 p-2">
          {value.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.cover}
              alt=""
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-100">
              ♪
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-stone-800">
              {value.title}
            </p>
            <p className="truncate text-xs text-stone-500">{value.artist}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-stone-400 hover:text-rose-500"
          >
            Quitar
          </button>
        </div>
      ) : (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar canción (opcional)…"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
          {loading && (
            <p className="mt-1 text-xs text-stone-400">Buscando…</p>
          )}
          {results.length > 0 && (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {results.map((t) => (
                <li
                  key={t.deezerId}
                  className="flex items-center gap-2 rounded-lg p-1 hover:bg-rose-50"
                >
                  <button
                    type="button"
                    onClick={() => preview(t)}
                    aria-label={playingId === t.deezerId ? "Pausar" : "Escuchar"}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-stone-700"
                  >
                    {playingId === t.deezerId ? "⏸" : "▶"}
                  </button>
                  <button
                    type="button"
                    onClick={() => choose(t)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    {t.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.cover}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-stone-800">
                        {t.title}
                      </span>
                      <span className="block truncate text-xs text-stone-500">
                        {t.artist}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
