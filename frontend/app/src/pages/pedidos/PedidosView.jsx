import { useState, useEffect } from 'react'
import { getPedidos, getDetallePedido, actualizarEstadoPedido, eliminarPedido } from '../../services/api'
import { FiShoppingCart, FiCalendar, FiEye } from 'react-icons/fi'
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md'

function PedidosView() {
  const [pedidos, setPedidos]           = useState([])
  const [cargando, setCargando]         = useState(true)
  const [modalPedido, setModalPedido]   = useState(null)  // detalle abierto en modal

  useEffect(() => {
    getPedidos()
      .then(data => { setPedidos(data); setCargando(false) })
      .catch(err  => { console.error(err); setCargando(false) })
  }, [])

  async function handleVerDetalles(id) {
    const detalle = await getDetallePedido(id)
    setModalPedido(detalle)
  }

  async function handleToggleEstado(pedido) {
    const nuevoEstado = pedido.estado === 'completado' ? 'en_proceso' : 'completado'
    await actualizarEstadoPedido(pedido.id, nuevoEstado)
    setPedidos(prev => prev.map(p =>
      p.id === pedido.id ? { ...p, estado: nuevoEstado } : p
    ))
  }

  async function handleEliminar(pedido) {
  if (!window.confirm(`¿Eliminar el pedido #${pedido.numero_pedido} para el clliente ${pedido.nombre_cliente}? Esta acción no se puede deshacer.`)) return
  await eliminarPedido(pedido.id)
  setPedidos(prev => prev.filter(p => p.id !== pedido.id))
}

  if (cargando) return <div className="home-view"><p>Cargando pedidos...</p></div>

  return (
    <div className="pedidos-view">
      <h2 className="content-title">Panel de revisión de pedidos</h2>
      <p className="content-subtitle">Registro de pedidos realizados</p>

      {pedidos.length === 0 && (
        <p style={{ fontSize: 13, color: '#6b7280' }}>No hay pedidos registrados todavía.</p>
      )}

      <div className="pedidos-lista">
        {pedidos.map(pedido => (
          <div key={pedido.id} className="pedido-row">

            {/* tarjeta */}
            <div className="pedido-card">
              <div className="pedido-card-header">
                <div className="pedido-card-titulo">
                  <FiShoppingCart size={14} />
                  <span>Pedido #{pedido.numero_pedido}</span>
                </div>
                <div className="pedido-card-precio">€ {pedido.precio_total.toFixed(2)}</div>
              </div>

              <div className="pedido-card-meta">
                <span className="pedido-fecha"><FiCalendar size={12} /> {pedido.fecha}</span>
                <button className="pedido-ver-btn" onClick={() => handleVerDetalles(pedido.id)}>
                  <FiEye size={12} /> Ver detalles
                </button>
              </div>

              <hr className="pedido-divider" />

              <p className="pedido-componentes-label">Componentes:</p>
              <ul className="pedido-componentes">
                {pedido.componentes.map(c => <li key={c}>{c}</li>)}
              </ul>
            </div>

            {/* botón estado */}
            <button
              className={`pedido-estado-btn ${pedido.estado === 'completado' ? 'completado' : 'en-proceso'}`}
              onClick={() => handleToggleEstado(pedido)}
            >
              {pedido.estado === 'completado'
                ? <><MdCheckBox size={18} /> COMPLETADO</>
                : <><MdCheckBoxOutlineBlank size={18} /> EN PROCESO</>
              }
            </button>

            <button
                className="pedido-borrar-btn"
                onClick={() => handleEliminar(pedido)}
                >
                ELIMINAR
            </button>

          </div>
        ))}
      </div>

      {/* modal detalle */}
      {modalPedido && (
        <ModalDetalle pedido={modalPedido} onClose={() => setModalPedido(null)} />
      )}
    </div>
  )
}

function ModalDetalle({ pedido, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="modal-titulo">⚙ Detalles del pedido #{pedido.numero_pedido}</h3>

        <div className="modal-fila">
          <span className="modal-label">Fecha</span>
          <span><FiCalendar size={12} /> {pedido.fecha}</span>
        </div>
        <hr className="pedido-divider" />
        <div className="modal-fila">
          <span className="modal-label">Precio Total</span>
          <span className="modal-precio">€ {pedido.precio_total?.toFixed(2)}</span>
        </div>
        <hr className="pedido-divider" />
        <div className="modal-fila">
          <span className="modal-label">Cliente</span>
          <span>{pedido.nombre_cliente ?? '—'}</span>
        </div>
        <hr className="pedido-divider" />

        <p className="pedido-componentes-label" style={{ marginTop: 16 }}>Componentes:</p>

        {pedido.banda && (
          <div className="modal-seccion">
            <p className="modal-seccion-titulo">Bandas</p>
            <p>Ancho: {pedido.banda.ancho} mm</p>
            <p>Largo: {pedido.banda.largo} mm</p>
            <p>Empalme: {pedido.banda.tipo_empalme}{pedido.banda.subtipo_empalme ? ` — ${pedido.banda.subtipo_empalme}` : ''}</p>
            {pedido.banda.comentarios && <p>Comentarios: {pedido.banda.comentarios}</p>}
          </div>
        )}

        {pedido.perfil_longitudinal && (
          <div className="modal-seccion">
            <p className="modal-seccion-titulo">Perfiles longitudinales</p>
            {pedido.perfil_longitudinal.codigo_perfil_superior && <p>Perfil superior: {pedido.perfil_longitudinal.codigo_perfil_superior} ({pedido.perfil_longitudinal.n_perfiles_superior} uds)</p>}
            {pedido.perfil_longitudinal.distancia_margen_sup != null && <p>Distancia borde-centro superior: {pedido.perfil_longitudinal.distancia_margen_sup} mm</p>}
            
            {pedido.perfil_longitudinal.codigo_perfil_inferior && <p>Perfil inferior: {pedido.perfil_longitudinal.codigo_perfil_inferior} ({pedido.perfil_longitudinal.n_perfiles_inferior} uds)</p>}
            {pedido.perfil_longitudinal.distancia_margen_inf != null && <p>Distancia borde-centro inferior: {pedido.perfil_longitudinal.distancia_margen_inf} mm</p>}
            
            {pedido.perfil_longitudinal.comentarios && <p>Comentarios: {pedido.perfil_longitudinal.comentarios}</p>}
          </div>
        )}

        {pedido.perfil_transversal && (
          <div className="modal-seccion">
            <p className="modal-seccion-titulo">Perfiles transversales</p>
            <p>Perfil: {pedido.perfil_transversal.codigo_perfil}</p>
            <p>Nº perfiles: {pedido.perfil_transversal.n_perfiles}</p>
            <p>Ancho perfil: {pedido.perfil_transversal.ancho_perfil} mm</p>
            {pedido.perfil_transversal.n_hileras > 1 && <>
              <p>Hileras: {pedido.perfil_transversal.n_hileras}</p>
              <p>Luz interior: {pedido.perfil_transversal.luz_interior} mm</p>
            </>}
            {pedido.perfil_transversal.comentarios && <p>Comentarios: {pedido.perfil_transversal.comentarios}</p>}
          </div>
        )}

        {pedido.runer && (
          <div className="modal-seccion">
            <p className="modal-seccion-titulo">Runer</p>
            <p>Código: {pedido.runer.codigo_runer}</p>
            <p>Cantidad: {pedido.runer.n_runers}</p>
            <p>Luz: {pedido.runer.luz} mm · Margen: {pedido.runer.margen} mm</p>
            {pedido.runer.comentarios && <p>Comentarios: {pedido.runer.comentarios}</p>}
          </div>
        )}

        {pedido.perforaciones && (
          <div className="modal-seccion">
            <p className="modal-seccion-titulo">Perforaciones</p>
            <p>Agujeros por fila: {pedido.perforaciones.agujeros_x_fila}</p>
            <p>Filas: {pedido.perforaciones.filas_x_agujero}</p>
            <p>Diámetro: {pedido.perforaciones.diametro} mm</p>
          </div>
        )}

        {pedido.onda && (
          <div className="modal-seccion">
            <p className="modal-seccion-titulo">Ondas</p>
            <p>Código: {pedido.onda.codigo_onda}</p>
            <p>Base: {pedido.onda.base} mm · Altura: {pedido.onda.altura} mm</p>
            <p>Continua: {pedido.onda.continua ? 'Sí' : 'No'}</p>
            {pedido.onda.comentarios && <p>Comentarios: {pedido.onda.comentarios}</p>}
          </div>
        )}

        <button className="btn-continuar" style={{ marginTop: 20, width: '100%' }} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default PedidosView
