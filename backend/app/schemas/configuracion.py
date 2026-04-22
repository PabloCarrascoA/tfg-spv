from pydantic import BaseModel, Field
from typing import Literal, Optional

class CalculoBandaRequest(BaseModel):

    nombre_cliente: Optional[str] = None
    
    # Campos para banda

    codigo_banda: str
    cantidad_bandas: int = Field(gt=0)
    largo_banda: float = Field(gt=0)
    ancho_banda: float = Field(gt=0)

    # Campos para empalme

    tipo_empalme: Literal[
        "banda-abierta",
        "banda-sin-fin",
        "extremos-preparados",
        "grapas"
    ]

    codigo_empalme: str

    # Campos para perfil

    # Perfil transversal

    codigo_perfilT: Optional[str] = None
    n_perfilesT: Optional[float] = None
    distancia_paso: Optional[float] = None
    margen_lateral: Optional[float] = None
    ancho_perfilT: Optional[float] = None
    distancia_paso: Optional[float] = None
    n_hileras: Optional[float] = None
    ancho1: Optional[float] = None
    ancho2: Optional[float] = None
    luz_interior: Optional[float] = None

    #perfil longitudinal

    codigo_perfil_superior: Optional[str] = None
    n_perfiles_superior: Optional[float] = None
    distancia_margen_superior: Optional[float] = None
    codigo_perfil_inferior: Optional[str] = None
    n_perfiles_inferior: Optional[float] = None
    distancia_margen_inferior: Optional[float] = None

    # Campos para runer

    codigo_runer: Optional[str] = None
    n_perfiles_runer: Optional[float] = None
    margen_runer: Optional[float] = None
    luz_runer: Optional[float] = None
    ancho_runer: Optional[float] = None

    # Campos para perforaciones

    agujeros_x_fila: Optional[float] = None
    filas_x_agujero: Optional[float] = None
    diametro_perforacion: Optional[float] = None

    #Campos para la onda

    codigo_onda:      Optional[str]   = None
    n_ondas:          Optional[int]   = None
    continuidad_onda: Optional[bool]  = None
    base_onda:        Optional[float] = None
    altura_onda:      Optional[float] = None
    ancho_onda:       Optional[float] = None
    pisada_onda:      Optional[float] = None


class CalculoBandaResponse(BaseModel):

    # [TODO] Revisar si los precios deberían ser opcionales, ya que como está ahora podría dar problemas si solo quieres calcular un apartado sin necesidad de calcular todos los demás

    nombre_cliente: Optional[str] = None

    cantidad_bandas: int
    ancho_banda: float
    largo_banda: float
    codigo_banda: str
    precio_banda: float
    precio_empalme: float

    precio_perfil_superior: Optional[float] = None
    precio_perfil_inferior: Optional[float] = None
    n_perfiles_superior: Optional[float] = None
    n_perfiles_inferior: Optional[float] = None
    distancia_margen_superior: Optional[float] = None
    distancia_margen_inferior: Optional[float] = None
    precio_perfilL: Optional[float] = None
    precio_soldaduraL: Optional[float] = None
    precio_perfilL_final: Optional[float] = None

    codigo_perfilT: Optional[float] = None
    n_perfilesT: Optional[float] = None
    margen_lateral: Optional[float] = None
    ancho_perfilT: Optional[float] = None
    n_hileras: Optional[float] = None
    ancho1: Optional[float] = None
    ancho2: Optional[float] = None
    luz_interior: Optional[float] = None
    distancia_paso: Optional[float] = None
    precio_perfilT: Optional[float] = None
    precio_soldaduraT: Optional[float] = None
    precio_perfilT_final: Optional[float] = None

    codigo_runer: Optional[float] = None
    n_perfiles_runer: Optional[float] = None
    margen_runer: Optional[float] = None
    luz_runer: Optional[float] = None
    ancho_runer: Optional[float] = None
    precio_runer: Optional[float] = None
    precio_runer_soldadura: Optional[float] = None
    precio_runer_final: Optional[float] = None

    agujeros_x_fila: Optional[float] = None
    filas_x_agujero: Optional[float] = None
    diametro_perforacion: Optional[float] = None
    precio_perforaciones: Optional[float] = None
    paso_filas: Optional[float] = None

    codigo_onda: Optional[str] = None
    n_ondas: Optional[int] = None
    base_onda: Optional[float] = None
    altura_onda: Optional[float] = None
    continuidad_onda: Optional[bool] = None
    pisada_onda: Optional[float] = None
    precio_onda: Optional[float] = None
    precio_onda_total: Optional[float] = None
    precio_ondas_final: Optional[float] = None

    precio_ondas_final: Optional[float] = None
