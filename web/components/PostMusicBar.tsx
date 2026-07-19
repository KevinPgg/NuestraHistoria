"use client";
// Reproductor de la canción del post: barra compacta con autoplay en loop
// (arranca al primer toque si el navegador bloquea el autoplay).
import { useEffect, useRef, useState } from "react";
import type { AttachedTrack } from "@/lib/music";

export function PostMusicBar({ track }: { track: AttachedTrack | null }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

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

  if (!track) return null;

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

  return (
    <div className="mt-3 flex items-center gap-2 rounded-full border border-white/50 bg-white/50 px-2 py-1.5 backdrop-blur">
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
        <img src={track.cover} alt="" className="h-8 w-8 rounded object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight text-stone-800">
          {track.title}
        </p>
        <p className="truncate text-[11px] leading-tight text-stone-500">
          {track.artist}
        </p>
      </div>
      <span className="pr-1 text-rose-400" aria-hidden>
        ♪
      </span>
    </div>
  );
}
