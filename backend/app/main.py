# app/main.py

from fastapi import FastAPI
from app.api.routes import configuracion
from app.db.database import get_db_connection

# Crear tabla de bandas si no existe
with get_db_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bandas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            codigo TEXT UNIQUE NOT NULL,
            proveedor TEXT,
            material TEXT,
            color TEXT,
            precio REAL NOT NULL
        )
    """)
    conn.commit()

app = FastAPI(
    title="Configurador Industrial API",
    description="API para configurar y gestionar productos",
    version="1.0.0"
)

# Registrar las rutas
app.include_router(configuracion.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido al Configurador Industrial API"}