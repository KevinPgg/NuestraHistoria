# HISTÓRICO — Nuestra Historia (versión 1: sitio estático)

> Documento único de memoria de la **versión antigua**. La app actual (Next.js +
> Supabase) vive en `web/` y su documentación es `ESTADO-ACTUAL.md`,
> `PLANIFICACION-MIGRACION.md` y `README.md`.
>
> Todo el código de la v1 quedó archivado en `_legacy/` (recuperable también desde
> el historial de git). Este archivo consolida lo que antes estaba disperso en
> `CONTEXT.md`, `MEJORAS.md`, `ROADMAP-fondos.md` y `dinamicas cartas.md`
> (esos originales siguen íntegros en `_legacy/docs/`).

---

## 1. Qué era la v1

Sitio web **estático** desplegado en GitHub Pages (`KevinPgg.github.io`). Sin build,
sin backend, sin npm: HTML + CSS vanilla + ES Modules nativos servidos directo por
el navegador. Página personal y romántica con dos funciones:

1. **Timeline de hitos** — cartas desbloqueables al cumplir X meses desde una fecha
   de inicio (`startDate = 30 mayo 2025`, hardcodeada en `script.js`).
2. **Galería de fotos** — grid con filtros por día/semana/mes/año, modal de detalle,
   censura de texto con `*asteriscos*`, y shuffle *seeded por día* (orden estable
   dentro del día, cambia al siguiente).

Acceso protegido por un **Lock Screen** con preguntas de opción múltiple
(`base/questions.js`). Seguridad por oscuridad: todo client-side, saltable con DevTools.
Ésa fue una de las razones de migrar.

### Stack v1

| Capa | Tecnología |
|---|---|
| Markup | HTML5 (`index.html`, única página) |
| Estilos | Tailwind CDN v3 + CSS vanilla (`style.css`) |
| Iconos | Lucide `@0.383.0` (pineado) |
| JS | ES Modules nativos, sin bundler |
| Deploy | GitHub Pages, rama `main`, auto-deploy en ~1-2 min |

### Estructura v1 (hoy en `_legacy/`)

```
_legacy/
├── index.html              # Toda la UI
├── style.css               # CSS global + tema "Golden Hour"
├── script.js               # Lógica: hitos, galería, filtros, modales, efectos
├── base/
│   ├── cardRegistros.js    # photoData[] + loadCardRegistros()
│   ├── questions.js        # preguntas del lock screen
│   ├── letters.js          # milestones[] (cartas de hito)
│   ├── photoDates.json     # fechas EXIF generadas por script
│   ├── minijuego-tostones.js
│   └── minijuego-memory.js
├── model/card.js           # clase Card (id autoincremental)
├── iconos-svg/             # 17 SVGs (usados por Memory Cards y la lluvia)
├── scripts/                # tooling Python de la v1
│   ├── extract_metadata.py # lee EXIF → base/photoDates.json + dateOverrides.json
│   ├── import_photos.py    # importa fotos nuevas a img/ + base/ desde un manifiesto
│   ├── dateOverrides.json  # fechas manuales para fotos sin EXIF confiable
│   └── revisado.md         # manifiesto foto→fecha→descripción
└── docs/                   # CONTEXT.md, MEJORAS.md, ROADMAP-fondos.md, dinamicas cartas.md
```

Los **originales** (`img/`, 122 fotos) se sacaron del repo a `_originales-backup/`
(gitignored). Se conservan en Supabase como WebP; los originales deben respaldarse
en Drive y borrarse del disco cuando se confirme el respaldo.

---

## 2. Lógica clave que vale recordar

- **Fecha mostrada de una foto** = la MÁS ANTIGUA entre `fechaCreacion` y
  `fechaUltimaModificacion` (`pickOldestDate`). Evita que fotos transferidas desde
  el celular muestren la fecha de descarga. Esta regla se preservó en la migración
  (ver `supabase/migrate.mjs`).
- **Censura de texto**: `*texto*` → blur CSS (`.censored`), se revela al clic.
- **Shuffle seeded**: PRNG Mulberry32 con seed = fecha ISO del día. Sin dependencias.
- **Lock screen**: preguntas aleatorias sin repetir la anterior; validación 100%
  client-side (por eso NO era seguridad real).

---

## 3. Minijuegos para desbloquear cartas — GUARDADOS con plan de mejora

Concepto v1: antes de leer una carta de hito, completar una dinámica interactiva.
Código en `_legacy/base/minijuego-*.js`; spec completa en
`_legacy/docs/dinamicas cartas.md`.

| Dinámica | Estado v1 | Detalle |
|---|---|---|
| 🍳 Tostones | ✅ Implementado (carta 12 meses) | Toca los tostones cuando estén dorados. Grilla 3×3, 6/10 para ganar. Modal autoinyectado, `click`+`touchstart`. Módulo `startTostonesGame(onWin)`. |
| 🃏 Memory Cards | ✅ Implementado | Grid de pares con los SVGs de `iconos-svg/`. Al completar todos los pares → abre la carta. |
| ❓ Quiz por carta | ⏳ Pendiente | Pregunta por hito; campo `quiz:{pregunta,opciones,correcta}` en `milestones`. |

### Plan de mejora (portar a la v2 Next.js)
- **No reusar el JS tal cual.** Los minijuegos v1 inyectan su propio modal y
  manipulan el DOM directo; en React eso se reescribe como componentes con estado
  (`useState`) y el `onWin` como callback/prop.
- Modelo sugerido: un componente `<UnlockGame tipo="tostones|memory|quiz" onWin={...}>`
  que envuelve la apertura de la carta/foto. La lógica de juego (fases del tostón,
  emparejado de memory) se puede portar casi 1:1; lo que cambia es el render.
- Los assets (`iconos-svg/`) sí se reutilizan directo.
- Prioridad baja: son *nice-to-have*. Primero el núcleo social (foto individual,
  likes, comentarios). Ver cola en `ESTADO-ACTUAL.md`.

---

## 4. Roadmap visual de la v1 (fondos y temas) — referencia

De `_legacy/docs/ROADMAP-fondos.md`. Ideas reutilizables como inspiración de UI en la v2:

- **Fase 1 — Golden Hour** (hecho en v1): tema 100% CSS, gradiente durazno→rosa→lavanda,
  capa `#ambient-bg` con bokeh y rayos, halo/sheen en cards. Respeta
  `prefers-reduced-motion`.
- **Fase 2 — Parpark parallax** (pendiente): escena con profundidad al hacer scroll.
- **Fase 3 — Selector de temas**: cada tema = set de variables CSS (fiesta, chill,
  romance, etc.). En la v2 esto encaja bien con Tailwind + CSS vars.

---

## 5. Mejoras/bugs pendientes de la v1 (mayormente superados por la v2)

De `_legacy/docs/MEJORAS.md`. La mayoría dejaron de aplicar al migrar (la galería,
paginación y filtros se rehacen en Next.js). Lo que sigue teniendo valor conceptual:

- Contador "llevamos N días juntos" en el header (UX simple, portable).
- Swipe entre fotos en el modal (mobile) — relevante para la vista de foto individual v2.
- Mensaje de estado vacío en la galería.
- Preload de la imagen del modal para evitar flash.

Los bugs v1 (semana ISO en Año Nuevo, zoom en hover mobile, intervals de la lluvia)
son específicos del código estático y no se arrastran a la v2.

---

## 6. Por qué se migró

1. **Seguridad real**: el lock screen era saltable con DevTools. La v2 usa Auth de
   Supabase + RLS: sin sesión válida no se ve *nada*, aunque tengas la URL.
2. **Sin backend**: las fotos vivían en el repo (público) o había que meterlas a mano.
   La v2 separa metadatos (Postgres) de archivos (bucket privado, firmados).
3. **Interacción**: likes, comentarios, momentos y música no caben en un sitio estático
   sin base de datos.
4. **Privacidad de las fotos**: dejaron de estar versionadas en un repo; ahora son
   WebP en un bucket privado con URLs firmadas.
