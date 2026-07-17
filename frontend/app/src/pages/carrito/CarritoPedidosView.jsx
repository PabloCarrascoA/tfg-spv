import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiCalendar, FiEye, FiTrash2, FiBox } from 'react-icons/fi'
import {
  getLineasCarrito,
  borrarLineaCarrito,
  vaciarCarrito,
  getClienteCarrito,
  vaciarClienteCarrito,
  guardarPedido,
} from '../../services/api'

function CarritoPedidosView() {
  const navigate = useNavigate()

  const [lineas, setLineas] = useState([])
  const [cliente, setCliente] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [lineaExpandida, setLineaExpandida] = useState(null)

  useEffect(() => {
    cargarCarrito()
  }, [])

  function cargarCarrito() {
    setCargando(true)
    Promise.all([getLineasCarrito(), getClienteCarrito()])
      .then(([lineasData, clienteData]) => {
        setLineas(lineasData)
        setCliente(clienteData.cliente)
        setCargando(false)
      })
      .catch(err => {
        console.error('Error cargando el carrito:', err)
        setCargando(false)
      })
  }

  async function handleEliminarLinea(id) {
    if (!window.confirm(`¿Desea eliminar esta línea para el cliente ${cliente?.nombre}? Esta acción no se puede deshacer.`)) return
    try {
      await borrarLineaCarrito(id)
      setLineas(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error('Error eliminando línea:', err)
    }
  }

  function handleToggleDetalle(id) {
    setLineaExpandida(prev => (prev === id ? null : id))
  }

  async function handleCancelar() {
    if (!window.confirm(`¿Desea cancelar el carrito? Esta acción eliminará las lineas asociadas al pedido delcliente ${cliente?.nombre}. Esta acción no se puede deshacer.`)) return

    setProcesando(true)
    try {
      await vaciarCarrito()
      await vaciarClienteCarrito()
      navigate('/banda')
    } catch (err) {
      console.error('Error cancelando el carrito:', err)
      setProcesando(false)
    }
  }

  function handleContinuar() {
    setModalAbierto(true)
  }

  async function handleSeleccionModal(esPresupuesto) {
    setModalAbierto(false)
    setProcesando(true)

    const stateFrontend = {
        esPresupuesto,
    }

    try {
        await guardarPedido({}, stateFrontend)
        navigate('/pedidos')
    } catch (err) {
        console.error('Error confirmando el pedido:', err)
        setProcesando(false)
    }
    }

  if (cargando) return <div className="home-view"><p>Cargando carrito...</p></div>

  return (
    <div className="carrito-view">
      <div className="carrito-cabecera">
        <h2 className="content-title">Carrito de Pedidos</h2>
        <span className="carrito-cliente">
          {cliente?.nombre ?? '-NO HAY CLIENTE-'}
        </span>
      </div>

      <p className="content-subtitle">Líneas de pedidos en el carrito</p>

      {lineas.length === 0 ? (
        <p className="resumen-no-configurado">El carrito está vacío.</p>
      ) : (
        <div className="carrito-lineas">
          {lineas.map((linea, index) => (
            <div key={linea.id} className="carrito-linea-row">
              <div className="carrito-linea-card">
                <div className="carrito-linea-header">
                  <span className="carrito-linea-titulo"><FiBox size={12} /> Línea {index + 1}</span>
                  <span className="carrito-linea-precio">€ {linea.datos.price}</span>
                </div>
                <div className="carrito-linea-footer">
                  <span className="carrito-linea-fecha">
                    <FiCalendar size={12} /> {new Date(linea.fecha_creacion).toLocaleDateString('es-ES')}
                  </span>
                  <button
                    className="carrito-linea-detalle-btn"
                    onClick={() => handleToggleDetalle(linea.id)}
                  >
                    <FiEye size={12} /> Ver detalles
                  </button>
                </div>
                {lineaExpandida === linea.id && (
                  <pre className="carrito-linea-detalle">
                    {linea.datos.observation ?? 'Línea sin detalles adicionales.'}
                  </pre>
                )}
              </div>

              <button
                className="btn-eliminar-linea"
                onClick={() => handleEliminarLinea(linea.id)}
                disabled={procesando}
              >
                <FiTrash2 size={12} /> ELIMINAR LÍNEA
              </button>
            </div>
          ))}

          <div className="carrito-footer">
            <button className="btn-atras" onClick={handleCancelar} disabled={procesando}>
            Cancelar
            </button>
            <button
            className="btn-continuar"
            onClick={handleContinuar}
            disabled={procesando || lineas.length === 0}
            >
            Continuar
            </button>
        </div>

        </div>


      )}

      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-contenido" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">¿Cómo quieres guardar este pedido?</h3>
            <p className="modal-subtitulo">Elige si quieres generarlo como pedido o como presupuesto.</p>
            <div className="modal-botones">
              <button
                className="btn-atras"
                onClick={() => handleSeleccionModal(false)}
                disabled={procesando}
              >
                Pedido
              </button>
              <button
                className="btn-continuar"
                onClick={() => handleSeleccionModal(true)}
                disabled={procesando}
              >
                Presupuesto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarritoPedidosView