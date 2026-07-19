"use client";
// Editor del feed de perfil: agrega fotos del POOL compartido a tu perfil, o sube
// nuevas (que van al pool y a tu perfil). Mismo patrón que el editor de destacados.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { processImage, slugify } from "@/lib/image";
import type { PickPhoto } from "@/components/HighlightEditor";
import { addToProfile } from "@/app/perfil/actions";
import { uploadPhoto } from "@/app/ajustes/actions";

const hoy = () => new Date().toISOString().slice(0, 10);

export function ProfileFeedEditor({
  open,
  onClose,
  poolPhotos,
  alreadyInIds,
}: {
  open: boolean;
  onClose: () => void;
  poolPhotos: PickPhoto[];
  alreadyInIds: string[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"pool" | "subir">("pool");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fecha, setFecha] = useState(hoy());
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const already = new Set(alreadyInIds);

  if (!open) return null;

  function close() {
    setSelected(new Set());
    setDescripcion("");
    setFecha(hoy());
    setError(null);
    setOkMsg(null);
    setTab("pool");
    onClose();
  }

  function toggle(id: string) {
    if (already.has(id)) return; // ya está en el perfil
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addSelected() {
    if (selected.size === 0) return;
    setError(null);
    startTransition(async () => {
      const res = await addToProfile(Array.from(selected));
      if (res.error) setError(res.error);
      else {
        setOkMsg(`Agregadas ${res.added ?? 0} a tu perfil.`);
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
        if (res?.error) setError(res.error);
        else {
          setOkMsg("¡Subida al pool y a tu perfil!");
          setDescripcion("");
          router.refresh();
        }
      } catch {
        setError("No se pudo procesar la imagen. Prueba con otra.");
      }
      e.target.value = "";
    });
  }

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
            Agregar a mi perfil
          </h2>
          <button type="button" onClick={close} className="text-sm text-stone-500">
            Listo
          </button>
        </div>

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("pool")}
            className={`rounded-full px-3 py-1 text-sm ${tab === "pool" ? "bg-rose-400 text-white" : "text-stone-600"}`}
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

        {error && <p className="mb-2 text-sm text-rose-500">{error}</p>}
        {okMsg && <p className="mb-2 text-sm text-emerald-600">{okMsg}</p>}

        {tab === "pool" ? (
          poolPhotos.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500">
              El pool está vacío. Sube la primera foto.
            </p>
          ) : (
            <>
              <p className="mb-2 text-xs text-stone-500">
                Fotos compartidas de los dos. Toca para agregarlas a tu perfil.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {poolPhotos.map((p) => {
                  const isIn = already.has(p.id);
                  const on = selected.has(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggle(p.id)}
                      disabled={isIn}
                      className={`relative aspect-square overflow-hidden rounded-lg bg-rose-100 ring-2 ${on ? "ring-rose-400" : "ring-transparent"} ${isIn ? "opacity-40" : ""}`}
                    >
                      {p.thumbUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                      {isIn && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 text-center text-[9px] text-white">
                          en tu perfil
                        </span>
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
      </div>
    </div>
  );
}
