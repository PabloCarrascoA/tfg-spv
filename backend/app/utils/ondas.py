import math

# Funciones auxiliares de cálculo de ondas

def get_precio_soldar_onda(db):

            cursor = db.cursor()
            cursor.execute("SELECT precio FROM ondas_soldar WHERE codigo = ?", ("precio_soldar",))
            row = cursor.fetchone()
        
            if row is None:
                return None
        
            return {"precio": row[0]}

def calcular_soldadura_ondas(ancho_onda, n_ondas, continuidad, db):

            precio_soldadura = get_precio_soldar_onda(db)
            
            if precio_soldadura is None:
                raise ValueError("No se encontró precio de soldadura para ondas")

            if ancho_onda <= 500:
                ancho_onda = 0.5

            if ancho_onda > 500:
                ancho_onda = (ancho_onda + 40) / 1000

            precio_soldadura_total = (n_ondas * ancho_onda * precio_soldadura["precio"])

            if not continuidad:
                precio_soldadura_total = precio_soldadura_total * 2

            return precio_soldadura_total

def ajustar_ancho_onda(ancho):

   # Ajuste a múltiplo de 50 mm

    if ancho <= 0:
        raise ValueError("El ancho de la onda debe ser mayor que cero")
    
    if (ancho % 50) != 0:
        ancho_ajustado = ((math.trunc(ancho / 50)) + 1) * 50
    else:
        ancho_ajustado = ancho

    return ancho_ajustado

def obtener_desarrollo_ondas(base, altura):

    a, b, c = 0, 0, 0

    if altura > 100 or altura < 10:
        raise Exception("la altura no puede ser mayor de 100 o inferior a 10")
    elif altura == 10:
        a = 0.0002
        b = 0.9335
        c = 7.0815

    elif altura == 15:
        a = 0.0004
        b = 0.8691
        c = 14.862

    elif altura == 20:
        a = 0.0008
        b = 0.7397
        c = 26.784
    elif altura == 25:
        a = 0.0007
        b = 0.7164
        c = 34.99
    elif altura == 30:
        a = 0.0009
        b = 0.6412
        c = 46.287
    elif altura == 35:
        a = 0.0011
        b = 0.5701
        c = 58
    elif altura == 40:
        a = 0.0012
        b = 0.5029
        c = 70.009
    elif altura == 45:
        a = 0.0013
        b = 0.4414
        c = 82.141
    elif altura == 50:
        a = 0.0014
        b = 0.3856
        c = 94.327
    elif altura == 55:
        a = 0.0013
        b = 0.3817
        c = 103.86
    elif altura == 60:
        a = 0.0016
        b = 0.2834
        c = 119
    elif altura == 65:
        a = 0.0014
        b = 0.3164
        c = 126.29
    elif altura == 70:
        a = 0.0014
        b = 0.2731
        c = 138.69
    elif altura == 75:
        a = 0.0014
        b = 0.2669
        c = 148.74
    elif altura == 80:
        a = 0.0013
        b = 0.2578
        c = 159.11
    elif altura == 85:
        a = 0.0014
        b = 0.2245
        c = 171.34
    elif altura == 90:
        a = 0.0013
        b = 0.2134
        c = 182.06
    elif altura == 95:
        a = 0.0014
        b = 0.182
        c = 194.47
    elif altura == 100:
        a = 0.0012
        b = 0.2105
        c = 202.11
    else:
        raise Exception("¡La altura de la onda debe ser un múltiplo de 5!")

    desarrollo = a * math.pow(base, 2) + b * base + c

    # desarollo está en (mm)
    return desarrollo
