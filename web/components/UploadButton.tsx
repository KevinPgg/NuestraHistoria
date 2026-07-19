"use client";
// Botón reutilizable para subir una foto: abre un modal con el UploadForm.
// Sirve desde el perfil (y donde haga falta). La subida alimenta el feed
// compartido (media.owner_id = usuario en sesión).
import { useState } from "react";
import { UploadForm } from "@/components/UploadForm";

export function UploadButton({
  label = "Subir foto",
}: {
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:brightness-105"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#fffaf3] p-4 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-800">
                Subir foto
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-2 py-1 text-sm text-stone-500 hover:bg-stone-100"
              >
                Cerrar
              </button>
            </div>
            <UploadForm />
          </div>
        </div>
      )}
    </>
  );
}
