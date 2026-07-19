// Sección "Cartas": hitos de la relación que se abren con el tiempo (algunos con
// minijuego). Tema Golden Hour, con barra inferior de navegación.
import { milestones, getMonthsPassed } from "@/lib/milestones";
import { CartasBoard } from "@/components/CartasBoard";
import { TabBar } from "@/components/TabBar";
import { getGamePhotos } from "@/lib/media";

export const dynamic = "force-dynamic";

const GOLDEN =
  "linear-gradient(180deg,#ffe7c6 0%,#ffd8c6 10%,#fccdd2 32%,#f8c2d5 60%,#f3acce 100%)";

export default async function CartasPage() {
  const monthsPassed = getMonthsPassed();

  // Fotos para el pool del minijuego Memory. Si algo falla, degrada a solo iconos.
  let gamePhotos: string[] = [];
  try {
    gamePhotos = await getGamePhotos();
  } catch {
    gamePhotos = [];
  }

  return (
    <div className="relative min-h-screen pb-24 text-stone-800">
      <div className="fixed inset-0 -z-10" style={{ background: GOLDEN }} />

      <header className="sticky top-0 z-10 border-b border-white/40 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <h1 className="text-lg font-semibold text-stone-800">Cartas</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="mb-5 text-sm text-stone-600">
          Cartas que se abren con el tiempo. Algunas piden un jueguito antes 😏
        </p>
        <CartasBoard
          milestones={milestones}
          monthsPassed={monthsPassed}
          gamePhotos={gamePhotos}
        />
      </main>

      <TabBar />
    </div>
  );
}
