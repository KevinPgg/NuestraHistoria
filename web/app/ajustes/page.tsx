// Página de configuración. Por ahora: subir una foto nueva.
import Link from "next/link";
import { Header } from "@/components/Header";
import { UploadForm } from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default function AjustesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href="/feed"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition hover:text-white/80"
        >
          <span aria-hidden>←</span> Volver al feed
        </Link>

        <h1 className="mb-1 text-lg font-semibold">Ajustes</h1>
        <p className="mb-6 text-sm text-white/50">
          Sube una foto nueva. Se optimiza a WebP en tu dispositivo antes de
          subir.
        </p>

        <section className="rounded-2xl border border-stone-200 bg-[#fffaf3] p-4 shadow-lg">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">
            Subir foto
          </h2>
          <UploadForm />
        </section>
      </main>
    </>
  );
}
