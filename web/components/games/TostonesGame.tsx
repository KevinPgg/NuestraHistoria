"use client";
// Minijuego "Fríe los tostones" (portado de la v1 a React, mejorado).
// Aparecen tostones en una grilla 3×3; hay que tocarlos cuando están DORADOS.
// Ganas con NEED_PERFECT aciertos. onWin() abre la carta.
import { useEffect, useRef, useState } from "react";

type Phase = "raw" | "cooking" | "golden" | "burnt" | "done";
interface Tost {
  id: number;
  slot: number;
  phase: Phase;
}

const TOTAL = 10;
const NEED_PERFECT = 6;
const SPAWN_MS = 1300;
const MAX_CONCURRENT = 3;
const PHASE_MS: Record<string, number> = {
  raw: 900,
  cooking: 650,
  golden: 900,
  burnt: 550,
};

const PHASE_STYLE: Record<Phase, string> = {
  raw: "bg-amber-100 border-amber-200",
  cooking: "bg-amber-300 border-amber-400",
  golden:
    "bg-gradient-to-br from-amber-400 to-orange-500 border-orange-300 shadow-[0_0_20px_4px_rgba(251,146,60,0.6)] scale-110",
  burnt: "bg-stone-800 border-stone-900",
  done: "bg-emerald-400 border-emerald-500",
};

export function TostonesGame({
  onWin,
  onClose,
}: {
  onWin: () => void;
  onClose: () => void;
}) {
  const [tostones, setTostones] = useState<Tost[]>([]);
  const [perfect, setPerfect] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [wrongId, setWrongId] = useState<number | null>(null);

  const spawned = useRef(0);
  const over = useRef(false);
  const slots = useRef<boolean[]>(Array(9).fill(false));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const spawnInt = useRef<ReturnType<typeof setInterval> | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    start();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (spawnInt.current) clearInterval(spawnInt.current);
  }

  function later(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }

  function setPhase(id: number, phase: Phase) {
    setTostones((prev) => prev.map((t) => (t.id === id ? { ...t, phase } : t)));
  }

  function removeTost(id: number, slot: number) {
    slots.current[slot] = false;
    setTostones((prev) => prev.filter((t) => t.id !== id));
  }

  function checkLoss() {
    if (over.current) return;
    setTostones((prev) => {
      if (spawned.current >= TOTAL && prev.length === 0) {
        over.current = true;
        setStatus("lost");
        cleanup();
      }
      return prev;
    });
  }

  function spawn() {
    if (over.current || spawned.current >= TOTAL) return;
    setTostones((prev) => {
      if (prev.length >= MAX_CONCURRENT) return prev;
      const free = slots.current
        .map((u, i) => (u ? -1 : i))
        .filter((i) => i >= 0);
      if (!free.length) return prev;
      const slot = free[Math.floor(Math.random() * free.length)];
      slots.current[slot] = true;
      spawned.current++;
      const id = ++idRef.current;

      // Ciclo de fases
      later(() => setPhase(id, "cooking"), PHASE_MS.raw);
      later(() => setPhase(id, "golden"), PHASE_MS.raw + PHASE_MS.cooking);
      later(
        () => setPhase(id, "burnt"),
        PHASE_MS.raw + PHASE_MS.cooking + PHASE_MS.golden
      );
      later(() => {
        removeTost(id, slot);
        checkLoss();
      }, PHASE_MS.raw + PHASE_MS.cooking + PHASE_MS.golden + PHASE_MS.burnt);

      return [...prev, { id, slot, phase: "raw" }];
    });
  }

  function start() {
    over.current = false;
    spawned.current = 0;
    slots.current = Array(9).fill(false);
    idRef.current = 0;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTostones([]);
    setPerfect(0);
    setStatus("playing");
    spawn();
    spawnInt.current = setInterval(() => {
      if (over.current || spawned.current >= TOTAL) {
        if (spawnInt.current) clearInterval(spawnInt.current);
        return;
      }
      spawn();
    }, SPAWN_MS);
  }

  function tap(t: Tost) {
    if (over.current) return;
    if (t.phase === "golden") {
      setPhase(t.id, "done");
      later(() => {
        removeTost(t.id, t.slot);
        setPerfect((p) => {
          const np = p + 1;
          if (np >= NEED_PERFECT && !over.current) {
            over.current = true;
            setStatus("won");
            cleanup();
          } else {
            checkLoss();
          }
          return np;
        });
      }, 320);
    } else {
      setWrongId(t.id);
      setTimeout(() => setWrongId((w) => (w === t.id ? null : w)), 260);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-1 text-center">
        <p className="text-base font-semibold text-stone-800">🍳 Fríe los tostones</p>
        <p className="text-xs text-stone-500">
          Toca cuando estén <b>dorados</b>, ni crudos ni quemados.
        </p>
        <p className="mt-1 text-sm font-medium text-orange-600">
          {perfect} / {NEED_PERFECT} listos
        </p>
      </div>

      <div className="mb-2 flex items-center justify-center gap-1.5 text-[10px]">
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
          crudo
        </span>
        <span className="rounded-full bg-amber-300 px-2 py-0.5 text-amber-900">
          cocinando
        </span>
        <span className="rounded-full bg-gradient-to-br from-amber-400 to-orange-500 px-2 py-0.5 font-semibold text-white">
          ¡AHORA!
        </span>
        <span className="rounded-full bg-stone-800 px-2 py-0.5 text-stone-300">
          ivan
        </span>
      </div>

      <div className="relative mx-auto grid aspect-square w-full max-w-xs grid-cols-3 grid-rows-3 gap-2 rounded-2xl bg-gradient-to-br from-stone-700 to-stone-900 p-3">
        {Array.from({ length: 9 }).map((_, slot) => {
          const t = tostones.find((x) => x.slot === slot);
          return (
            <div key={slot} className="flex items-center justify-center">
              {t && (
                <button
                  type="button"
                  onClick={() => tap(t)}
                  aria-label="tostón"
                  className={`h-full w-full rounded-full border-2 transition-all duration-150 ${PHASE_STYLE[t.phase]} ${
                    wrongId === t.id ? "animate-ping-once ring-2 ring-rose-400" : ""
                  }`}
                >
                  {t.phase === "done" && <span className="text-white">✓</span>}
                </button>
              )}
            </div>
          );
        })}

        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-stone-900/80 p-4 text-center backdrop-blur">
            {status === "won" ? (
              <>
                <p className="text-lg font-semibold text-emerald-300">
                  ¡Excelente, chef! 😏
                </p>
                <button
                  type="button"
                  onClick={onWin}
                  className="rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-5 py-2 text-sm font-medium text-white shadow"
                >
                  Leer carta 💌
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-rose-300">
                  Quemados como el Ivan 😠
                </p>
                <button
                  type="button"
                  onClick={start}
                  className="rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-stone-900"
                >
                  Reintentar 🔄
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-center">
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
