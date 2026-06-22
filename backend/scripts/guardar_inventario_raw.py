"""
Obtiene el inventario FBA crudo desde el reporte de Amazon
GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA y lo guarda en backend/docs/
con timestamp.

Uso
---
    cd backend
    .venv/bin/python scripts/guardar_inventario_raw.py
"""

import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from integrations.amazon.reports_client import obtener_reporte_inventario_fba

DOCS_DIR = Path(__file__).resolve().parent.parent / "docs"
DOCS_DIR.mkdir(exist_ok=True)

forzar_nuevo = "--fresco" in sys.argv
filas = obtener_reporte_inventario_fba(forzar_nuevo=forzar_nuevo)

timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
archivo = DOCS_DIR / f"amazon_inventario_raw_{timestamp}.json"

archivo.write_text(
    json.dumps(filas, indent=2, ensure_ascii=False),
    encoding="utf-8",
)

print(f"\nGuardado: {archivo}")
print(f"Total filas: {len(filas)}")
