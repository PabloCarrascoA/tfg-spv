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
    'descuentos_material':              'descuentos_material',
    'descuentos_soldadura':    'descuentos_soldadura',
}

CLAVES_DUPLICADOS = {
    'bandas': ['codigo'],
    'perfiles_longitudinales': ['codigo'],
    'perfiles_transversales': ['codigo'],
    'runners': ['codigo'],
    'ondas': ['codigo'],
    'clientes': ['codigo'],
    'empalmes': ['tipo', 'subtipo', 'ancho'],
    'clientes': ['codigo'],
    'descuentos_material': ['codigo'],
    'descuentos_soldadura': ['codigo'],
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
            "nombre":   row[1],
            "tipo":     row[2].upper(),
            "not_null": bool(row[3]),
            "pk":       bool(row[5]),
        }
        for row in cursor.fetchall()
        if not (bool(row[5]) and row[2].upper() in ('INTEGER', 'INT'))
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
            if campo_db and campo_db != 'id' and campo_archivo in fila_dict:
                fila_mapeada[campo_db] = fila_dict[campo_archivo]
        if fila_mapeada:
            resultado.append(fila_mapeada)
    return resultado

def _columnas_tabla(db, nombre_tabla):
    cursor = db.cursor()
    cursor.execute(f"PRAGMA table_info({nombre_tabla})")
    return [row[1] for row in cursor.fetchall()]

def _clave_duplicado(db, tabla, fila=None):
    nombre_tabla = validar_tabla(tabla)
    columnas_existentes = set(_columnas_tabla(db, nombre_tabla))

    # prioridad -> id_import
    if 'id_import' in columnas_existentes:
        if fila is None or fila.get('id_import') not in (None, ''):
            return ['id_import']

    # fallback a que la clave sea el código
    candidatas = CLAVES_DUPLICADOS.get(tabla, [])

    if candidatas and set(candidatas).issubset(columnas_existentes):
        if fila is None or all(fila.get(col) not in (None, '') for col in candidatas):
            return candidatas

    return []

def _where_por_clave(fila, clave):
    where = ' AND '.join([f"{col} = ?" for col in clave])
    valores = [fila[col] for col in clave]
    return where, valores

def detectar_duplicados(db, tabla, filas_mapeadas):
    nombre_tabla = validar_tabla(tabla)
    cursor = db.cursor()
    duplicados = []
    for i, fila in enumerate(filas_mapeadas):
        clave = _clave_duplicado(db, tabla, fila)
        if not clave:
            continue
        where, valores = _where_por_clave(fila, clave)
        cursor.execute(
            f"SELECT 1 FROM {nombre_tabla} WHERE {where}",
            valores
        )
        if cursor.fetchone():
            duplicados.append({
                "fila": i + 2,
                "clave": " + ".join(clave),
                "valores": {col: fila[col] for col in clave},
            })
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
    omitidos = 0
    errores = []

    for num_fila, fila in enumerate(filas_mapeadas, start=2):
        clave = _clave_duplicado(db, tabla, fila)
        existente = None

        if clave:
            where, valores_clave = _where_por_clave(fila, clave)
            cursor.execute(
                f"SELECT id FROM {nombre_tabla} WHERE {where}",
                valores_clave
            )
            existente = cursor.fetchone()

        if existente and modo == 'actualizar':
            campos = [f"{k} = ?" for k in fila.keys() if k not in clave and k != 'id']
            valores = [v for k, v in fila.items() if k not in clave and k != 'id']
            if not campos:
                omitidos += 1
                continue

            valores.extend(valores_clave)
            cursor.execute(
                f"UPDATE {nombre_tabla} SET {', '.join(campos)} WHERE {where}",
                valores
            )
            actualizados += 1
            continue

        if existente:
            omitidos += 1
            continue

        try:
            columnas = ', '.join(fila.keys())
            placeholders = ', '.join(['?'] * len(fila))
            cursor.execute(
                f"INSERT INTO {nombre_tabla} ({columnas}) VALUES ({placeholders})",
                list(fila.values())
            )
            insertados += 1
        except Exception as e:
            errores.append({
                "fila": num_fila,
                "error": str(e),
                "datos": fila,
            })

    db.commit()

    return {
        "insertados": insertados,
        "actualizados": actualizados,
        "omitidos": omitidos,
        "errores": errores,
    }
