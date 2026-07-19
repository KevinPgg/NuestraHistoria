-- Identidad de perfiles. Ejecuta en SQL Editor.

-- 1. BACKFILL: crea filas de perfil para usuarios que ya existían
--    antes del trigger (los que creaste a mano en Authentication).
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
where u.email in (select email from public.allowed_emails)
on conflict (id) do nothing;

insert into public.user_settings (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- 2. Asigna nombre y rol. Ajusta a tu gusto.
update public.profiles
set nombre = 'Kevin', rol = 'novio'
where email = 'kevinpalaciosgg@outlook.com';

update public.profiles
set nombre = 'Alejandra', rol = 'novia'
where email = 'alenaviaponguillo@gmail.com';

-- 3. Verifica (deben salir 2 filas con nombre y rol):
-- select email, nombre, rol from public.profiles;
