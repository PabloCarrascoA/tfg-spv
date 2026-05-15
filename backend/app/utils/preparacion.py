import math

def calcular_precio_preparacionLR(tarifa_preparacion, cantidad_bandas, n_perfiles):
    
    precio_preparacion = 0
    n_cobros = 0

    if cantidad_bandas == 1 and n_perfiles == 1:
        precio_preparacion = tarifa_preparacion

    elif cantidad_bandas > 1 and n_perfiles == 1:
        precio_preparacion = (2 * tarifa_preparacion) / cantidad_bandas

    elif n_perfiles > 1 and cantidad_bandas >= 1:

        if n_perfiles % 2 == 0:
            n_cobros = n_perfiles / 2
        else:
            # hay que redondear por abajo ver si da bien con ceil o floor
            n_cobros = math.ceil(n_perfiles/2) + 1 

        precio_preparacion = (n_cobros * tarifa_preparacion) / cantidad_bandas
    
    else:
        raise ValueError("cantidad de bandas o perfiles no válidos para calcular preparación")
    
    return precio_preparacion

def calcular_precio_preparacionTO(tarifa_preparacion, cantidad_bandas, ancho_perfil):

    precio_preparacion = 0
    n_preparaciones = 1

    if ancho_perfil is not None and ancho_perfil >= 1000 and ancho_perfil <= 1600:
        n_preparaciones = 2

    if ancho_perfil > 1600:
        raise ValueError("el ancho de perfil no puede ser mayor que 1600mm")

    precio_preparacion = (n_preparaciones * tarifa_preparacion) / cantidad_bandas
    
    return precio_preparacion
    