-- =============================================================
-- Destacados (estilo "historias destacadas") sobre `momentos`.
-- Cada `momento` es una burbuja de destacado de un usuario. Reutiliza
-- momentos + momento_media (que estaban vacías) en vez de tablas nuevas.
-- Ya aplicada en el proyecto vía MCP (migración destacados_sobre_momentos).
-- Este archivo queda como registro canónico.
-- =============================================================

alter table public.momentos
  add column if not exists cover_media_id uuid references public.media(id) on delete set null,
  add column if not exists orden int not null default 0;

create index if not exists momentos_owner_orden_idx
  on public.momentos (owner_id, orden, created_at desc);

create index if not exists momento_media_orden_idx
  on public.momento_media (momento_id, orden);

-- Notas de uso:
--  * La app inserta momentos con visibilidad = 'public' para que la pareja los
--    vea en el perfil. La RLS existente ya permite: dueño siempre, otros si es
--    'public'. La escritura sigue restringida al dueño (owner_id = auth.uid()).
--  * La portada (cover_media_id) es opcional; si falta, la UI usa el primer
--    item por `orden`.
