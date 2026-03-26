from pydantic import BaseModel, Field
from typing import Literal, Optional

class CalculoBandaRequest(BaseModel):
    codigo_banda: str
    largo: float = Field(gt=0)
    ancho: float = Field(gt=0)

    tipo_empalme: Literal[
        "banda-abierta",
        "banda-sin-fin",
        "extremos-preparados",
        "grapas"
    ]

    codigo_empalme: str

    codigo_perfil: Optional[str] = None
    n_perfiles: Optional[float] = None
    distancia_margen: Optional[float] = None
    ancho_perfil: Optional[float] = None
    distancia_paso: Optional[float] = None

    # Campos para runner
    codigo_runner: Optional[str] = None
    # n_perfiles_runner: Optional[float] = None


class CalculoBandaResponse(BaseModel):

    # [TODO] Revisar si los precios deberían ser opcionales, ya que como está ahora podría dar problemas si solo quieres calcular un apartado sin necesidad de calcular todos los demás

    codigo_banda: str
    precio_banda: float
    precio_empalme: float
    precio_perfil: float
    precio_soldadura: float
    precio_perfil_final: float
    precio_runner: float
    precio_runner_soldadura: float
    precio_runner_final: float
    precio_total: float
    n_perfiles: Optional[int] = None
    distancia_margen: Optional[float] = None
    ancho_perfil: Optional[float] = None
    distancia_paso: Optional[float] = None