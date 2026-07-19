// Cliente de Supabase para el navegador (componentes cliente).
// `experimental.passkey` habilita la API de passkeys/WebAuthn (registerPasskey,
// signInWithPasskey, auth.passkey.*). Es experimental en supabase-js; requiere
// además activar Passkeys en el panel de Supabase (Authentication → Passkeys).
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // El flag experimental aún no está en los tipos de @supabase/ssr; se pasa por
  // un cast puntual para no romper el typecheck.
  const options = {
    auth: { experimental: { passkey: true } },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  );
}
