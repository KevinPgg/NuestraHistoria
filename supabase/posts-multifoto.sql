-- =============================================================
-- POSTS: la unidad del feed pasa de "foto" a "post" (álbum de 1..N fotos).
-- Social (likes/comentarios/música/votos de borrado) a nivel POST.
-- Ya aplicada vía MCP (migración posts_multifoto_feed). Registro canónico.
-- NOTA: la migración también sembró 1 post por cada media existente y copió su
-- social 1:1 (columna temporal _seed_media_id, ya eliminada).
-- =============================================================

create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid references public.profiles(id) on delete set null,
  descripcion    text,
  fecha_mostrada timestamptz,
  created_at     timestamptz default now()
);
create index if not exists posts_fecha_idx on public.posts (fecha_mostrada desc);

create table if not exists public.post_media (
  post_id  uuid not null references public.posts(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  orden    int not null default 0,
  primary key (post_id, media_id)
);
create index if not exists post_media_orden_idx on public.post_media (post_id, orden);

-- Enlace de una foto suelta (pool/perfil) a su post de origen.
alter table public.media add column if not exists origin_post_id uuid
  references public.posts(id) on delete set null;

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  texto text not null,
  created_at timestamptz default now()
);
create table if not exists public.post_music (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  track_id uuid not null references public.music_tracks(id) on delete cascade,
  unique (post_id)
);
create table if not exists public.post_delete_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

alter table public.posts             enable row level security;
alter table public.post_media        enable row level security;
alter table public.post_likes        enable row level security;
alter table public.post_comments     enable row level security;
alter table public.post_music        enable row level security;
alter table public.post_delete_votes enable row level security;

create policy "posts lectura" on public.posts for select using (auth.role() = 'authenticated');
create policy "posts insert" on public.posts for insert with check (auth.role() = 'authenticated');
create policy "posts update" on public.posts for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "posts delete con 2 votos" on public.posts for delete using (
  (select count(distinct v.user_id) from public.post_delete_votes v where v.post_id = posts.id) >= 2
);
create policy "post_media lectura" on public.post_media for select using (auth.role() = 'authenticated');
create policy "post_media escritura" on public.post_media for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "post_likes lectura" on public.post_likes for select using (auth.role() = 'authenticated');
create policy "post_likes propios" on public.post_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "post_comments lectura" on public.post_comments for select using (auth.role() = 'authenticated');
create policy "post_comments propios" on public.post_comments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "post_music lectura" on public.post_music for select using (auth.role() = 'authenticated');
create policy "post_music escritura" on public.post_music for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "post_delete_votes lectura" on public.post_delete_votes for select using (auth.role() = 'authenticated');
create policy "post_delete_votes propios" on public.post_delete_votes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Modelo final (4 capas):
--   media (pool de fotos) — profile_media (grid de perfil) — momentos (destacados)
--   posts + post_media (feed / álbumes). Subir 1 foto crea media + post(1). Un
--   álbum = post con varias media del pool. Borrar un post NO borra las fotos.
