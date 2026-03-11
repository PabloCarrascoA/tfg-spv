def obtener_campos_tabla(db, tabla):

    # nombres válidos que existen realmente en la base SQLite
    TABLAS_PERMITIDAS = [
        "bandas",
        "sin_fin",
        "extremos_preparados",
        "grapas",
    ]

    if tabla not in TABLAS_PERMITIDAS:
        raise ValueError("Tabla no permitida")

    if tabla == "noticias_item":

        return [
            {"nombre": "titulo", "tipo": "varchar"},
            {"nombre": "contenido", "tipo": "text"},
            {"nombre": "fecha_publicacion", "tipo": "date"},
            {"nombre": "id_import", "tipo": "int"}
        ]

    elif tabla == "usuarios":

        return [
            {"nombre": "nombre", "tipo": "varchar"},
            {"nombre": "apellidos", "tipo": "varchar"},
            {"nombre": "mail", "tipo": "varchar"},
            {"nombre": "telefono", "tipo": "varchar"},
            {"nombre": "id_import", "tipo": "int"}
        ]

    else:

        cursor = db.cursor()

        # SQLite no tiene DESCRIBE; usamos PRAGMA table_info
        cursor.execute(f"PRAGMA table_info({tabla})")
        filas = cursor.fetchall()

        campos = []
        # pragma devuelve: cid,name,type,notnull,dflt_value,pk
        for fila in filas:
            campos.append({
                "nombre": fila[1],
                "tipo": fila[2],
                "null": not bool(fila[3]),
                # SQLite no expone clave primaria como "PRI" etc, simplificamos
                "key": "PRI" if fila[5] else "",
                "default": fila[4],
                "extra": "",
            })

        return campos
    

def insertar_fila(db, tabla, data):

    cursor = db.cursor()

    # =====================
    # BANDAS
    # =====================

    if tabla == "bandas":

        if data.get("codigo") is not None and data.get("precio") is not None:
            cursor.execute("""
            INSERT INTO bandas (nombre, codigo, proveedor, material, color, precio)
            VALUES (?, ?, ?, ?, ?, ?) """, (
            data.get("nombre"),
            data.get("codigo"),
            data.get("proveedor"),
            data.get("material"),
            data.get("color"),
            data.get("precio")
            ))
            
        else:
            raise ValueError(f"Faltan campos obligatorios {data.get('codigo')}, {data.get('precio')} para bandas")

        

    # =====================
    # SIN FIN
    # =====================

    elif tabla == "sin_fin":

        cursor.execute("""
            INSERT INTO sin_fin (codigo, precio)
            VALUES (?, ?)
        """, (
            data.get("codigo"),
            data.get("precio")
        ))

    # =====================
    # EXTREMOS PREPARADOS
    # =====================

    elif tabla == "extremos_preparados":

        cursor.execute("""
            INSERT INTO extremos_preparados (codigo, precio)
            VALUES (?, ?)
        """, (
            data.get("codigo"),
            data.get("precio")
        ))

    # =====================
    # GRAPAS
    # =====================

    elif tabla == "grapas":

        cursor.execute("""
            INSERT INTO grapas (codigo, precio)
            VALUES (?, ?)
        """, (
            data.get("codigo"),
            data.get("precio")
        ))

    else:
        raise ValueError(f"Tabla no soportada: {tabla}")

    db.commit()


# --------- Servicio principal ---------
    
def cargar_archivo(tabla, archivo):

    if not tabla:
        raise ValueError("No se ha seleccionado tabla")

    campos = obtener_campos_tabla(tabla)

    return {
        "tabla": tabla,
        "campos": campos,
        "encabezados": archivo["encabezados"],
        "preview": archivo["filas"][:5]
    }

def guardar_mapeo(db, tabla, archivo, mapeo, campos):

    filas = archivo["filas"]
    encabezados = archivo["encabezados"]

    valores_invalidos = []
    valores_duplicados = []

    pk_vistas = set()
    nombre_pk = None

    total_errores = 0
    total_duplicados = 0

    # detectar PK
    for campo in campos:
        if campo["key"] == "PRI":
            nombre_pk = campo["nombre"]
            break

    index = 2

    # =========================
    # PRIMER BUCLE: VALIDACIONES
    # =========================

    for fila in filas:

        fila_asociativa = dict(zip(encabezados, fila))

        insert_data = {}

        for campo_excel, campo_db in mapeo.items():

            if campo_db and campo_excel in fila_asociativa:
                insert_data[campo_db] = fila_asociativa[campo_excel]

        # comprobar duplicados id_import en DB

        if tabla in ["usuarios", "noticias_item"]:

            if "id_import" in insert_data and insert_data["id_import"]:

                id_import = insert_data["id_import"]

                cursor = db.cursor()
                cursor.execute(
                    f"SELECT id_import FROM {tabla} WHERE id_import=%s LIMIT 1",
                    (id_import,)
                )

                if cursor.fetchone():
                    valores_duplicados.append({
                        "fila": index,
                        "valor": id_import,
                        "datos_fila": fila_asociativa
                    })

                    total_duplicados += 1

        # comprobar si el código ya existe en BD para bandas y empalmes
        if tabla in ["bandas", "sin_fin", "extremos_preparados", "grapas"]:
            if "codigo" in insert_data and insert_data["codigo"]:
                codigo = insert_data["codigo"]
                cursor = db.cursor()
                cursor.execute(
                    f"SELECT codigo FROM {tabla} WHERE codigo = ? LIMIT 1",
                    (codigo,)
                )
                if cursor.fetchone():
                    valores_duplicados.append({
                        "fila": index,
                        "valor": codigo,
                        "mensaje": f"Código {codigo} ya existe en la tabla {tabla}",
                        "datos_fila": fila_asociativa
                    })
                    total_duplicados += 1

        # comprobar PK duplicada dentro del archivo

        if nombre_pk and nombre_pk in insert_data:

            valor_pk = insert_data[nombre_pk]

            if valor_pk in pk_vistas:

                raise ValueError(
                    f"Valor duplicado para la clave primaria '{nombre_pk}': {valor_pk}"
                )

            pk_vistas.add(valor_pk)

        index += 1

    # =========================
    # SEGUNDO BUCLE: INSERT
    # =========================

    okay_insert = False
    total_insertados = 0

    for i, fila in enumerate(filas):

        fila_asociativa = dict(zip(encabezados, fila))
        insert_data = {}

        for campo_excel, campo_db in mapeo.items():

            if campo_db and campo_excel in fila_asociativa:
                insert_data[campo_db] = fila_asociativa[campo_excel]

        # Comprobar si esta fila específica tiene duplicados
        fila_tiene_duplicado = any(d["fila"] == i+2 for d in valores_duplicados)
        fila_tiene_error = any(d["fila"] == i+2 for d in valores_invalidos)

        if not fila_tiene_duplicado and not fila_tiene_error:
            try:
                insertar_fila(db, tabla, insert_data)
                total_insertados += 1
                okay_insert = True
            except Exception as e:
                print(f"Error en fila {i+2}: {str(e)}")
                continue

    return {
        "insertados": okay_insert,
        "total_insertados": total_insertados,
        "errores": total_errores,
        "duplicados": total_duplicados,
        "valores_invalidos": valores_invalidos,
        "valores_duplicados": valores_duplicados
    }