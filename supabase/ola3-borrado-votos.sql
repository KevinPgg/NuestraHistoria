-- =============================================================
-- Ola 3 — Borrado de fotos con 2 votos (novio + novia)
-- Ejecutar en: Supabase Studio > SQL Editor > New query
-- Idempotente. Revisa antes de correr (tu flujo: revisar-luego-aplicar).
-- =============================================================

-- Voto de un usuario para eliminar una foto. Con exactamente 2 cuentas
-- (novio/novia), 2 votos distintos == ambos de acuerdo.
create table if not exists public.media_delete_votes (
  media_id   uuid not null references public.media(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (media_id, user_id)
);

alter table public.media_delete_votes enable row level security;

-- Ambos ven los votos (para mostrar "tu pareja ya votó").
drop policy if exists "delete_votes lectura" on public.media_delete_votes;
create policy "delete_votes lectura" on public.media_delete_votes
  for select using (auth.role() = 'authenticated');

-- Cada quien inserta/borra solo su propio voto.
drop policy if exists "delete_votes propios" on public.media_delete_votes;
create policy "delete_votes propios" on public.media_delete_votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -------------------------------------------------------------
-- Endurecer el borrado de `media`: la política vieja "for all"
-- permitía a cualquiera borrar directo. La partimos en insert/update
-- libres para la pareja + delete SOLO si existen 2 votos distintos.
-- Así el candado vive en la BD, no solo en el front.
-- -------------------------------------------------------------
drop policy if exists "media escritura pareja" on public.media;

drop policy if exists "media insert pareja" on public.media;
create policy "media insert pareja" on public.media
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "media update pareja" on public.media;
create policy "media update pareja" on public.media
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "media delete con 2 votos" on public.media;
create policy "media delete con 2 votos" on public.media
  for delete using (
    (
      select count(distinct v.user_id)
      from public.media_delete_votes v
      where v.media_id = media.id
    ) >= 2
  );
