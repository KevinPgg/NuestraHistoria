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
        year: 'numeric'
    }).format(date);
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

const openPhotoModal = (card) => {
    photoModalImg.src = `img/${card.fotoFileName}`;
    photoModalImg.alt = card.fotoFileName;
    photoModalDesc.textContent = card.descripcion;
    photoModalDate.textContent = formatPhotoDate(card.fecha);
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

const renderGallery = async () => {
    const cardRegistros = await loadCardRegistros();

    cardRegistros.forEach((card) => {
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container shadow-sm';

        const img = document.createElement('img');
        img.src = `img/${card.fotoFileName}`;
        img.alt = card.fotoFileName;
        img.className = 'photo-img';

        const overlay = document.createElement('div');
        overlay.className = 'photo-overlay';
        overlay.innerHTML = `<p class="photo-snippet">${getSnippet(card.descripcion)}</p>`;

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

renderGallery();


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
