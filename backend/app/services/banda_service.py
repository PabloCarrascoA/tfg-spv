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

    precio_total = largo * ancho * precio_unitario

    return {
        "codigo_banda": codigo,
        "precio_unitario": precio_unitario,
        "precio_total": precio_total
    }