import openpyxl
from io import BytesIO
from datetime import date

TABLAS_EXPORTABLES = {
    'bandas':                  'bandas',
    'perfiles_longitudinales': 'perfiles_longitudinales',
    'perfiles_transversales':  'perfiles_transversales',
    'runners':                 'runners',
    'ondas':                   'ondas',
}

def validar_tabla(tabla):
    if tabla not in TABLAS_EXPORTABLES:
        raise ValueError(f"Tabla '{tabla}' no válida")
    return TABLAS_EXPORTABLES[tabla]

def get_info_tabla(db, tabla):
    nombre_tabla = validar_tabla(tabla)
    cursor = db.cursor()

    cursor.execute(f"PRAGMA table_info({nombre_tabla})")
    columnas = [{"nombre": row[1].upper(), "tipo": row[2].upper()} for row in cursor.fetchall()]

    cursor.execute(f"SELECT COUNT(*) FROM {nombre_tabla}")
    total = cursor.fetchone()[0]

    return {"columnas": columnas, "total": total, "nombre_tabla": nombre_tabla}

def exportar_tabla_excel(db, tabla):
    nombre_tabla = validar_tabla(tabla)
    cursor = db.cursor()

    cursor.execute(f"PRAGMA table_info({nombre_tabla})")
    columnas = [row[1] for row in cursor.fetchall()]

    cursor.execute(f"SELECT * FROM {nombre_tabla}")
    filas = cursor.fetchall()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = nombre_tabla
    ws.append(columnas)
    for fila in filas:
        ws.append(list(fila))

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    fecha = date.today().isoformat()
    filename = f"tabla_{nombre_tabla}_{fecha}.xlsx"

    return buffer, filename