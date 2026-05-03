from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.services.pedidos_service import (
    guardar_pedido, listar_pedidos, get_detalle_pedido, actualizar_estado_pedido, eliminar_pedido
)
from pydantic import BaseModel

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

@router.get("/clientes")
def listar_clientes(db=Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT nombre FROM clientes ORDER BY nombre")
    return [row[0] for row in cursor.fetchall()]