# app/api/routes/configuracion.py

from fastapi import APIRouter, Depends, HTTPException

from app.db.database import get_db

from app.services.banda_service import (
    calcular_configuracion_completa,
    obtener_banda_por_codigo,
    calcular_precio_banda,
    obtener_empalmes,
    obtener_perfil_longitudinal_por_codigo,
    obtener_perfil_transversal_por_codigo
)
from app.schemas.configuracion import CalculoBandaRequest, CalculoBandaResponse

from app.services.banda_service import calcular_precio_empalme, obtener_bandas

router = APIRouter(
    prefix="/configuracion",
    tags=["Configurador"]
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

@router.get('perfiles/longitudinales/{codigo}')
def obtener_perfil(codigo: str, db = Depends(get_db)):
    perfil = obtener_perfil_longitudinal_por_codigo(db, codigo)

    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    
    return {
        "nombre": perfil["nombre"],
        "precio": perfil["precio"]
    }

@router.get('perfiles/transversales/{codigo}')
def obtener_perfil_transversal(codigo: str, db = Depends(get_db)):
    perfil = obtener_perfil_transversal_por_codigo(db, codigo)

    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    
    return {
        "nombre": perfil["nombre"],
        "precio": perfil["precio"]
    }

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
