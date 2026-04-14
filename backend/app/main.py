# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import configuracion
from app.db.database import get_db_connection
from app.api.routes import importer

# Crear tablas de bandas si no existe
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
        CREATE TABLE IF NOT EXISTS perfiles_transversales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            tipo TEXT,
            color TEXT,
            proveedor TEXT,
            material TEXT,
            precio_material REAL,
            precioSoldar_Lhasta1000 REAL,
            precioSoldar_L1000_1400 REAL,
            precioSoldar_Especial REAL
        )
    """)
    conn.commit()

with get_db_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS perfiles_longitudinales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            tipo TEXT,
            color TEXT,
            proveedor TEXT,
            material TEXT,
            precio_material REAL,
            precioSoldar_Linf1500 REAL,
            precioSoldar_Lsup1500_Ainf2100 REAL,
            precioSoldar_LSup1500_Asup2100 REAL
        )
    """)
    conn.commit()

with get_db_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS runners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT,
            codigo TEXT UNIQUE NOT NULL,
            color TEXT,
            material TEXT,
            precio_material REAL,
            precioSoldar_Asup1700_PVC REAL,
            precioSoldar_Ainf1700_PVC REAL,
            precioSoldar_Uretano REAL
                   
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
    allow_origins=["http://127.0.0.1:5500", "http://127.0.0.1:5173", "http://localhost:5173"],# frontend (5550 -> old), (5173 -> new)
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
