import math

def calcular_precio_preparacion(tarifa_preparacion, cantidad_bandas, n_perfiles):
    
    precio_preparacion = 0

    if cantidad_bandas == 1 and n_perfiles == 1:
        precio_preparacion = tarifa_preparacion

    elif cantidad_bandas > 1 and n_perfiles == 1:
        precio_preparacion = (2 * tarifa_preparacion) / cantidad_bandas

    elif n_perfiles > 1 and cantidad_bandas >= 1:

        if n_perfiles % 2 == 0:
            n_cobros = n_perfiles / 2
        else:
            n_cobros = math.ceil(n_perfiles/2) + 1 

        precio_preparacion = (n_cobros * tarifa_preparacion) / cantidad_bandas
    
    else:
        raise ValueError("cantidad de bandas o perfiles no válidos para calcular preparación")
    
    return precio_preparacion
    