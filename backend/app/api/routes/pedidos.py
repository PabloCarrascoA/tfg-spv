from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.services.pedidos_service import (
    guardar_pedido, listar_pedidos, get_detalle_pedido, actualizar_estado_pedido, eliminar_pedido
)
from pydantic import BaseModel

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)

class GuardarPedidoRequest(BaseModel):
    resultado:       dict
    state_frontend:  dict

class ActualizarEstadoRequest(BaseModel):
    estado: str

@router.post("")
def crear_pedido(body: GuardarPedidoRequest, db=Depends(get_db)):
    return guardar_pedido(db, body.resultado, body.state_frontend)

@router.get("")
def get_pedidos(db=Depends(get_db)):
    return listar_pedidos(db)

@router.get("/{pedido_id}")
def get_pedido(pedido_id: int, db=Depends(get_db)):
    detalle = get_detalle_pedido(db, pedido_id)
    if not detalle:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return detalle

@router.patch("/{pedido_id}/estado")
def cambiar_estado(pedido_id: int, body: ActualizarEstadoRequest, db=Depends(get_db)):
    return actualizar_estado_pedido(db, pedido_id, body.estado)

@router.delete("/{pedido_id}")
def borrar_pedido(pedido_id: int, db=Depends(get_db)):
    return eliminar_pedido(db, pedido_id)