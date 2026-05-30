/**
 * Minijuego: Memory Cards 🃏
 * ──────────────────────────
 * Pool combinado: iconos SVG + fotos del proyecto.
 * Cada partida toma 10 elementos al azar → siempre diferente.
 * Encuentra todos los pares para desbloquear la carta de 6 meses.
 *
 * Exporta: startMemoryGame(onWin)
 */

import { loadCardRegistros } from './cardRegistros.js';

// Todos los iconos SVG disponibles
const ALL_SVGS = [
    'ramen', 'cafe', 'corazon', 'fuego', 'arbol-navidad',
    'chile', 'globo-nieve', 'disco', 'bitcoin', 'amanecer',
    'bola-billar-8', 'calendario-31', 'chile-2', 'mosca',
    'notas-musicales', 'persona-poncho',
];

const TOTAL_PAIRS = 10; // 10 pares → 20 cartas

// ─────────────────────────────────────────────────
// Construir pool combinado y elegir 10 al azar
// ─────────────────────────────────────────────────

async function buildPool() {
    const registros = await loadCardRegistros();

    const svgItems = ALL_SVGS.map(icon => ({
        id:   `svg__${icon}`,
        src:  `iconos-svg/${icon}.svg`,
        type: 'svg',
    }));

    const photoItems = registros.map(card => ({
        id:   `photo__${card.fotoFileName}`,
        src:  `img/${card.fotoFileName}`,
        type: 'photo',
    }));

    // Mezclar todo y tomar los primeros TOTAL_PAIRS
    return _shuffle([...svgItems, ...photoItems]).slice(0, TOTAL_PAIRS);
}

// ─────────────────────────────────────────────────
export function startMemoryGame(onWin) {
    const modal = _buildModal();
    document.body.appendChild(modal);

    const gridEl   = modal.querySelector('#mc-grid');
    const statusEl = modal.querySelector('#mc-status');
    const resultEl = modal.querySelector('#mc-result');
    const openBtn  = modal.querySelector('#mc-open-letter');
    const retryBtn = modal.querySelector('#mc-retry');
    const closeBtn = modal.querySelector('#mc-close');

    let firstCard    = null;
    let secondCard   = null;
    let lockBoard    = false;
    let matchedPairs = 0;
    let currentPool  = [];

    // ── Helpers ──────────────────────────────────

    function updateStatus() {
        statusEl.textContent = `${matchedPairs} / ${TOTAL_PAIRS} pares encontrados`;
    }

    // ── Construcción del grid ─────────────────────

    function buildCards(pool) {
        // Crear pares: cada item duplicado y mezclado
        const pairs = _shuffle([...pool, ...pool]);
        gridEl.innerHTML = '';

        pairs.forEach((item) => {
            const card = document.createElement('div');
            card.className  = 'mc-card';
            card.dataset.id = item.id;
            card.dataset.type = item.type;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', 'Carta boca abajo');

            card.innerHTML = `
                <div class="mc-card-inner">
                    <div class="mc-face mc-face-front" aria-hidden="true">
                        <span class="mc-front-deco">💌</span>
                    </div>
                    <div class="mc-face mc-face-back">
                        <img
                            src="${item.src}"
                            alt=""
                            class="mc-icon-img"
                            draggable="false"
                            loading="lazy"
                        />
                    </div>
                </div>`;

            card.addEventListener('click', () => handleFlip(card));
            card.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleFlip(card);
            }, { passive: false });

            gridEl.appendChild(card);
        });
    }

    // ── Lógica del juego ──────────────────────────

    function handleFlip(card) {
        if (lockBoard)                                           return;
        if (card === firstCard)                                  return;
        if (card.classList.contains('mc-matched'))               return;
        if (card.classList.contains('mc-flipped') && !firstCard) return;

        card.classList.add('mc-flipped');
        card.setAttribute('aria-label', card.dataset.id);

        if (!firstCard) {
            firstCard = card;
            return;
        }

        secondCard = card;
        lockBoard  = true;
        checkMatch();
    }

    function checkMatch() {
        const isMatch = firstCard.dataset.id === secondCard.dataset.id;

        if (isMatch) {
            setTimeout(() => {
                [firstCard, secondCard].forEach(card => {
                    card.classList.add('mc-matched');
                    const inner = card.querySelector('.mc-card-inner');
                    const front = card.querySelector('.mc-face-front');
                    const back  = card.querySelector('.mc-face-back');

                    // Cancelar animación CSS (si la hay) y forzar reflow
                    inner.style.animation   = 'none';
                    inner.style.transition  = 'none';
                    void inner.offsetHeight; // flush

                    // Fijar la posición rotada sin posibilidad de override
                    inner.style.setProperty('transform', 'rotateY(180deg)', 'important');

                    // Backup: controlar visibilidad de caras directamente
                    front.style.setProperty('visibility', 'hidden', 'important');
                    back.style.setProperty('backface-visibility', 'visible', 'important');
                    back.style.setProperty('-webkit-backface-visibility', 'visible', 'important');
                });
                resetSelection();
                matchedPairs++;
                updateStatus();
                if (matchedPairs >= TOTAL_PAIRS) endGame();
            }, 400);
        } else {
            setTimeout(() => {
                firstCard.classList.remove('mc-flipped');
                secondCard.classList.remove('mc-flipped');
                firstCard.setAttribute('aria-label',  'Carta boca abajo');
                secondCard.setAttribute('aria-label', 'Carta boca abajo');
                resetSelection();
            }, 950);
        }
    }

    function resetSelection() {
        firstCard  = null;
        secondCard = null;
        lockBoard  = false;
    }

    function endGame() {
        setTimeout(() => {
            resultEl.innerHTML = `
                <div class="mc-result-text mc-win">
                    ¡Todos los pares! 🎉
                    <span>Tu memoria es tan buena como tu sonrisa</span>
                </div>`;
            resultEl.classList.remove('hidden');
            openBtn.classList.remove('hidden');
        }, 400);
    }

    // ── Iniciar / Reiniciar ───────────────────────

    async function startGame(reusePool = false) {
        matchedPairs = 0;
        firstCard    = null;
        secondCard   = null;
        lockBoard    = false;
        resultEl.classList.add('hidden');
        openBtn.classList.add('hidden');
        updateStatus();

        // Mostrar estado de carga
        gridEl.innerHTML = '<p class="mc-loading">Preparando cartas... 🃏</p>';

        // Nuevo pool en primer arranque; reusar en reintentos para no cambiar las cartas
        if (!reusePool || currentPool.length === 0) {
            currentPool = await buildPool();
        }

        buildCards(currentPool);
    }

    // ── Eventos del modal ─────────────────────────

    closeBtn.addEventListener('click', () => modal.remove());

    // Reiniciar mezcla las cartas con el mismo pool (no regenera fotos)
    retryBtn.addEventListener('click', () => startGame(true));

    openBtn.addEventListener('click', () => {
        modal.remove();
        onWin();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    startGame();
}

// ─────────────────────────────────────────────────
// Helpers privados
// ─────────────────────────────────────────────────

function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function _buildModal() {
    const el = document.createElement('div');
    el.id = 'memory-modal';
    el.innerHTML = `
        <div id="mc-box" role="dialog" aria-modal="true" aria-label="Minijuego: Memory Cards">

            <button id="mc-close" aria-label="Cerrar minijuego">✕</button>

            <div id="mc-header">
                <p id="mc-title">🃏 Memory Cards</p>
                <p id="mc-subtitle">Encuentra los 10 pares para leer la carta</p>
                <p id="mc-status">0 / 10 pares encontrados</p>
            </div>

            <div id="mc-grid" aria-label="Tablero de cartas"></div>

            <div id="mc-result" class="hidden" aria-live="assertive"></div>

            <div id="mc-actions">
                <button id="mc-retry"       class="mc-btn mc-btn-secondary">Reiniciar 🔄</button>
                <button id="mc-open-letter" class="mc-btn mc-btn-primary hidden">Leer carta 💌</button>
            </div>
        </div>
    `;
    return el;
}
