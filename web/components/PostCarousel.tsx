"use client";
// Carrusel de las fotos de un post: deslizable (scroll-snap), con flechas y
// puntos indicadores. Tocar una foto la abre a pantalla completa (zoom).
import { useEffect, useRef, useState } from "react";
import type { PostSlide } from "@/lib/posts";

export function PostCarousel({ slides }: { slides: PostSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);

  const many = slides.length > 1;

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  }

  function goto(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom]);

  return (
    <figure className="overflow-hidden rounded-3xl bg-white/60 p-1.5 shadow-[0_18px_50px_-12px_rgba(244,114,182,0.45)] ring-1 ring-white/50">
      <div className="relative overflow-hidden rounded-2xl">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((s) => (
            <div key={s.mediaId} className="w-full shrink-0 snap-center">
              {s.tipo === "video" && s.fullUrl ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={s.fullUrl}
                  controls
                  className="max-h-[70vh] w-full rounded-2xl bg-black object-contain"
                />
              ) : s.fullUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.fullUrl}
                  alt={s.descripcion ?? ""}
                  onClick={() => setZoom(s.fullUrl)}
                  className="max-h-[70vh] w-full cursor-zoom-in rounded-2xl object-contain"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-2xl text-sm text-stone-500">
                  No se pudo cargar la imagen
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contador tipo Instagram (1/3) */}
        {many && (
          <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
            {index + 1}/{slides.length}
          </span>
        )}

        {/* Flechas */}
        {many && index > 0 && (
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => goto(index - 1)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            ‹
          </button>
        )}
        {many && index < slides.length - 1 && (
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => goto(index + 1)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            ›
          </button>
        )}
      </div>

      {/* Puntos */}
      {many && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          {slides.map((s, i) => (
            <button
              key={s.mediaId}
              type="button"
              aria-label={`Ir a la foto ${i + 1}`}
              onClick={() => goto(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-rose-500" : "w-1.5 bg-stone-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Zoom a pantalla completa */}
      {zoom && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-2"
          onClick={() => setZoom(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom}
            alt=""
            className="max-h-[96vh] max-w-full cursor-zoom-out object-contain"
          />
          <button
            type="button"
            onClick={() => setZoom(null)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white hover:bg-white/25"
          >
            ✕
          </button>
        </div>
      )}
    </figure>
  );
}
