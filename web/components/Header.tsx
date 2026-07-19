// Barra superior con identidad del usuario en sesión.
import { getCurrentProfile } from "@/lib/profile";
import { LogoutButton } from "./LogoutButton";

// Color de acento por rol, para distinguir visualmente quién está dentro.
const ACCENT: Record<string, string> = {
  novio: "bg-sky-500/20 text-sky-300 border-sky-400/30",
  novia: "bg-pink-500/20 text-pink-300 border-pink-400/30",
};

export async function Header() {
  const profile = await getCurrentProfile();
  const nombre = profile?.nombre ?? profile?.email?.split("@")[0] ?? "Invitado";
  const rol = profile?.rol ?? undefined;
  const accent = rol ? ACCENT[rol] : "bg-white/10 text-white/60 border-white/20";
  const inicial = (nombre[0] ?? "?").toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <span className="text-base font-semibold">Nuestra Historia</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${accent}`}
            >
              {inicial}
            </span>
            <div className="leading-tight">
              <p className="text-sm">{nombre}</p>
              {rol && <p className="text-[11px] capitalize text-white/40">{rol}</p>}
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
