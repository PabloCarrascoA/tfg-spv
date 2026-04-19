# app/api/routes/configuracion.py

from fastapi import APIRouter, Depends, HTTPException

from app.db.database import get_db

from app.services.banda_service import (
    calcular_configuracion_completa,
    obtener_banda_por_codigo,
    calcular_precio_banda,
    obtener_empalmes,
    obtener_perfil_longitudinal_por_codigo,
    obtener_perfil_transversal_por_codigo,
    obtener_perfiles_longitudinales,
    obtener_perfiles_transversales,
    obtener_runers,
    obtener_runer_por_codigo
)
from app.schemas.configuracion import CalculoBandaRequest, CalculoBandaResponse

from app.services.banda_service import calcular_precio_empalme, obtener_bandas

router = APIRouter(
    prefix="/configuracion",
    tags=["Configurador"]
)

# --------------------------------
# OBTENER TODOS LOS DATOS A LA VEZ
# --------------------------------

@router.get("/bandas")
def listar_bandas(db = Depends(get_db)):
    bandas = obtener_bandas(db)
    return bandas

@router.get("/empalmes/{tipo}")
def listar_empalmes(tipo: str, db = Depends(get_db)):

    empalmes = obtener_empalmes(db, tipo)

    if not empalmes:
        raise HTTPException(status_code=404, detail="Tipo de empalme no encontrado")

    return empalmes

@router.get("/perfiles/longitudinales")
def listar_perfiles_longitudinales(db = Depends(get_db)):
    perfiles = obtener_perfiles_longitudinales(db)

    if not perfiles:
        raise HTTPException(status_code=404, detail="No se encontraron perfiles longitudinales")

    return perfiles

@router.get("/perfiles/transversales")
def listar_perfiles_transversales(db = Depends(get_db)):
    perfiles = obtener_perfiles_transversales(db)

    if not perfiles:
        raise HTTPException(status_code=404, detail="No se encontraron perfiles transversales")

    return perfiles

@router.get("/runers")
def listar_runers(db = Depends(get_db)):
    runers = obtener_runers(db)

    if not runers:
        raise HTTPException(status_code = 404, detail= "No se encontraron runers")
    
    return runers

# ------------------------
# OBTENER DATOS POR CÓDIGO
# ------------------------

@router.get("/banda/{codigo}")
def obtener_banda(codigo: str, db = Depends(get_db)):
    
    banda = obtener_banda_por_codigo(db, codigo)

    if not banda:
        raise HTTPException(status_code=404, detail="Banda no encontrada")

    return {
        "nombre": banda["nombre"],
        "precio": banda["precio"]
    }

@router.get('/perfiles/longitudinales/{codigo}')
def obtener_perfil_longitudinal(codigo: str, db = Depends(get_db)):
    perfil = obtener_perfil_longitudinal_por_codigo(db, codigo)

    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    
    return {
        "codigo": perfil["codigo"],
        "tipo": perfil["tipo"],
        "color": perfil["color"],
        "proveedor": perfil["proveedor"],
        "material": perfil["material"],
        "precio_material": perfil["precio_material"],
        "precioSoldar_Linf1500": perfil["precioSoldar_Linf1500"],
        "precioSoldar_Lsup1500_Ainf2100": perfil["precioSoldar_Lsup1500_Ainf2100"],
        "precioSoldar_LSup1500_Asup2100": perfil["precioSoldar_LSup1500_Asup2100"]
    }

@router.get('/perfiles/transversales/{codigo}')
def obtener_perfil_transversal(codigo: str, db = Depends(get_db)):
    perfil = obtener_perfil_transversal_por_codigo(db, codigo)

    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    
    return {
        "codigo": perfil["codigo"],
        "tipo": perfil["tipo"],
        "color": perfil["color"],
        "proveedor": perfil["proveedor"],
        "material": perfil["material"],
        "precio_material": perfil["precio_material"],
        "precioSoldar_Lhasta1000": perfil["precioSoldar_Lhasta1000"],
        "precioSoldar_L1000_1400": perfil["precioSoldar_L1000_1400"],
        "precioSoldar_Especial": perfil["precioSoldar_Especial"]
    }

@router.get('/runers/{codigo}')
def obtener_runer(codigo: str, db = Depends(get_db)):
    runer = obtener_runer_por_codigo(db, codigo)

    if not runer:
        raise HTTPException(status_code=404, detail="Runer no encontrado")
    
    return {
        "tipo": runer["tipo"],
        "codigo": runer["codigo"],
        "color": runer["color"],
        "material": runer["material"],
        "precio_material": runer["precio_material"],
        "precioSoldar_Asup1700_PVC": runer["precioSoldar_Asup1700_PVC"],
        "precioSoldar_Ainf1700_PVC": runer["precioSoldar_Ainf1700_PVC"],
        "precioSoldar_Uretano": runer["precioSoldar_Uretano"]

    }

# ------------------------
# CALCULAR
# ------------------------

@router.post("/calcular", response_model=CalculoBandaResponse)
def calcular(request: CalculoBandaRequest, db = Depends(get_db)):
    # print(f"DEBUG: Endpoint recibió request.ancho_perfil = {request.ancho_perfil}")
    try:

        precio_total = calcular_configuracion_completa (

            db,
            request.cantidad_bandas,
            request.codigo_banda,
            request.largo,
            request.ancho,
            request.tipo_empalme,
            request.codigo_empalme,
            request.codigo_perfil,
            request.n_perfiles,
            request.distancia_margen,
            request.distancia_paso,
            request.ancho_perfil,
            request.codigo_perfil_superior,
            request.n_perfiles_superior,
            request.distancia_margen_superior,
            request.codigo_perfil_inferior,
            request.n_perfiles_inferior,
            request.distancia_margen_inferior,
            request.codigo_runer,
            request.n_perfiles_runer,
            request.agujeros_x_fila,
            request.filas_x_agujero,
            request.diametro_perforacion,
            request.nombre_cliente

        )

        return precio_total
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
