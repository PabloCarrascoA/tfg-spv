from sqlalchemy import Column, Integer, String, Float
from app.db.database import Base

class Banda(Base):
    __tablename__ = "bandas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String, unique=True, nullable=False)
    proveedor = Column(String)
    material = Column(String)
    color = Column(String)
    precio = Column(Float, nullable=False)