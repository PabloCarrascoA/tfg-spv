const ORDEN_PASOS = [
  { id: 'banda',              ruta: '/banda/configurar/banda'    },
  { id: 'perfil-longitudinal', ruta: '/banda/configurar/perfil-longitudinal' },
  { id: 'perfil-transversal',  ruta: '/banda/configurar/perfil-transversal' },
  { id: 'runer',              ruta: '/banda/configurar/runer'    },
  { id: 'perforaciones',      ruta: '/banda/configurar/perforaciones' },
  { id: 'ondas',              ruta: '/banda/configurar/ondas'    },
]

// devuelve la ruta del siguiente paso según la selección y el paso actual

export function siguienteRuta(seleccion, idActual) {
  const indiceActual = ORDEN_PASOS.findIndex(p => p.id === idActual)
  const siguiente = ORDEN_PASOS
    .slice(indiceActual + 1)                     // pasos que quedan
    .find(p => seleccion.includes(p.id))         // el primero que esté seleccionado

  return siguiente ? siguiente.ruta : '/resumen' // si no hay más -> resumen
}

// devuelve "Paso X de Y" contando solo los pasos seleccionados

export function infoPaso(seleccion, idActual) {
  const pasosSeleccionados = ORDEN_PASOS.filter(p => seleccion.includes(p.id))
  const indice = pasosSeleccionados.findIndex(p => p.id === idActual)
  return {
    actual: indice + 1,
    total: pasosSeleccionados.length,
  }
}