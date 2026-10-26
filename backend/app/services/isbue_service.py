# services/isbue_service.py

import os
import requests
import time
import logging
from datetime import datetime, timedelta
from app.services import carrito_service
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / "credentials.env"
print(f"DEBUG: buscando .env en {env_path}, existe: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)

API_URL = os.getenv("ISBUE_API_URL")
USERNAME = os.getenv("ISBUE_USERNAME")
PASSWORD = os.getenv("ISBUE_PASSWORD")
INSTALLATION_COD = os.getenv("ISBUE_INSTALLATION_COD")
X_API_KEY = os.getenv("ISBUE_X_API_KEY")

logger = logging.getLogger(__name__)

class IsbueUnavailableError(Exception):
    pass


def post_isbue_lectura(url, **kwargs):
    """Dos intentos para conexión/timeout en peticiones sin efectos secundarios."""
    for intento in range(2):
        try:
            response = requests.post(url, timeout=(5, 15), **kwargs)
            response.raise_for_status()
            return response
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as exc:
            if intento == 1:
                logger.error("ISBUE no disponible tras 2 intentos: %s", type(exc).__name__)
                raise IsbueUnavailableError("No se ha podido conectar con ISBUE. Inténtalo de nuevo.") from exc
            logger.warning("Conexión ISBUE fallida; reintentando (2/2): %s", type(exc).__name__)
            time.sleep(0.5)

class IsbueService:

    def __init__(self):
        self.token = None
        self.expiration = None

    def login(self):
        response = post_isbue_lectura(
            f"{API_URL}/auth/login",
            headers={"X-Api-Key": X_API_KEY},
            json={
                "username": USERNAME,
                "password": PASSWORD,
                "installationCod": INSTALLATION_COD,
            },
        )
        data = response.json()
        self.token = data["token"]
        self.expiration = datetime.now() + timedelta(hours=9, minutes=50)
        return self.token

    def get_token(self):

        if self.token is None or datetime.now() >= self.expiration:
            self.login()

        return self.token

    def crear_pedido(self, body):

        token = self.get_token()

        response = requests.post(
            f"{API_URL}/i/{INSTALLATION_COD}/sales/create",
            headers={
                "Authorization": f"Bearer {token}"
            },
            json=body
        )

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        response.raise_for_status()

        return response.json()
    
    def construir_linea_isbue(self, resultado, state_frontend):

        observaciones = []
        perfil_l_state = state_frontend.get("perfilL", {})
        perfil_t_state = state_frontend.get("perfilT", {})
        runer_state = state_frontend.get("runer", {})

        # COLOR/TIPO PERFIL LONGITUDINAL
        color_perfil_superior = (
            perfil_l_state.get("colorPerfilSuperior")
            or perfil_l_state.get("superior", {}).get("color")
        )
        color_perfil_inferior = (
            perfil_l_state.get("colorPerfilInferior")
            or perfil_l_state.get("inferior", {}).get("color")
        )

        codigo_perfil_l_superior = perfil_l_state.get("tipoPerfilSuperior")
        codigo_perfil_l_inferior = perfil_l_state.get("tipoPerfilInferior")

        acotacion_superior = perfil_l_state.get("superior", {}).get("acotado")
        acotacion_inferior = perfil_l_state.get("inferior", {}).get("acotado")

        centrado_S = perfil_l_state.get("superior", {}).get("centrado")
        centrado_I = perfil_l_state.get("inferior", {}).get("centrado")

        # Distancias superiores

        if acotacion_superior != 6 or acotacion_superior != 5:

            distancia_entre_centros_S = perfil_l_state.get("superior", {}).get("distancia")
            distancia_borde_centro_S = perfil_l_state.get("superior", {}).get("distanciaBordeCentro")
            distancia_borde_banda_S = perfil_l_state.get("superior", {}).get("distanciaBordeBanda")
            distancia_entre_bandas_S = perfil_l_state.get("superior", {}).get("distanciaEntreBandas")

        # Distancias inferiores

        if acotacion_inferior != 6 or acotacion_inferior != 5:
            distancia_entre_centros_I = perfil_l_state.get("inferior", {}).get("distancia")
            distancia_borde_centro_I = perfil_l_state.get("inferior", {}).get("distanciaBordeCentro")
            distancia_borde_banda_I = perfil_l_state.get("inferior", {}).get("distanciaBordeBanda")
            distancia_entre_bandas_I = perfil_l_state.get("inferior", {}).get("distanciaEntreBandas")

        # COLOR/TIPO PERFIL TRANSVERSAL
        color_perfilT = perfil_t_state.get("color")

        # COLOR/TIPO RUNER
        tipo_runer = runer_state.get("tipo")
        color_runer = runer_state.get("color")

        #
        # BANDA CORTADA Y EMPALME
        #

        if resultado.get("tipo_empalme"):

            print(f"DEBUG: tipo_empalme={resultado.get('tipo_empalme')}, subtipo_empalme={resultado.get('subtipo_empalme')}")

            if resultado.get("tipo_empalme") == "banda-sin-fin":
                subtipos_sin_fin = {
                    "sin-fin-z": "Z",
                    "sin-fin-solapada": "SOLAPADA",
                    "sin-fin-doble": "DOBLE",
                    "sin-fin-biselado": "BISELADO",
                }
                subtipo = subtipos_sin_fin.get(resultado.get("subtipo_empalme"))
                observaciones.append(f"SIN FIN - {subtipo}\n" if subtipo else "SIN FIN")

            if resultado.get("tipo_empalme") == "extremos-preparados":
                subtipos_preparados = {
                    "extremos-preparados-z": "Z",
                    "extremos-preparados-solapada": "SOLAPADA",
                    "extremos-preparados-doble": "DOBLE",
                    "extremos-preparados-biselado": "BISELADO",
                }
                subtipo = subtipos_preparados.get(resultado.get("subtipo_empalme"))
                observaciones.append(f"PREPARADA - {subtipo}\n" if subtipo else "PREPARADA")

            if resultado.get("tipo_empalme") == "emp-mec-inox":
                            observaciones.append(
                                f"INOXIDABLE - {resultado.get('subtipo_empalme').upper()}\n"
                            )

            if resultado.get("tipo_empalme") == "emp-mec-galvan":
                            observaciones.append(
                                f"GALVANIZADO - {resultado.get('subtipo_empalme').upper()}\n"
                            )

            if resultado.get("tipo_empalme") == "emp-mec-plastico":
                            observaciones.append(
                                f"PLÁSTICO - {resultado.get('subtipo_empalme').upper()}\n"
                            )

          
           

           
           # observaciones.append(
           #     f"{resultado.get('tipo_empalme').upper()} - {resultado.get('subtipo_empalme').upper()}\n"
           # )

        #
        # PERFILES LONGITUDINALES
        #

        n_inf = resultado.get("n_perfiles_inferior") or 0
        n_inf_existe = False

        if n_inf > 0:
            n_inf_existe = True
            observaciones.append('PERFIL LONGITUDINAL\n')
            texto_inferior = (
                "- PERFIL INFERIOR\n"
                f"Código perfil: {codigo_perfil_l_inferior} {color_perfil_inferior or ''}; "
                f"Nº Perfiles: {n_inf}"
            )

            if n_inf == 1 and centrado_I:
                texto_inferior += "; Posición: CENTRADO\n"
            elif acotacion_inferior == 1:
                texto_inferior += f"; Margen lateral: {distancia_borde_banda_I} mm\n"
            elif acotacion_inferior == 2:
                texto_inferior += (
                    f"; Distancia canto banda / centro perfil: {distancia_borde_centro_I} mm"
                    f"; Margen lateral: {distancia_borde_banda_I} mm\n"
                )
            elif acotacion_inferior == 3:
                texto_inferior += (
                    f"; Distancia entre centros de perfiles: {distancia_entre_centros_I} mm"
                    f"; Margen lateral: {distancia_borde_banda_I} mm\n"
                )
            elif acotacion_inferior == 4:
                texto_inferior += (
                    f"; Distancia interior / interior: {distancia_entre_bandas_I} mm"
                    f"; Margen lateral: {distancia_borde_banda_I} mm\n"
                )
            elif acotacion_inferior == 5:
                texto_inferior += "; Posición: SEGÚN PLANO\n"
            elif acotacion_inferior == 6:
                texto_inferior += "; Posición: EXTREMOS DE LA BANDA\n"

            observaciones.append(texto_inferior)

        n_sup = resultado.get("n_perfiles_superior") or 0

        if n_sup > 0:
            if n_inf_existe == False:
                observaciones.append('PERFIL LONGITUDINAL\n')

            texto_superior = (
                "- PERFIL SUPERIOR\n"
                f"Código perfil: {codigo_perfil_l_superior} {color_perfil_superior or ''}; "
                f"Nº Perfiles: {n_sup}"
            )

            if n_sup == 1 and centrado_S:
                texto_superior += "; Posición: CENTRADO\n"
            elif acotacion_superior == 1:
                texto_superior += f"; Margen lateral: {distancia_borde_banda_S} mm\n"
            elif acotacion_superior == 2:
                texto_superior += (
                    f"; Distancia canto banda / centro perfil: {distancia_borde_centro_S} mm"
                    f"; Margen lateral: {distancia_borde_banda_S} mm\n"
                )
            elif acotacion_superior == 3:
                texto_superior += (
                    f"; Distancia entre centros de perfiles: {distancia_entre_centros_S} mm"
                    f"; Margen lateral: {distancia_borde_banda_S} mm\n"
                )
            elif acotacion_superior == 4:
                texto_superior += (
                    f"; Distancia interior / interior: {distancia_entre_bandas_S} mm"
                    f"; Margen lateral: {distancia_borde_banda_S} mm\n"
                )
            elif acotacion_superior == 5:
                texto_superior += "; Posición: SEGÚN PLANO\n"
            elif acotacion_superior == 6:
                texto_superior += "; Posición: EXTREMOS DE LA BANDA\n"

            observaciones.append(texto_superior)

        #
        # PERFILES TRANSVERSALES
        #

        def redondear_medida(valor):
            if valor is None or valor == "":
                return "—"
            try:
                numero = float(str(valor).replace(",", "."))
                return f"{numero:.2f}".rstrip("0").rstrip(".")
            except (TypeError, ValueError):
                return str(valor)

        if perfil_t_state.get("codigoPerfilTH1") or resultado.get("codigo_perfilTH1") or resultado.get("codigo_perfilT") or perfil_t_state.get("codigoPerfilTH2") or resultado.get("codigo_perfilTH2"):
            observaciones.append("PERFIL TRANSVERSAL\n")

        tresbolillo = perfil_t_state.get("tresbolillo", resultado.get("tresbolillo", False))

        if tresbolillo and (
            perfil_t_state.get("codigoPerfilTH1") or resultado.get("codigo_perfilTH1")
        ):
            n_hileras = perfil_t_state.get("hilerasT", resultado.get("hilerasT")) or 1
            lineas = ["Posición: Tresbolillo", f"Nº hileras: {n_hileras}\n"]

            for hilera in range(1, 3 if n_hileras > 1 else 2):
                codigo = resultado.get(f"tipo_perfilTH{hilera}") or perfil_t_state.get(f"tipoPerfilTH{hilera}")
                color = perfil_t_state.get(f"colorH{hilera}") or resultado.get(f"color_H{hilera}") or ""
                campos = [
                    f"Código perfil: {codigo} {color}".rstrip(),
                    f"Ancho perfil: {redondear_medida(resultado.get(f'ancho_perfilH{hilera}', perfil_t_state.get(f'anchoPerfH{hilera}')))} mm",
                    f"Nº perfiles: {resultado.get(f'n_perfilesH{hilera}', perfil_t_state.get(f'nPerfilesH{hilera}'))}",
                    f"Paso: {redondear_medida(resultado.get(f'paso_H{hilera}', perfil_t_state.get(f'pasoH{hilera}')))} mm",
                    f"Margen lateral izquierdo: {redondear_medida(resultado.get(f'margen_izq_H{hilera}', perfil_t_state.get(f'margenIzqH{hilera}')))} mm",
                    f"Margen lateral derecho: {redondear_medida(resultado.get(f'margen_der_H{hilera}', perfil_t_state.get(f'margenDerH{hilera}')))} mm\n",
                ]
                lineas.append(f"HILERA {hilera} -> " + "; ".join(campos))

            observaciones.append("\n".join(lineas))

        elif not tresbolillo and resultado.get("codigo_perfilT"):
            n_hileras = resultado.get("n_hileras") or 1
            etiqueta_ancho = "Ancho perfil" if n_hileras <= 1 else ""
            campos = [
                f"Código perfil: {perfil_t_state.get('tipoPerfilT')} {color_perfilT or ''}".rstrip(),
                f"Filas: {resultado.get('n_perfilesT')}",
                f"Perfiles por fila: {n_hileras}",
            ]

            if etiqueta_ancho:
                campos.append(f"{etiqueta_ancho}: {redondear_medida(resultado.get('ancho_perfilT'))} mm")

            campos.append(f"Margen lateral: {redondear_medida(resultado.get('margen_lateral'))} mm")

            campos.append(f"Paso: {redondear_medida(resultado.get('distancia_paso'))} mm")

            if n_hileras > 1:
                if n_hileras == 2:
                    campos.extend([
                        f"Ancho 1: {redondear_medida(resultado.get('ancho1'))} mm",
                        f"Ancho 2: {redondear_medida(resultado.get('ancho2'))} mm",
                    ])
                else:
                    campos.append(f"Ancho perfiles: {redondear_medida(resultado.get('ancho1'))} mm")
                campos.append(f"Luz interior: {redondear_medida(resultado.get('luz_interior'))} mm")

            observaciones.append("Posición: Centrado\n" + "; ".join(campos))

        #
        # RUNER
        #

        if resultado.get("codigo_runer"):

            n_runer = resultado.get('n_perfiles_runer')

            if n_runer > 0:
                observaciones.append('\nRUNER\n')

                observaciones.append(
                    f"Código Runer: {tipo_runer} {color_runer}; "
                    f"Nº Runers: {n_runer}; "
                    f"Margen Lateral (MLR): {resultado.get('margen_runer')} mm; "
                    f"Luz Runer (LR): {resultado.get('luz_runer')} mm; "
                )

        #
        # ONDAS
        #

        if resultado.get("codigo_onda"):

            n_ondas = resultado.get('n_ondas')
            es_continua = resultado.get("continuidad_onda") == 'SÍ'

            if n_ondas == 1:
                continuidad = "CONTINUA" if es_continua else "DISCONTINUA"
                observaciones.append(
                    f"CON 1 ONDA {continuidad}\n"
                    f"COD: {resultado.get('codigo_onda')}\n"
                    f"ALTURA: {resultado.get('altura_onda')} mm\n"
                    f"BASE: {resultado.get('base_onda')} mm\n"
                    f"ANCHO: {resultado.get('ancho_banda')} mm\n"
                    f"PISADA: {resultado.get('pisada_onda')} mm"
                )
            else:
                continuidad = "CONTINUAS" if es_continua else "DISCONTINUAS"
                observaciones.append(
                    f"CON {n_ondas} ONDAS {continuidad}\n"
                    f"COD: {resultado.get('codigo_onda')}\n"
                    f"ALTURA: {resultado.get('altura_onda')} mm\n"
                    f"BASE: {resultado.get('base_onda')} mm\n"
                    f"ANCHO: {resultado.get('ancho_banda')} mm\n"
                    f"PISADA: {resultado.get('pisada_onda')} mm"
                )

        #
        # Línea Isbue
        #

        return {
            "product_id": state_frontend.get("banda", {}).get("banda", {}).get("id"),
            "qty": resultado.get("cantidad_bandas"),
            "price": resultado.get("precio_total"),
            "observation": "\n".join(observaciones)
        }

    def construir_body_isbue(self, db, lineas, state_frontend):
        
        esPresupuesto = state_frontend.get("esPresupuesto")
        print(f"ISBUE INFO: Construyendo body para {'presupuesto' if esPresupuesto else 'pedido'}, esPresupuesto={esPresupuesto}, nº líneas={len(lineas)}")

        table = "presupuestosV" if esPresupuesto else "pedidosV"

        cliente_carrito = carrito_service.obtener_cliente(db)

        body = {
            "table": table,
            "main": {
                "customer_id": cliente_carrito.get("id"),
                "group_id": 1,
                "payment_method_id": cliente_carrito.get("id_forma_pago", {}).get("id"),
                "shipping_method_id": 1,
                "date": datetime.now().strftime("%d-%m-%Y"),
                "observations": "Pedido de prueba generado desde la aplicación",
            },
            "lines": lineas
        }

        return body
    
    def obtener_clientes(self):

        token = self.get_token()

        response = post_isbue_lectura(
            f"{API_URL}/i/{INSTALLATION_COD}/list",
            headers={
                "Authorization": f"Bearer {token}"
            },
            json={
                "table": "personas",
                "fields": "id,cod,nombre,id_forma_pago",
                "offset": 0,
                "limit": -1,
                "count": True,
                "order": {
                    "nombre": "asc"
                }
            }
        )


        return response.json()["data"]
    
    def obtener_bandas(self):

        token = self.get_token()

        response = requests.post(
            f"{API_URL}/i/{INSTALLATION_COD}/list",
            headers={
                "Authorization": f"Bearer {token}"
            },
            json={
                "table": "articulos",
                "fields": "id,cod,pvp1,codigo_barras,color,descripcion,id_conjunto_acabados",
                "where": [
                    { "field": "id_conjunto_acabados", "condition": "eq", "value": "1" }
                ],
                "offset": 0,
                "limit": -1,
                "count": True,
                "order": {
                    "cod": "asc"
                }
            }
        )

        response.raise_for_status()

        data = response.json()

        return data["data"]
    
    def obtener_lineas_pedido(self, id_documento, state_frontend):

        token = self.get_token()

        esPresupuesto = state_frontend.get("esPresupuesto")
        table = "lpresupuestosV" if esPresupuesto else "lpedidosV"

        response = requests.post(
            f"{API_URL}/i/{INSTALLATION_COD}/list",
            headers={
                "Authorization": f"Bearer {token}"
            },
            json={
                "table": table,
                "fields": "id,id_documento,product_id,cape_13,cape_2",
                "where": [
                    {"field": "id_documento", "condition": "eq", "value": str(id_documento)}
                ],
                "offset": 0,
                "count": True,
                "order": {
                    "id": "asc"
                }
            }
        )

        print("STATUS LIST:", response.status_code)
        print("BODY LIST:", response.text)

        response.raise_for_status()

        return response.json().get("data", [])

    def actualizar_medidas_linea(self, id_linea, ancho, largo, state_frontend, trabajo = None, acabado = None):

        token = self.get_token()

        esPresupuesto = state_frontend.get("esPresupuesto")

        table = "lpresupuestosV" if esPresupuesto else "lpedidosV"

        campo_personalizado_ancho = "cape_1" if esPresupuesto else "cape_2"
        campo_personalizado_largo = "cape_12" if esPresupuesto else "cape_13"
        campo_personalizado_trabajo = "cape_25" if esPresupuesto else "cape_27"

        data_actualizar = {}

        ancho_valido = self._to_int_valido(ancho)
        largo_valido = self._to_int_valido(largo)

        if ancho_valido is not None:
            data_actualizar[campo_personalizado_ancho] = ancho_valido
        if largo_valido is not None:
            data_actualizar[campo_personalizado_largo] = largo_valido
        if trabajo is not None:
            data_actualizar[campo_personalizado_trabajo] = trabajo
        if acabado is not None:
            data_actualizar["id_acabado"] = acabado
            print(f"ISBUE INFO: Se actualizará el acabado de la línea {id_linea} a {acabado}")

        print("data actualizar:", data_actualizar)

        if not data_actualizar:
            print(f"ISBUE WARNING: ancho/largo no válidos para línea {id_linea}, no se actualiza. ancho={ancho!r} largo={largo!r}trabajo={trabajo!r}, acabado={acabado!r}")
            return None

        response = requests.post(
            f"{API_URL}/i/{INSTALLATION_COD}/save",
            headers={
                "Authorization": f"Bearer {token}"
            },
            json={
                "table": table,
                "id": id_linea,
                "data": data_actualizar
            }
        )

        print("STATUS SAVE:", response.status_code)
        print("BODY SAVE:", response.text)

        response.raise_for_status()

        return response.json()

    def _to_int_valido(self, valor):
        if valor is None:
            return None
        if isinstance(valor, str) and valor.strip().lower() in ("", "null", "none", "undefined"):
            return None
        try:
            return int(round(float(valor)))
        except (TypeError, ValueError):
            return None
        
    def construir_datos_extra(self, resultado, state_frontend):
        banda_state = state_frontend.get("banda", {})

        return {
            "ancho": banda_state.get("ancho"),
            "largo": banda_state.get("longitud"),
            "trabajo": state_frontend.get("trabajo", {}),
            "acabado": banda_state.get("acabado"),
        }
    
    def obtener_lineas_y_extras_carrito(self, lineas_carrito):
       
        lineas_isbue = [fila["datos"] for fila in lineas_carrito]
        extras = [fila["datos_extra"] for fila in lineas_carrito]

        return lineas_isbue, extras
