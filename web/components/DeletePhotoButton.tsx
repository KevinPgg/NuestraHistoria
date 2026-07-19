"use client";
// Botón para eliminar una foto. Pide confirmación porque es irreversible
// (borra la imagen del bucket y todos sus likes/comentarios en cascada).
import { useTransition } from "react";
import { deletePhoto } from "@/app/foto/[id]/actions";

export function DeletePhotoButton({ mediaId }: { mediaId: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    const ok = window.confirm(
      "¿Eliminar esta foto? Se borra para los dos, junto con sus likes y comentarios. No se puede deshacer."
    );
    if (!ok) return;
    startTransition(() => deletePhoto(mediaId));
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-xs text-white/30 transition hover:text-rose-400 disabled:opacity-50"
    >
      {pending ? "Eliminando…" : "Eliminar foto"}
    </button>
  );
}
