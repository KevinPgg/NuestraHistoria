# Guía de instalación — Supabase (Nuestra Historia)

Pasos para dejar la base de datos lista. Tiempo estimado: ~20 min. Todo en plan gratuito.

## 1. Crear el proyecto
1. Entra a https://supabase.com → **New project**.
2. Nombre: `nuestra-historia`. Región: la más cercana a ti.
3. Guarda la **Database password** que te genera (la necesitarás).
4. Espera ~2 min a que se aprovisione.

## 2. Crear el esquema
1. En el panel: **SQL Editor → New query**.
2. Pega el contenido de `supabase/schema.sql` y dale **Run**.
3. ⚠️ Antes de correr, edita al final del archivo el correo de tu novia en `allowed_emails`.
4. Debe terminar sin errores. Esto crea tablas, RLS y la whitelist.

## 3. Cargar tus fotos actuales (datos)
1. **SQL Editor → New query**.
2. Pega el contenido de `supabase/seed.sql` y **Run**.
3. Inserta las 122 fotos con su descripción y fecha. Es idempotente: puedes re-correrlo.
   - `storage_path` = `fotos/<archivo>.webp` y `thumb_path` = `thumbs/<archivo>.webp`. Son **claves relativas al bucket**, no URLs. La URL firmada se genera en tiempo de ejecución.
   - ⚠️ Ya corriste una versión anterior con extensiones originales. **Vuelve a correr este `seed.sql`**: el `on conflict` ahora actualiza también `storage_path`/`thumb_path`, así que las rutas quedarán apuntando a los `.webp` sin duplicar filas.

## 4. Crear los 2 usuarios
1. **Authentication → Users → Add user** (o usa "Send invitation").
2. Crea exactamente 2: tu correo y el de tu novia (los mismos de la whitelist).
3. Si intentas crear un correo fuera de la whitelist, el trigger lo rechaza. Esa es tu barrera de privacidad.
4. Tras el primer login, edita `profiles.rol` de cada uno a `'novio'` / `'novia'` (Table Editor).

## 5. Almacenamiento de imágenes
Tus imágenes ya están convertidas a WebP en `media-webp/` (carpetas `fotos/` y `thumbs/`), con los nombres exactos que espera el seed.

### 5.1 Crear el bucket
1. **Storage → New bucket**.
2. Name: `media`.
3. **Public bucket: OFF** (privado). Esto es clave para la privacidad.
4. **Additional configuration**:
   - *File size limit*: `50 MB` (holgura para videos cortos futuros).
   - *Allowed MIME types* (opcional pero recomendado): `image/webp, image/jpeg, image/png, video/mp4, video/webm`.
5. **Save**.

### 5.2 Aplicar políticas de acceso
- En **SQL Editor**, corre `supabase/storage.sql`. Deja el bucket accesible solo a usuarios autenticados (los 2 de la whitelist). Sin sesión, ni las imágenes ni sus miniaturas son accesibles.

### 5.3 Subir los archivos
- Dentro del bucket `media`, crea dos carpetas: `fotos` y `thumbs`.
- Sube el contenido de `media-webp/fotos/` → `media/fotos/`.
- Sube el contenido de `media-webp/thumbs/` → `media/thumbs/`.
- Respeta los nombres: el seed apunta a `fotos/<archivo>.webp` y `thumbs/<archivo>.webp`.
- La carga desde el panel usa rol de servicio, así que funciona aunque las políticas estén activas.

### 5.4 Cómo se sirven (URLs firmadas)
- El bucket es privado: no hay URL pública. La app genera una **signed URL** temporal por imagen, solo para usuarios con sesión:
  ```js
  const { data } = await supabase
    .storage.from('media')
    .createSignedUrl(media.storage_path, 3600); // 1h
  // data.signedUrl -> úsala en <img src>
  ```
- Para el feed usa `thumb_path`; al abrir la foto, `storage_path`.

### 5.5 Cuando crezca (Cloudflare R2)
- Mismo esquema de carpetas `fotos/` y `thumbs/`. Como `storage_path` es relativo, solo cambias qué servicio resuelve la clave; la BD no se toca. R2 conviene para video por su egress gratis.

> En ambos casos: sube la versión **optimizada** (WebP ~2000px / video comprimido). El original sin comprimir va a Google Drive como respaldo, no al sitio.

## 6. Llaves para el frontend
- **Project Settings → API**: copia `Project URL` y `anon public key`.
- Esas dos van en el `.env.local` de Next.js (NUNCA subas la `service_role` al front ni a git).
- Tu `.gitignore` ya debe excluir `.env*`.

## 7. Passkey / WebAuthn (login)
- Supabase emite la sesión; la verificación de la passkey se hace en el app layer con **@simplewebauthn/server** (en una Edge Function o ruta API de Next.js) y **@simplewebauthn/browser** en el cliente.
- Las credenciales públicas se guardan en la tabla `webauthn_credentials` (ya creada).
- Flujo: registras la passkey una vez por dispositivo → en logins posteriores el dispositivo (Face ID / huella / Windows Hello) firma el reto → la Edge Function valida la firma → Supabase crea la sesión.
- Esto te da "desbloqueo con cara" real, sin entrenar ningún modelo y sin exponer tu rostro.

## 8. Verificación final
- Logueado: deberías ver las 122 fotos. Sin sesión: nada (RLS bloquea todo).
- Crea un `momento` privado con un usuario y confirma que el otro NO lo ve hasta marcarlo `public`.

---
### Re-generar el seed
Si editas descripciones o agregas fotos en `cardRegistros.js`:
```
node supabase/migrate.mjs          # usa tu copia de trabajo
```
Vuelve a correr el `seed.sql` resultante en el SQL Editor.
