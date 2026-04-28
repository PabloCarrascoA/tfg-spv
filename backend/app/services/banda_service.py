import math
from app.utils.descuentos import get_descuento_producto, get_descuento_soldadura, get_cliente_id_por_nombre, get_tarifa_preparacion
from app.utils.preparacion import calcular_precio_preparacion

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

def obtener_perfil_transversal_por_codigo(db, codigo: str):
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, codigo, tipo, color, proveedor, material, precio_material, precioSoldar_Lhasta1000, precioSoldar_L1000_1400, precioSoldar_Especial FROM perfiles_transversales WHERE codigo = ?",
        (codigo,)
    )

    row = cursor.fetchone()

    if row is None:
        return None
    
    return {
        "id": row[0],
        "codigo": row[1],
        "tipo": row[2],
        "color": row[3],
        "proveedor": row[4],
        "material": row[5],
        "precio_material": row[6],
        "precioSoldar_Lhasta1000": row[7],
        "precioSoldar_L1000_1400": row[8],
        "precioSoldar_Especial": row[9]
    }
    

def obtener_perfil_longitudinal_por_codigo(db, codigo: str):
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, codigo, tipo, color, proveedor, material, precio_material, precioSoldar_Linf1500, precioSoldar_Lsup1500_Ainf2100, precioSoldar_LSup1500_Asup2100 FROM perfiles_longitudinales WHERE codigo = ?",
        (codigo,)
    )

    row = cursor.fetchone()

    if row is None:
        return None
    
    return {
        "id": row[0],
        "codigo": row[1],
        "tipo": row[2],
        "color": row[3],
        "proveedor": row[4],
        "material": row[5],
        "precio_material": row[6],
        "precioSoldar_Linf1500": row[7],
        "precioSoldar_Lsup1500_Ainf2100": row[8],
        "precioSoldar_LSup1500_Asup2100": row[9]
    }

def obtener_runer_por_codigo(db, codigo:str):
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, tipo, codigo, color, material, precio_material, precioSoldar_Asup1700_PVC, precioSoldar_Ainf1700_PVC, precioSoldar_Uretano, ancho FROM runners WHERE codigo = ?",
        (codigo,)
    )

    row = cursor.fetchone()

    if row is None:
        return None
    
    return {
        "id": row[0],
        "tipo": row[1],
        "codigo": row[2],
        "color": row[3],
        "material": row[4],
        "precio_material": row[5],
        "precioSoldar_Asup1700_PVC": row[6],
        "precioSoldar_Ainf1700_PVC": row[7],
        "precioSoldar_Uretano": row[8],
        "ancho": row[9]
    }

def obtener_onda_por_codigo(db, codigo:str):
    cursor = db.cursor()
    cursor.execute("SELECT id, codigo, tipo, color, proveedor, material, precio FROM ondas WHERE codigo = ?", (codigo,))
    row = cursor.fetchone()

    if row is None:
        return None

    return {
        "id": row[0],
        "codigo": row[1],
        "tipo": row[2],
        "color": row[3],
        "proveedor": row[4],
        "material": row[5],
        "precio": row[6]
    }

# --------------------------------
# OBTENER TODOS LOS DATOS A LA VEZ
# --------------------------------

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

def obtener_subtipos_empalme(db, tipo):
    cursor = db.cursor()
    cursor.execute(
        "SELECT DISTINCT subtipo FROM empalmes WHERE tipo = ?", (tipo,)
    )
    return [{"subtipo": row[0]} for row in cursor.fetchall()]

def obtener_precio_empalme(db, tipo, subtipo, ancho):
    cursor = db.cursor()
    cursor.execute("""
        SELECT precio FROM empalmes
        WHERE tipo = ? AND subtipo = ? AND ancho <= ?
        ORDER BY ancho DESC LIMIT 1
    """, (tipo, subtipo, ancho))
    row = cursor.fetchone()
    return row[0] if row else None

def obtener_perfiles_transversales(db):
    cursor = db.cursor()
    cursor.execute("SELECT id, codigo, tipo, color, proveedor, material, precio_material, precioSoldar_Lhasta1000, precioSoldar_L1000_1400, precioSoldar_Especial FROM perfiles_transversales")

    rows = cursor.fetchall()

    perfiles = []
    for row in rows:
        perfiles.append({
            "id": row[0],
            "codigo": row[1],
            "tipo": row[2],
            "color": row[3],
            "proveedor": row[4],
            "material": row[5],
            "precio_material": row[6],
            "precioSoldar_Lhasta1000": row[7],
            "precioSoldar_L1000_1400": row[8],
            "precioSoldar_Especial": row[9]
        })

    return perfiles

def obtener_perfiles_longitudinales(db):
    cursor = db.cursor()
    cursor.execute("SELECT id, codigo, tipo, color, proveedor, material, precio_material, precioSoldar_Linf1500, precioSoldar_Lsup1500_Ainf2100, precioSoldar_LSup1500_Asup2100, ancho FROM perfiles_longitudinales")
    rows = cursor.fetchall()

    perfiles = []
    for row in rows:
        perfiles.append({
            "id": row[0],
            "codigo": row[1],
            "tipo": row[2],
            "color": row[3],
            "proveedor": row[4],
            "material": row[5],
            "precio_material": row[6],
            "precioSoldar_Linf1500": row[7],
            "precioSoldar_Lsup1500_Ainf2100": row[8],
            "precioSoldar_LSup1500_Asup2100": row[9],
            "ancho": row[10]
        })

    return perfiles

def obtener_runers(db):
    cursor = db.cursor()
    cursor.execute("SELECT id, tipo, codigo, color, material, precio_material, precioSoldar_Asup1700_PVC, precioSoldar_Ainf1700_PVC, precioSoldar_Uretano, ancho FROM runners")
    rows = cursor.fetchall()

    runers = []
    for row in rows:
        runers.append({
            "id": row[0],
            "tipo": row[1],
            "codigo": row[2],
            "color": row[3],
            "material": row[4],
            "precio_material": row[5],
            "precioSoldar_Asup1700_PVC": row[6],
            "precioSoldar_Ainf1700_PVC": row[7],
            "precioSoldar_Uretano": row[8],
            "ancho": row[9]
        })

    return runers

def obtener_ondas(db):
    cursor = db.cursor()
    cursor.execute("SELECT id, codigo, tipo, color, proveedor, material, precio FROM ondas")

    rows = cursor.fetchall()

    ondas = []
    for row in rows:
        ondas.append({
            "id": row[0],
            "codigo": row[1],
            "tipo": row[2],
            "color": row[3],
            "proveedor": row[4],
            "material": row[5],
            "precio": row[6]
        })

    return ondas

def obtener_desarrollo_ondas(base, altura):

    a, b, c = 0, 0, 0

    if altura > 100 or altura < 10:
        raise Exception("la altura no puede ser mayor de 100 o inferior a 10")
    elif altura == 10:
        a = 0.0002
        b = 0.9335
        c = 7.0815

    elif altura == 15:
        a = 0.0004
        b = 0.8691
        c = 14.862

    elif altura == 20:
        a = 0.0008
        b = 0.7397
        c = 26.784
    elif altura == 25:
        a = 0.0007
        b = 0.7164
        c = 34.99
    elif altura == 30:
        a = 0.0009
        b = 0.6412
        c = 46.287
    elif altura == 35:
        a = 0.0011
        b = 0.5701
        c = 58
    elif altura == 40:
        a = 0.0012
        b = 0.5029
        c = 70.009
    elif altura == 45:
        a = 0.0013
        b = 0.4414
        c = 82.141
    elif altura == 50:
        a = 0.0014
        b = 0.3856
        c = 94.327
    elif altura == 55:
        a = 0.0013
        b = 0.3817
        c = 103.86
    elif altura == 60:
        a = 0.0016
        b = 0.2834
        c = 119
    elif altura == 65:
        a = 0.0014
        b = 0.3164
        c = 126.29
    elif altura == 70:
        a = 0.0014
        b = 0.2731
        c = 138.69
    elif altura == 75:
        a = 0.0014
        b = 0.2669
        c = 148.74
    elif altura == 80:
        a = 0.0013
        b = 0.2578
        c = 159.11
    elif altura == 85:
        a = 0.0014
        b = 0.2245
        c = 171.34
    elif altura == 90:
        a = 0.0013
        b = 0.2134
        c = 182.06
    elif altura == 95:
        a = 0.0014
        b = 0.182
        c = 194.47
    elif altura == 100:
        a = 0.0012
        b = 0.2105
        c = 202.11
    else:
        raise Exception("¡La altura de la onda debe ser un múltiplo de 5!")

    desarrollo = a * math.pow(base, 2) + b * base + c

    # desarollo está en (mm)
    return desarrollo

# ------------------------
# OBTENER PRECIOS DE CADA SECCIÓN
# ------------------------

def calcular_precio_banda(db, codigo, largo, ancho, cliente_id = None):

    banda = obtener_banda_por_codigo(db, codigo)

    if banda is None:
        raise ValueError("Banda no encontrada")

    precio_unitario = banda["precio"]

    print(f"DEBUG -> precio_unitario: {precio_unitario}")

    if largo <= 0 or ancho <= 0:
        raise ValueError("Largo y ancho deben ser mayores que cero")

    largo_m = largo / 1000
    ancho_m = ancho / 1000

    print(f"DEBUG -> largo_m: {largo_m}")

    if (ancho % 50) != 0:
        ancho_ajustado = ((math.trunc(ancho / 50)) + 1) * 50
    else:
        ancho_ajustado = ancho

    ancho_ajustado_m = ancho_ajustado / 1000

    print(f"DEBUG -> ancho_ajustado_m: {ancho_ajustado_m}")

    area_m2 = largo_m * ancho_ajustado_m

    precio_total = area_m2 * precio_unitario

    print(f"DEBUG -> precio_total: {precio_total}")

    # aplicar descuentos

    if cliente_id is not None:
        
        descuento = 1 - get_descuento_producto(db, cliente_id, "bandas", codigo)

        precio_total = precio_total * (descuento)

        print(f"DEBUG -> descuento aplicado a la banda: {descuento}")

        print(f"DEBUG -> precio_total con descuento: {precio_total}")

    return {
        "codigo_banda": codigo,
        "precio_unitario": precio_unitario,
        "precio_total": precio_total,
        "ancho_ajustado": ancho_ajustado
    }

def calcular_precio_empalme(db, tipo_empalme, subtipo, ancho, cliente_id = None):
    if tipo_empalme == "banda-abierta":
        return {"tipo_empalme": tipo_empalme, "subtipo": None, "precio_empalme": 0.0}

    precio = obtener_precio_empalme(db, tipo_empalme, subtipo, ancho)

    if tipo_empalme == "banda-sin-fin":
        
        descuento = 1 - get_descuento_soldadura(db, cliente_id, "sin_fin") if cliente_id is not None else 1

    elif tipo_empalme == "extremos-preparados":

        descuento = 1 - get_descuento_soldadura(db, cliente_id, "extremos_preparados") if cliente_id is not None else 1

    elif tipo_empalme == "grapas":
        
        descuento = 1 - get_descuento_soldadura(db, cliente_id, "grapas") if cliente_id is not None else 1

    precio = precio * descuento

    print(f"DEBUG -> precio empalme con descuento: {descuento}")

    if precio is None:
        raise ValueError(f"No se encontró precio para {tipo_empalme} / {subtipo} / ancho {ancho}")

    return {
        "tipo_empalme": tipo_empalme,
        "subtipo": subtipo,
        "precio_empalme": precio
    }


def calcular_precio_perfil_longitudinal(db, cantidad_bandas, codigo_perfil, largo, ancho, n_perfiles, distancia_margen, cliente_id = None):

    print(f"DEBUG: cantidad_bandas: {cantidad_bandas}")

    perfil = obtener_perfil_longitudinal_por_codigo(db, codigo_perfil)

    if perfil is None:
        raise ValueError("Perfil L no encontrado")
    
    if n_perfiles > 3:
        raise ValueError("No se admiten más de 3 perfiles longitudinales")
    
    # - Calculo precio perfil -

    precio_perfil_mL = perfil["precio_material"]

    print(f"DEBUG: precio_perfil_mL: {precio_perfil_mL}")

    if largo <= 0:
        raise ValueError("Largo debe ser mayor que cero")
    
    if n_perfiles <= 0:
        raise ValueError("El número de perfiles no puede ser 0")

    largo_m = largo / 1000
    print(f"DEBUG: largo_m: {largo_m}")
    print(f"DEBUG: n_perfiles: {n_perfiles}")

    precio_perfil_total = (n_perfiles * largo_m * precio_perfil_mL)

    if cliente_id is not None:
        print(
            "DEBUG descuento perfil longitudinal:",
            {
                "cliente_id": cliente_id,
                "tabla": "perfiles_longitudinales",
                "codigo_perfil": codigo_perfil,
                "tipo_familia": perfil["tipo"],
            }
        )
        
        descuento = 1 - get_descuento_producto(db, cliente_id, "perfiles_longitudinales", codigo_perfil, perfil["tipo"])

        print(f"DEBUG: descuento aplicado al perfil longitudinal: {descuento}")

        precio_perfil_total = precio_perfil_total * (descuento)

    # - Calculo soldadura -

    if largo < 1500:
        precio_soldadura_mL = perfil["precioSoldar_Linf1500"]

    elif largo >= 1500 and largo < 2100:
        precio_soldadura_mL = perfil["precioSoldar_Lsup1500_Ainf2100"]

    else:
        precio_soldadura_mL = perfil["precioSoldar_LSup1500_Asup2100"]

    precio_soldadura_total = (n_perfiles * largo_m * precio_soldadura_mL) 

    if cliente_id is not None:
        
        descuento_soldadura = 1 - get_descuento_soldadura(db, cliente_id, "perfiles_longitudinales")

        precio_soldadura_total = precio_soldadura_total * (descuento_soldadura)


    # - Calculo preparación -

    tarifa_preparacion = get_tarifa_preparacion(db, cliente_id, "perfiles_longitudinales")

    precio_preparacion = calcular_precio_preparacion(tarifa_preparacion, cantidad_bandas, n_perfiles)
    
    
    print(f"DEBUG: precio preparación: {precio_preparacion}")
    
    precio_final = precio_perfil_total + precio_soldadura_total + precio_preparacion

    return {
        "codigo_perfil": codigo_perfil,
        "precio_perfil": precio_perfil_mL,
        "precio_perfil_total": precio_perfil_total,
        "precio_soldadura": precio_soldadura_mL,
        "precio_soldadura_total": precio_soldadura_total,
        "precio_preparacion_PL": precio_preparacion,
        "precio_final": precio_final,
        "distancia_margen": distancia_margen
    }

def calcular_precio_perfil_transversal(db, codigo_perfil, ancho, largo, n_perfiles=None, distancia_paso=None, ancho_perfil=None, cliente_id = None):

    perfil = obtener_perfil_transversal_por_codigo(db, codigo_perfil)

    if perfil is None:
        raise ValueError("Perfil T no encontrado")
    
    if ancho_perfil is not None and ancho_perfil > ancho:
        raise ValueError("El ancho del perfil no puede superar el ancho de la banda")
    
    if ancho_perfil is None or ancho_perfil < 250:
        ancho_perfil = 250
    
    # - Calculo precio perfil -

    precio_perfil_mL = perfil["precio_material"]

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

    precio_perfil_total = (n_perfiles * ancho_m * precio_perfil_mL)

    if cliente_id is not None:

        descuento = 1 - get_descuento_producto(db, cliente_id, "perfiles_transversales", codigo_perfil, perfil["tipo"])

        precio_perfil_total = precio_perfil_total * (descuento)

    print(f"DEBUG: precio perfil: {precio_perfil_total}, n_perfiles: {n_perfiles}, precio perfil mL: {precio_perfil_mL}, ancho_m: {ancho_m}")

    # - Calculo soldadura -

    if largo <= 1000:
        precio_soldadura_mL = perfil["precioSoldar_Lhasta1000"]

    elif largo >= 1000 and largo <= 1400:
        precio_soldadura_mL = perfil["precioSoldar_L1000_1400"]

    else:
        precio_soldadura_mL = perfil["precioSoldar_Especial"]

    precio_soldadura_total = (n_perfiles * ancho_m * precio_soldadura_mL)

    if cliente_id is not None:
        
        descuento_soldadura = 1 - get_descuento_soldadura(db, cliente_id, "perfiles_transversales")

        precio_soldadura_total = precio_soldadura_total * (descuento_soldadura)

    print(f"DEBUG: precio soldadura: {precio_soldadura_total}, n_perfiles: {n_perfiles}, precio soldadura mL: {precio_soldadura_mL}, ancho_m: {ancho_m}")

    precio_final = precio_perfil_total + precio_soldadura_total

    return {
        "codigo_perfil": codigo_perfil,
        "precio_perfil": precio_perfil_mL,
        "precio_perfil_total": precio_perfil_total,
        "precio_soldadura": precio_soldadura_mL,
        "precio_soldadura_total": precio_soldadura_total,
        "precio_final": precio_final,
        "numero_pefiles": n_perfiles,
        "ancho_perfil": ancho_perfil,
        "distancia_paso": distancia_paso
    }

def calcular_precio_runer(db, codigo_runer, ancho, largo, n_perfiles, cliente_id = None):

    runer = obtener_runer_por_codigo(db, codigo_runer)

    if runer is None:
        raise ValueError("Runer no encontrado")
    
    if n_perfiles > 3:
        raise ValueError("El número máximo de runers es de 3")
    
   # - Calculo precio runer -

    precio_runer_mL = runer["precio_material"]

    if largo <= 0:
        raise ValueError("Largo debe ser mayor que cero")
    
    if n_perfiles is None:
        raise ValueError("Debes indicar n_perfiles_runer para calcular el runer")

    if n_perfiles <= 0:
        raise ValueError("El número de perfiles del runer no puede ser 0")

    largo_m = largo / 1000

    precio_runer_total = (n_perfiles * largo_m * precio_runer_mL)

    if cliente_id is not None:
        
        descuento = 1 - get_descuento_producto(db, cliente_id, "runners", codigo_runer, runer["tipo"])

        precio_runer_total = precio_runer_total * (descuento)

    # - Calculo soldadura

    if ancho >= 1700 and runer["material"] == "PVC":

        precio_soldadura_mL = runer["precioSoldar_Asup1700_PVC"]

    elif ancho < 1700 and runer["material"] == "PVC":

        precio_soldadura_mL = runer["precioSoldar_Ainf1700_PVC"]

    else:

        precio_soldadura_mL = runer["precioSoldar_Uretano"]

    precio_soldadura_total = (n_perfiles * largo_m * precio_soldadura_mL)

    if cliente_id is not None:  
        
        descuento = 1 - get_descuento_soldadura(db, cliente_id, "runners")

        precio_soldadura_total = precio_soldadura_total * (descuento)

    precio_preparacion = 25

    precio_final = precio_runer_total + precio_soldadura_total + precio_preparacion

    return {
        "codigo_runer": codigo_runer,
        "precio_runer": precio_runer_mL,
        "precio_runer_total": precio_runer_total,
        "precio_soldadura": precio_soldadura_mL,
        "precio_soldadura_total": precio_soldadura_total,
        "precio_final": precio_final,
        "numero_perfiles": n_perfiles
    }


def calcular_precio_perforaciones(db, agujeros_x_fila, filas_x_agujero, diametro, largo, ancho, cliente_id = None):

    if agujeros_x_fila <= 0 or filas_x_agujero <= 0 or diametro <= 0:
        raise ValueError("No pueden haber filas sin agujeros y el diámetro debe ser mayor o igual a cero")

    print(f"DEBUG: diametro -> {diametro}")
    if diametro < 4 or diametro > 30:
        raise ValueError("Los diámetros inferiores a 4 mm y superiores a 30 mm son imposibles")
    
    if diametro % 2 != 0:
        raise ValueError("El diámetro de las perforaciones debe ser par")
    


    precio_por_agujero = 0.1

    total_agujeros = agujeros_x_fila * filas_x_agujero

    if cliente_id is not None:
        
        descuento = 1 - get_descuento_producto(db, cliente_id, "perforaciones", None)

        precio_por_agujero = precio_por_agujero * (descuento)

    precio_total = precio_por_agujero * total_agujeros

    paso_filas = (ancho - agujeros_x_fila * diametro) / (agujeros_x_fila + 1)

    if paso_filas < 0:
        raise ValueError("La configuración de perforaciones no es válida para el largo indicado")
        # [TODO] esto funciona para las perforaciones equidistantes, en una malla aleatoria no

    return {
        "precio_total": round(precio_total, 2),
        "paso_filas": round(paso_filas, 2)
    }


def calcular_precio_ondas(db, continuidad, codigo_onda, n_ondas, base, altura, ancho, pisada, cliente_id = None):
    
    onda = obtener_onda_por_codigo(db, codigo_onda)

    if onda is None:
        raise ValueError("Onda no encontrada")
    
    # [TODO] habrá que pasar pisada a mm ?
    
    if continuidad == True:
        desarrollo_total = ((obtener_desarrollo_ondas(base, altura) + pisada) * n_ondas) + 1000
        # [TODO] revisar ajuste de la base según si se da el paso o n_ondas
    else:
        desarrollo_total = ((obtener_desarrollo_ondas(base, altura) + 2 * pisada) * n_ondas) + 1000
        # [TODO] revisar ajuste de la base según si se da el paso o n_ondas

    print(f"DEBUG: valor de base -> {base}")

    print(f"DEBUG: valor de altura -> {altura}")

    print(f"DEBUG: valor desarrollo onda -> {obtener_desarrollo_ondas(base, altura)}")

    print(f"DEBUG: valor de desarrollo total -> {desarrollo_total}")
    
    precio_onda_total = (desarrollo_total * n_ondas) * ancho * onda["precio"]

    if cliente_id is not None:
        
        descuento = 1 - get_descuento_producto(db, cliente_id, "ondas", codigo_onda, onda["tipo"])

        precio_onda_total = precio_onda_total * (descuento)

    precio_soldadura_total = 0

    # [TODO] calcular la soldadura

    if cliente_id is not None:
        
        descuento_soldadura = 1 - get_descuento_soldadura(db, cliente_id, "ondas")

        precio_soldadura_total = precio_onda_total * (descuento_soldadura)

    # [TODO] calcular la preparación

    precio_final = precio_onda_total + precio_soldadura_total

    return {

        "codigo_onda": codigo_onda,
        "precio_onda": onda["precio"],
        "precio_onda_total": precio_onda_total,
        "precio_soldadura_total": precio_soldadura_total,
        "precio_final": precio_final,
    }



def calcular_configuracion_completa(db, cantidad_bandas, codigo_banda, largo, ancho, tipo_empalme, subtipo_empalme, codigo_perfilT = None, n_perfilesT = None, margen_lateral = None, distancia_paso = None, ancho_perfilT = None, n_hileras = None, ancho1 = None, ancho2 = None, luz_interior = None, codigo_perfil_superior = None, n_perfiles_superior = None, distancia_margen_superior = None, codigo_perfil_inferior = None, n_perfiles_inferior = None, distancia_margen_inferior = None, codigo_runer = None, n_perfiles_runer = None, margen_runer = None, luz_runer = None, ancho_runer = None, agujeros_x_fila = None, filas_x_agujero = None, diametro_perforacion = None, nombre_cliente = None, codigo_onda = None, n_ondas = None, base_onda = None, altura_onda = None, continuidad_onda = None, pisada_onda = None):
    
    cliente_id = get_cliente_id_por_nombre(db, nombre_cliente)
    # - Precio banda -

    precio_banda = 0

    if codigo_banda is not None:

        resultado_banda = calcular_precio_banda(db, codigo_banda, largo, ancho, cliente_id)
        precio_banda = resultado_banda["precio_total"]

        if resultado_banda["ancho_ajustado"] is not None:
            ancho = resultado_banda["ancho_ajustado"]

    # - Precio empalme -

    precio_empalme = 0

    if tipo_empalme is not None and (subtipo_empalme is not None or tipo_empalme == "banda-abierta"):
        resultado_empalme = calcular_precio_empalme(db, tipo_empalme, subtipo_empalme, ancho, cliente_id)
        precio_empalme = resultado_empalme["precio_empalme"]

    # - Precio perfiles -

    precio_perfilL = 0
    precio_soldaduraL = 0
    precio_preparacionL = 0
    precio_perfilL_final = 0

    precio_perfilT = 0
    precio_soldaduraT = 0
    precio_perfilT_final = 0

    if distancia_margen_superior is not None or distancia_margen_inferior is not None:

        if distancia_margen_superior is not None:
            if codigo_perfil_superior is None or n_perfiles_superior is None:
                raise ValueError("Debes indicar código y número de perfiles para el perfil longitudinal superior")
            resultado_perfil_superior = calcular_precio_perfil_longitudinal(
                db,
                cantidad_bandas,
                codigo_perfil_superior,
                largo,
                ancho,
                n_perfiles_superior,
                distancia_margen_superior,
                cliente_id
            )
            precio_perfilL += resultado_perfil_superior["precio_perfil_total"]

            precio_soldaduraL += resultado_perfil_superior["precio_soldadura_total"]

            precio_perfilL_final += resultado_perfil_superior["precio_final"]

            precio_preparacionL += resultado_perfil_superior["precio_preparacion_PL"]

        if distancia_margen_inferior is not None:
            if codigo_perfil_inferior is None or n_perfiles_inferior is None:
                raise ValueError("Debes indicar código y número de perfiles para el perfil longitudinal inferior")
            resultado_perfil_inferior = calcular_precio_perfil_longitudinal(
                db,
                cantidad_bandas,
                codigo_perfil_inferior,
                largo,
                ancho,
                n_perfiles_inferior,
                distancia_margen_inferior,
                cliente_id
            )
            precio_perfilL += resultado_perfil_inferior["precio_perfil_total"]

            precio_soldaduraL += resultado_perfil_inferior["precio_soldadura_total"]

            precio_preparacionL += resultado_perfil_inferior["precio_preparacion_PL"]

            precio_perfilL_final += resultado_perfil_inferior["precio_final"]

        total_perfiles_longitudinales = 0

        if n_perfiles_superior is not None:

            total_perfiles_longitudinales += n_perfiles_superior

        if n_perfiles_inferior is not None:

            total_perfiles_longitudinales += n_perfiles_inferior

    elif codigo_perfilT is not None and (distancia_paso is not None or n_perfilesT is not None):

        print(f"DEBUG: {codigo_perfilT}")

        resultado_perfil = calcular_precio_perfil_transversal(db, codigo_perfilT, ancho, largo, n_perfilesT, distancia_paso, ancho_perfilT, cliente_id)

        precio_perfilT = resultado_perfil["precio_perfil_total"]
        precio_soldaduraT = resultado_perfil["precio_soldadura_total"]

        precio_perfilT_final += resultado_perfil["precio_final"]

        n_perfilesT = resultado_perfil["numero_pefiles"]
        distancia_paso = resultado_perfil["distancia_paso"]
        ancho_perfilT = resultado_perfil["ancho_perfil"]

    # - Precio runers -

    precio_runer = 0
    precio_soldadura_runer = 0
    precio_runer_final = 0

    if codigo_runer is not None:

        resultado_runer = calcular_precio_runer(db, codigo_runer, ancho, largo, n_perfiles_runer, cliente_id)

        precio_runer = resultado_runer["precio_runer_total"]
        precio_soldadura_runer = resultado_runer["precio_soldadura_total"]

        precio_runer_final = resultado_runer["precio_final"]

    # - Precio perforaciones -

    precio_perforaciones_final = 0
    paso_filas = None

    if agujeros_x_fila is not None or filas_x_agujero is not None or diametro_perforacion is not None:
        if agujeros_x_fila is None or filas_x_agujero is None:
            raise ValueError("Debes indicar agujeros_x_fila y filas_x_agujero para calcular perforaciones")

        if diametro_perforacion is None:
            diametro_perforacion = 10

        resultado_perforaciones = calcular_precio_perforaciones(
            db,
            agujeros_x_fila,
            filas_x_agujero,
            diametro_perforacion,
            largo,
            ancho,
            cliente_id
        )

        precio_perforaciones_final = resultado_perforaciones["precio_total"]
        paso_filas = resultado_perforaciones["paso_filas"]

    # - Precio ondas -

    precio_ondas = 0
    precio_ondas_total = 0
    precio_ondas_final = 0

    if codigo_onda is not None:
        
        resultado_ondas = calcular_precio_ondas(db, continuidad_onda, codigo_onda, n_ondas, base_onda, altura_onda, ancho, pisada_onda, cliente_id)

        precio_ondas = resultado_ondas["precio_onda"]
        precio_ondas_total = resultado_ondas["precio_onda_total"]
        precio_ondas_final = resultado_ondas["precio_final"]

    # - Precio total -

    precio_total = precio_banda + precio_empalme + precio_perfilT_final + precio_perfilL_final +precio_runer_final + precio_perforaciones_final + precio_ondas_final

    return {

        "nombre_cliente": nombre_cliente,
        "cantidad_bandas": cantidad_bandas,
        "ancho_banda": ancho,
        "largo_banda": largo,
        "codigo_banda": codigo_banda,
        "tipo_empalme": tipo_empalme,
        "subtipo_empalme": subtipo_empalme,
        "precio_banda": round(precio_banda, 2),
        "precio_empalme": round(precio_empalme, 2),
        "codigo_perfil_superior": codigo_perfil_superior,
        "codigo_perfil_inferior": codigo_perfil_inferior,
        "n_perfiles_superior": n_perfiles_superior,
        "n_perfiles_inferior": n_perfiles_inferior,
        "distancia_margen_superior": distancia_margen_superior,
        "distancia_margen_inferior": distancia_margen_inferior,
        "precio_perfilL": round(precio_perfilL, 2),
        "precio_soldaduraL": round(precio_soldaduraL, 2),
        "precio_perfilL_final": round(precio_perfilL_final, 2),
        "codigo_perfilT": codigo_perfilT,
        "n_perfilesT": n_perfilesT,
        "margen_lateral": margen_lateral,
        "ancho_perfilT": ancho_perfilT,
        "n_hileras": n_hileras,
        "ancho1": ancho1,
        "ancho2": ancho2,
        "luz_interior": luz_interior,
        "distancia_paso": distancia_paso,
        "precio_perfilT": round(precio_perfilT, 2),
        "precio_soldaduraT": round(precio_soldaduraT, 2),
        "precio_perfilT_final": round(precio_perfilT_final, 2),
        "codigo_runer": codigo_runer,
        "n_perfiles_runer": n_perfiles_runer,
        "margen_runer": margen_runer,
        "luz_runer": luz_runer,
        "ancho_runer": ancho_runer,
        "precio_runer": round(precio_runer, 2),
        "precio_runer_soldadura": round(precio_soldadura_runer, 2),
        "precio_runer_final": round(precio_runer_final, 2),
        "precio_perforaciones": round(precio_perforaciones_final, 2),
        "paso_filas": paso_filas,
        "diametro_perforacion": diametro_perforacion,
        "agujeros_x_fila": agujeros_x_fila,
        "filas_x_agujero": filas_x_agujero,
        "codigo_onda": codigo_onda,
        "n_ondas": n_ondas,
        "base_onda": base_onda,
        "altura_onda": altura_onda,
        "continuidad_onda": continuidad_onda,
        "pisada_onda": pisada_onda,
        "precio_onda": round(precio_ondas, 2),
        "precio_onda_total": round(precio_ondas_total, 2),
        "precio_ondas_final": round(precio_ondas_final, 2),
        "precio_total": round(precio_total, 2),

    }
