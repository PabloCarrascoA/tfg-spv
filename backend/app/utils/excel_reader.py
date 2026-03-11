import pandas as pd
import csv
import warnings

# openpyxl sometimes emits harmless UserWarnings about print areas;
# they clutter the log during import so ignore them here.
warnings.simplefilter("ignore", UserWarning)

def leer_excel(path):

    df = pd.read_excel(path)

    # remplazar NaN/NaT por None antes de extraer los datos
    df = df.where(pd.notnull(df), None)

    encabezados = list(df.columns)

    filas = df.values.tolist()

    # además asegurar que no queden floats NaN tras tolist
    import math
    for i, fila in enumerate(filas):
        filas[i] = [None if (isinstance(v, float) and math.isnan(v)) else v for v in fila]

    return {
        "encabezados": encabezados,
        "filas": filas
    }

def leer_csv(path, separador=";"):

    with open(path, newline='', encoding='utf-8') as csvfile:

        reader = csv.reader(csvfile, delimiter=separador)

        filas = list(reader)

        encabezados = filas[0]
        datos = filas[1:]

        return {
            "encabezados": encabezados,
            "filas": datos
        }


    