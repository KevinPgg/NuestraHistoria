// ══════════════════════════════════════════════════════════════
//  CARTAS DE HITOS
//  Cada objeto = un milestone temporal de la relación.
//
//  Campos:
//    monthsReq → meses completos desde startDate para desbloquear
//    label     → texto del botón en el grid (ej: '0.6', '1.0', '∞')
//    title     → título del modal al abrir la carta
//    content   → HTML de la carta (soporta <br>, <b>, <em>, etc.)
// ══════════════════════════════════════════════════════════════

export const milestones = [
    {
        monthsReq: 6,
        label: '0.6',
        title: 'Nuestros primeros 6 meses',
        content: `Parece que fue ayer,<br><br>Parece que fue ayer cuando paseamos todo el puerto santa como 3 veces,
                    parece que fue ayer cuando cocinamos por primera vez,
                    parece que fue ayer cuando nos dimos nuestro primer beso apasionado,
                    parece que fue ayer cuando conoci a parte de tu linda familia,
                    parece que fue ayer cuando comencé a enamorarme de tí,
                    parece que fue ayer que nos descubrieramos el uno al otro.
                    amor mío parece que fue ayer que te amo más y más, parece que fue ayer cuando no sabía cuanto te amaría mañana.
                    Gracias por todo Alejandra Navia, eres una mujer muy linda e intersante, me encanta tu cuerpo, me encanta tu alma,
                    me encanta tu manera de ser y tu lindura, me encantan tus valores y que reflexiones sin tapujo sobre cosas de importancia,
                    me encanta como al principio decías que no sueles hablar de cosas intimas con nadie pero conmigo fue tan fácil,
                    me encantas tú y solo tú, te adoro mi cachetona/sapa/rata/ratita/chiquistriquis/, hermosa, linda, preciosa, novia mía.`
    },
    {
        monthsReq: 12,
        label: '1.0',
        title: 'Un año juntos',
        content: `Primero que todo y antes que nada felicidades a nosotros por haber llegado hasta aquí :3 .
                    Un año de relación sana, un año de aprendizajes, caidas y levantadas, un año esclarecedor,
                    en este año mi amor por ti ha evolucionado de una manera que no me esperaba y es una grata sorpresa,
                    me he llegado a enamorar cada vez más de tus ojos, de tu cabello, de tu sonrisa, de tu carita recien despertada, de tu carita con sueño,
                    de tu carita enojada, de tu carita triste, de tu carita llorosa, tu llanto es único mi amor cuando te veo así solo quiero calmarte y traerte paz
                    pese a que no lo demuestre tanto o al 100%. En este año he aprendido que <strong>te quiero</strong> en mi vida, <strong>te quiero</strong> hoy, <strong>te quiero</strong> mañana, <strong>te quiero</strong> en un mes, <strong>te quiero</strong> en un año,
                    <strong>te quiero</strong> conmigo hasta que se acaben los años, contigo veo una vida juntos y me emociona.
                    <br><br>
                    No sabría como decirle al kevin que se asustó cuando pensó que lo invitabas a una reunión familiar y te hizo llorar, que ahora disfrutamos la convivencia con tu familia,
                    que le cae super bien tu tío pablo, tu mami tan acogedora y tu hermana burlona, que superó su trauma del arroz con pollo con la receta de tu abuela,
                    no sabría decirle que espera convivir con tu papa para conocerlo mejor y darle las gracias por traerte al mundo,
                    no sabría como decirle que quiere prepararte toda la comida rica que exista en el mundo para verte feliz.
                    Un año mi amor, un año de ti, un año de nosotros, gracias por estar conmigo y hacerme feliz.
                    <br><br>
                    --Con amor Kevin <3--`
    },
    {
        monthsReq: 18,
        label: '1.6',
        title: 'Año y medio',
        content: `Seguimos sumando momentos...`
    },
    {
        monthsReq: 24,
        label: '2.0',
        title: 'Dos Años',
        content: `Dos años de aventuras...`
    },
    {
        monthsReq: 36,
        label: '3.0',
        title: 'Tres Años Mágicos',
        content: `Tres años. Wow...`
    },
    {
        monthsReq: 9999,
        label: '∞',
        title: 'Hacia el infinito',
        content: `Y esto apenas comienza...`
    }
];
