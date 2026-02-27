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