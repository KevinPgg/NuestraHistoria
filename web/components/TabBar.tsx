"use client";
// Barra inferior de navegación (tipo dock). Oscura translúcida para funcionar
// igual sobre el feed oscuro y las secciones cálidas.
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/feed", label: "Inicio", icon: HomeIcon },
  { href: "/pareja", label: "Pareja", icon: HeartIcon },
  { href: "/cartas", label: "Cartas", icon: MailIcon },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/60 backdrop-blur-lg">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition ${
                active ? "text-rose-400" : "text-white/50 hover:text-white/80"
              }`}
            >
              <Icon filled={active} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-6 w-6 ${filled ? "fill-current" : "fill-none stroke-current"}`} strokeWidth={2}>
      <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-6 w-6 ${filled ? "fill-current" : "fill-none stroke-current"}`} strokeWidth={2}>
      <path d="M12 21s-7.5-4.9-9.7-9.2C.9 8.9 2.2 5.5 5.4 5.1c1.9-.2 3.6.9 4.6 2.3.9-1.4 2.6-2.5 4.6-2.3 3.2.4 4.5 3.8 3.1 6.7C19.5 16.1 12 21 12 21z" />
    </svg>
  );
}
function MailIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-6 w-6 ${filled ? "fill-current" : "fill-none stroke-current"}`} strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" className={filled ? "stroke-white/80" : ""} fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}
