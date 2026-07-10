# services/isbue_service.py

import requests
from datetime import datetime, timedelta

API_URL = "https://api2.isbue.io/api"

USERNAME = "gustavo@sucesordeperezverdu.com"
PASSWORD = "80456201"
INSTALLATION_COD = 355


class IsbueService:

    def __init__(self):
        self.token = None
        self.expiration = None

    def login(self):

        response = requests.post(
            f"{API_URL}/auth/login",
            json={
                "username": USERNAME,
                "password": PASSWORD,
                "installationCod": INSTALLATION_COD
            }
        )

        response.raise_for_status()

        data = response.json()

        self.token = data["token"]

        # El token dura 10 horas
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
    
    def construir_body_isbue(self, resultado, state_frontend):
        body = {
            "table": "pedidosV",
            "main": {
                "customer_id": state_frontend.get("cliente", {}).get("id"),
                "group_id": 1,
                "payment_method_id": state_frontend.get("cliente", {}).get("id_forma_pago", {}).get("id"),
                "shipping_method_id": 1,
                "date": datetime.now().strftime("%d-%m-%Y"),
                "observations": "Pedido de prueba generado desde la aplicación",
            },
            "lines": []
        }

        observaciones = []
        perfil_l_state = state_frontend.get("perfilL", {})
        perfil_t_state = state_frontend.get("perfilT", {})
        runer_state = state_frontend.get("runer", {})

        tipo_perfil_superior = (
            perfil_l_state.get("tipoPerfilSuperior")
            or perfil_l_state.get("superior", {}).get("tipo")
        )
        color_perfil_superior = (
            perfil_l_state.get("colorPerfilSuperior")
            or perfil_l_state.get("superior", {}).get("color")
        )
        tipo_perfil_inferior = (
            perfil_l_state.get("tipoPerfilInferior")
            or perfil_l_state.get("inferior", {}).get("tipo")
        )
        color_perfil_inferior = (
            perfil_l_state.get("colorPerfilInferior")
            or perfil_l_state.get("inferior", {}).get("color")
        )
        tipo_perfilT = perfil_t_state.get("tipoPerfilT")
        color_perfilT = perfil_t_state.get("color")
        tipo_runer = runer_state.get("tipo")
        color_runer = runer_state.get("color")
        
        #
        # PERFILES LONGITUDINALES
        #

        if resultado.get("codigo_perfil_superior"):

            n_sup = resultado.get('n_perfiles_superior')

            if n_sup == 1:
                observaciones.append(
                    f"CON 1 PERFIL LONGITUDINAL "
                    f"{tipo_perfil_superior} "
                    f"{color_perfil_superior} "
                    f"COLOCADO EN {resultado.get('distancia_margen_superior')} mm "
                    f"DEL EXTREMO POR LA PARTE SUPERIOR"
                )
            else:
                observaciones.append(
                    f"CON {n_sup} PERFILES LONGITUDINALES "
                    f"{tipo_perfil_superior} "
                    f"{color_perfil_superior} "
                    f"COLOCADOS EN {resultado.get('distancia_margen_superior')} mm "
                    f"DEL EXTREMO POR LA PARTE SUPERIOR"
                )

        if resultado.get("codigo_perfil_inferior"):

            n_inf = resultado.get('n_perfiles_inferior')

            if n_inf == 1:
                observaciones.append(
                    f"CON 1 PERFIL LONGITUDINAL "
                    f"{tipo_perfil_inferior} "
                    f"{color_perfil_inferior} "
                    f"COLOCADO EN {resultado.get('distancia_margen_inferior')} mm "
                    f"DEL EXTREMO POR LA PARTE INFERIOR"
                )
            else:
                observaciones.append(
                    f"CON {n_inf} PERFILES LONGITUDINALES "
                    f"{tipo_perfil_inferior} "
                    f"{color_perfil_inferior} "
                    f"COLOCADOS EN {resultado.get('distancia_margen_inferior')} mm "
                    f"DEL EXTREMO POR LA PARTE INFERIOR"
                )

        #
        # PERFILES TRANSVERSALES
        #

        if resultado.get("codigo_perfilT"):

            n_perfilesT = resultado.get('n_perfilesT')

            if resultado.get("n_hileras", 1) <= 1:

                if n_perfilesT == 1:
                    observaciones.append(
                        f"CON 1 PERFIL TRANSVERSAL "
                        f"{tipo_perfilT} "
                        f"{color_perfilT} "
                        f"DE {resultado.get('ancho_perfilT')} mm, "
                        f"COLOCADO A UN PASO DE {resultado.get('distancia_paso')} mm"
                    )
                else:
                    observaciones.append(
                        f"CON {n_perfilesT} PERFILES TRANSVERSALES "
                        f"{tipo_perfilT} "
                        f"{color_perfilT} "
                        f"DE {resultado.get('ancho_perfilT')} mm, "
                        f"COLOCADOS A UN PASO DE {resultado.get('distancia_paso')} mm"
                    )

            else:

                n_hileras = resultado.get('n_hileras')
                n_interrupciones = n_hileras - 1

                texto_hileras = "1 FILA DE" if n_hileras == 1 else f"{n_hileras} FILAS DE"
                texto_perfilesT = f"1 PERFIL TRANSVERSAL" if n_perfilesT == 1 else f"{n_perfilesT} PERFILES TRANSVERSALES"
                texto_interrupciones = "1 INTERRUPCIÓN CENTRAL" if n_interrupciones == 1 else f"{n_interrupciones} INTERRUPCIONES CENTRALES"

                observaciones.append(
                    f"CON {texto_hileras} "
                    f"{texto_perfilesT} "
                    f"{tipo_perfilT} "
                    f"{color_perfilT} "
                    f"DE {resultado.get('ancho_perfilT')} mm "
                    f"CON {texto_interrupciones} "
                    f"DE {resultado.get('luz_interior')} mm "
                    f"COLOCADOS A UN PASO DE {resultado.get('distancia_paso')} mm"
                )

        #
        # RUNER
        #

        if resultado.get("codigo_runer"):

            n_runer = resultado.get('n_perfiles_runer')

            if n_runer == 1:
                observaciones.append(
                    f"CON 1 RUNER "
                    f"{tipo_runer} "
                    f"{color_runer} "
                    f"COLOCADO EN {resultado.get('margen_runer')} mm "
                    f"DEL EXTREMO POR LA PARTE SUPERIOR"
                )
            else:
                observaciones.append(
                    f"CON {n_runer} RUNERS "
                    f"{tipo_runer} "
                    f"{color_runer} "
                    f"COLOCADOS EN {resultado.get('margen_runer')} mm "
                    f"DEL EXTREMO POR LA PARTE SUPERIOR"
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

        body["lines"].append({
            "product_id": state_frontend.get("banda", {}).get("banda", {}).get("id"),
            "qty": resultado.get("cantidad_bandas"),
            "price": resultado.get("precio_total"),
            "observation": "\n".join(observaciones)
        })

        return body
    
    def obtener_clientes(self):

        token = self.get_token()

        response = requests.post(
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

        response.raise_for_status()

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
    
    def obtener_lineas_pedido(self, id_documento):

        token = self.get_token()

        response = requests.post(
            f"{API_URL}/i/{INSTALLATION_COD}/list",
            headers={
                "Authorization": f"Bearer {token}"
            },
            json={
                "table": "lpedidosV",
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

    def actualizar_medidas_linea(self, id_linea, ancho, largo):

        token = self.get_token()

        response = requests.post(
            f"{API_URL}/i/{INSTALLATION_COD}/save",
            headers={
                "Authorization": f"Bearer {token}"
            },
            json={
                "table": "lpedidosV",
                "id": id_linea,
                "data": {
                    "cape_2": ancho,
                    "cape_13": largo
                }
            }
        )

        print("STATUS SAVE:", response.status_code)
        print("BODY SAVE:", response.text)

        response.raise_for_status()

        return response.json()
