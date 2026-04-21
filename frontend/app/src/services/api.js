const BASE_URL = "http://127.0.0.1:8000"

export async function getBandas() {
  const res = await fetch(`${BASE_URL}/configuracion/bandas`)
  return res.json()
}

export async function getEmpalmesPorTipo(tipo) {
  const res = await fetch(`${BASE_URL}/configuracion/empalmes/${tipo}`)
  return res.json()
}

export async function getPerfilesLongitudinales() {
  const res = await fetch(`${BASE_URL}/configuracion/perfiles/longitudinales`)
  return res.json()
}

export async function getPerfilesTransversales() {
  const res = await fetch(`${BASE_URL}/configuracion/perfiles/transversales`)
  return res.json()
}

export async function getRuners() {
  const res = await fetch(`${BASE_URL}/configuracion/runers`)
  return res.json()
}

export async function getOndas() {
    const res = await fetch(`${BASE_URL}/configuracion/ondas`)
    return res.json()
}

// falta tema ondas si esto sería necesario

export async function calcularPedido(datos) {
  const res = await fetch(`${BASE_URL}/configuracion/calcular`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
  return res.json()
}