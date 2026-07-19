"use client";
// Formulario de subida: elige imagen, la optimiza a WebP en el navegador
// (full + thumb) y la envía a la server action. Muestra progreso y errores.
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { processImage, slugify } from "@/lib/image";
import { uploadPhoto } from "@/app/ajustes/actions";

const hoy = () => new Date().toISOString().slice(0, 10);

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    setOkMsg(null);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setDescripcion("");
    setFecha(hoy());
    if (inputRef.current) inputRef.current.value = "";
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Elige una imagen primero.");
      return;
    }
    setError(null);
    setOkMsg(null);
    startTransition(async () => {
      try {
        const { full, thumb } = await processImage(file);
        const slug = slugify(descripcion || file.name);
        const fd = new FormData();
        fd.set("full", new File([full], `${slug}.webp`, { type: "image/webp" }));
        fd.set("thumb", new File([thumb], `${slug}.webp`, { type: "image/webp" }));
        fd.set("descripcion", descripcion);
        fd.set("fecha", fecha);
        fd.set("slug", slug);
        const res = await uploadPhoto(fd);
        if (res?.error) {
          setError(res.error);
        } else {
          setOkMsg("¡Foto subida!");
          reset();
          router.refresh();
        }
      } catch {
        setError("No se pudo procesar la imagen. Prueba con otra.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onPick}
          className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-gradient-to-br file:from-amber-400 file:to-rose-400 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:brightness-105"
        />
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Vista previa"
          className="max-h-64 w-full rounded-xl object-contain bg-black/5"
        />
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-stone-500">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="¿Qué momento es este?"
          className="w-full resize-none rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-stone-500">
          Fecha real de la foto
        </label>
        <input
          type="date"
          value={fecha}
          max={hoy()}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {okMsg && <p className="text-sm text-emerald-600">{okMsg}</p>}

      <button
        type="submit"
        disabled={pending || !file}
        className="rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105 disabled:opacity-40"
      >
        {pending ? "Subiendo…" : "Subir foto"}
      </button>
    </form>
  );
}
