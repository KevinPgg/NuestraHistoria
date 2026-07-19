# Estado actual — Nuestra Historia (2026-07-18)

App dinámica (v2). Migración desde el sitio estático completada; historia y código
de la v1 archivados en `_legacy/` y documentados en `HISTORICO.md`. Este doc es el
punto de retomada.

## Stack
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind, en `web/`. Deploy: Vercel (Root Directory = `web`).
- **Backend**: Supabase (Postgres + Auth + Storage + RLS). project_id `lssgeeixxqcdbhidsxes`. MCP de Supabase conectado.
- **Storage**: bucket privado `media` (`fotos/` + `thumbs/`), 122 fotos WebP. URLs firmadas vía adaptador `web/lib/storage` (Supabase hoy, R2 mañana sin tocar la BD).
- **Login**: email + contraseña. Usuarios: Kevin (novio), Alejandra (novia).

## Estructura del repo
```
├── web/                    # LA APP. Next.js + TS + Tailwind (deploy a Vercel).
├── supabase/               # BD del proyecto: schema.sql, seed.sql, storage.sql,
│                           #   profiles-setup.sql, SETUP.md. migrate.mjs = puente
│                           #   de migración v1→v2 (ya corrió; lee de _legacy/base/).
├── ESTADO-ACTUAL.md        # este doc — punto de retomada
├── PLANIFICACION-MIGRACION.md  # doc de diseño (modelo de datos, fases, decisiones)
├── README.md               # cómo correr la app
├── CONTRIBUTING.md         # reglas de trabajo (commits, storage, RLS, fechas)
├── HISTORICO.md            # memoria de la v1 estática (única fuente histórica)
├── _legacy/                # v1 archivada (código + docs originales). Referencia.
└── _originales-backup/     # originales JPG (gitignored) → mover a Drive y borrar
```

## Qué funciona hoy
- Login + guard de sesión (sin sesión → /login).
- Feed con las 122 fotos (thumbs firmados en lote, lazy load nativo).
- Vista de foto individual `/foto/[id]`: imagen full, descripción, fecha.
- Likes + comentarios por foto (server actions + RLS; eliminar comentario propio).
- Subir foto desde `/ajustes`: optimiza a WebP (full + thumb) en el cliente, sube
  por el adaptador de storage, inserta en `media` con fecha real elegida.
- Eliminar foto desde `/foto/[id]` (con confirmación): borra fila + objetos del
  bucket; likes/comentarios se van por ON DELETE CASCADE.
- Música Deezer por foto: buscador (proxy `/api/deezer`, resuelve CORS), preview
  30s, colgar/cambiar/quitar (`music_tracks` + `media_music`). Una canción por foto.
  Barra difuminada dentro de la foto + autoplay en loop.
- Navegación inferior (TabBar): Inicio (feed) / Pareja / Cartas.
- Sección Cartas (`/cartas`): hitos que se desbloquean por fecha desde 2025-05-30
  (`lib/milestones.ts`); minijuegos portados a React como gate (6m→tostones,
  12m→memory) antes de leer la carta. Tema Golden Hour.
- Sección Pareja (`/pareja`): contador de días + acceso a los dos perfiles.
- Perfil individual (`/perfil/[id]`): avatar circular editable (subir nueva o
  elegir de tus fotos), stats (publicaciones/likes/comentarios recibidos), y feed
  propio (grid de tus fotos). Subir foto desde el perfil alimenta el feed compartido.
- Subida reutilizable: `UploadButton` (modal con `UploadForm`), usable en perfil y ajustes.
- Foto en tamaño completo (lightbox), barra de música transparente con bordes
  difuminados, y autoplay que re-resuelve el preview de Deezer (arregla canciones
  viejas que no sonaban por URL caducada).

## Pendiente grande (fases siguientes)
- **Fase B — Post view**: subir 1 foto / varias (canción global o por foto) / video
  ≤30s. Requiere decidir modelo (reusar `momentos` o tabla `posts`), refactor del
  feed a "posts", y camino de subida directa cliente→bucket para videos (pesan más
  que el límite de Server Actions).
- **Fase C — Historias**: efímeras 24h con textos sobre la foto + música. Requiere
  tabla con `expires_at` + job de limpieza automática (cron). "Efímero" = se borra
  solo, no "no se guarda".
- Header con identidad por usuario (novio azul / novia rosa) + link a Ajustes + logout.
- BD completa con RLS; scripts en `supabase/` (schema, seed, storage, profiles-setup).

## Cómo correr
```bash
cd web
npm install
# .env.local con: NEXT_PUBLIC_SUPABASE_URL (sin /rest/v1),
#   NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_STORAGE_BUCKET=media
npm run dev   # http://localhost:3000
```

## Cola de features (orden sugerido)
1. **Vista de foto individual + likes/comentarios** — ✅ en curso. Ruta `/foto/[id]`
   lista; feed muestra las 122 con lazy load nativo. Likes/comentarios: las policies
   RLS **ya existían** (lectura autenticados, escritura solo propia); implementados
   con server actions + UI. Subir/eliminar fotos = feature aparte (ver
   PLANIFICACION §7).
2. **Música Deezer** — ✅ hecho (foto individual). Pendiente futuro: música en
   Momentos (`media_music.momento_id` ya soportado).
3. **Momentos/recuerdos** — slideshow + selector; visibilidad public/private (RLS ya modelada).
4. **Favoritas top-N** — `user_settings.favoritas_count` (10..30, paso 5).
5. **Editar descripción con historial** — `media_desc_history`, razón ≤150 chars.
6. **Minijuegos para cartas** (portados de la v1) — tostones/memory como React. Ver
   plan de mejora en `HISTORICO.md` §3. Prioridad baja.
7. **Perfiles novio/novia estilo red social** (bloqueante, al final).
8. **Passkey/WebAuthn** — capa de acceso rápido; tabla `webauthn_credentials` lista.
9. **Deploy Vercel + repo privado**.

## Recordatorios técnicos
- En Supabase, cada tabla/recurso nuevo necesita su **policy RLS**; crear la fila o subir el archivo no da acceso solo.
- `media.storage_path`/`thumb_path` son claves relativas (`fotos/x.webp`) — no URLs. Mantener así para la portabilidad a R2.
- Todo acceso a imágenes pasa por `web/lib/storage` (Supabase hoy, R2 mañana).
- Para música: Deezer (Spotify deprecó `preview_url`).
- Kevin hace todos los commits tras revisar `git diff`.
- `web/` NO importa nada de `_legacy/`: la app nueva es autocontenida.
