"use client";
// Borrado por consenso: una foto solo se elimina cuando novio y novia votan.
// Tres estados: sin votos (proponer), yo voté (esperando pareja / cancelar),
// mi pareja votó (confirmar borrado definitivo).
import { useState, useTransition } from "react";
import { voteToDelete, cancelDeleteVote } from "@/app/foto/[id]/actions";
import type { DeleteVotesState } from "@/lib/social";

export function DeletePhotoButton({
  mediaId,
  votes,
}: {
  mediaId: string;
  votes: DeleteVotesState;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const partnerVoted = !!votes.partnerName; // la pareja ya votó
  const iVoted = votes.votedByMe;

  function propose() {
    setError(null);
    // Si mi pareja ya votó, este voto completa los 2 → borra. Confirmamos.
    if (partnerVoted) {
      const ok = window.confirm(
        `${votes.partnerName} ya pidió eliminar esta foto. Si confirmas, se borra para los dos —con sus likes y comentarios— y no se puede deshacer.`
      );
      if (!ok) return;
    }
    startTransition(async () => {
      const res = await voteToDelete(mediaId);
      if (res?.error) setError(res.error);
    });
  }

  function cancel() {
    setError(null);
    startTransition(() => cancelDeleteVote(mediaId));
  }

  // Yo ya voté y espero a mi pareja.
  if (iVoted && !partnerVoted) {
    return (
      <div className="flex flex-col items-end gap-1 text-right">
        <span className="text-xs text-stone-500">
          Pediste eliminar · esperando el voto de tu pareja
        </span>
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="text-xs text-stone-400 transition hover:text-stone-600 disabled:opacity-50"
        >
          {pending ? "…" : "Cancelar mi voto"}
        </button>
      </div>
    );
  }

  // Mi pareja votó; falto yo para completar el borrado.
  if (partnerVoted && !iVoted) {
    return (
      <div className="flex flex-col items-end gap-1 text-right">
        <span className="text-xs text-stone-500">
          {votes.partnerName} quiere eliminar esta foto
        </span>
        <button
          type="button"
          onClick={propose}
          disabled={pending}
          className="text-xs font-medium text-rose-500 transition hover:text-rose-600 disabled:opacity-50"
        >
          {pending ? "Eliminando…" : "Confirmar borrado"}
        </button>
        {error && <span className="text-xs text-rose-500">{error}</span>}
      </div>
    );
  }

  // Sin votos aún (o caso raro: ambos votados sin borrar todavía).
  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <button
        type="button"
        onClick={propose}
        disabled={pending}
        className="text-xs text-stone-400 transition hover:text-rose-500 disabled:opacity-50"
      >
        {pending ? "…" : "Proponer eliminar"}
      </button>
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
}
