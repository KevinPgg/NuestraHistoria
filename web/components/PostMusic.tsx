"use client";
// Música del post: reproduce (autoplay en loop) y permite agregar / cambiar /
// quitar la canción. Ambos de la pareja pueden editarla.
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AttachedTrack } from "@/lib/music";
import type { DeezerTrack } from "@/lib/deezer";
import { MusicPicker } from "@/components/MusicPicker";
import { attachPostTrack, detachPostTrack } from "@/app/post/[id]/actions";

export function PostMusic({
  postId,
  track,
}: {
  postId: string;
  track: AttachedTrack | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pending, startTransition] = useTransition();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track?.preview) return;
    a.loop = true;
    let done = false;
    a.play()
      .then(() => setPlaying(true))
      .catch(() => {
        const onGesture = () => {
          if (done) return;
          a.play().then(() => setPlaying(true)).catch(() => {});
          window.removeEventListener("pointerdown", onGesture);
        };
        window.addEventListener("pointerdown", onGesture);
      });
    return () => {
      done = true;
      a.pause();
    };
  }, [track?.preview]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function choose(t: DeezerTrack | null) {
    if (!t) return;
    startTransition(async () => {
      await attachPostTrack(postId, t);
      setOpen(false);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      audioRef.current?.pause();
      await detachPostTrack(postId);
      router.refresh();
    });
  }

  return (
    <div className="mt-3">
      {track ? (
        <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/50 px-2 py-1.5 backdrop-blur">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio ref={audioRef} src={track.preview} preload="auto" />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-stone-900 shadow-sm"
          >
            {playing ? "⏸" : "▶"}
          </button>
          {track.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.cover}
              alt=""
              className="h-8 w-8 rounded object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight text-stone-800">
              {track.title}
            </p>
            <p className="truncate text-[11px] leading-tight text-stone-500">
              {track.artist}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 px-1 text-[11px] text-stone-500 hover:text-stone-700"
          >
            Cambiar
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="shrink-0 px-1 text-[11px] text-stone-400 hover:text-rose-500 disabled:opacity-50"
          >
            Quitar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/50 px-3 py-1.5 text-sm text-stone-600 backdrop-blur transition hover:bg-white/70"
        >
          <span aria-hidden>♪</span> Agregar música
        </button>
      )}

      {open && (
        <div className="mt-2 rounded-2xl border border-stone-200 bg-[#fffaf3] p-3">
          <MusicPicker value={null} onChange={choose} />
        </div>
      )}
    </div>
  );
}
