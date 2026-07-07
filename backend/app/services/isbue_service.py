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
                "customer_id": 1,
                "group_id": 1,
                "payment_method_id": 1,
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

            observaciones.append(
                f"CON {resultado.get('n_perfiles_superior')} PERFILES LONGITUDINALES "
                f"{tipo_perfil_superior} "
                f"{color_perfil_superior} "
                f"COLOCADOS EN {resultado.get('distancia_margen_superior')} mm "
                f"DEL EXTREMO POR LA PARTE SUPERIOR"
            )

        if resultado.get("codigo_perfil_inferior"):

            observaciones.append(
                f"CON {resultado.get('n_perfiles_inferior')} PERFILES LONGITUDINALES "
                f"{tipo_perfil_inferior} "
                f"{color_perfil_inferior} "
                f"COLOCADOS EN {resultado.get('distancia_margen_inferior')} mm "
                f"DEL EXTREMO POR LA PARTE INFERIOR"
            )

        #
        # PERFILES TRANSVERSALES
        #

        if resultado.get("codigo_perfilT"):

            if resultado.get("n_hileras", 1) <= 1:

                observaciones.append(
                    f"CON {resultado.get('n_perfilesT')} PERFILES TRANSVERSALES "
                    f"{tipo_perfilT} "
                    f"{color_perfilT} "
                    f"DE {resultado.get('ancho_perfilT')} mm, "
                    f"COLOCADOS A UN PASO DE {resultado.get('distancia_paso')} mm"
                )

            else:

                observaciones.append(
                    f"CON {resultado.get('n_hileras')} FILAS DE "
                    f"{resultado.get('n_perfilesT')} PERFILES TRANSVERSALES "
                    f"{tipo_perfilT} "
                    f"{color_perfilT} "
                    f"DE {resultado.get('ancho_perfilT')} mm "
                    f"CON {resultado.get('n_hileras') - 1} INTERRUPCIONES CENTRALES "
                    f"DE {resultado.get('luz_interior')} mm "
                    f"COLOCADOS A UN PASO DE {resultado.get('distancia_paso')} mm"
                )

        #
        # RUNER
        #

        if resultado.get("codigo_runer"):

            observaciones.append(
                f"CON {resultado.get('n_perfiles_runer')} RUNERS "
                f"{tipo_runer} "
                f"{color_runer} "
                f"COLOCADOS EN {resultado.get('margen_runer')} mm "
                f"DEL EXTREMO POR LA PARTE SUPERIOR"
            )

        #
        # ONDAS
        #

        if resultado.get("codigo_onda"):

            continuidad = "CONTINUAS" if resultado.get("continuidad_onda") == 'SÍ' else "DISCONTINUAS"

            observaciones.append(
                f"""CON {resultado.get('n_ondas')} ONDAS {continuidad}
                COD: {resultado.get('codigo_onda')}
                ALTURA: {resultado.get('altura_onda')} mm
                BASE: {resultado.get('base_onda')} mm
                ANCHO: {resultado.get('ancho_banda')} mm
                PISADA: {resultado.get('pisada_onda')} mm"""
                        )

        #
        # Línea Isbue
        #

        body["lines"].append({
            "product_id": 1,
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
                "fields": "id,cod,nombre",
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
