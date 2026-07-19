"use client";
// Editor de foto de perfil: subir una nueva (optimizada a WebP) o elegir una de
// las fotos ya subidas.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { processImage } from "@/lib/image";
import { setAvatarUpload, setAvatarExisting } from "@/app/perfil/actions";

interface PickPhoto {
  id: string;
  storagePath: string;
  thumbUrl: string | null;
}

export function AvatarEditor({ photos }: { photos: PickPhoto[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"subir" | "elegir">("subir");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const { thumb } = await processImage(file);
        const fd = new FormData();
        fd.set("avatar", new File([thumb], "avatar.webp", { type: "image/webp" }));
        const res = await setAvatarUpload(fd);
        if (res?.error) setError(res.error);
        else {
          setOpen(false);
          router.refresh();
        }
      } catch {
        setError("No se pudo procesar la imagen.");
      }
    });
  }

  function pick(storagePath: string) {
    setError(null);
    startTransition(async () => {
      const res = await setAvatarExisting(storagePath);
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/60 bg-white/50 px-4 py-1.5 text-xs font-medium text-stone-700 backdrop-blur transition hover:bg-white/70"
      >
        Editar foto
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#fffaf3] p-4 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setTab("subir")}
                className={`rounded-full px-3 py-1 text-sm ${tab === "subir" ? "bg-rose-400 text-white" : "text-stone-600"}`}
              >
                Subir
              </button>
              <button
                type="button"
                onClick={() => setTab("elegir")}
                className={`rounded-full px-3 py-1 text-sm ${tab === "elegir" ? "bg-rose-400 text-white" : "text-stone-600"}`}
              >
                Elegir del pool
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto text-sm text-stone-500"
              >
                Cerrar
              </button>
            </div>

            {error && <p className="mb-2 text-sm text-rose-500">{error}</p>}

            {tab === "subir" ? (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-rose-300 bg-white/60 p-8 text-center text-sm text-stone-600">
                {pending ? "Subiendo…" : "Toca para elegir una imagen"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  disabled={pending}
                  className="hidden"
                />
              </label>
            ) : photos.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500">
                El pool está vacío todavía.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={pending}
                    onClick={() => pick(p.storagePath)}
                    className="aspect-square overflow-hidden rounded-lg bg-rose-100 disabled:opacity-50"
                  >
                    {p.thumbUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.thumbUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
