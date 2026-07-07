from fastapi import APIRouter, Depends, HTTPException
from app.services.isbue_service import IsbueService
from app.db.database import get_db

isbue_service = IsbueService()

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

@router.get("")
def listar_clientes():

    clientes = isbue_service.obtener_clientes()

    return clientes
