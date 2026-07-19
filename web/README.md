# Nuestra Historia — Web (Next.js)

Frontend nuevo (Next.js + TypeScript + Tailwind) que reemplaza al sitio estático.
Lee de Supabase y sirve imágenes privadas con URLs firmadas, detrás de un
adaptador de storage intercambiable (Supabase hoy, Cloudflare R2 mañana).

## Arranque local

```bash
cd web
npm install
cp .env.example .env.local      # y rellena tus llaves de Supabase
npm run dev                     # http://localhost:3000
```

Requisitos previos (ver `../supabase/SETUP.md`):
- Esquema (`schema.sql`) + datos (`seed.sql`) cargados.
- Bucket `media` creado + `storage.sql` aplicado + imágenes subidas.
- 2 usuarios creados en Supabase Auth (whitelist).

## Estructura

```
web/
├─ app/
│  ├─ login/page.tsx          Login por email + contraseña (base confiable)
│  ├─ auth/callback/route.ts  (Reservado para magic-link/passkey futuro)
│  ├─ feed/page.tsx           Feed inicial (thumbs firmados en lote)
│  ├─ layout.tsx, page.tsx    Layout raíz + redirección
│  └─ globals.css             Tailwind + hueco para tu CSS legado
├─ lib/
│  ├─ supabase/               Clientes client/server (SSR)
│  ├─ storage/                ADAPTADOR: types + supabase + r2 + index
│  └─ media.ts                Acceso a datos + resolución de URLs firmadas
└─ middleware.ts              Guard de sesión (sin sesión -> /login)
```

## El seam modular (Supabase ↔ R2)

Toda la app pide URLs a `lib/storage` → `storage.getUrl(key)`. Nadie más habla
con el proveedor. Migrar a R2 = implementar `R2StorageProvider` (plantilla ya
puesta en `lib/storage/r2.ts`) y cambiar `STORAGE_PROVIDER=r2`. La BD no cambia:
las claves (`fotos/x.webp`) son idénticas. Ambos proveedores usan URLs firmadas,
así que el patrón ya es portable.

## Passkey / WebAuthn (siguiente capa, NO incluida aún)

Decisión de diseño: el acceso base es **email + contraseña** (confiable, 2
usuarios creados en Supabase Auth). No requiere SMTP ni redirect URLs. Passkey
se añade **encima** como acceso rápido, no como único muro.

Plan cuando lo implementes:
1. `npm i @simplewebauthn/browser @simplewebauthn/server`
2. Rutas API: `/api/auth/passkey/register-options`, `/verify-registration`,
   `/authenticate-options`, `/verify-authentication`.
3. Guardar credenciales en la tabla `webauthn_credentials` (ya existe).
4. Tras verificar la firma en el servidor, emitir la sesión de Supabase.
   ⚠️ Este último paso (enlazar la verificación WebAuthn con una sesión de
   Supabase) es el que debes validar con cuidado: se hace con la Admin API
   (service_role, solo en el servidor) generando un enlace/token y estableciendo
   la sesión. Nunca expongas la service_role al cliente.

## Despliegue (Vercel)

- Root Directory del proyecto en Vercel: `web`.
- Variables de entorno: las mismas de `.env.local`.
- Repo puede ser **privado** (Vercel lo soporta en plan gratis).
