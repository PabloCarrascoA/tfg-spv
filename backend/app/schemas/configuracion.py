from pydantic import BaseModel, Field
from typing import Literal

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


class CalculoBandaResponse(BaseModel):
    codigo_banda: str
    precio_banda: float
    precio_empalme: float
    precio_total: float