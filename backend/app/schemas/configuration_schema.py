from pydantic import BaseModel, Field

class ConfiguracionInput(BaseModel):
    longitud: float = Field(..., gt=0, description="Longitud en mm")
    anchura: float = Field(..., gt=0, description="Anchura en mm")

class ConfiguracionOutput(BaseModel):
    precio_estimado: float
    valido: bool