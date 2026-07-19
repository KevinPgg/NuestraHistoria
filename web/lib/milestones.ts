// Cartas de hitos (portadas de la v1). Cada hito se desbloquea al cumplir X
// meses desde el inicio de la relación. Algunos hitos tienen un minijuego que
// hace de "gate" divertido antes de leer la carta.

export type GameKind = "tostones" | "memory" | null;

export interface Milestone {
  monthsReq: number;
  label: string;
  title: string;
  content: string; // HTML confiable (nuestro), se renderiza con dangerouslySetInnerHTML
  game: GameKind;
}

// Inicio de la relación: 30 de mayo de 2025, mediodía.
export const START_DATE = new Date(2025, 4, 30, 12, 0, 0);

/** Meses completos transcurridos desde una fecha hasta hoy. */
export function getMonthsPassed(start: Date = START_DATE): number {
  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months--;
  return Math.max(0, months);
}

export const milestones: Milestone[] = [
  {
    monthsReq: 6,
    label: "0.6",
    title: "Nuestros primeros 6 meses",
    game: "tostones",
    content: `Parece que fue ayer,<br><br>Parece que fue ayer cuando paseamos todo el puerto santa como 3 veces, parece que fue ayer cuando cocinamos por primera vez, parece que fue ayer cuando nos dimos nuestro primer beso apasionado, parece que fue ayer cuando conocí a parte de tu linda familia, parece que fue ayer cuando comencé a enamorarme de tí, parece que fue ayer que nos descubriéramos el uno al otro. Amor mío parece que fue ayer que te amo más y más, parece que fue ayer cuando no sabía cuánto te amaría mañana. Gracias por todo Alejandra Navia, eres una mujer muy linda e interesante, me encanta tu alma, me encanta tu manera de ser y tu lindura, me encantan tus valores y que reflexiones sin tapujo sobre cosas de importancia, me encanta cómo al principio decías que no sueles hablar de cosas íntimas con nadie pero conmigo fue tan fácil, me encantas tú y solo tú, te adoro hermosa, linda, preciosa, novia mía.`,
  },
  {
    monthsReq: 12,
    label: "1.0",
    title: "Un año juntos",
    game: "memory",
    content: `Primero que todo y antes que nada felicidades a nosotros por haber llegado hasta aquí :3 . Un año de relación sana, un año de aprendizajes, caídas y levantadas, un año esclarecedor, en este año mi amor por ti ha evolucionado de una manera que no me esperaba y es una grata sorpresa, me he llegado a enamorar cada vez más de tus ojos, de tu cabello, de tu sonrisa, de tu carita recién despertada, de tu carita con sueño, de tu carita enojada, de tu carita triste. En este año he aprendido que <strong>te quiero</strong> en mi vida, <strong>te quiero</strong> hoy, <strong>te quiero</strong> mañana, <strong>te quiero</strong> en un mes, <strong>te quiero</strong> en un año, <strong>te quiero</strong> conmigo hasta que se acaben los años, contigo veo una vida juntos y me emociona.<br><br>Un año mi amor, un año de ti, un año de nosotros, gracias por estar conmigo y hacerme feliz.<br><br>--Con amor Kevin &lt;3--`,
  },
  {
    monthsReq: 18,
    label: "1.6",
    title: "Año y medio",
    game: null,
    content: `Seguimos sumando momentos...`,
  },
  {
    monthsReq: 24,
    label: "2.0",
    title: "Dos años",
    game: null,
    content: `Dos años de aventuras...`,
  },
  {
    monthsReq: 36,
    label: "3.0",
    title: "Tres años mágicos",
    game: null,
    content: `Tres años. Wow...`,
  },
  {
    monthsReq: 9999,
    label: "∞",
    title: "Hacia el infinito",
    game: null,
    content: `Y esto apenas comienza...`,
  },
];
