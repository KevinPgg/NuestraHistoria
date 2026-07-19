"use client";
// Formulario para agregar un comentario. Limpia el campo al enviar con éxito.
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
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        {error ? (
          <span className="text-xs text-rose-400">{error}</span>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending || !texto.trim()}
          className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white disabled:opacity-40"
        >
          {pending ? "Enviando…" : "Comentar"}
        </button>
      </div>
    </form>
  );
}
