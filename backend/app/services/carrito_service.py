# services/carrito_service.py

import json
from datetime import datetime


def añadir_linea(db, linea_dict):
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO carrito_lineas (datos, fecha_creacion) VALUES (?, ?)",
        (json.dumps(linea_dict), datetime.now().isoformat())
    )
    db.commit()
    return cursor.lastrowid


def listar_lineas(db):
    cursor = db.cursor()
    cursor.execute("SELECT id, datos, fecha_creacion FROM carrito_lineas ORDER BY id ASC")
    filas = cursor.fetchall()

    return [
        {
            "id": fila[0],
            "datos": json.loads(fila[1]),
            "fecha_creacion": fila[2]
        }
        for fila in filas
    ]


def obtener_lineas_isbue(db):
    """
    Devuelve solo la lista de dicts de línea (sin id ni fecha), lista para
    pasar directamente a isbue_service.construir_body_isbue.
    """
    cursor = db.cursor()
    cursor.execute("SELECT datos FROM carrito_lineas ORDER BY id ASC")
    filas = cursor.fetchall()
    return [json.loads(fila[0]) for fila in filas]


def borrar_linea(db, id_linea):
    cursor = db.cursor()
    cursor.execute("DELETE FROM carrito_lineas WHERE id = ?", (id_linea,))
    db.commit()
    return cursor.rowcount > 0


def vaciar_carrito(db):
    cursor = db.cursor()
    cursor.execute("DELETE FROM carrito_lineas")
    db.commit()