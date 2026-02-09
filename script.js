import { loadCardRegistros } from './base/cardRegistros.js';

// Inicializar Iconos al principio
lucide.createIcons();

// ==========================================
//  CONFIGURACIÓN INICIAL (EDITA ESTO)
// ==========================================

// 1. FECHA DE INICIO DE LA RELACIÓN
// Formato: Año, Mes (0 = Enero, 5 = Junio), Día
const startDate = new Date(2025, 4, 30,12,0,0);

// 2. LAS CARTAS Y HITOS
const milestones = [
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
        title: '¡Un Año Juntos!',
        content: `Feliz primer aniversario...`
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
        card.onclick = () => openModal(item);
    } else {
        card.onclick = () => {
            card.classList.add('animate-pulse');
            setTimeout(() => card.classList.remove('animate-pulse'), 500);
        };
    }

    gridContainer.appendChild(card);
});

// --- LÓGICA DE LA GALERÍA DE FOTOS ---
const galleryContainer = document.getElementById('photo-gallery');
const photoModal = document.getElementById('photo-modal');
const photoModalImg = document.getElementById('photo-modal-img');
const photoModalDesc = document.getElementById('photo-modal-desc');
const photoModalDate = document.getElementById('photo-modal-date');
const filterToggle = document.getElementById('photo-filter-toggle');
const filterPanel = document.getElementById('photo-filter-panel');
const filterButtons = Array.from(document.querySelectorAll('.photo-filter-btn'));
const filterPopup = document.getElementById('photo-filter-popup');
const filterTitle = document.getElementById('photo-filter-title');
const filterClose = document.getElementById('photo-filter-close');
const filterApply = document.getElementById('photo-filter-apply');
const filterDayInput = document.getElementById('photo-filter-day');
const filterWeekInput = document.getElementById('photo-filter-week');
const filterMonthInput = document.getElementById('photo-filter-month');
const filterYearInput = document.getElementById('photo-filter-year');

let allCards = [];
let activeFilter = 'all';
let selectedFilterValue = null;

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

const getRangeForFilter = (type, value) => {
    if (!value) return null;

    switch (type) {
        case 'day': {
            const start = new Date(value);
            if (Number.isNaN(start.getTime())) return null;
            const end = new Date(start);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            return { start, end };
        }
        case 'week': {
            const [yearStr, weekStr] = value.split('-W');
            const year = Number(yearStr);
            const week = Number(weekStr);
            if (!year || !week) return null;
            const jan4 = new Date(Date.UTC(year, 0, 4));
            const jan4Day = (jan4.getUTCDay() + 6) % 7;
            const weekStart = new Date(jan4);
            weekStart.setUTCDate(jan4.getUTCDate() - jan4Day + (week - 1) * 7);
            weekStart.setUTCHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
            weekEnd.setUTCHours(23, 59, 59, 999);
            return { start: weekStart, end: weekEnd };
        }
        case 'month': {
            const [yearStr, monthStr] = value.split('-');
            const year = Number(yearStr);
            const month = Number(monthStr) - 1;
            if (!year || month < 0) return null;
            const monthStart = new Date(Date.UTC(year, month, 1));
            const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
            return { start: monthStart, end: monthEnd };
        }
        case 'year': {
            const year = Number(value);
            if (!year) return null;
            const yearStart = new Date(Date.UTC(year, 0, 1));
            const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
            return { start: yearStart, end: yearEnd };
        }
        default:
            return null;
    }
};

const matchesFilter = (card) => {
    if (activeFilter === 'all') return true;
    const date = normalizeDate(card.fecha);
    if (!date) return false;
    const range = getRangeForFilter(activeFilter, selectedFilterValue);
    if (!range) return false;
    return date >= range.start && date <= range.end;
};

const applyFilter = () => {
    const filtered = activeFilter === 'all'
        ? allCards
        : allCards.filter(matchesFilter);
    renderGallery(filtered);
};

const renderGallery = (cards) => {
    galleryContainer.innerHTML = '';
    cards.forEach((card) => {
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container shadow-sm';

        const img = document.createElement('img');
        img.src = `img/${card.fotoFileName}`;
        img.alt = card.fotoFileName;
        img.className = 'photo-img';

        const overlay = document.createElement('div');
        overlay.className = 'photo-overlay';
        overlay.innerHTML = `<p class="photo-snippet">${applyCensorship(getSnippet(card.descripcion))}</p>`;

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

const initGallery = async () => {
    const cardRegistros = await loadCardRegistros();
    const seed = new Date().toISOString().split('T')[0];
    allCards = shuffleArray(cardRegistros, seed);
    applyFilter();
};

if (filterToggle && filterPanel) {
    filterToggle.addEventListener('click', () => {
        filterPanel.classList.toggle('hidden');
    });
}

const showFilterPopup = (type) => {
    if (!filterPopup) return;
    const inputs = [filterDayInput, filterWeekInput, filterMonthInput, filterYearInput];
    inputs.forEach((input) => input.classList.add('hidden'));

    if (type === 'day') {
        filterTitle.textContent = 'Seleccionar día';
        filterDayInput.classList.remove('hidden');
    } else if (type === 'week') {
        filterTitle.textContent = 'Seleccionar semana';
        filterWeekInput.classList.remove('hidden');
    } else if (type === 'month') {
        filterTitle.textContent = 'Seleccionar mes';
        filterMonthInput.classList.remove('hidden');
    } else if (type === 'year') {
        filterTitle.textContent = 'Seleccionar año';
        filterYearInput.classList.remove('hidden');
    }

    filterPopup.classList.remove('hidden');
};

const hideFilterPopup = () => {
    if (!filterPopup) return;
    filterPopup.classList.add('hidden');
};

if (filterClose) {
    filterClose.addEventListener('click', hideFilterPopup);
}

if (filterApply) {
    filterApply.addEventListener('click', () => {
        if (activeFilter === 'day') {
            selectedFilterValue = filterDayInput.value || null;
        } else if (activeFilter === 'week') {
            selectedFilterValue = filterWeekInput.value || null;
        } else if (activeFilter === 'month') {
            selectedFilterValue = filterMonthInput.value || null;
        } else if (activeFilter === 'year') {
            selectedFilterValue = filterYearInput.value || null;
        }
        applyFilter();
        hideFilterPopup();
    });
}

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((btn) => btn.classList.remove('is-active'));
        button.classList.add('is-active');
        activeFilter = button.dataset.filter || 'all';
        if (activeFilter === 'all') {
            selectedFilterValue = null;
            hideFilterPopup();
            applyFilter();
            return;
        }

        showFilterPopup(activeFilter);
    });
});

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

function createFallingElements() {
    const container = document.getElementById('background-effects');
    const symbols = ['❤️', '💖', '💌', '💕', '📸', '✨'];

    setInterval(() => {
        const el = document.createElement('div');
        el.classList.add('falling-item');
        el.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        el.style.left = Math.random() * 100 + 'vw';
        const duration = Math.random() * 3 + 4;
        el.style.animationDuration = duration + 's';
        el.style.fontSize = (Math.random() * 20 + 15) + 'px';
        container.appendChild(el);
        setTimeout(() => { el.remove(); }, duration * 1000);
    }, 400);
}
window.closePhotoModal = closePhotoModal;

createFallingElements();
