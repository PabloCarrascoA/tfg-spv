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
    ancho: float
    largo: float
    codigo_banda: str
    precio_banda: float
    precio_empalme: float
    precio_perfil: float
    precio_soldadura: float
    precio_perfil_final: float
    precio_runer: float
    precio_runer_soldadura: float
    precio_runer_final: float
    precio_perforaciones: float
    precio_total: float
    n_perfiles: Optional[float] = None
    n_perfiles_runer: Optional[float] = None
    distancia_margen: Optional[float] = None
    distancia_margen_superior: Optional[float] = None
    distancia_margen_inferior: Optional[float] = None
    ancho_perfil: Optional[float] = None
    distancia_paso: Optional[float] = None
    paso_filas: Optional[float] = None
    n_perfiles_superior: Optional[float] = None
    n_perfiles_inferior: Optional[float] = None
