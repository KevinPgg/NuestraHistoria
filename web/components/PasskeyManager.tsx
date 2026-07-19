"use client";
// Gestión de passkeys (huella / Face ID) del usuario en sesión. Registrar el
// dispositivo actual, ver los registrados y borrarlos. Usa la API experimental
// de Supabase (auth.registerPasskey / auth.passkey.*), aún sin tipos: se accede
// con un cast puntual a `any`.
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Passkey {
  id: string;
  friendly_name?: string;
  created_at?: string;
  last_used_at?: string;
}

export function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function auth(): any {
    return createClient().auth as unknown;
  }

  async function refresh() {
    setError(null);
    try {
      const { data, error } = await auth().passkey.list();
      if (error) throw error;
      setPasskeys(Array.isArray(data) ? data : data?.passkeys ?? []);
    } catch {
      // Si la API no está habilitada en el panel, no rompemos la página.
      setPasskeys([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRegister() {
    setError(null);
    setOkMsg(null);
    setBusy(true);
    try {
      const { error } = await auth().registerPasskey();
      if (error) throw error;
      setOkMsg("¡Dispositivo registrado! Ya puedes entrar con huella / Face ID.");
      await refresh();
    } catch (e) {
      const msg = (e as { message?: string })?.message?.toLowerCase() ?? "";
      if (msg.includes("cancel")) {
        // usuario canceló, sin ruido
      } else if (msg.includes("disabled") || msg.includes("passkey_disabled")) {
        setError(
          "Passkeys aún no está habilitado en el proyecto (panel de Supabase → Authentication → Passkeys)."
        );
      } else if (msg.includes("exists")) {
        setError("Este dispositivo ya estaba registrado.");
      } else {
        setError("No se pudo registrar el dispositivo. Intenta de nuevo.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(passkeyId: string) {
    setError(null);
    setOkMsg(null);
    setBusy(true);
    try {
      const { error } = await auth().passkey.delete({ passkeyId });
      if (error) throw error;
      await refresh();
    } catch {
      setError("No se pudo borrar la passkey.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onRegister}
        disabled={busy}
        className="flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        <span aria-hidden>🔑</span>
        {busy ? "Registrando…" : "Registrar este dispositivo (huella / Face ID)"}
      </button>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {okMsg && <p className="text-sm text-emerald-600">{okMsg}</p>}

      {loading ? (
        <p className="text-sm text-stone-500">Cargando…</p>
      ) : passkeys.length === 0 ? (
        <p className="text-sm text-stone-500">
          No tienes dispositivos registrados todavía.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white/60">
          {passkeys.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate text-stone-700">
                {p.friendly_name ?? "Dispositivo"}
                {p.created_at && (
                  <span className="ml-2 text-[11px] text-stone-400">
                    {new Date(p.created_at).toLocaleDateString("es-ES")}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                disabled={busy}
                className="shrink-0 text-[12px] text-stone-400 transition hover:text-rose-500 disabled:opacity-50"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
