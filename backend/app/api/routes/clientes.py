from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

@router.get("/clientes")
def listar_clientes(db=Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT nombre FROM clientes ORDER BY nombre")
    return [row[0] for row in cursor.fetchall()]