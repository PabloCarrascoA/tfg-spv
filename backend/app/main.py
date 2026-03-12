# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import configuracion
from app.db.database import get_db_connection
from app.api.routes import importer

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

with get_db_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS perfiles_longitudinales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            codigo TEXT UNIQUE NOT NULL,
            precio REAL NOT NULL
        )
    """)
    conn.commit()

with get_db_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS perfiles_transversales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            codigo TEXT UNIQUE NOT NULL,
            precio REAL NOT NULL
        )
    """)
    conn.commit()

app = FastAPI(
    title="Configurador Industrial API",
    description="API para configurar y gestionar productos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar las rutas

app.include_router(configuracion.router)

app.include_router(importer.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido al Configurador Industrial API"}
