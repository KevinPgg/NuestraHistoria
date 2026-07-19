-- =============================================================
-- El perfil = selección curada del pool compartido (no "lo que subiste").
-- Relación usuario × foto. Ya aplicada vía MCP (migración perfil_seleccion_del_pool).
-- Registro canónico.
-- =============================================================

create table if not exists public.profile_media (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  media_id   uuid not null references public.media(id) on delete cascade,
  orden      int not null default 0,
  created_at timestamptz default now(),
  primary key (user_id, media_id)
);

create index if not exists profile_media_user_orden_idx
  on public.profile_media (user_id, orden, created_at desc);

alter table public.profile_media enable row level security;

create policy "profile_media lectura pareja" on public.profile_media
  for select using (auth.role() = 'authenticated');
create policy "profile_media propia" on public.profile_media
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Semilla: lo que cada quien ya había subido entra a su perfil.
insert into public.profile_media (user_id, media_id)
  select owner_id, id from public.media where owner_id is not null
on conflict do nothing;

-- Modelo resultante (3 capas, estilo Instagram):
--   media (pool compartido / feed)  →  profile_media (tu grid de perfil)
--   →  momentos + momento_media (destacados agrupados).
-- Subir una foto la mete al pool (media) y al perfil del que sube (profile_media).
