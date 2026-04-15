import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getRuners } from '../../../services/api'

function RunerConfigView() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const { actual, total } = infoPaso(state.seleccion, 'runer')

  // --- datos de la API ---
  const [runers, setRuners] = useState([])

  // --- estado del formulario ---
  const [codigoRuner, setCodigoRuner]   = useState('')
  const [cantidad, setCantidad]         = useState(1)
  const [luz, setLuz]                   = useState('')
  const [margen, setMargen]             = useState('')
  const [comentarios, setComentarios]   = useState('')

  // --- cargar runers al montar ---
  useEffect(() => {
    getRuners()
      .then(data => setRuners(data))
      .catch(err => console.error('Error cargando runers:', err))
  }, [])

  function handleSiguiente() {
    const ruta = siguienteRuta(state.seleccion, 'runer')
    navigate(ruta, { state })
  }

  function handleAtras() {
    navigate('/banda/configurar/perfil-transversal', { state })
  }

  return (
    <div className="config-view">
      <div className="config-row">
        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso {actual} de {total}</p>
          <p className="config-step-label">{actual}. Runer</p>

          <div className="config-form">

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código de Runer</label>
                <select
                  className="form-select"
                  value={codigoRuner}
                  onChange={e => setCodigoRuner(e.target.value)}
                >
                  <option value="">- Seleccione un runer -</option>
                  {runers.map(runer => (
                    <option key={runer.codigo} value={runer.codigo}>
                      {runer.codigo} - {runer.tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Número de Runers</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                  <span className="counter-value">{cantidad}</span>
                  <button className="counter-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Luz (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={luz}
                  onChange={e => setLuz(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Margen lateral (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={margen}
                  onChange={e => setMargen(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Comentarios</label>
              <textarea
                className="form-textarea"
                placeholder="Comentarios"
                rows={3}
                value={comentarios}
                onChange={e => setComentarios(e.target.value)}
              />
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

export default RunerConfigView