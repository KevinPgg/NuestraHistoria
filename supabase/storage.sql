-- =============================================================
-- Políticas de Storage para el bucket privado 'media'
-- Ejecuta en: Supabase Studio > SQL Editor, DESPUÉS de crear el bucket 'media'.
-- Objetivo: solo usuarios autenticados (los 2 de la whitelist) leen/escriben.
-- =============================================================

-- Lectura: cualquier autenticado puede leer objetos del bucket 'media'
create policy "media lectura autenticados"
  on storage.objects for select
  using ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Subida
create policy "media subida autenticados"
  on storage.objects for insert
  with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Reemplazo / actualización
create policy "media update autenticados"
  on storage.objects for update
  using ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Borrado
create policy "media borrado autenticados"
  on storage.objects for delete
  using ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Nota: al subir desde el panel de Supabase (dashboard) usas rol de servicio,
-- así que la carga manual inicial funciona aunque estas políticas estén activas.
-- Estas políticas gobiernan el acceso desde la app (anon key + sesión).
