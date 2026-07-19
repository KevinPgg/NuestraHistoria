# CONTEXT.md — Nuestra Historia (KevinPgg.github.io)

> Documento de contexto técnico para sesiones de desarrollo futuras (humano o IA).
> Última actualización: 2026-05-28 — sesión 2 (refactor paginación, Momento Random, letters.js, Lucide pineado)

---

## ¿Qué es este proyecto?

Sitio web estático desplegado en GitHub Pages. Es una página personal y romántica con dos funciones principales:

1. **Timeline de hitos** — Cartas desbloqueables que aparecen al cumplir cierta cantidad de meses desde una fecha de inicio definida en el código.
2. **Galería de fotos** — Grid de imágenes con filtros por fecha (día/semana/mes/año), modal de detalle, snippets con censura opcional y shuffle seeded por día.

Acceso protegido por un **Lock Screen** con preguntas de opción múltiple antes de revelar el contenido.

---

## Stack tecnológico

| Capa | Tecnología | Fuente |
|---|---|---|
| Markup | HTML5 semántico | local |
| Estilos base | Tailwind CSS v3 (JIT) | CDN: `cdn.tailwindcss.com` |
| Estilos custom | Vanilla CSS (`style.css`) | local |
| Iconos | Lucide Icons | CDN: `unpkg.com/lucide@latest` |
| Fuentes | Dancing Script + Nunito | Google Fonts CDN |
| JS | ES Modules nativos (`type="module"`) | local |
| Deploy | GitHub Pages | rama `main` |
| Sin build step | No webpack, no bundler, no npm | — |

**Importante:** No hay proceso de build. Todo se ejecuta directamente en el navegador. Los cambios en `main` se despliegan automáticamente en ~1-2 minutos.

---

## Estructura de archivos

```
KevinPgg.github.io/
│
├── index.html              # Única página. Toda la UI está aquí.
├── style.css               # CSS global. Complementa a Tailwind.
├── script.js               # Lógica principal (ES Module, entry point)
│
├── base/
│   ├── cardRegistros.js    # ~60 fotos + loadCardRegistros() con try/catch
│   ├── questions.js        # ~15 preguntas reales del lock screen
│   ├── letters.js          # milestones[] — cartas de hitos (separado de script.js)
│   └── photoDates.json     # Generado por script Python. Fecha EXIF de cada foto.
│
├── model/
│   └── card.js             # Clase Card con static counter (id autoincrementado)
│
├── img/                    # Imágenes de la galería.
│
├── scripts/                # Herramientas dev local. No se despliegan.
│   ├── extract_metadata.py # Lee EXIF + crea photoDates.json + dateOverrides.json
│   ├── dateOverrides.json  # Fechas manuales para fotos sin EXIF confiable
│   └── requirements.txt    # Pillow (Python)
│
├── CONTEXT.md              # Contexto técnico para sesiones futuras
└── MEJORAS.md              # Roadmap con estado de implementación
```

> **Estado actual (2026-05-28, sesión 2):** Todos los archivos base existen. `base/letters.js` fue creado en esta sesión. `script.js` refactorizado con paginación, botón "Momento Random" y lazy loading. Lucide CDN pineado a `@0.383.0`.

---

## Flujo de datos de la galería

```
scripts/extract_metadata.py
    └── lee EXIF de img/*.jpg
    └── consulta dateOverrides.json
    └── escribe base/photoDates.json

base/cardRegistros.js
    └── photoData[]   (filename + descripcion — editado a mano)
    └── loadCardRegistros()
        ├── fetch('base/photoDates.json')
        └── mapea photoData + fechas → Card[]

script.js
    └── initGallery()
        ├── await loadCardRegistros()
        ├── shuffleArray(cards, hoyISO)   ← orden aleatorio pero estable por día
        └── renderGallery(cards)
```

---

## Lógica del Lock Screen

- Se muestra sobre todo el contenido (`z-index: 9999`).
- Lee preguntas de `base/questions.js` (array de objetos `{ pregunta, opciones[], correcta }`).
- Selecciona preguntas aleatoriamente sin repetir la anterior.
- Al acertar: animación de salida → activa la lluvia de emojis en el contenido principal.
- Al fallar: shake animation + nueva pregunta tras 1.4 s.
- Las respuestas **nunca se validan en servidor** — todo es client-side. La seguridad es por oscuridad.

---

## Lógica de los Hitos (Timeline)

```js
const startDate = new Date(2025, 4, 30, 12, 0, 0); // 30 mayo 2025

milestones = [
  { monthsReq: 6,    label: '0.6', ... },
  { monthsReq: 12,   label: '1.0', ... },
  { monthsReq: 18,   label: '1.6', ... },
  { monthsReq: 24,   label: '2.0', ... },
  { monthsReq: 36,   label: '3.0', ... },
  { monthsReq: 9999, label: '∞',   ... },
]
```

- `getMonthsPassed(startDate)` calcula meses completos transcurridos.
- Si `monthsPassed >= item.monthsReq` → tarjeta desbloqueada (clickeable, muestra carta).
- Si no → tarjeta bloqueada (ícono candado, pulse animation al clic).
- **El contenido de las cartas está hardcodeado en `script.js`** como template literals con HTML embebido.

---

## Sistema de censura de texto

En descripciones de fotos, el texto rodeado por `*asteriscos*` se renderiza censurado (blur):

```js
// cardRegistros.js
descripcion: 'Fuimos al mar. *Nos dimos un beso muy especial.*'
```

- CSS: `.censored { filter: blur(6px) }`
- Al hacer clic en el texto censurado: `.censored--revealed` elimina el blur.
- Al hacer clic en otro lugar o perder foco: se vuelve a censurar.

---

## Shuffle seeded de la galería

El orden de las fotos es aleatorio pero **determinístico por día**. Así la galería no cambia de orden en cada refresh pero sí al día siguiente.

```js
const seed = new Date().toISOString().split('T')[0]; // "2026-05-28"
allCards = shuffleArray(cardRegistros, seed);
```

Usa un PRNG basado en Mulberry32 — sin dependencias externas.

---

## Efectos visuales

- **Lluvia de emojis** (`startFallingElements(containerId)`): crea divs con clase `.falling-item` cada 400 ms y los elimina al terminar la animación CSS `fall`. Se ejecuta tanto en el lock screen como en el contenido principal.
- **Pulse glow** en tarjetas desbloqueadas: `animation: pulse-glow 2s infinite` en CSS.
- **Animación de entrada del modal**: `animation: slideIn 0.4s ease-out`.

---

## Dependencias externas (CDN)

Todas son CDN sin versión fija (excepto Three.js en otro contexto). Riesgo: un cambio de versión en CDN podría romper el sitio.

| Librería | URL CDN |
|---|---|
| Tailwind CSS | `https://cdn.tailwindcss.com` |
| Lucide Icons | `https://unpkg.com/lucide@latest` |
| Google Fonts | `https://fonts.googleapis.com` |

---

## Variables de configuración (editables)

Todas en `script.js`, cerca de la línea 120:

| Variable | Propósito |
|---|---|
| `startDate` | Fecha de inicio de la relación |
| `milestones[]` | Hitos, meses requeridos, títulos y contenido de cartas |

En `base/questions.js`:
| Variable | Propósito |
|---|---|
| `questions[]` | Preguntas del lock screen |

---

## Galería — paginación

La galería renderiza las fotos en bloques de `PAGE_SIZE = 30`. Al cargar o cambiar filtro:
1. Se calcula `allFilteredCards` (el array filtrado completo).
2. Se renderiza solo el primer bloque de 30 con `loadPage()`.
3. Si quedan fotos, aparece el botón `#load-more-btn` con el count de restantes.
4. Cada clic en "Mostrar más" renderiza el siguiente bloque y actualiza el botón.
5. Al cambiar filtro, `currentPage` se resetea a 0 y el contenedor se limpia.

Todas las `<img>` tienen `loading="lazy"` para diferir la descarga hasta el viewport.

## Botón "Momento Random"

`#random-photo-btn` en `index.html`. Al hacer clic elige una card aleatoria de `allFilteredCards` (si hay filtro activo) o de `allCards` (si no hay filtro). Usa `Math.random()` real, no el shuffle seeded.

## Limitaciones conocidas

1. **Sin backend** — las fotos deben estar en el repositorio o en un CDN externo.
2. **Seguridad del lock screen** — cualquiera que abra DevTools puede saltar la protección.
3. **Tailwind CDN sin version lock** — `cdn.tailwindcss.com` no tiene URL versionada simple. Lucide ya está pineado a `@0.383.0`.
4. **`milestones` de 1.0, 1.6, 2.0, 3.0, ∞** — tienen contenido placeholder. Completar en `base/letters.js`.
