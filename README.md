# 💌 Nuestra Historia

App privada para Kevin (novio) y Alejandra (novia): galería de recuerdos con feed,
likes, comentarios, momentos y música. Acceso restringido a dos correos.

> Migró de un sitio estático (GitHub Pages) a una app dinámica. La versión antigua
> está archivada en `_legacy/` y documentada en `HISTORICO.md`.

## Stack
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind — carpeta `web/`. Deploy en Vercel (Root Directory = `web`).
- **Backend**: Supabase (Postgres + Auth + Storage + RLS). project_id `lssgeeixxqcdbhidsxes`.
- **Storage**: bucket privado `media` (`fotos/` + `thumbs/`), WebP, URLs firmadas vía `web/lib/storage` (adaptador modular: Supabase hoy, Cloudflare R2 mañana sin tocar la BD).
- **Música**: Deezer API (búsqueda sin auth, preview 30s).

## Estructura
```
web/         # la app Next.js
supabase/    # schema.sql, seed.sql, storage.sql, profiles-setup.sql, SETUP.md
_legacy/     # sitio estático v1 (referencia)
```
Documentación: `ESTADO-ACTUAL.md` (retomada), `PLANIFICACION-MIGRACION.md` (diseño),
`CONTRIBUTING.md` (reglas), `HISTORICO.md` (memoria de la v1).

## Correr localmente
```bash
cd web
npm install
# crear .env.local con:
#   NEXT_PUBLIC_SUPABASE_URL=https://lssgeeixxqcdbhidsxes.supabase.co   (sin /rest/v1)
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   NEXT_PUBLIC_STORAGE_BUCKET=media
npm run dev   # http://localhost:3000
```

## Reglas rápidas
- Trabajo local; **Kevin hace todos los commits** tras revisar `git diff`.
- Todo acceso a imágenes pasa por `web/lib/storage`; `media.storage_path` guarda
  claves relativas (`fotos/x.webp`), nunca URLs.
- Cada recurso nuevo en Supabase necesita su **policy RLS**.

Detalle completo en `CONTRIBUTING.md`.
