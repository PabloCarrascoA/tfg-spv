from app.db.database import get_db_connection

# -----------------------
# Datos de prueba
# -----------------------

sin_fin = [
    {"codigo": "SF01", "precio": 15.0},
    {"codigo": "SF02", "precio": 20.0}
]

extremos_preparados = [
    {"codigo": "EP01", "precio": 10.0},
    {"codigo": "EP02", "precio": 12.5}
]

grapas = [
    {"codigo": "GR01", "precio": 5.0},
    {"codigo": "GR02", "precio": 7.5}
]

bandas = [
    {
        "nombre": "Banda PVC Verde",
        "codigo": "PVC01",
        "proveedor": "ProveedorX",
        "material": "PVC",
        "color": "Verde",
        "precio": 25.0
    },
    {
        "nombre": "Banda PU Azul",
        "codigo": "PU02",
        "proveedor": "ProveedorY",
        "material": "PU",
        "color": "Azul",
        "precio": 32.5
    }
]


# -----------------------
# Inserción
# -----------------------

with get_db_connection() as conn:
    cursor = conn.cursor()

    # =====================
    # BANDAS
    # =====================

    codigos_bandas = [b["codigo"] for b in bandas]
    placeholders = ",".join("?" * len(codigos_bandas))
    cursor.execute(f"DELETE FROM bandas WHERE codigo IN ({placeholders})", codigos_bandas)

    for banda in bandas:
        cursor.execute("""
            INSERT INTO bandas (nombre, codigo, proveedor, material, color, precio)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            banda["nombre"],
            banda["codigo"],
            banda["proveedor"],
            banda["material"],
            banda["color"],
            banda["precio"]
        ))

    # =====================
    # SIN FIN
    # =====================

    codigos_sf = [s["codigo"] for s in sin_fin]
    placeholders = ",".join("?" * len(codigos_sf))
    cursor.execute(f"DELETE FROM sin_fin WHERE codigo IN ({placeholders})", codigos_sf)

    for s in sin_fin:
        cursor.execute("""
            INSERT INTO sin_fin (codigo, precio)
            VALUES (?, ?)
        """, (
            s["codigo"],
            s["precio"]
        ))

    # =====================
    # EXTREMOS PREPARADOS
    # =====================

    codigos_ep = [e["codigo"] for e in extremos_preparados]
    placeholders = ",".join("?" * len(codigos_ep))
    cursor.execute(f"DELETE FROM extremos_preparados WHERE codigo IN ({placeholders})", codigos_ep)

    for e in extremos_preparados:
        cursor.execute("""
            INSERT INTO extremos_preparados (codigo, precio)
            VALUES (?, ?)
        """, (
            e["codigo"],
            e["precio"]
        ))

    # =====================
    # GRAPAS
    # =====================

    codigos_gr = [g["codigo"] for g in grapas]
    placeholders = ",".join("?" * len(codigos_gr))
    cursor.execute(f"DELETE FROM grapas WHERE codigo IN ({placeholders})", codigos_gr)

    for g in grapas:
        cursor.execute("""
            INSERT INTO grapas (codigo, precio)
            VALUES (?, ?)
        """, (
            g["codigo"],
            g["precio"]
        ))

    conn.commit()

    print("Datos insertados correctamente:")
    print(f"- {len(bandas)} bandas")
    print(f"- {len(sin_fin)} sin fin")
    print(f"- {len(extremos_preparados)} extremos preparados")
    print(f"- {len(grapas)} grapas")