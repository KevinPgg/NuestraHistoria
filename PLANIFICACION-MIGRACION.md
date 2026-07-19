# Planificación de migración — Nuestra Historia

> Documento de diseño. No es código final. Las decisiones marcadas con ⚠️ requieren tu validación antes de implementar.

---

## 0. Correcciones críticas antes de empezar

### ⚠️ Spotify NO sirve para tu catálogo de música
El flujo que describiste (token con `client_credentials` → `/search` → `preview_url` `.mp3` de 30s) es exactamente la API de Spotify, pero **Spotify deprecó `preview_url` el 27 de noviembre de 2024**. Con el flujo de `client_credentials`, ese campo ahora devuelve `null`. Apps nuevas registradas después de esa fecha no reciben previews. Tu plan de audio, tal como está, no funcionaría.

**Alternativa recomendada: Deezer API.** Es más simple que lo que diseñaste:
- **No requiere autenticación** para búsqueda de catálogo. Te ahorras toda la fase 1 (token Base64).
- Devuelve `preview`: un `.mp3` de 30s alojado en el CDN de Deezer, reproducible sin login.
- Endpoint: `GET https://api.deezer.com/search?q=TEXTO`. Cada resultado trae título, artista, `album.cover`, y `preview`.

Tu lógica de la fase 3 (filtrar `preview` nulo, reproducción única deteniendo el audio anterior) se mantiene igual. Solo cambia la fuente.

| Tu plan original (Spotify) | Plan corregido (Deezer) |
|---|---|
| POST token client_credentials Base64 | (no necesario) |
| GET /search con Bearer token | GET api.deezer.com/search?q= |
| preview_url 30s → **null desde nov-2024** | preview 30s → funciona |

---

## 1. Estimación de almacenamiento (GB)

Supuestos (medios **optimizados para web**, no originales):
- **Foto**: WebP/JPEG ~2000px, calidad 80 → **~0.5 MB** (rango 0.3–1.0 MB)
- **Video corto**: 1080p H.264, ~30s, comprimido para web → **~25 MB** (rango 15–50 MB)

| Escenario | 1 GB | 5 GB | 10 GB |
|---|---|---|---|
| Solo fotos | ~2,000 | ~10,000 | ~20,000 |
| Solo videos cortos | ~40 | ~200 | ~410 |
| Mezcla realista (90% fotos / 10% videos) | ~310 fotos + 35 videos | ~1,560 fotos + 175 videos | ~3,120 fotos + 350 videos |

**Lectura del estimado:** para una pareja, acumular más de 5 GB en años es difícil salvo que subas muchos videos. La mezcla realista de 10 GB ya cubre **más de 3,000 fotos + 350 clips**. El video es lo que consume; cada clip pesa como ~50 fotos.

**Recomendación de capa de almacenamiento:**
- **Metadatos + auth + BD**: Supabase (Postgres).
- **Archivos (fotos/videos)**: Cloudflare R2 — egress (descarga) gratis, que es justo lo que más se castiga al servir medios. El storage de Supabase es pequeño en plan gratuito; úsalo solo si te quieres ahorrar un servicio al inicio.
- **Originales sin comprimir**: guárdalos en **Google Drive como respaldo personal**, NO como fuente del sitio. Drive no es CDN: con accesos frecuentes tira *quota exceeded* y deja de servir la imagen.

> Regla: subes el original → generas versión web optimizada → sirves la optimizada desde R2 → el original vive en Drive por si algún día lo necesitas.

---

## 2. Stack recomendado

- **Frontend**: Next.js en **Vercel** (gratis a tu escala). Reaprovechas componentes actuales (`cardRegistros.js`, etc.).
- **Backend**: **Supabase** = Postgres + Auth + Row Level Security en un solo servicio.
- **Medios**: **Cloudflare R2**.
- **Música**: **Deezer API** (cliente, sin servidor propio).
- **Privacidad**: Auth de Supabase con whitelist de 2 correos + RLS. Sin sesión válida no se ve **nada**, aunque alguien tenga la URL.

### ⚠️ Sobre el login con reconocimiento facial
Sigue siendo la pieza que recomiendo **no** construir como muro de seguridad: una IA que "aprende con fotos" se engaña con una foto. Si quieres "desbloqueo con cara", usa **passkeys / WebAuthn**: aprovecha el Face ID o huella del propio dispositivo, no entrena nada, no expone tu cara y es resistente a phishing. Funciona desde cualquier dispositivo. Déjalo como comodidad **encima** del login real, en la última fase.

---

## 3. Modelo de datos (Postgres / Supabase)

```
profiles          (id ↔ auth.users, nombre, rol['novio'|'novia'], avatar_url)
user_settings     (user_id, favoritas_count int default 10 check (10..30, paso 5))

media             (id, owner_id, tipo['photo'|'video'], storage_path, thumb_path,
                   fecha_creacion, fecha_modificacion, fecha_mostrada, descripcion,
                   created_at)
                   -- fecha_mostrada = pickOldestDate(fecha_creacion, fecha_modificacion)

media_desc_history(id, media_id, user_id, descripcion_nueva, razon varchar(150),
                   fecha)                                  -- historial editable/legible

likes             (id, media_id, user_id, created_at, unique(media_id, user_id))
                   -- "corazones" compartidos: se muestran iguales a ambos (front singleton)

comments          (id, media_id, user_id, texto, created_at)
                   -- distingues autor por la cuenta de correo (profiles.rol)

favorites         (id, user_id, media_id, rank)           -- top N por usuario

momentos          (id, owner_id, titulo, visibilidad['public'|'private'], created_at)
momento_media     (momento_id, media_id, orden)           -- slideshow de "recuerdos"

music_tracks      (id, deezer_id, title, artist, cover_url, preview_url)  -- cache Deezer
media_music       (media_id | momento_id, track_id)       -- "colgar" música a foto(s)
```

**Cómo cada feature tuya cae en este modelo:**

- **Feed tipo Instagram** → consulta paginada de `media` ordenada por fecha.
- **Colgar música a foto(s)** → `media_music` enlaza track de Deezer (cacheado en `music_tracks`).
- **Momentos / recuerdos en slide** → `momentos` + `momento_media` (orden). El selector de imágenes reutiliza el feed.
- **Likes / corazones compartidos** → `likes`; el conteo se consulta global, ambos ven lo mismo.
- **Comentarios** → `comments`, autor vía `profiles`.
- **Favoritas top N** → `favorites` + `user_settings.favoritas_count` (slider 10→30, paso 5).
- **Editar descripción con historial** → cada edición inserta en `media_desc_history` con `razon` ≤150 chars; se listan legibles [user, fecha, razón].

---

## 4. Privacidad y visibilidad (RLS)

Reglas en Postgres, no en el front (el front se puede saltar):
- Solo los 2 correos en whitelist tienen sesión. Todo lo demás: acceso denegado.
- `media` y `likes`/`comments`: visibles para ambos (es de la pareja).
- `momentos` con `visibilidad = 'private'`: visibles **solo** para el `owner_id`. El dueño decide mostrar u ocultar cada agrupación a su pareja.

Esto cubre tu requisito: ambos ven el perfil del otro, pero el propietario controla qué momentos quedan públicos o privados.

---

## 5. Fases de ejecución

**Fase 1 — Cimientos**
1. Proyecto Supabase + tablas base (`profiles`, `media`, `user_settings`).
2. Auth con whitelist de 2 correos (magic-link). RLS activo.
3. Migrar `photoDates.json` → tabla `media`, conservando `pickOldestDate(creacion, modificacion)`.
4. Subir medios actuales a R2 + generar thumbnails.

**Fase 2 — Feed y multimedia**
5. Next.js en Vercel; portar cards para leer de la BD.
6. Feed estilo Instagram (paginado).
7. Integración Deezer (búsqueda + preview) y `media_music`.
8. Likes/corazones + comentarios.

**Fase 3 — Curaduría**
9. Momentos/recuerdos con slideshow y selector.
10. Favoritas top N configurable.
11. Edición de descripciones + historial con razón.

**Fase 4 — (BLOQUEANTE: solo tras completar 1–3) Perfiles tipo red social**
12. Perfil novio/novia, cada uno arma su propio feed con los recursos compartidos.
13. Toggle público/privado por momento (visibilidad).
14. Futuro: creador de publicaciones (foto/video + música) estilo red social.

**Fase 5 — Opcional**
15. "Desbloqueo con cara" vía WebAuthn/passkey como comodidad, no como seguridad.

---

## 6. Costo
A tu escala (2 personas), todo entra en planes gratuitos: Vercel + Supabase + R2 + Deezer. El costo solo aparece si acumulas muchos GB de video; ahí R2 es lo más barato por su egress gratis. **Verifica los límites vigentes de cada tier antes de decidir, cambian seguido.**

---

## 7. Gestión de medios: subir / eliminar fotos (menú de configuración)

Feature: que cualquiera de los dos pueda **subir** fotos nuevas y **eliminar** las
repetidas o no deseadas, desde un menú de configuración en la app (sin tocar el
manifiesto ni correr scripts). Reemplaza el flujo Python de la v1 (`import_photos.py`).

### Subir
Flujo propuesto (client → server action → storage + BD):
1. El usuario elige una o varias imágenes en un `<input type="file" multiple>`.
2. **Optimizar en el cliente antes de subir**: convertir a WebP y reescalar (~2000px,
   calidad ~80) con `canvas`/`createImageBitmap`, para no subir el original pesado.
   Generar también la miniatura (`thumbs/`). Esto mantiene la regla de "servir la
   versión optimizada, no el original" (§1).
3. Subir la clave `fotos/<slug>.webp` y `thumbs/<slug>.webp` **vía el adaptador**
   (`web/lib/storage`), nunca al SDK directo. Requiere agregar un método `upload(key, blob)`
   a la interfaz `StorageProvider` (hoy solo firma lectura).
4. `insert` en `media` con `owner_id = auth.uid()`, `storage_path`/`thumb_path`
   relativos, `descripcion`, y las fechas. Respetar `pickOldestDate` para
   `fecha_mostrada` (la fecha REAL la pone el usuario en el formulario, porque la
   metadata de WhatsApp miente — misma lección de la v1).

Decisiones ⚠️ a validar:
- ¿Optimización en cliente (más simple, sin servidor) o en una Edge Function
  (más control, pero más piezas)? Recomiendo **cliente** a esta escala.
- Slug/nombre: derivar de la descripción o pedir un nombre; evitar colisiones
  (sufijo incremental si la clave existe).
- Detección de repetidas al subir: comparar por hash del archivo o por nombre,
  avisar antes de duplicar.

### Eliminar (caso "repetida")
- Botón de eliminar en la vista de foto individual (`/foto/[id]`), visible para
  ambos (es material compartido) o solo para el `owner_id` — **decidir política**.
- La server action borra la fila de `media` y **también** los objetos del bucket
  (`fotos/` y `thumbs/`) vía el adaptador (agregar `remove(key)` a la interfaz).
- Cuidado con el orden y con borrados en cascada: `likes`/`comments`/`media_music`
  de esa foto deben irse con ella (FK `on delete cascade` o borrado explícito).
- Confirmación previa (modal), porque es destructivo e irreversible.

### RLS necesaria (cuando se implemente)
- `media`: hoy solo hay lectura. Agregar policy de **INSERT** (`with_check owner_id = auth.uid()`)
  y de **DELETE** (dueño, o ambos — según la decisión de arriba).
- Storage: policies del bucket `media` para permitir `insert`/`delete` a
  autenticados en las carpetas `fotos/` y `thumbs/`.

Prioridad sugerida: después del núcleo social (likes/comentarios) y antes de
Momentos, porque desbloquea que dejen de depender de ti para meter fotos.
