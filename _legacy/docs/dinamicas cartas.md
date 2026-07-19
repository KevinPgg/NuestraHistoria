# Dinámicas para Desbloquear Cartas

Antes de poder leer una carta, el usuario debe completar una dinámica corta e interactiva.
Cada carta puede tener su propia dinámica o compartir una según su mes.

---

## 1. 🍳 Minijuego Tostones *(implementado — carta 12 meses)*

**Concepto:** Aparecen tostones en una sartén virtual. Hay que tocarlos exactamente cuando estén **dorados** (ni crudos, ni quemados).

**Mecánica:**
- 10 tostones en total, necesitas freír bien 6 para ganar.
- Máximo 3 tostones activos al mismo tiempo en la sartén (grilla 3×3).
- Cada tostón pasa por 4 fases: crudo → cocinando → **¡AHORA! (dorado)** → quemado.
- Si tocas en la fase dorada: ✓ éxito.
- Si tocas en otra fase: rebote visual, sin penalización.
- Si se quema sin tocarlo: cuenta como fallido.
- Al ganar: se abre la carta con animación.
- Al perder: botón de reintentar.

**Técnico:**
- Módulo `base/minijuego-tostones.js` — exporta `startTostonesGame(onWin)`.
- Inyecta su propio modal dinámicamente (no depende del HTML).
- Funciona con `click` y `touchstart` (mobile-first).
- Grilla de 9 slots (3×3) para evitar solapamiento de tostones.
- Se activa solo para el hito `monthsReq: 12` en `script.js`.

---

## 2. ❓ Quiz por Carta *(pendiente)*

**Concepto:** Cada hito tiene una pregunta personalizada sobre ese periodo específico de la relación. Si contestas bien, se abre la carta.

**Ideas de implementación:**
- Agregar un campo `quiz: { pregunta, opciones, correcta }` en cada objeto de `milestones` en `base/letters.js`.
- Reutilizar el patrón del lock screen (ya existente en `script.js`).
- Mostrar el quiz en un modal intermedio antes de abrir el modal de la carta.
- 1 intento incorrecto → pregunta diferente o mensaje de pista.

**Ventaja:** Mínimo código nuevo, máxima personalización por carta.

---

## 3. 🃏 Memory Cards *(pendiente)*

**Concepto:** Grid de tarjetas boca abajo con los iconos SVG del proyecto (carpeta `iconos-svg/`). Encuentra todos los pares para desbloquear la carta.

**Ideas de implementación:**
- Usar los SVGs o fotos existentes como imágenes en las tarjetas.
- Grid de 4×4 (8 pares) o 3×4 (6 pares) según dificultad deseada.
- Flip animation en CSS puro (`transform: rotateY(180deg)`).
- Al completar todos los pares → carta se abre.
- Opcional: mostrar el mensaje de cada icono al emparejarlo (de `_iconMessages` en `script.js`).

**Consideración mobile:** Grilla de 3×4 es más cómoda que 4×4 en pantallas pequeñas.

---

## Estado

| Dinámica         | Carta       | Estado       |
|-----------------|-------------|--------------|
| Tostones        | 12 meses    | ✅ Implementado |
| Quiz por carta  | Por definir | ⏳ Pendiente  |
| Memory cards    | Por definir | ✅ Implementado  |
