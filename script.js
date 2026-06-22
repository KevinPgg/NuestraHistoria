import { loadCardRegistros }   from './base/cardRegistros.js';
import { questions }           from './base/questions.js';
import { milestones }          from './base/letters.js';
import { startTostonesGame }   from './base/minijuego-tostones.js';
import { startMemoryGame }     from './base/minijuego-memory.js';

// ==========================================
//  LOCK SCREEN — Control de acceso
// ==========================================
const _fallingIntervals = {};

(function initLockScreen() {
    const lockScreen  = document.getElementById('lock-screen');

    // Lluvia también en el lock
    startFallingElements('lock-background-effects');

    const questionEl   = document.getElementById('lock-question');
    const questionWrap = document.getElementById('lock-question-wrap');
    const optionsEl    = document.getElementById('lock-options');
    const feedbackEl   = document.getElementById('lock-feedback');

    let currentIndex = -1;

    const shuffleOptions = (opts) => {
        const arr = [...opts];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const pickIndex = () => {
        if (questions.length === 1) return 0;
        let idx;
        do { idx = Math.floor(Math.random() * questions.length); }
        while (idx === currentIndex);
        return idx;
    };

    const showQuestion = () => {
        currentIndex = pickIndex();
        const q = questions[currentIndex];

        questionWrap.style.opacity = '0';
        optionsEl.style.opacity    = '0';
        feedbackEl.textContent     = '';
        feedbackEl.className       = '';

        setTimeout(() => {
            questionEl.textContent = q.pregunta;
            questionWrap.classList.remove('question-enter');
            void questionWrap.offsetWidth;
            questionWrap.classList.add('question-enter');
            questionWrap.style.opacity = '1';

            optionsEl.innerHTML = '';
            shuffleOptions(q.opciones).forEach((opt) => {
                const btn = document.createElement('button');
                btn.className   = 'lock-option';
                btn.textContent = opt;
                btn.type        = 'button';
                btn.addEventListener('click', () => handleAnswer(btn, opt, q.correcta));
                optionsEl.appendChild(btn);
            });

            optionsEl.style.opacity = '1';
            lucide.createIcons();
        }, 200);
    };

    const handleAnswer = (btn, chosen, correcta) => {
        optionsEl.querySelectorAll('.lock-option').forEach(b => {
            b.disabled = true;
            b.style.cursor = 'default';
        });

        if (chosen == correcta) {
            btn.classList.add('is-correct');
            feedbackEl.textContent = 'Parece que alguien hizo su tarea 😉 linda mi novia';
            feedbackEl.className   = 'fb-correct';

            setTimeout(() => {
                lockScreen.classList.add('lock-exit');
                startFallingElements('background-effects');
                setTimeout(() => lockScreen.classList.add('lock-hidden'), 1650);
            }, 1500);
        } else {
            btn.classList.add('is-wrong');

            const messages = [
                'Equivocada amors Prueba con otra ... la mia?😏',
                'Otra vez mal? e.e Intenta de nuevo 🤔',
                'Uy esta si era verdad (mentira) La ultima amor 😾',
                'Me odias',
                'No se quien seas pero sape de aquí',
            ];
            const tries = parseInt(lockScreen.dataset.tries || '0', 10);
            feedbackEl.textContent = messages[Math.min(tries, messages.length - 1)];
            feedbackEl.className   = 'fb-wrong';
            lockScreen.dataset.tries = tries + 1;

            setTimeout(showQuestion, 1400);
        }
    };

    showQuestion();
})();

// ==========================================
//  Lluvia de emojis — usada en lock Y en main
// ==========================================

// Emojis + iconos SVG conmemorativos (extraídos del PDF, carpeta iconos-svg/)
const _fallingEmojis = ['💌', '💕', '📸'];

// Cada icono SVG con su mensaje asociado (texto que lo acompañaba en el PDF)
const _iconMessages = {
    'ramen':           'Tu era de hacer y comer ramén 🍜',
    'cafe':            'Amamos el café ☕',
    'bola-billar-8':   'Jugar billar fue increíble 🎱',
    'corazon':         'Oct/31/2025 — El abrazo más sincero, con “Ojitos lindos de fondo” 🤍',
    'fuego':           'Chifletones. You & me. Gracias Life porque te conocí ✨',
    'arbol-navidad':   'We met in December 🎄',
    'chile':           'Chefsito, tu ají legendario amors 🌶️',
    'chile-2':         'Amas a Balerina Capuchina 🩰☕',
    'globo-nieve':     'Amaste el W&T y el acuario. Me encanta que siempre lo mencionas 🐠',
    'disco':           'No sabía que era Mascarpone before u 🧀',
    'bitcoin':         'Inviertes en bitcoins, eres la primera persona que escucho que hace eso jsjs ₿',
    'amanecer':        'El día que nos conocimos en la hacienda, se veía así y sonó “Rayando el sol” 🌅',
    'persona-poncho':  'Un jalapeño porque le pones últimamente a todo, lol 🌶️',
    'mosca':           'Si te pudiera volver a conocer lo haría. You are my sunshine, Kevin ☀️',
    'calendario-31':   'El día que me pediste ser novios, ya estabas demorando jsjsj 📅',
    'notas-musicales': 'Tu y tu falta de ritmo amor. Cantaste súper tierno, muy en mi cumple. Me enamoré más ese día 🎵',
};
const _fallingIcons = Object.keys(_iconMessages);

// Cache de Blob URLs: cada SVG se descarga una sola vez
const _svgCache = {};

async function preloadIcons() {
    await Promise.all(
        _fallingIcons.map(async (key) => {
            try {
                const res  = await fetch(`iconos-svg/${key}.svg`);
                const blob = await res.blob();
                _svgCache[key] = URL.createObjectURL(blob);
            } catch (e) {
                // Si falla, startFallingElements usará la ruta directa como fallback
                console.warn(`No se pudo precargar el icono: ${key}`, e);
            }
        })
    );
}

// Iniciar la precarga lo antes posible (no bloquea el hilo principal)
preloadIcons();

function startFallingElements(containerId) {
    const container = document.getElementById(containerId);
    if (!container || _fallingIntervals[containerId]) return;

    _fallingIntervals[containerId] = setInterval(() => {
        const el = document.createElement('div');
        el.classList.add('falling-item');

        // ~40% de probabilidad de que caiga un icono SVG, si no un emoji
        if (Math.random() < 0.4) {
            const key = _fallingIcons[Math.floor(Math.random() * _fallingIcons.length)];
            const img = document.createElement('img');
            img.src = _svgCache[key] ?? `iconos-svg/${key}.svg`;
            img.alt = '';
            img.classList.add('falling-icon'); // solo decorativo
            const size = Math.random() * 25 + 25; // 25–50px
            img.style.width = size + 'px';
            img.style.height = 'auto';
            el.appendChild(img);
        } else {
            el.innerText = _fallingEmojis[Math.floor(Math.random() * _fallingEmojis.length)];
            el.style.fontSize = (Math.random() * 20 + 15) + 'px';
        }

        el.style.left = Math.random() * 100 + 'vw';
        const duration = Math.random() * 3 + 4;
        el.style.animationDuration = duration + 's';
        container.appendChild(el);
        setTimeout(() => el.remove(), duration * 1000);
    }, 400);
}

// ==========================================
//  Modal "Explicación iconos" — galería en cuadrícula
// ==========================================
function _buildIconGallery() {
    const grid = document.getElementById('icon-gallery-grid');
    if (!grid || grid.childElementCount) return; // construir una sola vez
    for (const key of _fallingIcons) {
        const card = document.createElement('div');
        card.className = 'icon-gallery-card';
        card.innerHTML =
            `<img src="iconos-svg/${key}.svg" alt="" class="icon-gallery-img" />` +
            `<p class="icon-gallery-text">${_iconMessages[key]}</p>`;
        grid.appendChild(card);
    }
}
function openIconModal() {
    const modal = document.getElementById('icon-modal');
    if (!modal) return;
    _buildIconGallery();
    modal.classList.remove('hidden');
}
function closeIconModal() {
    const modal = document.getElementById('icon-modal');
    if (modal) modal.classList.add('hidden');
}
// script.js es un ES Module: exponer al ámbito global para los onclick del HTML
window.openIconModal  = openIconModal;
window.closeIconModal = closeIconModal;

// Inicializar Iconos al principio
lucide.createIcons();

// ==========================================
//  CONFIGURACIÓN INICIAL (EDITA ESTO)
// ==========================================

// 1. FECHA DE INICIO DE LA RELACIÓN
// Formato: Año, Mes (0 = Enero, 5 = Junio), Día
const startDate = new Date(2025, 4, 30,12,0,0);

// 2. LAS CARTAS Y HITOS — importadas desde base/letters.js

// ==========================================
//  GALERÍA DE FOTOS (CARGA DE REGISTROS)
// ==========================================
const getSnippet = (text, maxWords = 16) => {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return words.join(' ');
    return `${words.slice(0, maxWords).join(' ')}...`;
};

const formatPhotoDate = (date) => {
    if (!date) return 'Fecha desconocida';
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(date);
};

const escapeHtml = (value) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const applyCensorship = (text) => {
    const escaped = escapeHtml(text);
    return escaped.replace(/\*(.+?)\*/g, (_, content) => (
        `<span class="censored" tabindex="0">${escapeHtml(content)}</span>`
    ));
};

const normalizeDate = (value) => {
    if (!value) return null;
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const seedFromString = (text) => {
    let h = 1779033703 ^ text.length;
    for (let i = 0; i < text.length; i += 1) {
        h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
};

const seededRandom = (seed) => {
    let t = seed + 0x6d2b79f5;
    return () => {
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const shuffleArray = (items, seedText) => {
    const array = [...items];
    const seed = seedFromString(seedText)();
    const random = seededRandom(seed);
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


// ==========================================
//  LÓGICA DEL PROGRAMA
// ==========================================

// --- LÓGICA DE LA LÍNEA DE TIEMPO (HITOS) ---
const gridContainer = document.getElementById('timeline-grid');
const modal = document.getElementById('letter-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');

function getMonthsPassed(start) {
    const now = new Date();
    let months = (now.getFullYear() - start.getFullYear()) * 12;
    months -= start.getMonth();
    months += now.getMonth();
    if (now.getDate() < start.getDate()) {
        months--;
    }
    return months;
}

const monthsPassed = getMonthsPassed(startDate);
console.log(`Fecha inicial: ${startDate} - MesesConcurrido: ${monthsPassed}`)
// const monthsPassed = 20; // Descomenta para probar

milestones.forEach((item, index) => {
    const isUnlocked = monthsPassed >= item.monthsReq;

    const card = document.createElement('div');
    card.className = `
                relative p-6 rounded-2xl flex flex-col items-center justify-center gap-3 
                transition-all duration-300 border-2 
                ${isUnlocked
            ? 'bg-white border-rose-300 cursor-pointer hover:scale-105 unlocked-glow text-rose-600'
            : 'bg-gray-100 border-gray-300 cursor-not-allowed text-gray-400 grayscale opacity-80'}
            `;

    const iconHtml = isUnlocked
        ? `<i data-lucide="heart-handshake" class="w-10 h-10 fill-rose-100"></i>`
        : `<i data-lucide="lock" class="w-8 h-8"></i>`;

    const labelHtml = `<span class="text-xl font-bold font-sans">${item.label}</span>`;
    const statusText = isUnlocked ? "Leer Carta" : "A1 miamor u u";

    card.innerHTML = `
                ${iconHtml}
                ${labelHtml}
                <span class="text-xs uppercase tracking-widest">${statusText}</span>
            `;

    if (isUnlocked) {
        card.onclick = () => {
            if (item.monthsReq === 6) {
                // Carta de 6 meses → Memory Cards
                startTostonesGame(() => openModal(item));
            } else if (item.monthsReq === 12) {
                // Carta de 12 meses → Minijuego tostones
                startMemoryGame(() => openModal(item));
            } else {
                openModal(item);
            }
        };
    } else {
        card.onclick = () => {
            card.classList.add('animate-pulse');
            setTimeout(() => card.classList.remove('animate-pulse'), 500);
        };
    }

    gridContainer.appendChild(card);
});

// --- LÓGICA DE LA GALERÍA DE FOTOS ---
const galleryContainer  = document.getElementById('photo-gallery');
const galleryEmpty      = document.getElementById('gallery-empty');
const loadMoreWrap      = document.getElementById('load-more-wrap');
const loadMoreBtn       = document.getElementById('load-more-btn');
const randomPhotoBtn    = document.getElementById('random-photo-btn');
const photoModal        = document.getElementById('photo-modal');
const photoModalImg     = document.getElementById('photo-modal-img');
const photoModalDesc    = document.getElementById('photo-modal-desc');
const photoModalDate    = document.getElementById('photo-modal-date');
const filterToggle      = document.getElementById('photo-filter-toggle');
const filterPanel       = document.getElementById('photo-filter-panel');
const pfYears           = document.getElementById('pf-years');
const pfMonths          = document.getElementById('pf-months');
const pfDays            = document.getElementById('pf-days');
const pfMonthRow        = document.getElementById('pf-month-row');
const pfDayRow          = document.getElementById('pf-day-row');
const pfReset           = document.getElementById('pf-reset');
const pfCount           = document.getElementById('pf-count');
const sortBtn           = document.getElementById('photo-sort-btn');
const sortMenu          = document.getElementById('photo-sort-menu');
const sortLabel         = document.getElementById('photo-sort-label');

// Paginación
const PAGE_SIZE = 30;
let currentPage      = 0;
let allFilteredCards = [];
let allCards         = [];

// Estado de filtros dinámicos y orden — multi-selección acumulable (Sets)
const activeYears  = new Set(); // años seleccionados; vacío = todos
const activeMonths = new Set(); // meses 0-11 seleccionados; vacío = todos
const activeDays   = new Set(); // días 1-31 seleccionados; vacío = todos
let sortMode    = 'random'; // 'random' | 'date-asc' | 'date-desc'
let dateIndex   = new Map(); // año -> Map(mes -> Set(día))
const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const openPhotoModal = (card) => {
    photoModalImg.src = `img/${card.fotoFileName}`;
    photoModalImg.alt = card.fotoFileName;
    photoModalDesc.innerHTML = applyCensorship(card.descripcion);
    photoModalDate.textContent = formatPhotoDate(normalizeDate(card.fecha));
    photoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

const closePhotoModal = () => {
    photoModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
};

photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) closePhotoModal();
});

// Construye el índice de fechas disponibles a partir de las cards.
// Estructura: Map(año -> Map(mes -> Set(día)))  — solo fechas que existen.
const buildDateIndex = () => {
    dateIndex = new Map();
    allCards.forEach((card) => {
        const d = normalizeDate(card.fecha);
        if (!d) return;
        const y = d.getUTCFullYear();
        const m = d.getUTCMonth();
        const day = d.getUTCDate();
        if (!dateIndex.has(y)) dateIndex.set(y, new Map());
        const months = dateIndex.get(y);
        if (!months.has(m)) months.set(m, new Set());
        months.get(m).add(day);
    });
};

const hasAnyFilter = () => activeYears.size > 0 || activeMonths.size > 0 || activeDays.size > 0;

const matchesFilter = (card) => {
    const date = normalizeDate(card.fecha);
    if (!date) return false;
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth();
    const d = date.getUTCDate();
    if (activeYears.size  && !activeYears.has(y))  return false;
    if (activeMonths.size && !activeMonths.has(m)) return false;
    if (activeDays.size   && !activeDays.has(d))   return false;
    return true;
};

// Años en alcance: los seleccionados, o todos si no hay selección.
const yearsInScope = () => (activeYears.size ? [...activeYears] : [...dateIndex.keys()]);

// Meses disponibles = unión de meses existentes en los años en alcance.
const availableMonths = () => {
    const set = new Set();
    yearsInScope().forEach((y) => {
        const months = dateIndex.get(y);
        if (months) months.forEach((_, m) => set.add(m));
    });
    return [...set].sort((a, b) => a - b);
};

// Días disponibles = unión de días existentes para (años en alcance) x (meses seleccionados).
const availableDays = () => {
    const set = new Set();
    yearsInScope().forEach((y) => {
        const months = dateIndex.get(y);
        if (!months) return;
        months.forEach((days, m) => {
            if (activeMonths.has(m)) days.forEach((d) => set.add(d));
        });
    });
    return [...set].sort((a, b) => a - b);
};

// Quita de la selección meses/días que ya no estén disponibles (al cambiar años/meses).
const pruneSelection = () => {
    const months = new Set(availableMonths());
    [...activeMonths].forEach((m) => { if (!months.has(m)) activeMonths.delete(m); });
    const days = new Set(availableDays());
    [...activeDays].forEach((d) => { if (!days.has(d)) activeDays.delete(d); });
};

// Ordena según el modo activo. 'random' conserva el orden barajado diario de allCards.
const applySort = (cards) => {
    const ms = (c) => {
        const d = normalizeDate(c.fecha);
        return d ? d.getTime() : 0;
    };
    if (sortMode === 'date-asc')  return [...cards].sort((a, b) => ms(a) - ms(b));
    if (sortMode === 'date-desc') return [...cards].sort((a, b) => ms(b) - ms(a));
    return cards;
};

// Render de un lote de cards (append, no reemplaza)
const renderBatch = (cards) => {
    cards.forEach((card) => {
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container shadow-sm';

        const img = document.createElement('img');
        img.src       = `img/${card.fotoFileName}`;
        img.alt       = card.fotoFileName;
        img.className = 'photo-img';
        img.loading   = 'lazy'; // lazy loading nativo

        const overlay = document.createElement('div');
        overlay.className = 'photo-overlay';
        overlay.innerHTML = `<p class="photo-snippet">${applyCensorship(getSnippet(card.descripcion))}</p>`;

        const cardDate = normalizeDate(card.fecha);
        if (cardDate) {
            const badge = document.createElement('span');
            badge.className = 'photo-date-badge';
            badge.textContent = formatPhotoBadgeDate(cardDate);
            photoContainer.appendChild(badge);
        }

        img.onerror = function () {
            this.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'photo-fallback';
            fallback.innerHTML = `
                    <i data-lucide="camera-off" class="w-8 h-8 mb-2"></i>
                    <span class="text-xs break-all font-sans">${card.fotoFileName}</span>
                `;
            photoContainer.appendChild(fallback);
            lucide.createIcons();
        };

        photoContainer.addEventListener('click', () => openPhotoModal(card));
        photoContainer.appendChild(img);
        photoContainer.appendChild(overlay);
        galleryContainer.appendChild(photoContainer);
    });
};

const updateLoadMore = () => {
    const shown = currentPage * PAGE_SIZE;
    if (shown >= allFilteredCards.length) {
        loadMoreWrap.classList.add('hidden');
    } else {
        const remaining = allFilteredCards.length - shown;
        loadMoreBtn.textContent = `Mostrar más (${remaining} restantes)`;
        loadMoreWrap.classList.remove('hidden');
    }
};

const loadPage = () => {
    const start = currentPage * PAGE_SIZE;
    const batch = allFilteredCards.slice(start, start + PAGE_SIZE);
    renderBatch(batch);
    currentPage++;
    updateLoadMore();
    lucide.createIcons();
};

const applyFilter = () => {
    const filtered = hasAnyFilter()
        ? allCards.filter(matchesFilter)
        : [...allCards];

    allFilteredCards = applySort(filtered);

    if (pfCount) {
        const n = allFilteredCards.length;
        pfCount.textContent = `${n} ${n === 1 ? 'recuerdo' : 'recuerdos'}`;
    }

    currentPage = 0;
    galleryContainer.innerHTML = '';

    if (allFilteredCards.length === 0) {
        galleryEmpty.classList.remove('hidden');
        loadMoreWrap.classList.add('hidden');
        return;
    }

    galleryEmpty.classList.add('hidden');
    loadPage();
};

// ----- Render de chips de filtro (solo fechas disponibles) -----
const makeChip = (text, isActive, onClick) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pf-chip' + (isActive ? ' is-active' : '');
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    return btn;
};

const toggleInSet = (set, value) => {
    if (set.has(value)) set.delete(value);
    else set.add(value);
};

const renderYearChips = () => {
    pfYears.innerHTML = '';
    [...dateIndex.keys()].sort((a, b) => a - b).forEach((year) => {
        pfYears.appendChild(makeChip(year, activeYears.has(year), () => {
            toggleInSet(activeYears, year);
            refreshFilterUI();
            applyFilter();
        }));
    });
};

const renderMonthChips = () => {
    const months = availableMonths();
    pfMonths.innerHTML = '';
    months.forEach((month) => {
        pfMonths.appendChild(makeChip(MONTHS_SHORT[month], activeMonths.has(month), () => {
            toggleInSet(activeMonths, month);
            refreshFilterUI();
            applyFilter();
        }));
    });
    pfMonthRow.classList.toggle('hidden', months.length === 0);
};

const renderDayChips = () => {
    // Los días solo tienen sentido si hay al menos un mes elegido.
    if (activeMonths.size === 0) {
        pfDayRow.classList.add('hidden');
        return;
    }
    const days = availableDays();
    pfDays.innerHTML = '';
    days.forEach((day) => {
        pfDays.appendChild(makeChip(day, activeDays.has(day), () => {
            toggleInSet(activeDays, day);
            refreshFilterUI();
            applyFilter();
        }));
    });
    pfDayRow.classList.toggle('hidden', days.length === 0);
};

const refreshFilterUI = () => {
    pruneSelection();
    renderYearChips();
    renderMonthChips();
    renderDayChips();
};

const formatPhotoBadgeDate = (date) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('es-ES', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
};

// Botón "Mostrar más"
loadMoreBtn.addEventListener('click', loadPage);

// Botón "Momento Random" — elige del pool filtrado actual (Math.random() real, no seeded)
randomPhotoBtn.addEventListener('click', () => {
    const pool = allFilteredCards.length > 0 ? allFilteredCards : allCards;
    if (!pool.length) return;
    const card = pool[Math.floor(Math.random() * pool.length)];
    openPhotoModal(card);
});

const initGallery = async () => {
    const cardRegistros = await loadCardRegistros();
    const seed = new Date().toISOString().split('T')[0];
    allCards = shuffleArray(cardRegistros, seed);
    buildDateIndex();
    refreshFilterUI();
    applyFilter();
};

// Mostrar/ocultar el panel de filtros
if (filterToggle && filterPanel) {
    filterToggle.addEventListener('click', () => {
        filterPanel.classList.toggle('hidden');
    });
}

// Botón "Mostrar todo": limpia la selección
if (pfReset) {
    pfReset.addEventListener('click', () => {
        activeYears.clear();
        activeMonths.clear();
        activeDays.clear();
        refreshFilterUI();
        applyFilter();
    });
}

// Menú de orden (Sort)
if (sortBtn && sortMenu) {
    sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sortMenu.classList.toggle('hidden');
    });

    sortMenu.querySelectorAll('[data-sort]').forEach((btn) => {
        btn.addEventListener('click', () => {
            sortMode = btn.dataset.sort;
            sortLabel.textContent = btn.textContent.replace(/\s*\(.*\)$/, '');
            sortMenu.querySelectorAll('[data-sort]').forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            sortMenu.classList.add('hidden');
            applyFilter();
        });
    });

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!sortMenu.classList.contains('hidden') &&
            !sortMenu.contains(e.target) && !sortBtn.contains(e.target)) {
            sortMenu.classList.add('hidden');
        }
    });
}

initGallery();

document.addEventListener('click', (event) => {
    const censored = event.target.closest('.censored');
    if (censored) {
        censored.classList.add('censored--revealed');
        return;
    }

    document.querySelectorAll('.censored--revealed').forEach((el) => {
        el.classList.remove('censored--revealed');
    });
});

document.addEventListener('focusin', (event) => {
    if (event.target.classList.contains('censored')) return;
    document.querySelectorAll('.censored--revealed').forEach((el) => {
        el.classList.remove('censored--revealed');
    });
});


// --- FUNCIONES GLOBALES Y EFECTOS ---

// Re-inicializar iconos al final de toda la generación de HTML
lucide.createIcons();

function openModal(item) {
    modalTitle.innerText = item.title;
    modalContent.innerHTML = item.content;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}
window.closeModal = closeModal;

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

window.closePhotoModal = closePhotoModal;
