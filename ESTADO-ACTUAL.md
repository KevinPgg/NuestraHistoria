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
- Navegación inferior (TabBar): Inicio (feed) / Destacados / Pareja / Cartas.
  "Destacados" redirige a tu propio perfil (ahí viven ahora las burbujas).
- Sección Cartas (`/cartas`): hitos que se desbloquean por fecha desde 2025-05-30
  (`lib/milestones.ts`); minijuegos portados a React como gate (6m→tostones,
  12m→memory) antes de leer la carta. Tema Golden Hour.
- Sección Pareja (`/pareja`): contador de días + acceso a los dos perfiles.
- **POSTS (álbumes multi-foto en el PERFIL, estilo Instagram)**. Modelo definitivo:
  **Inicio (`/feed`) = el POOL** de fotos sueltas (subir/explorar). **El perfil
  "Mi feed" = los POSTS del usuario** (cada uno álbum de 1..N fotos del pool, con
  descripción y música). Los posts se crean DESDE el perfil ("Crear post"). Un
  post con >1 foto muestra el ícono de tarjetas apiladas; abrirlo = carrusel
  deslizable (flechas + puntos + contador 1/3 + zoom) con su música (autoplay loop).
  Tablas `posts`+`post_media`; social a nivel POST (`post_likes`/`post_comments`/
  `post_music`/`post_delete_votes`); `posts.author_id` = dueño del perfil. Stats de
  perfil = nº de posts + likes/comentarios sobre ellos. Crear post: elegir del pool
  o subir nueva + descripción + música (Deezer, `MusicPicker`). Borrar post = 2
  votos, NO borra las fotos del pool. Subir en Inicio = solo agrega al pool (no crea
  post). Código: `lib/posts.ts` (getFeedPosts/getUserPosts/getPostDetail),
  `lib/postSocial.ts`, `lib/postMusic.ts`, `app/post/actions.ts` (createPost con
  música) + `app/post/[id]/actions.ts`, vista `app/post/[id]/page.tsx`, componentes
  `PostCarousel`, `PostMusicBar`, `MusicPicker`, `CreatePost`, `PostLikeButton`,
  `PostCommentForm`, `PostDeleteButton`. SQL: `supabase/posts-multifoto.sql`.
  OBSOLETO tras esto: `profile_media` + `ProfileFeed`/`ProfileFeedEditor` +
  `lib/profileMedia.ts` (el perfil ya no es selección de fotos sueltas sino posts);
  quedaron sin uso, se pueden borrar. `/foto/[id]` sigue como visor de una foto del
  pool (con su social por-foto; secundario). Los ~125 posts auto-creados por la
  migración anterior con author NULL quedan huérfanos (invisibles); los 3 de Kevin
  aparecen en su perfil.
- **Reacciones ILIMITADAS en el post** (reemplazan el like único). Botón
  "🙂 Reaccionar" abre una burbuja con 6 tipos: ❤️ Me encanta, 😂 Me divierte,
  😏 Me estremece, 😠 Me enoja, 😮 Me asombra, 👌 Excelenchi. Cada toque suma una
  (sin límite); se ven los conteos por tipo y hay "deshacer". Tabla `post_reactions`
  (sin unique). Código: `lib/reactions.ts`, `PostReactions.tsx`, `addReaction`/
  `undoMyReaction`. SQL: `supabase/post-reactions.sql`. El stat de perfil pasó de
  "Me encanta" a "Reacciones". `post_likes` y `PostLikeButton.tsx` quedaron sin uso.
- **Borrado**: un POST lo borra solo su autor, con confirmación (RLS `author_id =
  auth.uid()`). El borrado por 2 votos (novio+novia) es solo para fotos del POOL
  (`/foto`, requiere correr `ola3-borrado-votos.sql`).
- **Archivos obsoletos (borrables)**: `lib/favorites.ts`, `lib/profileMedia.ts`,
  `components/FavoriteButton.tsx`, `ProfileFeed.tsx`, `ProfileFeedEditor.tsx`,
  `PostLikeButton.tsx`, `PostMusic.tsx`. Tablas sin uso: `favorites`, `profile_media`,
  `post_likes`, `webauthn_credentials`.

## Despliegue a Vercel (checklist)
1. `cd web && npm run build` en local — que compile sin errores (obligatorio; el
   sandbox no puede verificarlo).
2. Correr en Supabase (SQL Editor) lo pendiente: `supabase/ola3-borrado-votos.sql`
   (para que el borrado por 2 votos del pool funcione). El resto de migraciones ya
   están aplicadas vía MCP.
3. Panel de Supabase → Authentication → Passkeys: activar + RP ID = dominio de
   producción (ej. `nuestra-historia.vercel.app`) + RP origins https. Sin esto el
   biométrico no funciona en producción.
4. Vercel: Root Directory = `web`. Variables de entorno (de `web/.env`):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_STORAGE_BUCKET=media`, `STORAGE_PROVIDER=supabase`.
5. Tras el primer deploy, ajustar el RP ID/origins de passkeys al dominio real si
   cambió.
- **Modelo pool → perfil → destacados (estilo Instagram)**: `media` es el POOL
  compartido (feed). El perfil de cada usuario es una SELECCIÓN curada del pool
  (tabla `profile_media`, RLS: pareja lee, cada quien edita el suyo), no "lo que
  subió". Subir una foto (desde el feed, el perfil o Ajustes) la mete al pool Y al
  perfil de quien sube. Desde el perfil puedes "+ Agregar fotos" (elegir del pool o
  subir) y "Editar" para quitar. `/feed` ahora tiene botón "Subir foto" visible.
  Los stats de perfil (publicaciones/likes/comentarios) se cuentan sobre
  `profile_media`. Código: `lib/profileMedia.ts`, acciones `addToProfile`/
  `removeFromProfile` en `app/perfil/actions.ts`, `components/ProfileFeed.tsx` +
  `ProfileFeedEditor.tsx`. SQL: `supabase/perfil-seleccion-pool.sql` (aplicado vía
  MCP; sembró cada perfil con lo que ese usuario ya había subido).
- Perfil individual (`/perfil/[id]`): avatar circular editable (elige de cualquier
  foto del pool o sube una), stats, feed del perfil (selección) y burbujas de
  destacados. Los selectores de perfil y destacados eligen del pool completo.
- **Destacados (burbujas tipo "historias destacadas")** en el perfil, arriba del
  feed propio, independientes por usuario. Reemplazan a las favoritas-estrella
  (obsoletas: `web/lib/favorites.ts` y `web/components/FavoriteButton.tsx` quedaron
  inertes, se pueden borrar). Modelo: reusa `momentos` (burbuja: título, portada
  `cover_media_id`, `orden`) + `momento_media` (fotos). Burbuja "+" (solo en tu
  perfil) crea uno; el editor deja **elegir fotos existentes o subir nuevas** (las
  nuevas también entran al feed). Visor del grupo con gestión (agregar, portada,
  quitar, renombrar, borrar). Código: `lib/highlights.ts`, `app/destacados/actions.ts`,
  `components/HighlightsBar|HighlightEditor|HighlightViewer.tsx`. SQL:
  `supabase/destacados-momentos.sql` (ya aplicado en Supabase vía MCP).
- **Login biométrico (passkey / WebAuthn)** con la API NATIVA de Supabase
  (experimental, `supabase-js` ≥ 2.105; instalado 2.109). Botón "Entrar con huella
  / Face ID" en `/login` (`signInWithPasskey`) además de email+contraseña (respaldo).
  Registro/gestión del dispositivo en `/ajustes` (`components/PasskeyManager.tsx`:
  `registerPasskey`, `auth.passkey.list/delete`). Flag `experimental.passkey` en
  `lib/supabase/client.ts`. NO usa la tabla `webauthn_credentials` (Supabase guarda
  las credenciales). ⚠️ Requiere pasos manuales de Kevin (ver abajo).
- **PWA instalable** (arregla que el icono abriera una pestaña del navegador):
  `app/manifest.ts` (display standalone), iconos corazón en `public/icons/`,
  service worker mínimo `public/sw.js` (SIN caché — las URLs firmadas expiran),
  registrado por `components/ServiceWorkerRegister.tsx`; metadata PWA/appleWebApp
  en `app/layout.tsx`.

## ⚠️ Pasos manuales pendientes (Kevin) — para que el biométrico funcione
1. **Panel de Supabase → Authentication → Passkeys**: activar "Enable Passkey
   authentication".
2. **Relying Party**: RP ID = tu DOMINIO de producción SIN esquema/puerto/ruta
   (ej. `nuestra-historia.vercel.app` o tu dominio propio). RP Origins = el/los
   origen(es) https (ej. `https://nuestra-historia.vercel.app`). OJO: cambiar el
   RP ID después INVALIDA las passkeys ya registradas — elígelo estable.
3. En `localhost` funciona para probar (WebAuthn permite loopback sin https).
4. Flujo: entra con contraseña → Ajustes → "Registrar este dispositivo" → luego ya
   puedes usar "Entrar con huella / Face ID".
- Subida reutilizable: `UploadButton` (modal con `UploadForm`), usable en perfil y ajustes.
- Foto en tamaño completo (lightbox), barra de música transparente con bordes
  difuminados, y autoplay que re-resuelve el preview de Deezer (arregla canciones
  viejas que no sonaban por URL caducada).

## Plan futuro (marcado explícitamente)
- **Rediseño del feed / inicio**: hoy muestra todas las imágenes en plano (aburrido).
  Objetivo: tarjetas deslizables mostrando detalles como si estuvieran seleccionadas
  (caja de texto funcional, descripción, vista del original). Es rediseño de UX del
  feed, va en su propio bloque.
- ~~Biométrico (passkey / WebAuthn)~~ ✅ HECHO (2026-07-19) con la API nativa de
  Supabase, no SimpleWebAuthn. Ver arriba. Falta solo la config del panel (pasos
  manuales). La tabla `webauthn_credentials` quedó SIN uso (se puede borrar).

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
