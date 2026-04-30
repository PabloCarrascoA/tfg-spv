from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from fastapi.responses import StreamingResponse
from app.services.exporter_service import get_info_tabla, exportar_tabla_excel, TABLAS_EXPORTABLES

router = APIRouter(
    prefix="/exportar",
    tags=["Exportador"]
)

@router.get("/{tabla}/info")
def info_tabla(tabla: str, db=Depends(get_db)):
    try:
        return get_info_tabla(db, tabla)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{tabla}")
def exportar_tabla(tabla: str, db=Depends(get_db)):
    try:
        buffer, filename = exportar_tabla_excel(db, tabla)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )