# 🛠️ Guía de contribución — Nuestra Historia (v2)

Reglas y flujo de trabajo de la app Next.js + Supabase. Para la v1 estática ver `HISTORICO.md`.

## Flujo de trabajo
- Trabajo **local**. **Kevin hace todos los commits** tras revisar `git diff`. Nadie
  más commitea por él (incluidas herramientas/IA).
- Ramas de trabajo por feature: `feat/foto-individual`, `feat/likes-comentarios`,
  `fix/...`. `main` es la rama estable.

## Formato de commits
```
feat: vista de foto individual
fix: policy de escritura en likes
docs: actualizo ESTADO-ACTUAL con cola de features
chore: reorganizo repo, archivo v1 en _legacy/
```

## Storage (regla dura)
- **Todo acceso a imágenes pasa por `web/lib/storage`.** Nunca llamar al SDK de
  Supabase Storage directo desde componentes.
- `media.storage_path` / `thumb_path` guardan **claves relativas** (`fotos/x.webp`),
  **nunca URLs**. Esto mantiene la portabilidad a Cloudflare R2 sin migrar la BD.
- Las URLs firmadas se generan al vuelo, en lote, desde el adaptador.

## Supabase / RLS (regla dura)
- Cada tabla o recurso nuevo necesita su **policy RLS**. Crear la fila o subir el
  archivo NO da acceso por sí solo.
- Al depurar, usar el **MCP de Supabase** (project_id `lssgeeixxqcdbhidsxes`) para
  ejecutar SQL y leer logs, en vez de adivinar.
- Regla de privacidad: solo los 2 correos en whitelist tienen sesión. `momentos`
  con `visibilidad='private'` se ven solo para su `owner_id`.

## Música
- Deezer (Spotify deprecó `preview_url` en nov-2024). Endpoint público
  `GET https://api.deezer.com/search?q=` → campo `preview` (.mp3 30s). Cache en
  `music_tracks`, enlace a foto vía `media_music`.

## Fechas
- La fecha mostrada de una foto = la más antigua entre creación y modificación
  (`pickOldestDate`). Se preservó desde la v1 (`supabase/migrate.mjs`).

## Originales
- Los JPG originales NO van al repo. Viven en `_originales-backup/` (gitignored);
  respaldar en Drive y borrar del disco. La app sirve WebP desde el bucket privado.

## Lo que NO hacer
- No commitear `.env.local` ni claves.
- No versionar imágenes originales ni `node_modules/`.
- No acceder a Storage sin pasar por `web/lib/storage`.
- No crear tablas/recursos en Supabase sin su policy RLS.
