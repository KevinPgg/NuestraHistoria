/**
 * Minijuego: Fríe los Tostones 🍳
 * ─────────────────────────────────
 * Aparecen tostones en la sartén. El jugador debe tocarlos
 * exactamente cuando estén DORADOS para fríelos bien.
 *
 * Exporta: startTostonesGame(onWin)
 *   onWin() se llama cuando el jugador completa la meta.
 */

const TOTAL_TOSTONES = 10;   // intentos totales
const NEED_PERFECT   = 6;    // cuántos perfectos para ganar
const SPAWN_MS       = 1300; // ms entre apariciones
const MAX_CONCURRENT = 3;    // máx tostones activos a la vez

// Duración de cada fase (ms)
const PHASE_MS = {
    raw:     900,
    cooking: 650,
    golden:  900,   // ventana para tocar
    burnt:   550,
};

// Posiciones de la grilla 3×3 (% del centro del tosston dentro del pan)
// 26/74 → separación 24% × 340px = 81.6px > 80px (sin colisión)
// esquina más lejana del tosston a ~168px del centro < 170px radio ✓
const GRID_COLS = [26, 50, 74];
const GRID_ROWS = [26, 50, 74];

// ─────────────────────────────────────────────────
export function startTostonesGame(onWin) {
    const modal = _buildModal();
    document.body.appendChild(modal);

    const panEl     = modal.querySelector('#tg-pan');
    const scoreEl   = modal.querySelector('#tg-score');
    const resultEl  = modal.querySelector('#tg-result');
    const retryBtn  = modal.querySelector('#tg-retry');
    const openBtn   = modal.querySelector('#tg-open-letter');
    const closeBtn  = modal.querySelector('#tg-close');

    let spawned  = 0;
    let perfect  = 0;
    let gameOver = false;
    let spawnTimer = null;

    // 9 slots de la grilla; true = ocupado
    const slots = Array(9).fill(false);

    // ── Helpers ──────────────────────────────────

    function updateScore() {
        scoreEl.textContent = `🍳 ${perfect} / ${NEED_PERFECT} tostones listos`;
    }

    function getFreeSlot() {
        const free = slots
            .map((used, i) => (used ? null : i))
            .filter(i => i !== null);
        if (!free.length) return -1;
        return free[Math.floor(Math.random() * free.length)];
    }

    function checkLoss() {
        if (gameOver) return;
        const remaining = panEl.querySelectorAll('.tg-tosston').length;
        if (spawned >= TOTAL_TOSTONES && remaining === 0) {
            endGame(false);
        }
    }

    // ── Spawn ─────────────────────────────────────

    function spawnTosston() {
        if (gameOver || spawned >= TOTAL_TOSTONES) return;
        const active = panEl.querySelectorAll('.tg-tosston').length;
        if (active >= MAX_CONCURRENT) return;

        const slotIdx = getFreeSlot();
        if (slotIdx < 0) return;

        slots[slotIdx] = true;
        spawned++;

        const col = slotIdx % 3;
        const row = Math.floor(slotIdx / 3);

        const el = document.createElement('div');
        el.className = 'tg-tosston tg-raw';
        el.style.left = GRID_COLS[col] + '%';
        el.style.top  = GRID_ROWS[row] + '%';
        panEl.appendChild(el);

        let phase   = 'raw';
        let clicked = false;
        let timer   = null;

        function remove() {
            slots[slotIdx] = false;
            el.remove();
        }

        function nextPhase() {
            if (clicked || gameOver) return;

            if (phase === 'raw') {
                phase = 'cooking';
                el.className = 'tg-tosston tg-cooking';
                timer = setTimeout(nextPhase, PHASE_MS.cooking);

            } else if (phase === 'cooking') {
                phase = 'golden';
                el.className = 'tg-tosston tg-golden';
                timer = setTimeout(nextPhase, PHASE_MS.golden);

            } else if (phase === 'golden') {
                // Se quemó — perdió la oportunidad
                phase = 'burnt';
                el.className = 'tg-tosston tg-burnt';
                timer = setTimeout(() => {
                    remove();
                    checkLoss();
                }, PHASE_MS.burnt);
            }
        }

        function handleTap(e) {
            e.preventDefault();
            e.stopPropagation();
            if (clicked || gameOver) return;

            if (phase === 'golden') {
                clicked = true;
                clearTimeout(timer);

                el.className = 'tg-tosston tg-done';
                _popEmoji(el, '✓');

                setTimeout(() => {
                    remove();
                    perfect++;
                    updateScore();
                    if (perfect >= NEED_PERFECT && !gameOver) {
                        endGame(true);
                    } else {
                        checkLoss();
                    }
                }, 380);

            } else {
                // Toque en fase incorrecta — feedback sin penalización
                el.classList.add('tg-wrong-tap');
                setTimeout(() => el.classList.remove('tg-wrong-tap'), 280);
            }
        }

        el.addEventListener('click',      handleTap);
        el.addEventListener('touchstart', handleTap, { passive: false });

        timer = setTimeout(nextPhase, PHASE_MS.raw);
    }

    // ── Fin de juego ──────────────────────────────

    function endGame(win) {
        if (gameOver) return;
        gameOver = true;
        clearInterval(spawnTimer);

        if (win) {
            resultEl.innerHTML = `
                <div class="tg-result-text tg-win">
                    Excelente amorcito
                    <span>Ahora ya puedes freirlos para mí 😏</span>
                </div>`;
            openBtn.classList.remove('hidden');
        } else {
            resultEl.innerHTML = `
                <div class="tg-result-text tg-lose">
                    mmmmm quemados como el ivan
                    <span>De nuevo chef ☝️😠</span>
                </div>`;
            retryBtn.classList.remove('hidden');
        }
        resultEl.classList.remove('hidden');
    }

    // ── Reiniciar ─────────────────────────────────

    function startGame() {
        spawned  = 0;
        perfect  = 0;
        gameOver = false;
        panEl.innerHTML = '';
        slots.fill(false);
        resultEl.classList.add('hidden');
        retryBtn.classList.add('hidden');
        openBtn.classList.add('hidden');
        updateScore();

        // Primer tostón inmediato, luego intervalos
        spawnTosston();
        spawnTimer = setInterval(() => {
            if (gameOver || spawned >= TOTAL_TOSTONES) {
                clearInterval(spawnTimer);
                return;
            }
            spawnTosston();
        }, SPAWN_MS);
    }

    // ── Eventos del modal ─────────────────────────

    closeBtn.addEventListener('click', () => {
        clearInterval(spawnTimer);
        modal.remove();
    });

    retryBtn.addEventListener('click', () => {
        clearInterval(spawnTimer);
        startGame();
    });

    openBtn.addEventListener('click', () => {
        modal.remove();
        onWin();
    });

    // Cierra al tocar el fondo
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            clearInterval(spawnTimer);
            modal.remove();
        }
    });

    startGame();
}

// ─────────────────────────────────────────────────
// Helpers privados
// ─────────────────────────────────────────────────

function _popEmoji(parent, text) {
    const span = document.createElement('span');
    span.className   = 'tg-emoji-pop';
    span.textContent = text;
    parent.appendChild(span);
}

function _buildModal() {
    const el = document.createElement('div');
    el.id = 'tostones-modal';
    el.innerHTML = `
        <div id="tg-box" role="dialog" aria-modal="true" aria-label="Minijuego: Fríe los Tostones">

            <button id="tg-close" aria-label="Cerrar minijuego">✕</button>

            <div id="tg-header">
                <p id="tg-title">🍳 Fríe los Tostones</p>
                <p id="tg-subtitle">Toca cuando estén <strong>dorados</strong> en el punto 🤌, no quemados en el humo ni crudo de disgusto</p>
                <p id="tg-score">🍳 0 / ${NEED_PERFECT} tostones pepa</p>
            </div>

            <div id="tg-legend" aria-hidden="true">
                <span class="tg-leg tg-raw">crudo</span>
                <span class="tg-leg tg-cooking">cocinando</span>
                <span class="tg-leg tg-golden">¡AHORA!</span>
                <span class="tg-leg tg-burnt">ivan</span>
            </div>

            <div id="tg-pan" aria-live="polite"></div>

            <div id="tg-result" class="hidden" aria-live="assertive"></div>

            <button id="tg-retry"  class="tg-action-btn hidden">Reintentar 🔄</button>
            <button id="tg-open-letter" class="tg-action-btn tg-open-btn hidden">Leer carta 💌</button>
        </div>
    `;
    return el;
}
