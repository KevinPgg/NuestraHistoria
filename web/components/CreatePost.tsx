"use client";
// Crear un post en TU perfil, en 2 pasos:
//  1) Fotos: elige del pool o sube nuevas, en el orden del carrusel.
//  2) Detalles: descripción + música (Deezer) + fecha, y publicar.
// La descripción y la música se fijan AQUÍ; luego no se editan desde el post.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { processImage, slugify } from "@/lib/image";
import type { PickPhoto } from "@/components/HighlightEditor";
import type { DeezerTrack } from "@/lib/deezer";
import { MusicPicker } from "@/components/MusicPicker";
import { createPost } from "@/app/post/actions";
import { uploadPhoto } from "@/app/ajustes/actions";

const hoy = () => new Date().toISOString().slice(0, 10);

export function CreatePost({
  poolPhotos,
  label = "Crear post",
}: {
  poolPhotos: PickPhoto[];
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"fotos" | "detalles">("fotos");
  const [tab, setTab] = useState<"pool" | "subir">("pool");
  const [extra, setExtra] = useState<PickPhoto[]>([]); // subidas en esta sesión
  const [order, setOrder] = useState<string[]>([]); // ids en orden de selección
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [track, setTrack] = useState<DeezerTrack | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const grid = [...extra, ...poolPhotos];
  const byId = new Map(grid.map((g) => [g.id, g]));

  function close() {
    setOpen(false);
    setStep("fotos");
    setTab("pool");
    setOrder([]);
    setExtra([]);
    setDescripcion("");
    setFecha(hoy());
    setTrack(null);
    setCreatedId(null);
    setError(null);
  }

  function goToPost(id: string) {
    close();
    router.push(`/post/${id}`);
    router.refresh();
  }

  function toggle(id: string) {
    setOrder((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const { full, thumb } = await processImage(file);
        const slug = slugify(file.name);
        const fd = new FormData();
        fd.set("full", new File([full], `${slug}.webp`, { type: "image/webp" }));
        fd.set("thumb", new File([thumb], `${slug}.webp`, { type: "image/webp" }));
        fd.set("descripcion", "");
        fd.set("fecha", fecha);
        fd.set("slug", slug);
        const res = await uploadPhoto(fd);
        if (res?.error || !res.mediaId) {
          setError(res?.error ?? "No se pudo subir.");
          return;
        }
        const thumbUrl = URL.createObjectURL(thumb);
        setExtra((p) => [{ id: res.mediaId!, thumbUrl }, ...p]);
        setOrder((p) => [...p, res.mediaId!]);
        setTab("pool");
      } catch {
        setError("No se pudo procesar la imagen. Prueba con otra.");
      }
      e.target.value = "";
    });
  }

  function publish() {
    if (order.length === 0) {
      setError("Elige al menos una foto.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createPost(order, descripcion, fecha, track);
      if (res.error || !res.id) {
        setError(res.error ?? "No se pudo crear el post.");
        return;
      }
      // Si eligió canción pero no se guardó, no navegamos en silencio: avisamos.
      if (track && !res.musicSaved) {
        setCreatedId(res.id);
        setError(
          `El post se creó, pero la canción no se guardó${res.musicError ? `: ${res.musicError}` : ""}. Ábrelo así, o bórralo y reinténtalo.`
        );
        return;
      }
      goToPost(res.id);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-3 py-1 text-xs font-medium text-white"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={close}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-[#fffaf3] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <h2 className="text-base font-semibold text-stone-800">
                {step === "fotos" ? "Nuevo post · fotos" : "Nuevo post · detalles"}
              </h2>
              <button
                type="button"
                onClick={close}
                className="text-sm text-stone-500"
              >
                Cerrar
              </button>
            </div>

            {/* ---------------- PASO 1: FOTOS ---------------- */}
            {step === "fotos" ? (
              <>
                <div className="overflow-y-auto px-4 py-3">
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

                  {tab === "pool" ? (
                    grid.length === 0 ? (
                      <p className="py-8 text-center text-sm text-stone-500">
                        El pool está vacío. Sube una foto.
                      </p>
                    ) : (
                      <>
                        <p className="mb-2 text-xs text-stone-500">
                          Toca en el orden que quieras. El número = orden del
                          carrusel.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {grid.map((p) => {
                            const pos = order.indexOf(p.id);
                            const on = pos >= 0;
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
                                    {pos + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-rose-300 bg-white/60 p-8 text-center text-sm text-stone-600">
                      {pending
                        ? "Subiendo…"
                        : "Toca para subir una foto nueva (va al pool y a este post)"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onUpload}
                        disabled={pending}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="border-t border-stone-200 px-4 py-3">
                  {error && <p className="mb-2 text-sm text-rose-500">{error}</p>}
                  <button
                    type="button"
                    onClick={() => {
                      if (order.length === 0) {
                        setError("Elige al menos una foto.");
                        return;
                      }
                      setError(null);
                      setStep("detalles");
                    }}
                    disabled={order.length === 0}
                    className="w-full rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Siguiente{order.length > 0 ? ` (${order.length})` : ""}
                  </button>
                </div>
              </>
            ) : (
              /* ---------------- PASO 2: DETALLES ---------------- */
              <>
                <div className="overflow-y-auto px-4 py-3">
                  {/* Vista previa del orden seleccionado */}
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {order.map((id, i) => {
                      const p = byId.get(id);
                      return (
                        <div
                          key={id}
                          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-rose-100"
                        >
                          {p?.thumbUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.thumbUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                          <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                            {i + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <label className="mb-1 block text-xs font-medium text-stone-500">
                    Descripción del post
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Escribe algo sobre este post…"
                    className="mb-4 w-full resize-none rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />

                  <label className="mb-1 block text-xs font-medium text-stone-500">
                    Música (opcional)
                  </label>
                  <div className="mb-4">
                    <MusicPicker value={track} onChange={setTrack} />
                  </div>

                  <label className="mb-1 block text-xs font-medium text-stone-500">
                    Fecha del post
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    max={hoy()}
                    onChange={(e) => setFecha(e.target.value)}
                    className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div className="border-t border-stone-200 px-4 py-3">
                  {error && <p className="mb-2 text-sm text-rose-500">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep("fotos")}
                      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-600"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => (createdId ? goToPost(createdId) : publish())}
                      disabled={pending || order.length === 0}
                      className="flex-1 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {pending
                        ? "Publicando…"
                        : createdId
                          ? "Ver post"
                          : `Publicar (${order.length})`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
