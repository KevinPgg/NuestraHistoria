"use client";
// Formulario para agregar un comentario (paleta Golden Hour).
import { useRef, useState, useTransition } from "react";
import { addComment } from "@/app/foto/[id]/actions";

export function CommentForm({ mediaId }: { mediaId: string }) {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = texto.trim();
    if (!value) return;
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("texto", value);
      const res = await addComment(mediaId, fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setTexto("");
        ref.current?.focus();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-3">
      <textarea
        ref={ref}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe un comentario…"
        rows={2}
        maxLength={1000}
        className="w-full resize-none rounded-xl border border-rose-200 bg-white/70 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-rose-400 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        {error ? (
          <span className="text-xs text-rose-500">{error}</span>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending || !texto.trim()}
          className="rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:brightness-105 disabled:opacity-40"
        >
          {pending ? "Enviando…" : "Comentar"}
        </button>
      </div>
    </form>
  );
}
