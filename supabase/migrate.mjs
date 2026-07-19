// =============================================================
// Migración: cardRegistros.js + photoDates.json + dateOverrides.json
//            -> supabase/seed.sql  (INSERTs para la tabla media)
//
// Uso:  node supabase/migrate.mjs
//
// Reglas de fecha (prioridad de mayor a menor):
//   1. dateOverrides.json (fecha manual)
//   2. cardRegistros.js (fecha que ya muestra el front)
//   3. photoDates.json -> fechaMejor
//
// NO toca tus archivos originales. Solo lee y genera seed.sql.
// =============================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// NH_SRC permite migrar desde otra copia (ej. la versión commiteada en git).
// Por defecto usa la raíz del proyecto (tu copia de trabajo).
const ROOT = process.env.NH_SRC || join(__dirname, '..');

// ---- helpers ----
const sqlStr = (v) =>
  v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
const sqlTs = (v) => (v ? `'${v}'::timestamptz` : 'NULL');

function oldest(a, b) {
  const da = a ? Date.parse(a) : NaN;
  const db = b ? Date.parse(b) : NaN;
  if (isNaN(da)) return b || null;
  if (isNaN(db)) return a || null;
  return da <= db ? a : b;
}

// ---- 1. cardRegistros.js (fuente canónica del front) ----
// El archivo es JS con `const photoData = [ ... ]`. Extraemos el array
// recortando desde el primer '[' tras photoData hasta su ']' balanceado
// y lo evaluamos en un sandbox mínimo (objeto literal JS).
function parseCardRegistros(text) {
  const start = text.indexOf('[', text.indexOf('photoData'));
  let depth = 0, end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  const arrSrc = text.slice(start, end + 1);
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${arrSrc});`)();
}

// ---- 2. photoDates.json (tolerante a coma final / falta de ]) ----
function parseLooseJsonArray(text) {
  let t = text.trim();
  if (!t.endsWith(']')) t = t.replace(/,\s*$/, '') + '\n]';
  t = t.replace(/,(\s*[\]}])/g, '$1'); // quita comas colgantes
  return JSON.parse(t);
}

// ---- cargar fuentes ----
const cards = parseCardRegistros(
  readFileSync(join(ROOT, 'base', 'cardRegistros.js'), 'utf8')
);
const photoDates = parseLooseJsonArray(
  readFileSync(join(ROOT, 'base', 'photoDates.json'), 'utf8')
);
const overrides = JSON.parse(
  readFileSync(join(ROOT, 'scripts', 'dateOverrides.json'), 'utf8')
);

const datesByFile = Object.fromEntries(photoDates.map((d) => [d.filename, d]));

// ---- fusionar: union de filenames (cards manda en descripción) ----
const byFile = new Map();
for (const c of cards) byFile.set(c.filename, { ...c });
for (const d of photoDates)
  if (!byFile.has(d.filename)) byFile.set(d.filename, { filename: d.filename });

const rows = [];
for (const [filename, c] of byFile) {
  const pd = datesByFile[filename] || {};
  const fechaCreacion = pd.fechaCreacion || null;
  const fechaModif = pd.fechaUltimaModificacion || null;

  // fecha mostrada con prioridad
  let fechaMostrada =
    overrides[filename] ||
    c.fecha ||
    pd.fechaMejor ||
    oldest(fechaCreacion, fechaModif);

  // normalizar override 'YYYY-MM-DD' a timestamptz
  if (overrides[filename] && /^\d{4}-\d{2}-\d{2}$/.test(overrides[filename]))
    fechaMostrada = overrides[filename] + 'T12:00:00+00:00';

  const ext = (filename.split('.').pop() || '').toLowerCase();
  const tipo = ['mp4', 'mov', 'webm', 'm4v'].includes(ext) ? 'video' : 'photo';

  rows.push({
    tipo,
    storage_path: `fotos/${filename.replace(/\.[^.]*$/, '')}.webp`,  // clave .webp relativa al bucket
    thumb_path: `thumbs/${filename.replace(/\.[^.]*$/, '')}.webp`,    // miniatura ligera para el feed
    filename_original: filename,
    descripcion: c.descripcion || null,
    fecha_creacion: fechaCreacion,
    fecha_modificacion: fechaModif,
    fecha_mostrada: fechaMostrada,
  });
}

rows.sort((a, b) => (a.fecha_mostrada < b.fecha_mostrada ? 1 : -1));

// ---- generar SQL ----
const header = `-- Generado por supabase/migrate.mjs el ${new Date().toISOString()}
-- ${rows.length} registros. owner_id queda NULL: asígnalo después si lo deseas.
-- Idempotente por filename_original.
create unique index if not exists media_filename_uq on public.media (filename_original);
`;

const values = rows
  .map(
    (r) =>
      `  (${sqlStr(r.tipo)}, ${sqlStr(r.storage_path)}, ${sqlStr(r.thumb_path)}, ` +
      `${sqlStr(r.filename_original)}, ${sqlStr(r.descripcion)}, ` +
      `${sqlTs(r.fecha_creacion)}, ${sqlTs(r.fecha_modificacion)}, ${sqlTs(r.fecha_mostrada)})`
  )
  .join(',\n');

const sql = `${header}
insert into public.media
  (tipo, storage_path, thumb_path, filename_original, descripcion,
   fecha_creacion, fecha_modificacion, fecha_mostrada)
values
${values}
on conflict (filename_original) do update set
  tipo           = excluded.tipo,
  storage_path   = excluded.storage_path,
  thumb_path     = excluded.thumb_path,
  descripcion    = excluded.descripcion,
  fecha_mostrada = excluded.fecha_mostrada;
`;

writeFileSync(join(__dirname, 'seed.sql'), sql, 'utf8');
console.log(`OK -> supabase/seed.sql  (${rows.length} registros)`);
console.log(`   fotos: ${rows.filter((r) => r.tipo === 'photo').length}, videos: ${rows.filter((r) => r.tipo === 'video').length}`);
