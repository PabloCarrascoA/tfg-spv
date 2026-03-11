from fastapi import APIRouter, UploadFile, File
from app.utils.excel_reader import leer_excel, leer_csv
from app.services import importer_service
from app.db.database import get_db
from fastapi import Depends

import os

router = APIRouter(
    prefix="/importer",
    tags=["Importador"]
    )

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    path = f"temp_{file.filename}"

    with open(path, "wb") as buffer:
        buffer.write(await file.read())

    if file.filename.endswith(".csv"):
        data = leer_csv(path)

    else:
        data = leer_excel(path)

    os.remove(path)

    return data

@router.get("/campos/{tabla}")
def obtener_campos(tabla: str, db=Depends(get_db)):

    campos = importer_service.obtener_campos_tabla(db, tabla)

    return campos

@router.post("/procesar")
def procesar_importacion(data: dict, db=Depends(get_db)):

    tabla = data["tabla"]
    archivo = data["archivo"]
    mapeo = data["mapeo"]

    campos = importer_service.obtener_campos_tabla(db, tabla)

    resultado = importer_service.guardar_mapeo(
        db,
        tabla,
        archivo,
        mapeo,
        campos
    )

    return resultado