"use client";
// Música de una foto, estilo Instagram. Se monta DENTRO de la imagen: cuando hay
// canción, una barra difuminada (frosted) al pie de la foto; sin canción, un
// botón flotante. El buscar/colgar/cambiar/quitar vive en un modal.
// Autoplay en loop del track colgado (con fallback al primer toque).
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DeezerTrack } from "@/lib/deezer";
import type { AttachedTrack } from "@/lib/music";
import { attachTrack, detachTrack } from "@/app/foto/[id]/actions";

export function PhotoMusic({
  mediaId,
  track,
}: {
  mediaId: string;
  track: AttachedTrack | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DeezerTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [ambientOn, setAmbientOn] = useState(false);

  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);

  // Autoplay del track colgado (loop). Si el navegador lo bloquea, arranca al
  // primer toque en cualquier parte.
  useEffect(() => {
    const a = ambientRef.current;
    if (!a || !track?.preview) return;
    a.loop = true;
    let done = false;
    a.play()
      .then(() => setAmbientOn(true))
      .catch(() => {
        const onGesture = () => {
          if (done) return;
          a.play().then(() => setAmbientOn(true)).catch(() => {});
          window.removeEventListener("pointerdown", onGesture);
        };
        window.addEventListener("pointerdown", onGesture);
      });
    return () => {
      done = true;
      a.pause();
    };
  }, [track?.preview]);

  // Búsqueda con debounce.
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

  function playAmbient() {
    previewRef.current?.pause();
    setPreviewId(null);
    ambientRef.current?.play().then(() => setAmbientOn(true)).catch(() => {});
  }
  function pauseAmbient() {
    ambientRef.current?.pause();
    setAmbientOn(false);
  }
  function openModal() {
    pauseAmbient();
    setOpen(true);
  }
  function closeModal() {
    previewRef.current?.pause();
    setPreviewId(null);
    setOpen(false);
    setQuery("");
    setResults([]);
    if (track?.preview) playAmbient();
  }
  function preview(t: DeezerTrack) {
    const p = previewRef.current;
    if (!p) return;
    if (previewId === t.deezerId) {
      p.pause();
      setPreviewId(null);
      return;
    }
    p.src = t.preview;
    p.play().catch(() => {});
    setPreviewId(t.deezerId);
    p.onended = () => setPreviewId(null);
  }
  function colgar(t: DeezerTrack) {
    startTransition(async () => {
      const res = await attachTrack(mediaId, t);
      if (!res?.error) {
        previewRef.current?.pause();
        setPreviewId(null);
        setOpen(false);
        setQuery("");
        setResults([]);
        router.refresh();
      }
    });
  }
  function quitar() {
    startTransition(async () => {
      pauseAmbient();
      await detachTrack(mediaId);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      {/* Audios ocultos */}
      {track?.preview && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio ref={ambientRef} src={track.preview} preload="auto" />
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={previewRef} preload="none" />

      {/* Overlay dentro de la foto */}
      {track ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.12) 55%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)",
              maskImage:
                "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 pb-3 text-white">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white/10 px-2 py-1.5">
            <button
              type="button"
              onClick={() => (ambientOn ? pauseAmbient() : playAmbient())}
              aria-label={ambientOn ? "Pausar" : "Reproducir"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm"
            >
              {ambientOn ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight drop-shadow">
                {track.title}
              </p>
              <p className="truncate text-[11px] leading-tight text-white/80 drop-shadow">
                {track.artist}
              </p>
            </div>
            {ambientOn && <SoundWave />}
            <button
              type="button"
              onClick={openModal}
              aria-label="Cambiar canción"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/20"
            >
              <MusicIcon />
            </button>
          </div>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black/50"
        >
          <MusicIcon /> Música
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#fffaf3] p-4 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-800">Música</h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full px-2 py-1 text-sm text-stone-500 hover:bg-stone-100"
              >
                Cerrar
              </button>
            </div>

            {track && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-rose-50/70 p-2">
                {track.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={track.cover}
                    alt=""
                    className="h-11 w-11 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-md bg-rose-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800">
                    {track.title}
                  </p>
                  <p className="truncate text-xs text-stone-500">
                    {track.artist}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={quitar}
                  disabled={pending}
                  className="shrink-0 text-xs font-medium text-rose-500 hover:text-rose-600 disabled:opacity-50"
                >
                  Quitar
                </button>
              </div>
            )}

            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca una canción…"
              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-rose-400 focus:outline-none"
            />

            {loading && <p className="mt-3 text-xs text-stone-400">Buscando…</p>}

            <ul className="mt-2 space-y-1">
              {results.map((t) => (
                <li
                  key={t.deezerId}
                  className="flex items-center gap-2 rounded-xl px-1 py-1 hover:bg-rose-50/60"
                >
                  <button
                    type="button"
                    onClick={() => preview(t)}
                    aria-label={previewId === t.deezerId ? "Pausar" : "Escuchar"}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900/5 text-stone-700 hover:bg-stone-900/10"
                  >
                    {previewId === t.deezerId ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  {t.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.cover}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded bg-stone-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-stone-800">{t.title}</p>
                    <p className="truncate text-xs text-stone-500">
                      {t.artist}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => colgar(t)}
                    disabled={pending}
                    className="shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-3 py-1 text-xs font-medium text-white shadow-sm disabled:opacity-40"
                  >
                    Colgar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function SoundWave() {
  return (
    <div className="flex shrink-0 items-end gap-0.5" aria-hidden>
      <span className="h-2 w-0.5 animate-pulse bg-white" />
      <span className="h-3 w-0.5 animate-pulse bg-white [animation-delay:150ms]" />
      <span className="h-1.5 w-0.5 animate-pulse bg-white [animation-delay:300ms]" />
    </div>
  );
}
