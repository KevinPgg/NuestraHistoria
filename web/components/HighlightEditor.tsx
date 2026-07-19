"use client";
// Editor de un destacado. Dos usos:
//  - Crear: pide título, crea el momento y pasa a elegir/subir fotos.
//  - Agregar: recibe momentoId y va directo a elegir/subir.
// La pantalla de fotos tiene dos pestañas: "Elegir" (fotos ya subidas, multi-
// selección) y "Subir" (una foto nueva optimizada a WebP, que también va al feed).
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { processImage, slugify } from "@/lib/image";
import {
  createHighlight,
  addExistingItems,
  uploadItem,
} from "@/app/destacados/actions";

export interface PickPhoto {
  id: string;
  thumbUrl: string | null;
}

const hoy = () => new Date().toISOString().slice(0, 10);

export function HighlightEditor({
  open,
  onClose,
  momentoId: momentoIdProp,
  pickPhotos,
}: {
  open: boolean;
  onClose: () => void;
  momentoId?: string; // si viene, modo "agregar"; si no, modo "crear"
  pickPhotos: PickPhoto[];
}) {
  const router = useRouter();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const momentoId = momentoIdProp ?? createdId;

  const [titulo, setTitulo] = useState("");
  const [tab, setTab] = useState<"elegir" | "subir">("elegir");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fecha, setFecha] = useState(hoy());
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  function close() {
    setCreatedId(null);
    setTitulo("");
    setSelected(new Set());
    setDescripcion("");
    setFecha(hoy());
    setError(null);
    setOkMsg(null);
    setTab("elegir");
    onClose();
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function doCreate() {
    setError(null);
    const t = titulo.trim();
    if (!t) {
      setError("Ponle un título al destacado.");
      return;
    }
    startTransition(async () => {
      const res = await createHighlight(t);
      if (res.error || !res.id) {
        setError(res.error ?? "No se pudo crear.");
        return;
      }
      setCreatedId(res.id);
      setOkMsg("Destacado creado. Ahora agrégale fotos.");
      router.refresh();
    });
  }

  function addSelected() {
    if (!momentoId || selected.size === 0) return;
    setError(null);
    startTransition(async () => {
      const res = await addExistingItems(momentoId, Array.from(selected));
      if (res.error) setError(res.error);
      else {
        setOkMsg(`Agregadas ${res.added ?? 0}.`);
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !momentoId) return;
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
        const res = await uploadItem(momentoId, fd);
        if (res?.error) setError(res.error);
        else {
          setOkMsg("¡Foto subida y agregada!");
          setDescripcion("");
          router.refresh();
        }
      } catch {
        setError("No se pudo procesar la imagen. Prueba con otra.");
      }
      e.target.value = "";
    });
  }

  const creating = !momentoId; // aún no existe el momento (modo crear, paso 1)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={close}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#fffaf3] p-4 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">
            {creating ? "Nuevo destacado" : "Agregar fotos"}
          </h2>
          <button
            type="button"
            onClick={close}
            className="text-sm text-stone-500"
          >
            {creating ? "Cancelar" : "Listo"}
          </button>
        </div>

        {error && <p className="mb-2 text-sm text-rose-500">{error}</p>}
        {okMsg && <p className="mb-2 text-sm text-emerald-600">{okMsg}</p>}

        {creating ? (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-stone-500">
              Título
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={60}
              placeholder="Ej. Viaje a la playa"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button
              type="button"
              onClick={doCreate}
              disabled={pending || !titulo.trim()}
              className="w-full rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "Creando…" : "Crear y elegir fotos"}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setTab("elegir")}
                className={`rounded-full px-3 py-1 text-sm ${tab === "elegir" ? "bg-rose-400 text-white" : "text-stone-600"}`}
              >
                Elegir del pool
              </button>
              <button
                type="button"
                onClick={() => setTab("subir")}
                className={`rounded-full px-3 py-1 text-sm ${tab === "subir" ? "bg-rose-400 text-white" : "text-stone-600"}`}
              >
                Subir nueva
              </button>
            </div>

            {tab === "elegir" ? (
              pickPhotos.length === 0 ? (
                <p className="py-8 text-center text-sm text-stone-500">
                  El pool está vacío. Sube la primera foto.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {pickPhotos.map((p) => {
                      const on = selected.has(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggle(p.id)}
                          className={`relative aspect-square overflow-hidden rounded-lg bg-rose-100 ring-2 ${on ? "ring-rose-400" : "ring-transparent"}`}
                        >
                          {p.thumbUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.thumbUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                          {on && (
                            <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="sticky bottom-0 -mx-4 mt-3 border-t border-stone-200 bg-[#fffaf3] px-4 py-3">
                    <button
                      type="button"
                      onClick={addSelected}
                      disabled={pending || selected.size === 0}
                      className="w-full rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {pending
                        ? "Agregando…"
                        : `Agregar ${selected.size > 0 ? `(${selected.size})` : ""}`}
                    </button>
                  </div>
                </>
              )
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-500">
                    Descripción (opcional)
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
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-rose-300 bg-white/60 p-8 text-center text-sm text-stone-600">
                  {pending ? "Subiendo…" : "Toca para elegir una imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onUpload}
                    disabled={pending}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
