# Resolver nombre a ID de cliente

def get_cliente_id_por_nombre(db, nombre_cliente):
    if nombre_cliente is None:
        return None
    
    row = db.execute(
        "SELECT id FROM clientes WHERE nombre = ?",
        (nombre_cliente,)
    ).fetchone()
    
    return row["id"] if row else None

# Obtener descuento correspondiente

def get_descuento_producto(db, cliente_id, tabla, codigo, tipo_familia=None):
    params = [cliente_id, tabla, codigo]
    familia_clause = ""
    
    if tipo_familia:
        familia_clause = "OR (nivel = 'familia' AND codigo_producto = ?)"
        params.append(tipo_familia)

    row = db.execute(f"""
        SELECT descuento FROM descuentos_material
        WHERE cliente_id = ? AND tabla = ?
        AND (
            (nivel = 'producto' AND codigo_producto = ?)
            {familia_clause}
            OR nivel = 'global'
        )
        ORDER BY CASE nivel 
            WHEN 'producto' THEN 1 
            WHEN 'familia'  THEN 2 
            WHEN 'global'   THEN 3 
        END
        LIMIT 1
    """, params).fetchone()
    
    return row["descuento"] if row else 0.0

def get_descuento_soldadura(db, cliente_id, tabla):
    row = db.execute(
        "SELECT descuento FROM descuentos_soldadura WHERE cliente_id=? AND tabla=?",
        (cliente_id, tabla)
    ).fetchone()
    return row["descuento"] if row else 0.0