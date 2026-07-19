"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  async function onPasskey() {
    setError(null);
    setPasskeyLoading(true);
    const supabase = createClient();
    // signInWithPasskey usa credenciales "discoverable": el propio dispositivo
    // resuelve la cuenta, sin pedir correo. API experimental aún sin tipos → cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.auth as any).signInWithPasskey();
    setPasskeyLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("cancel") || error.name === "NotAllowedError") return; // usuario canceló
      setError(
        "No se pudo entrar con biométrico. Usa tu correo y contraseña, y registra la huella desde Ajustes."
      );
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message
      );
      return;
    }
    router.push("/feed");
    router.refresh(); // que los Server Components vean la sesión
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="mb-1 text-2xl font-semibold">Nuestra Historia</h1>
        <p className="mb-6 text-sm text-white/60">
          Espacio privado. Solo para nosotros.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-correo@ejemplo.com"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white/90 px-3 py-2 text-sm font-medium text-black transition hover:bg-white disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-white/30">
          <span className="h-px flex-1 bg-white/10" />o<span className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={onPasskey}
          disabled={passkeyLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm font-medium text-white/90 transition hover:border-white/30 disabled:opacity-50"
        >
          <span aria-hidden>🔑</span>
          {passkeyLoading ? "Esperando…" : "Entrar con huella / Face ID"}
        </button>

        <p className="mt-6 text-xs text-white/40">
          Registra tu huella / Face ID desde Ajustes (una vez que hayas entrado).
        </p>
      </div>
    </main>
  );
}
