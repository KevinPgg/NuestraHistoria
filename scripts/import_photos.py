"""
import_photos.py — Importador de fotos nuevas al portal "Nuestra Historia"
==========================================================================

Objetivo
--------
Facilitar subir fotos nuevas (con su fecha REAL y descripción) al sitio sin
editar JSON/JS a mano. Pensado para fotos de WhatsApp, donde la metadata
guarda la fecha de descarga (incorrecta) y la fecha real solo la tienes tú
(en el nombre original de WhatsApp, que copiaste al manifiesto).

Qué hace, dada una carpeta:
  1. Copia las imágenes nuevas a  ../img/
  2. Upsert en  ../base/photoDates.json  -> escribe la fecha del manifiesto en
     fechaCreacion Y fechaUltimaModificacion (la web muestra la MÁS ANTIGUA
     de esas dos, así que ambas = fecha correcta => se ve la fecha correcta).
  3. Upsert en  ../base/cardRegistros.js  -> agrega/actualiza la entrada del
     array photoData[] con { filename, descripcion, fecha }.

Formato del archivo manifiesto (.md o .txt dentro de la carpeta)
----------------------------------------------------------------
RECOMENDADO (robusto, no depende del orden) — incluye el nombre del archivo:

    nombre_final.jpg [2025-11-30T20:15:00; Descripción de la foto]
    nombre_final.jpg;2025-11-30T20:15:00;Descripción de la foto

POSICIONAL (sin nombre) — una línea por foto, SOLO fecha y descripción:

    2025-05-02 at 10.35.06 AM;Descripción de la foto

  En modo posicional la línea N se asocia a la imagen N ordenada por FECHA DE
  GUARDADO del archivo (mtime ascendente) = el orden en que metiste las fotos
  en la carpeta. Funciona si escribiste el manifiesto en ese mismo orden.
  OJO: es una heurística; revisa el resultado. Para asegurar el pareo usa
  primero  --emit-named  (ver abajo).

Formatos de fecha aceptados (con o sin hora):
    2025-11-30T20:15:00 | 2025-11-30 20:15:00 | 2025-11-30 20:15 | 2025-11-30
    2025-08-15T20:17:10+00:00   (ISO con zona — el que genera --emit-named)
    2025-05-02 at 10.35.06 AM   (formato nombre de WhatsApp)
    2025-05-02 at 10.35 AM
    30/11/2025 20:15:00 | 30/11/2025
  Sin hora se usa 12:00:00 y se avisa. La hora SÍ importa para ordenar.

Uso
---
    cd scripts/
    python import_photos.py <carpeta>                       # importa
    python import_photos.py <carpeta> --dry-run             # previsualiza
    python import_photos.py <carpeta> --emit-named <out.md> # genera manifiesto
                                                            # con nombres para
                                                            # revisar/corregir
    python import_photos.py <carpeta> --manifest <file.md>  # usa ESE manifiesto
    python import_photos.py --init <carpeta>                # crea plantilla
    python import_photos.py                                 # pregunta la carpeta

Flujo seguro recomendado para muchas fotos sin nombre en el manifiesto:
    1) python import_photos.py imagenesPorAgregar --emit-named revisado.md
    2) Abre revisado.md, corrige los pares que estén mal (cambia el NOMBRE).
    3) python import_photos.py imagenesPorAgregar --manifest revisado.md --dry-run
    4) python import_photos.py imagenesPorAgregar --manifest revisado.md

Sin dependencias externas (solo stdlib). No toca extract_metadata.py ni
dateOverrides.json (esos siguen sirviendo para el corpus viejo / EXIF).
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

# ── Rutas ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
IMG_DIR = PROJECT_DIR / "img"
PHOTO_DATES = PROJECT_DIR / "base" / "photoDates.json"
CARD_REGISTROS = PROJECT_DIR / "base" / "cardRegistros.js"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"}
MANIFEST_EXTS = {".md", ".txt"}

DATE_FORMATS = [
    "%Y-%m-%dT%H:%M:%S.%f%z",    # ISO con microsegundos y zona
    "%Y-%m-%dT%H:%M:%S%z",       # ISO con zona: 2025-08-15T20:17:10+00:00
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%dT%H:%M",
    "%Y-%m-%d %H:%M",
    "%Y-%m-%d at %I.%M.%S %p",   # nombre WhatsApp: 2025-05-02 at 10.35.06 AM
    "%Y-%m-%d at %I.%M %p",      # WhatsApp sin segundos
    "%Y-%m-%d",
    "%d/%m/%Y %H:%M:%S",
    "%d/%m/%Y %H:%M",
    "%d/%m/%Y",
]
DATE_ONLY_FORMATS = {"%Y-%m-%d", "%d/%m/%Y"}


# ── Utilidades ────────────────────────────────────────────────────────────────

def info(msg: str) -> None:
    print(msg)


def warn(msg: str) -> None:
    print(f"⚠️  {msg}")


def fail(msg: str) -> None:
    print(f"❌  {msg}")
    sys.exit(1)


def parse_fecha(raw: str) -> tuple[str, bool]:
    """Devuelve (iso_utc, hora_fue_default). Lanza ValueError si no parsea."""
    raw = raw.strip()
    for fmt in DATE_FORMATS:
        try:
            dt = datetime.strptime(raw, fmt)
        except ValueError:
            continue
        hora_default = fmt in DATE_ONLY_FORMATS
        if hora_default:
            dt = dt.replace(hour=12, minute=0, second=0)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat(), hora_default
    raise ValueError(f"No pude interpretar la fecha: '{raw}'")


# ── Parseo del manifiesto ─────────────────────────────────────────────────────

# nombre.ext [fecha; descripcion]
RE_NAMED_BRACKET = re.compile(
    r"^(?P<name>\S+\.(?:jpe?g|png|webp|gif|heic))\s*\[\s*(?P<fecha>[^;]+?)\s*;\s*(?P<desc>.*?)\s*\]\s*$",
    re.IGNORECASE,
)
# nombre.ext;fecha;descripcion
RE_NAMED_SEMI = re.compile(
    r"^(?P<name>\S+\.(?:jpe?g|png|webp|gif|heic))\s*;\s*(?P<fecha>[^;]+?)\s*;\s*(?P<desc>.*)$",
    re.IGNORECASE,
)
# [fecha; descripcion]   (posicional, sin nombre)
RE_POS_BRACKET = re.compile(r"^\[\s*(?P<fecha>[^;]+?)\s*;\s*(?P<desc>.*?)\s*\]\s*$")
# fecha;descripcion  (posicional, sin nombre, sin corchetes)
RE_POS_SEMI = re.compile(r"^(?P<fecha>[^;\[]+?)\s*;\s*(?P<desc>.*)$")


def parse_manifest(text: str) -> tuple[list[dict], list[dict]]:
    """Devuelve (entradas_con_nombre, entradas_posicionales) en orden de archivo."""
    named: list[dict] = []
    positional: list[dict] = []
    for lineno, raw in enumerate(text.splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#") or line.startswith("//"):
            continue
        m = RE_NAMED_BRACKET.match(line) or RE_NAMED_SEMI.match(line)
        if m:
            named.append({
                "lineno": lineno,
                "name": m.group("name"),
                "fecha_raw": m.group("fecha"),
                "desc": m.group("desc").strip(),
            })
            continue
        m = RE_POS_BRACKET.match(line) or RE_POS_SEMI.match(line)
        if m:
            positional.append({
                "lineno": lineno,
                "fecha_raw": m.group("fecha"),
                "desc": m.group("desc").strip(),
            })
            continue
        warn(f"Línea {lineno} ignorada (no coincide con ningún formato): {line}")
    return named, positional


# ── Lectura/escritura de photoDates.json ──────────────────────────────────────

def load_photo_dates() -> list[dict]:
    if not PHOTO_DATES.exists():
        return []
    with open(PHOTO_DATES, encoding="utf-8") as f:
        return json.load(f)


def save_photo_dates(data: list[dict]) -> None:
    with open(PHOTO_DATES, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def upsert_photo_date(data: list[dict], filename: str, iso: str) -> str:
    """Inserta o actualiza la entrada. Pone la fecha en AMBOS campos de fecha
    para que pickOldestDate() de la web devuelva la fecha correcta.
    Devuelve 'nuevo' o 'actualizado'."""
    entry = {
        "filename": filename,
        "fechaCreacion": iso,
        "fechaUltimaModificacion": iso,
        "fechaMejor": iso,
        "source": "md_import",
        "needsManualDate": False,
    }
    for i, item in enumerate(data):
        if item.get("filename") == filename:
            data[i] = entry
            return "actualizado"
    data.append(entry)
    return "nuevo"


# ── Lectura/escritura de cardRegistros.js ─────────────────────────────────────

RE_PHOTODATA_BLOCK = re.compile(
    r"(const\s+photoData\s*=\s*\[)(?P<body>.*?)(\r?\n[ \t]*\]\s*;?)",
    re.DOTALL,
)
RE_ENTRY = re.compile(
    r"\{\s*"
    r"filename:\s*'(?P<filename>(?:[^'\\]|\\.)*)'\s*,\s*"
    r"descripcion:\s*'(?P<descripcion>(?:[^'\\]|\\.)*)'\s*,\s*"
    r"fecha:\s*'(?P<fecha>(?:[^'\\]|\\.)*)'\s*,?\s*"
    r"\}",
    re.DOTALL,
)


def js_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").replace("\r", "")


def _simple_js_unescape(value: str) -> str:
    # Solo desescapamos \' y \\ que es lo que generamos/esperamos.
    return value.replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")


def parse_card_registros(text: str) -> tuple[list[dict], "re.Match"]:
    block = RE_PHOTODATA_BLOCK.search(text)
    if not block:
        fail("No encontré 'const photoData = [ ... ];' en cardRegistros.js")
    entries = []
    for m in RE_ENTRY.finditer(block.group("body")):
        entries.append({
            "filename": _simple_js_unescape(m.group("filename")),
            "descripcion": _simple_js_unescape(m.group("descripcion")),
            "fecha": _simple_js_unescape(m.group("fecha")),
        })
    return entries, block


def render_entries(entries: list[dict], nl: str = "\n") -> str:
    parts = []
    for e in entries:
        parts.append(
            "  {" + nl
            + "    filename: '" + js_escape(e["filename"]) + "'," + nl
            + "    descripcion: '" + js_escape(e["descripcion"]) + "'," + nl
            + "    fecha: '" + js_escape(e["fecha"]) + "'" + nl
            + "  }"
        )
    return nl + ("," + nl).join(parts)


def upsert_card_entry(entries: list[dict], filename: str, desc: str, iso: str) -> str:
    for e in entries:
        if e["filename"] == filename:
            e["descripcion"] = desc
            e["fecha"] = iso
            return "actualizado"
    entries.append({"filename": filename, "descripcion": desc, "fecha": iso})
    return "nuevo"


# ── Plantilla ─────────────────────────────────────────────────────────────────

TEMPLATE = """# Manifiesto de importación — Nuestra Historia
# Una línea por foto. Formato recomendado (incluye el nombre del archivo):
#
#   nombre_final.jpg [2025-11-30T20:15:00; Descripción de la foto]
#
# La fecha puede ir con o sin hora. La hora SÍ importa para ordenar fotos
# del mismo día. Las líneas que empiezan con # se ignoran.
#
# Ejemplo:
# aleyo-cena.jpg [2025-11-30T20:15:00; Cena de aniversario en el centro]
# aleyo-parque.jpg [2025-12-01T16:40:00; Caminata en el parque, frío rico]
"""


# ── Flujo principal ───────────────────────────────────────────────────────────

def find_manifest(folder: Path) -> Path:
    candidates = [p for p in folder.iterdir()
                  if p.is_file() and p.suffix.lower() in MANIFEST_EXTS]
    if not candidates:
        fail(f"No encontré un .md/.txt en {folder}")
    if len(candidates) > 1:
        warn(f"Hay varios manifiestos; uso el primero: {candidates[0].name}. "
             f"Usa --manifest <archivo> para elegir uno explícitamente.")
    return candidates[0]


def collect_images(folder: Path) -> "dict[str, Path]":
    """name -> Path, ordenado por mtime ascendente (orden de guardado)."""
    imgs = [p for p in folder.iterdir()
            if p.is_file() and p.suffix.lower() in IMAGE_EXTS]
    imgs.sort(key=lambda p: p.stat().st_mtime)
    return {p.name: p for p in imgs}


def build_associations(folder: Path, manifest: "Path | None" = None) -> list[dict]:
    if manifest is None:
        manifest = find_manifest(folder)
    info(f"📄  Manifiesto: {manifest}")
    named, positional = parse_manifest(manifest.read_text(encoding="utf-8"))
    images = collect_images(folder)  # ya viene en orden mtime ascendente
    if not images:
        fail(f"No hay imágenes en {folder}")
    info(f"🖼️   Imágenes en la carpeta: {len(images)}")

    assoc: list[dict] = []
    used: set = set()

    # 1) Entradas con nombre explícito (robustas)
    for item in named:
        name = item["name"]
        if name not in images:
            warn(f"Línea {item['lineno']}: '{name}' no existe en la carpeta. Se omite.")
            continue
        try:
            iso, hdef = parse_fecha(item["fecha_raw"])
        except ValueError as e:
            warn(f"Línea {item['lineno']}: {e}. Se omite.")
            continue
        if hdef:
            warn(f"Línea {item['lineno']}: '{name}' sin hora; uso 12:00:00.")
        assoc.append({"filename": name, "fecha": iso, "desc": item["desc"],
                      "src": images[name]})
        used.add(name)

    # 2) Entradas posicionales (fallback) -> imágenes restantes en orden mtime
    if positional:
        remaining = [n for n in images if n not in used]  # dict mantiene orden mtime
        warn(f"{len(positional)} línea(s) posicionales (sin nombre). "
             f"Emparejo con {len(remaining)} imagen(es) restantes por ORDEN DE "
             f"GUARDADO (mtime). Verifica el resultado abajo.")
        if len(positional) != len(remaining):
            warn(f"Cantidades NO coinciden: {len(positional)} líneas vs "
                 f"{len(remaining)} imágenes. Empareja hasta el mínimo.")
        for item, name in zip(positional, remaining):
            try:
                iso, hdef = parse_fecha(item["fecha_raw"])
            except ValueError as e:
                warn(f"Línea {item['lineno']}: {e}. Se omite.")
                continue
            if hdef:
                warn(f"Línea {item['lineno']}: '{name}' sin hora; uso 12:00:00.")
            assoc.append({"filename": name, "fecha": iso, "desc": item["desc"],
                          "src": images[name]})
            used.add(name)

    sin_asociar = [n for n in images if n not in used]
    if sin_asociar:
        warn(f"{len(sin_asociar)} imagen(es) sin línea en el manifiesto (no se importan): "
             + ", ".join(sin_asociar))

    return assoc


def emit_named_manifest(assoc: list[dict], out_path: Path) -> None:
    """Escribe un manifiesto con el nombre ya incrustado, en el mismo orden de
    pareo (mtime), para que el usuario revise y corrija antes de importar."""
    lines = [
        "# Manifiesto con nombres incrustados (revisar y corregir si hace falta).",
        "# Cada línea ya empareja una imagen con su fecha y descripción.",
        "# Si un par está mal, cambia el NOMBRE al inicio de la línea.",
        "",
    ]
    for a in assoc:
        lines.append(f"{a['filename']} [{a['fecha']}; {a['desc']}]")
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    info(f"📝  Manifiesto con nombres escrito: {out_path}")
    info("    Revísalo, corrige los pares incorrectos, y luego importa con:")
    info(f"    python import_photos.py <carpeta> --manifest {out_path.name}")


def write_changes(assoc: list[dict]) -> None:
    # 1) Copiar imágenes a img/
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    for a in assoc:
        shutil.copy2(a["src"], IMG_DIR / a["filename"])
    info(f"\n📥  Imágenes copiadas a img/: {len(assoc)}")

    # 2) photoDates.json
    pd = load_photo_dates()
    n_new = 0
    n_upd = 0
    for a in assoc:
        r = upsert_photo_date(pd, a["filename"], a["fecha"])
        n_new += r == "nuevo"
        n_upd += r == "actualizado"
    save_photo_dates(pd)
    info(f"🗓️   photoDates.json: {n_new} nuevas, {n_upd} actualizadas")

    # 3) cardRegistros.js  (preservando el estilo de salto de línea original)
    with open(CARD_REGISTROS, "r", encoding="utf-8", newline="") as f:
        text = f.read()
    nl = "\r\n" if "\r\n" in text else "\n"
    entries, block = parse_card_registros(text)
    c_new = 0
    c_upd = 0
    for a in assoc:
        r = upsert_card_entry(entries, a["filename"], a["desc"], a["fecha"])
        c_new += r == "nuevo"
        c_upd += r == "actualizado"
    new_block = block.group(1) + render_entries(entries, nl) + block.group(3)
    new_text = text[:block.start()] + new_block + text[block.end():]
    with open(CARD_REGISTROS, "w", encoding="utf-8", newline="") as f:
        f.write(new_text)
    info(f"📝  cardRegistros.js: {c_new} nuevas, {c_upd} actualizadas")

    info("\n✅  Listo. Revisa los cambios con 'git diff' antes de commitear.")


def run(folder: Path, dry_run: bool, emit_named: "Path | None",
        manifest: "Path | None") -> None:
    assoc = build_associations(folder, manifest)
    if not assoc:
        fail("No se asoció ninguna imagen. Revisa el manifiesto.")

    info("\n── Asociaciones (orden de guardado / mtime) ──")
    for a in assoc:
        desc = a["desc"][:55] + ("…" if len(a["desc"]) > 55 else "")
        info(f"  {a['fecha'][:19]}  {a['filename']:<26} {desc}")

    if emit_named is not None:
        emit_named_manifest(assoc, emit_named)
        return

    if dry_run:
        info(f"\n🔎  DRY-RUN: no se escribió nada. ({len(assoc)} foto(s) listas)")
        return

    write_changes(assoc)


def main() -> None:
    args = list(sys.argv[1:])
    dry_run = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]

    emit_named = None
    if "--emit-named" in args:
        i = args.index("--emit-named")
        if i + 1 >= len(args):
            fail("Uso: python import_photos.py <carpeta> --emit-named <salida.md>")
        emit_named = Path(args[i + 1]).expanduser().resolve()
        del args[i:i + 2]

    manifest = None
    if "--manifest" in args:
        i = args.index("--manifest")
        if i + 1 >= len(args):
            fail("Uso: python import_photos.py <carpeta> --manifest <archivo.md>")
        manifest = Path(args[i + 1]).expanduser().resolve()
        del args[i:i + 2]

    if args and args[0] == "--init":
        if len(args) < 2:
            fail("Uso: python import_photos.py --init <carpeta>")
        folder = Path(args[1]).expanduser().resolve()
        folder.mkdir(parents=True, exist_ok=True)
        dest = folder / "manifiesto.md"
        if dest.exists():
            fail(f"Ya existe {dest}")
        dest.write_text(TEMPLATE, encoding="utf-8")
        info(f"✅  Plantilla creada: {dest}")
        return

    if args:
        folder = Path(args[0]).expanduser().resolve()
    else:
        raw = input("Carpeta con las fotos nuevas + manifiesto: ").strip().strip('"')
        folder = Path(raw).expanduser().resolve()

    if not folder.is_dir():
        fail(f"No es una carpeta válida: {folder}")

    if manifest is not None and not manifest.is_file():
        fail(f"El manifiesto indicado no existe: {manifest}")

    info("=" * 64)
    info("  import_photos.py — Importar fotos nuevas al portal")
    info("=" * 64)
    info(f"Carpeta: {folder}\n")
    run(folder, dry_run, emit_named, manifest)


if __name__ == "__main__":
    main()
