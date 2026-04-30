const BASE_URL = "http://127.0.0.1:8000"

export async function getBandas() {
  const res = await fetch(`${BASE_URL}/configuracion/bandas`)
  return res.json()
}

export async function getSubtiposEmpalme(tipo) {
  const res = await fetch(`${BASE_URL}/configuracion/empalmes/${tipo}/subtipos`)
  return res.json()
}

export async function getPrecioEmpalme(tipo, subtipo, ancho) {
  const res = await fetch(`${BASE_URL}/configuracion/empalmes/${tipo}/${subtipo}/precio?ancho=${ancho}`)
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


export async function calcularPedido(datos) {
  let res

  try {
    res = await fetch(`${BASE_URL}/configuracion/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
  } catch (error) {
    throw new Error('No se pudo conectar con el backend')
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || 'Error al calcular el pedido')
  }

  return data
}

// Funciones de pedidos

export async function guardarPedido(resultado, stateFrontend) {
  const res = await fetch(`${BASE_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultado, state_frontend: stateFrontend })
  })
  return res.json()
}

export async function getPedidos() {
  const res = await fetch(`${BASE_URL}/pedidos`)
  return res.json()
}

export async function getDetallePedido(id) {
  const res = await fetch(`${BASE_URL}/pedidos/${id}`)
  return res.json()
}

export async function actualizarEstadoPedido(id, estado) {
  const res = await fetch(`${BASE_URL}/pedidos/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  })
  return res.json()
}

export async function eliminarPedido(id) {
  const res = await fetch(`${BASE_URL}/pedidos/${id}`, {
    method: 'DELETE'
  })
  return res.json()
}

// Funciones de exportar

export async function getInfoTabla(tabla) {

  const res = await fetch(`${BASE_URL}/exportar/${tabla}/info`)
  return res.json()
}

export async function exportarTabla(tabla) {

  const res = await fetch(`${BASE_URL}/exportar/${tabla}`)
  const blob = await res.blob()
  const fecha = new Date().toISOString().split('T')[0]
  const filename = `tabla_${tabla}_${fecha}.xlsx`

  // descarga en el navegador
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)

  return filename
}
