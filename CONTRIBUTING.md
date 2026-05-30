# 🛠️ Guía de Contribución — Nuestra Historia

Este archivo define las reglas, convenciones y flujo de trabajo para mantener el proyecto organizado.

---

## 📐 Convenciones de nombres

### Imágenes (`img/`)

| Tipo | Formato | Ejemplo |
|---|---|---|
| Solo Ale | `ale-[descripcion].jpg` | `ale-cumpleaños.jpg` |
| Solo Kevin | `yo-[descripcion].jpg` | `yo-gym-octubre.jpg` |
| Ambos | `aleyo-[descripcion].jpg` | `aleyo-portones.jpg` |
| Solo comida/lugar | `[lugar]-[descripcion].jpg` | `casares-cena.jpg` |

**Reglas:**
- Todo en **minúsculas**
- Usa **guiones** `-` en vez de espacios o guiones bajos
- Sin caracteres especiales: ñ, á, é → `n`, `a`, `e`
- Extensión: preferir `.jpg` (menor peso). `.png` solo si hay transparencia
- Máximo ~2MB por imagen (comprimir con [Squoosh](https://squoosh.app) si es necesario)

---

## 🌿 Flujo de ramas (Git)

```
main          ← producción (lo que se ve en GitHub Pages)
  └── feat/fotos-diciembre    ← ramas de trabajo
  └── feat/carta-aniversario
  └── fix/fecha-incorrecta
```

**Antes de hacer push a `main`, verificar:**
- [ ] El sitio carga bien en `localhost:8080`
- [ ] No hay errores en la consola del navegador
- [ ] `photoDates.json` está actualizado si agregaste fotos nuevas
- [ ] Las imágenes no superan 2MB cada una

---

## 💬 Formato de commits

Usa prefijos para mantener el historial legible:

```
feat: agrego fotos de diciembre 2025
fix: corrijo fecha de aleyo-portones.jpg
style: mejoro animación del modal
docs: actualizo README con nueva sección
```

---

## 🔒 Privacidad de las imágenes

Las fotos son privadas. Tienes dos opciones:

### Opción A — Repo público sin fotos (recomendada)
- Agrega `img/` al `.gitignore`
- Sube las fotos directamente desde GitHub Pages (drag & drop en la UI)
- O usa un CDN privado como Cloudinary (free tier: 25GB)

### Opción B — Repo privado
- Convierte el repositorio en **privado** en GitHub Settings
- GitHub Pages **sí funciona** en repos privados con cuenta gratuita

> Actualmente el repo parece público. Evalúa si quieres mantenerlo así con fotos personales.

---

## 🗓️ Reglas para fechas

1. **Siempre usa ISO 8601** con zona horaria:
   ```
   2025-10-19T18:48:50.000000+00:00
   ```
2. Si no sabes la hora exacta, usa mediodía UTC: `2025-10-19T12:00:00+00:00`
3. Si la fecha del archivo no coincide con la foto real → agrégala a `scripts/dateOverrides.json`
4. **Nunca uses** fechas del futuro

---

## 🖼️ Agregar un grupo de fotos (flujo completo)

```bash
# 1. Crea una rama nueva
git checkout -b feat/fotos-navidad

# 2. Copia las fotos
cp ~/fotos/*.jpg img/

# 3. Extrae metadata
cd scripts && python extract_metadata.py && cd ..

# 4. Revisa el reporte — edita dateOverrides.json si hay fotos marcadas
cat scripts/dateOverrides.json

# 5. Agrega las entradas en base/cardRegistros.js

# 6. Prueba localmente
python -m http.server 8080

# 7. Commit y push
git add .
git commit -m "feat: fotos navidad 2025"
git push origin feat/fotos-navidad

# 8. Merge a main (desde GitHub o localmente)
git checkout main && git merge feat/fotos-navidad && git push
```

---

## 🧩 Arquitectura del código (resumen)

```
script.js
  ├── Configuración: startDate, milestones[]
  ├── Timeline: genera tarjetas de hitos y calcula si están desbloqueadas
  ├── Galería: carga cards, shuffle seeded, renderiza grid
  ├── Filtros: día / semana / mes / año
  ├── Modales: carta (letter-modal) y foto (photo-modal)
  └── Efectos: emojis cayendo (createFallingElements)

base/cardRegistros.js
  ├── photoData[]     ← datos estáticos (filename, descripcion)
  └── loadCardRegistros() ← combina photoData + photoDates.json → Card[]

model/card.js
  └── class Card     ← id, fotoFileName, descripcion, fecha
```

---

## ❌ Lo que NO hacer

- No editar `photoDates.json` a mano (es generado por el script)
- No poner el texto de las cartas directamente en el HTML
- No usar `var` ni código legacy — el proyecto usa ES Modules modernos
- No subir imágenes sin comprimir de más de 5MB
