# app/api/routes/configuracion.py

from fastapi import APIRouter, Depends, HTTPException

from app.db.database import get_db

from app.services.banda_service import (
    calcular_configuracion_completa,
    obtener_banda_por_codigo,
    calcular_precio_banda,
    obtener_empalmes,
)
from app.schemas.configuracion import CalculoBandaRequest, CalculoBandaResponse

from app.services.banda_service import calcular_precio_empalme, obtener_bandas

router = APIRouter(
    prefix="/configuracion",
    tags=["Configuración"]
)

@router.get("/bandas")
def listar_bandas(db = Depends(get_db)):
    bandas = obtener_bandas(db)
    return bandas

@router.get("/banda/{codigo}")
def obtener_banda(codigo: str, db = Depends(get_db)):
    
    banda = obtener_banda_por_codigo(db, codigo)

    if not banda:
        raise HTTPException(status_code=404, detail="Banda no encontrada")

    return {
        "nombre": banda["nombre"],
        "precio": banda["precio"]
    }

@router.get("/empalmes/{tipo}")
def listar_empalmes(tipo: str, db = Depends(get_db)):

    empalmes = obtener_empalmes(db, tipo)

    if not empalmes:
        raise HTTPException(status_code=404, detail="Tipo de empalme no encontrado")

    return empalmes

@router.post("/calcular", response_model=CalculoBandaResponse)
def calcular(request: CalculoBandaRequest, db = Depends(get_db)):
    try:

        precio_total = calcular_configuracion_completa (

            db,
            request.codigo_banda,
            request.largo,
            request.ancho,
            request.tipo_empalme,
            request.codigo_empalme

        )

        return precio_total
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
