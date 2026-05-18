"""
extract_metadata.py — Extractor inteligente de fechas para fotos
================================================================
Uso:
    cd scripts/
    python extract_metadata.py

Genera / actualiza:
    ../base/photoDates.json   — fechas listas para el sitio web
    dateOverrides.json        — plantilla con fotos que necesitan fecha manual

Prioridad de fechas (de más a menos confiable):
    1. dateOverrides.json     (manual, siempre gana)
    2. EXIF DateTimeOriginal  (fecha real de captura)
    3. EXIF DateTime          (fecha de procesado/edición)
    4. mtime del archivo      (fecha de modificación del sistema)
    5. → marcada como needsManualDate=True si ninguna es confiable
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# ── Instalación automática de Pillow si no está disponible ──────────────────
try:
    from PIL import Image
    from PIL.ExifTags import TAGS
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("⚠️  Pillow no instalado. Ejecuta: pip install Pillow")
    print("   Solo se usarán fechas del sistema de archivos.\n")

# ── Rutas ────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
IMG_DIR      = SCRIPT_DIR.parent / "img"
OUTPUT_JSON  = SCRIPT_DIR.parent / "base" / "photoDates.json"
OVERRIDES    = SCRIPT_DIR / "dateOverrides.json"

# Si una foto fue copiada más de N días DESPUÉS de su mtime, sospechamos
# que la fecha de creación no es real.
SUSPICIOUS_DELTA_DAYS = 30

# ── Formatos EXIF ─────────────────────────────────────────────────────────────
EXIF_DATE_FORMATS = [
    "%Y:%m:%d %H:%M:%S",   # estándar EXIF
    "%Y-%m-%d %H:%M:%S",   # variante
    "%Y/%m/%d %H:%M:%S",   # variante
]

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".gif"}


# ── Funciones utilitarias ─────────────────────────────────────────────────────

def to_iso(dt: datetime) -> str:
    """Convierte datetime a ISO 8601 con timezone UTC."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def parse_exif_date(value: str) -> datetime | None:
    """Intenta parsear una cadena de fecha EXIF con múltiples formatos."""
    if not value:
        return None
    value = value.strip()
    for fmt in EXIF_DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def get_exif_dates(img_path: Path) -> dict:
    """
    Extrae las fechas relevantes del EXIF de una imagen.
    Devuelve un dict con claves: original, digitized, modified (o None).
    """
    result = {"original": None, "digitized": None, "modified": None}

    if not PIL_AVAILABLE:
        return result

    try:
        with Image.open(img_path) as img:
            exif_data = img._getexif()  # None si no tiene EXIF
            if not exif_data:
                return result

            tag_map = {TAGS.get(k, k): v for k, v in exif_data.items()}

            result["original"]  = parse_exif_date(tag_map.get("DateTimeOriginal", ""))
            result["digitized"] = parse_exif_date(tag_map.get("DateTimeDigitized", ""))
            result["modified"]  = parse_exif_date(tag_map.get("DateTime", ""))
    except Exception:
        pass

    return result


def get_file_dates(img_path: Path) -> dict:
    """Devuelve fechas de creación y modificación del sistema de archivos."""
    stat = img_path.stat()
    mtime = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc)

    # En Linux/Mac no hay ctime real de creación — usamos mtime como fallback
    try:
        ctime = datetime.fromtimestamp(stat.st_birthtime, tz=timezone.utc)
    except AttributeError:
        ctime = datetime.fromtimestamp(stat.st_ctime, tz=timezone.utc)

    return {"creacion": ctime, "modificacion": mtime}


def is_suspicious(file_dates: dict, exif_dates: dict) -> bool:
    """
    Retorna True si la fecha de creación del archivo parece ser la del
    día en que se copió/transfirió, no la foto real.

    Señales de sospecha:
    - No hay EXIF DateTimeOriginal
    - La fecha de creación es significativamente MÁS RECIENTE que mtime
    """
    if exif_dates.get("original"):
        return False  # Si hay EXIF confiable, no es sospechoso

    creacion     = file_dates.get("creacion")
    modificacion = file_dates.get("modificacion")

    if creacion and modificacion:
        delta_days = (creacion - modificacion).days
        if delta_days > SUSPICIOUS_DELTA_DAYS:
            return True

    return False


def pick_best_date(exif_dates: dict, file_dates: dict, override: str | None) -> tuple[str | None, str]:
    """
    Selecciona la mejor fecha disponible y retorna (iso_string, fuente).
    Fuentes posibles: manual, exif_original, exif_modified, mtime, none
    """
    if override:
        try:
            dt = datetime.fromisoformat(override)
            return to_iso(dt), "manual"
        except ValueError:
            pass

    if exif_dates.get("original"):
        return to_iso(exif_dates["original"]), "exif_original"

    if exif_dates.get("digitized"):
        return to_iso(exif_dates["digitized"]), "exif_digitized"

    if exif_dates.get("modified"):
        return to_iso(exif_dates["modified"]), "exif_modified"

    if file_dates.get("modificacion"):
        return to_iso(file_dates["modificacion"]), "mtime"

    return None, "none"


# ── Carga de overrides ────────────────────────────────────────────────────────

def load_overrides() -> dict:
    """
    Lee dateOverrides.json.
    Formato esperado:
    {
      "aleyo-casares.png": "2025-11-30T21:00:00+00:00",
      "mifoto.jpg": "2025-08-15"
    }
    """
    if not OVERRIDES.exists():
        return {}
    try:
        with open(OVERRIDES, encoding="utf-8") as f:
            data = json.load(f)
        return {k: v for k, v in data.items() if v and v != "YYYY-MM-DD"}
    except Exception as e:
        print(f"⚠️  Error leyendo dateOverrides.json: {e}")
        return {}


def save_overrides_template(needs_manual: list[str]):
    """
    Guarda / actualiza dateOverrides.json con las fotos que necesitan fecha manual.
    No sobreescribe entradas ya completadas.
    """
    existing = {}
    if OVERRIDES.exists():
        try:
            with open(OVERRIDES, encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            pass

    # Agrega nuevas entradas sin sobreescribir las que ya tienen valor
    for filename in needs_manual:
        if filename not in existing or not existing[filename] or existing[filename] == "YYYY-MM-DD":
            existing[filename] = "YYYY-MM-DD"

    with open(OVERRIDES, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)


# ── Proceso principal ─────────────────────────────────────────────────────────

def process_images() -> tuple[list, list]:
    """
    Procesa todas las imágenes en IMG_DIR.
    Retorna (resultados, lista_de_archivos_sospechosos).
    """
    if not IMG_DIR.exists():
        print(f"❌  Carpeta de imágenes no encontrada: {IMG_DIR}")
        sys.exit(1)

    overrides = load_overrides()
    results = []
    suspicious_files = []

    image_paths = sorted([
        p for p in IMG_DIR.iterdir()
        if p.suffix.lower() in SUPPORTED_EXTENSIONS
    ])

    if not image_paths:
        print(f"⚠️  No se encontraron imágenes en {IMG_DIR}")
        return [], []

    print(f"📷  Procesando {len(image_paths)} imágenes...\n")

    for img_path in image_paths:
        filename = img_path.name
        exif  = get_exif_dates(img_path)
        files = get_file_dates(img_path)
        override = overrides.get(filename)

        suspicious = is_suspicious(files, exif) and not override
        best_date, source = pick_best_date(exif, files, override)

        status_icon = "✅" if source in ("manual", "exif_original", "exif_digitized") else (
                      "⚠️ " if suspicious else "📅")

        print(f"  {status_icon} {filename:<40} [{source}]"
              + (" ← NECESITA FECHA MANUAL" if suspicious else ""))

        result = {
            "filename": filename,
            "fechaCreacion": to_iso(files["creacion"]),
            "fechaUltimaModificacion": to_iso(files["modificacion"]),
            "fechaMejor": best_date,
            "source": source,
            "needsManualDate": suspicious,
        }

        if exif.get("original"):
            result["exifDateTimeOriginal"] = to_iso(exif["original"])

        results.append(result)

        if suspicious:
            suspicious_files.append(filename)

    return results, suspicious_files


def save_output(results: list):
    """
    Guarda photoDates.json en el formato que espera cardRegistros.js.
    Mantiene compatibilidad con los campos fechaCreacion y fechaUltimaModificacion,
    y añade fechaMejor y source como campos informativos extra.
    """
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n✅  photoDates.json guardado: {OUTPUT_JSON}")


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  extract_metadata.py — Extractor de fechas de fotos")
    print("=" * 60 + "\n")

    results, suspicious = process_images()

    if not results:
        return

    save_output(results)

    if suspicious:
        save_overrides_template(suspicious)
        print(f"\n⚠️  {len(suspicious)} foto(s) necesitan fecha manual:")
        for f in suspicious:
            print(f"    → {f}")
        print(f"\n   Edita scripts/dateOverrides.json y reemplaza 'YYYY-MM-DD'")
        print("   con la fecha real, luego vuelve a ejecutar el script.\n")
    else:
        print("\n🎉 Todas las fotos tienen fechas confiables. ¡Listo!\n")

    print(f"📊 Resumen:")
    print(f"   Total fotos procesadas : {len(results)}")
    print(f"   Con EXIF original      : {sum(1 for r in results if r['source'] == 'exif_original')}")
    print(f"   Con fecha manual       : {sum(1 for r in results if r['source'] == 'manual')}")
    print(f"   Usando mtime           : {sum(1 for r in results if r['source'] == 'mtime')}")
    print(f"   Necesitan revisión     : {len(suspicious)}")


if __name__ == "__main__":
    main()
