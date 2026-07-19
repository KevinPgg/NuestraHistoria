"use client";
// Minijuego Memory (pares). Re-portado de la v1: el pool combina iconos SVG del
// proyecto con fotos reales de la pareja; cada partida elige 6 al azar, así
// siempre es distinta. Reintentar rebaraja el mismo pool (no cambia las fotos).
import { useEffect, useMemo, useState } from "react";

const TOTAL_PAIRS = 6;

// Iconos SVG servidos desde /public/iconos-svg (copiados del legacy).
const ICONS = [
  "ramen", "cafe", "corazon", "fuego", "arbol-navidad",
  "chile", "globo-nieve", "disco", "bitcoin", "amanecer",
  "bola-billar-8", "calendario-31", "chile-2", "mosca",
  "notas-musicales", "persona-poncho",
].map((name) => `/iconos-svg/${name}.svg`);

interface PoolItem {
  id: string;
  src: string;
}

interface Card {
  key: number;
  id: string;
  src: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Elige TOTAL_PAIRS ítems del pool combinado (fotos + iconos). */
function pickPool(photos: string[]): PoolItem[] {
  const photoItems: PoolItem[] = photos.map((src, i) => ({
    id: `photo__${i}`,
    src,
  }));
  const iconItems: PoolItem[] = ICONS.map((src, i) => ({
    id: `icon__${i}`,
    src,
  }));
  return shuffle([...photoItems, ...iconItems]).slice(0, TOTAL_PAIRS);
}

/** Construye el mazo (cada ítem duplicado y barajado). */
function buildDeck(pool: PoolItem[]): Card[] {
  return shuffle([...pool, ...pool]).map((item, i) => ({
    key: i,
    id: item.id,
    src: item.src,
    flipped: false,
    matched: false,
  }));
}

export function MemoryGame({
  photos = [],
  onWin,
  onClose,
}: {
  photos?: string[];
  onWin: () => void;
  onClose: () => void;
}) {
  // Pool fijo por montaje: reintentar rebaraja las mismas cartas (como la v1).
  const pool = useMemo(() => pickPool(photos), [photos]);

  const [cards, setCards] = useState<Card[]>(() => buildDeck(pool));
  const [picked, setPicked] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [ready, setReady] = useState(false);

  // Precargar las imágenes del pool antes de mostrar el tablero, para que las
  // cartas no aparezcan en blanco al voltearlas. Tope de espera por si alguna
  // imagen tarda o falla, así el juego nunca se queda colgado.
  useEffect(() => {
    const srcs = Array.from(new Set(pool.map((p) => p.src)));
    if (srcs.length === 0) {
      setReady(true);
      return;
    }
    let done = 0;
    let cancelled = false;
    const finish = () => {
      if (!cancelled && ++done >= srcs.length) setReady(true);
    };
    srcs.forEach((src) => {
      const img = new window.Image();
      img.onload = finish;
      img.onerror = finish;
      img.src = src;
    });
    const t = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 3500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [pool]);

  const matchedPairs = useMemo(
    () => cards.filter((c) => c.matched).length / 2,
    [cards]
  );
  const won = matchedPairs >= TOTAL_PAIRS;

  function flip(i: number) {
    if (lock) return;
    const c = cards[i];
    if (c.flipped || c.matched) return;

    const next = cards.map((x, j) => (j === i ? { ...x, flipped: true } : x));
    setCards(next);
    const nextPicked = [...picked, i];
    setPicked(nextPicked);

    if (nextPicked.length === 2) {
      setLock(true);
      setMoves((m) => m + 1);
      const [a, b] = nextPicked;
      const match = next[a].id === next[b].id;
      setTimeout(() => {
        setCards((prev) =>
          prev.map((x, j) =>
            j === a || j === b
              ? { ...x, matched: match, flipped: match }
              : x
          )
        );
        setPicked([]);
        setLock(false);
      }, match ? 420 : 900);
    }
  }

  function restart() {
    setCards(buildDeck(pool));
    setPicked([]);
    setLock(false);
    setMoves(0);
  }

  return (
    <div className="w-full">
      <div className="mb-2 text-center">
        <p className="text-base font-semibold text-stone-800">
          🤭 Encuentra a la parejita 🤭
        </p>
        <p className="text-xs text-stone-500">
          Encuentra los {TOTAL_PAIRS} pares para leer la carta.
        </p>
        <p className="mt-1 text-sm font-medium text-rose-500">
          {matchedPairs} / {TOTAL_PAIRS} pares · {moves} intentos
        </p>
      </div>

      {!ready && (
        <div className="mx-auto flex min-h-[13rem] max-w-xs items-center justify-center">
          <p className="animate-pulse text-sm text-stone-500">
            Preparando cartas… 🃏
          </p>
        </div>
      )}

      <div
        className={`relative mx-auto grid max-w-xs grid-cols-4 gap-2 ${
          ready ? "" : "hidden"
        }`}
      >
        {cards.map((c, i) => {
          const face = c.flipped || c.matched;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => flip(i)}
              aria-label={face ? "carta descubierta" : "carta boca abajo"}
              className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border transition ${
                face
                  ? "border-rose-200 bg-white " + (c.matched ? "opacity-70" : "")
                  : "border-rose-300/50 bg-gradient-to-br from-rose-300 to-amber-300"
              }`}
            >
              {face ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.src}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl">💌</span>
              )}
            </button>
          );
        })}

        {won && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-stone-900/80 p-4 text-center backdrop-blur">
            <p className="text-base font-semibold text-emerald-300">
              Ahora tienes acceso a mi corazón u u
            </p>
            <p className="text-xs text-white/70">
              Tu memoria es tan buena como tus… ejem.
            </p>
            <button
              type="button"
              onClick={onWin}
              className="mt-1 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-5 py-2 text-sm font-medium text-white shadow"
            >
              Leer carta 💌
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-center gap-4">
        <button
          type="button"
          onClick={restart}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          Reiniciar 🔄
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
