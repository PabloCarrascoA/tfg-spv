from pydantic import BaseModel

class CalculoBandaRequest(BaseModel):
    codigo_banda: str
    largo: float
    ancho: float

class CalculoBandaResponse(BaseModel):
    codigo_banda: str
    precio_unitario: float
    precio_total: float