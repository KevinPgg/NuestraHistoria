# MEJORAS.md — Roadmap y mejoras pendientes

> Prioridades identificadas tras análisis del código. Actualizar a medida que se implementan.
> Última revisión: 2026-05-28 — sesión 2 (implementación de mejoras #1–5 y bugs B1–B3)

---

## ✅ Completadas

### ~~1. Separar datos de lógica en las cartas de hitos~~ ✅

Creado `base/letters.js`. `script.js` ahora importa `milestones` desde ahí y no define el array inline.

---

### ~~2. Crear los archivos faltantes del repo (`base/`, `model/`)~~ ✅

Los archivos ya existían en el repo local. Se creó el único faltante: `base/letters.js`.

---

### ~~3. Fijar versión de CDN de Lucide~~ ✅

`index.html` ahora usa `lucide@0.383.0/dist/umd/lucide.min.js` en vez de `@latest`.
Tailwind CDN (`cdn.tailwindcss.com`) no tiene URL versionada simple — pendiente migración a CLI.

---

### ~~4. Paginación "Mostrar más" en la galería~~ ✅

**Problema:** Todas las imágenes se cargan y renderizan de golpe. Con muchas fotos esto satura el DOM y la red.

**Solución acordada:**
- Renderizar solo las primeras **30 fotos** al cargar.
- Agregar `loading="lazy"` a cada `<img>` para diferir la descarga de las que están fuera del viewport.
- Al llegar al final del grid, mostrar un botón **"Mostrar más"** (no scroll infinito) que carga el siguiente bloque de 30.
- El botón desaparece cuando se han mostrado todas las fotos.

```js
const PAGE_SIZE = 30;
let currentPage = 0;

const loadMore = () => {
  const batch = allFilteredCards.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  renderBatch(batch);           // añade al grid, no reemplaza
  currentPage++;
  if (currentPage * PAGE_SIZE >= allFilteredCards.length) hideLoadMoreBtn();
};
```

Al aplicar un filtro nuevo: resetear `currentPage = 0` y re-renderizar desde cero.

**Estado:** ✅ Implementado en `script.js` y `index.html`. El botón muestra cuántas fotos quedan.

---

## 🟡 Pendientes — Media prioridad

### ~~5. Botón "Momento Random" junto al filtro~~ ✅

**Descripción:** Agregar un botón al lado del toggle de filtros que seleccione y abra una foto aleatoria del conjunto actual (respetando el filtro activo si hay uno).

**Comportamiento:**
- Ícono: símbolo de dado o shuffle (Lucide: `shuffle` o `dice-5`). El ícono puede rotarse al azar entre varios en cada click para hacerlo más dinámico.
- Al hacer clic: elige un índice aleatorio de `allFilteredCards` y llama a `openPhotoModal(card)` directamente.
- No navega a otra página ni hace scroll — el modal se abre sobre lo que sea que se esté viendo.

**HTML propuesto (junto a `photo-filter-toggle`):**
```html
<button id="random-photo-btn" class="photo-filter-toggle" type="button">
  <i data-lucide="shuffle" class="w-4 h-4"></i>
  <span>Momento Random</span>
</button>
```

```js
document.getElementById('random-photo-btn').addEventListener('click', () => {
  const pool = activeFilter === 'all' ? allCards : allCards.filter(matchesFilter);
  if (!pool.length) return;
  const card = pool[Math.floor(Math.random() * pool.length)];
  openPhotoModal(card);
});
```

**Nota:** Usar `Math.random()` aquí (no el shuffle seeded) para que cada click sea verdaderamente aleatorio.

**Estado:** ✅ Implementado. Botón en `index.html`, lógica en `script.js`, estilos en `style.css`.

---

### 6. Reemplazar emojis de la lluvia con figuras CSS o logos conmemorativos

**Problema:** La lluvia de fondo usa emojis (`❤️`, `💖`, `💌`…) renderizados como texto. El look es genérico y no personalizado.

**Solución propuesta:** Reemplazar por elementos visuales más únicos — figuras CSS puras o SVGs conmemorativos (iniciales, siluetas, fechas significativas). El contenido exacto se define más adelante.

**Punto de extensión en el código:**
```js
// script.js — función startFallingElements()
// Actualmente:
const symbols = ['❤️', '💖', '💌', '💕', '📸', '✨'];

// Reemplazar por función que crea elementos SVG/CSS en vez de texto:
const createFallingEl = () => {
  const el = document.createElement('div');
  el.classList.add('falling-item', 'falling-shape');
  el.innerHTML = getRandomShape(); // devuelve SVG inline o div con clase CSS
  return el;
};
```

**Ideas para `getRandomShape()`** (pendiente de definir):
- Siluetas CSS de corazón con `border-radius` trick
- SVG inline de las iniciales "K" y "A" entrelazadas
- Fecha de inicio (`30·05·25`) como texto estilizado
- Pequeños polaroids CSS con color de fondo aleatorio
- **Dejar como `TODO` en el código hasta tener diseño definitivo**

**Impacto:** Solo afecta `script.js` (función `startFallingElements`) y `style.css` (clase `.falling-shape`). No toca la lógica de negocio.

---

### 7. Separar el contenido de `questions.js` a un archivo de datos

**Problema:** Las preguntas del lock screen están en `base/questions.js` pero el README no las documenta claramente. Si se quieren agregar preguntas hay que saber dónde.

**Mejora:** Documentar en README cómo agregar preguntas nuevas al lock screen.

---

### 8. Paginación o virtualización en la galería (supersedida por mejora #4)

**Problema:** Si hay muchas fotos (>50), el DOM se llena de nodos y el scroll puede volverse lento.

**Solución simple:** Renderizar de a N fotos y cargar más al hacer scroll (Intersection Observer).

```js
// Ejemplo básico con IntersectionObserver
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) loadNextBatch();
});
observer.observe(sentinel); // sentinel = div vacío al final del grid
```

---

### 7. Estado del filtro persistente en URL o localStorage

**Problema:** Al recargar la página, el filtro activo se pierde.

**Solución:** Guardar el filtro en `sessionStorage` o en los query params de la URL:
```
https://KevinPgg.github.io/?filter=month&value=2026-05
```

---

### 8. Animación de transición al filtrar fotos

**Problema:** Al cambiar el filtro, la galería se re-renderiza de golpe (sin transición).

**Mejora:** Agregar una fade-out antes y fade-in después del render:
```js
galleryContainer.style.opacity = '0';
setTimeout(() => {
  renderGallery(filtered);
  galleryContainer.style.opacity = '1';
}, 200);
```

---

### 9. Botón de compartir / copiar enlace directo a una carta

**Mejora:** Agregar un botón en el modal de carta que copie el URL con el hito como hash:
```
https://KevinPgg.github.io/#hito-6
```
Así se puede reabrir directamente en la carta correcta.

---

### 10. Mensaje vacío en la galería cuando no hay fotos que coincidan con el filtro

**Problema:** Si el filtro no devuelve resultados, el grid queda en blanco sin explicación.

**Mejora:**
```js
if (cards.length === 0) {
  galleryContainer.innerHTML = '<p class="text-center text-gray-400 col-span-full py-12">No hay fotos para este período 🌸</p>';
}
```

---

## 🟢 Baja prioridad (nice-to-have)

### 11. Modo oscuro

El fondo rosado es deliberado pero podría haber un toggle opcional. Baja prioridad porque el tema visual es parte del concepto.

---

### 12. Swipe en el modal de fotos (mobile)

En mobile, permitir deslizar entre fotos sin cerrar el modal. Requiere:
- Mantener un índice de la foto actual
- Añadir listeners de `touchstart`/`touchend` o usar la API de Pointer Events

---

### 13. Contador de días/meses en tiempo real en el header

**Mejora de UX:** Mostrar algo como:
```
"Llevamos 366 días juntos 💖"
```
actualizado en tiempo real (o al cargar). Solo requiere una función de diff de fechas similar a `getMonthsPassed`.

---

### 14. Preload de la imagen del modal de fotos

**Problema:** Al abrir el modal de foto, la imagen se carga en ese momento (puede haber un flash vacío).

**Mejora:** Precargar la imagen antes de mostrar el modal:
```js
const preload = new Image();
preload.onload = () => { /* mostrar modal */ };
preload.src = `img/${card.fotoFileName}`;
```

---

### 15. Service Worker / PWA

Hacer el sitio instalable como PWA y que funcione offline con las fotos ya cargadas. Requiere un `manifest.json` y un `service-worker.js` básico.

---

## 🐛 Bugs potenciales identificados

| # | Descripción | Archivo | Severidad |
|---|---|---|---|
| B1 | Si `base/photoDates.json` no existe, `loadCardRegistros()` lanza un error de fetch no manejado — la galería queda en blanco sin feedback al usuario | `base/cardRegistros.js` | Media |
| B2 | El filtro de "semana" usa el estándar ISO 8601 para semanas, que puede diferir de la semana calendario local en Año Nuevo | `script.js` → `getRangeForFilter` | Baja |
| B3 | `startFallingElements` usa `setInterval` sin `clearInterval`. Si el componente se re-monta (improbable en SPA de una página, pero posible en tests), los intervals se acumulan | `script.js` | Baja |
| B4 | En móviles con `hover: none`, el overlay de la foto siempre visible (esto está parcialmente corregido con `@media (hover: none)` en CSS, pero la imagen sigue haciendo zoom en `:hover` por especificidad de Tailwind) | `style.css` | Baja |

---

## 🐛 Bugs — estado actualizado

| # | Descripción | Estado |
|---|---|---|
| B1 | `loadCardRegistros()` sin try/catch | ✅ Ya resuelto en `base/cardRegistros.js` original |
| B2 | Semana ISO 8601 puede diferir en Año Nuevo | Pendiente — baja prioridad |
| B3 | `startFallingElements` acumulaba intervals | ✅ Resuelto — ahora usa `_fallingIntervals` como guard |
| B4 | Zoom de imagen en hover en mobile | Pendiente |

---

## Próxima sesión — sugerencias

1. **Mejora #6** — diseñar los shapes CSS/SVG para la lluvia de fondo (el `TODO` ya está marcado en `script.js`).
2. **Mejora #10** — mensaje vacío en galería (ya implementado con `#gallery-empty`).
3. **Mejoras #7 y #8** — filtro persistente en URL y transición al filtrar.
4. **Mejora #12** — swipe entre fotos en mobile (mayor complejidad).
