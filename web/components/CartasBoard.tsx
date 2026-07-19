"use client";
// Tablero de cartas de hitos. Cada carta se desbloquea por fecha; algunas piden
// ganar un minijuego antes de abrir la carta.
import { useState } from "react";
import type { Milestone } from "@/lib/milestones";
import { TostonesGame } from "@/components/games/TostonesGame";
import { MemoryGame } from "@/components/games/MemoryGame";

export function CartasBoard({
  milestones,
  monthsPassed,
  gamePhotos = [],
}: {
  milestones: Milestone[];
  monthsPassed: number;
  gamePhotos?: string[];
}) {
  const [game, setGame] = useState<Milestone | null>(null);
  const [letter, setLetter] = useState<Milestone | null>(null);

  function openMilestone(m: Milestone) {
    if (monthsPassed < m.monthsReq) return; // bloqueada
    if (m.game) setGame(m);
    else setLetter(m);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {milestones.map((m) => {
          const unlocked = monthsPassed >= m.monthsReq;
          const faltan = m.monthsReq - monthsPassed;
          return (
            <button
              key={m.monthsReq}
              type="button"
              onClick={() => openMilestone(m)}
              disabled={!unlocked}
              className={`relative flex aspect-[4/5] flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
                unlocked
                  ? "border-white/60 bg-white/60 shadow-[0_10px_30px_-12px_rgba(244,114,182,0.5)] hover:-translate-y-0.5 hover:bg-white/75"
                  : "border-white/30 bg-white/25 text-stone-400"
              }`}
            >
              <span
                className={`text-3xl font-bold ${
                  unlocked ? "text-rose-500" : "text-stone-400"
                }`}
              >
                {m.label}
              </span>
              <span
                className={`mt-1 text-xs ${
                  unlocked ? "text-stone-700" : "text-stone-400"
                }`}
              >
                {m.title}
              </span>
              {unlocked ? (
                m.game && (
                  <span className="mt-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    {m.game === "tostones" ? "🍳 minijuego" : "🃏 minijuego"}
                  </span>
                )
              ) : (
                <span className="mt-2 flex items-center gap-1 text-[10px] text-stone-400">
                  🔒 faltan {faltan} {faltan === 1 ? "mes" : "meses"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal de minijuego */}
      {game && (
        <Modal onClose={() => setGame(null)}>
          {game.game === "tostones" ? (
            <TostonesGame
              onWin={() => {
                const m = game;
                setGame(null);
                setLetter(m);
              }}
              onClose={() => setGame(null)}
            />
          ) : (
            <MemoryGame
              photos={gamePhotos}
              onWin={() => {
                const m = game;
                setGame(null);
                setLetter(m);
              }}
              onClose={() => setGame(null)}
            />
          )}
        </Modal>
      )}

      {/* Modal de carta */}
      {letter && (
        <Modal onClose={() => setLetter(null)}>
          <div className="max-h-[75vh] overflow-y-auto">
            <p className="mb-1 text-center text-sm font-medium uppercase tracking-wide text-stone-500">
              {letter.label}
            </p>
            <h3 className="mb-4 text-center text-xl text-stone-700 [font-family:var(--font-carta),cursive]">
              {letter.title}
            </h3>
            <div
              className="letter-paper"
              dangerouslySetInnerHTML={{ __html: letter.content }}
            />
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setLetter(null)}
                className="rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-5 py-2 text-sm font-medium text-white shadow"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#fffaf3] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
