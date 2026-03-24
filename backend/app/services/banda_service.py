import math

# ------------------------
# OBTENER DATOS POR CÓDIGO
# ------------------------

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

def obtener_perfil_longitudinal_por_codigo(db, codigo: str):
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, nombre, codigo, precio FROM perfiles_longitudinales WHERE codigo = ?",
        (codigo,)
    )

    row = cursor.fetchone()

    if row is None:
        return None
    
    return {
        "id": row[0],
        "nombre": row[1],
        "codigo": row[2],
        "precio": row[3]
    }

def obtener_perfil_transversal_por_codigo(db, codigo: str):
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, nombre, codigo, precio FROM perfiles_transversales WHERE codigo = ?",
        (codigo,)
    )

    row = cursor.fetchone()

    if row is None:
        return None
    
    return {
        "id": row[0],
        "nombre": row[1],
        "codigo": row[2],
        "precio": row[3]
    }

# ------------------------
# OBTENER TODOS LOS DATOS A LA VEZ
# ------------------------

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

def obtener_perfiles_longitudinales(db):
    cursor = db.cursor()
    cursor.execute("SELECT id, nombre, codigo, precio FROM perfiles_longitudinales")
    rows = cursor.fetchall()

    perfiles = []
    for row in rows:
        perfiles.append({
            "id": row[0],
            "nombre": row[1],
            "codigo": row[2],
            "precio": row[3]
        })

    return perfiles

def obtener_perfiles_transversales(db):
    cursor = db.cursor()
    cursor.execute("SELECT id, nombre, codigo, precio FROM perfiles_transversales")
    rows = cursor.fetchall()

    perfiles = []
    for row in rows:
        perfiles.append({
            "id": row[0],
            "nombre": row[1],
            "codigo": row[2],
            "precio": row[3]
        })

    return perfiles

# ------------------------
# OBTENER PRECIOS DE CADA SECCIÓN
# ------------------------

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

    if (ancho % 50) != 0:
        ancho_ajustado = ((math.trunc(ancho / 50)) + 1) * 50
    else:
        ancho_ajustado = ancho

    ancho_ajustado_m = ancho_ajustado / 1000

    area_m2 = largo_m * ancho_ajustado_m

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


# lo de los perfiles está para cambiar 
def calcular_precio_perfil_longitudinal(db, codigo_perfil, largo, n_perfiles, distancia_margen, descuento = 0, ):

    cursor = db.cursor()

    cursor.execute(
        "SELECT precio FROM perfiles_longitudinales WHERE codigo = ?",
        (codigo_perfil,)
    )

    row = cursor.fetchone()

    if row is None:
        raise ValueError("Perfil no encontrado")

    precio_m2 = row[0]

    if largo <= 0:
        raise ValueError("Largo debe ser mayor que cero")
    
    if n_perfiles <= 0:
        raise ValueError("El número de perfiles no puede ser 0")

    largo_m = largo / 1000

    # falta ver si el descuento es un valor fijo o un porcentaje

    precio_total = (n_perfiles * largo_m * precio_m2) - descuento

    return {
        "codigo_perfil": codigo_perfil,
        "precio_unitario": precio_m2,
        "precio_total": precio_total,
        "distancia_margen": distancia_margen
    }

def calcular_precio_perfil_transversal(db, codigo_perfil, ancho, largo, n_perfiles=None, distancia_paso=None, ancho_perfil=None, descuento=0):

    print(f"DEBUG: calcular_precio_perfil_transversal recibió ancho_perfil = {ancho_perfil}")

    cursor = db.cursor()

    cursor.execute("SELECT precio from perfiles_transversales WHERE codigo = ?", (codigo_perfil,))

    row = cursor.fetchone()

    if row is None:
        raise ValueError("Perfil no encontrado")
    
    precio_m2 = row[0]

    if ancho <= 0:
        raise ValueError("Ancho debe ser mayor que cero")

    if n_perfiles <= 0:
        raise ValueError("El número de perfiles no puede ser 0")
    
    if largo <= 0:
        raise ValueError("Largo debe ser mayor que cero")
    
    if distancia_paso <= 0:
        raise ValueError("La distancia entre perfiles no puede ser 0")
    
    # ajustar el número de perfiles y el paso si el largo no es múltiplo de la distancia entre perfiles
   

    if n_perfiles and not distancia_paso:
        distancia_paso = largo / n_perfiles

    elif distancia_paso and not n_perfiles:
        n_perfiles = round(largo / distancia_paso)
        distancia_paso = largo / n_perfiles

    elif n_perfiles and distancia_paso:
        # priorizar nº perfiles
        distancia_paso = largo / n_perfiles

    else:
        raise ValueError("Debes indicar n_perfiles o distancia_paso")

    # Usar ancho_perfil si se proporciona, sino usar el ancho de la banda + 40mm
    if ancho_perfil is not None and ancho_perfil > 0:
        ancho_m = (ancho_perfil + 40) / 1000
    else:
        ancho_m = (ancho + 40) / 1000 # se suman 40mm de banda por el desaprovechamiento en los cortes

    precio_total = (n_perfiles * ancho_m * precio_m2) - descuento

    print(f"DEBUG: calcular_precio_perfil_transversal retornando ancho_perfil = {ancho_perfil}")

    return {
        "codigo_perfil": codigo_perfil,
        "precio_unitario": precio_m2,
        "precio_total": precio_total,
        "numero_pefiles": n_perfiles,
        "ancho_perfil": ancho_perfil,
        "distancia_paso": distancia_paso
    }

def calcular_configuracion_completa(db, codigo_banda, largo, ancho, tipo_empalme, codigo_empalme, codigo_perfil = None, n_perfiles = None, distancia_margen = None, distancia_paso = None, ancho_perfil = None):
    
    # Precio banda
    resultado_banda = calcular_precio_banda(db, codigo_banda, largo, ancho)
    precio_banda = resultado_banda["precio_total"]

    # Precio empalme
    resultado_empalme = calcular_precio_empalme(db, tipo_empalme, codigo_empalme)
    precio_empalme = resultado_empalme["precio_empalme"]

    # Precio perfiles

    precio_perfil = 0

    if distancia_margen is not None:
        resultado_perfil = calcular_precio_perfil_longitudinal(db, codigo_perfil, largo, n_perfiles, distancia_margen)
        precio_perfil += resultado_perfil["precio_total"] 

    elif distancia_paso is not None:
        resultado_perfil = calcular_precio_perfil_transversal(db, codigo_perfil, ancho, largo, n_perfiles, distancia_paso, ancho_perfil)
        precio_perfil += resultado_perfil["precio_total"]
        n_perfiles = resultado_perfil["numero_pefiles"]
        distancia_paso = resultado_perfil["distancia_paso"]
        ancho_perfil = resultado_perfil["ancho_perfil"]


    # Precio total
    precio_total = precio_banda + precio_empalme + precio_perfil

    return {
        "codigo_banda": codigo_banda,
        "precio_banda": round(precio_banda, 2),
        "precio_empalme": round(precio_empalme, 2),
        "precio_perfil": round(precio_perfil, 2),
        "precio_total": round(precio_total, 2),
        "n_perfiles": n_perfiles,
        "distancia_margen": distancia_margen,
        "ancho_perfil": ancho_perfil,
        "distancia_paso": distancia_paso
    }