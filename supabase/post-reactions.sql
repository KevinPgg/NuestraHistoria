-- =============================================================
-- Reacciones de post ILIMITADAS (6 tipos). Un usuario puede reaccionar cuantas
-- veces quiera. Reemplazan al like único (post_likes, que queda sin uso).
-- Ya aplicada vía MCP (migración post_reactions_ilimitadas). Registro canónico.
-- =============================================================

create table if not exists public.post_reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  tipo       text not null check (tipo in ('encanta','divierte','estremece','enoja','asombra','excelenchi')),
  created_at timestamptz default now()
);
create index if not exists post_reactions_post_idx on public.post_reactions (post_id);
create index if not exists post_reactions_user_idx on public.post_reactions (user_id);

alter table public.post_reactions enable row level security;
create policy "post_reactions lectura" on public.post_reactions
  for select using (auth.role() = 'authenticated');
create policy "post_reactions propias" on public.post_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Migración de los likes existentes → reacción 'encanta'.
insert into public.post_reactions (post_id, user_id, tipo, created_at)
  select post_id, user_id, 'encanta', created_at from public.post_likes
on conflict do nothing;
