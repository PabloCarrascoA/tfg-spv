import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getBandas, getEmpalmesPorTipo } from '../../../services/api'

const TIPOS_EMPALME = [
  { value: 'banda-abierta',       label: 'Banda abierta'        },
  { value: 'banda-sin-fin',       label: 'Banda sin fin'        },
  { value: 'extremos-preparados', label: 'Extremos preparados'  },
  { value: 'grapas',              label: 'Grapas'               },
]

function BandaConfigView() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { actual, total } = infoPaso(state.seleccion, 'banda')

  // --- estado del formulario ---
  const [cantidad, setCantidad]         = useState(1)
  const [ancho, setAncho]               = useState('')
  const [longitud, setLongitud]         = useState('')
  const [codigoBanda, setCodigoBanda]   = useState('')
  const [tipoEmpalme, setTipoEmpalme]   = useState('')
  const [codigoEmpalme, setCodigoEmpalme] = useState('')
  const [comentarios, setComentarios]   = useState('')

  // --- datos de la API ---
  const [bandas, setBandas]             = useState([])
  const [empalmes, setEmpalmes]         = useState([])

  // --- cargar bandas al montar ---
  useEffect(() => {
    getBandas()
      .then(data => setBandas(data))
      .catch(err => console.error('Error cargando bandas:', err))
  }, [])

  // --- cargar empalmes cuando cambia el tipo ---
  useEffect(() => {
    if (!tipoEmpalme) return          // si no hay tipo seleccionado, no hace nada

    setCodigoEmpalme('')              // limpia el código al cambiar el tipo
    setEmpalmes([])

    if (tipoEmpalme === 'banda-abierta') {
      // banda abierta no consulta la API, precio fijo
      setEmpalmes([{ codigo: 'BA', label: 'Banda Abierta (precio fijo)' }])
      return
    }

    getEmpalmesPorTipo(tipoEmpalme)
      .then(data => setEmpalmes(data.map(e => ({
        codigo: e.codigo,
        label: `${e.codigo} - ${e.precio} €`
      }))))
      .catch(err => console.error('Error cargando empalmes:', err))

  }, [tipoEmpalme])   // ← se ejecuta cada vez que tipoEmpalme cambia

  function handleSiguiente() {
    const ruta = siguienteRuta(state.seleccion, 'banda')
    navigate(ruta, {
    state: {
            ...state,             
            banda: {               
                codigoBanda,
                cantidad,
                ancho,
                longitud,
                tipoEmpalme,
                codigoEmpalme,
                comentarios,
            }
            }
        })
  }

  function handleAtras() {
    navigate('/banda', { state })
  }

  return (
    <div className="config-view">
      <div className="config-row">
        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso {actual} de {total}</p>
          <p className="config-step-label">1. Banda cortada y empalme</p>

          <div className="config-form">

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código de banda</label>
                <select
                  className="form-select"
                  value={codigoBanda}
                  onChange={e => setCodigoBanda(e.target.value)}
                >
                  <option value="">- Seleccione una banda -</option>
                  {bandas.map(banda => (
                    <option key={banda.codigo} value={banda.codigo}>
                      {banda.codigo} - {banda.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cantidad de bandas</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                  <span className="counter-value">{cantidad}</span>
                  <button className="counter-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ancho (mm)</label>
                <input type="number" className="form-input" placeholder="0"
                  value={ancho} onChange={e => setAncho(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitud (mm)</label>
                <input type="number" className="form-input" placeholder="0"
                  value={longitud} onChange={e => setLongitud(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de empalme</label>
              <select
                className="form-select"
                value={tipoEmpalme}
                onChange={e => setTipoEmpalme(e.target.value)}
              >
                <option value="">- Seleccione un tipo -</option>
                {TIPOS_EMPALME.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Código de empalme</label>
              <select
                className="form-select"
                value={codigoEmpalme}
                onChange={e => setCodigoEmpalme(e.target.value)}
                disabled={!tipoEmpalme || empalmes.length === 0}
              >
                <option value="">- Seleccione un empalme -</option>
                {empalmes.map(empalme => (
                  <option key={empalme.codigo} value={empalme.codigo}>
                    {empalme.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Comentarios</label>
              <textarea className="form-textarea" placeholder="Comentarios" rows={3}
                value={comentarios} onChange={e => setComentarios(e.target.value)} />
            </div>

          </div>

          <div className="config-footer">
            <button className="btn-atras" onClick={handleAtras}>‹ Atrás</button>
            <button className="btn-continuar" onClick={handleSiguiente}>Siguiente ›</button>
          </div>
        </div>

        <div className="config-side-panel" />
      </div>
    </div>
  )
}

export default BandaConfigView