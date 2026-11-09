import math

def calcular_precio_preparacionLR(tarifa_preparacion, cantidad_bandas, n_perfiles):
    
    precio_preparacion = 0
    n_cobros = 0

    print(f"DEBUG preparación PL: cantidad_bandas={cantidad_bandas}, n_perfiles={n_perfiles}, tarifa_preparacion={tarifa_preparacion}")

    if cantidad_bandas == 1 and n_perfiles == 1:
        precio_preparacion = tarifa_preparacion
        # print("entro en caso 1")

    elif cantidad_bandas > 1 and n_perfiles == 1:
        precio_preparacion = (tarifa_preparacion) / cantidad_bandas
        # print("entro en caso 2")

    elif n_perfiles > 1 and cantidad_bandas >= 1:

        if n_perfiles % 2 == 0:
            n_cobros = n_perfiles / 2
            # print("entro en caso 3.1")
        else:
            n_cobros = math.floor(n_perfiles/2) + 1 

        precio_preparacion = (n_cobros * tarifa_preparacion) / cantidad_bandas

    else:
        raise ValueError("cantidad de bandas o perfiles no válidos para calcular preparación")
    
    return precio_preparacion

def calcular_precio_preparacionTO(tarifa_preparacion, cantidad_bandas, ancho, tabla):

    precio_preparacion = 0
    n_preparaciones = 1

    if tabla == 'perfiles_transversales' or tabla == 'perfiles_transversales_tresbolillo':

        if ancho is not None and ancho >= 1000 and ancho <= 1600:
            n_preparaciones = 2

        if ancho > 1600:
                raise ValueError("el ancho de perfil no puede ser mayor que 1600 mm")

    if tabla == 'ondas':

        if ancho is not None and ancho >= 1350 and ancho <= 1550:
            n_preparaciones = 2

        if ancho > 1550:
            raise ValueError("el ancho de onda no puede ser mayor que 1550 mm")

    precio_preparacion = (n_preparaciones * tarifa_preparacion) / cantidad_bandas
    
    return precio_preparacion
    