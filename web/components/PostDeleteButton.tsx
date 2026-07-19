"use client";
// Borrar el post. Es del usuario: su autor lo borra libremente, solo con una
// confirmación. Borrar el post NO borra las fotos del pool.
import { useState, useTransition } from "react";
import { deletePost } from "@/app/post/[id]/actions";

export function PostDeleteButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    const ok = window.confirm(
      "¿Borrar este post? Las fotos seguirán en el pool. Esta acción no se puede deshacer."
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await deletePost(postId);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="text-[12px] text-stone-400 transition hover:text-rose-500 disabled:opacity-50"
      >
        {pending ? "Borrando…" : "Borrar post"}
      </button>
      {error && <span className="text-[11px] text-rose-500">{error}</span>}
    </div>
  );
}
