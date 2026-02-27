from app.db.database import get_db_connection

# Datos de prueba
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

with get_db_connection() as conn:
    cursor = conn.cursor()
    
    # Limpiar datos de prueba anteriores
    codigos = [banda["codigo"] for banda in bandas]
    placeholders = ','.join('?' * len(codigos))
    cursor.execute(f"DELETE FROM bandas WHERE codigo IN ({placeholders})", codigos)
    
    # Insertar nuevos datos
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
    
    conn.commit()
    print(f"Se insertaron {len(bandas)} bandas correctamente")