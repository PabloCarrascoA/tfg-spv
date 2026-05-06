from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from app.db.database import get_db
from app.services.importer_service import (
    get_columnas_tabla, parsear_archivo, aplicar_mapeo,
    detectar_duplicados, importar_filas, TABLAS_IMPORTABLES
)
import json

router = APIRouter(prefix="/importar", tags=["Importador"])

@router.get("/tablas")
def listar_tablas():
    return list(TABLAS_IMPORTABLES.keys())

@router.get("/tablas/{tabla}/columnas")
def columnas_tabla(tabla: str, db=Depends(get_db)):
    try:
        return get_columnas_tabla(db, tabla)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/parsear")
async def parsear(
    archivo: UploadFile = File(...),
    separador: str = Form(',')
):
    contenido = await archivo.read()
    try:
        encabezados, primera_linea, todas_filas = parsear_archivo(
            contenido, archivo.filename, separador
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al parsear: {str(e)}")

    return {
        "encabezados":   encabezados,
        "primera_linea": primera_linea,
        "total_filas":   len(todas_filas),
        # guardamos filas en base64 para no perderlas entre requests
        "filas":         todas_filas
    }

@router.post("/previsualizar")
def previsualizar(body: dict, db=Depends(get_db)):
    encabezados = body.get("encabezados", [])
    filas       = body.get("filas", [])
    mapeo       = body.get("mapeo", {})

    filas_mapeadas = aplicar_mapeo(encabezados, filas, mapeo)
    primeras_10    = filas_mapeadas[:10]
    duplicados     = detectar_duplicados(db, body["tabla"], filas_mapeadas)

    return {
        "preview":    primeras_10,
        "duplicados": duplicados,
        "total":      len(filas_mapeadas)
    }

@router.post("/ejecutar")
def ejecutar(body: dict, db=Depends(get_db)):
    tabla      = body.get("tabla")
    encabezados = body.get("encabezados", [])
    filas      = body.get("filas", [])
    mapeo      = body.get("mapeo", {})
    modo       = body.get("modo", "solo_nuevos")  # 'solo_nuevos' | 'actualizar'

    filas_mapeadas = aplicar_mapeo(encabezados, filas, mapeo)

    try:
        resultado = importar_filas(db, tabla, filas_mapeadas, modo)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return resultado