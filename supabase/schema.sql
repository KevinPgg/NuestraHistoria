-- =============================================================
-- Nuestra Historia — Esquema de base de datos (Supabase / Postgres)
-- Ejecuta este archivo en: Supabase Studio > SQL Editor > New query
-- Idempotente en lo posible. Pensado para 2 usuarios (pareja).
-- =============================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- =============================================================
-- 1. PERFILES Y AJUSTES
-- =============================================================

-- Whitelist de correos permitidos. Solo estos podrán tener cuenta.
create table if not exists public.allowed_emails (
  email text primary key
);

-- Perfil 1:1 con auth.users
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text unique not null,
  nombre     text,
  rol        text check (rol in ('novio','novia')),
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.user_settings (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  favoritas_count int default 10 check (favoritas_count in (10,15,20,25,30))
);

-- Crear perfil automáticamente al registrarse, solo si el correo está permitido.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.allowed_emails a where a.email = new.email) then
    raise exception 'Correo no autorizado: %', new.email;
  end if;
  insert into public.profiles (id, email) values (new.id, new.email)
    on conflict (id) do nothing;
  insert into public.user_settings (user_id) values (new.id)
    on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- 2. MEDIA (fotos / videos)
-- =============================================================

create table if not exists public.media (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid references public.profiles(id) on delete set null,
  tipo                text not null default 'photo' check (tipo in ('photo','video')),
  storage_path        text not null,              -- ruta en el bucket (R2 / Supabase Storage)
  thumb_path          text,
  filename_original   text,                       -- nombre legado (ej. ale.jpg)
  descripcion         text,
  fecha_creacion      timestamptz,
  fecha_modificacion  timestamptz,
  fecha_mostrada      timestamptz,                -- = pickOldestDate(creacion, modificacion) / override
  created_at          timestamptz default now()
);
create index if not exists media_fecha_idx on public.media (fecha_mostrada desc);

-- Historial de ediciones de descripción
create table if not exists public.media_desc_history (
  id                uuid primary key default gen_random_uuid(),
  media_id          uuid not null references public.media(id) on delete cascade,
  user_id           uuid references public.profiles(id) on delete set null,
  descripcion_nueva text,
  razon             varchar(150),
  fecha             timestamptz default now()
);

-- =============================================================
-- 3. INTERACCIONES (likes, comentarios, favoritas)
-- =============================================================

create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  media_id   uuid not null references public.media(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (media_id, user_id)
);

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  media_id   uuid not null references public.media(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete set null,
  texto      text not null,
  created_at timestamptz default now()
);

create table if not exists public.favorites (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references public.profiles(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  rank     int,
  unique (user_id, media_id)
);

-- Perfil = selección curada del pool. Ver supabase/perfil-seleccion-pool.sql.
create table if not exists public.profile_media (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  media_id   uuid not null references public.media(id) on delete cascade,
  orden      int not null default 0,
  created_at timestamptz default now(),
  primary key (user_id, media_id)
);
create index if not exists profile_media_user_orden_idx
  on public.profile_media (user_id, orden, created_at desc);

-- =============================================================
-- 4. MOMENTOS / RECUERDOS  +  MÚSICA (Deezer)
-- =============================================================

-- momentos = "destacados" (historias destacadas). Cada uno es una burbuja de un
-- usuario con portada y orden. Ver supabase/destacados-momentos.sql.
create table if not exists public.momentos (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  titulo         text,
  visibilidad    text not null default 'private' check (visibilidad in ('public','private')),
  cover_media_id uuid references public.media(id) on delete set null,
  orden          int not null default 0,
  created_at     timestamptz default now()
);
create index if not exists momentos_owner_orden_idx
  on public.momentos (owner_id, orden, created_at desc);

create table if not exists public.momento_media (
  momento_id uuid not null references public.momentos(id) on delete cascade,
  media_id   uuid not null references public.media(id) on delete cascade,
  orden      int default 0,
  primary key (momento_id, media_id)
);

-- Cache de pistas de Deezer (preview .mp3 30s, sin auth)
create table if not exists public.music_tracks (
  id         uuid primary key default gen_random_uuid(),
  deezer_id  bigint unique,
  title      text,
  artist     text,
  cover_url  text,
  preview_url text
);

-- "Colgar" música a una foto o a un momento (uno de los dos)
create table if not exists public.media_music (
  id         uuid primary key default gen_random_uuid(),
  track_id   uuid not null references public.music_tracks(id) on delete cascade,
  media_id   uuid references public.media(id) on delete cascade,
  momento_id uuid references public.momentos(id) on delete cascade,
  check (num_nonnulls(media_id, momento_id) = 1)   -- exactamente uno
);

-- =============================================================
-- 5. PASSKEYS / WEBAUTHN
-- Las credenciales públicas se guardan aquí; la verificación se hace
-- en el app layer (SimpleWebAuthn) o una Edge Function. Ver SETUP.md.
-- =============================================================

create table if not exists public.webauthn_credentials (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  credential_id text unique not null,   -- base64url
  public_key   text not null,
  counter      bigint default 0,
  device_label text,
  created_at   timestamptz default now()
);

-- =============================================================
-- 6. ROW LEVEL SECURITY
-- Principio: sin sesión válida no se ve NADA. Entre la pareja se
-- comparte todo, salvo momentos marcados como 'private'.
-- =============================================================

alter table public.profiles            enable row level security;
alter table public.user_settings        enable row level security;
alter table public.media                 enable row level security;
alter table public.media_desc_history    enable row level security;
alter table public.likes                 enable row level security;
alter table public.comments              enable row level security;
alter table public.favorites             enable row level security;
alter table public.momentos              enable row level security;
alter table public.momento_media         enable row level security;
alter table public.music_tracks          enable row level security;
alter table public.media_music           enable row level security;
alter table public.webauthn_credentials  enable row level security;

-- Perfiles: ambos se ven; cada quien edita el suyo
create policy "perfiles visibles a autenticados" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "edita tu perfil" on public.profiles
  for update using (auth.uid() = id);

-- Ajustes: solo los tuyos
create policy "tus ajustes" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Media: compartida entre la pareja (lectura/escritura para autenticados)
create policy "media lectura pareja" on public.media
  for select using (auth.role() = 'authenticated');
create policy "media escritura pareja" on public.media
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Historial de descripciones: visible a autenticados; inserta cualquiera
create policy "hist lectura" on public.media_desc_history
  for select using (auth.role() = 'authenticated');
create policy "hist insert" on public.media_desc_history
  for insert with check (auth.uid() = user_id);

-- Likes / comentarios / favoritas
create policy "likes lectura" on public.likes
  for select using (auth.role() = 'authenticated');
create policy "likes propios" on public.likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "comentarios lectura" on public.comments
  for select using (auth.role() = 'authenticated');
create policy "comentarios propios" on public.comments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "favoritas propias" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Selección de perfil: la pareja ve ambos; cada quien edita el suyo
alter table public.profile_media enable row level security;
create policy "profile_media lectura pareja" on public.profile_media
  for select using (auth.role() = 'authenticated');
create policy "profile_media propia" on public.profile_media
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Momentos: ves los tuyos siempre; los del otro solo si son 'public'
create policy "momentos visibles" on public.momentos
  for select using (
    auth.uid() = owner_id or visibilidad = 'public'
  );
create policy "momentos propios escritura" on public.momentos
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "momento_media visible" on public.momento_media
  for select using (
    exists (
      select 1 from public.momentos m
      where m.id = momento_id
        and (m.owner_id = auth.uid() or m.visibilidad = 'public')
    )
  );
create policy "momento_media escritura" on public.momento_media
  for all using (
    exists (select 1 from public.momentos m where m.id = momento_id and m.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.momentos m where m.id = momento_id and m.owner_id = auth.uid())
  );

-- Música: catálogo compartido
create policy "music lectura" on public.music_tracks
  for select using (auth.role() = 'authenticated');
create policy "music escritura" on public.music_tracks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "media_music lectura" on public.media_music
  for select using (auth.role() = 'authenticated');
create policy "media_music escritura" on public.media_music
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Passkeys: cada quien gestiona las suyas
create policy "passkeys propias" on public.webauthn_credentials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================================
-- 7. SEMILLA DE WHITELIST  (EDITA estos correos)
-- =============================================================
insert into public.allowed_emails (email) values
  ('kevinpalaciosgg@outlook.com'),
  ('correo-de-tu-novia@gmail.com')   -- <-- CAMBIA ESTO
on conflict do nothing;
