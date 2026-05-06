import csv
import io
import openpyxl

TABLAS_IMPORTABLES = {
    # Material
    'bandas':                  'bandas',
    'empalmes':                'empalmes',
    'perfiles_longitudinales': 'perfiles_longitudinales',
    'perfiles_transversales':  'perfiles_transversales',
    'runners':                 'runners',
    'ondas':                   'ondas',
    # Gestión
    'clientes':                'clientes',
    'descuentos':              'descuentos',
    'descuentos_soldadura':    'descuentos_soldadura',
}

def validar_tabla(tabla):
    if tabla not in TABLAS_IMPORTABLES:
        raise ValueError(f"Tabla '{tabla}' no válida")
    return TABLAS_IMPORTABLES[tabla]

def get_columnas_tabla(db, tabla):
    nombre_tabla = validar_tabla(tabla)
    cursor = db.cursor()
    cursor.execute(f"PRAGMA table_info({nombre_tabla})")
    return [
        {
            "nombre": row[1],
            "tipo":   row[2].upper(),
            "not_null": bool(row[3]),
            "pk":     bool(row[5]),
        }
        for row in cursor.fetchall()
    ]

def parsear_archivo(contenido_bytes, nombre_archivo, separador=','):
    extension = nombre_archivo.rsplit('.', 1)[-1].lower()

    if extension in ('xlsx', 'xls'):
        wb = openpyxl.load_workbook(io.BytesIO(contenido_bytes), data_only=True)
        ws = wb.active
        filas = [[str(c) if c is not None else '' for c in row] for row in ws.iter_rows(values_only=True)]
        if not filas:
            return [], [], []
        encabezados   = [str(h).strip() for h in filas[0]]
        primera_linea = [str(v).strip() for v in filas[1]] if len(filas) > 1 else []
        todas_filas   = [[str(v).strip() for v in fila] for fila in filas[1:]]

    else:  # csv
        texto = contenido_bytes.decode('utf-8-sig')
        reader = csv.reader(io.StringIO(texto), delimiter=separador)
        filas = [fila for fila in reader]
        if not filas:
            return [], [], []
        encabezados   = [h.strip() for h in filas[0]]
        primera_linea = [v.strip() for v in filas[1]] if len(filas) > 1 else []
        todas_filas   = [[v.strip() for v in fila] for fila in filas[1:]]

    return encabezados, primera_linea, todas_filas

def aplicar_mapeo(encabezados, filas, mapeo):
    """
    mapeo: dict { campo_archivo: campo_db }
    Devuelve lista de dicts { campo_db: valor }
    """
    resultado = []
    for fila in filas:
        fila_dict = dict(zip(encabezados, fila))
        fila_mapeada = {}
        for campo_archivo, campo_db in mapeo.items():
            if campo_db and campo_archivo in fila_dict:
                fila_mapeada[campo_db] = fila_dict[campo_archivo]
        if fila_mapeada:
            resultado.append(fila_mapeada)
    return resultado

def detectar_duplicados(db, tabla, filas_mapeadas):
    nombre_tabla = validar_tabla(tabla)
    cursor = db.cursor()
    duplicados = []
    for i, fila in enumerate(filas_mapeadas):
        id_import = fila.get('id_import')
        if id_import is None:
            continue
        cursor.execute(
            f"SELECT id_import FROM {nombre_tabla} WHERE id_import = ?",
            (id_import,)
        )
        if cursor.fetchone():
            duplicados.append({"fila": i + 2, "id_import": id_import})
    return duplicados

def importar_filas(db, tabla, filas_mapeadas, modo='solo_nuevos'):
    """
    modo:
      'solo_nuevos'  → INSERT, ignora duplicados
      'actualizar'   → INSERT o UPDATE si existe id_import
    """
    nombre_tabla = validar_tabla(tabla)
    cursor = db.cursor()
    insertados = 0
    actualizados = 0

    for fila in filas_mapeadas:
        id_import = fila.get('id_import')

        if modo == 'actualizar' and id_import is not None:
            cursor.execute(
                f"SELECT id FROM {nombre_tabla} WHERE id_import = ?",
                (id_import,)
            )
            existente = cursor.fetchone()

            if existente:
                # UPDATE
                campos = [f"{k} = ?" for k in fila.keys() if k != 'id_import']
                valores = [v for k, v in fila.items() if k != 'id_import']
                valores.append(id_import)
                cursor.execute(
                    f"UPDATE {nombre_tabla} SET {', '.join(campos)} WHERE id_import = ?",
                    valores
                )
                actualizados += 1
                continue

        # INSERT — si hay duplicado y modo es solo_nuevos, lo salta
        try:
            columnas = ', '.join(fila.keys())
            placeholders = ', '.join(['?'] * len(fila))
            cursor.execute(
                f"INSERT INTO {nombre_tabla} ({columnas}) VALUES ({placeholders})",
                list(fila.values())
            )
            insertados += 1
        except Exception:
            pass  # duplicado ignorado en modo solo_nuevos

    db.commit()
    return {"insertados": insertados, "actualizados": actualizados}