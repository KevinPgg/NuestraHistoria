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
          className="block w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/90 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-black hover:file:bg-white"
        />
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Vista previa"
          className="max-h-64 w-full rounded-xl object-contain bg-white/5"
        />
      )}

      <div>
        <label className="mb-1 block text-xs text-white/50">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="¿Qué momento es este?"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-white/50">
          Fecha real de la foto
        </label>
        <input
          type="date"
          value={fecha}
          max={hoy()}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {okMsg && <p className="text-sm text-emerald-400">{okMsg}</p>}

      <button
        type="submit"
        disabled={pending || !file}
        className="rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-black transition hover:bg-white disabled:opacity-40"
      >
        {pending ? "Subiendo…" : "Subir foto"}
      </button>
    </form>
  );
}
