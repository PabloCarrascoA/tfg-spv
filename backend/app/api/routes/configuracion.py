# app/api/routes/configuracion.py

from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.services.banda_service import obtener_banda_por_codigo, calcular_precio_banda
from app.schemas.configuration_schema import ConfiguracionInput, ConfiguracionOutput
from app.schemas.configuracion import CalculoBandaRequest, CalculoBandaResponse

router = APIRouter(
    prefix="/configuracion",
    tags=["Configuración"]
)

@router.get("/banda/{codigo}")
def obtener_banda(codigo: str, db = Depends(get_db)):
    
    banda = obtener_banda_por_codigo(db, codigo)

    if not banda:
        raise HTTPException(status_code=404, detail="Banda no encontrada")

    return {
        "nombre": banda["nombre"],
        "precio": banda["precio"]
    }

@router.post("/calcular", response_model=CalculoBandaResponse)
def calcular(request: CalculoBandaRequest, db = Depends(get_db)):
    try:
        return calcular_precio_banda(
            db,
            request.codigo_banda,
            request.largo,
            request.ancho
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
