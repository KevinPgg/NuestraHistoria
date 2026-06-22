# Roadmap — Fondos, temas y "juego de luces"

Documento para abordar por partes la evolución visual del sitio. Trabajo local;
los commits los hace Kevin. Restricción base: **GitHub Pages estático** (sin build,
sin backend) → todo debe funcionar como archivos estáticos.

Principio de diseño acordado:
- **CSS** para el color general (gradientes, glows) → ligero, sin dependencias.
- **Recursos externos** (imágenes/SVG) solo para *más impacto visual* puntual
  (ej. la escena del parque en parallax). No abusar: cada asset suma peso y un
  punto de fallo.

---

## Fase 1 — Golden Hour (HECHO)

Tema "hora dorada" 100% CSS, cohesivo entre fondo principal y cards.

- `style.css`
  - `body`: gradiente Golden Hour (durazno → rosa → lavanda) con
    `background-attachment: fixed`.
  - `#ambient-bg`: capa ambiental con **bokeh** (círculos de luz flotando) y
    **rayos** diagonales. Animaciones `bokehFloat` / `rayDrift`.
    Respeta `prefers-reduced-motion`.
  - Cards abiertas (`.photo-modal-card`): degradado cálido, **halo** pulsante
    (`haloPulse`) y **destello** que recorre la card (`sheen`). Glow detrás de
    la foto en `.photo-modal-media`.
  - Miniaturas, badges, fecha y botones: paleta cálida coherente.
  - Lock screen con el mismo gradiente.
- `index.html`: se agregó `<div id="ambient-bg">`.

Notas:
- La "lluvia" existente (`#background-effects`, emojis + iconos SVG) se mantiene.
- Si en algún momento se ve recargado: bajar opacidad del bokeh o densidad de la lluvia.

---

## Fase 2 — Escena del parque en parallax (PENDIENTE)

Meta: al hacer scroll, mostrar una **escena de paz en un parque** (parejas,
niños jugando, picnic alrededor) con profundidad tipo parallax.

Enfoque propuesto (estático, compatible con GitHub Pages):
- Capas PNG/WebP con transparencia (cielo, árboles lejanos, suelo/figuras
  cercanas) movidas a distinta velocidad con `transform: translateY()` según
  `scroll`, o con `background-attachment: fixed` / CSS `@scroll-timeline` donde
  haya soporte.
- Alternativa sin imágenes: escena ilustrada en **SVG** (siluetas) + parallax CSS.
  Más liviano y nítido, menos "fotográfico".
- Cuidar: peso de los assets (comprimir WebP), `loading="lazy"`, y rendimiento en
  móvil (usar `will-change`/`transform`, evitar repaints caros).

Decisiones a tomar antes de implementar:
- ¿Ilustración SVG (recomendado por peso) o imágenes raster?
- ¿Parallax en toda la página o solo en una sección "hero"?
- Origen de los recursos (banco gratuito con licencia, o ilustración a medida).

---

## Fase 3 — Selector de temas / fondos (PENDIENTE)

Permitir cambiar entre varias temáticas. Cada tema = un set de variables CSS
(colores, glow, partículas que caen). Arquitectura sugerida:
- Definir cada tema como una clase en `<body>` (ej. `body.tema-golden`) que
  sobrescribe variables CSS (`--bg`, `--glow`, `--accent`, etc.).
- Un control (botón/menú) que cambia la clase y guarda preferencia.
  > Nota: los artifacts de Claude no permiten `localStorage`, pero **este sitio sí**
  > puede usarlo para recordar el tema elegido.
- Refactor previo recomendado: mover colores cálidos actuales a variables CSS
  para que cada tema solo cambie esas variables.

Temas planeados (definir paleta + partículas + "mood" de cada uno):

| Tema       | Idea de paleta / mood                        | Partículas sugeridas        |
|------------|----------------------------------------------|-----------------------------|
| fiesta     | neón/confeti, alto contraste                 | confeti, serpentinas        |
| chill      | tonos fríos suaves, lo-fi                    | partículas lentas, ondas    |
| shopping   | pastel comercial, brillante                  | bolsas, etiquetas           |
| comida     | cálidos apetitosos (mostaza, tomate)         | íconos de comida            |
| romance    | rosas/rojos, velas                           | corazones, pétalos          |
| funny      | colores pop, caricaturesco                   | emojis, estrellas           |
| romantic   | (variante suave de romance)                  | pétalos, destellos          |
| kinky      | oscuro/burdeos, luces tenues                 | discreto (definir)          |
| heartful   | cálido emotivo, dorado                       | corazones suaves            |

Pendiente: unificar `romance`/`romantic` o diferenciarlos claramente.

---

## Orden sugerido de trabajo
1. Pulir Fase 1 según feedback (intensidad de luces).
2. Refactor a variables CSS (prepara Fase 3).
3. Fase 2 parallax (decidir SVG vs imágenes).
4. Fase 3 selector de temas, agregando temáticas una por una.
