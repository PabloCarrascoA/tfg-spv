import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { calcularPedido } from '../../services/api'

function ResumenView() {
  const { state } = useLocation()
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const datos = construirPayload(state)

    console.log('DEBUG: payload para cálculo:', datos)

    calcularPedido(datos)
      .then(data => {
        setResultado(data)
        setCargando(false)
      })
      .catch(err => {
        setError(err.message)
        setCargando(false)
      })
  }, [])

  if (cargando) return <div className="home-view"><p>Calculando...</p></div>
  if (error)    return <div className="home-view"><p>Error: {error}</p></div>

  return (
    <div className="home-view">
      <h2 className="content-title">Resumen del pedido</h2>
      <p className="content-subtitle">Resultado del presupuesto</p>

      <div className="resumen-grid">
        <div className="resumen-item">
          <span className="resumen-label">Precio banda </span>
          <span className="resumen-valor">{resultado.precio_banda} €</span>
        </div>
        <div className="resumen-item">
          <span className="resumen-label">Precio empalme </span>
          <span className="resumen-valor">{resultado.precio_empalme} €</span>
        </div>
        <div className="resumen-item resumen-total">
          <span className="resumen-label">Precio total </span>
          <span className="resumen-valor">{resultado.precio_total} €</span>
        </div>
      </div>

      {/* debug temporal */}
      <pre style={{ fontSize: 11, marginTop: 24, color: '#888' }}>
        {JSON.stringify(resultado, null, 2)}
      </pre>
    </div>
  )
}


function construirPayload(state) {
  const toFloat = val => parseFloat(val) || null

  return {

    nombre_cliente:  state.nombreCliente ?? null,

    // banda y empalme
    codigo_banda:    state.banda?.codigoBanda   ?? null,
    cantidad_bandas: state.banda?.cantidad      ?? 1,
    largo:           toFloat(state.banda?.longitud),
    ancho:           toFloat(state.banda?.ancho),
    tipo_empalme:    state.banda?.tipoEmpalme   ?? null,
    codigo_empalme:  state.banda?.codigoEmpalme ?? null,

    // perfil longitudinal
    codigo_perfil_superior:    state.perfilL?.superior?.activo ? state.perfilL.superior.codigo                        : null,
    n_perfiles_superior:       state.perfilL?.superior?.activo ? state.perfilL.superior.cantidad                      : null,
    distancia_margen_superior: state.perfilL?.superior?.activo ? toFloat(state.perfilL.superior.distanciaBordeCentro) : null,
    codigo_perfil_inferior:    state.perfilL?.inferior?.activo ? state.perfilL.inferior.codigo                        : null,
    n_perfiles_inferior:       state.perfilL?.inferior?.activo ? state.perfilL.inferior.cantidad                      : null,
    distancia_margen_inferior: state.perfilL?.inferior?.activo ? toFloat(state.perfilL.inferior.distanciaBordeCentro) : null,

    // perfil transversal
    codigo_perfilT:   state.perfilT?.codigoPerfil ?? null,
    n_perfilesT:      state.perfilT?.cantidad     ?? null,
    ancho_perfilT:    toFloat(state.perfilT?.ancho),
    distancia_paso:  toFloat(state.perfilT?.distancia),
    margen_lateral:   toFloat(state.perfilT?.margen),
    n_hileras:       state.perfilT?.hileras     ?? null,
    ancho1:         toFloat(state.perfilT?.ancho1),
    ancho2:         toFloat(state.perfilT?.ancho2),
    luz_interior:    toFloat(state.perfilT?.luz),

    // runer
    codigo_runer:     state.runer?.codigoRuner ?? null,
    n_perfiles_runer: state.runer?.cantidad    ?? null,
    margen_runer:     toFloat(state.runer?.margen),
    luz_runer:        toFloat(state.runer?.luz),
    ancho_runer:      toFloat(state.runer?.anchoRuner),

    // perforaciones
    agujeros_x_fila:      state.perforaciones?.agujerosPorFila ?? null,
    filas_x_agujero:      state.perforaciones?.filas           ?? null,
    diametro_perforacion: toFloat(state.perforaciones?.diametro),

    // ondas
    codigo_onda:       state.onda?.codigoOnda          ?? null,
    n_ondas:           state.onda?.cantidad            ?? null,
    continuidad_onda:  state.onda?.continua            ?? null,
    base_onda:         toFloat(state.onda?.base),
    altura_onda:       toFloat(state.onda?.altura),
    ancho_onda:        toFloat(state.onda?.anchoOnda),
    pisada_onda:       toFloat(state.onda?.pisada),
  }
}

export default ResumenView