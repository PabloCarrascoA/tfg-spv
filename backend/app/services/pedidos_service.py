from datetime import date

def get_siguiente_numero_pedido(db):
    cursor = db.cursor()
    cursor.execute("SELECT MAX(numero_pedido) FROM pedidos")
    row = cursor.fetchone()
    return (row[0] or 0) + 1

def guardar_pedido(db, resultado, state_frontend):
    numero = get_siguiente_numero_pedido(db)
    fecha  = date.today().isoformat()
    banda_state = state_frontend.get('banda', {})

    cursor = db.cursor()

    # cabecera
    cursor.execute("""
        INSERT INTO pedidos (numero_pedido, fecha, nombre_cliente, estado, precio_total)
        VALUES (?, ?, ?, 'en_proceso', ?)
    """, (numero, fecha, resultado.get('nombre_cliente'), resultado.get('precio_total')))

    pedido_id = cursor.lastrowid

    # banda
    if resultado.get('codigo_banda'):
        cursor.execute("""
            INSERT INTO pedido_banda
            (pedido_id, codigo_banda, cantidad, largo, ancho, tipo_empalme, subtipo_empalme, precio_banda, precio_empalme, comentarios)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pedido_id,
            resultado.get('codigo_banda'),
            resultado.get('cantidad_bandas'),
            resultado.get('largo_banda'),
            resultado.get('ancho_banda'),
            resultado.get('tipo_empalme') or banda_state.get('tipoEmpalme'),
            resultado.get('subtipo_empalme') or banda_state.get('subtipoEmpalme'),
            resultado.get('precio_banda'),
            resultado.get('precio_empalme'),
            banda_state.get('comentarios'),
        ))

    # perfil longitudinal
    if resultado.get('codigo_perfil_superior') or resultado.get('codigo_perfil_inferior'):
        cursor.execute("""
            INSERT INTO pedido_perfil_longitudinal
            (pedido_id, codigo_perfil_superior, n_perfiles_superior, distancia_margen_sup,
             codigo_perfil_inferior, n_perfiles_inferior, distancia_margen_inf, precio_final, comentarios)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pedido_id,
            resultado.get('codigo_perfil_superior'),
            resultado.get('n_perfiles_superior'),
            resultado.get('distancia_margen_superior'),
            resultado.get('codigo_perfil_inferior'),
            resultado.get('n_perfiles_inferior'),
            resultado.get('distancia_margen_inferior'),
            resultado.get('precio_perfilL_final'),
            state_frontend.get('perfilL', {}).get('comentarios'),
        ))

    # perfil transversal
    if resultado.get('codigo_perfilT'):
        cursor.execute("""
            INSERT INTO pedido_perfil_transversal
            (pedido_id, codigo_perfil, n_perfiles, ancho_perfil, distancia_paso,
             margen_lateral, n_hileras, ancho1, ancho2, luz_interior, precio_final, comentarios)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pedido_id,
            resultado.get('codigo_perfilT'),
            resultado.get('n_perfilesT'),
            resultado.get('ancho_perfilT'),
            resultado.get('distancia_paso'),
            resultado.get('margen_lateral'),
            resultado.get('n_hileras'),
            resultado.get('ancho1'),
            resultado.get('ancho2'),
            resultado.get('luz_interior'),
            resultado.get('precio_perfilT_final'),
            state_frontend.get('perfilT', {}).get('comentarios'),
        ))

    # runer
    if resultado.get('codigo_runer'):
        cursor.execute("""
            INSERT INTO pedido_runer
            (pedido_id, codigo_runer, n_runers, luz, margen, precio_final, comentarios)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            pedido_id,
            resultado.get('codigo_runer'),
            resultado.get('n_perfiles_runer'),
            resultado.get('luz_runer'),
            resultado.get('margen_runer'),
            resultado.get('precio_runer_final'),
            state_frontend.get('runer', {}).get('comentarios'),
        ))

    # perforaciones
    if resultado.get('agujeros_x_fila'):
        cursor.execute("""
            INSERT INTO pedido_perforaciones
            (pedido_id, agujeros_x_fila, filas_x_agujero, diametro, paso_filas, precio_final)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            pedido_id,
            resultado.get('agujeros_x_fila'),
            resultado.get('filas_x_agujero'),
            resultado.get('diametro_perforacion'),
            resultado.get('paso_filas'),
            resultado.get('precio_perforaciones'),
        ))

    # ondas
    if resultado.get('codigo_onda'):
        cursor.execute("""
            INSERT INTO pedido_onda
            (pedido_id, codigo_onda, n_ondas, base, altura, pisada, continua, precio_final, comentarios)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pedido_id,
            resultado.get('codigo_onda'),
            resultado.get('n_ondas'),
            resultado.get('base_onda'),
            resultado.get('altura_onda'),
            resultado.get('pisada_onda'),
            1 if resultado.get('continuidad_onda') else 0,
            resultado.get('precio_ondas_final'),
            state_frontend.get('onda', {}).get('comentarios'),
        ))

    db.commit()
    return {"pedido_id": pedido_id, "numero_pedido": numero}


def listar_pedidos(db):
    cursor = db.cursor()
    cursor.execute("""
        SELECT p.id, p.numero_pedido, p.fecha, p.nombre_cliente, p.estado, p.precio_total
        FROM pedidos p ORDER BY p.id DESC
    """)
    pedidos = []
    for row in cursor.fetchall():
        pedido_id = row[0]
        componentes = get_componentes_pedido(db, pedido_id)
        pedidos.append({
            "id": pedido_id,
            "numero_pedido": row[1],
            "fecha": row[2],
            "nombre_cliente": row[3],
            "estado": row[4],
            "precio_total": row[5],
            "componentes": componentes,
        })
    return pedidos


def get_componentes_pedido(db, pedido_id):
    cursor = db.cursor()
    componentes = []
    tablas = [
        ("pedido_banda",               "Bandas"),
        ("pedido_perfil_longitudinal", "Perfiles longitudinales"),
        ("pedido_perfil_transversal",  "Perfiles transversales"),
        ("pedido_runer",               "Runer"),
        ("pedido_perforaciones",       "Perforaciones"),
        ("pedido_onda",                "Ondas"),
    ]
    for tabla, label in tablas:
        cursor.execute(f"SELECT id FROM {tabla} WHERE pedido_id = ?", (pedido_id,))
        if cursor.fetchone():
            componentes.append(label)
    return componentes


def get_detalle_pedido(db, pedido_id):
    cursor = db.cursor()
    cursor.execute("""
        SELECT id, numero_pedido, fecha, nombre_cliente, estado, precio_total
        FROM pedidos WHERE id = ?
    """, (pedido_id,))
    row = cursor.fetchone()
    if not row:
        return None

    detalle = {
        "id": row[0], "numero_pedido": row[1], "fecha": row[2],
        "nombre_cliente": row[3], "estado": row[4], "precio_total": row[5],
    }

    # banda
    cursor.execute("SELECT * FROM pedido_banda WHERE pedido_id = ?", (pedido_id,))
    r = cursor.fetchone()
    if r:
        cols = [d[0] for d in cursor.description]
        detalle["banda"] = dict(zip(cols, r))

    # perfil longitudinal
    cursor.execute("SELECT * FROM pedido_perfil_longitudinal WHERE pedido_id = ?", (pedido_id,))
    r = cursor.fetchone()
    if r:
        cols = [d[0] for d in cursor.description]
        detalle["perfil_longitudinal"] = dict(zip(cols, r))

    # perfil transversal
    cursor.execute("SELECT * FROM pedido_perfil_transversal WHERE pedido_id = ?", (pedido_id,))
    r = cursor.fetchone()
    if r:
        cols = [d[0] for d in cursor.description]
        detalle["perfil_transversal"] = dict(zip(cols, r))

    # runer
    cursor.execute("SELECT * FROM pedido_runer WHERE pedido_id = ?", (pedido_id,))
    r = cursor.fetchone()
    if r:
        cols = [d[0] for d in cursor.description]
        detalle["runer"] = dict(zip(cols, r))

    # perforaciones
    cursor.execute("SELECT * FROM pedido_perforaciones WHERE pedido_id = ?", (pedido_id,))
    r = cursor.fetchone()
    if r:
        cols = [d[0] for d in cursor.description]
        detalle["perforaciones"] = dict(zip(cols, r))

    # ondas
    cursor.execute("SELECT * FROM pedido_onda WHERE pedido_id = ?", (pedido_id,))
    r = cursor.fetchone()
    if r:
        cols = [d[0] for d in cursor.description]
        detalle["onda"] = dict(zip(cols, r))

    return detalle


def actualizar_estado_pedido(db, pedido_id, nuevo_estado):
    cursor = db.cursor()
    cursor.execute(
        "UPDATE pedidos SET estado = ? WHERE id = ?",
        (nuevo_estado, pedido_id)
    )
    db.commit()
    return {"ok": True}
