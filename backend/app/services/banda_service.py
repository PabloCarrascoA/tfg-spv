import math

def obtener_banda_por_codigo(db, codigo: str):
    """
    Obtiene una banda por su código usando SQL directo.
    Retorna un diccionario con los datos de la banda o None.
    """
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, nombre, codigo, proveedor, material, color, precio FROM bandas WHERE codigo = ?",
        (codigo,)
    )
    row = cursor.fetchone()
    
    if row is None:
        return None
    
    return {
        "id": row[0],
        "nombre": row[1],
        "codigo": row[2],
        "proveedor": row[3],
        "material": row[4],
        "color": row[5],
        "precio": row[6]
    }

def obtener_bandas(db):
    """
    Obtiene todas las bandas usando SQL directo.
    Retorna una lista de diccionarios con los datos de las bandas.
    """
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, nombre, codigo, proveedor, material, color, precio FROM bandas"
    )
    rows = cursor.fetchall()
    
    bandas = []
    for row in rows:
        bandas.append({
            "id": row[0],
            "nombre": row[1],
            "codigo": row[2],
            "proveedor": row[3],
            "material": row[4],
            "color": row[5],
            "precio": row[6]
        })
    
    return bandas

def obtener_empalmes(db, tipo_empalme):
    """Devuelve lista de empalmes para el tipo indicado.

    Retorna diccionarios con campos "codigo" y "precio".
    Lanza ValueError si el tipo no es válido.
    """
    tablas = {
        "banda-sin-fin": "sin_fin",
        "extremos-preparados": "extremos_preparados",
        "grapas": "grapas"
    }

    # Banda abierta no tiene tabla
    if tipo_empalme == "banda-abierta":
        return [{"codigo": "BA", "precio": 25}]

    if tipo_empalme not in tablas:
        raise ValueError("Tipo de empalme no válido")

    tabla = tablas[tipo_empalme]

    cursor = db.cursor()
    cursor.execute(f"SELECT codigo, precio FROM {tabla}")
    rows = cursor.fetchall()

    empalmes = []
    for row in rows:
        empalmes.append({
            "codigo": row[0],
            "precio": row[1]
        })

    return empalmes

def calcular_precio_banda(db, codigo, largo, ancho):

    cursor = db.cursor()

    cursor.execute(
        "SELECT precio FROM bandas WHERE codigo = ?",
        (codigo,)
    )

    row = cursor.fetchone()

    if row is None:
        raise ValueError("Banda no encontrada")

    precio_unitario = row[0]

    if largo <= 0 or ancho <= 0:
        raise ValueError("Largo y ancho deben ser mayores que cero")

    largo_m = largo / 1000
    ancho_m = ancho / 1000

    ancho_ajustado = math.ceil(ancho_m / 50) * 50

    area_m2 = largo_m * ancho_ajustado

    # print(f"Ancho ajustado: {ancho_ajustado} m")

    precio_total = area_m2 * precio_unitario

    return {
        "codigo_banda": codigo,
        "precio_unitario": precio_unitario,
        "precio_total": precio_total
    }


def calcular_precio_empalme(db, tipo_empalme, codigo):

    if tipo_empalme == "banda-abierta":
        return {
            "tipo_empalme": tipo_empalme,
            "codigo_empalme": codigo,
            "precio_empalme": 25.0
        }

    tablas = {
        "banda-sin-fin": "sin_fin",
        "extremos-preparados": "extremos_preparados",
        "grapas": "grapas"
    }

    if tipo_empalme not in tablas:
        raise ValueError("Tipo de empalme no válido")

    tabla = tablas[tipo_empalme]

    cursor = db.cursor()
    cursor.execute(
        f"SELECT precio FROM {tabla} WHERE codigo = ?",
        (codigo,)
    )

    row = cursor.fetchone()

    if row is None:
        raise ValueError("Empalme no encontrado")
    
    precio_empalme = row[0]

    return {

        "tipo_empalme": tipo_empalme,
        "codigo_empalme": codigo,
        "precio_empalme": precio_empalme
    }

def calcular_configuracion_completa(db, codigo_banda, largo, ancho, tipo_empalme, codigo_empalme):
    
    # Precio banda
    resultado_banda = calcular_precio_banda(db, codigo_banda, largo, ancho)
    precio_banda = resultado_banda["precio_total"]

    # Precio empalme
    resultado_empalme = calcular_precio_empalme(db, tipo_empalme, codigo_empalme)
    precio_empalme = resultado_empalme["precio_empalme"]

    # Precio total
    precio_total = precio_banda + precio_empalme

    return {
        "codigo_banda": codigo_banda,
        "precio_banda": round(precio_banda, 2),
        "precio_empalme": round(precio_empalme, 2),
        "precio_total": round(precio_total, 2)
    }