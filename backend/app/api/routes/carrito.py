# routers/carrito.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Dict

from app.services import carrito_service
from app.services.isbue_service import IsbueService
from app.db.database import get_db

router = APIRouter(
    prefix="/carrito",
    tags=["Carrito"]
)

isbue_service = IsbueService()


class AñadirLineaRequest(BaseModel):
    resultado: Dict[str, Any]
    state_frontend: Dict[str, Any]


@router.post("/lineas")
def añadir_linea(payload: AñadirLineaRequest, db=Depends(get_db)):
    linea = isbue_service.construir_linea_isbue(payload.resultado, payload.state_frontend)
    id_linea = carrito_service.añadir_linea(db, linea)
    return {"id": id_linea, "linea": linea}


@router.get("/lineas")
def listar_lineas(db=Depends(get_db)):
    return carrito_service.listar_lineas(db)


@router.delete("/lineas/{id_linea}")
def borrar_linea(id_linea: int, db=Depends(get_db)):
    borrado = carrito_service.borrar_linea(db, id_linea)
    if not borrado:
        raise HTTPException(status_code=404, detail="Línea no encontrada")
    return {"ok": True}


@router.delete("/lineas")
def vaciar_carrito(db=Depends(get_db)):
    carrito_service.vaciar_carrito(db)
    return {"ok": True}