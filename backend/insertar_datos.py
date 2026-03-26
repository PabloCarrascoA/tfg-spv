from app.db.database import get_db_connection

# -----------------------
# Datos de prueba
# -----------------------

runners = [
    {"tipo": "Runner Ej1", "codigo": "R01", "color": "Blanco", "material": "PVC", "precio_material": 10, "precioSoldar_Asup1700_PVC": 18, "precioSoldar_Ainf1700_PVC": 18, "precioSoldar_Uretano": 25},
    {"tipo": "Runner Ej2", "codigo": "R02", "color": "Azul", "material": "Uretano", "precio_material": 15, "precioSoldar_Asup1700_PVC": 18, "precioSoldar_Ainf1700_PVC": 18, "precioSoldar_Uretano": 25},
]

perfiles_longitudinales = [
    {"tipo": "Perfil ejemplo K-6", "color": "Verde", "proveedor": "ProveedorX", "material": "PVC", "codigo": "PL01", "precio_material": 25.0, "precioSoldar_Linf1500": 5.0, "precioSoldar_Lsup1500_Ainf2100": 7.5, "precioSoldar_LSup1500_Asup2100": 10.0},
    {"tipo": "Perfil ejemplo K-6", "color": "Azul", "proveedor": "ProveedorY", "material": "PVC", "codigo": "PL02", "precio_material": 35.0, "precioSoldar_Linf1500": 5.0, "precioSoldar_Lsup1500_Ainf2100": 7.5, "precioSoldar_LSup1500_Asup2100": 10.0}
]

perfiles_transversales = [
    {"tipo": "Trapezoidal 1", "color": "Verde", "proveedor": "ProveedorX", "material": "PVC", "codigo": "PT01", "precio_material": 25.0, "precioSoldar_Lhasta1000": 5.0, "precioSoldar_L1000_1400": 7.5, "precioSoldar_Especial": 10.0},
    {"tipo": "Trapezoidal 2", "color": "Azul", "proveedor": "ProveedorY", "material": "PVC", "codigo": "PT02", "precio_material": 35.0, "precioSoldar_Lhasta1000": 5.0, "precioSoldar_L1000_1400": 7.5, "precioSoldar_Especial": 10.0}
]

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

    # =====================
    # PERFILES LONGITUDINALES
    # =====================

    codigos_perfiles = [p["codigo"] for p in perfiles_longitudinales]
    placeholders = ",".join("?" * len(codigos_perfiles))
    cursor.execute(f"DELETE FROM perfiles_longitudinales WHERE codigo IN ({placeholders})", codigos_perfiles)

    for perfil_l in perfiles_longitudinales:
        cursor.execute("""
            INSERT INTO perfiles_longitudinales (tipo, codigo, color, proveedor, material, precio_material, precioSoldar_Linf1500, precioSoldar_Lsup1500_Ainf2100, precioSoldar_LSup1500_Asup2100)
            VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            perfil_l.get("tipo", ""),
            perfil_l["codigo"],
            perfil_l.get("color", ""),
            perfil_l.get("proveedor", ""),
            perfil_l.get("material", ""),
            perfil_l.get("precio_material", 0.0),
            perfil_l.get("precioSoldar_Linf1500", 0.0),
            perfil_l.get("precioSoldar_Lsup1500_Ainf2100", 0.0),
            perfil_l.get("precioSoldar_LSup1500_Asup2100", 0.0),
        ))

    # =====================
    # PERFILES TRANSVERSALES
    # =====================

    codigos_perfiles = [p["codigo"] for p in perfiles_transversales]
    placeholders = ",".join("?" * len(codigos_perfiles))
    cursor.execute(f"DELETE FROM perfiles_transversales WHERE codigo IN ({placeholders})", codigos_perfiles)

    for perfil_t in perfiles_transversales:
        cursor.execute("""
            INSERT INTO perfiles_transversales (tipo, codigo, color, proveedor, material, precio_material, precioSoldar_Lhasta1000, precioSoldar_L1000_1400, precioSoldar_Especial)
            VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            perfil_t.get("tipo", ""),
            perfil_t["codigo"],
            perfil_t.get("color", ""),
            perfil_t.get("proveedor", ""),
            perfil_t.get("material", ""),
            perfil_t.get("precio_material", 0.0),
            perfil_t.get("precioSoldar_Lhasta1000", 0.0),
            perfil_t.get("precioSoldar_L1000_1400", 0.0),
            perfil_t.get("precioSoldar_Especial", 0.0),
        ))

    # =====================
    # RUNNER
    # =====================

    codigos_runner = [p["codigo"] for p in runners]
    placeholders = ",".join("?" * len(codigos_runner))
    cursor.execute(f"DELETE FROM runners WHERE codigo in ({placeholders})", codigos_runner)

    for runner in runners:
        cursor.execute("""
            INSERT INTO runners (tipo, codigo, color, material, precio_material, precioSoldar_Asup1700_PVC, precioSoldar_Ainf1700_PVC, precioSoldar_Uretano)
            VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            runner.get("tipo", ""),
            runner["codigo"],
            runner.get("color", ""),
            runner.get("material", ""),
            runner.get("precio_material", 0.0),
            runner.get("precioSoldar_Asup1700_PVC", 0.0),
            runner.get("precioSoldar_Ainf1700_PVC", 0.0),
            runner.get("precioSoldar_Uretano", 0.0),

        ))

    conn.commit()

    print("Datos insertados correctamente:")
    print(f"- {len(bandas)} bandas")
    print(f"- {len(sin_fin)} sin fin")
    print(f"- {len(extremos_preparados)} extremos preparados")
    print(f"- {len(grapas)} grapas")
    print(f"- {len(perfiles_longitudinales)} perfiles longitudinales")
    print(f"- {len(perfiles_transversales)} perfiles transversales")
    print(f"- {len(runners)} runners")


