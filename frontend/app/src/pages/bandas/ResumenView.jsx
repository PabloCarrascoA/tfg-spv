import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { calcularPedido } from '../../services/api'
import { guardarPedido } from '../../services/api'

function ResumenView() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  const [guardando, setGuardando] = useState(false)

  async function handleConfirmar() {
  setGuardando(true)
  try {
      await guardarPedido(resultado, state)
      navigate('/pedidos')
  } catch (err) {
      console.error('Error guardando pedido:', err)
      setGuardando(false)
  }
  }

  useEffect(() => {
    const datos = construirPayload(state)
    console.log('DEBUG payload:', datos)
    calcularPedido(datos)
      .then(data => { setResultado(data); setCargando(false) })
      .catch(err  => { setError(err.message); setCargando(false) })
  }, [])

  if (cargando) return <div className="home-view"><p>Calculando...</p></div>
  if (error)    return <div className="home-view"><p>Error: {error}</p></div>

  const fecha = new Date().toLocaleDateString('es-ES')

  return (
    <div className="resumen-view">
      <h2 className="content-title">Resumen del pedido</h2>
      <p className="content-subtitle">Resultado de los presupuestos</p>

      <div className="resumen-card">

        {/* cabecera */}
        <div className="resumen-cabecera">
          <div className="resumen-cabecera-left">
            <span className="resumen-pedido-titulo">⚙ Pedido</span>
            <span className="resumen-fecha">📅 {fecha}</span>
            <span>Banda: {resultado.codigo_banda}</span>
            <span className="resumen-precio-total">Precio Total: <strong>{resultado.precio_total} €</strong></span>
          </div>
          <span className="resumen-cliente">{state.nombreCliente ?? '[Sin cliente]'}</span>
        </div>

        <hr className="resumen-divider" />

        <p className="resumen-secciones-label">Configuraciones:</p>

        {/* grid de secciones — 2 columnas */}
        <div className="resumen-secciones">

          {/* 1. Banda */}
          <div className="resumen-seccion">
            <p className="resumen-seccion-titulo">1. Banda cortada y empalme</p>
            {resultado.codigo_banda ? (
              <ul className="resumen-lista">
                <li>Banda: {resultado.codigo_banda}</li>
                <li>Cantidad: {resultado.cantidad_bandas}</li>
                <li>Largo: {resultado.largo_banda} mm</li>
                <li>Ancho: {resultado.ancho_banda} mm</li>
                <li>Empalme: {state.banda?.tipoEmpalme} — {state.banda?.subtipoEmpalme ?? 'Banda abierta'}</li>
                <li>Precio banda: {resultado.precio_banda} €</li>
                <li>Precio empalme: {resultado.precio_empalme} €</li>
                {state.banda?.comentarios && <li>Comentarios: {state.banda.comentarios}</li>}
              </ul>
            ) : <NoConfigurado />}
          </div>

          {console.log('DEBUG tipo_empalme:', resultado.tipo_empalme)}

          {/* 2. Perfiles Longitudinales */}
          <div className="resumen-seccion">
            <p className="resumen-seccion-titulo">2. Perfiles Longitudinales</p>
            {console.log(resultado.codigo_perfil_superior)}
            {resultado.codigo_perfil_superior || resultado.codigo_perfil_inferior ? (
              <ul className="resumen-lista">
                {resultado.codigo_perfil_superior && <>
                  <li>Perfil superior: {resultado.codigo_perfil_superior}</li>
                  <li>Nº perfiles sup.: {resultado.n_perfiles_superior}</li>
                  <li>Distancia borde-centro sup.: {resultado.distancia_margen_superior} mm</li>
                </>}
                {resultado.codigo_perfil_inferior && <>
                  <li>Perfil inferior: {resultado.codigo_perfil_inferior}</li>
                  <li>Nº perfiles inf.: {resultado.n_perfiles_inferior}</li>
                  <li>Distancia borde-centro inf.: {resultado.distancia_margen_inferior} mm</li>
                </>}
                <li>Precio perfiles: {resultado.precio_perfilL_final} €</li>
                {state.perfilL?.comentarios && <li>Comentarios: {state.perfilL.comentarios}</li>}
              </ul>
            ) : <NoConfigurado />}
          </div>

          {/* 3. Perfiles Transversales */}
          <div className="resumen-seccion">
            <p className="resumen-seccion-titulo">3. Perfiles Transversales</p>
            {resultado.codigo_perfilT ? (
              <ul className="resumen-lista">
                <li>Perfil: {resultado.codigo_perfilT}</li>
                <li>Nº perfiles: {resultado.n_perfilesT}</li>
                <li>Ancho del perfil: {resultado.ancho_perfilT} mm</li>
                <li>Distancia paso: {resultado.distancia_paso} mm</li>
                <li>Margen lateral: {resultado.margen_lateral} mm</li>
                <li>Nº hileras: {resultado.n_hileras}</li>
                {resultado.n_hileras > 1 && <>
                  <li>Ancho 1: {resultado.ancho1} mm</li>
                  <li>Ancho 2: {resultado.ancho2} mm</li>
                  <li>Luz interior: {resultado.luz_interior} mm</li>
                </>}
                <li>Precio perfiles: {resultado.precio_perfilT_final} €</li>
                {state.perfilT?.comentarios && <li>Comentarios: {state.perfilT.comentarios}</li>}
              </ul>
            ) : <NoConfigurado />}
          </div>

          {/* 4. Runer */}
          <div className="resumen-seccion">
            <p className="resumen-seccion-titulo">4. Runer</p>
            {resultado.codigo_runer ? (
              <ul className="resumen-lista">
                <li>Runer: {resultado.codigo_runer}</li>
                <li>Nº runers: {resultado.n_perfiles_runer}</li>
                <li>Luz: {resultado.luz_runer} mm</li>
                <li>Margen: {resultado.margen_runer} mm</li>
                <li>Precio runer: {resultado.precio_runer_final} €</li>
                {state.runer?.comentarios && <li>Comentarios: {state.runer.comentarios}</li>}
              </ul>
            ) : <NoConfigurado />}
          </div>

          {/* 5. Perforaciones */}
          <div className="resumen-seccion">
            <p className="resumen-seccion-titulo">5. Perforaciones</p>
            {resultado.agujeros_x_fila ? (
              <ul className="resumen-lista">
                <li>Agujeros por fila: {resultado.agujeros_x_fila}</li>
                <li>Filas: {resultado.filas_x_agujero}</li>
                <li>Diámetro: {resultado.diametro_perforacion} mm</li>
                <li>Paso entre filas: {resultado.paso_filas} mm</li>
                <li>Precio: {resultado.precio_perforaciones} €</li>
                {state.perforaciones?.comentarios && <li>Comentarios: {state.perforaciones.comentarios}</li>}
              </ul>
            ) : <NoConfigurado />}
          </div>

          {/* 6. Ondas */}
          <div className="resumen-seccion">
            <p className="resumen-seccion-titulo">6. Ondas</p>
            {resultado.codigo_onda ? (
              <ul className="resumen-lista">
                <li>Onda: {resultado.codigo_onda}</li>
                <li>Nº ondas: {resultado.n_ondas}</li>
                <li>Base: {resultado.base_onda} mm</li>
                <li>Altura: {resultado.altura_onda} mm</li>
                <li>Pisada: {resultado.pisada_onda} mm</li>
                <li>Continua: {resultado.continuidad_onda ? 'Sí' : 'No'}</li>
                <li>Precio: {resultado.precio_ondas_final} €</li>
                {state.onda?.comentarios && <li>Comentarios: {state.onda.comentarios}</li>}
              </ul>
            ) : <NoConfigurado />}
          </div>

        </div>
      </div>

      {/* footer -> el botón de confirmar está pendiente*/}
      <div className="config-footer">
        <button className="btn-atras" onClick={() => navigate(-1)}>‹ Atrás</button>
        <button className="btn-continuar" onClick={handleConfirmar} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Confirmar ›'}
        </button>
      </div>
    </div>
  )
}

function NoConfigurado() {
  return <p className="resumen-no-configurado">— No configurado —</p>
}

function construirPayload(state) {
  const toFloat = val => parseFloat(val) || null

  return {
    nombre_cliente:   state.nombreCliente ?? null,
    codigo_banda:     state.banda?.codigoBanda   ?? null,
    cantidad_bandas:  state.banda?.cantidad      ?? 1,
    largo_banda:      toFloat(state.banda?.longitud),
    ancho_banda:      toFloat(state.banda?.ancho),
    tipo_empalme:     state.banda?.tipoEmpalme   ?? null,
    subtipo_empalme:  state.banda?.subtipoEmpalme ?? null,
    codigo_perfil_superior:    state.perfilL?.superior?.activo ? state.perfilL.superior.codigo                        : null,
    n_perfiles_superior:       state.perfilL?.superior?.activo ? state.perfilL.superior.cantidad                      : null,
    distancia_margen_superior: state.perfilL?.superior?.activo ? toFloat(state.perfilL.superior.distanciaBordeCentro) : null,
    codigo_perfil_inferior:    state.perfilL?.inferior?.activo ? state.perfilL.inferior.codigo                        : null,
    n_perfiles_inferior:       state.perfilL?.inferior?.activo ? state.perfilL.inferior.cantidad                      : null,
    distancia_margen_inferior: state.perfilL?.inferior?.activo ? toFloat(state.perfilL.inferior.distanciaBordeCentro) : null,
    codigo_perfilT:   state.perfilT?.codigoPerfil ?? null,
    n_perfilesT:      state.perfilT?.cantidad     ?? null,
    ancho_perfilT:    toFloat(state.perfilT?.ancho),
    distancia_paso:   toFloat(state.perfilT?.distancia),
    margen_lateral:   toFloat(state.perfilT?.margen),
    n_hileras:        state.perfilT?.hileras      ?? null,
    ancho1:           toFloat(state.perfilT?.ancho1),
    ancho2:           toFloat(state.perfilT?.ancho2),
    luz_interior:     toFloat(state.perfilT?.luz),
    codigo_runer:     state.runer?.codigoRuner    ?? null,
    n_perfiles_runer: state.runer?.cantidad       ?? null,
    margen_runer:     toFloat(state.runer?.margen),
    luz_runer:        toFloat(state.runer?.luz),
    ancho_runer:      toFloat(state.runer?.anchoRuner),
    agujeros_x_fila:      state.perforaciones?.agujerosPorFila ?? null,
    filas_x_agujero:      state.perforaciones?.filas           ?? null,
    diametro_perforacion: toFloat(state.perforaciones?.diametro),
    codigo_onda:      state.onda?.codigoOnda   ?? null,
    n_ondas:          state.onda?.cantidad     ?? null,
    continuidad_onda: state.onda?.continua     ?? null,
    base_onda:        toFloat(state.onda?.base),
    altura_onda:      toFloat(state.onda?.altura),
    ancho_onda:       toFloat(state.onda?.anchoOnda),
    pisada_onda:      toFloat(state.onda?.pisada),
  }
}

export default ResumenView