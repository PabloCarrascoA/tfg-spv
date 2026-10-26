from fastapi import APIRouter, HTTPException
import requests
from app.services.isbue_service import IsbueService, IsbueUnavailableError

isbue_service = IsbueService()

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.get("")
def listar_clientes():
    try:
        return isbue_service.obtener_clientes()
    except IsbueUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except requests.exceptions.HTTPError as exc:
        raise HTTPException(status_code=502, detail="ISBUE ha devuelto un error al consultar los clientes.") from exc
    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as exc:
        raise HTTPException(status_code=503, detail="No se ha podido conectar con ISBUE. Inténtalo de nuevo.") from exc
