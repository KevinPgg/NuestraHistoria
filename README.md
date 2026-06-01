# 💌 Nuestra Historia — KevinPgg.github.io

> Sitio web personal y romántico que documenta la historia de una relación: cartas desbloqueables por hito temporal, galería de fotos con filtros, y efectos visuales con emojis en cascada.

---

## 🗂️ Estructura del proyecto

```
KevinPgg.github.io/
│
├── index.html                  # Página principal (única página)
├── style.css                   # Estilos globales (vanilla CSS + Tailwind CDN)
├── script.js                   # Lógica principal: hitos, galería, filtros, modales
│
├── model/
│   └── card.js                 # Clase Card — modelo de dato de cada foto
│
├── base/
│   ├── cardRegistros.js        # Array de fotos + función loadCardRegistros()
│   └── photoDates.json         # Fechas de archivos generadas por el script Python
│
├── img/                        # Carpeta de imágenes (no subir al repo si son privadas)
│
└── scripts/                    # Herramientas de desarrollo local (NO se despliegan)
    ├── extract_metadata.py     # Extrae fechas EXIF + fallback + flags manuales
    ├── dateOverrides.json      # Fechas manuales para fotos sin EXIF confiable
    └── requirements.txt        # Dependencias Python del script
```

---

## 🚀 Cómo ver el proyecto localmente

GitHub Pages sirve directamente el `index.html`. Para pruebas locales **no abras el archivo directamente** porque los ES Modules (`type="module"`) necesitan un servidor HTTP.

```bash
# Opción 1 — Python (sin instalar nada extra)
cd KevinPgg.github.io
python -m http.server 8080
# Abre: http://localhost:8080

# Opción 2 — Node.js
npx serve .
```

---

## ✏️ Cómo agregar una nueva foto

1. Copia la imagen a la carpeta `img/` con un nombre descriptivo en minúsculas y sin espacios:
   ```
   img/aleyo-navidad2025.jpg
   ```
2. Abre `base/cardRegistros.js` y agrega una entrada al array `photoData`:
   ```js
   {
     filename: 'aleyo-navidad2025.jpg',
     descripcion: 'Descripción del momento. *Texto censurado entre asteriscos.*',
     fecha: '2025-12-25T20:00:00+00:00'   // ISO 8601 — ver sección de fechas abajo
   }
   ```
3. Ejecuta el script de metadata para actualizar `photoDates.json` (opcional pero recomendado):
   ```bash
   cd scripts
   python extract_metadata.py
   ```
4. Sube los cambios a GitHub:
   ```bash
   git add img/aleyo-navidad2025.jpg base/cardRegistros.js base/photoDates.json
   git commit -m "feat: agrego foto navidad 2025"
   git push
   ```

---

## 🗓️ Sobre las fechas de las fotos

El campo `fecha` en `cardRegistros.js` determina dónde cae la foto en los filtros (Día / Semana / Mes / Año).

**Prioridad de fuentes (de más a menos confiable):**

| Fuente | Descripción |
|---|---|
| EXIF `DateTimeOriginal` | Fecha real en que se tomó la foto (la mejor) |
| `fechaUltimaModificacion` | Fecha de modificación del archivo |
| Manual en `dateOverrides.json` | Cuando ninguna automática es correcta |

Si transfieriste fotos desde el celular a la PC recientemente, la fecha de creación del archivo puede ser la de hoy y no la del momento real. El script `extract_metadata.py` detecta esto automáticamente y te avisa.

---

## 💌 Cómo agregar o editar una carta de hito

En `script.js`, busca el array `milestones`. Cada objeto tiene:

```js
{
  monthsReq: 6,           // Meses desde startDate para desbloquear
  label: '0.6',           // Texto que aparece en el botón
  title: 'Título...',     // Título del modal
  content: `Texto HTML...` // Soporta <br>, <b>, etc.
}
```

---

## ⚙️ Cambiar la fecha de inicio de la relación

En `script.js`, línea ~14:

```js
const startDate = new Date(2025, 4, 30, 12, 0, 0);
//                          año  mes  día  hora
// Nota: mes empieza en 0 (Enero=0, Mayo=4, Diciembre=11)
```



